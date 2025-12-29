import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { SESSION_LENGTHS } from '../../utils/constants';
import { formatTimer } from '../../utils/formatters';

export default function FocusTimer() {
  const [selectedLength, setSelectedLength] = useState<number>(SESSION_LENGTHS.SHORT);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_LENGTHS.SHORT * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedLength * 60);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedLength * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleLengthChange = (minutes: number) => {
    if (!isRunning) {
      setSelectedLength(minutes);
      setTimeLeft(minutes * 60);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-pink-soft-100"></div>
        <h2 className="text-2xl font-bold text-text-primary">TASK & FOCUS</h2>
      </div>

      <div className="text-center mb-6">
        <div className="text-7xl font-bold text-blue-muted-100 mb-6">
          {formatTimer(timeLeft)}
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} />
            Start Focus
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-muted-100 text-text-primary hover:bg-blue-muted-100/10 transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div className="mt-8">
          <p className="text-text-secondary mb-3">Session Length:</p>
          <div className="flex gap-3 justify-center">
            {Object.entries(SESSION_LENGTHS).map(([key, minutes]) => (
              <button
                key={key}
                onClick={() => handleLengthChange(minutes)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLength === minutes
                    ? 'bg-blue-muted-100 text-white'
                    : 'bg-dark-surface text-text-secondary hover:bg-dark-border'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

