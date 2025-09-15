import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { paymentCycles, paymentTypes } from '@/lib/supabase'

interface PaymentModalProps {
	isOpen: boolean
	onClose: () => void
	onPaymentAdded: () => void
}

export default function PaymentModal({ isOpen, onClose, onPaymentAdded }: PaymentModalProps) {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
	const [amount, setAmount] = useState('')
	const [selectedCycle, setSelectedCycle] = useState(paymentCycles[3]) // 기본값: 1개월
	const [paymentType, setPaymentType] = useState(paymentTypes[0]) // 기본값: 헬스장

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user || !paymentDate || !amount || !selectedCycle || !paymentType) return

		setLoading(true)
		try {
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

			// 성공 시 폼 초기화 및 모달 닫기
			setPaymentDate(new Date().toISOString().split('T')[0])
			setAmount('')
			setSelectedCycle(paymentCycles[3])
			setPaymentType(paymentTypes[0])
			onPaymentAdded()
			onClose()
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
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-900">
						회비 결제 기록
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

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
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							취소
						</button>
						<button
							type="submit"
							disabled={loading || !amount}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
						>
							{loading ? '저장 중...' : '저장'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}