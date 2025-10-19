import { useEffect, useState } from "react";
import { useAppConfig } from "@/config/hooks";
import type { ConfigOptions } from "@/config/default";
import { DEFAULT_CONFIG } from "@/config/default";
import { apiService } from "@/services/api";
import SettingItem from "./SettingItem";
import CustomTextsEditor from "./CustomTextsEditor";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const config = useAppConfig();
  const { publicSettings, updatePreviewConfig } = config;
  const [settingsConfig, setSettingsConfig] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<Partial<ConfigOptions>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState("main");
  const [customTextsPage, setCustomTextsPage] = useState("main");
  const [isPreviewing, setIsPreviewing] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSettingsConfig = async () => {
      if (publicSettings?.theme) {
        try {
          const response = await fetch(
            `/themes/${publicSettings.theme}/komari-theme.json`
          );
          const data = await response.json();
          setSettingsConfig(data.configuration.data);
        } catch (error) {
          console.error("Failed to fetch theme settings config:", error);
        }
      }
    };

    fetchSettingsConfig();
  }, [publicSettings?.theme]);

  useEffect(() => {
    setEditingConfig(publicSettings?.theme_settings || {});
  }, [publicSettings?.theme_settings]);

  useEffect(() => {
    updatePreviewConfig(editingConfig);
  }, [editingConfig, updatePreviewConfig]);

  const handleConfigChange = (key: keyof ConfigOptions, value: any) => {
    const newConfig = { ...editingConfig, [key]: value };
    setEditingConfig(newConfig);
    if (isPreviewing) {
      updatePreviewConfig(newConfig);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.saveThemeSettings(
        publicSettings?.theme || "",
        editingConfig
      );
      alert("配置已保存！");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Failed to save theme settings:", error);
      alert("保存配置失败！");
    }
  };

  const handleReset = () => {
    if (window.confirm("确定要重置所有配置吗？")) {
      setEditingConfig(DEFAULT_CONFIG);
    }
  };

  const handlePreviewToggle = () => {
    if (isPreviewing) {
      updatePreviewConfig({});
      setIsPreviewing(false);
    } else {
      updatePreviewConfig(editingConfig);
      setIsPreviewing(true);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(publicSettings?.theme_settings || {}));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "komari-theme-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          const sanitizedConfig: Partial<ConfigOptions> = {};
          for (const key in DEFAULT_CONFIG) {
            if (Object.prototype.hasOwnProperty.call(importedConfig, key)) {
              (sanitizedConfig as any)[key] = (importedConfig as any)[key];
            }
          }
          setEditingConfig(sanitizedConfig);
          if (window.confirm("导入成功，是否立即保存？")) {
            handleSave();
          }
        } catch (error) {
          console.error("Failed to import config:", error);
          alert("导入配置失败！");
        }
      };
      reader.readAsText(file);
    }
  };

  const panelClasses = isMobile
    ? "fixed bottom-0 left-0 w-full h-3/4 bg-gray-100/90 dark:bg-gray-900/90 theme-card-style shadow-lg z-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
    : "h-screen w-80 bg-gray-100/90 dark:bg-gray-900/90 heme-card-style shadow-lg p-4 overflow-y-auto flex-shrink-0";

  if (!isOpen) return null;

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">编辑配置</h2>
        <Button
          onClick={() => {
            if (isPreviewing) {
              updatePreviewConfig({});
            }
            onClose();
          }}
          variant="ghost">
          关闭
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button asChild>
          <label htmlFor="import-config">
            导入
            <input
              id="import-config"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </Button>
        <Button onClick={handleExport}>导出</Button>
        <Button onClick={handlePreviewToggle}>
          {isPreviewing ? "关闭预览" : "开启预览"}
        </Button>
        <Button onClick={handleReset} variant="destructive">
          重置
        </Button>
        <Button onClick={handleSave} className="bg-green-500">
          保存
        </Button>
      </div>
      <div className="space-y-4">
        {currentPage === "main" ? (
          settingsConfig
            .filter((item) => item.type === "title")
            .map((item) => (
              <Button
                key={item.name}
                onClick={() => setCurrentPage(item.name)}
                className="w-full justify-start">
                {item.name}
              </Button>
            ))
        ) : (
          <>
            {currentPage === "UI 自定义" &&
            customTextsPage !== "main" ? null : (
              <Button onClick={() => setCurrentPage("main")} className="mb-4">
                返回
              </Button>
            )}
            {settingsConfig
              .slice(
                settingsConfig.findIndex((item) => item.name === currentPage) +
                  1,
                settingsConfig.findIndex(
                  (item, index) =>
                    index >
                      settingsConfig.findIndex(
                        (item) => item.name === currentPage
                      ) && item.type === "title"
                ) === -1
                  ? settingsConfig.length
                  : settingsConfig.findIndex(
                      (item, index) =>
                        index >
                          settingsConfig.findIndex(
                            (item) => item.name === currentPage
                          ) && item.type === "title"
                    )
              )
              .map((item) =>
                item.key === "customTexts" ? (
                  <CustomTextsEditor
                    key={item.key}
                    value={editingConfig.customTexts || ""}
                    onChange={(value) =>
                      handleConfigChange("customTexts", value)
                    }
                    onPageChange={setCustomTextsPage}
                  />
                ) : (
                  <SettingItem
                    key={item.key || item.name}
                    item={item}
                    editingConfig={editingConfig}
                    onConfigChange={handleConfigChange}
                  />
                )
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
