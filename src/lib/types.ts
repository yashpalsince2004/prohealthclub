// Auth Types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserContext {
  id: string;
  email: string;
  role: 'admin' | 'trainer' | 'receptionist' | 'member';
  is_active: boolean;
  profile: ProfileResponse | null;
  trainer_id: string | null;
  member_id: string | null;
}

// Profiles & Members
export interface ProfileResponse {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  biometric_device_id: number | null;
  member_id?: string;
  email?: string | null;
  occupation?: string | null;
  height?: number | null;
  weight?: number | null;
  medical_notes?: string | null;
  emergency_relation?: string | null;
}

export interface ActiveMembershipSummary {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  days_remaining: number;
  auto_renew?: boolean;
  plan_id?: string;
}

export interface TrainerSummary {
  id: string;
  full_name: string;
  specialization?: string | null;
}

export interface TrainerResponse {
  id: string;
  employee_id: string | null;
  specialization: string | null;
  specializations: string[] | null;
  experience_years: number | null;
  qualification: string | null;
  certifications: string[];
  bio: string | null;
  is_available: boolean;
  is_active: boolean;
  employment_type: string | null;
  salary: number | null;
  salary_type: string | null;
  shift: string | null;
  joining_staff_date: string | null;
  max_members: number;
  working_days: string[] | null;
  working_hours: string | null;
  profile: ProfileResponse;
  assigned_member_count: number;
  assigned_members?: MemberResponse[];
}

export interface MemberResponse {
  id: string;
  joining_date: string;
  notes: string | null;
  profile: ProfileResponse;
  active_membership: ActiveMembershipSummary | null;
  assigned_trainer?: TrainerSummary | null;
}

export interface MemberListResponse {
  members: MemberResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Memberships
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'paused';

export interface MembershipResponse {
  id: string;
  member_id: string;
  plan: PlanSummary;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  auto_renew: boolean;
  discount_percent: number;
  is_expired: boolean;
  days_remaining: number;
  effective_price: number;
}

// Plans
export interface PlanResponse {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  currency: string;
  features: string[] | null;
  is_active: boolean;
  display_order: number;
  category: string | null;
  admission_fee: number;
  tax: number;
  color: string | null;
  active_subscriber_count: number;
}

export interface PTPlan {
  id: string;
  package_name: string;
  price: number;
  session_count: number;
  whatsapp_support: boolean;
  locker_included: boolean;
  transformation_included: boolean;
  diet_included: boolean;
  stretching_included: boolean;
  supplement_guidance: boolean;
  description: string | null;
  is_active: boolean;
}

export interface LockerPlan {
  id: string;
  name: string;
  deposit: number;
  monthly_rent: number;
  quarterly_rent: number;
  late_fee: number;
  refundable: boolean;
  is_active: boolean;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string | null;
  is_active: boolean;
}

export interface PlanSummary {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  currency: string;
}

// Payments
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentResponse {
  id: string;
  membership_id: string;
  member_id: string;
  member_name: string;
  amount_paid: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_reference: string | null;
  payment_date: string;
  notes: string | null;
  collected_by_name: string | null;
}

// Attendance
export interface AttendanceLogResponse {
  id: string;
  member_id: string;
  member_name: string;
  check_in: string;
  check_out: string | null;
  source: 'biometric' | 'manual';
  device_serial: string | null;
  raw_pin: number | null;
  notes: string | null;
  duration_minutes: number | null;
}

export interface UnmatchedScanResponse {
  id: string;
  device_serial: string;
  raw_pin: number;
  scan_datetime: string;
  verified: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_member_id: string | null;
}

// Workout & Diet
export interface ExerciseResponse {
  id: string;
  day_of_week: number;
  day_name: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  duration_minutes: number | null;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
}

export interface WorkoutPlanResponse {
  id: string;
  member_id: string;
  member_name: string;
  trainer_id: string | null;
  trainer_name: string | null;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  exercises_by_day: Record<string, ExerciseResponse[]>;
  total_exercises: number;
}

export interface DietItemResponse {
  id: string;
  meal_type: string;
  meal_type_label: string;
  food_name: string;
  quantity: string;
  unit: string;
  calories: number | null;
  notes: string | null;
  order_index: number;
}

export interface DietPlanResponse {
  id: string;
  member_id: string;
  member_name: string;
  trainer_id: string | null;
  trainer_name: string | null;
  title: string;
  description: string | null;
  daily_calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  items_by_meal: Record<string, DietItemResponse[]>;
  total_tracked_calories: number;
}

// Analytics
export interface DashboardSummary {
  total_members: number;
  active_members: number;
  new_members_this_month: number;
  total_trainers: number;
  available_trainers: number;
  today_attendance: number;
  this_month_revenue: number;
  last_month_revenue: number;
  revenue_growth_percent: number;
  expiring_memberships_7_days: number;
  unresolved_biometric_scans: number;
  currency: string;
}

export interface RevenueDataPoint {
  label: string;
  amount: number;
  payment_count: number;
}

export interface RevenueReport {
  total_revenue: number;
  total_payments: number;
  avg_per_payment: number;
  by_method: Record<string, number>;
  by_status: Record<string, number>;
  timeline: RevenueDataPoint[];
  currency: string;
}

export interface AttendanceDataPoint {
  label: string;
  total_visits: number;
  unique_members: number;
  biometric_count: number;
  manual_count: number;
}

export interface AttendanceReport {
  total_visits: number;
  unique_members: number;
  avg_daily_visits: number;
  peak_hour: number | null;
  peak_day: string | null;
  by_source: Record<string, number>;
  timeline: AttendanceDataPoint[];
}

// Notifications
export type NotificationType =
  | 'membership_expiring'
  | 'membership_expired'
  | 'payment_received'
  | 'unmatched_scan'
  | 'plan_assigned'
  | 'general';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unread_count: number;
  total: number;
}

// Generic API Envelope
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ReceptionistResponse {
  id: string;
  email: string;
  is_active: boolean;
  role: string;
  created_at: string | null;
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    biometric_device_id: number | null;
    salary: number | null;
    shift: string | null;
    joining_staff_date: string | null;
    medical_notes: string | null;
  };
}

export interface ReceptionistCreatePayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  date_of_birth?: string | null;
  salary?: number | null;
  shift?: string | null;
  joining_staff_date?: string;
  medical_notes?: string | null;
}

export interface ReceptionistUpdatePayload {
  full_name?: string;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  salary?: number | null;
  shift?: string | null;
  is_active?: boolean;
  medical_notes?: string | null;
}
