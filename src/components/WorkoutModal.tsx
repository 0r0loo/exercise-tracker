import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onWorkoutAdded: () => void;
}

export default function WorkoutModal({
  isOpen,
  onClose,
  selectedDate,
  onWorkoutAdded,
}: WorkoutModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workoutType, setWorkoutType] = useState("");
  const [notes, setNotes] = useState("");

  const workoutTypes = [
    "헬스",
    "수영",
    "요가",
    "러닝",
    "사이클링",
    "필라테스",
    "테니스",
    "농구",
    "축구",
    "기타",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !workoutType) return;

    setLoading(true);
    try {
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

      // 성공 시 폼 초기화 및 모달 닫기
      setWorkoutType("");
      setNotes("");
      onWorkoutAdded();
      onClose();
    } catch (error) {
      console.error("운동 기록 추가 실패:", error);
      alert("운동 기록 추가에 실패했습니다.");
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
            운동 기록 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운동 종류 *
            </label>
            <select
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택사항)
            </label>
            <textarea
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !workoutType}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
