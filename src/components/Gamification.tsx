import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Medal, Star, Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  target: number;
}

interface GamificationProps {
  onBack: () => void;
  transactions: Transaction[];
}

const Gamification: React.FC<GamificationProps> = ({ onBack, transactions }) => {
  const { t } = useLanguage();
  const [userLevel, setUserLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'First Saver', description: 'पहली बार ₹500 बचाएं', icon: '🏆', earned: false, progress: 0, target: 500 },
    { id: '2', name: 'Budget Master', description: '10 transactions record करें', icon: '💰', earned: false, progress: 0, target: 10 },
    { id: '3', name: 'Expense Tracker', description: '30 दिन continuously track करें', icon: '📊', earned: false, progress: 0, target: 30 },
    { id: '4', name: 'Smart Spender', description: 'किसी category में limit के अंदर रहें', icon: '🧠', earned: false, progress: 0, target: 1 },
    { id: '5', name: 'Saving Champion', description: '₹10,000 बचाएं', icon: '🏅', earned: false, progress: 0, target: 10000 },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    calculateProgress();
  }, [transactions]);

  const calculateProgress = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    const totalSavings = income.reduce((sum, t) => sum + t.amount, 0) - expenses.reduce((sum, t) => sum + t.amount, 0);

    const updatedBadges = badges.map(badge => {
      let progress = 0;
      
      switch (badge.id) {
        case '1': // First Saver
          progress = Math.max(0, totalSavings);
          break;
        case '2': // Budget Master
          progress = transactions.length;
          break;
        case '3': // Expense Tracker
          progress = Math.min(30, transactions.length); // Simplified
          break;
        case '4': // Smart Spender
          progress = expenses.length > 0 ? 1 : 0; // Simplified
          break;
        case '5': // Saving Champion
          progress = Math.max(0, totalSavings);
          break;
      }

      const earned = progress >= badge.target;
      return { ...badge, progress, earned };
    });

    setBadges(updatedBadges);

    // Calculate points and level
    const earnedBadges = updatedBadges.filter(b => b.earned).length;
    const newPoints = earnedBadges * 100 + transactions.length * 10;
    const newLevel = Math.floor(newPoints / 500) + 1;
    
    setPoints(newPoints);
    setUserLevel(newLevel);
    setStreak(Math.min(transactions.length, 30)); // Simplified streak calculation

    // Show toast for new achievements
    updatedBadges.forEach(badge => {
      if (badge.earned && !badges.find(b => b.id === badge.id)?.earned) {
        toast({
          title: "🎉 New Badge Earned!",
          description: `Congratulations! आपने "${badge.name}" badge जीता है!`,
        });
      }
    });
  };

  const challenges = [
    { title: "आज ₹100 बचाएं", reward: "50 points", completed: false },
    { title: "5 transactions add करें", reward: "100 points", completed: transactions.length >= 5 },
    { title: "Food category में ₹500 की limit set करें", reward: "75 points", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 {t('gamification')}
            </h1>
            <p className="text-gray-600">Gamify your savings journey!</p>
          </div>
        </div>

        {/* User Stats */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{points}</div>
                <div className="text-sm text-gray-600">{t('points')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">{t('level')} {userLevel}</div>
                <div className="text-sm text-gray-600">Current {t('level')}</div>
                <Progress value={(points % 500) / 5} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{streak} 🔥</div>
                <div className="text-sm text-gray-600">{t('streak')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5" />
              {t('badges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <Card key={badge.id} className={`p-4 ${badge.earned ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300' : 'bg-gray-50'}`}>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">{badge.icon}</div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <div className="space-y-1">
                      <Progress value={(badge.progress / badge.target) * 100} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {badge.progress}/{badge.target}
                      </div>
                    </div>
                    {badge.earned && (
                      <div className="text-green-600 font-medium text-sm">✅ Earned!</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t('challenges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${challenge.completed ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-50'}`}>
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">Reward: {challenge.reward}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${challenge.completed ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {challenge.completed ? '✅ Complete' : '⏳ Pending'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Teaser */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-blue-100 to-cyan-100">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('leaderboard')}</h3>
            <p className="text-gray-600 mb-4">Top savers को special rewards मिलते हैं!</p>
            <div className="text-2xl font-bold text-blue-600">{t('yourRank')}: #5 🏆</div>
            <p className="text-sm text-gray-500 mt-2">{t('keepSaving')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gamification;
