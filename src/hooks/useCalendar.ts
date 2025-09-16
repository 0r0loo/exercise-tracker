import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday
} from 'date-fns';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 달력 날짜 계산
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 날짜 유틸리티 함수들
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);
  const isTodayDate = (date: Date) => isToday(date);

  // 월 범위 정보
  const monthRange = {
    start: format(firstDayOfMonth, 'yyyy-MM-dd'),
    end: format(lastDayOfMonth, 'yyyy-MM-dd')
  };

  return {
    currentDate,
    calendarDays,
    monthRange,
    goToPreviousMonth,
    goToNextMonth,
    isCurrentMonth,
    isTodayDate,
  };
}