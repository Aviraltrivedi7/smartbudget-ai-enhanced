
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface AIHeatmapProps {
  onBack: () => void;
  transactions: Transaction[];
}

const AIHeatmap: React.FC<AIHeatmapProps> = ({ onBack, transactions }) => {
  const [heatmapData, setHeatmapData] = useState<any[][]>([]);

  const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Generate mock spending data for demonstration
    const data = days.map(day => 
      hours.map(hour => {
        // Simulate higher spending during certain hours
        let intensity = Math.random() * 100;
        
        // Peak spending times (lunch: 12-2pm, dinner: 7-9pm, late night: 9-11pm)
        if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21) || (hour >= 21 && hour <= 23)) {
          intensity = Math.random() * 300 + 200; // Higher values for peak times
        }
        
        return {
          day,
          hour,
          intensity: Math.round(intensity),
          amount: Math.round(intensity * 10)
        };
      })
    );
    
    setHeatmapData(data);
  };

  useEffect(() => {
    generateHeatmapData();
  }, [transactions]);

  const getIntensityColor = (intensity: number) => {
    if (intensity > 400) return 'bg-red-600';
    if (intensity > 300) return 'bg-red-500';
    if (intensity > 200) return 'bg-orange-500';
    if (intensity > 100) return 'bg-yellow-500';
    if (intensity > 50) return 'bg-green-400';
    return 'bg-gray-200';
  };

  const getIntensityText = (intensity: number) => {
    if (intensity > 400) return '🔥 Very High';
    if (intensity > 300) return '🌶️ High';
    if (intensity > 200) return '🟠 Medium';
    if (intensity > 100) return '🟡 Low';
    return '⭐ Very Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🔥 AI Spending Heatmap
            </h1>
            <p className="text-gray-600">Discover your high-spending time patterns</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Peak Spending Time</p>
                  <p className="text-xl font-bold">9-11 PM</p>
                  <p className="text-xs opacity-80">Tu raat me sabse zyada udaata hai! 🤯</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Danger Zone</p>
                  <p className="text-xl font-bold">Weekend Nights</p>
                  <p className="text-xs opacity-80">Fri-Sat evenings = paisa goes brr! 💸</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🧠</div>
                <div>
                  <p className="text-sm opacity-90">AI Recommendation</p>
                  <p className="text-lg font-bold">Set Night Limits</p>
                  <p className="text-xs opacity-80">Avoid shopping after 9 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="text-2xl">🗓️</div>
              Spending Intensity Heatmap
            </CardTitle>
            <p className="text-sm text-gray-600">
              Red = High spending time, Green = Safe spending time
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time Labels */}
              <div className="grid grid-cols-25 gap-1 text-xs">
                <div></div> {/* Empty corner */}
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-center font-medium">
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              {heatmapData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="grid grid-cols-25 gap-1">
                  <div className="text-sm font-medium flex items-center">
                    {dayData[0]?.day}
                  </div>
                  {dayData.map((cell, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`h-8 w-8 rounded cursor-pointer transition-all hover:scale-110 ${getIntensityColor(cell.intensity)}`}
                      title={`${cell.day} ${cell.hour}:00 - ₹${cell.amount} spent - ${getIntensityText(cell.intensity)}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-sm text-gray-600">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div className="w-4 h-4 bg-red-600 rounded"></div>
              </div>
              <span className="text-sm text-gray-600">More</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-purple-100 to-pink-100">
          <CardHeader>
            <CardTitle>🤖 AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-purple-800">⏰ Peak Analysis</p>
              <p className="text-sm text-gray-600">
                You spend 3x more between 9-11 PM compared to morning hours. Consider setting spending alerts during these times.
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-orange-800">📅 Weekly Pattern</p>
              <p className="text-sm text-gray-600">
                Weekend spending is 40% higher than weekdays. Friday nights are your highest spending time!
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-green-800">💡 Smart Tip</p>
              <p className="text-sm text-gray-600">
                Your safest spending hours are 6-9 AM. Try scheduling important purchases during this time for better financial discipline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIHeatmap;
