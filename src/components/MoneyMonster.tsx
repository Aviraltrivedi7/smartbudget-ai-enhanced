
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface MoneyMonsterProps {
  onBack: () => void;
  transactions: Transaction[];
}

const MoneyMonster: React.FC<MoneyMonsterProps> = ({ onBack, transactions }) => {
  const [monsterMood, setMonsterMood] = useState<'happy' | 'worried' | 'angry' | 'danger'>('happy');
  const [animationClass, setAnimationClass] = useState('');

  const budgetLimit = 20000; // Example monthly budget
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const budgetUsed = (totalSpent / budgetLimit) * 100;

  useEffect(() => {
    let mood: 'happy' | 'worried' | 'angry' | 'danger' = 'happy';
    let animation = '';

    if (budgetUsed <= 50) {
      mood = 'happy';
      animation = 'animate-bounce';
    } else if (budgetUsed <= 75) {
      mood = 'worried';
      animation = 'animate-pulse';
    } else if (budgetUsed <= 90) {
      mood = 'angry';
      animation = 'animate-ping';
    } else {
      mood = 'danger';
      animation = 'animate-spin';
    }

    setMonsterMood(mood);
    setAnimationClass(animation);
  }, [budgetUsed]);

  const getMonsterEmoji = () => {
    switch (monsterMood) {
      case 'happy': return '😄';
      case 'worried': return '😰';
      case 'angry': return '😡';
      case 'danger': return '🥵';
      default: return '😄';
    }
  };

  const getMonsterMessage = () => {
    switch (monsterMood) {
      case 'happy': return 'Great job! You are under budget! 🎉';
      case 'worried': return 'Hmm... watch your spending carefully 🤔';
      case 'angry': return 'WARNING: You are spending too much! 😠';
      case 'danger': return 'DANGER ZONE! Stop spending NOW! 🚨';
      default: return 'Keep tracking your expenses!';
    }
  };

  const getMonsterColor = () => {
    switch (monsterMood) {
      case 'happy': return 'from-green-400 to-green-600';
      case 'worried': return 'from-yellow-400 to-orange-500';
      case 'angry': return 'from-orange-500 to-red-500';
      case 'danger': return 'from-red-500 to-red-700';
      default: return 'from-green-400 to-green-600';
    }
  };

  const getBudgetBarColor = () => {
    if (budgetUsed <= 50) return 'bg-green-500';
    if (budgetUsed <= 75) return 'bg-yellow-500';
    if (budgetUsed <= 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              👹 Money Monster Meter
            </h1>
            <p className="text-gray-600">Your emotional spending companion</p>
          </div>
        </div>

        {/* Monster Display */}
        <Card className={`border-0 card-shadow bg-gradient-to-r ${getMonsterColor()}`}>
          <CardContent className="p-8 text-center text-white">
            <div className={`text-9xl mb-4 ${animationClass}`}>
              {getMonsterEmoji()}
            </div>
            <h2 className="text-2xl font-bold mb-2">Money Monster Says:</h2>
            <p className="text-lg opacity-90">{getMonsterMessage()}</p>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>📊 Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Budget Progress</span>
              <span className="text-sm font-bold">{budgetUsed.toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full ${getBudgetBarColor()} transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹0</span>
              <span>₹{budgetLimit.toLocaleString()}</span>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold">
                Spent: ₹{totalSpent.toLocaleString()} / ₹{budgetLimit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Remaining: ₹{(budgetLimit - totalSpent).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monster Moods Guide */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>🎭 Understanding Your Money Monster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl mb-2">😄</div>
                <h3 className="font-semibold text-green-800">Happy Monster</h3>
                <p className="text-sm text-green-600">0-50% Budget Used</p>
                <p className="text-xs text-gray-600 mt-1">You're doing great!</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-4xl mb-2">😰</div>
                <h3 className="font-semibold text-yellow-800">Worried Monster</h3>
                <p className="text-sm text-yellow-600">50-75% Budget Used</p>
                <p className="text-xs text-gray-600 mt-1">Be more careful</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-4xl mb-2">😡</div>
                <h3 className="font-semibold text-orange-800">Angry Monster</h3>
                <p className="text-sm text-orange-600">75-90% Budget Used</p>
                <p className="text-xs text-gray-600 mt-1">Warning zone!</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-4xl mb-2">🥵</div>
                <h3 className="font-semibold text-red-800">Danger Monster</h3>
                <p className="text-sm text-red-600">90%+ Budget Used</p>
                <p className="text-xs text-gray-600 mt-1">Emergency mode!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monster Tips */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-purple-100 to-pink-100">
          <CardHeader>
            <CardTitle>💡 Monster's Financial Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monsterMood === 'happy' && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-green-800 font-medium">🎉 Keep it up!</p>
                <p className="text-sm text-gray-600">
                  You're managing your money well. Consider investing the extra savings!
                </p>
              </div>
            )}
            
            {monsterMood === 'worried' && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-yellow-800 font-medium">⚠️ Slow down!</p>
                <p className="text-sm text-gray-600">
                  You're spending faster than usual. Review your recent purchases and cut unnecessary expenses.
                </p>
              </div>
            )}
            
            {monsterMood === 'angry' && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-orange-800 font-medium">🚨 Take action!</p>
                <p className="text-sm text-gray-600">
                  You're in the danger zone. Stop all non-essential spending immediately!
                </p>
              </div>
            )}
            
            {monsterMood === 'danger' && (
              <div className="p-3 bg-white rounded-lg">
                <p className="text-red-800 font-medium">🔥 Emergency!</p>
                <p className="text-sm text-gray-600">
                  Budget exceeded! Review all expenses and create an emergency plan. Consider additional income sources.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoneyMonster;
