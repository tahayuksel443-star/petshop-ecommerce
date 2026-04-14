import { FaStar } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';

interface ReviewCardProps {
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
  petType?: string;
}

export default function ReviewCard({
  name,
  avatar,
  rating,
  comment,
  date,
  verified = true,
  petType,
}: ReviewCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{name}</p>
            {verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <FiCheck size={10} />
                Doğrulanmış Alışveriş
              </span>
            )}
          </div>
          {petType && (
            <p className="text-xs text-gray-400 mt-0.5">{petType} sahibi</p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">{date}</span>
      </div>

      <div className="flex mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={14}
            className={star <= rating ? 'text-amber-400' : 'text-gray-200'}
          />
        ))}
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">"{comment}"</p>
    </div>
  );
}
