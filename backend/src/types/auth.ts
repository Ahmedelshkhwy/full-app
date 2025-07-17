
export interface userPayload {
  id: string;
  email: string;
  name: string;
  role: string
    // يمكنك إضافة خصائص أخرى حسب الحاجة

}
 export interface JwtPayload {
    id: string;
    email: string;
    name: string;
    role: string;
    iat?: number; 
    exp?: number; 
 }
export interface DecodedToken extends JwtPayload {}
