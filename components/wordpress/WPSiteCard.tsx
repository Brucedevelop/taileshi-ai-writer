interface WPSiteCardProps {
  site: {
    id: string;
    name: string;
    url: string;
    isActive: boolean;
  };
}

export function WPSiteCard({ site }: WPSiteCardProps) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">{site.name}</div>
        <div className="text-sm text-gray-500">{site.url}</div>
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${site.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {site.isActive ? '● Active' : '○ Inactive'}
      </div>
    </div>
  );
}
