export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  invitationCode?: string | null;
}
