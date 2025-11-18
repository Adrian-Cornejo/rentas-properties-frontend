export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'OWNER' | 'USER';
  accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  organizationId?: string;
  organizationName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
