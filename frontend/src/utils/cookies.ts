/**
 * Lấy giá trị cookie theo tên
 * @param name Tên cookie
 * @returns Giá trị cookie hoặc null
 */
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

/**
 * Lưu cookie
 * @param name Tên cookie
 * @param value Giá trị cookie
 * @param days Số ngày expire
 */
export const setCookie = (name: string, value: string, days: number = 1): void => {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

/**
 * Xóa cookie
 * @param name Tên cookie
 */
export const deleteCookie = (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

