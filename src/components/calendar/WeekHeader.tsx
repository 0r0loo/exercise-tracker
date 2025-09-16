export default function WeekHeader() {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {dayNames.map((day) => (
        <div
          key={day}
          className="p-2 text-center text-sm font-medium text-gray-700"
        >
          {day}
        </div>
      ))}
    </div>
  );
}