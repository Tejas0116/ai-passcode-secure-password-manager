-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 13, 2023 at 09:52 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `password_manager_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_accounts`
--

CREATE TABLE `tbl_accounts` (
  `tbl_account_id` int(11) NOT NULL,
  `tbl_user_id` int(11) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `link` text NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_accounts`
--

INSERT INTO `tbl_accounts` (`tbl_account_id`, `tbl_user_id`, `account_name`, `username`, `password`, `link`, `description`) VALUES
(1, 1, 'User Acount', 'admin', 'admin', 'http://localhost/password-manager-app/index.php', 'awww'),
(2, 1, 'Sourcecodester', 'remyandrade', 'andrade2341', 'https://www.sourcecodester.com/', 'Sourcecodester account for code submission'),
(3, 2, 'Facebook', 'facebookuser', 'facebookpassword', 'https://www.facebook.com/', 'Second account'),
(4, 2, 'Test', 'test1', 'test1', 'test.com', 'Test'),
(5, 2, 'Google Account', 'lorem@gmail.com', 'lorem123', 'https://accounts.google.com/', 'Google Main Account'),
(6, 2, 'Google Account', 'lorem1@gmail.com', 'lorem123', 'https://accounts.google.com/', 'Google Second Account'),
(7, 2, 'Instagram', 'loremipsum123', 'ipsum123', 'https://www.instagram.com/', 'Instagram Main Account'),
(8, 2, 'Instragram', 'loremdump', 'dump123', 'https://www.instagram.com/', 'Instagram Dump Account'),
(9, 2, 'Yahoo', 'lorem@yahoo.com', 'lorem1234', 'asdahttps://www.yahoo.com/?guccounter=1', 'Yahoo Account'),
(10, 2, 'Twitter', 'loremipsum12345', 'loremipsum', 'https://twitter.com/', 'Twitter Account'),
(11, 2, 'asdasdasdsdsa', 'asdasdasds232323', 'asdasdas', 'asdasdasd', 'asdasd');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

CREATE TABLE `tbl_user` (
  `tbl_user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_user`
--

INSERT INTO `tbl_user` (`tbl_user_id`, `name`, `phone_number`, `email_address`, `username`, `password`) VALUES
(2, 'Lorem Ipsum', '09123456678', 'loremipsum@gmail.com', 'admin', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_accounts`
--
ALTER TABLE `tbl_accounts`
  ADD PRIMARY KEY (`tbl_account_id`);

--
-- Indexes for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD PRIMARY KEY (`tbl_user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_accounts`
--
ALTER TABLE `tbl_accounts`
  MODIFY `tbl_account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tbl_user`
--
ALTER TABLE `tbl_user`
  MODIFY `tbl_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
