"use client";

import React from "react";

const UserSavelists = () => {
    return (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">Danh sách đã lưu</h1>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có danh sách đã lưu
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Khi bạn lưu các chuyến bay yêu thích, chúng sẽ xuất hiện ở đây
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        Khám phá chuyến bay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSavelists;

