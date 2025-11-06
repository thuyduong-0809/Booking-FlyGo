import { MegamenuItem, NavItemType } from "@/shared/Navigation/NavigationItem";
import ncNanoId from "@/utils/ncNanoId";
import { Route } from "@/routers/types";
import __megamenu from "./jsons/__megamenu.json";

const megaMenuDemo: MegamenuItem[] = [
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Company",
    items: __megamenu.map((i) => ({
      id: ncNanoId(),
      href: "/",
      name: i.Company,
    })),
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "App Name",
    items: __megamenu.map((i) => ({
      id: ncNanoId(),
      href: "/",
      name: i.AppName,
    })),
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/5059013/pexels-photo-5059013.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "City",
    items: __megamenu.map((i) => ({
      id: ncNanoId(),
      href: "/",
      name: i.City,
    })),
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/5159141/pexels-photo-5159141.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Contruction",
    items: __megamenu.map((i) => ({
      id: ncNanoId(),
      href: "/",
      name: i.Contruction,
    })),
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/7473041/pexels-photo-7473041.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Country",
    items: __megamenu.map((i) => ({
      id: ncNanoId(),
      href: "/",
      name: i.Country,
    })),
  },
];

const demoChildMenus: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Xem thông tin chuyến bay",
  },
  {
    id: ncNanoId(),
    href: "/home-2",
    name: "Đặt chuyến bay",
    isNew: true,
  },
];

const otherServicesMegaMenu: MegamenuItem[] = [
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Hỗ trợ khách hàng",
    items: [
      {
        id: ncNanoId(),
        href: "/guest-booking-lookup",
        name: "🔍 Tra cứu vé máy bay",
        isNew: true,
        description: "Tra cứu thông tin đơn hàng chỉ với email hoặc mã đặt chỗ (PNR). Không cần đăng nhập!",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Liên hệ hỗ trợ",
        description: "Đội ngũ chăm sóc khách hàng 24/7 sẵn sàng hỗ trợ bạn",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Câu hỏi thường gặp",
        description: "Tìm câu trả lời cho các thắc mắc phổ biến",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Hướng dẫn đặt vé",
        description: "Hướng dẫn chi tiết từng bước đặt vé máy bay",
      },
    ],
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Thanh toán & Tài chính",
    items: [
      {
        id: ncNanoId(),
        href: "#",
        name: "Bay trước, thanh toán sau",
        isNew: true,
        description: "Mua vé máy bay trả góp với thời hạn cho vay đến 6 tháng",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Mua ngoại tệ",
        isNew: true,
        description: "Tỷ giá hấp dẫn, nhận tiền trong ngày!",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Bảo hiểm du lịch",
        description: "Bảo vệ chuyến đi của bạn với các gói bảo hiểm linh hoạt",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Chính sách hoàn vé",
        description: "Thông tin chi tiết về hoàn hủy và đổi vé",
      },
    ],
  },
];

const flightServicesMegaMenu: MegamenuItem[] = [
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Dịch vụ chuyến bay",
    items: [
      {
        id: ncNanoId(),
        href: "#",
        name: "Mua hành lý, suất ăn, chọn chỗ ngồi...",
        isNew: true,
        description: "Đặt trước những dịch vụ tiện ích để tận hưởng chuyến bay một cách trọn vẹn",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Dịch vụ đặc biệt",
        description: "Vận chuyển thú cưng, trẻ em đi một mình, hỗ trợ thủ tục tại sân bay và hơn thế nữa!",
      },
      
    ],
  },
  {
    id: ncNanoId(),
    image:
      "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    title: "Tiện ích & Ưu đãi",
    items: [
      {
        id: ncNanoId(),
        href: "#",
        name: "Bảo hiểm",
        description: "Thật yên tâm và thoải mái với các chương trình bảo hiểm uy tín đến từ các đối tác bảo hiểm tin cậy của Vietjet",
      },
      {
        id: ncNanoId(),
        href: "#",
        name: "Săn vé giá rẻ",
        isNew: true,
        description: "Nhanh tay săn vé bay Vietjet giá tốt nhất! Tìm kiếm các chặng bay hot nhất!",
      },
      
    ],
  },
];

export const NAVIGATION_DEMO: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Chuyến bay của tôi",
    isNew: true,
  },
  {
    id: ncNanoId(),
    href: "#",
    name: "Online Check-in",
    isNew: true,
  },
  {
    id: ncNanoId(),
    href: "#",
    name: "Dịch vụ chuyến bay",
    type: "megaMenu",
    megaMenu: flightServicesMegaMenu,
  },

  {
    id: ncNanoId(),
    href: "#",
    name: "Dịch vụ khác",
    type: "megaMenu",
    megaMenu: otherServicesMegaMenu,
  },
];

export const NAVIGATION_DEMO_2: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Home",
    type: "dropdown",
    children: demoChildMenus,
    isNew: true,
  },


];
