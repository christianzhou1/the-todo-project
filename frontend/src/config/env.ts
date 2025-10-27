export interface EnvConfig {
  apiBaseUrl: string;
  environment: "development" | "production" | "test";
}

const getEnvConfig = (): EnvConfig => {
  const viteApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // In production, use HTTPS API endpoint
  const isProduction = import.meta.env.MODE === "production";
  const defaultApiUrl = isProduction
    ? "https://todo.christianzhou.com/api"
    : "http://localhost:8080/api";

  return {
    apiBaseUrl: viteApiBaseUrl || defaultApiUrl,
    environment:
      (import.meta.env.MODE as EnvConfig["environment"]) || "development",
  };
};

export const envConfig = getEnvConfig();
