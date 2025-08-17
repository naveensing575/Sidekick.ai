import ChatWindow from '@/components/ChatWindow'

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return <ChatWindow chatId={params.chatId} />
}
