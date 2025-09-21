const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
    <div className="max-w-md w-full bg-[#2d2d2dde] shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-900/50 rounded-full mb-4">
        <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-green-300 text-center mb-2">Something went wrong</h2>
      <p className="text-gray-300 text-center mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

export default ErrorFallback