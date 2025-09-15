import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export interface Workout {
  id: string;
  user_id: string;
  workout_date: string;
  workout_type: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface MembershipPayment {
  id: string;
  user_id: string;
  payment_date: string;
  amount: number;
  payment_cycle_type: "days" | "weeks" | "months";
  payment_cycle_value: number;
  next_payment_date: string;
  payment_type: string; // 회비 종류 (예: 헬스장, 주짓수, 수영장 등)
  created_at: string;
}

// 결제 주기 옵션
export const paymentCycles = [
  { type: "days" as const, value: 1, label: "매일" },
  { type: "days" as const, value: 7, label: "일주일" },
  { type: "weeks" as const, value: 2, label: "2주" },
  { type: "months" as const, value: 1, label: "1개월" },
  { type: "months" as const, value: 3, label: "3개월" },
  { type: "months" as const, value: 6, label: "6개월" },
  { type: "months" as const, value: 12, label: "1년" },
];

// 회비 종류 옵션
export const paymentTypes = [
  "헬스장",
  "주짓수 도장",
  "수영장",
  "요가 스튜디오",
  "필라테스",
  "클라이밍짐",
  "복싱짐",
  "테니스장",
  "골프장",
  "기타",
];
