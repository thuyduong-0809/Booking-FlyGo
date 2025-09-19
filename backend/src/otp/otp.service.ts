import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private otpStorage = new Map<string, { otp: string; expiresAt: Date }>();

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOtp(email: string, otp: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP có hiệu lực 10 phút
    
    this.otpStorage.set(email, { otp, expiresAt });
  }

  verifyOtp(email: string, otp: string): boolean {
    const stored = this.otpStorage.get(email);
    
    if (!stored) {
      return false;
    }

    if (new Date() > stored.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }

    if (stored.otp === otp) {
      this.otpStorage.delete(email);
      return true;
    }

    return false;
  }

  removeOtp(email: string): void {
    this.otpStorage.delete(email);
  }
}
