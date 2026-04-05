'use client';

interface GenerationProgressProps {
  step: string;
  progress: number;
  isComplete?: boolean;
  error?: string;
}

export function GenerationProgress({ step, progress, isComplete, error }: GenerationProgressProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{step}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            error ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {isComplete && <p className="text-xs text-green-600 mt-2">✓ Complete</p>}
    </div>
  );
}
