
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Bell, TrendingDown, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface CalendarExpenseTrackerProps {
  onBack: () => void;
  transactions: Transaction[];
}

const CalendarExpenseTracker: React.FC<CalendarExpenseTrackerProps> = ({ onBack, transactions }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock reminders data
  const reminders = [
    { date: '2024-11-15', title: 'Rent Due', type: 'bill' },
    { date: '2024-11-20', title: 'Credit Card Payment', type: 'payment' },
    { date: '2024-11-25', title: 'Insurance Premium', type: 'insurance' },
  ];

  // Calculate daily spending and categorize
  const dailySpending = useMemo(() => {
    const spending: Record<string, { total: number; transactions: Transaction[]; level: 'low' | 'medium' | 'high' }> = {};
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      const date = transaction.date;
      if (!spending[date]) {
        spending[date] = { total: 0, transactions: [], level: 'low' };
      }
      spending[date].total += transaction.amount;
      spending[date].transactions.push(transaction);
    });

    // Categorize spending levels
    Object.keys(spending).forEach(date => {
      const total = spending[date].total;
      if (total > 5000) spending[date].level = 'high';
      else if (total > 2000) spending[date].level = 'medium';
      else spending[date].level = 'low';
    });

    return spending;
  }, [transactions]);

  // Calculate monthly total
  const monthlyTotal = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth]);

  // Get transactions for selected date
  const selectedDateTransactions = selectedDate 
    ? dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.transactions || []
    : [];

  // Get reminders for selected date
  const selectedDateReminders = selectedDate 
    ? reminders.filter(r => isSameDay(new Date(r.date), selectedDate))
    : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📅 Calendar Expense Tracker
            </h1>
            <p className="text-gray-600">Track your daily spending patterns visually</p>
          </div>
        </div>

        {/* Monthly Summary */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-blue-100 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Month Spend</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{monthlyTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Spending Calendar
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                  <span>Low (&lt;₹2k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-200 rounded-full"></div>
                  <span>Medium (₹2k-5k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                  <span>High (&gt;₹5k)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  spending: (date) => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    return !!dailySpending[dateString];
                  },
                  reminder: (date) => reminders.some(r => isSameDay(new Date(r.date), date))
                }}
                modifiersClassNames={{
                  spending: 'font-bold',
                  reminder: 'relative'
                }}
              />
            </CardContent>
          </Card>

          {/* Daily Details */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedDate ? (
                  <>
                    <CalendarIcon className="h-5 w-5" />
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </>
                ) : (
                  'Select a date to view details'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && (
                <>
                  {/* Daily Summary */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{(dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.total || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.level === 'high' ? 'destructive' :
                          dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.level === 'medium' ? 'secondary' :
                          'default'
                        }>
                          {dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.level === 'high' ? '🔴 High Spend' :
                           dailySpending[format(selectedDate, 'yyyy-MM-dd')]?.level === 'medium' ? '🟡 Medium Spend' :
                           '🟢 Low Spend'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reminders */}
                  {selectedDateReminders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Reminders
                      </h3>
                      {selectedDateReminders.map((reminder, index) => (
                        <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{reminder.title}</span>
                            <Badge variant="outline">{reminder.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expenses List */}
                  {selectedDateTransactions.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold">💸 Expenses</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedDateTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {transaction.category === 'Food' ? '🍔' :
                                 transaction.category === 'Travel' ? '🚗' :
                                 transaction.category === 'Entertainment' ? '🎬' :
                                 transaction.category === 'Rent' ? '🏠' : '💰'}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.title}</p>
                                <p className="text-sm text-gray-600">{transaction.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">
                                ₹{transaction.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No expenses recorded for this date</p>
                      <p className="text-sm">Looks like a savings day! 🎉</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 card-shadow bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Low Spend Days</p>
                  <p className="text-2xl font-bold">
                    {Object.values(dailySpending).filter(d => d.level === 'low').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">High Spend Days</p>
                  <p className="text-2xl font-bold">
                    {Object.values(dailySpending).filter(d => d.level === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-90">Upcoming Reminders</p>
                  <p className="text-2xl font-bold">{reminders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarExpenseTracker;
