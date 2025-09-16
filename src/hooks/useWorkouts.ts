import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Workout } from "@/lib/supabase";
import { format } from 'date-fns';

interface UseWorkoutsProps {
  userId?: string;
  monthRange: {
    start: string;
    end: string;
  };
}

export function useWorkouts({ userId, monthRange }: UseWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  // 운동 기록 불러오기
  const fetchWorkouts = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .gte("workout_date", monthRange.start)
        .lte("workout_date", monthRange.end)
        .order("workout_date", { ascending: true });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error("운동 기록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 날짜의 운동 기록 가져오기
  const getWorkoutsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return workouts.filter((workout) => workout.workout_date === dateString);
  };

  // 운동 기록 추가
  const addWorkout = async (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .insert([workout]);

      if (error) throw error;
      await fetchWorkouts();
      return { success: true };
    } catch (error) {
      console.error("운동 기록 추가 실패:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // 운동 기록 수정
  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchWorkouts();
      return { success: true };
    } catch (error) {
      console.error("운동 기록 수정 실패:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // 운동 기록 삭제
  const deleteWorkout = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchWorkouts();
      return { success: true };
    } catch (error) {
      console.error("운동 기록 삭제 실패:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // 월 범위가 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchWorkouts();
  }, [userId, monthRange.start, monthRange.end]);

  return {
    workouts,
    loading,
    getWorkoutsForDate,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    refreshWorkouts: fetchWorkouts,
  };
}