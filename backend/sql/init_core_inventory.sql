-- CoreInventory demo schema for XAMPP / MySQL
-- Run in phpMyAdmin or with the mysql CLI

CREATE DATABASE IF NOT EXISTS `coreinventory` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `coreinventory`;

-- Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_categories_name` (`name`)
) ENGINE=InnoDB;

-- Warehouses / Locations
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_warehouses_name` (`name`)
) ENGINE=InnoDB;

-- Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category_id` INT UNSIGNED NULL,
  `warehouse_id` INT UNSIGNED NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_products_sku` (`sku`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_products_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Stock movements (history)
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `warehouse_id` INT UNSIGNED NOT NULL,
  `change_qty` INT NOT NULL,
  `type` ENUM('IN','OUT','ADJUST') NOT NULL,
  `note` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sm_product` (`product_id`),
  KEY `idx_sm_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_sm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sm_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Users / Authentication
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `hashed_password` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`),
  CHECK (`first_name` REGEXP '^[A-Za-z ]+$'),
  CHECK (`last_name` REGEXP '^[A-Za-z ]+$')
) ENGINE=InnoDB;

-- Sample seed data
INSERT INTO `categories` (`name`, `description`) VALUES
  ('Electronics', 'Devices, gadgets, and components'),
  ('Office Supplies', 'Paper, writing instruments, and desk accessories');

INSERT INTO `warehouses` (`name`, `location`) VALUES
  ('Main Warehouse', 'Building A'),
  ('Secondary Warehouse', 'Building B');

INSERT INTO `products` (`sku`, `name`, `category_id`, `warehouse_id`, `quantity`, `unit_price`) VALUES
  ('ELEC-001', 'USB-C Cable', 1, 1, 120, 3.50),
  ('OFF-001', 'A4 Notebook', 2, 2, 200, 1.25);

INSERT INTO `stock_movements` (`product_id`, `warehouse_id`, `change_qty`, `type`, `note`) VALUES
  (1, 1, 120, 'IN', 'Initial stock'),
  (2, 2, 200, 'IN', 'Initial stock');
