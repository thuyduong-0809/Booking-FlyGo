"use client";
import React, { FC, useState } from "react";
import Input from "@/shared/Input";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Link from "next/link";
import { requestApi } from "lib/api";
import { useRouter } from "next/navigation";


export interface PageSignUpProps {}

const PageSignUp: FC<PageSignUpProps> = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successRegister, setSuccessRegister] = React.useState('');
  const [error, setError] = useState("");
  const router = useRouter();
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await  requestApi("auth/register", "POST", { email, password });
      if(res.success){
        localStorage.setItem('pendingEmail', email);
        setEmail("");
        setPassword("");
        setConfirmPassword("");        
        router.replace('/send-otp');
        console.log("Signup result:", res);
      }else if (res.errorCode === 'USER_EXISTS') {
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
    <div className={`nc-PageSignUp`}>
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl md:text-5xl font-semibold justify-center">
          Đăng ký
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
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
              <span>Mật khẩu</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            <label className="block">
              <span>Xác nhận mật khẩu</span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            {error && <p className="text-red-500">{error}</p>}
            {/* {successRegister && <p className="text-black-600 text-center">{successRegister}</p>} */}
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tiếp tục"}
            </ButtonPrimary>
          </form>
          <span className="block text-center">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold underline">
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
