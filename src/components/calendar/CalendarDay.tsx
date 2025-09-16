import type { MembershipPayment, Workout } from "@/lib/supabase";
import { format, isToday } from "date-fns";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  workouts: Workout[];
  payments: MembershipPayment[];
  onClick: (date: Date) => void;
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  workouts,
  payments,
  onClick,
}: CalendarDayProps) {
  const hasWorkouts = workouts.length > 0;
  const hasPayments = payments.length > 0;
  const isTodayDate = isToday(date);

  const getDayClasses = () => {
    let classes =
      "p-2 min-h-32 flex flex-col items-start justify-start text-sm cursor-pointer rounded-md relative";

    if (isCurrentMonth) {
      classes += " text-gray-900 hover:bg-blue-50";
    } else {
      classes += " text-gray-400 cursor-not-allowed";
    }

    if (isTodayDate) {
      classes += " bg-blue-600 text-white hover:bg-blue-700";
    } else if (hasWorkouts && hasPayments) {
      classes +=
        " bg-gradient-to-br from-green-50 to-yellow-50 border border-green-200";
    } else if (hasWorkouts) {
      classes += " bg-green-50 border border-green-200";
    } else if (hasPayments) {
      classes += " bg-yellow-50 border border-yellow-200";
    }

    return classes;
  };

  const handleClick = () => {
    if (isCurrentMonth) {
      onClick(date);
    }
  };

  return (
    <div onClick={handleClick} className={getDayClasses()}>
      <span className="font-medium mb-1">{date.getDate()}</span>

      <div className="flex flex-col gap-0.5 text-xs w-full">
        {/* 운동 기록 표시 */}
        {hasWorkouts && (
          <div className="flex flex-col gap-0.5">
            {workouts.slice(0, 4).map((workout, idx) => (
              <div
                key={idx}
                className={`
                  px-1.5 py-0.5 rounded text-xs overflow-hidden
                  ${
                    isTodayDate
                      ? "bg-white/20 text-white"
                      : "bg-green-100 text-green-800"
                  }
                `}
              >
                <div className="font-medium truncate">
                  {workout.workout_type}
                </div>
                {workout.notes && (
                  <div
                    className={`
                      text-xs mt-0.5 truncate
                      ${isTodayDate ? "text-white/80" : "text-green-600"}
                    `}
                  >
                    {workout.notes}
                  </div>
                )}
              </div>
            ))}
            {workouts.length > 4 && (
              <div
                className={`
                  px-1.5 py-0.5 rounded text-xs font-medium text-center
                  ${
                    isTodayDate
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
              >
                +{workouts.length - 4}개 더
              </div>
            )}
          </div>
        )}

        {/* 회비 관련 정보 표시 */}
        {hasPayments && (
          <div className="flex flex-col gap-0.5">
            {payments.map((payment, idx) => {
              const dateString = format(date, "yyyy-MM-dd");
              const isPaid = payment.payment_date === dateString;
              const isDue = payment.next_payment_date === dateString;

              return (
                <div
                  key={idx}
                  className={`
                    px-1.5 py-0.5 rounded text-xs
                    ${
                      isPaid
                        ? isToday(date)
                          ? "bg-green-600/20 text-white border border-green-400/30"
                          : "bg-green-100 text-green-800 border border-green-200"
                        : isDue
                          ? isToday(date)
                            ? "bg-yellow-600/20 text-white border border-yellow-400/30"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  <div className="font-medium truncate">
                    {isPaid && "✓ "}
                    {isDue && "📅 "}
                    {payment.payment_type}
                  </div>
                  {payment.amount && (
                    <div
                      className={`
                        text-xs mt-0.5 truncate
                        ${
                          isPaid
                            ? isToday(date)
                              ? "text-green-200"
                              : "text-green-600"
                            : isDue
                              ? isToday(date)
                                ? "text-yellow-200"
                                : "text-yellow-600"
                              : "text-gray-500"
                        }
                      `}
                    >
                      {payment.amount.toLocaleString()}원
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
