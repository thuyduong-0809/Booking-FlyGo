"use client";

import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import bannerDiscount20 from "@/images/test.png";
import bannerDutyFree from "@/images/test.png";
import bannerFlyGoPremium from "@/images/test.png";
import bannerHero from "@/images/test.png";
import backgroundImage from "@/images/travelhero2.png";

export interface SectionPromotionalBannersProps {
    className?: string;
}

const MAIN_BANNER = {
    id: 1,
    image: bannerHero,
    alt: "Ưu đãi vé máy bay - Từ Hà Nội, Đà Nẵng, TP.HCM đến các điểm đến quốc tế",
    link: "#",
};

const FLIGHT_DEALS = [
    {
        id: 1,
        from: "Hà Nội",
        to: "Melbourne",
        price: "80,000",
        link: "#",
    },
    {
        id: 2,
        from: "Hà Nội",
        to: "Sydney",
        price: "480,000",
        link: "#",
    },
    {
        id: 3,
        from: "Đà Nẵng",
        to: "Ahmedabad",
        price: "450,000",
        link: "#",
    },
    {
        id: 4,
        from: "Tp. Hồ Chí Minh",
        to: "Bắc Kinh",
        price: "390,000",
        link: "#",
    },
    {
        id: 5,
        from: "Hà Nội",
        to: "Quảng Châu",
        price: "120,000",
        link: "#",
    },
];

const PROMOTIONAL_BANNERS = [
    {
        id: 1,
        image: bannerDiscount20,
        alt: "Giảm giá 20% vé máy bay hôm nay - FlyGo",
        link: "#",
        tabTitle: "Bảo hiểm",
        mainText: "CHỌN MUA VÉ VIETJET, ĐÃ BAO GỒM BẢO HIỂM SKY CARE(*)",
        buttonText: "Xem ngay",
        buttonColor: "bg-yellow-400 hover:bg-yellow-500",
        description: {
            title: "An tâm trọn vẹn bay cùng Vietjet",
            points: [
                "Các chương trình bảo hiểm hấp dẫn đến từ các đối tác bảo hiểm uy tín của Vietjet",
                "Thủ tục mua và bồi thường đơn giản, nhanh chóng",
            ],
        },
    },
    {
        id: 2,
        image: bannerDutyFree,
        alt: "Duty Free - Yêu hàng hiệu - Ưu đãi lên đến 30%",
        link: "#",
        tabTitle: "Gửi hàng nhanh",
        mainText: "Vận chuyển Bắc - Trung - Nam siêu tốc, siêu tiện lợi",
        buttonText: "Mua ngay",
        buttonColor: "bg-yellow-400 hover:bg-yellow-500",
        description: {
            title: "SWIFT247 - Gửi hàng nhanh 24/7",
            points: [
                "Rút ngắn khoảng cách hàng nghìn km trong thời gian ngắn nhất",
                "Đặt đơn, gửi và nhận hàng 24/7",
            ],
        },
    },
    {
        id: 3,
        image: bannerFlyGoPremium,
        alt: "FlyGo Premium - Bay đẳng cấp FlyGo giá chỉ ECO",
        link: "#",
        tabTitle: "Bay cùng thẻ FlyGo",
        mainText: "« BỘ ĐÔI » FlyGo và Đối tác Hoàn 500.000",
        buttonText: "Đăng ký ngay",
        buttonColor: "bg-yellow-400 hover:bg-yellow-500",
        description: {
            title: "Ưu đãi dành cho chủ thẻ mới",
            points: [
                "Ưu tiên check-in tại sân bay dành cho hạng thẻ Platinum",
                "Giảm đến 50% mua sắm, du lịch, ăn uống",
            ],
        },
    },
];

