import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chatbot from "./Chatbot";

const ChatbotButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        size="icon"
        className="fixed bottom-8 left-8 z-40 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-[0_0_30px_rgba(255,87,34,0.4)] hover:shadow-[0_0_40px_rgba(255,87,34,0.6)] animate-glow-pulse hover:scale-110 transition-all"
        title="Chat with us"
      >
        <MessageSquare className="h-7 w-7" />
      </Button>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default ChatbotButton;
