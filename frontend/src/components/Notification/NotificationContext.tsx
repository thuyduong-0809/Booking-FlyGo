'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    details?: string | string[];
    duration?: number;
}

export interface ConfirmModalData {
    id: string;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonColor?: 'red' | 'blue' | 'green' | 'yellow';
    onConfirm: () => void;
    onCancel?: () => void;
}

interface NotificationContextType {
    notifications: Notification[];
    confirmModal: ConfirmModalData | null;
    showNotification: (type: NotificationType, message: string, details?: string | string[], duration?: number) => void;
    removeNotification: (id: string) => void;
    showConfirmModal: (data: Omit<ConfirmModalData, 'id'>) => void;
    hideConfirmModal: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(null);

    const showNotification = useCallback((type: NotificationType, message: string, details?: string | string[], duration: number = 3000) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const newNotification: Notification = { id, type, message, details, duration };

        setNotifications(prev => [...prev, newNotification]);

        // Tự động xóa sau duration ms
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showConfirmModal = useCallback((data: Omit<ConfirmModalData, 'id'>) => {
        const id = `confirm-${Date.now()}-${Math.random()}`;
        setConfirmModal({ ...data, id });
    }, []);

    const hideConfirmModal = useCallback(() => {
        setConfirmModal(null);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            confirmModal,
            showNotification,
            removeNotification,
            showConfirmModal,
            hideConfirmModal
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

