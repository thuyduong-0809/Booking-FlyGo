-- Create dedicated CancelHistory table for tracking booking cancellations
CREATE TABLE CancelHistory (
  cancelHistoryId INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Booking information
  bookingId INT NOT NULL,
  bookingReference VARCHAR(10) NOT NULL,
  
  -- Cancellation details
  cancellationFee DECIMAL(12,2) NOT NULL DEFAULT 0,
  refundAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
  totalAmount DECIMAL(12,2) NOT NULL,
  
  -- Reason and metadata
  reason TEXT NULL,
  cancelledAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelledBy INT NULL,
  
  -- Foreign keys
  FOREIGN KEY (bookingId) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
  FOREIGN KEY (cancelledBy) REFERENCES Users(userId) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_cancel_booking_id (bookingId),
  INDEX idx_cancel_booking_ref (bookingReference),
  INDEX idx_cancel_cancelled_at (cancelledAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
