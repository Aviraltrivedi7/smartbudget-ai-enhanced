
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Plus, ArrowLeft, Bell, Trash2, Check } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  repeat: 'once' | 'monthly' | 'weekly';
  notifyBefore: '1hour' | '2hours' | '1day' | '2days' | '1week';
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
}

interface BillReminderProps {
  onBack: () => void;
}

const BillReminder: React.FC<BillReminderProps> = ({ onBack }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dueDate: undefined as Date | undefined,
    repeat: 'monthly' as 'once' | 'monthly' | 'weekly',
    notifyBefore: '1day' as '1hour' | '2hours' | '1day' | '2days' | '1week'
  });
  const { toast } = useToast();

  const notifyOptions = [
    { value: '1hour', label: '1 Hour Before' },
    { value: '2hours', label: '2 Hours Before' },
    { value: '1day', label: '1 Day Before' },
    { value: '2days', label: '2 Days Before' },
    { value: '1week', label: '1 Week Before' }
  ];

  const handleAddBill = () => {
    if (!formData.title || !formData.amount || !formData.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      title: formData.title,
      amount: Number(formData.amount),
      dueDate: formData.dueDate,
      repeat: formData.repeat,
      notifyBefore: formData.notifyBefore,
      status: 'pending',
      createdAt: new Date()
    };

    setBills(prev => [...prev, newBill]);
    setFormData({
      title: '',
      amount: '',
      dueDate: undefined,
      repeat: 'monthly',
      notifyBefore: '1day'
    });
    setIsAddingBill(false);

    // Schedule notification (mock implementation)
    scheduleNotification(newBill);

    toast({
      title: "Bill Reminder Added",
      description: `${newBill.title} reminder set for ${format(newBill.dueDate, "PPP")}`,
    });
  };

  const scheduleNotification = (bill: Bill) => {
    // Mock notification scheduling
    console.log(`Scheduling notification for ${bill.title} - Due: ${format(bill.dueDate, "PPP")}`);
    
    // In a real implementation, this would:
    // 1. Calculate notification time based on dueDate and notifyBefore
    // 2. Use a service like OneSignal or browser notifications
    // 3. Store in Firebase/database with scheduled time
    
    // For demo, we'll show a mock notification after 5 seconds
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(`Bill Reminder: ${bill.title}`, {
          body: `₹${bill.amount} due ${format(bill.dueDate, "PPP")}. Tap to manage.`,
          icon: '/favicon.ico'
        });
      }
    }, 5000);
  };

  const markAsPaid = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, status: 'paid' } : bill
    ));
    toast({
      title: "Bill Marked as Paid",
      description: "Great! Your bill has been updated.",
    });
  };

  const deleteBill = (billId: string) => {
    setBills(prev => prev.filter(bill => bill.id !== billId));
    toast({
      title: "Bill Deleted",
      description: "The bill reminder has been removed.",
    });
  };

  const getUpcomingBills = () => {
    const now = new Date();
    const upcoming = bills.filter(bill => {
      const daysDiff = Math.ceil((bill.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7 && bill.status === 'pending';
    });
    return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const upcomingBills = getUpcomingBills();

  // Request notification permission on component mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
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
              Smart Bill Reminders
            </h1>
            <p className="text-gray-600">Never miss a payment again with intelligent notifications</p>
          </div>
        </div>

        {/* Upcoming Bills Widget */}
        {upcomingBills.length > 0 && (
          <Card className="border-0 card-shadow bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Bell className="h-5 w-5" />
                {upcomingBills.length} Bill{upcomingBills.length > 1 ? 's' : ''} Due This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingBills.slice(0, 3).map((bill) => {
                  const daysUntilDue = Math.ceil((bill.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium">{bill.title}</p>
                        <p className="text-sm text-gray-600">
                          {daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-700">₹{bill.amount.toLocaleString()}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsPaid(bill.id)}
                          className="mt-1 h-6 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark Paid
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Bill Button */}
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <Button
              onClick={() => setIsAddingBill(true)}
              className="w-full financial-gradient text-white border-0 py-4 text-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Bill Reminder
            </Button>
          </CardContent>
        </Card>

        {/* Add Bill Dialog */}
        <Dialog open={isAddingBill} onOpenChange={setIsAddingBill}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bill Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Bill Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Electricity Bill, Rent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat</Label>
                <Select value={formData.repeat} onValueChange={(value: 'once' | 'monthly' | 'weekly') => setFormData({ ...formData, repeat: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notify">Notify Before</Label>
                <Select value={formData.notifyBefore} onValueChange={(value: any) => setFormData({ ...formData, notifyBefore: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notifyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingBill(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBill}
                  className="flex-1 financial-gradient text-white border-0"
                >
                  Add Reminder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bills List */}
        {bills.length > 0 && (
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle>All Bill Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        bill.status === 'paid' ? "bg-green-100" : 
                        bill.status === 'overdue' ? "bg-red-100" : "bg-orange-100"
                      )}>
                        <Bell className={cn(
                          "h-5 w-5",
                          bill.status === 'paid' ? "text-green-600" : 
                          bill.status === 'overdue' ? "text-red-600" : "text-orange-600"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{bill.title}</p>
                        <p className="text-sm text-gray-600">
                          Due: {format(bill.dueDate, "PPP")} • {bill.repeat}
                        </p>
                        <p className="text-xs text-gray-500">
                          Notify: {notifyOptions.find(opt => opt.value === bill.notifyBefore)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-lg">₹{bill.amount.toLocaleString()}</p>
                        <p className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          bill.status === 'paid' ? "bg-green-100 text-green-700" : 
                          bill.status === 'overdue' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {bill.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(bill.id)}
                            className="h-6 text-xs"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBill(bill.id)}
                          className="h-6 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {bills.length === 0 && (
          <Card className="border-0 card-shadow">
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bill Reminders Yet</h3>
              <p className="text-gray-500 mb-6">Add your first bill reminder to never miss a payment again!</p>
              <Button
                onClick={() => setIsAddingBill(true)}
                className="financial-gradient text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Bill
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BillReminder;
