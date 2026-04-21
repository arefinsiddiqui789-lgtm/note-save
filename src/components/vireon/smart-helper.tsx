"use client";

import { useVireonStore, type ChatMessage } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Send,
  Trash2,
  User,
  Sparkles,
  Lightbulb,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const QUICK_QUESTIONS = [
  "Explain recursion simply",
  "What is a binary tree?",
  "How does a stack work?",
  "Explain Big O notation",
  "What is a linked list?",
  "How does DNS work?",
];

export function SmartHelperSection() {
  const { chatHistory, addChatMessage, clearChatHistory } = useVireonStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async (message?: string) => {
    const userMessage = (message || input).trim();
    if (!userMessage || isLoading) return;
    setInput("");
    addChatMessage("user", userMessage);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: chatHistory }),
      });
      const data = await res.json();
      if (data.response) {
        addChatMessage("assistant", data.response);
      } else {
        toast.error("Failed to get response from AI");
      }
    } catch {
      toast.error("Failed to connect to AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChatHistory();
    toast.success("Chat history cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 pb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vireon Bro</h2>
              <p className="text-sm text-muted-foreground">
                Your CSE study buddy
              </p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw size={16} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        {chatHistory.length === 0 && !isLoading ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
            >
              <Sparkles size={36} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Hey! Vireon Bro here — ask me anything!
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              I can explain concepts, help with algorithms, data structures, and
              more. Try one of these questions:
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Lightbulb size={12} className="inline mr-1" />
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Messages */
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {chatHistory.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} className="text-primary" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border rounded-tl-sm"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Quick suggestions when chat has messages */}
      {chatHistory.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto max-w-3xl mx-auto pb-1">
            {QUICK_QUESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Vireon Bro anything..."
              rows={1}
              disabled={isLoading}
              className={cn(
                "w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "disabled:opacity-50",
                "max-h-24"
              )}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height =
                  Math.min(target.scrollHeight, 96) + "px";
              }}
            />
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
