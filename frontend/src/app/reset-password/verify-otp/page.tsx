"use client";
import React, { useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";
import { requestApi } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import Link from "next/link";

const PageVerifyOtpReset = () => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [email, setEmail] = useState("");
    const [resending, setResending] = useState(false);
    const router = useRouter();
    const { showNotification } = useNotification();

    useEffect(() => {
        const resetEmail = localStorage.getItem('resetPasswordEmail');
        if (resetEmail) {
            setEmail(resetEmail);
        } else {
            router.replace('/reset-password');
        }
    }, [router]);

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

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");

        if (code.length < 6) {
            showNotification("error", "Vui lòng nhập đủ 6 số OTP");
            return;
        }

        try {
            setLoading(true);
            const res = await requestApi("auth/verify-reset-otp", "POST", {
                email,
                otp: code
            });

            if (res.success) {
                // Lưu token reset để sử dụng khi đổi mật khẩu
                localStorage.setItem('resetToken', res.data.resetToken);
                showNotification("success", "Xác thực OTP thành công");
                router.push("/reset-password/new-password");
            } else {
                showNotification("error", "Mã OTP không hợp lệ hoặc đã hết hạn");
                setOtp(["", "", "", "", "", ""]);
            }
        } catch (err: any) {
            showNotification("error", "Mã OTP không hợp lệ hoặc đã hết hạn");
            setOtp(["", "", "", "", "", ""]);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setResending(true);
            setOtp(["", "", "", "", "", ""]);

            const res = await requestApi("auth/forgot-password", "POST", { email });

            if (res.success) {
                setTimer(60);
                showNotification("success", "Mã OTP mới đã được gửi!");
            } else {
                showNotification("error", "Không thể gửi lại mã OTP");
            }
        } catch (err: any) {
            showNotification("error", "Không thể gửi lại mã OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className={`nc-PageVerifyOtpReset dark:bg-slate-900 min-h-screen`}>
            <div className="container mb-16 lg:mb-20">
                <h2 className="my-12 flex items-center text-3xl md:text-5xl font-semibold justify-center text-neutral-900 dark:text-white">
                    Nhập mã OTP
                </h2>

                <div className="max-w-lg mx-auto space-y-5 p-8 rounded-3xl border border-neutral-200 shadow-lg dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl">
                    {email && (
                        <div className="text-center mb-6">
                            <p className="text-neutral-600 dark:text-gray-300 text-sm">
                                Mã OTP đã được gửi đến: <span className="font-semibold text-primary-600 dark:text-blue-400">{email}</span>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    maxLength={1}
                                    className="w-12 text-center text-xl font-semibold"
                                />
                            ))}
                        </div>

                        <ButtonPrimary type="submit" disabled={loading}>
                            {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                        </ButtonPrimary>
                    </form>

                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-sm text-neutral-600 dark:text-gray-300">
                                Bạn có thể gửi lại OTP sau <span className="font-semibold text-primary-600 dark:text-blue-400">{timer}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResendOtp}
                                disabled={resending}
                                className="text-sm font-semibold text-primary-600 dark:text-blue-400 underline hover:text-primary-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                            >
                                {resending ? "Đang gửi..." : "Gửi lại OTP"}
                            </button>
                        )}
                    </div>

                    <div className="text-center">
                        <Link
                            href="/reset-password"
                            className="text-sm text-neutral-600 dark:text-gray-300 underline hover:text-primary-600 dark:hover:text-blue-400 transition-colors"
                        >
                            ← Quay lại
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageVerifyOtpReset;