-- Skema database autentikasi PERI (MySQL / MariaDB).
-- Dibuat otomatis oleh app.py saat pertama dijalankan. File ini hanya perlu
-- diimpor manual (HeidiSQL / phpMyAdmin) bila ingin membuatnya sendiri.

CREATE DATABASE IF NOT EXISTS peri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE peri;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('pendaftar','admin') NOT NULL DEFAULT 'pendaftar',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login    DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kode_verifikasi (
  email        VARCHAR(190) NOT NULL PRIMARY KEY,
  kode_hash    CHAR(64) NOT NULL,
  kadaluarsa   DATETIME NOT NULL,
  percobaan    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  dikirim_pada DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS buku_tamu (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  pesan      TEXT NOT NULL,
  kategori   VARCHAR(20) NULL,
  skor       FLOAT NULL,
  dibaca     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pendaftaran_program (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  program    VARCHAR(150) NOT NULL,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  wa         VARCHAR(20) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'baru',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_program (user_id, program),
  CONSTRAINT fk_daftar_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;