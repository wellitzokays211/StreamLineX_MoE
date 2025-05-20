-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2025 at 06:04 PM
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
-- Database: `wale`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `responsible_personsID` int(11) DEFAULT NULL,
  `officer_id` int(11) DEFAULT NULL,
  `assigned_engineer_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `province` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `zone` varchar(100) NOT NULL,
  `status` enum('Pending','Approved','Rejected','Not Started','On-Going','Completed','Cancelled','Accepted','PDApproved','PDRejected','FinalApproved','FinalRejected','PendingFinalApproved') NOT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `component` varchar(100) DEFAULT NULL,
  `subcomponent` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_details`
--

CREATE TABLE `activity_details` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `priority` int(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_images`
--

CREATE TABLE `activity_images` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget`
--

CREATE TABLE `budget` (
  `id` int(11) NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `budget_allocations`
--

CREATE TABLE `budget_allocations` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `allocated_amount` decimal(10,2) NOT NULL,
  `priority` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `development_officers`
--

CREATE TABLE `development_officers` (
  `officer_id` int(11) NOT NULL,
  `officer_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(15) NOT NULL,
  `nic` varchar(20) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `final_approvals`
--

CREATE TABLE `final_approvals` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `status` enum('FinalApproved','FinalRejected','PendingFinalApproved','FinalApproved','FinalRejected','PendingFinalApproved') NOT NULL DEFAULT 'PendingFinalApproved',
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pd_approvals`
--

CREATE TABLE `pd_approvals` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `approval_status` enum('PDApproved','PDRejected') NOT NULL,
  `approval_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `rejection_reason` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `responsible_persons`
--

CREATE TABLE `responsible_persons` (
  `responsible_personsID` int(11) NOT NULL,
  `responsible_persons_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_engineers`
--

CREATE TABLE `site_engineers` (
  `engineer_id` int(11) NOT NULL,
  `engineer_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(15) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activities_site_engineer` (`assigned_engineer_id`);

--
-- Indexes for table `activity_details`
--
ALTER TABLE `activity_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- Indexes for table `activity_images`
--
ALTER TABLE `activity_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- Indexes for table `budget`
--
ALTER TABLE `budget`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `budget_allocations`
--
ALTER TABLE `budget_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`),
  ADD KEY `budget_id` (`budget_id`);

--
-- Indexes for table `development_officers`
--
ALTER TABLE `development_officers`
  ADD PRIMARY KEY (`officer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `final_approvals`
--
ALTER TABLE `final_approvals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activity_id` (`activity_id`);

--
-- Indexes for table `pd_approvals`
--
ALTER TABLE `pd_approvals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `responsible_persons`
--
ALTER TABLE `responsible_persons`
  ADD PRIMARY KEY (`responsible_personsID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `site_engineers`
--
ALTER TABLE `site_engineers`
  ADD PRIMARY KEY (`engineer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `activity_details`
--
ALTER TABLE `activity_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `activity_images`
--
ALTER TABLE `activity_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `budget`
--
ALTER TABLE `budget`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `budget_allocations`
--
ALTER TABLE `budget_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `development_officers`
--
ALTER TABLE `development_officers`
  MODIFY `officer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `final_approvals`
--
ALTER TABLE `final_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `pd_approvals`
--
ALTER TABLE `pd_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `responsible_persons`
--
ALTER TABLE `responsible_persons`
  MODIFY `responsible_personsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `site_engineers`
--
ALTER TABLE `site_engineers`
  MODIFY `engineer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_activities_site_engineer` FOREIGN KEY (`assigned_engineer_id`) REFERENCES `site_engineers` (`engineer_id`) ON DELETE SET NULL;

--
-- Constraints for table `activity_details`
--
ALTER TABLE `activity_details`
  ADD CONSTRAINT `activity_details_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `activity_images`
--
ALTER TABLE `activity_images`
  ADD CONSTRAINT `activity_images_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `budget_allocations`
--
ALTER TABLE `budget_allocations`
  ADD CONSTRAINT `budget_allocations_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`),
  ADD CONSTRAINT `budget_allocations_ibfk_2` FOREIGN KEY (`budget_id`) REFERENCES `budget` (`id`);

--
-- Constraints for table `final_approvals`
--
ALTER TABLE `final_approvals`
  ADD CONSTRAINT `final_approvals_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
