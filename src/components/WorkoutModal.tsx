import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import type { Workout } from "@/lib/supabase";
import { format } from 'date-fns';
import { useWorkouts } from "@/hooks/useWorkouts";
import WorkoutModalWrapper from "./workout/WorkoutModalWrapper";
import WorkoutList from "./workout/WorkoutList";
import WorkoutForm from "./workout/WorkoutForm";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onWorkoutAdded: () => void;
  existingWorkouts?: Workout[];
}

export default function WorkoutModal({
  isOpen,
  onClose,
  selectedDate,
  onWorkoutAdded,
  existingWorkouts = [],
}: WorkoutModalProps) {
  const { user } = useAuth();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [mode, setMode] = useState<"add" | "list">("list");

  // useWorkouts hook 사용 (단일 운동 기록 작업용)
  const { loading, addWorkout, updateWorkout, deleteWorkout } = useWorkouts({
    userId: user?.id,
    monthRange: { start: '', end: '' } // 단일 작업에는 범위가 필요 없음
  });

  // 모달이 열릴 때 모드 초기화
  useEffect(() => {
    if (isOpen) {
      setMode(existingWorkouts.length > 0 ? "list" : "add");
      setEditingWorkout(null);
    }
  }, [isOpen, existingWorkouts.length]);

  // 수정 모드로 전환
  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setMode("add");
  };

  // 운동 기록 삭제
  const handleDelete = async (workoutId: string) => {
    const result = await deleteWorkout(workoutId);
    if (result.success) {
      onWorkoutAdded();
      if (existingWorkouts.length <= 1) {
        onClose();
      }
    } else {
      alert("운동 기록 삭제에 실패했습니다.");
    }
  };

  // 폼 제출 처리
  const handleFormSubmit = async (data: { workoutType: string; notes: string }) => {
    if (!user || !selectedDate) return;

    let result;
    if (editingWorkout) {
      // 수정
      result = await updateWorkout(editingWorkout.id, {
        workout_type: data.workoutType,
        notes: data.notes.trim() || undefined,
      });
    } else {
      // 추가
      result = await addWorkout({
        user_id: user.id,
        workout_date: format(selectedDate, 'yyyy-MM-dd'),
        workout_type: data.workoutType,
        notes: data.notes.trim() || undefined,
        completed: true,
      });
    }

    if (result.success) {
      setEditingWorkout(null);
      onWorkoutAdded();

      if (editingWorkout || existingWorkouts.length === 0) {
        onClose();
      } else {
        setMode("list");
      }
    } else {
      alert("운동 기록 저장에 실패했습니다.");
    }
  };

  // 폼 취소 처리
  const handleFormCancel = () => {
    if (existingWorkouts.length > 0) {
      setMode("list");
    } else {
      onClose();
    }
  };

  const getTitle = () => {
    if (mode === "list") return "운동 기록 관리";
    if (editingWorkout) return "운동 기록 수정";
    return "운동 기록 추가";
  };

  return (
    <WorkoutModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      selectedDate={selectedDate}
    >
      {mode === "list" ? (
        <WorkoutList
          workouts={existingWorkouts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={() => setMode("add")}
          onClose={onClose}
          isLoading={loading}
        />
      ) : (
        <WorkoutForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          editingWorkout={editingWorkout}
          isLoading={loading}
          hasExistingWorkouts={existingWorkouts.length > 0}
        />
      )}
    </WorkoutModalWrapper>
  );
}
