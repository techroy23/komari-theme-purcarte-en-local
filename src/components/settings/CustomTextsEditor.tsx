import { useState, useEffect } from "react";
import { defaultTexts } from "@/config/locales";
import {
  flattenObject,
  parseCustomTexts,
  serializeCustomTexts,
} from "@/utils/localeUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomTextsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPageChange?: (page: string) => void;
}

const CustomTextsEditor = ({
  value,
  onChange,
  onPageChange,
}: CustomTextsEditorProps) => {
  const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState("main");
  const flatDefaultTexts = flattenObject(defaultTexts);
  const topLevelKeys = Object.keys(defaultTexts);

  useEffect(() => {
    setEditingTexts(parseCustomTexts(value));
  }, [value]);

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const handleTextChange = (key: string, newValue: string) => {
    const newEditingTexts = { ...editingTexts };
    if (newValue === flatDefaultTexts[key]) {
      delete newEditingTexts[key];
    } else {
      newEditingTexts[key] = newValue;
    }
    setEditingTexts(newEditingTexts);
    onChange(serializeCustomTexts(newEditingTexts));
  };

  return (
    <div>
      {currentPage === "main" ? (
        topLevelKeys.map((key) => (
          <Button
            key={key}
            onClick={() => setCurrentPage(key)}
            className="w-full justify-start mb-2">
            {key}
          </Button>
        ))
      ) : (
        <>
          <Button onClick={() => setCurrentPage("main")} className="mb-4">
            返回
          </Button>
          {Object.keys(flatDefaultTexts)
            .filter((key) => key.startsWith(currentPage))
            .map((key) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key}
                </label>
                <Input
                  type="text"
                  value={editingTexts[key] ?? flatDefaultTexts[key]}
                  onChange={(e) => handleTextChange(key, e.target.value)}
                  className={editingTexts[key] ? "border-yellow-500" : ""}
                />
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default CustomTextsEditor;
