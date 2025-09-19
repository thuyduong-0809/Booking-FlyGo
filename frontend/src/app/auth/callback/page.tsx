"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "stores/hookStore";
import { loginSuccess, updateLocalStorage } from "stores/features/masterSlice";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
     
      dispatch(loginSuccess({
        success: true,
        data: {
          accessToken,
          refreshToken,
          payload: {} 
        }
      }));

      dispatch(updateLocalStorage());

      // đá về trang chủ
      router.push("/");
    }
  }, [searchParams, dispatch, router]);

  return <p>Đang xử lý đăng nhập Google...</p>;
}
