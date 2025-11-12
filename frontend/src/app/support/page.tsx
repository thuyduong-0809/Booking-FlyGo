"use client";

import Link from "next/link";

const afterFlightServices = [
    {
        title: "Happy Return (tìm kiếm vật phẩm bỏ quên)",
        href: "#happy-return",
        icon: "",
    },
    {
        title: "Xác nhận thông tin hành trình bay",
        href: "#confirm-itinerary",
        icon: "",
    },
];

const refundServices = [
    {
        title: "Phiếu yêu cầu hoàn vé",
        href: "#refund-request",
        icon: "",
    },
    {
        title: "Phiếu yêu cầu sử dụng tiền bảo lưu",
        href: "#voucher-request",
        icon: "",
    },
    {
        title: "Tra cứu phiếu yêu cầu hoàn vé",
        href: "#refund-lookup",
        icon: "",
    },
    {
        title: "Tra cứu phiếu yêu cầu sử dụng tiền bảo lưu",
        href: "#voucher-lookup",
        icon: "",
    },
];

const faqItems = [
    { title: "Đặt chỗ mua vé", href: "#book-ticket" },
    { title: "Đặt vé trực tuyến", href: "#online-booking" },
    { title: "Thanh toán", href: "#payment" },
    { title: "Liên hệ", href: "#contact" },
    { title: "Chậm huỷ chuyến", href: "#delay-cancel" },
    { title: "Dịch vụ hỗ trợ đặc biệt", href: "#special-service" },
    { title: "Dịch vụ Business/SkyBoss", href: "#skyboss" },
    { title: "Trên chuyến bay", href: "#on-board" },
    { title: "Thủ tục chuyến bay", href: "#check-in" },
    { title: "Hành lý", href: "#baggage" },
    { title: "Dịch vụ bổ sung", href: "#extra-service" },
    { title: "FAQs - Nối chuyến", href: "#transfer" },
    { title: "FAQs travel safe", href: "#travel-safe" },
    { title: "FAQs - Perth/Adelaide", href: "#perth-adelaide" },
    { title: "FAQs – Bảo hiểm Du lịch Sky Care", href: "#sky-care" },
    { title: "Ngoại tệ", href: "#currency" },
];

const bookingAgents = [
    {
        title: "Tổng đài bán vé",
        description: "1900 1800 (24/7)",
    },
    {
        title: "Phòng bán vé",
        description: "Số 123, đường Bay Cao, Q. Bình Thạnh, TP.HCM",
    },
    {
        title: "Thông tin đăng kí làm khách hàng Doanh nghiệp",
        description: "sales@flygo.vn",
    },
];

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12 space-y-12">
                <div className="space-y-2">
                    <nav className="text-sm text-gray-500">
                        <Link href="/" className="hover:text-blue-600 text-md dark:text-gray-300">
                            Trang chủ
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-700 text-md font-semibold dark:text-gray-300">Trung tâm hỗ trợ</span>
                    </nav>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Trung tâm hỗ trợ FlyGo
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Chọn vấn đề bạn đang gặp phải hoặc gửi yêu cầu để chúng tôi hỗ trợ nhanh nhất.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <CategoryCard title="Dịch vụ hỗ trợ sau chuyến bay" items={afterFlightServices} />
                        <CategoryCard title="Hoàn tiền/sử dụng tiền bảo lưu" items={refundServices} highlight />
                    </div>

                    <div className="lg:col-span-2">
                        <FAQGrid />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Đại lý đặt vé
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {bookingAgents.map((agent, index) => (
                            <div
                                key={index}
                                className="bg-white/80 dark:bg-slate-800 border border-white/70 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {agent.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 whitespace-pre-line">
                                    {agent.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CategoryCardProps {
    title: string;
    items: { title: string; href: string; icon: string }[];
    highlight?: boolean;
}

function CategoryCard({ title, items, highlight }: CategoryCardProps) {
    return (
        <div
            className={`rounded-3xl border shadow-lg p-6 space-y-4 bg-white/85 dark:bg-slate-800 dark:border-slate-700 ${highlight ? "border-red-200" : "border-white/60"
                }`}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                {highlight && <span className="w-1/4 h-1 bg-red-400 rounded-full"></span>}
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition"
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{item.title}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

function FAQGrid() {
    return (
        <div className="bg-white/85 dark:bg-slate-800 rounded-3xl shadow-xl border border-white/70 dark:border-slate-700 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Câu hỏi thường gặp
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {faqItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-white text-xl">
                            {getIcon(index)}
                        </div>
                        <span className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {item.title}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}

function getIcon(index: number) {
    const icons = [
        "🎫",
        "🖥️",
        "💳",
        "☎️",
        "⏱️",
        "🧑‍🦽",
        "✈️",
        "🛩️",
        "🛃",
        "🧳",
        "➕",
        "🔁",
        "🛡️",
        "🇦🇺",
        "🩺",
        "💱",
    ];
    return icons[index % icons.length];
}
