import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isFromUser: boolean;
  timestamp: Date;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Connect to WebSocket when chat is opened
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    setIsConnecting(true);
    
    // Use secure WebSocket if page is served over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnecting(false);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          if (data.conversationId && !conversationId) {
            setConversationId(data.conversationId);
          }
          
          // Add slight delay to simulate typing
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                content: data.content,
                isFromUser: data.isFromUser,
                timestamp: new Date()
              }
            ]);
            setIsTyping(false);
          }, 500);
        } else if (data.type === 'error') {
          toast({
            title: "Chatbot Error",
            description: data.message || "An error occurred with the chat service",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat service. Please try again later.",
        variant: "destructive"
      });
    };
    
    ws.onclose = () => {
      setIsConnecting(false);
    };
    
    wsRef.current = ws;
  };

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input,
      isFromUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: input,
      conversationId
    }));
    
    setInput("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={toggleChat}
        className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 overflow-hidden shadow-2xl">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h3 className="text-white font-semibold font-heading">Performance Assistant</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-white/80"
              onClick={toggleChat}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="h-80 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex mb-4 ${message.isFromUser ? 'justify-end' : ''}`}
              >
                {!message.isFromUser && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                
                <div className={`${
                  message.isFromUser 
                    ? 'bg-primary/10 text-secondary' 
                    : 'bg-gray-100'
                  } rounded-lg p-3 max-w-[85%]`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.isFromUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {isConnecting && (
              <div className="text-center text-sm text-gray-500 my-4">
                Connecting to assistant...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className="border-t p-4 bg-white">
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-grow py-2 px-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isConnecting}
              />
              <Button 
                type="submit"
                className="bg-primary text-white px-4 rounded-r-md hover:bg-primary/90"
                disabled={!input.trim() || isConnecting}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;
