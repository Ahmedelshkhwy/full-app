interface OTPResult {
    success: boolean;
    otpId: string;
    message?: string;
}
interface OTPVerificationResult {
    valid: boolean;
    message: string;
    purpose?: string;
    userData?: any;
}
export declare class OTPService {
    private transporter;
    private otpStore;
    constructor();
    generateOTP(): string;
    generateOTPId(): string;
    sendEmailOTP(email: string, purpose?: 'register' | 'reset-password', userData?: any): Promise<OTPResult>;
    verifyOTP(otpId: string, code: string): Promise<OTPVerificationResult>;
    resendOTP(otpId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    cleanup(): void;
}
export declare const otpService: OTPService;
export {};
