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
---- --------------------------------------------------------

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
