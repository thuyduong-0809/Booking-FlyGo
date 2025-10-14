"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '../BookingContext';

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " VND";
}

export default function PaymentPage() {
  const router = useRouter();
  const { state, grandTotal } = useBooking();

  const dep = state.selectedDeparture;
  const ret = state.selectedReturn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black">
            Xác nhận & thanh toán
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border">
            <h2 className="text-xl font-bold text-black mb-4">Thông tin hành trình</h2>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-black">Chuyến đi</div>
                <div className="text-gray-700 text-base">{state.origin} ✈ {state.destination}</div>
                <div className="text-gray-600 text-sm">{state.departureDate} | {dep?.departTime} - {dep?.arriveTime} | {dep?.code} | {dep?.fareName}</div>
              </div>
              <div>
                <div className="font-semibold text-black">Chuyến về</div>
                <div className="text-gray-700 text-base">{state.destination} ✈ {state.origin}</div>
                <div className="text-gray-600 text-sm">{state.returnDate} | {ret?.departTime} - {ret?.arriveTime} | {ret?.code} | {ret?.fareName}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border">
            <h2 className="text-xl font-bold text-black mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3 text-base text-gray-700">
              <label className="flex items-center space-x-3">
                <input type="radio" name="pay" defaultChecked className="w-4 h-4" />
                <span>Thẻ nội địa/NAPAS</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="radio" name="pay" className="w-4 h-4" />
                <span>Thẻ quốc tế (Visa/Master/JCB)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="radio" name="pay" className="w-4 h-4" />
                <span>Ví điện tử (Momo/ZaloPay)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Quay lại</button>
            <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg shadow-lg">Xác nhận thanh toán</button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 sticky top-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-8 text-center">
              THÔNG TIN ĐẶT CHỖ
            </h3>
            <div className="space-y-4 text-base text-gray-700">
              <div className="flex justify-between">
                <span>Hành khách</span>
                <span className="font-semibold">{state.passengers} người</span>
              </div>
              <div className="flex justify-between">
                <span>Chuyến đi</span>
                <span className="font-semibold">{formatVnd((dep?.price || 0) + (dep?.tax || 0) + (dep?.service || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>Chuyến về</span>
                <span className="font-semibold">{formatVnd((ret?.price || 0) + (ret?.tax || 0) + (ret?.service || 0))}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mt-8">
              <div className="text-xl font-semibold mb-3">Tổng tiền</div>
              <div className="text-4xl font-bold">{formatVnd(grandTotal)}</div>
              <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
            </div>
            <Link href="/book-plane/select-flight" className="block text-center mt-4 text-blue-600 underline">Thay đổi chuyến bay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


