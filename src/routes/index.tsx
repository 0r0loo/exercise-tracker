import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";
import Calendar from "@/components/Calendar";
import PaymentModal from "@/components/PaymentModal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { MembershipPayment } from "@/lib/supabase";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { user, loading, signOut } = useAuth();
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [refreshCalendar, setRefreshCalendar] = useState(0);
	const [allPayments, setAllPayments] = useState<MembershipPayment[]>([]);

	// 모든 회비 기록 가져오기
	const fetchAllPayments = async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase
				.from('membership_payments')
				.select('*')
				.eq('user_id', user.id)
				.order('payment_date', { ascending: false });

			if (error) throw error;
			setAllPayments(data || []);
		} catch (error) {
			console.error('회비 기록 불러오기 실패:', error);
		}
	};

	// 사용자가 로그인했을 때 회비 기록 불러오기
	useEffect(() => {
		if (user) {
			fetchAllPayments();
		}
	}, [user]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">로딩 중...</div>
			</div>
		);
	}

	if (!user) {
		return <Auth />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<h1 className="text-3xl font-bold text-gray-900">운동 스케줄 관리</h1>
						<div className="flex items-center space-x-4">
							<span className="text-gray-700">{user.email}</span>
							<button
								onClick={signOut}
								className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
							>
								로그아웃
							</button>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="mb-6">
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-2xl font-semibold text-gray-700">
									환영합니다! {user.email}
								</h2>
								<p className="text-gray-500">
									운동 기록과 회비 관리를 시작해보세요.
								</p>
							</div>
							<button
								onClick={() => setIsPaymentModalOpen(true)}
								className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								<span>회비 등록</span>
							</button>
						</div>
					</div>

					<Calendar key={refreshCalendar} />

					{/* 회비 결제 모달 */}
					<PaymentModal
						isOpen={isPaymentModalOpen}
						onClose={() => setIsPaymentModalOpen(false)}
						onPaymentAdded={() => {
							setRefreshCalendar(prev => prev + 1)
							fetchAllPayments()
						}}
						existingPayments={allPayments}
					/>
				</div>
			</main>
		</div>
	);
}
