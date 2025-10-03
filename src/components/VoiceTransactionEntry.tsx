
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VoiceTransactionEntryProps {
  onBack: () => void;
  onSave: (expense: {
    title: string;
    amount: number;
    category: string;
    date: Date;
    type: 'expense' | 'income';
  }) => void;
}

const VoiceTransactionEntry: React.FC<VoiceTransactionEntryProps> = ({ onBack, onSave }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening... 🎤",
          description: "Speak your transaction now",
        });
      };

      recognitionRef.current.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setTranscript(speechText);
        parseVoiceInput(speechText);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check microphone permissions",
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const parseVoiceInput = (text: string) => {
    setIsProcessing(true);
    
    // Simple NLP parsing (in real app, you'd use a proper NLP service)
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      
      // Extract amount
      const amountMatch = lowerText.match(/(\d+(?:\.\d{2})?)\s*(?:rupees?|rs\.?|₹)?/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      
      // Extract category based on keywords
      let category = 'Other';
      let title = text;
      
      if (lowerText.includes('petrol') || lowerText.includes('fuel') || lowerText.includes('gas')) {
        category = 'Travel';
        title = 'Petrol/Fuel';
      } else if (lowerText.includes('food') || lowerText.includes('lunch') || lowerText.includes('dinner') || lowerText.includes('breakfast')) {
        category = 'Food';
        title = 'Food Expense';
      } else if (lowerText.includes('uber') || lowerText.includes('ola') || lowerText.includes('taxi') || lowerText.includes('auto')) {
        category = 'Travel';
        title = 'Transportation';
      } else if (lowerText.includes('movie') || lowerText.includes('cinema') || lowerText.includes('entertainment')) {
        category = 'Entertainment';
        title = 'Entertainment';
      } else if (lowerText.includes('grocery') || lowerText.includes('vegetables') || lowerText.includes('market')) {
        category = 'Food';
        title = 'Grocery Shopping';
      }

      const parsed = {
        title: title,
        amount: amount,
        category: category,
        date: new Date(),
        type: 'expense' as const,
        confidence: amount > 0 ? 85 : 60
      };

      setParsedData(parsed);
      setIsProcessing(false);
      
      toast({
        title: "Voice Parsed Successfully! 🎯",
        description: `Detected: ${category} expense of ₹${amount}`,
      });
    }, 1500);
  };

  const handleSave = () => {
    if (parsedData && parsedData.amount > 0) {
      onSave(parsedData);
      toast({
        title: "Transaction Saved",
        description: "Voice transaction added successfully",
      });
      onBack();
    }
  };

  const examplePhrases = [
    "Add 250 rupees petrol today",
    "Spent 400 on lunch at restaurant",
    "Uber ride cost me 180 rupees",
    "Bought groceries for 850 rupees",
    "Movie tickets 600 rupees"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎤 Voice Transaction Entry
            </h1>
            <p className="text-gray-600">Speak your expenses and let AI do the rest</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Input Section */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={`w-32 h-32 rounded-full text-white text-lg font-medium transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                
                <p className="mt-4 text-lg font-medium">
                  {isListening ? 'Listening...' : 'Tap to start speaking'}
                </p>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Processing voice input...</p>
                  </div>
                )}
              </div>

              {transcript && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    What you said:
                  </h4>
                  <p className="text-gray-700 italic">"{transcript}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parsed Results */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Parsed Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Title:</span>
                      <span className="font-medium">{parsedData.title}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-semibold text-red-600">₹{parsedData.amount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category:</span>
                      <Badge>{parsedData.category}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <Badge variant={parsedData.confidence > 80 ? "default" : "secondary"}>
                        {parsedData.confidence}%
                      </Badge>
                    </div>
                  </div>

                  {parsedData.amount > 0 && (
                    <Button 
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    >
                      Save Transaction
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Start speaking to see parsed transaction data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Phrases */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-blue-100 to-purple-100">
          <CardHeader>
            <CardTitle>💡 Example Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examplePhrases.map((phrase, index) => (
                <div key={index} className="p-2 bg-white rounded-lg text-sm">
                  <span className="text-gray-600 italic">"{phrase}"</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceTransactionEntry;
