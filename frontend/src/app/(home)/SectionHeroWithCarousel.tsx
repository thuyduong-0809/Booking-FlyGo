"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import HeroSearchForm from "@/app/(client-components)/(HeroSearchForm)/HeroSearchForm";

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

const HERO_BACKGROUNDS = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Tropical resort with palm trees and pool",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/1309644/pexels-photo-1309644.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Beach resort at sunset",
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Mountain landscape",
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Tropical island",
  },
  {
    id: 5,
    image: "https://images.pexels.com/photos/3278364/pexels-photo-3278364.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Luxury resort",
  },
];

export interface SectionHeroWithCarouselProps {
  className?: string;
}

const SectionHeroWithCarousel: React.FC<SectionHeroWithCarouselProps> = ({
  className = ""
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto play
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === HERO_BACKGROUNDS.length - 1 ? 0 : prev + 1));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div
      className={`nc-SectionHeroWithCarousel relative md:-mt-[80px] lg:mt-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Carousel */}
      <div className="absolute inset-0 overflow-hidden">
        {HERO_BACKGROUNDS.map((bg, index) => (
          <div
            key={bg.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={bg.image}
              alt={bg.alt}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
            />
          </div>
        ))}
        {/* Overlay để làm tối ảnh nền, giúp text dễ đọc hơn */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 pt-4 sm:pt-6 md:pt-24 pb-8 sm:pb-12 md:pb-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_500px] xl:grid-cols-[minmax(0,1fr)_550px] items-center">
          {/* Left Content - Text */}
          <div className="space-y-6 text-white">
            <div className="space-y-4">
              <span className="inline-flex uppercase tracking-[0.35em] text-xs font-semibold bg-red-500 text-white px-4 py-2 rounded-full">
                Mở bán
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight drop-shadow-lg">
                Vé Tết 2026
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-green-300 drop-shadow-lg">
                Mua vé sớm, bay siêu tiết kiệm!
              </p>
              <ul className="space-y-2 text-base sm:text-lg">
                {DESTINATIONS.map((item) => (
                  <li key={item.name} className="flex items-start space-x-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></span>
                    <p className="drop-shadow-lg">
                      <span className="font-semibold">{item.name}</span>: {item.price}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/80 drop-shadow-lg">(*) Điều kiện & điều khoản</p>
            </div>

            {/* Small Images Grid - Hiển thị trên desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-3 max-w-md">
              {HERO_BACKGROUNDS.slice(0, 3).map((image, index) => (
                <div
                  key={image.id}
                  className="relative h-24 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-white transition-all"
                  onClick={() => goToSlide(index)}
                >
                  <Image
                    src={image.image}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Search Form */}
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-1">
              <HeroSearchForm variant="heroRed" />
            </div>
          </div>
        </div>

        {/* Dot Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {HERO_BACKGROUNDS.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionHeroWithCarousel;

