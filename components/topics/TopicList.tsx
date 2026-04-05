interface TopicItem {
  id: string;
  title: string;
  status: string;
}

interface TopicListProps {
  items: TopicItem[];
  onSelect?: (id: string) => void;
  selectedIds?: string[];
}

export function TopicList({ items, onSelect, selectedIds = [] }: TopicListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
            selectedIds.includes(item.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect?.(item.id)}
        >
          {onSelect && (
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => onSelect(item.id)}
              className="rounded"
            />
          )}
          <span className="flex-1 text-sm">{item.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.status === 'completed' ? 'bg-green-100 text-green-700' :
            item.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
            item.status === 'failed' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
