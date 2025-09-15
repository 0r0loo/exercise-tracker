import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Workout, MembershipPayment } from '@/lib/supabase'
import WorkoutModal from './WorkoutModal'

export default function Calendar() {
	const { user } = useAuth()
	const [currentDate, setCurrentDate] = useState(new Date())
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [workouts, setWorkouts] = useState<Workout[]>([])
	const [payments, setPayments] = useState<MembershipPayment[]>([])

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
			// UTC 기준 날짜로 설정하여 데이터베이스와 일관성 유지
			const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
			setSelectedDate(utcDate)
			setIsModalOpen(true)
		}
	}

	// 현재 월의 운동 기록 불러오기
	const fetchWorkouts = async () => {
		if (!user) return

		try {
			const { data, error } = await supabase
				.from('workouts')
				.select('*')
				.eq('user_id', user.id)
				.gte('workout_date', firstDayOfMonth.toISOString().split('T')[0])
				.lte('workout_date', lastDayOfMonth.toISOString().split('T')[0])
				.order('workout_date', { ascending: true })

			if (error) throw error
			setWorkouts(data || [])
		} catch (error) {
			console.error('운동 기록 불러오기 실패:', error)
		}
	}

	// 회비 결제 정보 불러오기 (해당 월의 결제일과 다음 결제 예정일 모두)
	const fetchPayments = async () => {
		if (!user) return

		try {
			const { data, error } = await supabase
				.from('membership_payments')
				.select('*')
				.eq('user_id', user.id)
				.order('payment_date', { ascending: true })

			if (error) throw error

			// 현재 월에 해당하는 결제 정보들만 필터링
			const monthStart = firstDayOfMonth.toISOString().split('T')[0]
			const monthEnd = lastDayOfMonth.toISOString().split('T')[0]

			const filteredPayments = (data || []).filter(payment => {
				const paymentDate = payment.payment_date
				const nextPaymentDate = payment.next_payment_date

				return (paymentDate >= monthStart && paymentDate <= monthEnd) ||
					   (nextPaymentDate >= monthStart && nextPaymentDate <= monthEnd)
			})

			setPayments(filteredPayments)
		} catch (error) {
			console.error('회비 정보 불러오기 실패:', error)
		}
	}

	// 특정 날짜에 운동 기록이 있는지 확인
	const getWorkoutsForDate = (date: Date) => {
		const dateString = date.toISOString().split('T')[0]
		return workouts.filter(workout => workout.workout_date === dateString)
	}

	// 특정 날짜에 회비 관련 정보가 있는지 확인 (결제일 또는 다음 결제 예정일)
	const getPaymentsForDate = (date: Date) => {
		const dateString = date.toISOString().split('T')[0]
		return payments.filter(payment =>
			payment.payment_date === dateString ||
			payment.next_payment_date === dateString
		)
	}

	// 운동 기록 추가 완료 후 호출
	const handleWorkoutAdded = () => {
		fetchWorkouts() // 운동 기록 새로고침
	}

	// 데이터 새로고침 함수
	const fetchAllData = () => {
		fetchWorkouts()
		fetchPayments()
	}

	// 월이 변경되거나 사용자가 로그인할 때 데이터 불러오기
	useEffect(() => {
		fetchAllData()
	}, [user, currentDate])

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
				{calendarDays.map((date, index) => {
					const dayWorkouts = getWorkoutsForDate(date)
					const dayPayments = getPaymentsForDate(date)
					const hasWorkouts = dayWorkouts.length > 0
					const hasPayments = dayPayments.length > 0

					return (
						<div
							key={index}
							onClick={() => handleDateClick(date)}
							className={`
								p-2 min-h-32 flex flex-col items-start justify-start text-sm cursor-pointer rounded-md relative
								${isCurrentMonth(date)
									? 'text-gray-900 hover:bg-blue-50'
									: 'text-gray-400 cursor-not-allowed'
								}
								${isToday(date)
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: ''
								}
								${hasWorkouts && !isToday(date)
									? 'bg-green-50 border border-green-200'
									: ''
								}
								${hasPayments && !isToday(date) && !hasWorkouts
									? 'bg-yellow-50 border border-yellow-200'
									: ''
								}
								${hasPayments && hasWorkouts && !isToday(date)
									? 'bg-gradient-to-br from-green-50 to-yellow-50 border border-green-200'
									: ''
								}
							`}
						>
							<span className="font-medium mb-1">{date.getDate()}</span>

							<div className="flex flex-col gap-0.5 text-xs w-full">
								{/* 운동 기록 표시 */}
								{hasWorkouts && (
									<div className="flex flex-col gap-0.5">
										{dayWorkouts.slice(0, 4).map((workout, idx) => (
											<div
												key={idx}
												className={`
													px-1.5 py-0.5 rounded text-xs
													${isToday(date)
														? 'bg-white/20 text-white'
														: 'bg-green-100 text-green-800'
													}
													overflow-hidden
												`}
											>
												<div className="font-medium truncate">
													{workout.workout_type}
												</div>
												{workout.notes && (
													<div className={`
														text-xs mt-0.5 truncate
														${isToday(date)
															? 'text-white/80'
															: 'text-green-600'
														}
													`}>
														{workout.notes}
													</div>
												)}
											</div>
										))}
										{dayWorkouts.length > 4 && (
											<div className={`
												px-1.5 py-0.5 rounded text-xs font-medium text-center
												${isToday(date)
													? 'bg-white/20 text-white'
													: 'bg-gray-100 text-gray-600'
												}
											`}>
												+{dayWorkouts.length - 4}개 더
											</div>
										)}
									</div>
								)}

								{/* 회비 관련 정보 표시 */}
								{hasPayments && (
									<div className="flex flex-col gap-0.5">
										{dayPayments.map((payment, idx) => {
											const dateString = date.toISOString().split('T')[0]
											const isPaid = payment.payment_date === dateString
											const isDue = payment.next_payment_date === dateString

											return (
												<div
													key={idx}
													className={`
														px-1.5 py-0.5 rounded text-xs
														${isPaid
															? isToday(date)
																? 'bg-green-600/20 text-white border border-green-400/30'
																: 'bg-green-100 text-green-800 border border-green-200'
															: isDue
															? isToday(date)
																? 'bg-yellow-600/20 text-white border border-yellow-400/30'
																: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
															: 'bg-gray-100 text-gray-600'
														}
													`}
												>
													<div className="font-medium truncate">
														{isPaid && '✓ '}
														{isDue && '📅 '}
														{payment.payment_type}
													</div>
													{payment.amount && (
														<div className={`
															text-xs mt-0.5 truncate
															${isPaid
																? isToday(date)
																	? 'text-green-200'
																	: 'text-green-600'
																: isDue
																? isToday(date)
																	? 'text-yellow-200'
																	: 'text-yellow-600'
																: 'text-gray-500'
															}
														`}>
															{payment.amount.toLocaleString()}원
														</div>
													)}
												</div>
											)
										})}
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* 운동 기록 관리 모달 */}
			<WorkoutModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedDate={selectedDate}
				onWorkoutAdded={handleWorkoutAdded}
				existingWorkouts={selectedDate ? getWorkoutsForDate(selectedDate) : []}
			/>
		</div>
	)
}