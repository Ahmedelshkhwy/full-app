export interface userPayload {
    id: string;
    email: string;
    name: string;
    role: string;
}
export interface JwtPayload {
    id: string;
    email: string;
    name: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface DecodedToken extends JwtPayload {
}
