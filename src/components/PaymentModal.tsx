import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { paymentCycles, paymentTypes } from '@/lib/supabase'
import type { MembershipPayment } from '@/lib/supabase'

interface PaymentModalProps {
	isOpen: boolean
	onClose: () => void
	onPaymentAdded: () => void
	existingPayments?: MembershipPayment[]
}

export default function PaymentModal({ isOpen, onClose, onPaymentAdded, existingPayments = [] }: PaymentModalProps) {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
	const [amount, setAmount] = useState('')
	const [selectedCycle, setSelectedCycle] = useState(paymentCycles[3]) // 기본값: 1개월
	const [paymentType, setPaymentType] = useState(paymentTypes[0]) // 기본값: 헬스장
	const [editingPayment, setEditingPayment] = useState<MembershipPayment | null>(null)
	const [mode, setMode] = useState<"add" | "list">("list")

	// 모달이 열릴 때 모드 초기화
	useEffect(() => {
		if (isOpen) {
			setMode(existingPayments.length > 0 ? "list" : "add")
			setEditingPayment(null)
			setPaymentDate(new Date().toISOString().split('T')[0])
			setAmount('')
			setSelectedCycle(paymentCycles[3])
			setPaymentType(paymentTypes[0])
		}
	}, [isOpen, existingPayments.length])

	// 수정 모드로 전환
	const handleEdit = (payment: MembershipPayment) => {
		setEditingPayment(payment)
		setPaymentDate(payment.payment_date)
		setAmount(payment.amount.toString())
		setPaymentType(payment.payment_type)
		// 결제 주기 찾기
		const cycle = paymentCycles.find(c =>
			c.type === payment.payment_cycle_type && c.value === payment.payment_cycle_value
		)
		if (cycle) {
			setSelectedCycle(cycle)
		}
		setMode("add")
	}

	// 회비 기록 삭제
	const handleDelete = async (paymentId: string) => {
		if (!confirm("이 회비 기록을 삭제하시겠습니까?")) return

		setLoading(true)
		try {
			const { error } = await supabase
				.from("membership_payments")
				.delete()
				.eq("id", paymentId)

			if (error) throw error

			onPaymentAdded()
			if (existingPayments.length <= 1) {
				onClose()
			}
		} catch (error) {
			console.error("회비 기록 삭제 실패:", error)
			alert("회비 기록 삭제에 실패했습니다.")
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user || !paymentDate || !amount || !selectedCycle || !paymentType) return

		setLoading(true)
		try {
			if (editingPayment) {
				// 수정
				const { error } = await supabase
					.from('membership_payments')
					.update({
						payment_date: paymentDate,
						amount: parseFloat(amount),
						payment_cycle_type: selectedCycle.type,
						payment_cycle_value: selectedCycle.value,
						payment_type: paymentType
					})
					.eq('id', editingPayment.id)

				if (error) throw error
			} else {
				// 추가
				const { error } = await supabase
					.from('membership_payments')
					.insert([
						{
							user_id: user.id,
							payment_date: paymentDate,
							amount: parseFloat(amount),
							payment_cycle_type: selectedCycle.type,
							payment_cycle_value: selectedCycle.value,
							payment_type: paymentType
						}
					])

				if (error) throw error
			}

			// 성공 시 폼 초기화
			setPaymentDate(new Date().toISOString().split('T')[0])
			setAmount('')
			setSelectedCycle(paymentCycles[3])
			setPaymentType(paymentTypes[0])
			setEditingPayment(null)
			onPaymentAdded()

			if (editingPayment || existingPayments.length === 0) {
				onClose()
			} else {
				setMode("list")
			}
		} catch (error) {
			console.error('회비 결제 기록 추가 실패:', error)
			alert('회비 결제 기록 추가에 실패했습니다.')
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-900">
						{mode === "list"
							? "회비 기록 관리"
							: editingPayment
							? "회비 기록 수정"
							: "회비 결제 기록"}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<title>닫기</title>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{mode === "list" ? (
					// 회비 기록 목록 표시
					<div className="space-y-4">
						{existingPayments.map((payment) => (
							<div
								key={payment.id}
								className="border border-gray-200 rounded-lg p-4"
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">
											{payment.payment_type}
										</h4>
										<p className="text-sm text-gray-600 mt-1">
											결제일: {new Date(payment.payment_date).toLocaleDateString('ko-KR')}
										</p>
										<p className="text-sm text-gray-600">
											금액: {payment.amount.toLocaleString()}원
										</p>
										<p className="text-sm text-gray-600">
											다음 결제일: {new Date(payment.next_payment_date).toLocaleDateString('ko-KR')}
										</p>
									</div>
									<div className="flex space-x-2 ml-3">
										<button
											type="button"
											onClick={() => handleEdit(payment)}
											className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											수정
										</button>
										<button
											type="button"
											onClick={() => handleDelete(payment.id)}
											disabled={loading}
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
								onClick={() => setMode("add")}
								className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
							>
								회비 추가
							</button>
						</div>
					</div>
				) : (
					// 회비 기록 추가/수정 폼
					<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							결제일 *
						</label>
						<input
							type="date"
							value={paymentDate}
							onChange={(e) => setPaymentDate(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							결제 금액 *
						</label>
						<div className="relative">
							<input
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="150000"
								required
								min="0"
								step="1000"
								className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<span className="absolute right-3 top-2 text-gray-500">원</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							회비 종류 *
						</label>
						<select
							value={paymentType}
							onChange={(e) => setPaymentType(e.target.value)}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{paymentTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							결제 주기 *
						</label>
						<select
							value={JSON.stringify(selectedCycle)}
							onChange={(e) => setSelectedCycle(JSON.parse(e.target.value))}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{paymentCycles.map((cycle, index) => (
								<option key={index} value={JSON.stringify(cycle)}>
									{cycle.label}
								</option>
							))}
						</select>
					</div>

					<div className="bg-blue-50 p-3 rounded-md">
						<p className="text-sm text-blue-800">
							💡 다음 결제 예정일이 자동으로 계산됩니다
						</p>
					</div>

					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={() => {
								if (existingPayments.length > 0) {
									setMode("list")
								} else {
									onClose()
								}
							}}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							{existingPayments.length > 0 ? "돌아가기" : "취소"}
						</button>
						<button
							type="submit"
							disabled={loading || !amount}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
						>
							{loading
								? "저장 중..."
								: editingPayment
								? "수정"
								: "저장"}
						</button>
					</div>
					</form>
				)}
			</div>
		</div>
	)
}