import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useWorkouts } from "@/hooks/useWorkouts";
import { usePayments } from "@/hooks/usePayments";
import WorkoutModal from "./WorkoutModal";
import CalendarHeader from "./calendar/CalendarHeader";
import WeekHeader from "./calendar/WeekHeader";
import CalendarGrid from "./calendar/CalendarGrid";

export default function Calendar() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 달력 로직
  const {
    currentDate,
    calendarDays,
    monthRange,
    goToPreviousMonth,
    goToNextMonth,
    isCurrentMonth,
  } = useCalendar();

  // 운동 기록 로직
  const {
    getWorkoutsForDate,
    refreshWorkouts,
  } = useWorkouts({
    userId: user?.id,
    monthRange,
  });

  // 회비 정보 로직
  const {
    getPaymentsForDate,
  } = usePayments({
    userId: user?.id,
    monthRange,
  });

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (isCurrentMonth(date)) {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  // 운동 기록 추가 완료 후 호출
  const handleWorkoutAdded = () => {
    refreshWorkouts();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <WeekHeader />

      <CalendarGrid
        calendarDays={calendarDays}
        isCurrentMonth={isCurrentMonth}
        getWorkoutsForDate={getWorkoutsForDate}
        getPaymentsForDate={getPaymentsForDate}
        onDateClick={handleDateClick}
      />

      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onWorkoutAdded={handleWorkoutAdded}
        existingWorkouts={selectedDate ? getWorkoutsForDate(selectedDate) : []}
      />
    </div>
  );
}