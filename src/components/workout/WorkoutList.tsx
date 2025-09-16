import type { Workout } from "@/lib/supabase";

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (workoutId: string) => void;
  onAddNew: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function WorkoutList({
  workouts,
  onEdit,
  onDelete,
  onAddNew,
  onClose,
  isLoading,
}: WorkoutListProps) {
  const handleDelete = (workoutId: string) => {
    if (!confirm("이 운동 기록을 삭제하시겠습니까?")) return;
    onDelete(workoutId);
  };

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
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
                onClick={() => onEdit(workout)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(workout.id)}
                disabled={isLoading}
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
          onClick={onAddNew}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          운동 추가
        </button>
      </div>
    </div>
  );
}