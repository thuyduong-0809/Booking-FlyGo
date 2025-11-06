"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface BannerSlide {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

interface HeroBannerCarouselProps {
  slides: BannerSlide[];
  autoPlayInterval?: number; // milliseconds
  showArrows?: boolean;
  height?: string;
  className?: string;
}

const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  slides,
  autoPlayInterval = 5000,
  showArrows = true,
  height = "500px",
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Auto play
  useEffect(() => {
    if (!isHovered && autoPlayInterval > 0) {
      const interval = setInterval(() => {
        goToNext();
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [isHovered, autoPlayInterval, goToNext]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div
      className={`group relative w-full overflow-hidden ${className}`}
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={100}
            />
            
            {/* Overlay gradient for better text readability */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            )}

            {/* Slide content */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-20 left-0 right-0 text-center text-white px-4">
                {slide.title && (
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-lg md:text-xl lg:text-2xl drop-shadow-lg">
                    {slide.subtitle}
                  </p>
                )}
                {slide.link && (
                  <a
                    href={slide.link}
                    className="inline-block mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors duration-300"
                  >
                    Xem chi tiết
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-3 bg-red-500"
                  : "w-3 h-3 bg-white/70 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBannerCarousel;

