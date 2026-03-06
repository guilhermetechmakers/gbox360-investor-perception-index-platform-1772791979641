export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  full_name?: string
  company?: string
  role?: string
  accept_tos?: boolean
}

export interface AuthResponse {
  user: { id: string; email: string; full_name?: string }
  token: string
}
