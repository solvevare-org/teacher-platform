"use client"
import { useState, useEffect } from 'react';

export default function StudentQuizPage({ params }: { params: { id: string } }) {
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [progress, setProgress] = useState<Record<string, 'correct' | 'incorrect' | 'incomplete'>>({});
  const [hints, setHints] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004';
  const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;

  useEffect(() => {
    if (verified) {
      setError(null);
      const emailQuery = email ? `?email=${encodeURIComponent(email)}` : ''
      fetch(getApiUrl(`/api/quizzes/${params.id}${emailQuery}`))
        .then(res => res.json())
        .then(data => {
          if (!data || data.error) {
            setError(data?.error || 'Quiz not found');
            setQuiz(null);
            return;
          }
          setQuiz(data.quiz || data);
        })
        .catch(() => setError('Failed to load quiz'));
      // Prefill saved answers via attempts API
      fetch(getApiUrl(`/api/attempts?quizId=${encodeURIComponent(params.id)}&email=${encodeURIComponent(email)}`))
        .then(res => res.json())
        .then(data => {
          if (data?.attempt) {
            setAnswers(data.attempt.answers || {});
            setProgress(data.attempt.progress || {});
            if (data.attempt.submitted) {
              setScore(data.attempt.score || Object.values(data.attempt.progress || {}).filter((p: any) => p === 'correct').length);
              setSubmitted(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [verified, params.id, email]);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, check if user has already submitted this quiz
      const attemptRes = await fetch(getApiUrl(`/api/attempts?quizId=${encodeURIComponent(params.id)}&email=${encodeURIComponent(email)}`));
      const attemptData = await attemptRes.json();
      
      if (attemptData?.attempt?.submitted) {
        // User has already submitted, redirect to score page
        console.log('User already submitted, showing score page');
        
        // First load the quiz data, then set the attempt data
        const quizRes = await fetch(getApiUrl(`/api/quizzes/${params.id}`));
        const quizData = await quizRes.json();
        
        if (quizData?.quiz || quizData) {
          setQuiz(quizData.quiz || quizData);
          setAnswers(attemptData.attempt.answers || {});
          setProgress(attemptData.attempt.progress || {});
          setScore(attemptData.attempt.score || Object.values(attemptData.attempt.progress || {}).filter((p: any) => p === 'correct').length);
          setSubmitted(true);
        } else {
          setError('Failed to load quiz data');
        }
        setLoading(false);
        return;
      }
      
      // If not submitted, check if email is allowed for this quiz
      const peek = await fetch(getApiUrl(`/api/quizzes/${params.id}`)).then(r => r.json()).catch(() => null as any)
      const list = (peek?.quiz?.allowedStudents ?? peek?.allowedStudents) as string[] | undefined
      if (!Array.isArray(list) || list.length === 0) {
        setVerified(true)
        setLoading(false)
        return
      }
      
      // Otherwise, validate email against backend
      const res = await fetch(getApiUrl(`/api/quizzes/${params.id}/verify`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
      setVerified(!!data.allowed);
      if (!data.allowed && data.error) setError(data.error);
    } catch {
      setError('Network error');
    } finally {
    setLoading(false);
    }
  };

  const handleAnswerChange = (qid: string, value: string | number) => {
    // If already checked, do not allow edits
    if (progress[qid] === 'correct' || progress[qid] === 'incorrect') return;
    setAnswers((prev: any) => ({ ...prev, [qid]: value }));
    setProgress((prev) => ({ ...prev, [qid]: 'incomplete' }));
    // Auto-save upsert to attempts API with partial answers
    fetch(getApiUrl(`/api/attempts`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: params.id, email, answers: { [qid]: value }, progress: { [qid]: 'incomplete' } }),
    }).catch(() => {});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Submitting quiz with:', { quizId: params.id, email, submitted: true, progress, answers });
      
      const res = await fetch(getApiUrl(`/api/attempts`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: params.id, email, submitted: true, answers, progress }),
    });
      
      console.log('Response status:', res.status);
    const data = await res.json();
      console.log('Submission response:', data);
      
      if (typeof data.score === 'number') {
    setScore(data.score);
      } else {
        // If no score returned, calculate it from progress
        const correctCount = Object.values(progress).filter(p => p === 'correct').length;
        console.log('Calculated score from progress:', correctCount);
        setScore(correctCount);
      }
    setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit');
    } finally {
    setLoading(false);
    }
  };

  if (score !== null || submitted) {
    const questions = Array.isArray(quiz?.finalizedJson?.questions) ? quiz.finalizedJson.questions : [];
    const totalQuestions = questions.length;
    const finalScore = score !== null ? score : Object.values(progress).filter(p => p === 'correct').length;
    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;
    
    console.log('Score page debug:', { 
      quiz: !!quiz, 
      totalQuestions, 
      finalScore, 
      percentage, 
      questions: questions.length,
      quizData: quiz?.finalizedJson 
    });
    
    // If we don't have quiz data yet, show loading
    if (!quiz || totalQuestions === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-gray-600 text-lg">Loading quiz results...</div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Quiz Complete!</h1>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{quiz?.finalizedJson?.title || 'Quiz Results'}</h2>
              <div className="text-sm text-gray-600 mb-4">
                {submitted ? 'Your quiz has been submitted and scored.' : 'Quiz results'}
              </div>
              
              {/* Score Display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-green-600 mb-2">{finalScore}/{totalQuestions}</div>
                <div className="text-2xl text-gray-600 mb-2">{percentage}%</div>
                <div className="text-lg text-gray-500">
                  {percentage >= 80 ? 'Excellent work!' : 
                   percentage >= 60 ? 'Good job!' : 
                   percentage >= 40 ? 'Keep practicing!' : 'Try again!'}
                </div>
              </div>
              
              {/* Detailed Results */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Question Review:</h3>
                {questions.map((q: any, idx: number) => {
                  const qid = q.id || String(idx);
                  const userAnswer = answers[qid];
                  const isCorrect = progress[qid] === 'correct';
                  const isMCQ = Array.isArray(q.options);
                  
    return (
                    <div key={qid} className={`p-3 rounded-lg border-l-4 ${
                      isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                    }`}>
                      <div className="font-medium text-gray-800 mb-1">
                        Q{idx + 1}: {q.question}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Your answer: {isMCQ && userAnswer !== '' ? q.options[Number(userAnswer)] : userAnswer || 'No answer'}</div>
                        {isMCQ && (
                          <div>Correct answer: {q.options[q.correctAnswer]}</div>
                        )}
                        {q.explanation && (
                          <div className="mt-1 text-blue-600">Explanation: {q.explanation}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Quiz Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Enter your email to start the quiz</h2>
            {error && <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}
        <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full mb-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email"
              type="email"
            />
            <button 
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" 
              onClick={handleVerify} 
              disabled={loading || !email}
            >
              {loading ? 'Verifying...' : 'Start Quiz'}
        </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 text-lg font-semibold">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-600 text-lg">Loading quiz...</div>
          </div>
        </div>
      </div>
    );
  }

  // Derive finalized structure
  const qjson = quiz.finalizedJson || quiz
  const questions: any[] = Array.isArray(qjson?.questions) ? qjson.questions : []
  const title: string = qjson?.title || 'Quiz'

  const currentQ = questions[currentQuestion];
  const qid = currentQ?.id || String(currentQuestion);
  const value = answers[qid] ?? '';
  const isMCQ = Array.isArray(currentQ?.options);
  const state = progress[qid];
  const isLocked = state === 'correct' || state === 'incorrect';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">{title}</h1>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Questions Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Questions</h3>
          
          {currentQ && (
            <div className="mb-6">
              <div className="font-semibold text-lg mb-4 text-gray-800">
                Q{currentQuestion + 1}: {currentQ.question}
              </div>
              
              {isMCQ ? (
            <select
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={value}
                  onChange={e => handleAnswerChange(qid, e.target.value)}
                  disabled={submitted || isLocked}
                >
                  <option value="">-- Select an option --</option>
                  {currentQ.options.map((opt: string, i: number) => (
                    <option key={i} value={i}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={value}
                  onChange={e => handleAnswerChange(qid, e.target.value)}
                  disabled={submitted || isLocked}
                  placeholder="Enter your answer"
                />
              )}
              
              <div className="mt-4 flex gap-3 items-center">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  type="button"
                  onClick={async () => {
                    if (currentQ?.hint) {
                      setHints(prev => ({ ...prev, [qid]: String(currentQ.hint) }))
                    } else {
                      const res = await fetch(getApiUrl(`/api/quizzes/${params.id}/hint`), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ qid, question: currentQ.question, context: qjson.context || '' }),
                      });
                      const data = await res.json();
                      setHints(prev => ({ ...prev, [qid]: String(data.hint || '') }))
                    }
                  }}
                >
                  Hint
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  type="button"
                  onClick={() => {
                    if (isLocked) return
                    if (isMCQ && currentQ.correctAnswer !== undefined && value !== '') {
                      const correct = Number(value) === Number(currentQ.correctAnswer)
                      const next = correct ? 'correct' : 'incorrect'
                      setProgress(prev => ({ ...prev, [qid]: next }))
                      // Optional: persist progress
                      fetch(getApiUrl(`/api/attempts`), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quizId: params.id, email, progress: { [qid]: next } }),
                      }).catch(() => {})
                    }
                  }}
                  disabled={isLocked || value === ''}
                >
                  Check
                </button>
                {state === 'correct' && <span className="text-green-600 font-semibold">Correct!</span>}
                {state === 'incorrect' && <span className="text-red-600 font-semibold">Incorrect.</span>}
              </div>
              
              {hints[qid] && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="text-sm text-blue-800">
                    <strong>Hint:</strong> {hints[qid]}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Next
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button 
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit} 
            disabled={submitted || loading}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
      </button>
        </div>
      </div>
    </div>
  );
}
