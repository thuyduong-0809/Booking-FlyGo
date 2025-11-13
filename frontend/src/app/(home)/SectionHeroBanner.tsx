"use client";

import React from "react";
import HeroBannerCarousel from "@/components/HeroBannerCarousel";

const BANNER_SLIDES = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "12h rồi FlyGo thôi!",
    subtitle: "Áp dụng tất cả đường bay nội địa & quốc tế - Vé chỉ từ 0Đ",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/1309644/pexels-photo-1309644.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Khám Phá Thế Giới",
    subtitle: "Bay đến hơn 100 điểm đến trên toàn cầu với giá ưu đãi",
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Vé Tết 2026",
    subtitle: "Đặt vé sớm - Giá siêu hời - Bay an tâm về nhà",
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Du Lịch Mùa Hè",
    subtitle: "Khuyến mãi lên đến 50% cho tất cả các chuyến bay nội địa",
  },
  {
    id: 5,
    image: "https://images.pexels.com/photos/3278364/pexels-photo-3278364.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Trải Nghiệm Sang Trọng",
    subtitle: "Nâng cấp hạng ghế với giá ưu đãi - Tận hưởng dịch vụ cao cấp",
  },
];

export interface SectionHeroBannerProps {
  className?: string;
  height?: string;
}

const SectionHeroBanner: React.FC<SectionHeroBannerProps> = ({
  className = "",
  height = "500px"
}) => {
  return (
    <div className={`nc-SectionHeroBanner ${className}`}>
      <HeroBannerCarousel
        slides={BANNER_SLIDES}
        autoPlayInterval={5000}
        showArrows={true}
        height={height}
      />
    </div>
  );
};

export default SectionHeroBanner;

