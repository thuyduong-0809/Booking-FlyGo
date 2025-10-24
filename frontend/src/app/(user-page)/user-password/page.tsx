"use client";

import React, { useState } from "react";
import Label from "@/components/Label";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import { requestApi } from "lib/api";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "@/utils/cookies";

const UserPassword = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            // Lấy token từ cookies
            const token = getCookie("access_token");
            if (!token) {
                router.push("/login");
                return;
            }

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId;

            if (!userId) {
                setError("Không tìm thấy thông tin người dùng");
                return;
            }

            // Update password
            const response = await requestApi(`users/${userId}`, "PUT", {
                passwordHash: formData.newPassword,
            });

            if (response.success) {
                alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
                // Xóa token và cookies
                deleteCookie("access_token");
                // Chuyển đến trang login
                router.push("/login");
            } else {
                setError(response.message || "Đổi mật khẩu thất bại");
            }
        } catch (error: any) {
            console.error("Error updating password:", error);
            setError("Có lỗi xảy ra khi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* HEADING */}
            <h2 className="text-3xl font-semibold">Đổi mật khẩu</h2>
            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <div>
                    <Label>Mật khẩu hiện tại</Label>
                    <Input
                        type="password"
                        className="mt-1.5"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <Label>Mật khẩu mới</Label>
                    <Input
                        type="password"
                        className="mt-1.5"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input
                        type="password"
                        className="mt-1.5"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="pt-2">
                    <ButtonPrimary type="submit" disabled={loading}>
                        {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </ButtonPrimary>
                </div>
            </form>
        </div>
    );
};

export default UserPassword;

