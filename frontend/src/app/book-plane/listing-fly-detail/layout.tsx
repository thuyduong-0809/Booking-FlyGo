import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt chuyến bay - Flight Booking Detail",
  description: "Chọn ngày và giá vé cho chuyến bay của bạn",
};

export default function ListingFlyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
