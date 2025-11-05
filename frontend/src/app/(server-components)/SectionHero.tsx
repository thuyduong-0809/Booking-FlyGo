import React, { FC } from "react";
import Image from "next/image";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";

export interface SectionHeroProps {
  className?: string;
}

const DESTINATIONS = [
  {
    name: "Hà Nội",
    price: "Giá từ 1.610.000đ",
  },
  {
    name: "Đà Nẵng",
    price: "Giá từ 1.120.000đ",
  },
  {
    name: "Phú Quốc",
    price: "Giá từ 610.000đ",
  },
];

const HERO_IMAGES = [
  {
    src: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
    alt: "Cặp đôi đang kéo vali trên cầu cảng hướng ra biển",
  },
  {
    src: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
    alt: "Khu nghỉ dưỡng trên biển vào lúc hoàng hôn",
  },
  {
    src: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
    alt: "Những căn bungalow trên đồi nhìn ra biển và núi",
  },
];

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
  return (
    <div className={`nc-SectionHero relative ${className}`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_440px] items-start">
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="inline-flex uppercase tracking-[0.35em] text-xs font-semibold text-red-500">
              Mở bán
            </span>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-neutral-900 leading-tight">
              Vé Tết 2026
            </h1>
            <p className="text-lg text-green-600 font-semibold">
              Mua vé sớm, bay siêu tiết kiệm!
            </p>
            <ul className="space-y-2 text-neutral-700 text-base">
              {DESTINATIONS.map((item) => (
                <li key={item.name} className="flex items-start space-x-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500"></span>
                  <p>
                    <span className="font-semibold text-green-700">{item.name}</span>: {item.price}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-400">(*) Điều kiện & điều khoản</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {HERO_IMAGES.map((image, index) => (
              <div
                key={image.src}
                className={`relative overflow-hidden rounded-3xl shadow-lg ${
                  index === 0 ? "col-span-2 sm:col-span-2" : "col-span-1"
                } ${index === 2 ? "sm:row-span-2" : ""}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={720}
                  className="h-full w-full object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <HeroSearchForm variant="heroRed" />
        </div>
      </div>
    </div>
  );
};

export default SectionHero;
