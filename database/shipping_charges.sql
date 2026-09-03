-- ========================================================
-- Olive Seeds Studio: Shipping Charges Management System
-- Database Schema for New Tables (Step 2, Step 7, Step 9)
-- ========================================================

-- TABLE 1: shipping_zones
CREATE TABLE IF NOT EXISTS `shipping_zones` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `zone_name` VARCHAR(100) NOT NULL,
  `zone_description` TEXT,
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default zones
INSERT INTO `shipping_zones` (`zone_name`, `zone_description`) VALUES
  ('Domestic - India', 'Shipments within India'),
  ('South Asia', 'India, Malaysia, Singapore'),
  ('Middle East', 'UAE, Kuwait, Qatar, Saudi Arabia'),
  ('Europe', 'UK, France, Germany, Netherlands, Norway, Switzerland'),
  ('North America', 'USA, Canada'),
  ('Oceania', 'Australia, New Zealand'),
  ('Rest of World', 'All other enabled countries')
ON DUPLICATE KEY UPDATE `zone_name`=`zone_name`;

-- TABLE 2: shipping_zone_countries
CREATE TABLE IF NOT EXISTS `shipping_zone_countries` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `zone_id` INT NOT NULL,
  `country_code` VARCHAR(2) NOT NULL,
  `country_name` VARCHAR(100) NOT NULL,
  UNIQUE KEY `unique_zone_country` (`zone_id`, `country_code`),
  INDEX `idx_country_code` (`country_code`),
  FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 3: shipping_methods
CREATE TABLE IF NOT EXISTS `shipping_methods` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `method_name` VARCHAR(100) NOT NULL,
  `method_code` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT,
  `estimated_days_min` INT DEFAULT 1,
  `estimated_days_max` INT DEFAULT 7,
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default methods
INSERT INTO `shipping_methods` (`method_name`, `method_code`, `description`, `estimated_days_min`, `estimated_days_max`) VALUES
  ('Standard Shipping', 'standard', 'Regular delivery service', 7, 14),
  ('Express Shipping', 'express', 'Faster priority delivery', 3, 7),
  ('Economy Shipping', 'economy', 'Budget-friendly slower delivery', 14, 21)
ON DUPLICATE KEY UPDATE `method_code`=`method_code`;

-- TABLE 4: shipping_rates
CREATE TABLE IF NOT EXISTS `shipping_rates` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `zone_id` INT NOT NULL,
  `method_id` INT NOT NULL,
  `base_rate` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `first_weight_grams` INT DEFAULT 500,
  `first_weight_rate` DECIMAL(10,2) DEFAULT 0,
  `additional_weight_grams` INT DEFAULT 500,
  `additional_weight_rate` DECIMAL(10,2) DEFAULT 0,
  `free_shipping_above` DECIMAL(10,2) DEFAULT NULL,
  `minimum_order_value` DECIMAL(10,2) DEFAULT 0,
  `rate_currency` VARCHAR(3) DEFAULT 'INR',
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_zone_method` (`zone_id`, `method_id`),
  FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`method_id`) REFERENCES `shipping_methods`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 5: shipping_country_overrides
CREATE TABLE IF NOT EXISTS `shipping_country_overrides` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `country_code` VARCHAR(2) NOT NULL UNIQUE,
  `country_name` VARCHAR(100) NOT NULL,
  `method_id` INT NOT NULL,
  `base_rate` DECIMAL(10,2) NOT NULL,
  `first_weight_grams` INT DEFAULT 500,
  `first_weight_rate` DECIMAL(10,2) DEFAULT 0,
  `additional_weight_grams` INT DEFAULT 500,
  `additional_weight_rate` DECIMAL(10,2) DEFAULT 0,
  `free_shipping_above` DECIMAL(10,2) DEFAULT NULL,
  `rate_currency` VARCHAR(3) DEFAULT 'INR',
  `is_active` BOOLEAN DEFAULT true,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`method_id`) REFERENCES `shipping_methods`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 6: product_shipping_weight
CREATE TABLE IF NOT EXISTS `product_shipping_weight` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL UNIQUE,
  `weight_grams` INT NOT NULL DEFAULT 500,
  `length_cm` DECIMAL(8,2) DEFAULT NULL,
  `width_cm` DECIMAL(8,2) DEFAULT NULL,
  `height_cm` DECIMAL(8,2) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE 7: shipping_rate_history (Step 7)
CREATE TABLE IF NOT EXISTS `shipping_rate_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rate_id` INT,
  `zone_id` INT,
  `method_id` INT,
  `old_base_rate` DECIMAL(10,2),
  `new_base_rate` DECIMAL(10,2),
  `changed_by` VARCHAR(255),
  `change_note` TEXT,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 9: physical_orders update (check and add if missing)
-- Note: MariaDB / MySQL 8.0.29+ supports ADD COLUMN IF NOT EXISTS:
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_method_id INT DEFAULT NULL;
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_method_name VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_cost_currency VARCHAR(3) DEFAULT 'INR';
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_weight_grams INT DEFAULT NULL;
-- ALTER TABLE physical_orders ADD COLUMN IF NOT EXISTS shipping_zone VARCHAR(100) DEFAULT NULL;
