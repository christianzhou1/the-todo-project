package com.todo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class EnvironmentLogger implements CommandLineRunner {

    private final Environment environment;
    
    @Value("${jwt.secret:NOT_SET}")
    private String jwtSecret;
    
    @Value("${spring.datasource.url:NOT_SET}")
    private String databaseUrl;
    
    @Value("${spring.datasource.username:NOT_SET}")
    private String databaseUsername;

    public EnvironmentLogger(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("ENVIRONMENT CONFIGURATION");
        System.out.println("=".repeat(60));
        
        // Show active profiles
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles.length == 0) {
            System.out.println("Active Profile: DEFAULT (no profile specified)");
        } else {
            System.out.println("Active Profiles: " + String.join(", ", activeProfiles));
        }
        
        // Show environment-specific values
        System.out.println("\nConfiguration Values:");
        System.out.println("Database URL: " + maskSensitiveInfo(databaseUrl));
        System.out.println("Database Username: " + databaseUsername);
        System.out.println("JWT Secret: " + (jwtSecret.equals("NOT_SET") ? "NOT_SET" : "[HIDDEN - " + jwtSecret.length() + " chars]"));
        System.out.println("Server Port: " + environment.getProperty("server.port", "8080"));
        System.out.println("Storage Type: " + environment.getProperty("app.storage.type", "NOT_SET"));
        
        // Show which .env file is being used
        String envFile = detectEnvironmentFile();
        System.out.println("Environment File: " + envFile);
        
        System.out.println("=".repeat(60) + "\n");
    }
    
    private String detectEnvironmentFile() {
        // Check for common .env files in order of priority
        String[] envFiles = {".env.production", ".env.local", ".env.development", ".env"};
        
        // Check current working directory first
        for (String envFile : envFiles) {
            File file = new File(envFile);
            if (file.exists() && file.isFile()) {
                return envFile + " (found)";
            }
        }
        
        // Check if we're in Docker and look in common locations
        String userDir = System.getProperty("user.dir");
        if (userDir != null) {
            for (String envFile : envFiles) {
                File file = new File(userDir, envFile);
                if (file.exists() && file.isFile()) {
                    return envFile + " (found in " + userDir + ")";
                }
            }
        }
        
        // Check if spring-dotenv is enabled and what file it's using
        String dotenvEnabled = environment.getProperty("spring.dotenv.enabled", "false");
        if ("true".equals(dotenvEnabled)) {
            String dotenvFilename = environment.getProperty("spring.dotenv.filename", ".env");
            return dotenvFilename + " (spring-dotenv)";
        }
        
        // Check if we're using Docker Compose environment variables
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl != null && databaseUrl.contains("todo-db:5432")) {
            return "Docker Compose environment variables";
        }
        
        return "none (using system environment variables)";
    }
    
    private String maskSensitiveInfo(String value) {
        if (value == null || value.equals("NOT_SET")) {
            return value;
        }
        
        // Mask password in database URL
        if (value.contains("password=")) {
            return value.replaceAll("password=[^&]*", "password=***");
        }
        
        return value;
    }
}
