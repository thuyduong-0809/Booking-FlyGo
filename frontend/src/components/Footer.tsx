"use client";

import Logo from "@/shared/Logo";
import SocialsList1 from "@/shared/SocialsList1";
import { CustomLink } from "@/data/types";
import React from "react";
import FooterNav from "./FooterNav";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: "1",
    title: "Về chúng tôi",
    menus: [
      { href: "/gioi-thieu", label: "Giới thiệu" },
      { href: "/lien-he", label: "Liên hệ" },
      { href: "/tuyen-dung", label: "Tuyển dụng" },
      { href: "/blog", label: "Blog" },
      { href: "/doi-tac", label: "Đối tác" },
    ],
  },
  {
    id: "2",
    title: "Hỗ trợ khách hàng",
    menus: [
      { href: "/faq", label: "Câu hỏi thường gặp" },
      { href: "/huong-dan-dat-ve", label: "Hướng dẫn đặt vé" },
      { href: "/chinh-sach-hoan-ve", label: "Chính sách hoàn vé" },
      { href: "/ho-tro", label: "Liên hệ hỗ trợ" },
      { href: "/khuyen-mai", label: "Khuyến mãi" },
    ],
  },
  {
    id: "3",
    title: "Dịch vụ",
    menus: [
      { href: "/ve-noi-dia", label: "Vé máy bay nội địa" },
      { href: "/ve-quoc-te", label: "Vé máy bay quốc tế" },
      { href: "/khach-san", label: "Đặt phòng khách sạn" },
      { href: "/tour", label: "Tour du lịch" },
      { href: "/dua-don-san-bay", label: "Đưa đón sân bay" },
    ],
  },
  {
    id: "4",
    title: "Thông tin hữu ích",
    menus: [
      { href: "/dieu-khoan", label: "Điều khoản & Điều kiện" },
      { href: "/bao-mat", label: "Chính sách bảo mật" },
      { href: "/thanh-toan", label: "Hướng dẫn thanh toán" },
      { href: "/kinh-nghiem-du-lich", label: "Kinh nghiệm du lịch" },
      { href: "/lien-he-khan", label: "Liên hệ khẩn cấp" },
    ],
  },
];

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <FooterNav />
      <div className="nc-Footer relative py-24 lg:py-28 border-t border-neutral-200 dark:border-neutral-700">
        <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
          {/* Logo + Social */}
          <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:col-span-1 lg:flex lg:flex-col">
            <div className="col-span-2 md:col-span-1">
              <Logo />
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <SocialsList1 className="flex items-center space-x-3 lg:space-x-0 lg:flex-col lg:space-y-2.5 lg:items-start" />
            </div>
          </div>
          {/* Menu */}
          {widgetMenus.map(renderWidgetMenuItem)}
        </div>
      </div>
    </>
  );
};

export default Footer;
