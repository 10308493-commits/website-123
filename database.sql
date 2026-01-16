-- Database Schema for SkyWings
CREATE DATABASE IF NOT EXISTS skywings;
USE skywings;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    membership_level ENUM('Standard', 'Silver', 'Gold', 'Platinum') DEFAULT 'Standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    booking_pnr VARCHAR(10) UNIQUE NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    passengers INT DEFAULT 1,
    travel_class VARCHAR(50) NOT NULL,
    seat_number VARCHAR(10),
    status ENUM('Confirmed', 'Cancelled', 'Completed', 'Checked-in') DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Flights table (for flight status/schedule simulation)
CREATE TABLE IF NOT EXISTS flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    aircraft_type VARCHAR(100),
    status ENUM('Scheduled', 'On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived') DEFAULT 'Scheduled'
);
