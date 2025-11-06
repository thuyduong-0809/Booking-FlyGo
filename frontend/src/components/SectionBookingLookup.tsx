import React, { FC } from "react";
import { useRouter } from "next/navigation";

export interface SectionBookingLookupProps {
  className?: string;
}

const SectionBookingLookup: FC<SectionBookingLookupProps> = ({ className = "" }) => {
  const router = useRouter();

  return (
    <div
      className={`nc-SectionBookingLookup relative py-16 ${className}`}
      data-nc-id="SectionBookingLookup"
    >
      <div className="container">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            {/* Left side - Content */}
            <div className="p-8 lg:p-12 text-white">
              <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                ✨ Tiện ích mới
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                🔍 Tra Cứu Vé Máy Bay
              </h2>
              
              <p className="text-lg text-blue-50 mb-6 leading-relaxed">
                <strong className="text-white">Không cần đăng nhập!</strong> Tra cứu nhanh chóng thông tin đơn hàng của bạn chỉ với:
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-blue-50">
                    <span className="font-semibold text-white">Email</span> - Địa chỉ email đã dùng khi đặt vé
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-blue-50">
                    <span className="font-semibold text-white">Mã đặt chỗ (PNR)</span> - Hoặc bỏ trống nếu quên
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/guest-booking-lookup')}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Tra Cứu Ngay</span>
                </button>

                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hướng dẫn</span>
                </a>
              </div>
            </div>

            {/* Right side - Visual/Image */}
            <div className="relative h-64 lg:h-full min-h-[300px] bg-gradient-to-br from-blue-400/20 to-indigo-500/20">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-300/30 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl"></div>
                  
                  {/* Main illustration */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">
                        ✈️
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                          <p className="text-white text-sm font-mono">📧 Email của bạn</p>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-white/60">
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        </div>
                        <div className="bg-yellow-400/30 rounded-lg px-4 py-3 backdrop-blur-sm border-2 border-yellow-300/50">
                          <p className="text-white font-bold text-lg">✅ Tìm thấy vé!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div id="how-it-works" className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            📖 Cách thức hoạt động
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Nhập Email
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Sử dụng email đã đăng ký khi đặt vé máy bay
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Mã đặt chỗ (Tùy chọn)
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Nhập mã PNR nếu có, hoặc bỏ trống để xem tất cả vé
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Xem thông tin
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Xem chi tiết chuyến bay, hành khách và thanh toán
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionBookingLookup;

