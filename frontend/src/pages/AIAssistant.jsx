import { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { askAssistantQuestion } from "../services/api";

const QUICK_PROMPTS = [
  "How do I report illegal dumping?",
  "How long does pothole repair take?",
  "Which department handles streetlights?",
  "How can I track my complaint?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your NagarSeva AI Assistant. I can answer your questions about municipal services, grievance resolution SLAs, department routing, and complaint processes using our grounded municipal policy knowledge base.",
      sources: ["municipal_policy.md"],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const textToSend = questionText || inputQuestion;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInputQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await askAssistantQuestion(textToSend.trim());
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.answer,
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("RAG Assistant API error:", err);
      const msg =
        err.response?.data?.detail ||
        "Unable to retrieve answer from municipal RAG knowledge base. Please check backend connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="mx-auto max-w-4xl w-full flex-1 flex flex-col space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  NagarSeva AI Assistant
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RAG Grounded
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Ask questions about civic grievance SLAs, policies, and municipal procedures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-800/50 self-start sm:self-auto">
            <BookOpen className="h-4 w-4" />
            <span>Municipal KB v1.0</span>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Suggested Quick Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 rounded-xl px-3.5 py-2 transition-all shadow-sm disabled:opacity-50 text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Thread Container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm space-y-2 ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-none"
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </p>

                {/* Source Citations for Bot Messages */}
                {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3 w-3 text-emerald-600" />
                      Grounded Sources:
                    </span>
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === "user" ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing / Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl rounded-tl-none p-4 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-600">
                  Retrieving grounded answer from municipal RAG knowledge base...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 flex items-center gap-2">
          <textarea
            rows={1}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a municipal question (e.g. How do I report a pothole?)..."
            className="w-full px-3 py-2 text-xs font-semibold border-0 focus:ring-0 focus:outline-none resize-none bg-transparent text-slate-900 placeholder-slate-400"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !inputQuestion.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
