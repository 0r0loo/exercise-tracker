import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";
import Calendar from "@/components/Calendar";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { user, loading, signOut } = useAuth();

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
						<h2 className="text-2xl font-semibold text-gray-700 mb-4">
							환영합니다! {user.email}
						</h2>
						<p className="text-gray-500 mb-6">
							운동 기록과 회비 관리를 시작해보세요.
						</p>
					</div>

					<Calendar />
				</div>
			</main>
		</div>
	);
}
