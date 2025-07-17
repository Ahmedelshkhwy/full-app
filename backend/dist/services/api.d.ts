export declare const registerUser: (data: {
    username: string;
    email: string;
    password: string;
    phone: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    role?: string;
}) => Promise<any>;
export declare const loginUser: (username: string, password: string) => Promise<any>;
