'use client';

import React, { useState } from 'react';
import CancelledBookingsList from './CancelledBookingsList';
import CancelBookingModal from './CancelBookingModal';

export default function CancelBookingTab() {
    const [showModal, setShowModal] = useState(false);

    const handleModalSuccess = () => {
        // Reload the cancelled bookings list
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Thêm hủy đặt chỗ
                </button>
            </div>

            {/* Cancelled Bookings List */}
            <CancelledBookingsList />

            {/* Cancel Booking Modal */}
            <CancelBookingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
