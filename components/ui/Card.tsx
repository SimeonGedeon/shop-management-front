// components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  title,
  icon,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
