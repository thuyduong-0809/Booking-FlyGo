const _GLOBAL = {
  IS_LOGIN: "TRUE",
  EN: "en",
  VN: "vn",
  DEFAULT_LANG: "vn",
  DARK: "dark",
  LIGHT: "light",
  DEFAULT_THEME: "light",
  ROUTER_LOGIN: "login",
  ROUTER_REGISTER: "register",
  ROUTE_ADMIN: "admin",
  ROUTE_ADMIN_CATEGORY: "category",
  ROUTE_ADMIN_ADD: "add",
  ROUTE_ADMIN_ACCOUNT: "account",
  ROUTE_ADMIN_VIDEO: "video",
  LOCAL_STOREAGE: "master",
  ROLE_ADMIN: 3,
  ROUTE_SEND_OTP: "send-otp",
  ROUTER_FORGOT_PASSWORD: "forgotpassword"
};

const _ENV ={
    NEXT_URL_LOCAL: "http://localhost:3000",
    NEXT_URL_PROD : "http://localhost:2050",
    // NEXT_URL_PROD : "https://trang.congcucuatoi.com/",
    NEXT_URL_PRODUCTION: "https://trang-backend.congcucuatoi.com",
   
                      
    // NEXT_URL_RESOURCE:"https://nasdev.congcucuatoi.com/webdav",
    NEXT_URL_RESOURCE: "http://localhost:2070/resource",
}

export { _GLOBAL, _ENV };
