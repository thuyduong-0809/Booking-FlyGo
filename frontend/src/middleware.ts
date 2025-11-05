import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  // Nếu không có token → về login
  if (!token) {
    const { pathname } = req.nextUrl;
    if (pathname !== "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Nếu vào trang chủ thì cho phép truy cập không cần token
    return NextResponse.next();
  }

  try {
    //  Xác thực token (chỉ decode sẽ không phát hiện token hết hạn)
    const decoded: any = jwt.decode(token); // Dùng decode để tránh lỗi Edge runtime
    if (!decoded) throw new Error("Invalid token");

    const { pathname } = req.nextUrl;
    const role = decoded.role;

    // console.log("ROLE:", role, "| PATH:", pathname);

    //  ADMIN hoặc AGENT không được vào trang /
    if (pathname === "/" && (role === "SystemAdmin" || role === "BookingAgent" || role === "FlightManager" || role === "CheckInStaff" || role === "AirlinePartner")) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // PASSENGER không được vào dashboard
    if (pathname.startsWith("/dashboard") && role === "Passenger") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Cho phép request tiếp tục
    return NextResponse.next();
  } catch (error) {
    console.error("Token error:", error);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

// ⚙️ Middleware áp dụng cho các route cụ thể
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
