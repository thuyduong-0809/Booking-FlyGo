"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { requestApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/cookies";
import {
    IdentificationIcon,
    TrophyIcon,
    WalletIcon,
    PhoneIcon,
    EnvelopeIcon,
    LockClosedIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";

const UserPage = () => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = getCookie("access_token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const payload = JSON.parse(atob(token.split(".")[1]));
                const userId = payload.userId;

                if (!userId) {
                    console.error("User ID not found in token");
                    router.push("/login");
                    return;
                }

                const response = await requestApi(`users/${userId}`, "GET");

                if (response.success && response.data) {
                    setUserData(response.data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            phone: userData?.phone || '',
            dateOfBirth: userData?.dateOfBirth || '',
            passportNumber: userData?.passportNumber || '',
            passportExpiry: userData?.passportExpiry || '',
        });
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({});
        setError("");
        setSuccess("");
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

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

            // Chuẩn bị dữ liệu để gửi - loại bỏ các trường rỗng
            const dataToSend: any = {};

            if (editData.firstName) dataToSend.firstName = editData.firstName;
            if (editData.lastName) dataToSend.lastName = editData.lastName;
            if (editData.phone) dataToSend.phone = editData.phone;
            if (editData.dateOfBirth) dataToSend.dateOfBirth = editData.dateOfBirth;
            if (editData.passportNumber) dataToSend.passportNumber = editData.passportNumber;

            console.log("Data to send:", dataToSend);

            const response = await requestApi(`users/${userId}`, "PUT", dataToSend);

            console.log("Response:", response);

            if (response.success) {
                setSuccess("Cập nhật thông tin thành công!");
                setUserData({ ...userData, ...dataToSend });
                setIsEditing(false);
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(response.message || "Cập nhật thất bại");
            }
        } catch (error: any) {
            console.error("Error updating user:", error);
            setError(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userData) {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-700 p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Đang tải thông tin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
            {/* Content */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tài khoản</h1>
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <PencilIcon className="w-4 h-4" />
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
                {/* Tên */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Họ và tên</div>
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <Input
                                    type="text"
                                    value={editData.firstName || ''}
                                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                    placeholder="Họ"
                                    className="text-sm"
                                />
                                <Input
                                    type="text"
                                    value={editData.lastName || ''}
                                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                    placeholder="Tên"
                                    className="text-sm"
                                />
                            </div>
                        ) : (
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {userData?.firstName || ''} {userData?.lastName || ''}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <EnvelopeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{userData?.email || 'N/A'}</div>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</div>
                        {isEditing ? (
                            <Input
                                type="tel"
                                value={editData.phone || ''}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                placeholder="Số điện thoại"
                                className="mt-1 text-sm"
                            />
                        ) : (
                            <div className="font-semibold text-gray-900 dark:text-white">{userData?.phone || 'Chưa cập nhật'}</div>
                        )}
                    </div>
                </div>

                {/* Ngày sinh */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Ngày sinh</div>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ''}
                                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                className="mt-1 text-sm"
                            />
                        ) : (
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Passport Number */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Số hộ chiếu/CCCD</div>
                        {isEditing ? (
                            <Input
                                type="text"
                                value={editData.passportNumber || ''}
                                onChange={(e) => setEditData({ ...editData, passportNumber: e.target.value })}
                                placeholder="Số hộ chiếu/CMND"
                                className="mt-1 text-sm"
                            />
                        ) : (
                            <div className="font-semibold text-gray-900 dark:text-white">{userData?.passportNumber || 'Chưa cập nhật'}</div>
                        )}
                    </div>
                </div>



                {/* Hạng thẻ */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <TrophyIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Hạng thẻ</div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-500">★</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{userData?.loyaltyTier || 'Standard'}</span>
                        </div>
                    </div>
                </div>

                {/* Điểm tích lũy */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <WalletIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Điểm tích lũy</div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{userData?.loyaltyPoints || 0}</span>
                            <span className="text-yellow-500">💛</span>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                        Đổi thưởng
                    </button>
                </div>

                {/* Mật khẩu */}
                <div className="flex items-center gap-3 py-3">
                    <LockClosedIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Mật khẩu</div>
                        <div className="font-semibold text-gray-900 dark:text-white">******</div>
                    </div>
                    <Link href="/user-password" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm underline flex items-center gap-1">
                        <PencilIcon className="w-4 h-4" />
                        Đổi Mật khẩu
                    </Link>
                </div>

                {/* Nút Save/Cancel khi đang edit */}
                {isEditing && (
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <CheckIcon className="w-4 h-4" />
                            {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPage;
