"use client";
import React, { FC, useState } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { requestApi } from "@/lib/api";
import { useRouter } from "next/navigation";


export interface PageSignUpProps { }

const PageSignUp: FC<PageSignUpProps> = ({ }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successRegister, setSuccessRegister] = React.useState('');
  const [error, setError] = useState("");
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName) {
      setError("Vui lòng nhập đầy đủ họ và tên");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await requestApi("auth/register", "POST", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: password,
      });

      if (res.success) {
        localStorage.setItem('pendingEmail', email);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.replace('/send-otp');
        console.log("Signup result:", res);
      } else if (res.errorCode === 'USER_EXISTS') {
        setSuccessRegister('');
        setError("Email đã dược đăng ký");
      } else {
        setError(res.message);
        setSuccessRegister('');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`nc-PageSignUp dark:bg-slate-900 min-h-screen`}>
      <div className="container mb-16 lg:mb-20">
        <h2 className="my-12 flex items-center text-3xl md:text-5xl font-semibold justify-center text-neutral-900 dark:text-white">
          Đăng ký
        </h2>
        <div className="max-w-lg mx-auto space-y-5 p-8 rounded-3xl border border-neutral-200 shadow-lg dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl">
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">Họ</span>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nhập họ"
                  className="mt-1"
                  required
                />
              </label>
              <label className="block">
                <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">Tên</span>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nhập tên"
                  className="mt-1"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">Mật khẩu</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2 block">Xác nhận mật khẩu</span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            {error && <p className="text-red-500 dark:text-red-400 text-center text-sm">{error}</p>}
            {/* {successRegister && <p className="text-black-600 text-center">{successRegister}</p>} */}
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>
          <span className="block text-center text-neutral-600 dark:text-gray-300 text-sm">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary-600 underline dark:text-blue-400 hover:text-primary-700 dark:hover:text-blue-300 transition-colors">
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
