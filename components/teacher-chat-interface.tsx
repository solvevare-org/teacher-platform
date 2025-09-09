import React, { useState, useEffect } from 'react';
import { useRef, useEffect as useReactEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TeacherChatInterface() {
  // Use JWT from localStorage to auth requests; server infers teacher from token
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
  const getTeacherIdFromToken = (token: string): string => {
    try {
      const payload = JSON.parse(atob((token || '').split('.')[1] || ''));
      return String(payload?.sub || payload?.id || payload?.teacherId || '');
    } catch {
      return '';
    }
  };
  const teacherId = authToken ? getTeacherIdFromToken(authToken) : (typeof window !== 'undefined' ? (localStorage.getItem('teacherId') || '') : '');

  type ChatMessage = {
    role: string;
    content: string;
    filePreview?: string;
    fileType?: string;
    fileUrl?: string;
    fileName?: string;
    quizJson?: any;
    isQuiz?: boolean;
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [worksheetJson, setWorksheetJson] = useState<any>(null);
  const [editJson, setEditJson] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const [quizLink, setQuizLink] = useState('');
  const [lastFileMsgIndex, setLastFileMsgIndex] = useState<number | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);
  const parseBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004';
  const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom on new message
  useReactEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Use global theme; remove local dark mode

  // Fetch chat history for this teacher on mount
  useEffect(() => {
    async function fetchChat() {
      const queryPath = teacherId ? `/api/chats?teacherId=${encodeURIComponent(teacherId)}` : '/api/chats';
      const res = await fetch(getApiUrl(queryPath), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }
      });
      const data = await res.json();
      // New shape: { ok: true, chats: [...] }
      const extractFileMeta = (text: string) => {
        // Parse inline marker: [FILE name=".." type=".."] optional
        const metaRe = /^\[FILE\s+name="([^"]+)"(?:\s+type="([^"]+)")?\]\s*\n?/;
        const m = typeof text === 'string' ? text.match(metaRe) : null;
        if (!m) return { content: text };
        const fileName = m[1];
        const fileType = m[2] || undefined;
        const content = text.replace(metaRe, '');
        return { content, fileName, fileType };
      };

      if (Array.isArray(data.chats)) {
        const msgs = data.chats
          .map((doc: any) => {
            // Prefer normalized fields; fall back to nested message shape
            const role = doc?.role ?? doc?.message?.role;
            const rawContent = (doc?.text ?? doc?.content ?? doc?.message?.content);
            if (!role || typeof rawContent !== 'string') return null;

            const fileName = doc?.fileName ?? doc?.message?.fileName;
            const fileType = doc?.fileType ?? doc?.message?.fileType;
            const fileUrl = doc?.fileUrl ?? doc?.message?.fileUrl;

            // If backend didn't store explicit file fields, try to extract from content marker
            const parsed = (!fileName && !fileType && typeof rawContent === 'string') ? extractFileMeta(rawContent) : { content: rawContent, fileName, fileType };
            const base: any = { role, content: parsed.content };
            if (fileName || fileType || fileUrl) {
              base.fileName = (fileName || parsed.fileName) || undefined;
              base.fileType = (fileType || parsed.fileType) || undefined;
              base.fileUrl = fileUrl || undefined;
            }
            return base;
          })
          .filter((m: any) => m && typeof m.content === 'string' && m.role);
        setMessages(msgs);
        return;
      }
      // Legacy shape: { success, history: [{ messages: [...]}, ...] }
      if (data.success && data.history) {
        const history = data.history
          .flatMap((doc: any) => (doc.messages || []).map((m: any) => ({ ...m })))
          .filter(Boolean);
        setMessages(history);
      }
    }
    fetchChat();
  }, [authToken, teacherId]);

  // Fetch courses and students when publishing
  const fetchCoursesAndStudents = async () => {
    const coursesPath = teacherId ? `/api/courses?teacherId=${encodeURIComponent(teacherId)}` : '/api/courses';
    const res = await fetch(getApiUrl(coursesPath), { headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
    const data = await res.json();
    setCourses(data.courses || []);
    // For demo, fetch all users as students
    const res2 = await fetch(getApiUrl('/api/students'));
    const data2 = await res2.json();
    setStudents(data2.users?.map((u: any) => u.email) || []);
  };

  const handlePublish = async () => {
    setShowPublish(true);
    await fetchCoursesAndStudents();
  };

  const confirmPublish = async () => {
    // Create or update quiz directly
    const finalized = JSON.parse(editJson)
    const createRes = await fetch(getApiUrl('/api/quizzes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
      body: JSON.stringify({
        id: `quiz_${Date.now()}`,
        finalizedJson: finalized,
        filePath: lastUploadedFileName || undefined,
        metadata: { source: 'teacher-chat', generatedFrom: lastUploadedFileName || null },
        courseId: selectedCourse || undefined,
        teacherId: teacherId || undefined,
        allowedStudents: selectedStudents || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    })
    const created = await createRes.json().catch(() => ({} as any))
    const createdId = created?.id || created?.quiz?.id || created?._id || created?.quizId
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004';
    const link = `${baseUrl}/student/quiz/${createdId || `pending`}`;
    setQuizLink(link);
    // also drop it into chat directly under the last uploaded file name if available
    const publishMsg = { role: 'assistant', content: `Quiz published. Share this link: ${link}` } as const
    setMessages(prev => {
      if (lastFileMsgIndex !== null && lastFileMsgIndex >= 0 && lastFileMsgIndex < prev.length) {
        const next = [...prev]
        next.splice(lastFileMsgIndex + 1, 0, publishMsg as any)
        return next
      }
      return [...prev, publishMsg as any]
    });
    // Persist link message
    try {
      await fetch(getApiUrl('/api/chats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({
          teacherId,
          role: 'assistant',
          content: `Quiz published. Share this link: ${link}`,
          message: { role: 'assistant', content: `Quiz published. Share this link: ${link}` },
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {}
  };

  // Compute filtered students and course-specific list
  const courseStudents = React.useMemo(() => {
    const course = courses.find((c: any) => String(c._id) === String(selectedCourse))
    const fromCourse = Array.isArray(course?.students) ? course.students : null
    const base: string[] = fromCourse && fromCourse.length > 0 ? fromCourse.map((s: any) => (typeof s === 'string' ? s : s?.email)).filter(Boolean) : students
    const q = studentQuery.trim().toLowerCase()
    if (!q) return base
    return base.filter((e: string) => String(e).toLowerCase().includes(q))
  }, [courses, selectedCourse, students, studentQuery])

  const allSelected = selectedStudents.length > 0 && selectedStudents.length === courseStudents.length
  const toggleSelectAll = () => setSelectedStudents(prev => allSelected ? [] : [...courseStudents])
  const toggleStudent = (email: string) => setSelectedStudents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');
    try {
      // persist user message
      try {
        const saveUserRes = await fetch(getApiUrl('/api/chats'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
          body: JSON.stringify({
            teacherId,
            role: 'user',
            content: userMessage.content,
            message: userMessage,
            timestamp: new Date().toISOString(),
          }),
        });
        if (!saveUserRes.ok) {
          const err = await saveUserRes.json().catch(() => ({} as any));
          setMessages((prev) => [...prev, { role: 'assistant', content: `Save error: ${err?.error || saveUserRes.status}` }]);
        }
      } catch {}

      const res = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({ message: userMessage.content }),
      });
      const data = await res.json();
      const replyText = data.reply || data.response || data.message || '';
      const assistantMessage = { role: 'assistant', content: replyText };
      setMessages((prev) => [...prev, assistantMessage]);
      // persist assistant message
      try {
        const saveAiRes = await fetch(getApiUrl('/api/chats'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
          body: JSON.stringify({
            teacherId,
            role: 'assistant',
            content: replyText,
            message: assistantMessage,
            timestamp: new Date().toISOString(),
          }),
        });
        if (!saveAiRes.ok) {
          const err = await saveAiRes.json().catch(() => ({} as any));
          setMessages((prev) => [...prev, { role: 'assistant', content: `Save error: ${err?.error || saveAiRes.status}` }]);
        }
      } catch {}
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to get response.' }]);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(selectedFile.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    // capture file locally to avoid any state race
    const fileToSend = file;
    // Show a single combined chat message: file chip + prompt content
    setMessages((prev) => {
      const combined = {
        role: 'user',
        content: (input && input.trim()) ? input.trim() : fileToSend.name,
        fileType: fileToSend.type,
        filePreview: filePreview || undefined,
        fileName: fileToSend.name,
      } as const
      const next = [...prev, combined as any]
      setLastFileMsgIndex(next.length - 1)
      setLastUploadedFileName(fileToSend.name)
      return next
    });
    // Persist file name into chat history
    try {
      await fetch(getApiUrl('/api/chats'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({
          teacherId,
          role: 'user',
          // Embed file meta inline so backends that ignore extra fields still keep it
          content: `[FILE name="${fileToSend.name}" type="${fileToSend.type}"]\n${(input && input.trim()) ? input.trim() : ''}`.trim(),
          message: { role: 'user', content: `[FILE name="${fileToSend.name}" type="${fileToSend.type}"]\n${(input && input.trim()) ? input.trim() : ''}`.trim(), fileName: fileToSend.name, fileType: fileToSend.type },
          fileName: fileToSend.name,
          fileType: fileToSend.type,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {}
    // clear UI file selection immediately
    setFile(null);
    setFilePreview(null);
    // clear prompt from input once sent alongside the file
    if (input && input.trim()) {
      setInput('')
    }

    // Build multipart request and send to parse endpoints
    try {
      let endpoint = '';
      if (fileToSend.type.startsWith('image/')) endpoint = `${parseBase}/api/parse-image`;
      else if (fileToSend.type === 'application/pdf') endpoint = `${parseBase}/api/parse-pdf`;
      else {
      setLoading(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Unsupported file type. Please upload a PDF or an image.' }]);
        return;
      }

      const form = new FormData();
      form.append('file', fileToSend);
      if (input) form.append('prompt', input);

      const res = await fetch(endpoint, {
          method: 'POST',
        headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: form,
        });

        if (!res.ok) {
          // Prefer structured JSON error from server, fall back to plain text
          let errMsg = `Server error: ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.error) errMsg = errJson.error;
          } catch {
            try {
          const txt = await res.text();
              if (txt) errMsg = txt;
            } catch {}
          }
          console.error('[handleUpload] server error', res.status, errMsg);
          setLoading(false);
          // show error in chat as assistant message
          setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
          return;
        }

        const data = await res.json();
        setLoading(false);

        // Show quiz JSON in edit box, not as a chat message
      if (data.quiz && !data.quiz.error) {
        setWorksheetJson(data.quiz);
        setEditJson(JSON.stringify(data.quiz, null, 2));
      } else if (data.text) {
        // fallback to show extracted text if quiz missing
        setEditJson('');
        setWorksheetJson(null);
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
        } else {
          setEditJson('');
          setWorksheetJson(null);
        setMessages((prev) => [...prev, { role: 'assistant', content: data?.quiz?.raw || 'Error generating quiz.' }]);
        }
      } catch (err: any) {
        console.error('[handleUpload] fetch error', err);
        setLoading(false);
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error sending file.' }]);
      }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4">
        {/* Chat Messages */}
            <ScrollArea className="h-96 rounded-md border">
              <div className="p-4 flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="text-muted-foreground text-center">No messages yet.</div>
                )}
          {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-end gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                      <Avatar className="size-8 shrink-0 bg-secondary" />
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm border ${msg.role === 'user' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-muted text-foreground'}`}
                      style={{ wordBreak: 'break-word' }}
                    >
                {(msg.fileUrl || msg.filePreview || (msg.fileType && msg.fileName)) && (
                        <div className="flex items-center gap-2 bg-secondary rounded-md px-2 py-1 mb-1">
                          <span className="text-base">{msg.fileType === 'application/pdf' ? '📄' : '📎'}</span>
                    <span className="text-xs font-medium">{msg.fileName || msg.content}</span>
                {msg.fileUrl && (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-xs">Download</a>
                          )}
                  </div>
                )}
                {msg.isQuiz && msg.quizJson && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditJson(JSON.stringify(msg.quizJson, null, 2))}>Edit Quiz</Button>
                          <Button size="sm" onClick={() => setShowPreview(true)}>Preview Quiz</Button>
                  </div>
                )}
                {msg.content && (
                <span>{msg.content}</span>
                )}
              </div>
              {msg.role === 'user' && (
                      <Avatar className="size-8 shrink-0 bg-primary/10" />
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
                {loading && <div className="text-muted-foreground">AI is typing...</div>}
        </div>
            </ScrollArea>

        {/* Input Bar */}
            <form
              onSubmit={async (e) => {
          e.preventDefault();
          if (file) {
            await handleUpload();
          } else {
            await sendMessage(e);
          }
              }}
              className="flex items-center gap-2"
            >
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md border px-2 h-9 text-base" title="Upload file">
                <span className="leading-none">📎</span>
              <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
            </label>
              <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your prompt..."
              disabled={loading}
                className="flex-1"
            />
            {filePreview && (
                <div className="ml-1 flex items-center gap-1 rounded-md border px-2 h-9 text-xs">
                  <span className="text-base">{file?.type === 'application/pdf' ? '📄' : '📎'}</span>
                  <span className="font-medium truncate max-w-40">{filePreview}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                  onClick={() => { setFile(null); setFilePreview(null); }}
                >
                  ×
                  </Button>
              </div>
            )}
              <Button type="submit" disabled={loading || (!input.trim() && !file)}>
            Send
              </Button>
        </form>

            {/* Quiz JSON Edit/Preview Box */}
        {editJson && (
              <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Generated Questions (JSON)</h4>
            <textarea
                  className="w-full rounded-md border bg-transparent p-2 text-sm"
              rows={10}
              value={editJson}
              onChange={e => setEditJson(e.target.value)}
              style={{ fontFamily: 'monospace' }}
            />
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" onClick={() => setShowPreview(true)}>Preview</Button>
                  <Button variant="default" onClick={handlePublish}>Publish</Button>
            </div>
          </div>
        )}
      </div>
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      <Dialog open={showPublish} onOpenChange={setShowPublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-sm mb-1">Select course</div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse as any}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name || c.title || 'Untitled course'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm mb-1">Allowed students</div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStudentsOpen(v => !v)}
                  className="w-full text-left rounded-md border bg-transparent px-3 py-2 text-sm"
                >
                  {selectedStudents.length > 0 ? `${selectedStudents.length} selected` : 'Select students'}
              </button>
                {studentsOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Input placeholder="Search students..." value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} />
                      <Button type="button" variant="outline" onClick={toggleSelectAll} className="bg-transparent">
                        {allSelected ? 'Clear all' : 'Select all'}
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-auto space-y-1">
                      {courseStudents.length === 0 && (
                        <div className="text-xs text-muted-foreground px-1 py-2">No students</div>
                      )}
                      {courseStudents.map((email: string) => (
                        <label key={email} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer">
                          <input type="checkbox" className="border" checked={selectedStudents.includes(email)} onChange={() => toggleStudent(email)} />
                          <span className="truncate">{email}</span>
                        </label>
                      ))}
            </div>
          </div>
        )}
      </div>
            </div>
            {quizLink && (
              <div className="rounded-md border p-2 text-sm break-all">
                Generated link: {quizLink}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPublish(false)}>Close</Button>
            <Button onClick={confirmPublish}>Generate link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {(() => {
              let toPreview: any = null
              try {
                toPreview = worksheetJson || (editJson ? JSON.parse(editJson) : null)
              } catch {}
              if (!toPreview) {
                return <div className="text-sm text-muted-foreground">No quiz to preview. Generate or paste JSON first.</div>
              }
              const questions: any[] = Array.isArray(toPreview?.questions) ? toPreview.questions : []
              return (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">{questions.length} question(s)</div>
                  {questions.map((q, i) => (
                    <div key={i} className="rounded-md border p-3">
                      <div className="font-medium mb-1">Q{i + 1}. {q?.question || q?.prompt || 'Untitled question'}</div>
                      {Array.isArray(q?.options) && q.options.length > 0 && (
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {q.options.map((opt: any, idx: number) => (
                            <li key={idx}>{typeof opt === 'string' ? opt : (opt?.text || JSON.stringify(opt))}</li>
                          ))}
                        </ul>
                      )}
                      {q?.answer !== undefined && (
                        <div className="mt-2 text-xs text-muted-foreground">Answer: {typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer)}</div>
                      )}
                      {q?.explanation && (
                        <div className="mt-1 text-xs text-muted-foreground">Explanation: {q.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
