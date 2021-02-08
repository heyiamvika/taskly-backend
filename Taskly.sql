ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

DROP DATABASE IF EXISTS Taskly;
-- utf8mb4 for storing emojis
CREATE DATABASE Taskly CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE Taskly;

CREATE TABLE events (
	id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL, 
    description VARCHAR(255),
    time_start DATETIME NOT NULL,
    time_end DATETIME NOT NULL,
    emoji VARCHAR(50) CHARSET utf8mb4 NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT 0
);

