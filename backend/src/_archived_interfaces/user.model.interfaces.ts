import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  location?: { lat: number; lng: number };
};
