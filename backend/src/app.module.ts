import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "db/data-source";
import { AircraftsModule } from "src/aircrafts/aircrafts.module";
import { AirlinesModule } from "src/airlines/airlines.module";
import { AirportsModule } from "src/airports/airports.module";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import { AuthModule } from "src/auth/auth.module";
import { BookingFlightsModule } from "src/booking-flights/booking-flights.module";
import { BookingsModule } from "src/bookings/bookings.module";
import { CheckInsModule } from "src/check-ins/check-ins.module";
import { FareHistoryModule } from "src/fare-history/fare-history.module";
import { FlightsModule } from "src/flights/flights.module";
import { NotificationsModule } from "src/notifications/notifications.module";
import { PassengersModule } from "src/passengers/passengers.module";
import { PaymentsModule } from "src/payments/payments.module";
import { ReviewsModule } from "src/reviews/reviews.module";
import { SeatAllocationsModule } from "src/seat-allocations/seat-allocations.module";
import { SeatsModule } from "src/seats/seats.module";
import { TerminalsModule } from "src/terminals/terminals.module";
import { UserRolesModule } from "src/user-roles/user-roles.module";
import { UsersModule } from "src/users/users.module";



@Module({
  imports: [ TypeOrmModule.forRoot(dataSourceOptions), UsersModule,ConfigModule.forRoot(), AuthModule, UserRolesModule, AirlinesModule, AirportsModule, TerminalsModule, AircraftsModule, FlightsModule, BookingsModule, BookingFlightsModule, PassengersModule, SeatsModule, SeatAllocationsModule, PaymentsModule, CheckInsModule, FareHistoryModule, NotificationsModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
