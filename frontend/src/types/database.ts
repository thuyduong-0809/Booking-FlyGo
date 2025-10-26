// Database Types based on ERD
export interface User {
  UserID: number;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  DateOfBirth: string;
  PassportNumber: string;
  PassportExpiry: string;
  RoleID: number;
  LoyaltyTier: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
  LoyaltyPoints: number;
  IsActive: boolean;
  CreatedAt: string;
  LastLogin: string;
}

export interface UserRole {
  RoleID: number;
  RoleName: string;
  Description: string;
  CreateAt: string;
}

export interface Aircraft {
  AircraftID: number;
  AircraftCode: string;
  Model: string;
  AirlineID: number;
  EconomyCapacity: number;
  BusinessCapacity: number;
  FirstClassCapacity: number;
  SeatLayoutJSON: any;
  LastMaintenance: string;
  NextMaintenance: string;
  IsActive: boolean;
}

export interface Airline {
  AirlineID: number;
  AirlineCode: string;
  AirlineName: string;
  LogoURL: string;
  ContactNumber: string;
  Website: string;
  IsActive: boolean;
}

export interface Airport {
  AirportID: number;
  AirportCode: string;
  AirportName: string;
  City: string;
  Country: string;
  Timezone: string;
  Latitude: number;
  Longitude: number;
}

export interface Terminal {
  TerminalID: number;
  AirportID: number;
  TerminalCode: string;
  TerminalName: string;
}

export interface Flight {
  FlightID: number;
  FlightNumber: string;
  AirlineID: number;
  DepartureAirportID: number;
  ArrivalAirportID: number;
  DepartureTerminalID: number;
  ArrivalTerminalID: number;
  DepartureTime: string;
  ArrivalTime: string;
  AircraftID: number;
  Duration: number;
  Status: 'Scheduled' | 'Boarding' | 'Departed' | 'Arrived' | 'Delayed' | 'Canceled';
  EconomyPrice: number;
  BusinessPrice: number;
  FirstClassPrice: number;
  AvailableEconomySeats: number;
  AvailableBusinessSeats: number;
  AvailableFirstClassSeats: number;
}

export interface Seat {
  SeatID: number;
  AircraftID: number;
  SeatNumber: string;
  TravelClass: 'Economy' | 'Business' | 'First';
  Row: number;
  Column: string;
  Status: 'Available' | 'Occupied' | 'Maintenance';
  IsAvailable: boolean;
  Features: any;
}

export interface Booking {
  BookingID: number;
  BookingReference: string;
  UserID: number;
  TotalAmount: number;
  PaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  BookingStatus: 'Reserved' | 'Confirmed' | 'Canceled' | 'Completed';
  ContactEmail: string;
  ContactPhone: string;
  SpecialRequests: string;
  BookedAt: string;
}

export interface Passenger {
  PassengerID: number;
  BookingID: number;
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  PassportNumber: string;
  PassengerType: 'Adult' | 'Child' | 'Infant';
}

export interface BookingFlight {
  BookingFlightID: number;
  BookingID: number;
  FlightID: number;
  TravelClass: 'Economy' | 'Business' | 'First';
  Fare: number;
  SeatNumber: string;
  BaggageAllowance: number;
}

export interface CheckIn {
  CheckinID: number;
  BookingFlightID: number;
  PassengerID: number;
  CheckinType: 'Online' | 'Airport';
  CheckedInAt: string;
  BoardingPassURL: string;
  BaggageCount: number;
  BaggageWeight: number;
  BoardingStatus: 'NotBoarded' | 'Boarded' | 'GateClosed';
}

export interface SeatAllocation {
  AllocationID: number;
  BookingFlightID: number;
  SeatID: number;
  PassengerID: number;
}

export interface Payment {
  PaymentID: number;
  BookingID: number;
  Amount: number;
  PaymentMethod: 'CreditCard' | 'DebitCard' | 'PayPal' | 'BankTransfer' | 'MoMo';
  PaymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  TransactionID: string;
  PaymentDetails: any;
  PaidAt: string;
}

export interface FareHistory {
  FareHistoryID: number;
  FlightID: number;
  TravelClass: 'Economy' | 'Business' | 'First';
  OldPrice: number;
  NewPrice: number;
  ChangedAt: string;
  ChangedBy: number;
  Reason: string;
}

export interface Review {
  ReviewID: number;
  BookingID: number;
  UserID: number;
  FlightID: number;
  Rating: number;
  Comment: string;
  ReviewDate: string;
  IsApproved: boolean;
}

export interface Notification {
  NotificationID: number;
  UserID: number;
  Title: string;
  Message: string;
  Type: 'Booking' | 'Flight' | 'Payment' | 'System';
  IsRead: boolean;
  CreatedAt: string;
  RelatedID: number;
}

// Extended types with relationships
export interface FlightWithDetails extends Flight {
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTerminal: Terminal;
  arrivalTerminal: Terminal;
  aircraft: Aircraft;
}

export interface BookingWithDetails extends Booking {
  user: User;
  passengers: Passenger[];
  bookingFlights: BookingFlightWithDetails[];
  payments: Payment[];
}

export interface BookingFlightWithDetails extends BookingFlight {
  flight: FlightWithDetails;
  checkIns: CheckIn[];
  seatAllocations: SeatAllocationWithDetails[];
}

export interface SeatAllocationWithDetails extends SeatAllocation {
  seat: Seat;
  passenger: Passenger;
}

// Dashboard specific types
export interface DashboardStats {
  totalFlightsToday: number;
  totalBookings: number;
  monthlyRevenue: number;
  loadFactor: number;
}

export interface RecentFlight {
  flightNumber: string;
  route: string;
  time: string;
  status: string;
  passengers: number;
  statusColor: string;
}

export interface PopularRoute {
  route: string;
  bookings: number;
  revenue: string;
}

// Maintenance types
export interface Maintenance {
  id: number;
  aircraftID: number;
  aircraftName: string;
  type: 'Scheduled' | 'Unscheduled' | 'Emergency';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  technician: string;
  duration: number;
}
