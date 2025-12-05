
ALTER TABLE SeatAllocations 
ADD COLUMN flightSeatId INT NULL AFTER seatId;


UPDATE SeatAllocations sa
INNER JOIN BookingFlights bf ON sa.BookingFlightId = bf.bookingFlightId
INNER JOIN FlightSeats fs ON fs.flightId = bf.flightId AND fs.seatId = sa.seatId
SET sa.flightSeatId = fs.flightSeatId
WHERE sa.flightSeatId IS NULL;


SELECT 
    sa.allocationId,
    sa.BookingFlightId,
    sa.seatId,
    bf.flightId,
    'Missing FlightSeat' as issue
FROM SeatAllocations sa
INNER JOIN BookingFlights bf ON sa.BookingFlightId = bf.bookingFlightId
WHERE sa.flightSeatId IS NULL;


ALTER TABLE SeatAllocations
ADD CONSTRAINT FK_SeatAllocations_FlightSeats 
FOREIGN KEY (flightSeatId) REFERENCES FlightSeats(flightSeatId) 
ON DELETE CASCADE;

ALTER TABLE SeatAllocations 
DROP INDEX bookingFlight;  

ALTER TABLE SeatAllocations 
ADD CONSTRAINT UQ_BookingFlight_FlightSeat 
UNIQUE (BookingFlightId, flightSeatId);

CREATE INDEX IDX_SeatAllocations_FlightSeat ON SeatAllocations(flightSeatId);


