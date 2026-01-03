import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'purple';
}

export default function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    pink: 'bg-pink-soft-100/20 text-pink-soft-100 border-pink-soft-100/30',
    blue: 'bg-blue-muted-100/20 text-blue-muted-100 border-blue-muted-100/30',
    purple: 'bg-purple-gentle-100/20 text-purple-gentle-100 border-purple-gentle-100/30',
  };

  return (
    <div className={`card border-2 ${colorClasses[color]} text-center`}>
      <div className="flex items-center justify-center mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="text-5xl font-extrabold text-text-primary mb-1">{value}</div>
      <h3 className="text-lg font-semibold text-text-secondary">{title}</h3>
    </div>
  );
}