const SectionPromotionalBanners: FC<SectionPromotionalBannersProps> = ({
    className = "",
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentSlide((prev) => (prev === 0 ? 0 : prev - 1));
    }, []);

    const goToNext = useCallback(() => {
        setCurrentSlide((prev) => (prev === 0 ? 0 : prev + 1));
    }, []);

    return (
        <div
            ref={sectionRef}
            className={`nc-SectionPromotionalBanners relative overflow-hidden bg-gradient-to-b from-sky-100 via-blue-50 to-neutral-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950 ${className}`}
        >
            {/* Flight Deals Speech Bubbles Section - Full Width */}
            <div
                className={`relative w-full mb-8 lg:mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="relative w-full overflow-hidden">
                    {/* Background Image - Full Width */}
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src={backgroundImage}
                            alt="Flight deals background"
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                            quality={90}
                        />
                        {/* Modern Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-blue-800/50 to-sky-700/60"></div>
                        {/* Depth Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
                        {/* Light Accent */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent"></div>
                    </div>

                    {/* Content Container - Centered with max-width */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                        {/* Flight Deals Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                            {FLIGHT_DEALS.map((deal, index) => {
                                const delay = index * 80;
                                return (
                                    <a
                                        key={deal.id}
                                        href={deal.link}
                                        className="group relative mb-4"
                                        style={{
                                            transitionDelay: isVisible ? `${delay}ms` : "0ms",
                                        }}
                                    >
                                        <div
                                            className={`relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl hover:shadow-2xl hover:shadow-yellow-500/60 transition-all duration-500 transform hover:scale-110 hover:-translate-y-3 border-2 border-white/90 backdrop-blur-md ${isVisible
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-6"
                                                }`}
                                            style={{
                                                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                                            }}
                                        >
                                            {/* Enhanced Glossy Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-2xl sm:rounded-3xl pointer-events-none"></div>

                                            {/* Animated Shine on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 -translate-x-full group-hover:translate-x-full group-hover:transition-transform group-hover:duration-1000"></div>

                                            {/* Inner Shadow for Depth */}
                                            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-t from-black/12 via-transparent to-transparent pointer-events-none"></div>

                                            {/* Subtle Inner Glow */}
                                            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-300/20 via-transparent to-orange-600/20 pointer-events-none"></div>

                                            {/* Content */}
                                            <div className="relative z-10 text-center space-y-1.5 sm:space-y-2">
                                                {/* From City */}
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-medium text-neutral-800/90 mb-0.5">
                                                        Từ
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-bold text-red-600 leading-tight">
                                                        {deal.from}
                                                    </p>
                                                </div>

                                                {/* Price */}
                                                <div className="py-1 sm:py-1.5">
                                                    <p className="text-[10px] sm:text-xs font-medium text-orange-800/90 mb-0.5">
                                                        Chỉ từ
                                                    </p>
                                                    <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-red-600 leading-tight drop-shadow-sm">
                                                        {deal.price}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs font-semibold text-neutral-800 mt-0.5">
                                                        VND
                                                    </p>
                                                </div>

                                                {/* To City */}
                                                <div className="pt-1 sm:pt-1.5 border-t border-orange-600/30">
                                                    <p className="text-[10px] sm:text-xs font-medium text-neutral-800/90 mb-0.5">
                                                        Đến
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-bold text-red-600 leading-tight">
                                                        {deal.to}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Speech Bubble Tail - Pointing Down with Enhanced Design */}
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-0 group-hover:scale-110 transition-transform duration-300">
                                                <svg
                                                    width="20"
                                                    height="12"
                                                    viewBox="0 0 20 12"
                                                    fill="none"
                                                    className="drop-shadow-lg"
                                                >
                                                    <path
                                                        d="M10 12L0 0H20L10 12Z"
                                                        fill="#f97316"
                                                        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" }}
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Main Hero Banner */}
                <div
                    className={`mb-8 lg:mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
                        <div className="relative aspect-[21/9] sm:aspect-[16/7] lg:aspect-[21/8] w-full">
                            <a href={MAIN_BANNER.link} className="block w-full h-full relative">
                                <Image
                                    src={MAIN_BANNER.image}
                                    alt={MAIN_BANNER.alt}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px"
                                    priority
                                    quality={95}
                                />
                                {/* Navigation Arrows */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goToPrevious();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-neutral-800 rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        goToNext();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-neutral-800 rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110"
                                    aria-label="Next slide"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Three Promotional Banners */}
                <div
                    className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                        }`}
                >
                    {PROMOTIONAL_BANNERS.map((banner, index) => {
                        const delay = index * 150;
                        return (
                            <div
                                key={banner.id}
                                className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-neutral-200 dark:border-neutral-800"
                                style={{
                                    transitionDelay: isVisible ? `${delay}ms` : "0ms",
                                }}
                            >
                                {/* Tab Title */}
                                <div className="bg-red-600 text-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide">
                                    {banner.tabTitle}
                                </div>

                                {/* Banner Image */}
                                <a href={banner.link} className="block relative">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-900">
                                        <Image
                                            src={banner.image}
                                            alt={banner.alt}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                            quality={90}
                                        />
                                        {/* Overlay for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                        {/* Main Text Overlay */}
                                        <div className="absolute inset-0 flex flex-col justify-center items-center p-4 sm:p-6 text-center">
                                            <p className="text-white text-sm sm:text-base font-bold mb-4 drop-shadow-lg leading-tight">
                                                {banner.mainText}
                                            </p>
                                            <button
                                                className={`${banner.buttonColor} text-neutral-900 px-6 py-2.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.location.href = banner.link;
                                                }}
                                            >
                                                {banner.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </a>

                                {/* Description Section */}
                                <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900">
                                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-3">
                                        {banner.description.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {banner.description.points.map((point, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400"
                                            >
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SectionPromotionalBanners;
