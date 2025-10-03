import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Brain, User, Bot, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m your AI Finance Coach 🧠 Ask me anything about your spending habits, budgeting tips, or financial goals. I can analyze your data and give personalized advice!',
      timestamp: new Date(),
      suggestions: [
        'Mujhe kis category me jyada kharch ho raha hai?',
        'Is month ₹5000 me kaise chalau?',
        'Mere saving goals kya hone chahiye?',
        'Food expenses kaise kam karu?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (message.includes('category') || message.includes('kharch') || message.includes('spending')) {
      return `Based on your spending data, here's your category breakdown:

${Object.entries(expensesByCategory)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([cat, amt]) => `💰 ${cat}: ₹${amt.toLocaleString()} (${((amt/totalExpenses)*100).toFixed(1)}%)`)
  .join('\n')}

🎯 **Key Insight**: You're spending most on ${highestCategory?.[0]} (₹${highestCategory?.[1].toLocaleString()}). Consider reviewing this category for potential savings!`;
    }

    if (message.includes('5000') || message.includes('budget') || message.includes('chalau')) {
      return `Here's a smart ₹5000 monthly budget plan for you:

🏠 **Essentials (60% = ₹3000)**
- Rent/Food: ₹2500
- Transportation: ₹500

💡 **Lifestyle (25% = ₹1250)**
- Entertainment: ₹500
- Shopping: ₹750

💰 **Savings (15% = ₹750)**
- Emergency fund: ₹500
- Investments: ₹250

💡 **Pro Tips**:
- Use 50-30-20 rule as baseline
- Track daily expenses
- Set spending alerts at 80% of category limit`;
    }

    if (message.includes('save') || message.includes('saving') || message.includes('goal')) {
      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const suggestedSaving = Math.round(monthlyIncome * 0.2);
      
      return `🎯 **Your Personalized Saving Goals**:

Based on your income of ₹${monthlyIncome.toLocaleString()}:

📊 **Recommended Savings**: ₹${suggestedSaving.toLocaleString()}/month (20% rule)

🎖️ **Goal Breakdown**:
- Emergency Fund: ₹${Math.round(suggestedSaving * 0.5).toLocaleString()}
- Investments: ₹${Math.round(suggestedSaving * 0.3).toLocaleString()}
- Fun Money: ₹${Math.round(suggestedSaving * 0.2).toLocaleString()}

🚀 **Action Steps**:
1. Start with ₹100/day saving challenge
2. Automate transfers on salary day
3. Track progress weekly`;
    }

    if (message.includes('food') || message.includes('khana')) {
      const foodExpense = expensesByCategory['Food'] || 0;
      const avgDaily = Math.round(foodExpense / 30);
      
      return `🍽️ **Your Food Spending Analysis**:

Current: ₹${foodExpense.toLocaleString()}/month (₹${avgDaily}/day)

💡 **Money-Saving Food Hacks**:
- Meal prep on Sundays (Save ₹500/month)
- Cook breakfast at home (Save ₹300/month)
- Limit food delivery to 2x/week (Save ₹800/month)
- Buy groceries in bulk (Save ₹200/month)

🎯 **Target**: Reduce by 25% = ₹${Math.round(foodExpense * 0.75).toLocaleString()}/month

📱 **Apps to Try**: Magicpin, Grofers, BigBasket for discounts`;
    }

    // Default responses
    const defaultResponses = [
      "I can help you analyze your spending patterns! Try asking about specific categories or budget planning.",
      "Based on your transaction data, I can provide personalized financial advice. What specific area would you like to focus on?",
      "I'm here to help you make smarter financial decisions. Ask me about budgeting, saving goals, or expense optimization!",
      "Let me analyze your spending habits and suggest improvements. What's your biggest financial concern right now?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
        timestamp: new Date()
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
          <Badge className="bg-green-100 text-green-800">Online</Badge>
        </div>

        {/* Chat Container */}
        <Card className="border-0 card-shadow h-[600px] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Chat with AI Coach
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                      message.type === 'user' 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Suggestions */}
                {messages[messages.length - 1]?.suggestions && (
                  <div className="flex gap-2 flex-wrap">
                    {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your finances..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
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
