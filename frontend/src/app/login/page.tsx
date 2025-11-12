"use client";
import React, { FC, useEffect, useState } from "react";
import googleSvg from "@/images/Google.svg";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { requestApi } from "@/lib/api";
import { loginSuccess, logout, updateLocalStorage } from "stores/features/masterSlice";
import { useAppDispatch, useAppSelector } from "stores/hookStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/components/Notification";


export interface PageLoginProps { }


const PageLogin: FC<PageLoginProps> = ({ }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const masterStore = useAppSelector((state) => state.master);
  const router = useRouter();
  const [approve, setApprove] = useState(false);
  const query = useSearchParams();
  const { showNotification } = useNotification();

  useEffect(() => {
    const action = query.get("action");
    if (action == "logout") {
      dispatch(logout());
      dispatch(updateLocalStorage());
      setApprove(true);
    } else if (!masterStore.isAuth) {
      setApprove(true);
    } else {
      router.push("/");
    }
  }, [query, masterStore.isAuth, dispatch, router]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('pendingEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      localStorage.removeItem('pendingEmail');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await requestApi("auth/login", "POST", { email, password });
      if (res.success) {
        console.log("==> RES LOGIN:", res);

        dispatch(loginSuccess({ ...res }));
        dispatch(updateLocalStorage());
        document.cookie = `access_token=${res.data.accessToken}; path=/; max-age=3600; secure; samesite=strict`;

        showNotification("success", "Login thành công");
        router.push("/");
      } else {
        showNotification("error", "Email hoặc mật khẩu không đúng");
        setLoading(false);
      }

    } catch (err) {
      showNotification("error", "Email hoặc mật khẩu không đúng");
      setLoading(false);
    }
  };

  if (!approve) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-6000"></div>
      </div>
    );
  }

  return (
    <div className={`nc-PageLogin dark:bg-slate-900 min-h-screen`}>
      <div className="container mb-16 lg:mb-20">
        <h2 className="my-12 flex items-center text-3xl md:text-5xl font-semibold justify-center text-neutral-900 dark:text-white">
          Đăng nhập
        </h2>

        <div className="max-w-lg mx-auto space-y-5 p-8 rounded-3xl border border-neutral-200 shadow-lg dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl">
          {/* <div className="grid gap-3">
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
          </div> */}

          {/*          
          <div className="relative text-center">
            <span className="relative z-10 inline-block px-4 font-medium text-sm bg-white dark:bg-neutral-900">
              OR
            </span>
            <div className="absolute inset-x-0 top-1/2 border dark:border-neutral-800"></div>
          </div> */}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid gap-6">
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
              <span className="flex justify-between items-center text-neutral-800 dark:text-gray-200 font-medium text-sm mb-2">
                Mật khẩu
                <Link href="#" className="text-sm text-primary-600 underline dark:text-blue-400 hover:text-primary-700 dark:hover:text-blue-300 transition-colors">
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
              {loading ? "Đang đăng nhập..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-600 dark:text-gray-300 text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold text-primary-600 underline dark:text-blue-400 hover:text-primary-700 dark:hover:text-blue-300 transition-colors">
              Tạo tài khoản
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
