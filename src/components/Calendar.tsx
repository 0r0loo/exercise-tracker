import { useState } from 'react'
import WorkoutModal from './WorkoutModal'

export default function Calendar() {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)

	// 현재 월의 첫 번째 날과 마지막 날
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
	const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

	// 달력 시작일 (첫 번째 주의 일요일)
	const startDate = new Date(firstDayOfMonth)
	startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())

	// 달력 종료일 (마지막 주의 토요일)
	const endDate = new Date(lastDayOfMonth)
	endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()))

	// 달력에 표시할 모든 날짜들
	const calendarDays = []
	const current = new Date(startDate)

	while (current <= endDate) {
		calendarDays.push(new Date(current))
		current.setDate(current.getDate() + 1)
	}

	// 이전 달로 이동
	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
	}

	// 다음 달로 이동
	const goToNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
	}

	// 현재 월인지 확인
	const isCurrentMonth = (date: Date) => {
		return date.getMonth() === currentDate.getMonth()
	}

	// 오늘 날짜인지 확인
	const isToday = (date: Date) => {
		const today = new Date()
		return date.toDateString() === today.toDateString()
	}

	// 날짜 클릭 핸들러
	const handleDateClick = (date: Date) => {
		if (isCurrentMonth(date)) {
			setSelectedDate(date)
			setIsModalOpen(true)
		}
	}

	// 운동 기록 추가 완료 후 호출
	const handleWorkoutAdded = () => {
		// 추후 운동 기록 목록을 새로고침하는 로직 추가
		console.log('운동 기록이 추가되었습니다!')
	}

	return (
		<div className="bg-white shadow rounded-lg p-6">
			{/* 달력 헤더 */}
			<div className="flex items-center justify-between mb-4">
				<button
					onClick={goToPreviousMonth}
					className="p-2 hover:bg-gray-100 rounded-md"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				<h2 className="text-xl font-semibold text-gray-900">
					{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
				</h2>

				<button
					onClick={goToNextMonth}
					className="p-2 hover:bg-gray-100 rounded-md"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			{/* 요일 헤더 */}
			<div className="grid grid-cols-7 gap-1 mb-2">
				{['일', '월', '화', '수', '목', '금', '토'].map((day) => (
					<div
						key={day}
						className="p-2 text-center text-sm font-medium text-gray-700"
					>
						{day}
					</div>
				))}
			</div>

			{/* 달력 날짜들 */}
			<div className="grid grid-cols-7 gap-1">
				{calendarDays.map((date, index) => (
					<div
						key={index}
						onClick={() => handleDateClick(date)}
						className={`
							p-2 h-10 flex items-center justify-center text-sm cursor-pointer rounded-md
							${isCurrentMonth(date)
								? 'text-gray-900 hover:bg-blue-50'
								: 'text-gray-400 cursor-not-allowed'
							}
							${isToday(date)
								? 'bg-blue-600 text-white hover:bg-blue-700'
								: ''
							}
						`}
					>
						{date.getDate()}
					</div>
				))}
			</div>

			{/* 운동 기록 추가 모달 */}
			<WorkoutModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedDate={selectedDate}
				onWorkoutAdded={handleWorkoutAdded}
			/>
		</div>
	)
}