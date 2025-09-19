"use client";
import React, { useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";

const PageOtp = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 60 giây
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // 👉 Call API verify OTP
      console.log("OTP submit:", code);

      alert("Xác thực OTP thành công!");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(60);
    alert("OTP mới đã được gửi!");
    // 👉 Call API resend OTP ở đây
  };

  return (
    <div className={`nc-PageOtp`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl md:text-5xl font-semibold justify-center">
          Nhập mã OTP
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  maxLength={1}
                  className="w-12 text-center text-xl"
                />
              ))}
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận OTP"}
            </ButtonPrimary>
          </form>

          {/* Timer + resend */}
          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Bạn có thể gửi lại OTP sau <b>{timer}s</b>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-sm font-semibold text-primary-600 underline"
              >
                Gửi lại OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageOtp;
