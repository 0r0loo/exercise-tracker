import CalendarDay from './CalendarDay';
import type { Workout, MembershipPayment } from "@/lib/supabase";

interface CalendarGridProps {
  calendarDays: Date[];
  isCurrentMonth: (date: Date) => boolean;
  getWorkoutsForDate: (date: Date) => Workout[];
  getPaymentsForDate: (date: Date) => MembershipPayment[];
  onDateClick: (date: Date) => void;
}

export default function CalendarGrid({
  calendarDays,
  isCurrentMonth,
  getWorkoutsForDate,
  getPaymentsForDate,
  onDateClick,
}: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {calendarDays.map((date, index) => (
        <CalendarDay
          key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
          date={date}
          isCurrentMonth={isCurrentMonth(date)}
          workouts={getWorkoutsForDate(date)}
          payments={getPaymentsForDate(date)}
          onClick={onDateClick}
        />
      ))}
    </div>
  );
}