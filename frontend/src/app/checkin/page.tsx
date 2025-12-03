"use client";
import { requestApi } from "@/lib/api";
import { useState } from "react";

export default function CheckInPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheckIn = async (e: any) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!bookingRef.trim()) {
      setError("Vui lòng nhập mã đặt chỗ");
      return;
    }

    setLoading(true);

    try {
      const res = await requestApi(
        "check-ins/by-booking",
        "POST",
        { bookingReference: bookingRef }
      );

      if (!res.success) {
        setError(res.message);
      } else {
        setResult(res.data[0]); // vì trả theo dạng array
      }
    } catch (err) {
      setError("Có lỗi xảy ra!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 p-5 border rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-center">Online Check-in</h2>

      <form onSubmit={handleCheckIn} className="mt-5">
        <label className="block mb-2 font-medium">Booking Reference (PNR)</label>
        <input
          type="text"
          className="w-full border rounded p-2 text-gray-800"
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
          placeholder="Nhập mã đặt chỗ"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Check-in"}
        </button>
      </form>

      {/* ❌ Lỗi */}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* ⭐ TRƯỜNG HỢP ĐÃ CHECK-IN */}
      {result && result.status === "SKIPPED" && (
        <div className="mt-5 p-4 border rounded bg-yellow-100">
          <p className="text-yellow-800 font-medium text-center">
            Bạn đã check-in trước đó
          </p>
          {/* <a
            href={result.pdf}
            target="_blank"
            className="block text-center mt-3 text-blue-600 underline"
          >
            Xem Boarding Pass
          </a> */}
        </div>
      )}

      {/* ⭐ TRƯỜNG HỢP CHECK-IN THÀNH CÔNG */}
      {result && result.status === "SUCCESS" && (
        <div className="mt-5 p-4 border rounded bg-green-100">
          <p className="text-green-700 font-medium text-center">
            Check-in thành công! Vui lòng kiểm tra email để nhận Boarding Pass.
          </p>

          {/* <a
            href={result.pdf}
            target="_blank"
            className="block text-center mt-3 text-blue-600 underline"
          >
            Xem Boarding Pass
          </a> */}
        </div>
      )}
    </div>
  );
}
