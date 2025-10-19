import { createContext } from "react";
import type { ConfigOptions } from "./default";
import { DEFAULT_CONFIG } from "./default";
import type { PublicInfo } from "@/types/node.d";
import { defaultTexts } from "./locales";

export interface ConfigContextType extends ConfigOptions {
  publicSettings: PublicInfo | null;
  siteStatus: "public" | "private-unauthenticated" | "private-authenticated";
  texts: typeof defaultTexts;
}

// 创建配置上下文
export const ConfigContext = createContext<ConfigContextType>({
  ...DEFAULT_CONFIG,
  publicSettings: null,
  siteStatus: "public",
  texts: defaultTexts,
});
