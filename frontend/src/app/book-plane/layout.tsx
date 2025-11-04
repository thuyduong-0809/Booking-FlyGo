import { Metadata } from "next";
import { BookingProvider } from "./BookingContext";
import { NotificationProvider, NotificationContainer } from "@/components/Notification";

export const metadata: Metadata = {
  title: "Đặt vé máy bay - FlyGo",
  description: "Đặt vé máy bay trực tuyến với FlyGo - Dịch vụ đặt vé uy tín và tiện lợi",
};

export default function BookPlaneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </BookingProvider>
  );
}
