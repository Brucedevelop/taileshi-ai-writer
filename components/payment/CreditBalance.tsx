interface CreditBalanceProps {
  credits: number;
  isAdmin?: boolean;
}

export function CreditBalance({ credits, isAdmin }: CreditBalanceProps) {
  return (
    <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
      <span className="text-sm text-blue-600">💳</span>
      <span className="text-sm font-semibold text-blue-700">
        {isAdmin ? '∞ Admin' : `¥${credits.toFixed(2)}`}
      </span>
    </div>
  );
}
