import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Trophy, Star, Gift, Zap, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SavingsGoalsProps {
  onBack: () => void;
  transactions: any[];
}

interface SavingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  reward: string;
  streak: number;
  level: number;
  icon: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  duration: string;
  completed: boolean;
  icon: string;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ onBack, transactions }) => {
  const [userLevel, setUserLevel] = useState(5);
  const [totalPoints, setTotalPoints] = useState(1250);
  const [currentStreak, setCurrentStreak] = useState(7);

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      target: 0,
      current: 0,
      deadline: '2024-12-31',
      category: 'Security',
      reward: 'Premium features unlock',
      streak: 15,
      level: 3,
      icon: '🛡️'
    },
    {
      id: '2',
      title: 'New Laptop',
      target: 0,
      current: 0,
      deadline: '2024-12-15',
      category: 'Gadgets',
      reward: '₹0 cashback',
      streak: 8,
      level: 2,
      icon: '💻'
    },
    {
      id: '3',
      title: 'Vacation Fund',
      target: 0,
      current: 0,
      deadline: '2024-11-30',
      category: 'Travel',
      reward: 'Travel planning guide',
      streak: 12,
      level: 4,
      icon: '✈️'
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'No Swiggy Week',
      description: 'Avoid food delivery for 7 days',
      points: 100,
      duration: '5 days left',
      completed: false,
      icon: '🍽️'
    },
    {
      id: '2',
      title: 'Daily Saver',
      description: 'Save at least ₹0 every day',
      points: 50,
      duration: '3 days left',
      completed: false,
      icon: '💰'
    },
    {
      id: '3',
      title: 'Budget Master',
      description: 'Stay within budget for all categories',
      points: 200,
      duration: '15 days left',
      completed: true,
      icon: '🎯'
    }
  ]);

  const getUserBadges = () => {
    const badges = [];
    if (totalPoints > 1000) badges.push({ name: 'High Saver', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' });
    if (currentStreak > 5) badges.push({ name: 'Streak Master', icon: '🔥', color: 'bg-red-100 text-red-800' });
    if (userLevel >= 5) badges.push({ name: 'Level 5', icon: '⭐', color: 'bg-purple-100 text-purple-800' });
    return badges;
  };

  const getProgressPercentage = (goal: SavingGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalStatus = (goal: SavingGoal) => {
    const percentage = getProgressPercentage(goal);
    if (percentage >= 100) return { status: 'completed', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 75) return { status: 'almost', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 50) return { status: 'halfway', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'started', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const addToGoal = (goalId: string, amount: number) => {
    setSavingGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(goal.current + amount, goal.target) }
        : goal
    ));
    setTotalPoints(prev => prev + Math.floor(amount / 10));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Savings Goals & Challenges
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Gamify your savings journey and earn rewards!
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 card-shadow bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Star className="h-6 w-6" />
                Level {userLevel}
              </div>
              <p className="text-sm opacity-80">Savings Master</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 card-shadow bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6" />
                {totalPoints}
              </div>
              <p className="text-sm opacity-80">Total Points</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 card-shadow bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Zap className="h-6 w-6" />
                {currentStreak}
              </div>
              <p className="text-sm opacity-80">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 card-shadow bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Gift className="h-6 w-6" />
                3
              </div>
              <p className="text-sm opacity-80">Rewards Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* User Badges */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {getUserBadges().map((badge, index) => (
                <Badge key={index} className={cn("text-sm", badge.color)}>
                  {badge.icon} {badge.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Savings Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingGoals.map((goal) => {
                const status = getGoalStatus(goal);
                const percentage = getProgressPercentage(goal);
                
                return (
                  <Card key={goal.id} className={cn("border-2", status.bg)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <h4 className="font-semibold">{goal.title}</h4>
                            <p className="text-xs text-gray-600">{goal.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Level {goal.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-bold">
                            ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">
                          {percentage.toFixed(1)}% complete
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {goal.deadline}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {goal.streak} day streak
                        </span>
                      </div>
                      
                      <div className="p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded text-xs">
                        <p className="font-medium">🎁 Reward: {goal.reward}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => addToGoal(goal.id, 100)}
                          className="flex-1 text-xs"
                        >
                          Add ₹100
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => addToGoal(goal.id, 500)}
                          variant="outline"
                          className="flex-1 text-xs"
                        >
                          Add ₹500
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Weekly Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    challenge.completed 
                      ? "bg-green-50 border-green-200" 
                      : "bg-white border-gray-200 hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{challenge.icon}</div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {challenge.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </h4>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                        <p className="text-xs text-gray-500">{challenge.duration}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        className={cn(
                          challenge.completed 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {challenge.points} points
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SavingsGoals;
