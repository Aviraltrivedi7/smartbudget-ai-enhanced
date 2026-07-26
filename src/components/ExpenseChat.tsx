import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

interface ExpenseChatProps {
  onBack: () => void;
  transactions: Transaction[];
}

const ExpenseChat: React.FC<ExpenseChatProps> = ({ onBack, transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeExpenses = (question: string): string => {
    const lowerQ = question.toLowerCase();
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    // Week analysis
    if (lowerQ.includes('week')) {
      const weekTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
      return `This week you spent a total of ₹${weekTotal.toLocaleString()}. Your top spending category was ${expenses[0]?.category || 'Food'}.`;
    }

    // Month analysis
    if (lowerQ.includes('month')) {
      const monthTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
      return `This month your total expense is ₹${monthTotal.toLocaleString()}. Your highest expense category is ${expenses[0]?.category || 'Food'}.`;
    }

    // Category analysis
    if (lowerQ.includes('food') || lowerQ.includes('dining')) {
      const foodExpenses = expenses.filter(t => t.category === 'Food');
      const foodTotal = foodExpenses.reduce((sum, t) => sum + t.amount, 0);
      return `You spent ₹${foodTotal.toLocaleString()} on Food across ${foodExpenses.length} transactions.`;
    }

    // Savings analysis
    if (lowerQ.includes('save') || lowerQ.includes('saving') || lowerQ.includes('balance')) {
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      const savings = totalIncome - totalExpense;
      return `You have saved ₹${savings.toLocaleString()}! ${savings > 0 ? 'Great job! 🎉' : 'Try to save a bit more next time.'}`;
    }

    // Default response
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    return `You have ${transactions.length} total transactions. Total expenses: ₹${totalExpense.toLocaleString()}. Would you like to check a specific category?`;
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) {
      toast({
        title: "Please enter a question",
        description: "Type a question to ask the AI assistant",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const answer = analyzeExpenses(currentQuestion);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      question: currentQuestion,
      answer,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentQuestion('');
    setIsLoading(false);

    toast({
      title: "Response Ready! 🧠",
      description: "Analysis of your expense data is complete.",
    });
  };

  const suggestedQuestions = [
    "How much did I spend this week?",
    "How much money went towards Food?",
    "How much money did I save?",
    "Where did I spend the most?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              💬 Expense Chat
            </h1>
            <p className="text-gray-600">Ask anything about your financial expenses!</p>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Suggested Questions */}
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Suggested Questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestion(question)}
                      className="text-sm justify-start text-left h-auto py-2 px-3"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="bg-blue-100 p-3 rounded-lg ml-8 text-blue-900">
                    <p className="font-medium">You: {message.question}</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg mr-8 text-emerald-900">
                    <p className="font-medium">🧠 AI: {message.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your question here... e.g. 'How much did I spend this month?'"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button onClick={handleAskQuestion} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Ask AI'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseChat;
