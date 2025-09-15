"use client";
import { useState, useEffect, useMemo } from "react";
import React from "react";

interface QuizData {
  id: string;
  title: string;
  description?: string;
  html: string; // HTML content with Tailwind CSS
  javascript: string; // JavaScript code to handle interactions
  css?: string; // Optional additional CSS
  context?: string; // Optional context for hints
  metadata?: any;
  teacherId?: string;
  courseId?: string;
  allowedStudents?: string[];
  createdAt?: string;
  reactCode?: string;
  finalizedJson?: any;
}

// Extend Window interface for utility functions
declare global {
  interface Window {
    submitQuiz: (answers: any, onSuccess?: any, onError?: any) => void;
    saveProgress: (questionId: any, answer: any, onSaved?: any) => void;
    getHint: (questionId: any, question: any, onHint?: any) => void;
    checkAnswer: (
      questionId: any,
      userAnswer: any,
      correctAnswer: any,
      onResult?: any
    ) => boolean;
  }
}

export default function StudentQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3004";
  const getApiUrl = (path: string) =>
    `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;

  // Inject CSS if provided
  const injectCss = (css: string) => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  };

  // Inject script safely instead of eval
  const injectScript = (code: string) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = code;
    document.body.appendChild(script);
  };

  // Setup quiz utilities
  const setupUtilities = (quiz: QuizData) => {
    window.submitQuiz = function (answers, onSuccess, onError) {
      console.log("submitQuiz called with:", answers);
      fetch(`${API_BASE_URL}/api/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          email: email,
          answers,
          submitted: true,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Submit response:", data);
          if (onSuccess) onSuccess(data);
        })
        .catch((err) => {
          console.error("Submit error:", err);
          if (onError) onError(err);
        });
    };

    window.saveProgress = function (questionId, answer, onSaved) {
      console.log("saveProgress called:", questionId, answer);
      fetch(`${API_BASE_URL}/api/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          email: email,
          answers: { [questionId]: answer },
          progress: { [questionId]: "incomplete" },
        }),
      })
        .then(() => {
          if (onSaved) onSaved();
        })
        .catch(console.error);
    };

    window.getHint = function (questionId, question, onHint) {
      console.log("getHint called:", questionId, question);
      fetch(`${API_BASE_URL}/api/quizzes/${quiz.id}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qid: questionId,
          question: question,
          context: quiz.context || "",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (onHint) onHint(data.hint || "No hint available");
        })
        .catch(() => {
          if (onHint) onHint("Hint not available");
        });
    };

    window.checkAnswer = function (
      questionId,
      userAnswer,
      correctAnswer,
      onResult
    ) {
      console.log("checkAnswer called:", questionId, userAnswer, correctAnswer);
      const isCorrect =
        String(userAnswer).toLowerCase().trim() ===
        String(correctAnswer).toLowerCase().trim();
      if (onResult) onResult(isCorrect);
      return isCorrect;
    };
  };

  // Load quiz JS + CSS after HTML is rendered
  useEffect(() => {
    if (quiz?.html) {
      console.log("Quiz HTML loaded");

      if (quiz.css) {
        injectCss(quiz.css);
      }

      if (quiz.javascript) {
        setupUtilities(quiz);
        const id = setTimeout(() => {
          console.log("Injecting quiz JS...");
          console.log("Quiz JS to inject:", quiz.javascript);
          injectScript(quiz.javascript);
        }, 200);
        return () => clearTimeout(id);
      }
    }
  }, [quiz]);

  // Fetch quiz after verification
  useEffect(() => {
    if (verified) {
      setError(null);
      setLoading(true);
      const emailQuery = email
        ? `?email=${encodeURIComponent(email)}&format=html`
        : "?format=html";
      fetch(getApiUrl(`/api/quizzes/${params.id}${emailQuery}`))
        .then((res) => res.json())
        .then((data) => {
          if (!data || data.error) {
            setError(data?.error || "Quiz not found");
            setQuiz(null);
            return;
          }
          const quizData = data.quiz || data;
          setQuiz(quizData);
        })
        .catch(() => setError("Failed to load quiz"))
        .finally(() => setLoading(false));
    }
  }, [verified, params.id, email]);

  const handleVerify = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setVerifying(true);
    setError(null);
    setVerified(true);
    setVerifying(false);
  };

  // Fallback quiz component
  const FallbackQuizComponent = useMemo(() => {
    if (!quiz?.finalizedJson?.questions) return null;

    return function FallbackQuiz() {
      const [answers, setAnswers] = useState<Record<string, any>>({});
      const questions = quiz.finalizedJson.questions;

      const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      };

      const handleSubmit = () => {
        console.log("Quiz submitted:", answers);
        alert("Quiz submitted successfully!");
      };

      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {quiz.title}
            </h2>
            {quiz.description && (
              <p className="text-gray-600 text-lg">{quiz.description}</p>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((question: any, index: number) => (
              <div
                key={question.id || index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {index + 1}. {question.question || question.text}
                </h3>

                {question.type === "multiple-choice" && question.options ? (
                  <div className="space-y-3">
                    {question.options.map(
                      (option: string, optIndex: number) => (
                        <label
                          key={optIndex}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={optIndex}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id || `q${index}`,
                                e.target.value
                              )
                            }
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 flex-1">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                ) : (
                  <textarea
                    placeholder="Type your answer here..."
                    rows={4}
                    onChange={(e) =>
                      handleAnswerChange(
                        question.id || `q${index}`,
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-8">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      );
    };
  }, [quiz]);

  // Email verification screen
  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Your Email
            </h1>
            <p className="text-gray-600">
              Please enter your email address to start the quiz.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={verifying}
            />

            <button
              onClick={handleVerify}
              disabled={!email.trim() || verifying}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {verifying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 
                      3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting...
                </>
              ) : (
                "Start Quiz"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Quiz
          </h2>
          <p className="text-gray-500">
            Please wait while we prepare your interactive quiz...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 
                1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 
                0L4.082 16.5c-.77.833.192 2.5 
                1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => setVerified(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Email Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quiz Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {quiz?.title || "Interactive Quiz"}
              </h1>
              {quiz?.description && (
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Student</p>
              <p className="text-sm font-medium text-gray-700">{email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-gray-50 rounded-xl min-h-[600px]">
          {quiz?.html ? (
            <div
              className="quiz-content"
              dangerouslySetInnerHTML={{ __html: quiz.html }}
            />
          ) : FallbackQuizComponent ? (
            <FallbackQuizComponent />
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 
                    4h13.856c1.54 0 2.502-1.667 
                    1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 
                    0L4.082 16.5c-.77.833.192 2.5 
                    1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No quiz content available
              </h2>
              <p className="text-gray-600">
                The quiz could not be loaded. Please try again later.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
