import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { Workout } from "@/lib/supabase";

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
  const [loading, setLoading] = useState(false);
  const [workoutType, setWorkoutType] = useState("");
  const [notes, setNotes] = useState("");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [mode, setMode] = useState<"add" | "list">("list");

  const workoutTypes = ["주짓수", "헬스", "러닝", "사이클링", "기타"];

  // 모달이 열릴 때 모드 초기화
  useEffect(() => {
    if (isOpen) {
      setMode(existingWorkouts.length > 0 ? "list" : "add");
      setEditingWorkout(null);
      setWorkoutType("");
      setNotes("");
    }
  }, [isOpen, existingWorkouts.length]);

  // 수정 모드로 전환
  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setWorkoutType(workout.workout_type);
    setNotes(workout.notes || "");
    setMode("add");
  };

  // 운동 기록 삭제
  const handleDelete = async (workoutId: string) => {
    if (!confirm("이 운동 기록을 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      onWorkoutAdded();
      if (existingWorkouts.length <= 1) {
        onClose();
      }
    } catch (error) {
      console.error("운동 기록 삭제 실패:", error);
      alert("운동 기록 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !workoutType) return;

    setLoading(true);
    try {
      if (editingWorkout) {
        // 수정
        const { error } = await supabase
          .from("workouts")
          .update({
            workout_type: workoutType,
            notes: notes.trim() || null,
          })
          .eq("id", editingWorkout.id);

        if (error) throw error;
      } else {
        // 추가
        const { error } = await supabase.from("workouts").insert([
          {
            user_id: user.id,
            workout_date: selectedDate.toISOString().split("T")[0],
            workout_type: workoutType,
            notes: notes.trim() || null,
            completed: true,
          },
        ]);

        if (error) throw error;
      }

      // 성공 시 폼 초기화 및 목록으로 돌아가기
      setWorkoutType("");
      setNotes("");
      setEditingWorkout(null);
      onWorkoutAdded();

      if (editingWorkout || existingWorkouts.length === 0) {
        onClose();
      } else {
        setMode("list");
      }
    } catch (error) {
      console.error("운동 기록 저장 실패:", error);
      alert("운동 기록 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "list"
              ? "운동 기록 관리"
              : editingWorkout
              ? "운동 기록 수정"
              : "운동 기록 추가"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>닫기</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {selectedDate && (
          <p className="text-sm text-gray-600 mb-4">
            날짜: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월{" "}
            {selectedDate.getDate()}일
          </p>
        )}

        {mode === "list" ? (
          // 운동 기록 목록 표시
          <div className="space-y-4">
            {existingWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {workout.workout_type}
                    </h4>
                    {workout.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {workout.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(workout)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(workout.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => setMode("add")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                운동 추가
              </button>
            </div>
          </div>
        ) : (
          // 운동 기록 추가/수정 폼
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="workout-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                운동 종류 *
              </label>
              <select
                id="workout-type"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">운동을 선택하세요</option>
                {workoutTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                메모 (선택사항)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="운동 내용이나 느낀점을 적어보세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (existingWorkouts.length > 0) {
                    setMode("list");
                  } else {
                    onClose();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {existingWorkouts.length > 0 ? "돌아가기" : "취소"}
              </button>
              <button
                type="submit"
                disabled={loading || !workoutType}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "저장 중..."
                  : editingWorkout
                  ? "수정"
                  : "저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
