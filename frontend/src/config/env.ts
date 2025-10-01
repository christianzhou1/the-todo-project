export interface EnvConfig {
  apiBaseUrl: string;
  environment: "development" | "production" | "test";
}

const getEnvConfig = (): EnvConfig => {
  const viteApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return {
    apiBaseUrl: viteApiBaseUrl || "http://localhost:8080/api",
    environment:
      (import.meta.env.MODE as EnvConfig["environment"]) || "development",
  };
};

export const envConfig = getEnvConfig();
