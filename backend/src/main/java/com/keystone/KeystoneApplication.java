package com.keystone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class KeystoneApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(KeystoneApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] candidatePaths = {
            Paths.get(".env"),
            Paths.get("..", ".env"),
            Paths.get("backend", ".env")
        };

        for (Path path : candidatePaths) {
            if (Files.exists(path) && !Files.isDirectory(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();

                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            if (value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                        }

                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    System.out.println(">>> Loaded environment variables from: " + path.toAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("Notice: Could not load .env file from " + path + ": " + e.getMessage());
                }
            }
        }
    }
}
