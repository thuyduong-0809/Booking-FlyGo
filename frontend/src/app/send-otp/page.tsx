"use client";
import React, { useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";
import { requestApi } from "lib/api";

const PageOtp = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60); // 60 giây
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  // Lấy email từ localStorage khi component mount
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
      // Gửi OTP ngay khi vào trang
      sendOtp(pendingEmail);
    } else {
      // Nếu không có email, chuyển về trang đăng ký
      router.replace('/signup');
    }
  }, [router]);

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

  const sendOtp = async (emailAddress: string) => {
    try {
      await requestApi("auth/send-otp", "POST", { email: emailAddress });
    } catch (err: any) {
      console.error("Lỗi gửi OTP:", err);
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
      const res = await requestApi("auth/verify-otp", "POST", { 
        email, 
        otp: code 
      });
      
      if (res.success) {
        alert("Xác thực OTP thành công! Đăng ký hoàn tất.");
        router.push("/login");
      } else {
        setError("OTP không hợp lệ");
        setOtp(["", "", "", "", "", ""]); 
      }
    } catch (err: any) {
      setError("OTP không hợp lệ");
      setOtp(["", "", "", "", "", ""]); 
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      await sendOtp(email);
      setTimer(60);
      alert("OTP mới đã được gửi!");
    } catch (err: any) {
      setError("Không thể gửi lại OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`nc-PageOtp`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl md:text-5xl font-semibold justify-center">
          Nhập mã OTP
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          {email && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Mã OTP đã được gửi đến: <span className="font-semibold text-blue-600">{email}</span>
              </p>
            </div>
          )}
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
                disabled={resending}
                className="text-sm font-semibold text-primary-600 underline disabled:opacity-50"
              >
                {resending ? "Đang gửi..." : "Gửi lại OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageOtp;
