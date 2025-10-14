import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt vé máy bay - FlyGo",
  description: "Đặt vé máy bay trực tuyến với FlyGo - Dịch vụ đặt vé uy tín và tiện lợi",
};

export default function BookPlaneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
