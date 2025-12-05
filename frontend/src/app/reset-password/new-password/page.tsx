"use client";
import React, { useState, useEffect } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";
import { requestApi } from "@/lib/api";
import { useNotification } from "@/components/Notification";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PageNewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const router = useRouter();
    const { showNotification } = useNotification();

    useEffect(() => {
        const resetEmail = localStorage.getItem('resetPasswordEmail');
        const token = localStorage.getItem('resetToken');

        if (resetEmail && token) {
            setEmail(resetEmail);
            setResetToken(token);
        } else {
            router.replace('/reset-password');
        }
    }, [router]);

    const validatePassword = (password: string) => {
        if (password.length < 6) {
            return "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (!/(?=.*\d)/.test(password)) {
            return "Mật khẩu phải chứa ít nhất 1 số";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            showNotification("error", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            showNotification("error", passwordError);
            return;
        }

        if (password !== confirmPassword) {
            showNotification("error", "Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            const res = await requestApi("auth/reset-password", "POST", {
                email,
                newPassword: password,
                resetToken
            });

            if (res.success) {
                // Xóa dữ liệu reset password khỏi localStorage
                localStorage.removeItem('resetPasswordEmail');
                localStorage.removeItem('resetToken');

                showNotification("success", "Đổi mật khẩu thành công! Vui lòng đăng nhập lại");
                router.push("/login");
            } else {
                showNotification("error", res.message || "Không thể đổi mật khẩu");
            }
        } catch (err: any) {
            showNotification("error", "Không thể đổi mật khẩu. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`nc-PageNewPassword dark:bg-slate-900 min-h-screen`}>
            <div className="container mb-16 lg:mb-20">
                <h2 className="my-12 flex items-center text-3xl md:text-5xl font-semibold justify-center text-neutral-900 dark:text-white">
                    Đặt mật khẩu mới
                </h2>

                <div className="max-w-lg mx-auto space-y-5 p-8 rounded-3xl border border-neutral-200 shadow-lg dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl">
                    <div className="text-center mb-6">
                        <p className="text-neutral-600 dark:text-gray-300 text-sm">
                            Tạo mật khẩu mới cho tài khoản: <span className="font-semibold text-primary-600 dark:text-blue-400">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <label className="block">
                            <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">
                                Mật khẩu mới
                            </span>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    className="mt-1 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-neutral-500 dark:text-gray-400">
                                <p>Mật khẩu phải có:</p>
                                <ul className="list-disc list-inside space-y-1 mt-1">
                                    <li className={password.length >= 6 ? "text-green-600 dark:text-green-400" : ""}>
                                        Ít nhất 6 ký tự
                                    </li>
                                    {/* <li className={/(?=.*[a-z])/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                                        Ít nhất 1 chữ thường
                                    </li>
                                    <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                                        Ít nhất 1 chữ hoa
                                    </li> */}
                                    <li className={/(?=.*\d)/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                                        Ít nhất 1 số
                                    </li>
                                </ul>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">
                                Xác nhận mật khẩu
                            </span>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="mt-1 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    Mật khẩu xác nhận không khớp
                                </p>
                            )}
                        </label>

                        <ButtonPrimary
                            type="submit"
                            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                        >
                            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </ButtonPrimary>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PageNewPassword;