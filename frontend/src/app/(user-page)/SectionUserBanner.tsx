"use client";

import React from "react";
import HeroBannerCarousel from "@/components/HeroBannerCarousel";

const USER_BANNER_SLIDES = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Quản Lý Tài Khoản",
    subtitle: "Cập nhật thông tin và quản lý đặt chỗ của bạn",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Ưu Đãi Độc Quyền",
    subtitle: "Nhận ngay voucher giảm giá cho chuyến bay tiếp theo",
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Tích Điểm - Đổi Quà",
    subtitle: "Bay càng nhiều - Tích điểm càng nhiều - Nhận quà hấp dẫn",
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Lịch Sử Chuyến Bay",
    subtitle: "Xem lại tất cả các chuyến bay đã đặt",
  },
];

export interface SectionUserBannerProps {
  className?: string;
  height?: string;
}

const SectionUserBanner: React.FC<SectionUserBannerProps> = ({ 
  className = "",
  height = "300px"
}) => {
  return (
    <div className={`nc-SectionUserBanner ${className}`}>
      <HeroBannerCarousel 
        slides={USER_BANNER_SLIDES} 
        autoPlayInterval={4000}
        showArrows={false}
        height={height}
      />
    </div>
  );
};

export default SectionUserBanner;

