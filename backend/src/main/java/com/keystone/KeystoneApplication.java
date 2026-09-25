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
        configureDatabaseUrl();
        SpringApplication.run(KeystoneApplication.class, args);
    }

    private static void configureDatabaseUrl() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            databaseUrl = System.getProperty("DATABASE_URL");
        }
        if (databaseUrl != null && !databaseUrl.trim().isEmpty()) {
            try {
                if (databaseUrl.startsWith("jdbc:")) {
                    System.setProperty("spring.datasource.url", databaseUrl);
                } else if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                    String cleanUrl = databaseUrl.replace("postgresql://", "http://").replace("postgres://", "http://");
                    java.net.URI uri = new java.net.URI(cleanUrl);
                    String userInfo = uri.getUserInfo();
                    String host = uri.getHost();
                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath();

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.setProperty("spring.datasource.driverClassName", "org.postgresql.Driver");
                    System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
                    System.setProperty("spring.jpa.hibernate.ddl-auto", "update");

                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        System.setProperty("spring.datasource.username", parts[0]);
                        System.setProperty("spring.datasource.password", parts[1]);
                    }
                    System.out.println(">>> Configured Cloud PostgreSQL from DATABASE_URL (" + host + ":" + port + path + ")");
                }
            } catch (Exception e) {
                System.err.println("Notice: Could not parse DATABASE_URL: " + e.getMessage());
            }
        }
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
