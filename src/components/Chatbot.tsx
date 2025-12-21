import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        text: "Hello! 👋 Welcome to Prro Health Cllub! I'm here to help you with any questions about our gym, memberships, trainers, and services. How can I assist you today?",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Bot response logic
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    // Greetings
    if (
      message.match(/^(hi|hello|hey|good morning|good evening|good afternoon)/)
    ) {
      return "Hello! How can I help you today? Feel free to ask about our gym hours, memberships, trainers, or services!";
    }

    // Hours
    if (message.includes("hour") || message.includes("time") || message.includes("open") || message.includes("close")) {
      return "We're open Monday to Saturday from 6:00 AM to 10:00 PM, and Sunday from 7:00 AM to 8:00 PM. Come visit us anytime!";
    }

    // Pricing/Membership
    if (
      message.includes("price") ||
      message.includes("cost") ||
      message.includes("membership") ||
      message.includes("plan") ||
      message.includes("fee")
    ) {
      return "We offer several membership plans:\n\n💪 Basic Plan: ₹2,999/month - Access to gym and basic equipment\n🏋️ Premium Plan: ₹4,999/month - Includes all facilities + group classes\n⭐ Elite Plan: ₹7,999/month - Everything + personal training sessions\n\nWould you like to know more about any specific plan?";
    }

    // Trainers
    if (message.includes("trainer") || message.includes("coach") || message.includes("instructor")) {
      return "We have a team of certified professional trainers specializing in various areas:\n\n- Personal Training\n- Strength & Conditioning\n- Weight Loss Programs\n- Muscle Building\n- Functional Fitness\n\nEach trainer is highly experienced and dedicated to helping you achieve your fitness goals!";
    }

    // Services
    if (
      message.includes("service") ||
      message.includes("facility") ||
      message.includes("offer") ||
      message.includes("amenity")
    ) {
      return "Our services include:\n\n✅ State-of-the-art gym equipment\n✅ Group fitness classes (Yoga, Zumba, CrossFit)\n✅ Personal training sessions\n✅ Body composition analysis\n✅ Nutrition guidance\n✅ Cardio zone\n✅ Strength training area\n✅ Locker rooms and showers\n\nWhat would you like to know more about?";
    }

    // BMI/Body Fat
    if (
      message.includes("bmi") ||
      message.includes("body fat") ||
      message.includes("composition") ||
      message.includes("assessment")
    ) {
      return "We offer comprehensive body composition assessments including:\n\n📊 BMI Calculator\n📊 Body Fat Percentage Analysis\n📊 Muscle Mass Measurement\n📊 Personalized Fitness Recommendations\n\nThese assessments help us create customized workout and nutrition plans for you!";
    }

    // Location
    if (
      message.includes("location") ||
      message.includes("address") ||
      message.includes("where") ||
      message.includes("find")
    ) {
      return "We're conveniently located in the heart of the city! For our exact address and directions, please check the Contact section on our website or call us at +91 98670 16344.";
    }

    // Contact
    if (
      message.includes("contact") ||
      message.includes("phone") ||
      message.includes("call") ||
      message.includes("email") ||
      message.includes("reach")
    ) {
      return "You can reach us at:\n\n📞 Phone: +91 98670 16344\n📧 Email: info@prrohealthcllub.com\n💬 WhatsApp: Click the WhatsApp button on our website\n\nWe're always happy to help!";
    }

    // Transformation programs
    if (
      message.includes("transformation") ||
      message.includes("result") ||
      message.includes("success")
    ) {
      return "Our transformation programs have helped hundreds of members achieve incredible results! We offer:\n\n🎯 Customized workout plans\n🎯 Nutrition coaching\n🎯 Progress tracking\n🎯 Constant support from trainers\n\nCheck out our Transformations section to see real success stories!";
    }

    // Classes
    if (message.includes("class") || message.includes("yoga") || message.includes("zumba") || message.includes("crossfit")) {
      return "We offer exciting group fitness classes:\n\n🧘 Yoga - Mon, Wed, Fri at 7 AM & 6 PM\n💃 Zumba - Tue, Thu, Sat at 6 PM\n🏋️ CrossFit - Mon-Sat at 8 AM\n🤸 Functional Training - Daily at 5 PM\n\nAll classes are included with Premium and Elite memberships!";
    }

    // Join/Sign up
    if (
      message.includes("join") ||
      message.includes("sign up") ||
      message.includes("register") ||
      message.includes("start")
    ) {
      return "Great to hear you're interested in joining! 🎉\n\nYou can:\n1. Visit us in person for a free tour\n2. Fill out the contact form on our website\n3. Call us at +91 98670 16344\n4. Message us on WhatsApp\n\nWe offer a FREE 3-day trial for new members!";
    }

    // Thank you
    if (message.includes("thank") || message.includes("thanks")) {
      return "You're very welcome! 😊 If you have any other questions, feel free to ask. We're here to help you on your fitness journey!";
    }

    // Goodbye
    if (message.includes("bye") || message.includes("goodbye") || message.includes("see you")) {
      return "Goodbye! Thanks for chatting with us. Feel free to come back anytime. Stay fit and healthy! 💪";
    }

    // Default fallback
    return "I'd be happy to help you with that! For specific questions, you can:\n\n- Ask about our gym hours\n- Inquire about membership plans\n- Learn about our trainers and services\n- Get contact information\n\nOr feel free to call us at +91 98670 16344 for personalized assistance!";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = [
    "Membership plans",
    "Gym hours",
    "Our trainers",
    "Contact info",
  ];

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-[600px] bg-gradient-to-br from-[var(--glass-primary)] to-[var(--glass-secondary)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] bg-gradient-to-r from-primary/20 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Gym Assistant</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                {message.isBot && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.isBot
                      ? "bg-white/10 backdrop-blur-sm border border-white/20"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!message.isBot && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Replies - Show after every bot message */}
        {messages.length > 0 && messages[messages.length - 1]?.isBot && !isTyping && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white/5 hover:bg-white/10 border-white/20"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-white/5">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 border-white/20 focus:border-primary"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-primary hover:bg-primary/90"
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
