import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type Message = {
  role: "user" | "ai";
  content: string;
  products?: any[];
};

export default function AiAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI shopping assistant. How can I help you discover products today?" }
  ]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    chatMutation.mutate({
      data: {
        message: userMessage,
        sessionId: sessionId
      }
    }, {
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        setMessages(prev => [
          ...prev, 
          { 
            role: "ai", 
            content: data.message,
            products: data.products 
          }
        ]);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Shopping Assistant</h1>
        <p className="text-muted-foreground">Ask natural questions to find the perfect products.</p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div className={`space-y-3 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-muted rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {msg.products.map((p) => (
                        <div key={p.id} className="bg-card border rounded-md p-3 flex gap-3 text-sm">
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-semibold text-xs text-muted-foreground">{p.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{p.name}</div>
                            <div className="text-muted-foreground">{formatCurrency(p.price)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-muted rounded-tl-none flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-card">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              placeholder="E.g. I'm looking for a gaming laptop under $1000..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || chatMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}