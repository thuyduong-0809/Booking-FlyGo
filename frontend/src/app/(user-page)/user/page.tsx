"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { requestApi } from "lib/api";
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
} from "@heroicons/react/24/outline";

const UserPage = () => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
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
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Tài khoản</h1>
                {/* Tên */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Họ và tên</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {userData?.firstName || ''} {userData?.lastName || ''}
                        </div>
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
                        <div className="font-semibold text-gray-900 dark:text-white">{userData?.phone || 'Chưa cập nhật'}</div>
                    </div>
                </div>

                {/* Ngày sinh */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Ngày sinh</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </div>
                    </div>
                </div>

                {/* Passport Number */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Số hộ chiếu</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{userData?.passportNumber || 'Chưa cập nhật'}</div>
                    </div>
                </div>

                {/* Passport Expiry */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-neutral-700">
                    <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Ngày hết hạn hộ chiếu</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {userData?.passportExpiry ? new Date(userData.passportExpiry).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </div>
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
            </div>
        </div>
    );
};

export default UserPage;
