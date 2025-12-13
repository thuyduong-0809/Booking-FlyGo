'use client';

import React, { useState } from 'react';
import RefundRequestsList from './RefundRequestsList';
import CreateRefundModal from './RefundModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function RefundManagementTab() {
    const [showModal, setShowModal] = useState(false);

    const handleModalSuccess = () => {
        // Reload the refund requests list
        window.location.reload();
    };

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo yêu cầu hoàn tiền
                </button>
            </div>

            {/* Refund Requests List */}
            <RefundRequestsList />

            {/* Create Refund Modal */}
            <CreateRefundModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}


