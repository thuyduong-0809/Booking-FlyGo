import React from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";

const UserBilling = () => {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* HEADING */}
            <h2 className="text-3xl font-semibold">Thanh toán & hóa đơn</h2>
            <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
            <div className="max-w-2xl">
                <span className="text-xl font-semibold block">Phương thức thanh toán</span>
                <br />
                <span className="text-neutral-700 dark:text-neutral-300 block">
                    {" "}
                    Khi bạn nhận được thanh toán cho đặt chỗ, chúng tôi gọi đó là
                    "hóa đơn". Hệ thống thanh toán an toàn của chúng tôi hỗ trợ một số
                    phương thức thanh toán.{" "}
                    <br />
                    <br />
                    Để được thanh toán, bạn cần thiết lập phương thức thanh toán. Hóa đơn
                    sẽ được xuất trong vòng 24 giờ sau thời gian check-in của khách hàng.
                    Thời gian để tiền xuất hiện trong tài khoản của bạn phụ thuộc vào
                    phương thức thanh toán của bạn.
                </span>
                <div className="pt-10">
                    <ButtonPrimary>Thêm phương thức thanh toán</ButtonPrimary>
                </div>
            </div>
        </div>
    );
};

export default UserBilling;

