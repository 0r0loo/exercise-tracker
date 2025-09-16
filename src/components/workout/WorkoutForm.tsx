import { useState, useEffect } from "react";
import type { Workout } from "@/lib/supabase";

interface WorkoutFormProps {
  onSubmit: (data: { workoutType: string; notes: string }) => Promise<void>;
  onCancel: () => void;
  editingWorkout?: Workout | null;
  isLoading: boolean;
  hasExistingWorkouts: boolean;
}

export default function WorkoutForm({
  onSubmit,
  onCancel,
  editingWorkout,
  isLoading,
  hasExistingWorkouts,
}: WorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState("");
  const [notes, setNotes] = useState("");

  const workoutTypes = ["주짓수", "헬스", "러닝", "사이클링", "기타"];

  // 편집 모드일 때 초기값 설정
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutType(editingWorkout.workout_type);
      setNotes(editingWorkout.notes || "");
    } else {
      setWorkoutType("");
      setNotes("");
    }
  }, [editingWorkout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType) return;

    await onSubmit({ workoutType, notes });
  };

  return (
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
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {hasExistingWorkouts ? "돌아가기" : "취소"}
        </button>
        <button
          type="submit"
          disabled={isLoading || !workoutType}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? "저장 중..."
            : editingWorkout
            ? "수정"
            : "저장"}
        </button>
      </div>
    </form>
  );
}