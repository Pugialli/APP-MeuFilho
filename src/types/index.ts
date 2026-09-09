export type Role = 'PAI' | 'MAE'
export type MeasurementType = 'WEIGHT' | 'HEIGHT' | 'BPM'
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Child {
  id: string
  name: string | null
  dueDate: string | null
  sex: Sex
  inviteCode: string
  createdAt: string
  members: { id: string; name: string; role: Role }[]
}

export interface Measurement {
  id: string
  type: MeasurementType
  value: number
  unit: string
  date: string
  createdAt: string
  recordedBy: { id: string; name: string }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  error: string
  message: string
  issues?: { path: string; message: string }[]
}
