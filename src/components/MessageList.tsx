import type { Message } from './ChatWindow';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div role="list">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
    </div>
  );
}
