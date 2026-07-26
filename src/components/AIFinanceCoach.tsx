import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Brain, User, Bot, Lightbulb, TrendingUp, AlertCircle, Languages } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface AIFinanceCoachProps {
  onBack: () => void;
  transactions: Transaction[];
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIFinanceCoach: React.FC<AIFinanceCoachProps> = ({ onBack, transactions }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: language === 'hi'
        ? 'Namaste! Main hoon aapka AI Finance Coach 🧠. Mere se kuch bhi poocho apne kharche, budget tips, ya financial goals ke baare mein. Main aapka data analyze karke ekdum sahi advice dunga!'
        : 'Hello! I am your AI Finance Coach 🧠. Ask me anything about your expenses, budget tips, or financial goals. I will analyze your data and give you the best advice!',
      timestamp: new Date(),
      suggestions: language === 'hi'
        ? [
          'Sabse zyada kharcha kahan ho raha hai?',
          'Is mahine ka budget kaise plan karu?',
          'Savings badhane ke tips chahiye',
          'Food expenses kam karne ka tareeka?'
        ]
        : [
          'Where am I spending the most?',
          'How to plan a budget for this month?',
          'Tips to increase savings',
          'How to reduce food expenses?'
        ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM update is complete
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);

    // Add a system message about language change
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai',
      content: newLang === 'hi' ? 'Theek hai, ab hum Hindi/Hinglish mein baat karenge! 🇮🇳' : 'Sure, let\'s switch to English! 🇬🇧',
      timestamp: new Date(),
      suggestions: newLang === 'hi'
        ? [
          'Sabse zyada kharcha kahan ho raha hai?',
          'Is mahine ka budget kaise plan karu?',
          'Savings badhane ke tips chahiye'
        ]
        : [
          'Where am I spending the most?',
          'How to plan a budget for this month?',
          'Tips to increase savings'
        ]
    }]);
  };

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Calculate spending by category with proper type casting
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const amount = Number(t.amount) || 0;
        acc[t.category] = (acc[t.category] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum: number, amt: number) => sum + amt, 0);
    const highestCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    // Spending Analysis
    if (message.includes('category') || message.includes('kharch') || message.includes('spending') || message.includes('spent')) {
      if (language === 'hi') {
        return `Aapke spending data ka breakdown ye raha:
 
 ${Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([cat, amt]) => `💰 ${cat}: ₹${amt.toLocaleString()} (${((amt / totalExpenses) * 100).toFixed(1)}%)`)
            .join('\n')}
 
 🎯 **Special Tip**: Bhai, aap sabse zyada ${highestCategory?.[0]} (₹${highestCategory?.[1].toLocaleString()}) par uuda rahe ho. Ispe thoda control karo to savings mast hogi!`;
      } else {
        return `Here is your spending breakdown:

${Object.entries(expensesByCategory)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([cat, amt]) => `💰 ${cat}: ₹${amt.toLocaleString()} (${((amt / totalExpenses) * 100).toFixed(1)}%)`)
            .join('\n')}

🎯 **Coach Tip**: You are spending the most on ${highestCategory?.[0]} (₹${highestCategory?.[1].toLocaleString()}). Trying to control this could boost your savings!`;
      }
    }

    // Budget Planning
    if (message.includes('budget') || message.includes('plan') || message.includes('kaise') || message.includes('how')) {
      if (language === 'hi') {
        return `Ek mast monthly budget plan ye raha:
 
 🏠 **Zaroori Kharcha (60% = ₹${Math.round(totalExpenses * 0.6)})**
 - Rent/Food: ₹${Math.round(totalExpenses * 0.5)}
 - Travel: ₹${Math.round(totalExpenses * 0.1)}
 
 💡 **Lifestyle (25% = ₹${Math.round(totalExpenses * 0.25)})**
 - Fun/Movies: ₹${Math.round(totalExpenses * 0.15)}
 - Shopping: ₹${Math.round(totalExpenses * 0.1)}
 
 💰 **Savings (15% = ₹${Math.round(totalExpenses * 0.15)})**
 - Emergency Fund: ₹${Math.round(totalExpenses * 0.1)}
 - Investment: ₹${Math.round(totalExpenses * 0.05)}
 
 💡 **Coach Tip**:
 - Rozana kharcha track karo
 - Category limit set karo
 - 50-30-20 rule follow karne ki koshish karo`;
      } else {
        return `Here is a solid monthly budget plan for you:

🏠 **Needs (60% = ₹${Math.round(totalExpenses * 0.6).toLocaleString()})**
- Rent/Food: ₹${Math.round(totalExpenses * 0.5).toLocaleString()}
- Travel: ₹${Math.round(totalExpenses * 0.1).toLocaleString()}

💡 **Wants (25% = ₹${Math.round(totalExpenses * 0.25).toLocaleString()})**
- Fun/Movies: ₹${Math.round(totalExpenses * 0.15).toLocaleString()}
- Shopping: ₹${Math.round(totalExpenses * 0.1).toLocaleString()}

💰 **Savings (15% = ₹${Math.round(totalExpenses * 0.15).toLocaleString()})**
- Emergency Fund: ₹${Math.round(totalExpenses * 0.1).toLocaleString()}
- Investment: ₹${Math.round(totalExpenses * 0.05).toLocaleString()}

💡 **Coach Tip**:
- Track expenses daily
- Set category limits
- Try following the 50-30-20 rule`;
      }
    }

    // Savings Goals
    if (message.includes('save') || message.includes('saving') || message.includes('goal')) {
      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const suggestedSaving = Math.round(monthlyIncome * 0.25);

      if (language === 'hi') {
        return `🎯 **Aapka Personalized Saving Goal**:
 
 Aapki income ₹${monthlyIncome.toLocaleString()} ke hisab se:
 
 📊 **Saving Target**: ₹${suggestedSaving.toLocaleString()}/month (Kam se kam 25%)
 
 🎖️ **Goal Breakdown**:
 - Emergency Fund: ₹${Math.round(suggestedSaving * 0.6).toLocaleString()}
 - Future Investments: ₹${Math.round(suggestedSaving * 0.4).toLocaleString()}
 
 🚀 **Action Steps**:
 1. Aaj se hi ₹100 ki daily saving shuru karo
 2. Salary aate hi pehle save karo, fir kharch
 3. Har hafte progress check karo`;
      } else {
        return `🎯 **Your Personalized Saving Goal**:

Based on your income of ₹${monthlyIncome.toLocaleString()}:

📊 **Saving Target**: ₹${suggestedSaving.toLocaleString()}/month (At least 25%)

🎖️ **Goal Breakdown**:
- Emergency Fund: ₹${Math.round(suggestedSaving * 0.6).toLocaleString()}
- Future Investments: ₹${Math.round(suggestedSaving * 0.4).toLocaleString()}

🚀 **Action Steps**:
1. Start saving ₹100 daily from today
2. Save first when salary arrives, then spend
3. Check progress every week`;
      }
    }

    // Food Expenses
    if (message.includes('food') || message.includes('khana')) {
      const foodExpense = expensesByCategory['Food'] || 0;
      const avgDaily = Math.round(foodExpense / 30);

      if (language === 'hi') {
        return `🍽️ **Aapka Food Kharcha Analysis**:
 
 Abhi tak: ₹${foodExpense.toLocaleString()}/month (Avg ₹${avgDaily}/day)
 
 💡 **Savings Hacks**:
 - Ghar pe khana banao (Mast savings + health)
 - Bahar ka order kam karo (Save around ₹1500/month)
 - Bulk mein groceries lo
 
 🎯 **Target**: Agle mahine ise ₹${Math.round(foodExpense * 0.8).toLocaleString()} tak laane ki koshish karo bhai!`;
      } else {
        return `🍽️ **Your Food Expense Analysis**:

Total so far: ₹${foodExpense.toLocaleString()}/month (Avg ₹${avgDaily}/day)

💡 **Savings Hacks**:
- Cook at home (Great savings + health)
- Order less takeout (Save around ₹1500/month)
- Buy groceries in bulk

🎯 **Target**: Try to bring this down to ₹${Math.round(foodExpense * 0.8).toLocaleString()} next month!`;
      }
    }

    // Default responses
    if (language === 'hi') {
      const defaultResponsesHi = [
        "Main aapke kharche analyze kar sakta hoon! Poocho ki kis category mein zyada spending ho rahi hai.",
        "Financial freedom chahiye? Mujhse budget planning ke baare mein poocho.",
        "Aapka data dekh ke main bata sakta hoon kahan savings ho sakti hain. Kya poonchna chahenge?",
        "Chalo milke aapka bank balance badhate hain! Kya help chahiye?"
      ];
      return defaultResponsesHi[Math.floor(Math.random() * defaultResponsesHi.length)];
    } else {
      const defaultResponsesEn = [
        "I can analyze your expenses! Ask me which category has the highest spending.",
        "Want financial freedom? Ask me about budget planning.",
        "Looking at your data, I can spot savings opportunities. What would you like to know?",
        "Let's grow your bank balance together! How can I help?"
      ];
      return defaultResponsesEn[Math.floor(Math.random() * defaultResponsesEn.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(input),
        timestamp: new Date(),
        suggestions: language === 'hi'
          ? [
            'Sabse zyada kharcha kahan ho raha hai?',
            'Savings badhane ke tips chahiye',
            'Investment kaise start karu?'
          ]
          : [
            'Where is the highest spending?',
            'Tips to increase savings',
            'How to start investing?'
          ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Finance Coach
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Your personal financial advisor powered by AI
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50"
              onClick={toggleLanguage}
            >
              <Languages className="h-4 w-4" />
              {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            </Button>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="border-0 card-shadow h-[600px] flex flex-col">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              {language === 'hi' ? 'AI Coach se baat karein' : 'Chat with AI Coach'}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-full">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[85%] lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
                      message.type === 'user'
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border rounded-bl-sm"
                    )}>
                      <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                      <p className={cn(
                        "text-[10px] mt-1 text-right opacity-70",
                        message.type === 'user' ? "text-blue-100" : "text-gray-400"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions - Sticky at bottom of chat area */}
            {!isTyping && messages[messages.length - 1]?.suggestions && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t bg-gray-50/50">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors rounded-full"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'hi' ? "Poochiye apne finances ke baare mein..." : "Ask me anything about your finances..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIFinanceCoach;
