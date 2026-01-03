import { STATS_PERIODS } from '../../utils/constants';

interface StatsPeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PERIOD_LABELS: Record<string, string> = {
  [STATS_PERIODS.TODAY]: 'Today',
  [STATS_PERIODS.WEEK]: 'This Week',
  [STATS_PERIODS.MONTH]: 'This Month',
  [STATS_PERIODS.YEAR]: 'This Year',
  [STATS_PERIODS.ALL_TIME]: 'All Time',
};

export default function StatsPeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: StatsPeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {Object.values(STATS_PERIODS).map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === period
              ? 'bg-purple-gentle-100 text-white'
              : 'bg-dark-surface text-text-secondary hover:bg-dark-border'
          }`}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}

