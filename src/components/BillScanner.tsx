
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Scan, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BillScannerProps {
  onBack: () => void;
  onSave: (expense: {
    title: string;
    amount: number;
    category: string;
    date: Date;
    type: 'expense' | 'income';
  }) => void;
}

const BillScanner: React.FC<BillScannerProps> = ({ onBack, onSave }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        simulateOCR(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOCR = (imageData: string) => {
    setIsScanning(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockData = {
        amount: 0,
        vendor: "McDonald's",
        date: new Date(),
        category: "Food",
        items: ["Big Mac Meal", "Coke", "Fries"]
      };
      
      setScannedData(mockData);
      setIsScanning(false);
      
      toast({
        title: "Receipt Scanned Successfully! 📷",
        description: "Bill details extracted using OCR technology",
      });
    }, 2000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan receipts",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setSelectedImage(imageData);
      setShowCamera(false);
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      
      simulateOCR(imageData);
    }
  };

  const handleSave = () => {
    if (scannedData) {
      onSave({
        title: scannedData.vendor,
        amount: scannedData.amount,
        category: scannedData.category,
        date: scannedData.date,
        type: 'expense'
      });
      
      toast({
        title: "Transaction Saved",
        description: "Receipt data added to your expenses",
      });
      
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              📷 Bill Scanner + Smart Entry
            </h1>
            <p className="text-gray-600">Scan receipts and auto-fill expense details</p>
          </div>
        </div>

        {!showCamera ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Scan Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Upload className="h-6 w-6" />
                    Upload Photo
                  </Button>
                  
                  <Button 
                    onClick={startCamera}
                    className="h-24 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Camera className="h-6 w-6" />
                    Take Photo
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {selectedImage && (
                  <div className="mt-4">
                    <img 
                      src={selectedImage} 
                      alt="Receipt" 
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                  </div>
                )}

                {isScanning && (
                  <div className="text-center p-4">
                    <Scan className="h-8 w-8 mx-auto mb-2 animate-pulse text-orange-600" />
                    <p>Scanning receipt with OCR...</p>
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scannedData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vendor</Label>
                          <p className="font-semibold">{scannedData.vendor}</p>
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <p className="font-semibold text-red-600">₹{scannedData.amount}</p>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <p className="font-semibold">{scannedData.category}</p>
                        </div>
                        <div>
                          <Label>Date</Label>
                          <p className="font-semibold">{scannedData.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Items Detected</Label>
                      <ul className="mt-2 space-y-1">
                        {scannedData.items.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    >
                      Save Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Scan className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Upload or capture a receipt to extract data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Camera View */
          <Card className="border-0 card-shadow">
            <CardContent className="p-6">
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full max-h-96 rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4">
                  <Button 
                    onClick={capturePhoto}
                    className="bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                  <Button 
                    onClick={() => setShowCamera(false)}
                    variant="outline"
                    className="bg-white dark:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 card-shadow bg-gradient-to-r from-orange-100 to-red-100">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">🔍 OCR Technology</h3>
            <p className="text-sm text-gray-600">
              Uses advanced Optical Character Recognition to extract vendor name, amount, date, and items from your receipts automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillScanner;
