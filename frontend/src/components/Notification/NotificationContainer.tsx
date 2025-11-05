'use client';

import React, { useState, useEffect } from 'react';
import { useNotification, NotificationType } from './NotificationContext';

const NotificationItem: React.FC<{
    id: string;
    type: NotificationType;
    message: string;
    details?: string[];
    duration: number;
    onClose: (id: string) => void;
}> = ({ id, type, message, details, duration, onClose }) => {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 10);

        // Bắt đầu animation exit trước 300ms
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, duration - 300);

        return () => {
            clearInterval(interval);
            clearTimeout(exitTimer);
        };
    }, [duration]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                        <svg className="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                        <svg className="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                        <svg className="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                        <svg className="w-6 h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-white border-l-4 border-green-500 shadow-xl',
                    icon: 'text-green-600',
                    progress: 'bg-gradient-to-r from-green-400 to-green-600',
                    title: 'text-green-800',
                };
            case 'error':
                return {
                    container: 'bg-white border-l-4 border-red-500 shadow-xl',
                    icon: 'text-red-600',
                    progress: 'bg-gradient-to-r from-red-400 to-red-600',
                    title: 'text-red-800',
                };
            case 'warning':
                return {
                    container: 'bg-white border-l-4 border-yellow-500 shadow-xl',
                    icon: 'text-yellow-600',
                    progress: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
                    title: 'text-yellow-800',
                };
            case 'info':
                return {
                    container: 'bg-white border-l-4 border-blue-500 shadow-xl',
                    icon: 'text-blue-600',
                    progress: 'bg-gradient-to-r from-blue-400 to-blue-600',
                    title: 'text-blue-800',
                };
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'success':
                return 'Thành công!';
            case 'error':
                return 'Lỗi!';
            case 'warning':
                return 'Cảnh báo!';
            case 'info':
                return 'Thông tin';
        }
    };

    const styles = getStyles();

    return (
        <div
            className={`
        ${styles.container}
        w-full sm:min-w-[350px] sm:max-w-md
        rounded-xl
        p-0
        mb-3
        transition-all duration-300
        backdrop-blur-sm
        ${isExiting ? 'animate-slide-out-right opacity-0' : 'animate-slide-in-right'}
        hover:shadow-2xl hover:scale-[1.02]
        overflow-hidden
        relative
      `}
        >
            {/* Content */}
            <div className="p-4 flex items-start gap-3">
                <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold mb-1 ${styles.title}`}>
                        {getTitle()}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                        {message}
                    </p>
                    {details && details.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            {details.map((detail, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span className="flex-1">{detail}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors group"
                    aria-label="Đóng thông báo"
                >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
                <div
                    className={`h-full ${styles.progress} transition-all duration-100 ease-linear shadow-sm`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col items-end pointer-events-none max-w-md sm:max-w-md mx-auto sm:mx-0">
            <div className="pointer-events-auto w-full">
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        id={notification.id}
                        type={notification.type}
                        message={notification.message}
                        details={notification.details}
                        duration={notification.duration || 2000}
                        onClose={removeNotification}
                    />
                ))}
            </div>
        </div>
    );
};

