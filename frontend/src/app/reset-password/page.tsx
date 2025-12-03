"use client";
import React, { useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter, useSearchParams } from "next/navigation";
import { requestApi } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import Link from "next/link";

const PageResetPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showNotification } = useNotification();

    // Tự động điền email từ query parameter
    useEffect(() => {
        const emailFromQuery = searchParams.get('email');
        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            showNotification("error", "Vui lòng nhập email");
            return;
        }

        try {
            setLoading(true);
            const res = await requestApi("auth/forgot-password", "POST", { email });

            if (res.success) {
                // Lưu email để sử dụng trong trang OTP
                localStorage.setItem('resetPasswordEmail', email);
                showNotification("success", "Mã OTP đã được gửi đến email của bạn");
                router.push("/reset-password/verify-otp");
            } else {
                showNotification("error", res.message || "Không tìm thấy tài khoản với email này");
            }
        } catch (err: any) {
            showNotification("error", "Không tìm thấy tài khoản với email này");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`nc-PageResetPassword dark:bg-slate-900 min-h-screen`}>
            <div className="container mb-16 lg:mb-20">
                <h2 className="my-12 flex items-center text-3xl md:text-5xl font-semibold justify-center text-neutral-900 dark:text-white">
                    Quên mật khẩu
                </h2>

                <div className="max-w-lg mx-auto space-y-5 p-8 rounded-3xl border border-neutral-200 shadow-lg dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl">
                    <div className="text-center mb-6">
                        <p className="text-neutral-600 dark:text-gray-300 text-sm">
                            Nhập email của bạn để nhận mã OTP khôi phục mật khẩu
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <label className="block">
                            <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">
                                Email
                            </span>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@example.com"
                                className="mt-1"
                                required
                            />
                        </label>

                        <ButtonPrimary type="submit" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </ButtonPrimary>
                    </form>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-primary-600 underline dark:text-blue-400 hover:text-primary-700 dark:hover:text-blue-300 transition-colors"
                        >
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageResetPassword;