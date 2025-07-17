export declare class OTPService {
    private transporter;
    private otpStore;
    constructor();
    generateOTP(): string;
    sendEmailOTP(email: string, purpose?: 'register' | 'reset'): Promise<boolean>;
    sendSMSOTP(phone: string, purpose?: 'register' | 'reset'): Promise<boolean>;
    verifyOTP(identifier: string, inputCode: string): {
        valid: boolean;
        message: string;
    };
    cleanup(): void;
}
export declare const otpService: OTPService;
