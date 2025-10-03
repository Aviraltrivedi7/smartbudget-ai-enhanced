
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
    if (lowerQ.includes('week') || lowerQ.includes('hafte')) {
      const weekTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
      return `इस हफ्ते आपने कुल ₹${weekTotal.toLocaleString()} खर्च किया है। सबसे ज्यादा खर्च ${expenses[0]?.category || 'Food'} में हुआ है।`;
    }

    // Month analysis
    if (lowerQ.includes('month') || lowerQ.includes('mahine')) {
      const monthTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
      return `इस महीने आपका कुल खर्च ₹${monthTotal.toLocaleString()} है। आपकी सबसे बड़ी expense category ${expenses[0]?.category || 'Food'} है।`;
    }

    // Category analysis
    if (lowerQ.includes('food') || lowerQ.includes('khana')) {
      const foodExpenses = expenses.filter(t => t.category === 'Food');
      const foodTotal = foodExpenses.reduce((sum, t) => sum + t.amount, 0);
      return `खाने में आपने कुल ₹${foodTotal.toLocaleString()} खर्च किया है। ${foodExpenses.length} transactions हैं Food category में।`;
    }

    // Savings analysis
    if (lowerQ.includes('save') || lowerQ.includes('bacha')) {
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      const savings = totalIncome - totalExpense;
      return `आपने ₹${savings.toLocaleString()} बचाए हैं! ${savings > 0 ? 'बहुत बढ़िया! 🎉' : 'थोड़ा और save करने की कोशिश करें।'}`;
    }

    // Default response
    return `आपके कुल ${transactions.length} transactions हैं। Total expense: ₹${expenses.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}। कोई specific category के बारे में पूछना चाहते हैं?`;
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) {
      toast({
        title: "कृपया कोई सवाल पूछें",
        description: "एक सवाल लिखकर पूछें",
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
      title: "जवाब मिल गया! 🧠",
      description: "आपके expense data का analysis complete हो गया।",
    });
  };

  const suggestedQuestions = [
    "इस हफ्ते कितना खर्च किया?",
    "खाने में कितना पैसा गया?",
    "कितना पैसा बचा?",
    "सबसे ज्यादा कहाँ खर्च किया?"
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
            <p className="text-gray-600">अपने खर्च के बारे में कुछ भी पूछें!</p>
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
                <p className="text-sm text-gray-600">कुछ suggested questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestion(question)}
                      className="text-sm"
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
                  <div className="bg-blue-100 p-3 rounded-lg ml-8">
                    <p className="font-medium">आप: {message.question}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg mr-8">
                    <p className="text-green-800">🧠 AI: {message.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="flex gap-2">
              <Input
                placeholder="अपना सवाल यहाँ लिखें... जैसे 'इस महीने कितना खर्च किया?'"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="flex-1"
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={isLoading}
                className="financial-gradient"
              >
                {isLoading ? 'Loading...' : 'पूछें'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseChat;
