interface WorkoutModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedDate: Date | null;
  children: React.ReactNode;
}

export default function WorkoutModalWrapper({
  isOpen,
  onClose,
  title,
  selectedDate,
  children,
}: WorkoutModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>닫기</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {selectedDate && (
          <p className="text-sm text-gray-600 mb-4">
            날짜: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월{" "}
            {selectedDate.getDate()}일
          </p>
        )}

        {children}
      </div>
    </div>
  );
}