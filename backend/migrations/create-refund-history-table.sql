-- Migration: Create RefundHistory table
-- Date: 2025-12-11

CREATE TABLE RefundHistory (
    refundHistoryId INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    bookingReference VARCHAR(10) NOT NULL,
    refundReason ENUM(
        'AIRLINE_SCHEDULE_CHANGE',
        'CUSTOMER_CANCELLATION',
        'WRONG_INFORMATION',
        'PAYMENT_ERROR',
        'HEALTH_ISSUE',
        'OTHER'
    ) NOT NULL,
    refundAmount DECIMAL(12, 2) NOT NULL,
    passengerName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    documents TEXT NULL COMMENT 'JSON string array of document URLs/names',
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    processedAt DATETIME NULL,
    processedBy INT NULL,
    adminNotes TEXT NULL,
    
    FOREIGN KEY (bookingId) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
    FOREIGN KEY (processedBy) REFERENCES Users(userId) ON DELETE SET NULL,
    
    INDEX idx_booking (bookingId),
    INDEX idx_status (status),
    INDEX idx_requested_at (requestedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments
ALTER TABLE RefundHistory 
COMMENT = 'Tracks refund requests for cancelled bookings';
