import TeacherChatInterface from '../../../components/teacher-chat-interface';

export default function TeacherChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with AI</h1>
      <TeacherChatInterface />
    </div>
  );
}
