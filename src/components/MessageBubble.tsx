import type { Role } from './ChatWindow';
import { Markdown } from '@/utils/markdown';

export default function MessageBubble({
  role,
  content,
}: {
  role: Role;
  content: string;
}) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
    >
      <div
        className={`
          px-4 py-3 rounded-xl max-w-[80%] shadow-sm border
          ${isUser
            ? 'bg-gray-800 text-gray-100 border-gray-700'
            : 'bg-[#1e1e1e] text-gray-200 border-gray-700'}
        `}
      >
        {isUser ? content : <Markdown content={content} />}
      </div>
    </div>
  );
}
