import { MigrationInterface, QueryRunner } from "typeorm";

export class Initdatabase1759597393000 implements MigrationInterface {
    name = 'Initdatabase1759597393000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Terminals\` (\`terminalId\` int NOT NULL AUTO_INCREMENT, \`terminalCode\` varchar(10) NOT NULL, \`terminalName\` varchar(100) NULL, \`airportAirportId\` int NULL, PRIMARY KEY (\`terminalId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Airports\` (\`airportId\` int NOT NULL AUTO_INCREMENT, \`airportCode\` varchar(3) NOT NULL, \`airportName\` varchar(100) NOT NULL, \`city\` varchar(100) NOT NULL, \`country\` varchar(100) NOT NULL, \`timezone\` varchar(50) NULL, \`latitude\` decimal(10,8) NULL, \`longitude\` decimal(11,8) NULL, UNIQUE INDEX \`IDX_d240264be44244a5272539c2f4\` (\`airportCode\`), PRIMARY KEY (\`airportId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`FareHistory\` (\`fareHistoryId\` int NOT NULL AUTO_INCREMENT, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`oldPrice\` decimal(10,2) NOT NULL, \`newPrice\` decimal(10,2) NOT NULL, \`changedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reason\` text NULL, \`flightFlightId\` int NULL, \`changedByUserId\` int NULL, PRIMARY KEY (\`fareHistoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Reviews\` (\`reviewId\` int NOT NULL AUTO_INCREMENT, \`rating\` int NOT NULL, \`comment\` text NULL, \`reviewDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isApproved\` tinyint NOT NULL DEFAULT 0, \`bookingBookingId\` int NULL, \`userUserId\` int NULL, \`flightFlightId\` int NULL, PRIMARY KEY (\`reviewId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Flights\` (\`flightId\` int NOT NULL AUTO_INCREMENT, \`flightNumber\` varchar(10) NOT NULL, \`departureTime\` datetime NOT NULL, \`arrivalTime\` datetime NOT NULL, \`duration\` int NOT NULL, \`status\` enum ('Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled') NOT NULL DEFAULT 'Scheduled', \`economyPrice\` decimal(10,2) NOT NULL, \`businessPrice\` decimal(10,2) NOT NULL, \`firstClassPrice\` decimal(10,2) NOT NULL, \`availableEconomySeats\` int NOT NULL, \`availableBusinessSeats\` int NOT NULL, \`availableFirstClassSeats\` int NOT NULL, \`airlineAirlineId\` int NULL, \`departureAirportAirportId\` int NULL, \`arrivalAirportAirportId\` int NULL, \`departureTerminalTerminalId\` int NULL, \`arrivalTerminalTerminalId\` int NULL, \`aircraftAircraftId\` int NULL, PRIMARY KEY (\`flightId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Airlines\` (\`airlineId\` int NOT NULL AUTO_INCREMENT, \`airlineCode\` varchar(3) NOT NULL, \`airlineName\` varchar(100) NOT NULL, \`logoURL\` varchar(255) NULL, \`contactNumber\` varchar(20) NULL, \`website\` varchar(100) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_fa87bcaa821a5559e13a79afdb\` (\`airlineCode\`), PRIMARY KEY (\`airlineId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Aircrafts\` (\`aircraftId\` int NOT NULL AUTO_INCREMENT, \`aircraftCode\` varchar(10) NOT NULL, \`model\` varchar(100) NOT NULL, \`economyCapacity\` int NOT NULL DEFAULT '0', \`businessCapacity\` int NOT NULL DEFAULT '0', \`firstClassCapacity\` int NOT NULL DEFAULT '0', \`seatLayoutJSON\` json NULL, \`lastMaintenance\` date NULL, \`nextMaintenance\` date NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`airlineAirlineId\` int NULL, UNIQUE INDEX \`IDX_bb45d52268df51d1160fef6994\` (\`aircraftCode\`), PRIMARY KEY (\`aircraftId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Seats\` (\`seatId\` int NOT NULL AUTO_INCREMENT, \`seatNumber\` varchar(10) NOT NULL, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`isAvailable\` tinyint NOT NULL DEFAULT 1, \`features\` json NULL, \`aircraftAircraftId\` int NULL, UNIQUE INDEX \`IDX_449c23623f441980199aea078e\` (\`aircraftAircraftId\`, \`seatNumber\`), PRIMARY KEY (\`seatId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`SeatAllocations\` (\`allocationId\` int NOT NULL AUTO_INCREMENT, \`bookingFlightBookingFlightId\` int NULL, \`seatSeatId\` int NULL, \`passengerPassengerId\` int NULL, UNIQUE INDEX \`IDX_4c503e7abd388d6f50e597be35\` (\`bookingFlightBookingFlightId\`, \`passengerPassengerId\`), UNIQUE INDEX \`IDX_abdc60324319d761754e53d7ea\` (\`bookingFlightBookingFlightId\`, \`seatSeatId\`), PRIMARY KEY (\`allocationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Passengers\` (\`passengerId\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`dateOfBirth\` date NULL, \`passportNumber\` varchar(50) NULL, \`passengerType\` enum ('Adult', 'Child', 'Infant') NOT NULL DEFAULT 'Adult', \`bookingBookingId\` int NULL, PRIMARY KEY (\`passengerId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`CheckIns\` (\`checkInId\` int NOT NULL AUTO_INCREMENT, \`checkInType\` enum ('Online', 'Airport') NOT NULL, \`checkedInAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`boardingPassUrl\` varchar(255) NULL, \`baggageCount\` int NOT NULL DEFAULT '0', \`baggageWeight\` decimal(5,2) NOT NULL DEFAULT '0.00', \`boardingStatus\` enum ('NotBoarded', 'Boarded', 'GateClosed') NOT NULL DEFAULT 'NotBoarded', \`bookingFlightBookingFlightId\` int NULL, \`passengerPassengerId\` int NULL, PRIMARY KEY (\`checkInId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`BookingFlights\` (\`bookingFlightId\` int NOT NULL AUTO_INCREMENT, \`travelClass\` enum ('Economy', 'Business', 'First') NOT NULL, \`fare\` decimal(10,2) NOT NULL, \`seatNumber\` varchar(10) NULL, \`baggageAllowance\` int NOT NULL DEFAULT '0', \`bookingBookingId\` int NULL, \`flightFlightId\` int NULL, PRIMARY KEY (\`bookingFlightId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Payments\` (\`paymentId\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(12,2) NOT NULL, \`paymentMethod\` enum ('CreditCard', 'DebitCard', 'PayPal', 'BankTransfer') NOT NULL, \`paymentStatus\` enum ('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending', \`transactionId\` varchar(100) NULL, \`paymentDetails\` json NULL, \`paidAt\` datetime NULL, \`bookingBookingId\` int NULL, PRIMARY KEY (\`paymentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Bookings\` (\`bookingId\` int NOT NULL AUTO_INCREMENT, \`bookingReference\` varchar(10) NOT NULL, \`totalAmount\` decimal(12,2) NOT NULL, \`paymentStatus\` enum ('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending', \`bookingStatus\` enum ('Reserved', 'Confirmed', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Reserved', \`contactEmail\` varchar(100) NOT NULL, \`contactPhone\` varchar(20) NOT NULL, \`specialRequests\` text NULL, \`bookedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userUserId\` int NULL, UNIQUE INDEX \`IDX_0759fc177ee2cada2e903af026\` (\`bookingReference\`), PRIMARY KEY (\`bookingId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Notifications\` (\`notificationId\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`type\` enum ('Booking', 'Flight', 'Payment', 'System') NOT NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`relatedId\` int NULL, \`userUserId\` int NULL, PRIMARY KEY (\`notificationId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserRoles\` (\`roleId\` int NOT NULL AUTO_INCREMENT, \`roleName\` varchar(50) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b99aceded41da7ff6504e77da3\` (\`roleName\`), PRIMARY KEY (\`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(100) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`phone\` varchar(20) NULL, \`dateOfBirth\` date NULL, \`passportNumber\` varchar(50) NULL, \`passportExpiry\` date NULL, \`roleId\` int NOT NULL DEFAULT '1', \`loyaltyPoints\` int NOT NULL DEFAULT '0', \`loyaltyTier\` enum ('Standard', 'Silver', 'Gold', 'Platinum') NOT NULL DEFAULT 'Standard', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`lastLogin\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` (\`email\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Terminals\` ADD CONSTRAINT \`FK_3bf4482a2644983d9cab3c784b4\` FOREIGN KEY (\`airportAirportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` ADD CONSTRAINT \`FK_1a4db5158e6934c4987c787aefc\` FOREIGN KEY (\`flightFlightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` ADD CONSTRAINT \`FK_5e0ea8ae9482ce0f132803c31ad\` FOREIGN KEY (\`changedByUserId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_b5583d3a07adb7a64cd35af4172\` FOREIGN KEY (\`bookingBookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_35b43d2205f03bffd6a489f39f3\` FOREIGN KEY (\`userUserId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Reviews\` ADD CONSTRAINT \`FK_bafddae3495e20effc75c610e7c\` FOREIGN KEY (\`flightFlightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_cb0678e110d2276722438e9a2df\` FOREIGN KEY (\`airlineAirlineId\`) REFERENCES \`Airlines\`(\`airlineId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_af74abf6a7416b87fd0ef9010af\` FOREIGN KEY (\`departureAirportAirportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_82354d25668a7bfa6218edbb2b5\` FOREIGN KEY (\`arrivalAirportAirportId\`) REFERENCES \`Airports\`(\`airportId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_d707aa1c4602489833187d9e14e\` FOREIGN KEY (\`departureTerminalTerminalId\`) REFERENCES \`Terminals\`(\`terminalId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_5f8cd2024c0349aa01506d34cb8\` FOREIGN KEY (\`arrivalTerminalTerminalId\`) REFERENCES \`Terminals\`(\`terminalId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD CONSTRAINT \`FK_503a66b93bb463e68a052deacd7\` FOREIGN KEY (\`aircraftAircraftId\`) REFERENCES \`Aircrafts\`(\`aircraftId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Aircrafts\` ADD CONSTRAINT \`FK_5beaf13b1f0d26e35cdd7581aa1\` FOREIGN KEY (\`airlineAirlineId\`) REFERENCES \`Airlines\`(\`airlineId\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Seats\` ADD CONSTRAINT \`FK_9d207f2d58d14dc7c8a824d51c8\` FOREIGN KEY (\`aircraftAircraftId\`) REFERENCES \`Aircrafts\`(\`aircraftId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_8ad2989f6c18cd3cb9de518b856\` FOREIGN KEY (\`bookingFlightBookingFlightId\`) REFERENCES \`BookingFlights\`(\`bookingFlightId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_f8eaf2761d58eca408778f05725\` FOREIGN KEY (\`seatSeatId\`) REFERENCES \`Seats\`(\`seatId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` ADD CONSTRAINT \`FK_fa8a3c6c0e13216042b6cf50c84\` FOREIGN KEY (\`passengerPassengerId\`) REFERENCES \`Passengers\`(\`passengerId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Passengers\` ADD CONSTRAINT \`FK_3d29c1a46e68b7cc19c8a22602b\` FOREIGN KEY (\`bookingBookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` ADD CONSTRAINT \`FK_87fe26d47aa988fd6b34d5b8ad1\` FOREIGN KEY (\`bookingFlightBookingFlightId\`) REFERENCES \`BookingFlights\`(\`bookingFlightId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` ADD CONSTRAINT \`FK_0f898dd1b043d7dea5d5f0fdccb\` FOREIGN KEY (\`passengerPassengerId\`) REFERENCES \`Passengers\`(\`passengerId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` ADD CONSTRAINT \`FK_268783c04fcf8e3b5428d6aced2\` FOREIGN KEY (\`bookingBookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` ADD CONSTRAINT \`FK_08de655faa8d9eaad9c5933881f\` FOREIGN KEY (\`flightFlightId\`) REFERENCES \`Flights\`(\`flightId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Payments\` ADD CONSTRAINT \`FK_90ec77353dc696487ba4b52d89a\` FOREIGN KEY (\`bookingBookingId\`) REFERENCES \`Bookings\`(\`bookingId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Bookings\` ADD CONSTRAINT \`FK_863d2774073de02ce0b75fb26e1\` FOREIGN KEY (\`userUserId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Notifications\` ADD CONSTRAINT \`FK_2f8247063f508baf729646a5c21\` FOREIGN KEY (\`userUserId\`) REFERENCES \`Users\`(\`userId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD CONSTRAINT \`FK_65c56db5a9988b90b0d7245e0f0\` FOREIGN KEY (\`roleId\`) REFERENCES \`UserRoles\`(\`roleId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP FOREIGN KEY \`FK_65c56db5a9988b90b0d7245e0f0\``);
        await queryRunner.query(`ALTER TABLE \`Notifications\` DROP FOREIGN KEY \`FK_2f8247063f508baf729646a5c21\``);
        await queryRunner.query(`ALTER TABLE \`Bookings\` DROP FOREIGN KEY \`FK_863d2774073de02ce0b75fb26e1\``);
        await queryRunner.query(`ALTER TABLE \`Payments\` DROP FOREIGN KEY \`FK_90ec77353dc696487ba4b52d89a\``);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` DROP FOREIGN KEY \`FK_08de655faa8d9eaad9c5933881f\``);
        await queryRunner.query(`ALTER TABLE \`BookingFlights\` DROP FOREIGN KEY \`FK_268783c04fcf8e3b5428d6aced2\``);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` DROP FOREIGN KEY \`FK_0f898dd1b043d7dea5d5f0fdccb\``);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` DROP FOREIGN KEY \`FK_87fe26d47aa988fd6b34d5b8ad1\``);
        await queryRunner.query(`ALTER TABLE \`Passengers\` DROP FOREIGN KEY \`FK_3d29c1a46e68b7cc19c8a22602b\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_fa8a3c6c0e13216042b6cf50c84\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_f8eaf2761d58eca408778f05725\``);
        await queryRunner.query(`ALTER TABLE \`SeatAllocations\` DROP FOREIGN KEY \`FK_8ad2989f6c18cd3cb9de518b856\``);
        await queryRunner.query(`ALTER TABLE \`Seats\` DROP FOREIGN KEY \`FK_9d207f2d58d14dc7c8a824d51c8\``);
        await queryRunner.query(`ALTER TABLE \`Aircrafts\` DROP FOREIGN KEY \`FK_5beaf13b1f0d26e35cdd7581aa1\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_503a66b93bb463e68a052deacd7\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_5f8cd2024c0349aa01506d34cb8\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_d707aa1c4602489833187d9e14e\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_82354d25668a7bfa6218edbb2b5\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_af74abf6a7416b87fd0ef9010af\``);
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP FOREIGN KEY \`FK_cb0678e110d2276722438e9a2df\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_bafddae3495e20effc75c610e7c\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_35b43d2205f03bffd6a489f39f3\``);
        await queryRunner.query(`ALTER TABLE \`Reviews\` DROP FOREIGN KEY \`FK_b5583d3a07adb7a64cd35af4172\``);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` DROP FOREIGN KEY \`FK_5e0ea8ae9482ce0f132803c31ad\``);
        await queryRunner.query(`ALTER TABLE \`FareHistory\` DROP FOREIGN KEY \`FK_1a4db5158e6934c4987c787aefc\``);
        await queryRunner.query(`ALTER TABLE \`Terminals\` DROP FOREIGN KEY \`FK_3bf4482a2644983d9cab3c784b4\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP INDEX \`IDX_b99aceded41da7ff6504e77da3\` ON \`UserRoles\``);
        await queryRunner.query(`DROP TABLE \`UserRoles\``);
        await queryRunner.query(`DROP TABLE \`Notifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_0759fc177ee2cada2e903af026\` ON \`Bookings\``);
        await queryRunner.query(`DROP TABLE \`Bookings\``);
        await queryRunner.query(`DROP TABLE \`Payments\``);
        await queryRunner.query(`DROP TABLE \`BookingFlights\``);
        await queryRunner.query(`DROP TABLE \`CheckIns\``);
        await queryRunner.query(`DROP TABLE \`Passengers\``);
        await queryRunner.query(`DROP INDEX \`IDX_abdc60324319d761754e53d7ea\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c503e7abd388d6f50e597be35\` ON \`SeatAllocations\``);
        await queryRunner.query(`DROP TABLE \`SeatAllocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_449c23623f441980199aea078e\` ON \`Seats\``);
        await queryRunner.query(`DROP TABLE \`Seats\``);
        await queryRunner.query(`DROP INDEX \`IDX_bb45d52268df51d1160fef6994\` ON \`Aircrafts\``);
        await queryRunner.query(`DROP TABLE \`Aircrafts\``);
        await queryRunner.query(`DROP INDEX \`IDX_fa87bcaa821a5559e13a79afdb\` ON \`Airlines\``);
        await queryRunner.query(`DROP TABLE \`Airlines\``);
        await queryRunner.query(`DROP TABLE \`Flights\``);
        await queryRunner.query(`DROP TABLE \`Reviews\``);
        await queryRunner.query(`DROP TABLE \`FareHistory\``);
        await queryRunner.query(`DROP INDEX \`IDX_d240264be44244a5272539c2f4\` ON \`Airports\``);
        await queryRunner.query(`DROP TABLE \`Airports\``);
        await queryRunner.query(`DROP TABLE \`Terminals\``);
    }

}
