export const ErrorAlert = ({ message, onRetry }) => (
  <div className="max-w-2xl mx-auto my-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-red-400 mb-1">Connection Error</h3>
        <p className="text-red-200 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);
