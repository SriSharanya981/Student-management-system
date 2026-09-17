-- =====================================================================
-- EduTrack Pro - Student Management System Database Setup Script
-- =====================================================================
-- NOTE: If you configured 'createDatabaseIfNotExist=true' in 
-- application.properties, Spring Boot and Hibernate will automatically
-- create the database and 'students' table on startup.
-- 
-- You can also run this script directly in MySQL Workbench, phpMyAdmin,
-- or the MySQL Command Line Client to initialize the database and sample data.
-- =====================================================================

-- 1. Create the Database
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- 2. Create the 'students' table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insert Initial Sample Students (Optional - Spring Boot also seeds these on startup if table is empty)
INSERT INTO students (student_id, name, department, academic_year, email, phone)
VALUES 
    ('STU-1001', 'Rahul Kumar', 'CSE', '1st Year', 'rahul@gmail.com', '9876543210'),
    ('STU-1002', 'Priya Sharma', 'CSBS', '2nd Year', 'priya@gmail.com', '9823456781'),
    ('STU-1003', 'Arun Kumar', 'IT', '3rd Year', 'arun@gmail.com', '9765432109')
ON DUPLICATE KEY UPDATE student_id=student_id;

-- 4. Verify Records
SELECT * FROM students;
