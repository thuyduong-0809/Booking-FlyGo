"use client";
import React, { FC, useEffect, useState } from "react";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import {requestApi } from "lib/api";
import { loginSuccess, updateLocalStorage } from "stores/features/masterSlice";
import { useAppDispatch, useAppSelector } from "stores/hookStore";
import { useRouter } from "next/navigation";


export interface PageLoginProps {}

const loginSocials = [
  {
    name: "Continue with Google",
    href: "http://localhost:3001/auth/google",
    icon: googleSvg,
  },
];

const PageLogin: FC<PageLoginProps> = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const masterStore = useAppSelector((state) => state.master);
  const router = useRouter();

  useEffect(() => {
  console.log("Master store thay đổi:", masterStore);
}, [masterStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
     try {
     const res = await requestApi("auth/login", "POST", { email, password });
     if(res.success){
      dispatch(loginSuccess({ ...res }));
      dispatch(updateLocalStorage());
      // console.log("Login success:", res);
      alert("Login thành công 🎉");
       router.push("/"); 
     }else {
         setError("Email hoặc mật khẩu không đúng")
     }
    
    } catch (err) {
    setError("Email hoặc mật khẩu không đúng")
    console.error("Login failed:", err);
    setLoading(false)
    }
   };

  return (
    <div className={`nc-PageLogin`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl md:text-5xl font-semibold justify-center">
          Đăng nhập
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 dark:bg-neutral-800 px-4 py-3 hover:translate-y-[-2px] transition-transform"
              >
                <Image
                  className="flex-shrink-0"
                  src={item.icon}
                  alt={item.name}
                />
                <h3 className="flex-grow text-center text-sm font-medium">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>

          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute inset-x-0 top-1/2 border dark:border-neutral-800"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <label className="block">
              <span>Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="mt-1"
              />
            </label>

            <label className="block">
              <span className="flex justify-between items-center">
                Mật khẩu
                <Link href="#" className="text-sm underline">
                  Quên mật khẩu?
                </Link>
              </span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </label>
              
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Continue"}
            </ButtonPrimary>
          </form>

          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}

          {/* ==== */}
          <span className="block text-center">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold underline">
              Tạo tài khoản
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
