'use client';

import React from 'react';
import { useNotification } from './NotificationContext';

export const ConfirmModal: React.FC = () => {
    const { confirmModal, hideConfirmModal } = useNotification();

    if (!confirmModal) return null;

    const {
        title,
        message,
        confirmText = 'Có',
        cancelText = 'Không',
        confirmButtonColor = 'blue',
        onConfirm,
        onCancel
    } = confirmModal;

    const handleConfirm = () => {
        onConfirm();
        hideConfirmModal();
    };

    const handleCancel = () => {
        onCancel?.();
        hideConfirmModal();
    };

    const getConfirmButtonStyles = () => {
        switch (confirmButtonColor) {
            case 'red':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
            case 'green':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white';
            case 'yellow':
                return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white';
            case 'blue':
            default:
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white';
        }
    };

    const getIcon = () => {
        switch (confirmButtonColor) {
            case 'red':
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'green':
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'yellow':
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'blue':
            default:
                return (
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] overflow-y-auto">
            <div className="flex items-start justify-center pt-20 px-4 pb-20 text-center">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
                    onClick={handleCancel}
                ></div>

                {/* Modal panel */}
                <div className="relative inline-block align-top bg-white rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-2xl p-8 border border-gray-200">
                    <div className="sm:flex sm:items-start">
                        {/* Icon */}
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full sm:mx-0 sm:h-14 sm:w-14">
                            {getIcon()}
                        </div>

                        {/* Content */}
                        <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left flex-1">
                            <h3 className="text-2xl leading-8 font-bold text-gray-900 mb-3" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-3">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-base transition-all duration-200 hover:shadow-xl ${getConfirmButtonStyles()}`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-md px-6 py-3 bg-white text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-base transition-all duration-200 hover:shadow-lg"
                            onClick={handleCancel}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};