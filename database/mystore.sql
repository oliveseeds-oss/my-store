-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2026 at 01:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mystore`
--

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE `ads` (
  `id` int(11) NOT NULL,
  `title` varchar(300) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `placement` varchar(100) DEFAULT 'Homepage banner',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `content` longtext DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Admin',
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `content`, `category`, `author`, `image_url`, `created_at`) VALUES
(1, 'How we engrave your design with precision', 'Every engraving starts with your idea. We use CO2 lasers calibrated to 0.01mm precision...', 'Behind the scenes', 'Admin', NULL, '2026-05-19 06:43:18'),
(2, 'Top 5 gift ideas for corporate clients', 'Personalised gifts leave a lasting impression. Here are our top picks...', 'Gift ideas', 'Admin', NULL, '2026-05-19 06:43:18');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('physical','digital','both') DEFAULT 'physical',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(511) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `description`, `created_at`, `image_url`) VALUES
(1, 'Nameboard', 'physical', 'Custom name and house number boards', '2026-05-19 06:06:26', NULL),
(2, 'Keychains', 'physical', 'Personalised laser-engraved keychains', '2026-05-19 06:06:26', NULL),
(3, 'Mugs & Drinkware', 'physical', 'Engraved mugs, tumblers and bottles', '2026-05-19 06:06:26', NULL),
(4, 'Photo Frames', 'physical', 'Custom engraved photo frames', '2026-05-19 06:06:26', NULL),
(5, 'Corporate Gifts', 'physical', 'Bulk corporate gifting items', '2026-05-19 06:06:26', NULL),
(6, 'Logo Kits', 'digital', 'Complete brand logo design packages', '2026-05-19 06:06:26', NULL),
(7, 'Templates', 'digital', 'Ready-to-use editable design templates', '2026-05-19 06:06:26', NULL),
(8, 'Social Media Packs', 'digital', 'Instagram, Facebook content packs', '2026-05-19 06:06:26', NULL),
(9, 'Nameboard', 'physical', 'Custom name and house number boards', '2026-05-19 06:25:43', NULL),
(10, 'Keychains', 'physical', 'Personalised laser-engraved keychains', '2026-05-19 06:25:43', NULL),
(11, 'Mugs & Drinkware', 'physical', 'Engraved mugs, tumblers and bottles', '2026-05-19 06:25:43', NULL),
(12, 'Photo Frames', 'physical', 'Custom engraved photo frames', '2026-05-19 06:25:43', NULL),
(14, 'Logo Kits', 'digital', 'Complete brand logo design packages', '2026-05-19 06:25:43', NULL),
(15, 'Templates', 'digital', 'Ready-to-use editable design templates', '2026-05-19 06:25:43', NULL),
(16, 'Social Media Packs', 'digital', 'Instagram, Facebook content packs', '2026-05-19 06:25:43', NULL),
(17, 'Nameboard', 'physical', 'Custom name and house number boards', '2026-05-19 06:26:45', NULL),
(18, 'Keychains', 'physical', 'Personalised laser-engraved keychains', '2026-05-19 06:26:45', NULL),
(19, 'Mugs & Drinkware', 'physical', 'Engraved mugs, tumblers and bottles', '2026-05-19 06:26:45', NULL),
(20, 'Photo Frames', 'physical', 'Custom engraved photo frames', '2026-05-19 06:26:45', NULL),
(22, 'Logo Kits', 'digital', 'Complete brand logo design packages', '2026-05-19 06:26:45', NULL),
(23, 'Templates', 'digital', 'Ready-to-use editable design templates', '2026-05-19 06:26:45', NULL),
(24, 'Social Media Packs', 'digital', 'Instagram, Facebook content packs', '2026-05-19 06:26:45', NULL),
(25, 'Nameboard', 'physical', 'Custom name and house number boards', '2026-05-19 06:34:17', NULL),
(26, 'Keychains', 'physical', 'Personalised laser-engraved keychains', '2026-05-19 06:34:17', NULL),
(27, 'Mugs & Drinkware', 'physical', 'Engraved mugs, tumblers and bottles', '2026-05-19 06:34:17', NULL),
(28, 'Photo Frames', 'physical', 'Custom engraved photo frames', '2026-05-19 06:34:17', NULL),
(30, 'Logo Kits', 'digital', 'Complete brand logo design packages', '2026-05-19 06:34:17', NULL),
(31, 'Templates', 'digital', 'Ready-to-use editable design templates', '2026-05-19 06:34:17', NULL),
(32, 'Social Media Packs', 'digital', 'Instagram, Facebook content packs', '2026-05-19 06:34:17', NULL),
(33, 'Nameboard', 'physical', 'Custom name and house number boards', '2026-05-19 06:43:18', NULL),
(34, 'Keychains', 'physical', 'Personalised laser-engraved keychains', '2026-05-19 06:43:18', NULL),
(35, 'Mugs & Drinkware', 'physical', 'Engraved mugs, tumblers and bottles', '2026-05-19 06:43:18', NULL),
(36, 'Photo Frames', 'physical', 'Custom engraved photo frames', '2026-05-19 06:43:18', NULL),
(38, 'Logo Kits', 'digital', 'Complete brand logo design packages', '2026-05-19 06:43:18', NULL),
(39, 'Templates', 'digital', 'Ready-to-use editable design templates', '2026-05-19 06:43:18', NULL),
(40, 'Social Media Packs', 'digital', 'Instagram, Facebook content packs', '2026-05-19 06:43:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currency_rates`
--

