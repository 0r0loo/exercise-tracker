import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { MembershipPayment } from "@/lib/supabase";
import { format } from 'date-fns';

interface UsePaymentsProps {
  userId?: string;
  monthRange: {
    start: string;
    end: string;
  };
}

export function usePayments({ userId, monthRange }: UsePaymentsProps) {
  const [payments, setPayments] = useState<MembershipPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // 회비 결제 정보 불러오기
  const fetchPayments = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_payments")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: true });

      if (error) throw error;

      // 현재 월에 해당하는 결제 정보들만 필터링
      const filteredPayments = (data || []).filter((payment) => {
        const paymentDate = payment.payment_date;
        const nextPaymentDate = payment.next_payment_date;

        return (
          (paymentDate >= monthRange.start && paymentDate <= monthRange.end) ||
          (nextPaymentDate >= monthRange.start && nextPaymentDate <= monthRange.end)
        );
      });

      setPayments(filteredPayments);
    } catch (error) {
      console.error("회비 정보 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 날짜의 회비 정보 가져오기
  const getPaymentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return payments.filter(
      (payment) =>
        payment.payment_date === dateString ||
        payment.next_payment_date === dateString,
    );
  };

  // 월 범위가 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchPayments();
  }, [userId, monthRange.start, monthRange.end]);

  return {
    payments,
    loading,
    getPaymentsForDate,
    refreshPayments: fetchPayments,
  };
}