CREATE TABLE `currency_rates` (
  `id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `currency_code` varchar(10) NOT NULL,
  `currency_symbol` varchar(10) NOT NULL,
  `flag_emoji` varchar(10) DEFAULT NULL,
  `rate_to_inr` decimal(12,4) NOT NULL DEFAULT 1.0000,
  `shipping_allowed` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `currency_rates`
--

INSERT INTO `currency_rates` (`id`, `country_name`, `country_code`, `currency_code`, `currency_symbol`, `flag_emoji`, `rate_to_inr`, `shipping_allowed`, `updated_at`) VALUES
(1, 'India', 'IN', 'INR', '₹', '🇮🇳', 1.0000, 1, '2026-05-19 06:06:26'),
(2, 'United States', 'US', 'USD', '$', '🇺🇸', 0.0120, 1, '2026-05-19 06:06:26'),
(3, 'United Kingdom', 'GB', 'GBP', '£', '🇬🇧', 0.0095, 1, '2026-05-19 06:06:26'),
(4, 'United Arab Emirates', 'AE', 'AED', 'د.إ', '🇦🇪', 0.0441, 1, '2026-05-19 06:06:26'),
(5, 'Saudi Arabia', 'SA', 'SAR', '﷼', '🇸🇦', 0.0451, 1, '2026-05-19 06:06:26'),
(6, 'Singapore', 'SG', 'SGD', 'S$', '🇸🇬', 0.0162, 1, '2026-05-19 06:06:26'),
(7, 'Malaysia', 'MY', 'MYR', 'RM', '🇲🇾', 0.0566, 1, '2026-05-19 06:06:26'),
(8, 'Australia', 'AU', 'AUD', 'A$', '🇦🇺', 0.0185, 1, '2026-05-19 06:06:26'),
(9, 'Canada', 'CA', 'CAD', 'C$', '🇨🇦', 0.0164, 1, '2026-05-19 06:06:26'),
(10, 'Germany', 'DE', 'EUR', '€', '🇩🇪', 0.0111, 1, '2026-05-19 06:06:26'),
(11, 'France', 'FR', 'EUR', '€', '🇫🇷', 0.0111, 1, '2026-05-19 06:06:26'),
(12, 'Netherlands', 'NL', 'EUR', '€', '🇳🇱', 0.0111, 1, '2026-05-19 06:06:26'),
(13, 'New Zealand', 'NZ', 'NZD', 'NZ$', '🇳🇿', 0.0200, 1, '2026-05-19 06:06:26'),
(14, 'Bahrain', 'BH', 'BHD', 'BD', '🇧🇭', 0.0045, 1, '2026-05-19 06:06:26'),
(15, 'Kuwait', 'KW', 'KWD', 'KD', '🇰🇼', 0.0037, 1, '2026-05-19 06:06:26'),
(16, 'Belgium', 'BE', 'EUR', '€', '🇧🇪', 0.0111, 1, '2026-05-19 06:43:18'),
(17, 'Qatar', 'QA', 'QAR', '﷼', '🇶🇦', 0.0440, 1, '2026-05-19 06:43:18'),
(18, 'Norway', 'NO', 'NOK', 'kr', '🇳🇴', 0.1210, 1, '2026-05-19 06:43:18'),
(19, 'Switzerland', 'CH', 'CHF', 'CHF', '🇨🇭', 0.0100, 1, '2026-05-19 06:43:18'),
  (20, 'France', 'FR', 'EUR', '€', '🇫🇷', 0.0111, 1, '2026-05-19 06:25:43');
-- --------------------------------------------------------

--
-- Table structure for table `digital_orders`
--

CREATE TABLE `digital_orders` (
  `id` int(11) NOT NULL,
  `order_uid` varchar(20) NOT NULL,
  `invoice_uid` varchar(20) NOT NULL,
  `member_uid` varchar(20) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `currency_code` varchar(10) DEFAULT 'INR',
  `currency_rate` decimal(10,4) DEFAULT 1.0000,
  `payment_mode` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(200) DEFAULT NULL,
  `transaction_at` timestamp NULL DEFAULT NULL,
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `download_url` varchar(500) DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `status` enum('Processing','Completed','Refunded') DEFAULT 'Processing',
  `invoice_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `digital_order_items`
--

CREATE TABLE `digital_order_items` (
  `id` int(11) NOT NULL,
  `order_uid` varchar(20) NOT NULL,
  `product_uid` varchar(20) DEFAULT NULL,
  `product_name` varchar(200) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `tax_rate` decimal(5,2) DEFAULT 18.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `digital_products`
--

CREATE TABLE `digital_products` (
  `id` int(11) NOT NULL,
  `product_uid` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `file_size` varchar(50) DEFAULT NULL,
  `file_format` varchar(100) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT 18.00,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `digital_products`
--

INSERT INTO `digital_products` (`id`, `product_uid`, `name`, `description`, `price`, `discount_price`, `category_id`, `file_url`, `thumbnail_url`, `images`, `tags`, `file_size`, `file_format`, `tax_rate`, `rating`, `review_count`, `is_active`, `created_at`) VALUES
(1, 'DPD-LG-000001', 'Complete Logo Design Kit', 'Full brand identity kit — logo in AI, EPS, PNG, SVG formats. Light + dark variants. Fully editable.', 299.00, 199.00, 6, 'https://example.com/logo-kit.zip', NULL, NULL, '[\"Best Seller\",\"Trending\"]', '45 MB', 'AI, EPS, PNG, SVG', 18.00, 0.00, 0, 1, '2026-05-19 06:44:11'),
(2, 'DPD-TP-000001', 'Business Card Template Pack', '10 premium editable business card templates in PSD and PDF. Print-ready.', 149.00, 49.00, 7, 'https://example.com/biz-card.zip', NULL, '[]', '[\"Top Rated\",\"New Arrival\"]', '28 MB', 'PSD, PDF', 18.00, 0.00, 0, 1, '2026-05-19 06:44:11');

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `image_url` varchar(511) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `style` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `image_url`, `title`, `style`, `category`, `industry`, `material`, `created_at`) VALUES
(1, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', 'Teakwood Engraved Doorplate', 'Classic', 'Signage', 'Residential', 'Teak Wood', '2026-07-01 07:51:55'),
(2, 'https://images.unsplash.com/photo-1449247700740-e4403cd261fe?auto=format&fit=crop&w=800&q=80', 'Minimalist Office Desk Nameplate', 'Modern', 'Nameplate', 'Corporate', 'Acrylic & Teak', '2026-07-01 07:51:55'),
(3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Acrylic Backlit Logo Sign', 'Backlit', 'Logo Signs', 'Commercial', 'Frosted Acrylic', '2026-07-01 07:51:55'),
(4, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Laser Engraved Wooden Restaurant Menu', 'Rustic', 'Menus', 'Hospitality', 'Pine Wood', '2026-07-01 07:51:55'),
(5, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', 'Brass Inlay Teak Wall Clock', 'Vintage', 'Clocks', 'Interior Design', 'Premium Teak & Brass', '2026-07-01 07:51:55');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `member_uid` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('Active','Blocked') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `member_uid`, `name`, `email`, `password`, `phone`, `status`, `created_at`) VALUES
(1, 'MBR-2026-000001', 'tdey', 'hariyo8056@gmail.com', '$2b$10$/eNwgVdUKN7cQ/tApHRD4uUY8xKkbJ5c6OwCDE9Iy85XwCbEg0pIC', '+919361177237', 'Active', '2026-05-23 05:57:30'),
(2, 'MBR-2026-000002', 'demo', 'demo@gmail.com', '$2b$10$dSmssww89cOrhO2yrSz68Og0eyJIGatmP0ROAWH/GvG4E4lIn/iNO', '12345678901', 'Active', '2026-06-30 12:20:39');

-- --------------------------------------------------------

--
-- Table structure for table `member_notifications`
--

CREATE TABLE `member_notifications` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT 'info',
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_profiles`
--

CREATE TABLE `member_profiles` (
  `id` int(11) NOT NULL,
  `member_uid` varchar(20) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `apt_suite` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_profiles`
--

INSERT INTO `member_profiles` (`id`, `member_uid`, `full_name`, `street_address`, `apt_suite`, `city`, `state`, `country`, `pincode`, `phone`, `email`, `updated_at`) VALUES
(1, 'MBR-2026-000001', 'tdey', '112, stree', 'united', 'state', 'kansas', 'america', '620001', '+919361177237', 'hariyo8056@gmail.com', '2026-05-23 08:39:25'),
(2, 'MBR-2026-000002', 'demo', NULL, NULL, NULL, NULL, NULL, NULL, '12345678901', 'demo@gmail.com', '2026-06-30 12:20:39');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` enum('new_order','new_member','contact_message','visitor','low_stock','payment_failed','manual') DEFAULT 'manual',
  `title` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `link` varchar(300) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-19 10:49:06'),
(2, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-19 10:49:08'),
(3, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-22 06:27:47'),
(4, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-22 06:27:47'),
(5, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /contact', NULL, 0, '2026-05-22 09:02:35'),
(6, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /contact', NULL, 0, '2026-05-22 09:02:35'),
(7, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-22 14:15:32'),
(8, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-22 14:15:32'),
(9, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /contact', NULL, 0, '2026-05-22 14:48:50'),
(10, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /contact', NULL, 0, '2026-05-22 14:48:50'),
(11, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /privacypolicy', NULL, 0, '2026-05-22 16:01:39'),
(12, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /privacypolicy', NULL, 0, '2026-05-22 16:01:40'),
(13, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-23 05:54:02'),
(14, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-23 05:54:02'),
(15, 'new_member', 'New member registered', 'tdey (hariyo8056@gmail.com) just created an account', '/members', 0, '2026-05-23 05:57:31'),
(16, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-23 06:38:42'),
(17, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-05-23 07:14:38'),
(18, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-05-23 07:14:38'),
(19, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 07:58:18'),
(20, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 07:58:18'),
(21, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 08:38:14'),
(22, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 08:38:14'),
(23, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /cart', NULL, 0, '2026-05-23 09:18:31'),
(24, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /cart', NULL, 0, '2026-05-23 09:18:31'),
(25, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 10:46:47'),
(26, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 10:46:47'),
(27, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-05-23 14:37:04'),
(28, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 04:32:40'),
(29, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 04:32:40'),
(30, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 05:16:30'),
(31, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 05:16:30'),
(32, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 11:19:23'),
(33, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 11:19:23'),
(34, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 12:13:58'),
(35, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-25 12:13:58'),
(36, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 09:30:08'),
(37, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 09:30:08'),
(38, 'new_order', 'New physical order', 'ORD-P-000001 — ₹589 from Demo Customer (Digital)', '/orders', 0, '2026-05-26 10:36:56'),
(39, 'new_order', 'New physical order', 'ORD-P-000002 — ₹589 from Demo Customer (Digital)', '/orders', 0, '2026-05-26 10:37:04'),
(40, 'new_order', 'New physical order', 'ORD-P-000003 — ₹589 from Demo Customer (Digital)', '/orders', 0, '2026-05-26 10:42:31'),
(41, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 10:44:05'),
(42, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 10:44:05'),
(43, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 11:19:26'),
(44, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 11:19:26'),
(45, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /digital', NULL, 0, '2026-05-26 12:58:45'),
(46, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /digital', NULL, 0, '2026-05-26 12:58:45'),
(47, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 12:58:45'),
(48, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-26 12:58:45'),
(49, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-05-26 13:44:57'),
(50, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-05-26 13:44:57'),
(51, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-05-26 15:55:02'),
(52, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-05-26 15:55:02'),
(53, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-05-27 06:46:53'),
(54, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-05-27 06:46:53'),
(55, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 10:27:18'),
(56, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 10:27:18'),
(57, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 14:06:28'),
(58, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 14:06:28'),
(59, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 14:51:56'),
(60, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 14:51:55'),
(61, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 15:57:11'),
(62, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-05-27 15:57:12'),
(63, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 07:48:56'),
(64, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 07:48:56'),
(65, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 08:38:25'),
(66, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 08:38:25'),
(67, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 14:10:28'),
(68, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-01 14:10:28'),
(69, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-03 06:01:27'),
(70, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-03 06:01:27'),
(71, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-03 08:15:54'),
(72, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-03 08:15:54'),
(73, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-06 14:17:54'),
(74, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-06 14:17:54'),
(75, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-10 09:19:19'),
(76, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-10 09:19:19'),
(77, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 07:04:50'),
(78, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 07:04:50'),
(79, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 07:50:19'),
(80, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 07:50:19'),
(81, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 08:27:15'),
(82, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 08:27:15'),
(83, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 09:02:48'),
(84, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 09:02:48'),
(85, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 09:39:16'),
(86, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 09:39:16'),
(87, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 10:18:59'),
(88, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 10:18:59'),
(89, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 11:35:04'),
(90, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 11:35:04'),
(91, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 12:14:48'),
(92, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-11 12:14:48'),
(93, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-27 13:59:04'),
(94, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-27 13:59:04'),
(95, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-06-27 15:01:01'),
(96, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /service', NULL, 0, '2026-06-27 15:01:01'),
(97, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-29 08:56:30'),
(98, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-29 08:56:30'),
(99, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-29 11:01:26'),
(100, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-29 11:01:26'),
(101, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-30 07:50:57'),
(102, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-30 07:50:57'),
(103, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-30 09:02:52'),
(104, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products', NULL, 0, '2026-06-30 09:02:52'),
(105, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-30 11:56:57'),
(106, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-06-30 11:56:57'),
(107, 'new_member', 'New member registered (Pending OTP)', 'demo (demo@gmail.com) created account - pending OTP', '/members', 0, '2026-06-30 12:20:40'),
(108, 'new_member', 'Member verified account', 'Member account activated: demo@gmail.com', '/members', 0, '2026-06-30 12:21:04'),
(109, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products/1', NULL, 0, '2026-06-30 12:31:44'),
(110, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products/1', NULL, 0, '2026-06-30 12:31:44'),
(111, 'new_order', 'New physical order', 'ORD-P-000004 — ₹1593 from Demo Customer (Physical)', '/orders', 0, '2026-06-30 12:56:45'),
(112, 'new_order', 'New physical order', 'ORD-P-000005 — ₹1593 from Demo Customer (Physical)', '/orders', 0, '2026-06-30 14:23:53'),
(113, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products/5', NULL, 0, '2026-06-30 14:30:45'),
(114, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /products/5', NULL, 0, '2026-06-30 14:30:45'),
(115, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-01 06:04:49'),
(116, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-01 06:04:56'),
(117, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-01 07:05:46'),
(118, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-02 16:41:00'),
(119, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-02 16:41:00'),
(120, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 04:36:33'),
(121, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 04:36:33'),
(122, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 09:45:25'),
(123, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 09:45:27'),
(124, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-07-03 10:16:34'),
(125, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /profile', NULL, 0, '2026-07-03 10:16:34'),
(126, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 10:53:04'),
(127, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 10:53:05'),
(128, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 13:56:04'),
(129, 'visitor', 'New website visitor', 'Visitor from ::1 on page: /', NULL, 0, '2026-07-03 13:56:04');

-- --------------------------------------------------------

--
-- Table structure for table `order_item_customizations`
--

CREATE TABLE `order_item_customizations` (
  `id` int(11) NOT NULL,
  `physical_order_item_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `template_name` varchar(255) DEFAULT NULL,
  `field_key` varchar(255) NOT NULL,
  `field_label` varchar(255) NOT NULL,
  `field_value` text NOT NULL,
  `field_type` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `purpose` varchar(50) NOT NULL DEFAULT 'registration',
  `is_verified` tinyint(1) DEFAULT 0,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`id`, `email`, `otp_code`, `purpose`, `is_verified`, `expires_at`, `created_at`) VALUES
(1, 'demo@gmail.com', '219390', 'registration', 1, '2026-06-30 12:21:04', '2026-06-30 12:20:40');

-- --------------------------------------------------------

--
-- Table structure for table `physical_orders`
--

CREATE TABLE `physical_orders` (
  `id` int(11) NOT NULL,
  `order_uid` varchar(20) NOT NULL,
  `invoice_uid` varchar(20) NOT NULL,
  `member_uid` varchar(20) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `delivery_name` varchar(100) DEFAULT NULL,
  `delivery_street` varchar(255) DEFAULT NULL,
  `delivery_apt` varchar(100) DEFAULT NULL,
  `delivery_city` varchar(100) DEFAULT NULL,
  `delivery_state` varchar(100) DEFAULT NULL,
  `delivery_country` varchar(100) DEFAULT NULL,
  `delivery_pincode` varchar(20) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `shipping_fee` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `currency_code` varchar(10) DEFAULT 'INR',
  `currency_rate` decimal(10,4) DEFAULT 1.0000,
  `payment_mode` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(200) DEFAULT NULL,
  `transaction_at` timestamp NULL DEFAULT NULL,
  `payment_status` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `status` varchar(100) DEFAULT 'Processing',
  `tracking_number` varchar(100) DEFAULT NULL,
  `invoice_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `production_notes` text DEFAULT NULL,
  `production_status` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `physical_orders`
--

INSERT INTO `physical_orders` (`id`, `order_uid`, `invoice_uid`, `member_uid`, `guest_name`, `guest_email`, `guest_phone`, `delivery_name`, `delivery_street`, `delivery_apt`, `delivery_city`, `delivery_state`, `delivery_country`, `delivery_pincode`, `subtotal`, `tax_amount`, `shipping_fee`, `total`, `currency_code`, `currency_rate`, `payment_mode`, `transaction_id`, `transaction_at`, `payment_status`, `status`, `tracking_number`, `invoice_date`, `updated_at`, `production_notes`, `production_status`) VALUES
(5, 'ORD-P-000004', 'INV-P-000004', NULL, 'Demo Customer (Physical)', 'demo_1782824201828@example.com', '9876543210', 'Demo Customer (Physical)', '123 Innovation Street', 'Technopark', 'Chennai', 'Tamil Nadu', 'India', '600001', 1299.00, 234.00, 60.00, 1593.00, 'INR', 1.0000, 'COD', NULL, NULL, 'Pending', 'Processing', NULL, '2026-06-30 12:56:42', '2026-06-30 12:56:42', NULL, 'Pending'),
(8, 'ORD-P-000005', 'INV-P-000005', NULL, 'Demo Customer (Physical)', 'demo_1782829432900@example.com', '9876543210', 'Demo Customer (Physical)', '123 Innovation Street', 'Technopark', 'Chennai', 'Tamil Nadu', 'India', '600001', 1299.00, 234.00, 60.00, 1593.00, 'INR', 1.0000, 'COD', NULL, NULL, 'Pending', 'Processing', NULL, '2026-06-30 14:23:53', '2026-06-30 14:23:53', NULL, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `physical_order_items`
--

CREATE TABLE `physical_order_items` (
  `id` int(11) NOT NULL,
  `order_uid` varchar(20) NOT NULL,
  `product_uid` varchar(20) DEFAULT NULL,
  `product_name` varchar(200) DEFAULT NULL,
  `selected_size` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `tax_rate` decimal(5,2) DEFAULT 18.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `physical_order_items`
--

INSERT INTO `physical_order_items` (`id`, `order_uid`, `product_uid`, `product_name`, `selected_size`, `price`, `qty`, `tax_rate`) VALUES
(5, 'ORD-P-000004', 'PRD-MOCK-101', 'Premium Engraved Wood Frame', 'A4 Size', 1299.00, 1, 18.00),
(8, 'ORD-P-000005', 'PRD-MOCK-101', 'Premium Engraved Wood Frame', 'A4 Size', 1299.00, 1, 18.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_uid` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `tax_rate` decimal(5,2) DEFAULT 18.00,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `enable_personalization` tinyint(1) DEFAULT 0,
  `allow_multiple_templates` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_uid`, `name`, `description`, `price`, `discount_price`, `category_id`, `stock`, `image_url`, `images`, `sizes`, `tags`, `tax_rate`, `rating`, `review_count`, `is_active`, `created_at`, `enable_personalization`, `allow_multiple_templates`) VALUES
(1, 'PRD-NB-000001', 'Wooden Circle Nameboard Dark Gold', 'Premium laser-engraved circular wooden nameboard with gold-finish lettering. Perfect for home entrance.', 799.00, 599.00, 1, 25, NULL, '[]', '[\"Small 6inch\",\"Medium 8inch\",\"Large 10inch\",\"XL 12inch\"]', '[\"Best Seller\",\"New Arrival\"]', 18.00, 0.00, 0, 1, '2026-05-19 06:43:50', 1, 0),
(2, 'PRD-KC-000001', 'Personalised Name Keychain', 'Custom laser-engraved keychain in premium acrylic or wood. Your name or any message.', 199.00, 99.00, 2, 50, NULL, '[]', '[\"Standard size\"]', '[\"Best Seller\",\"New Arrival\"]', 18.00, 0.00, 0, 1, '2026-05-19 06:43:50', 1, 1),
(3, 'PRD-MG-000001', 'Engraved Wooden Travel Mug', 'Double-wall wooden travel mug with your custom engraving on the side.', 499.00, 399.00, 3, 15, NULL, '[]', '[\"320ml\",\"450ml\"]', '[\"Top Rated\",\"New Arrival\"]', 18.00, 0.00, 0, 1, '2026-05-19 06:43:50', 0, 0),
(5, 'gggggg', 'demo', '', 9999.00, NULL, 18, 777, '', '[]', '[]', '[]', 18.00, 0.00, 0, 1, '2026-06-30 12:19:29', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_personalization_fields`
--

CREATE TABLE `product_personalization_fields` (
  `id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `field_key` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `placeholder` varchar(255) DEFAULT NULL,
  `help_text` varchar(255) DEFAULT NULL,
  `min_chars` int(11) DEFAULT NULL,
  `max_chars` int(11) DEFAULT NULL,
  `default_value` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT 'active',
  `options` text DEFAULT NULL,
  `x_pos` int(11) DEFAULT NULL,
  `y_pos` int(11) DEFAULT NULL,
  `font_family` varchar(100) DEFAULT NULL,
  `font_size` int(11) DEFAULT NULL,
  `font_color` varchar(50) DEFAULT NULL,
  `text_align` varchar(50) DEFAULT 'left',
  `max_width` int(11) DEFAULT NULL,
  `rotation` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_personalization_fields`
--

INSERT INTO `product_personalization_fields` (`id`, `template_id`, `label`, `field_key`, `type`, `is_required`, `placeholder`, `help_text`, `min_chars`, `max_chars`, `default_value`, `sort_order`, `status`, `options`, `x_pos`, `y_pos`, `font_family`, `font_size`, `font_color`, `text_align`, `max_width`, `rotation`, `created_at`, `updated_at`) VALUES
(3, 2, 'Dog', 'field_1', 'text', 1, 'Buddy', NULL, 3, 7, '', 0, 'active', '[]', NULL, NULL, 'sans-serif', 16, '#000000', 'left', NULL, NULL, '2026-06-30 12:18:34', '2026-06-30 12:18:34'),
(4, 2, 'New Field', 'field_2', 'text', 0, NULL, NULL, NULL, NULL, '', 1, 'active', '[]', NULL, NULL, 'sans-serif', 16, '#000000', 'left', NULL, NULL, '2026-06-30 12:18:34', '2026-06-30 12:18:34'),
(5, 4, 'New Field', 'field_1', 'text', 0, NULL, NULL, NULL, NULL, '', 0, 'active', '[]', NULL, NULL, 'sans-serif', 16, '#000000', 'left', NULL, NULL, '2026-06-30 12:42:51', '2026-06-30 12:42:51'),
(6, 9, 'New Field', 'field_1', 'text', 0, NULL, NULL, NULL, NULL, '', 0, 'active', '[]', NULL, NULL, 'sans-serif', 16, '#000000', 'left', NULL, NULL, '2026-06-30 12:45:00', '2026-06-30 12:45:00'),
(7, 9, 'New Field', 'field_2', 'image', 0, NULL, NULL, NULL, NULL, '', 1, 'active', '[]', NULL, NULL, 'sans-serif', 16, '#000000', 'left', NULL, NULL, '2026-06-30 12:45:00', '2026-06-30 12:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `product_templates`
--

CREATE TABLE `product_templates` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `preview_image` varchar(500) NOT NULL,
  `background_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_templates`
--

INSERT INTO `product_templates` (`id`, `product_id`, `name`, `preview_image`, `background_image`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(2, 2, 'Template 1', '', NULL, 1, 2, '2026-06-30 12:18:34', '2026-06-30 12:18:34'),
(4, 1, 'God ', '', NULL, 1, 1, '2026-06-30 12:42:51', '2026-06-30 12:42:51'),
(9, 5, 'Template 1', '', NULL, 1, 0, '2026-06-30 12:45:00', '2026-06-30 12:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `member_uid` varchar(20) DEFAULT NULL,
  `product_uid` varchar(20) DEFAULT NULL,
  `product_type` enum('physical','digital') DEFAULT 'physical',
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(200) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saved_payments`
--

CREATE TABLE `saved_payments` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `type` enum('card','upi','netbanking','wallet') DEFAULT 'card',
  `label` varchar(100) DEFAULT NULL,
  `masked_number` varchar(20) DEFAULT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seo_settings`
--

CREATE TABLE `seo_settings` (
  `id` int(11) NOT NULL,
  `page_name` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `meta_description` text NOT NULL,
  `keywords` text DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text DEFAULT NULL,
  `og_image` varchar(255) DEFAULT NULL,
  `image_alt` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seo_settings`
--

INSERT INTO `seo_settings` (`id`, `page_name`, `title`, `meta_description`, `keywords`, `og_title`, `og_description`, `og_image`, `image_alt`, `updated_at`) VALUES
(1, 'home', 'Premium Engraving & Digital Studio | Olive Seeds', 'Premium laser engraved luxury gifts, wood carvings, personalized wedding frames, custom design templates, Notion trackers, React apps and brand UI design.', 'laser engraving, custom engravings, personalized gifts, Notion templates, Figma kits, React developers, web design, Olive Seeds', 'Olive Seeds Creative Studio', 'Handcrafted engraved products & templates', '', 'Designers crafting engravings in Olive Seeds studio workshop', '2026-05-26 16:14:08'),
(2, 'products', 'Luxury Laser Engraved Masterpieces | Olive Seeds', 'Browse premium custom-engraved wooden frames, acrylic wedding blocks, corporate luxury keepsakes and hand-finished laser gifts at Olive Seeds.', 'wood engraving, personalized gifts, custom keepsakes, corporate premium gifts, wedding acrylic blocks', 'Luxury Custom Engravings', 'Elegant keepsakes hand-finished at Olive Seeds', '', 'Precision custom wood engraving using high-end laser technology', '2026-05-26 16:14:08'),
(3, 'digital', 'Premium AI-Powered Digital Assets & UI/UX Design Templates', 'Download professional Notion templates, Figma kits, React source code, luxury vectors, and premium UI designs instantly at Olive Seeds.', 'Notion template, Figma design systems, React developer kits, premium UI design templates, Olive Seeds digital', 'Olive Seeds Digital Assets', 'Instant premium download templates', '', 'Sleek luxury design kits representation', '2026-05-26 16:14:08'),
(4, 'blogs', 'Studio Journal & Craftsmanship Musings | Olive Seeds', 'Read about precision laser engraving sciences, sustainable teakwood designs, creative branding, and luxury design philosophies on Olive Seeds Journal.', 'precision laser calibration, design journal, corporate gift ideas, circular branding, sustainable bamboo, Olive Seeds', 'Olive Seeds Craftsmanship Journal', 'Insights from the workshop & digital desk', '', 'Teakwood designs alignment on the desk', '2026-05-26 16:14:08'),
(5, 'contact', 'Contact Our Studio | Olive Seeds', 'Get in touch with the team at Olive Seeds for custom engraving requests, corporate branding quotes, or personalized digital agency solutions.', 'contact us, custom quotes, custom laser orders', 'Start a Project with Olive Seeds', 'Reach out for pricing and bespoke orders', '', 'Luxury contact desk illustration', '2026-05-26 16:14:08'),
(6, 'about', 'About Our Studio | Olive Seeds', 'Learn about our passion for luxury craftsmanship, organic bamboo & recycled acrylic selections, precision laser engraving, and custom brand designs.', 'luxury craftsmanship, sustainable design, about olive seeds, laser workshop', 'The Story of Olive Seeds', 'Luxury craftsmanship meeting modern digital tech', '', 'Olive Seeds workshop process representation', '2026-05-26 16:14:08'),
(9, 'service', 'Premium Creative Services | Olive Seeds', 'Professional UI/UX design, web & mobile development, AI integration, brand identity design, and premium creative solutions.', 'ui/ux design, web development, app development, branding, AI solutions, Olive Seeds services', 'Creative Services | Olive Seeds', 'Everything your brand needs to succeed', '', 'Workspace overview with design draft models', '2026-05-27 06:01:41'),
(14, 'terms', 'Terms & Conditions | Olive Seeds', 'Review the official terms of service, user agreements, digital license terms, and purchase policies of Olive Seeds Creative Studio.', 'terms and conditions, terms of service, user agreement, licensing terms, Olive Seeds terms', 'Terms & Conditions', 'Our customer terms & guidelines', '', 'Legal documents illustration', '2026-05-27 06:01:41'),
(15, 'refund', 'Refund & Cancellation Policy | Olive Seeds', 'Learn about our return, refund, and replacement policies for customized engraved products and digital downloads.', 'refund policy, cancellation, return policy, product replacement, Olive Seeds refund', 'Refund & Cancellation Policy', 'Return & refund terms explained', '', 'Customer care support graphics', '2026-05-27 06:01:41'),
(16, 'privacy', 'Privacy Policy | Olive Seeds', 'Read the privacy policy of Olive Seeds Creative Studio to understand how we collect, protect, and handle your personal data.', 'privacy policy, data protection, security, user privacy, Olive Seeds privacy', 'Privacy Policy', 'Your privacy & trust are secure with us', '', 'Secure lock privacy illustration', '2026-05-27 06:01:41'),
(17, 'shipping', 'Shipping & Delivery Policy | Olive Seeds', 'Read the shipping details, processing times, and worldwide delivery options for our physical laser-engraved creations.', 'shipping policy, worldwide delivery, processing times, package tracking, Olive Seeds shipping', 'Shipping & Delivery Policy', 'Safe packaging and fast shipping logistics', '', 'Delivery packaging container representation', '2026-05-27 06:01:42'),
(18, 'profile', 'Your Dashboard & Profile | Olive Seeds', 'Access your secure profile dashboard to track your orders, retrieve download keys, and manage your account configurations.', 'user profile, profile dashboard, customer panel, digital library, order history', 'Customer Profile Dashboard', 'Manage your orders, digital assets & account details', '', 'Custom dashboard analytics mockup', '2026-05-27 06:01:42'),
(19, 'login', 'Member Login | Olive Seeds', 'Log in to your secure Olive Seeds member portal to access your previous digital downloads, tracking, and customized order history.', 'member login, login, dashboard access, sign in, customer account', 'Member Portal Login', 'Access your customer account securely', '', 'Customer login shield vector', '2026-05-27 06:01:42'),
(20, 'checkout', 'Secure Checkout | Olive Seeds', 'Complete your secure payment and purchase of handcrafted engraved treasures or instant digital creator assets.', 'secure checkout, checkout, buy templates, pay custom order, Olive Seeds checkout', 'Secure Checkout', 'Encrypted secure payment gateway integration', '', 'Secure payment processing card representation', '2026-05-27 06:01:42'),
(21, 'cart', 'Your Shopping Cart | Olive Seeds', 'Review your selected premium laser-engraved gifts, custom keepsakes, or digital design templates in your cart.', 'shopping cart, cart, checkout items, checkout queue, Olive Seeds cart', 'Your Shopping Cart', 'Securely view your selected items', '', 'Shopping cart illustration', '2026-05-27 06:01:42'),
(22, 'cookies', 'Cookies Policy | Olive Seeds', 'Understand how Olive Seeds Creative Studio uses cookies to optimize your browsing experience and custom dashboard usage.', 'cookies policy, cookies usage, tracking, website cookies, Olive Seeds cookies', 'Cookies Policy', 'Cookie storage and tracking preference terms', '', 'Cookie browser settings graphics', '2026-05-27 06:01:42');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `site_name` varchar(200) DEFAULT 'My Engraving Store',
  `site_email` varchar(200) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `default_currency` varchar(10) DEFAULT 'INR',
  `default_tax_rate` decimal(5,2) DEFAULT 18.00,
  `razorpay_key` varchar(200) DEFAULT NULL,
  `razorpay_secret` varchar(200) DEFAULT NULL,
  `admin_password` varchar(255) DEFAULT 'admin123',
  `member_uid_counter` int(11) DEFAULT 0,
  `order_p_counter` int(11) DEFAULT 0,
  `order_d_counter` int(11) DEFAULT 0,
  `currency` varchar(10) DEFAULT 'INR',
  `shipping_fee` decimal(10,2) DEFAULT 60.00,
  `free_shipping_above` decimal(10,2) DEFAULT 999.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `site_name`, `site_email`, `phone`, `address`, `default_currency`, `default_tax_rate`, `razorpay_key`, `razorpay_secret`, `admin_password`, `member_uid_counter`, `order_p_counter`, `order_d_counter`, `currency`, `shipping_fee`, `free_shipping_above`) VALUES
(1, 'My Engraving Store', 'admin@mystore.com', '+91 98765 43210', 'Coimbatore, Tamil Nadu', 'INR', 18.00, NULL, NULL, '$2b$12$LoS1P3ZaKhMkcg1lEd1yuu3i/DuOh/P69jZLvvV4j6Bo10s8r7mu2', 2, 5, 0, 'INR', 60.00, 999.00),
(2, 'My Engraving Store', 'admin@mystore.com', '+91 98765 43210', 'Coimbatore, Tamil Nadu', 'INR', 18.00, NULL, NULL, 'admin123', 0, 0, 0, 'INR', 60.00, 999.00),
(3, 'My Engraving Store', 'admin@mystore.com', '+91 98765 43210', 'Coimbatore, Tamil Nadu', 'INR', 18.00, NULL, NULL, 'admin123', 0, 0, 0, 'INR', 60.00, 999.00),
(4, 'My Engraving Store', 'admin@mystore.com', '+91 98765 43210', 'Coimbatore, Tamil Nadu', 'INR', 18.00, NULL, NULL, 'admin123', 0, 0, 0, 'INR', 60.00, 999.00),
(5, 'My Engraving Store', 'admin@mystore.com', '+91 98765 43210', 'Coimbatore, Tamil Nadu', 'INR', 18.00, NULL, NULL, 'admin123', 0, 0, 0, 'INR', 60.00, 999.00);

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `partner` varchar(50) DEFAULT 'delhivery',
  `tracking_number` varchar(100) NOT NULL,
  `status` enum('Picked Up','In Transit','Out for Delivery','Delivered','Failed','Returned') DEFAULT 'Picked Up',
  `estimated_delivery` date DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipment_events`
--

CREATE TABLE `shipment_events` (
  `id` int(11) NOT NULL,
  `shipment_id` int(11) NOT NULL,
  `status` varchar(100) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `event_time` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_rules`
--

CREATE TABLE `shipping_rules` (
  `id` int(11) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `base_fee_inr` decimal(10,2) DEFAULT 60.00,
  `free_above_inr` decimal(10,2) DEFAULT 999.00,
  `tax_percent` decimal(5,2) DEFAULT 18.00,
  `estimated_days` varchar(30) DEFAULT '7-10 business days'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_rules`
--

INSERT INTO `shipping_rules` (`id`, `country_code`, `base_fee_inr`, `free_above_inr`, `tax_percent`, `estimated_days`) VALUES
(1, 'IN', 60.00, 999.00, 18.00, '3-5 business days'),
(2, 'US', 800.00, 5000.00, 0.00, '10-14 business days'),
(3, 'GB', 900.00, 5500.00, 0.00, '10-14 business days'),
(4, 'AE', 600.00, 4000.00, 0.00, '7-10 business days'),
(5, 'SA', 650.00, 4000.00, 0.00, '7-10 business days'),
(6, 'SG', 700.00, 4500.00, 0.00, '7-10 business days'),
(7, 'MY', 650.00, 4000.00, 0.00, '7-10 business days'),
(8, 'AU', 850.00, 5500.00, 0.00, '12-16 business days'),
(9, 'CA', 850.00, 5500.00, 0.00, '12-16 business days'),
(10, 'DE', 900.00, 5500.00, 0.00, '10-14 business days'),
(11, 'FR', 900.00, 5500.00, 0.00, '10-14 business days'),
(12, 'NL', 900.00, 5500.00, 0.00, '10-14 business days'),
(13, 'NZ', 900.00, 5500.00, 0.00, '12-16 business days'),
(14, 'BH', 600.00, 4000.00, 0.00, '7-10 business days'),
(15, 'KW', 600.00, 4000.00, 0.00, '7-10 business days'),
(16, 'IN', 60.00, 999.00, 18.00, '3-5 business days'),
(17, 'US', 800.00, 5000.00, 0.00, '10-14 business days'),
(18, 'GB', 900.00, 5500.00, 0.00, '10-14 business days'),
(19, 'AE', 600.00, 4000.00, 0.00, '7-10 business days'),
(20, 'SA', 650.00, 4000.00, 0.00, '7-10 business days'),
(21, 'SG', 700.00, 4500.00, 0.00, '7-10 business days'),
(22, 'MY', 650.00, 4000.00, 0.00, '7-10 business days'),
(23, 'AU', 850.00, 5500.00, 0.00, '12-16 business days'),
(24, 'CA', 850.00, 5500.00, 0.00, '12-16 business days'),
(25, 'DE', 900.00, 5500.00, 0.00, '10-14 business days'),
(26, 'FR', 900.00, 5500.00, 0.00, '10-14 business days'),
(27, 'NL', 900.00, 5500.00, 0.00, '10-14 business days'),
(28, 'NZ', 900.00, 5500.00, 0.00, '12-16 business days'),
(29, 'BH', 600.00, 4000.00, 0.00, '7-10 business days'),
(30, 'KW', 600.00, 4000.00, 0.00, '7-10 business days'),
(31, 'IN', 60.00, 999.00, 18.00, '3-5 business days'),
(32, 'US', 800.00, 5000.00, 0.00, '10-14 business days'),
(33, 'GB', 900.00, 5500.00, 0.00, '10-14 business days'),
(34, 'AE', 600.00, 4000.00, 0.00, '7-10 business days'),
(35, 'SA', 650.00, 4000.00, 0.00, '7-10 business days'),
(36, 'SG', 700.00, 4500.00, 0.00, '7-10 business days'),
(37, 'MY', 650.00, 4000.00, 0.00, '7-10 business days'),
(38, 'AU', 850.00, 5500.00, 0.00, '12-16 business days'),
(39, 'CA', 850.00, 5500.00, 0.00, '12-16 business days'),
(40, 'DE', 900.00, 5500.00, 0.00, '10-14 business days'),
(41, 'FR', 900.00, 5500.00, 0.00, '10-14 business days'),
(42, 'NL', 900.00, 5500.00, 0.00, '10-14 business days'),
(43, 'NZ', 900.00, 5500.00, 0.00, '12-16 business days'),
(44, 'BH', 600.00, 4000.00, 0.00, '7-10 business days'),
(45, 'KW', 600.00, 4000.00, 0.00, '7-10 business days'),
(46, 'IN', 60.00, 999.00, 18.00, '3-5 business days'),
(47, 'US', 800.00, 5000.00, 0.00, '10-14 business days'),
(48, 'GB', 900.00, 5500.00, 0.00, '10-14 business days'),
(49, 'AE', 600.00, 4000.00, 0.00, '7-10 business days'),
(50, 'SA', 650.00, 4000.00, 0.00, '7-10 business days'),
(51, 'SG', 700.00, 4500.00, 0.00, '7-10 business days'),
(52, 'MY', 650.00, 4000.00, 0.00, '7-10 business days'),
(53, 'AU', 850.00, 5500.00, 0.00, '12-16 business days'),
(54, 'CA', 850.00, 5500.00, 0.00, '12-16 business days'),
(55, 'DE', 900.00, 5500.00, 0.00, '10-14 business days'),
(56, 'FR', 900.00, 5500.00, 0.00, '10-14 business days'),
(57, 'NL', 900.00, 5500.00, 0.00, '10-14 business days'),
(58, 'NZ', 900.00, 5500.00, 0.00, '12-16 business days'),
(59, 'BH', 600.00, 4000.00, 0.00, '7-10 business days'),
(60, 'KW', 600.00, 4000.00, 0.00, '7-10 business days'),
(61, 'IN', 60.00, 999.00, 18.00, '3-5 business days'),
(62, 'US', 800.00, 5000.00, 0.00, '10-14 business days'),
(63, 'GB', 900.00, 5500.00, 0.00, '10-14 business days'),
(64, 'AE', 600.00, 4000.00, 0.00, '7-10 business days'),
(65, 'SA', 650.00, 4000.00, 0.00, '7-10 business days'),
(66, 'SG', 700.00, 4500.00, 0.00, '7-10 business days'),
(67, 'MY', 650.00, 4000.00, 0.00, '7-10 business days'),
(68, 'AU', 850.00, 5500.00, 0.00, '12-16 business days'),
(69, 'CA', 850.00, 5500.00, 0.00, '12-16 business days'),
(70, 'DE', 900.00, 5500.00, 0.00, '10-14 business days'),
(71, 'FR', 900.00, 5500.00, 0.00, '10-14 business days'),
(72, 'NL', 900.00, 5500.00, 0.00, '10-14 business days'),
(73, 'NZ', 900.00, 5500.00, 0.00, '12-16 business days'),
(74, 'BH', 600.00, 4000.00, 0.00, '7-10 business days'),
(75, 'KW', 600.00, 4000.00, 0.00, '7-10 business days');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `id` int(11) NOT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `page` varchar(500) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `geo_country` varchar(100) DEFAULT NULL,
  `geo_city` varchar(100) DEFAULT NULL,
  `geo_region` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `screen_width` int(11) DEFAULT NULL,
  `screen_height` int(11) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `visited_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `member_uid` varchar(20) NOT NULL,
  `product_uid` varchar(20) NOT NULL,
  `product_type` enum('physical','digital') DEFAULT 'physical'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `digital_id` int(11) DEFAULT NULL,
  `type` enum('physical','digital') DEFAULT 'physical',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `currency_rates`
--
ALTER TABLE `currency_rates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `digital_orders`
--
ALTER TABLE `digital_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_uid` (`order_uid`),
  ADD UNIQUE KEY `invoice_uid` (`invoice_uid`),
  ADD KEY `member_uid` (`member_uid`);

--
-- Indexes for table `digital_order_items`
--
ALTER TABLE `digital_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_uid` (`order_uid`);

--
-- Indexes for table `digital_products`
--
ALTER TABLE `digital_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_uid` (`product_uid`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `member_uid` (`member_uid`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `member_notifications`
--
ALTER TABLE `member_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_member` (`member_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `member_profiles`
--
ALTER TABLE `member_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_uid` (`member_uid`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `physical_order_item_id` (`physical_order_item_id`);

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `physical_orders`
--
ALTER TABLE `physical_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_uid` (`order_uid`),
  ADD UNIQUE KEY `invoice_uid` (`invoice_uid`),
  ADD KEY `member_uid` (`member_uid`);

--
-- Indexes for table `physical_order_items`
--
ALTER TABLE `physical_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_uid` (`order_uid`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_uid` (`product_uid`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `product_personalization_fields`
--
ALTER TABLE `product_personalization_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `product_templates`
--
ALTER TABLE `product_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_uid` (`member_uid`);

--
-- Indexes for table `saved_payments`
--
ALTER TABLE `saved_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `seo_settings`
--
ALTER TABLE `seo_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `page_name` (`page_name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `shipment_events`
--
ALTER TABLE `shipment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shipment_id` (`shipment_id`);

--
-- Indexes for table `shipping_rules`
--
ALTER TABLE `shipping_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_uid` (`member_uid`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wish` (`member_id`,`product_id`,`digital_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ads`
--
ALTER TABLE `ads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `currency_rates`
--
ALTER TABLE `currency_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `digital_orders`
--
ALTER TABLE `digital_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `digital_order_items`
--
ALTER TABLE `digital_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `digital_products`
--
ALTER TABLE `digital_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `member_notifications`
--
ALTER TABLE `member_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_profiles`
--
ALTER TABLE `member_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `physical_orders`
--
ALTER TABLE `physical_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `physical_order_items`
--
ALTER TABLE `physical_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_personalization_fields`
--
ALTER TABLE `product_personalization_fields`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_templates`
--
ALTER TABLE `product_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saved_payments`
--
ALTER TABLE `saved_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seo_settings`
--
ALTER TABLE `seo_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=701;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipment_events`
--
ALTER TABLE `shipment_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_rules`
--
ALTER TABLE `shipping_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `digital_orders`
--
ALTER TABLE `digital_orders`
  ADD CONSTRAINT `digital_orders_ibfk_1` FOREIGN KEY (`member_uid`) REFERENCES `members` (`member_uid`) ON DELETE SET NULL;

--
-- Constraints for table `digital_order_items`
--
ALTER TABLE `digital_order_items`
  ADD CONSTRAINT `digital_order_items_ibfk_1` FOREIGN KEY (`order_uid`) REFERENCES `digital_orders` (`order_uid`) ON DELETE CASCADE;

--
-- Constraints for table `digital_products`
--
ALTER TABLE `digital_products`
  ADD CONSTRAINT `digital_products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `member_notifications`
--
ALTER TABLE `member_notifications`
  ADD CONSTRAINT `member_notifications_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `member_profiles`
--
ALTER TABLE `member_profiles`
  ADD CONSTRAINT `member_profiles_ibfk_1` FOREIGN KEY (`member_uid`) REFERENCES `members` (`member_uid`) ON DELETE CASCADE;

--
-- Constraints for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  ADD CONSTRAINT `order_item_customizations_ibfk_1` FOREIGN KEY (`physical_order_item_id`) REFERENCES `physical_order_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `physical_orders`
--
ALTER TABLE `physical_orders`
  ADD CONSTRAINT `physical_orders_ibfk_1` FOREIGN KEY (`member_uid`) REFERENCES `members` (`member_uid`) ON DELETE SET NULL;

--
-- Constraints for table `physical_order_items`
--
ALTER TABLE `physical_order_items`
  ADD CONSTRAINT `physical_order_items_ibfk_1` FOREIGN KEY (`order_uid`) REFERENCES `physical_orders` (`order_uid`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_personalization_fields`
--
ALTER TABLE `product_personalization_fields`
  ADD CONSTRAINT `product_personalization_fields_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `product_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_templates`
--
ALTER TABLE `product_templates`
  ADD CONSTRAINT `product_templates_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`member_uid`) REFERENCES `members` (`member_uid`) ON DELETE SET NULL;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`member_uid`) REFERENCES `members` (`member_uid`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
