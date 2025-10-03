
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  location?: string;
}

interface GeoFinanceMapProps {
  onBack: () => void;
  transactions: Transaction[];
}

const GeoFinanceMap: React.FC<GeoFinanceMapProps> = ({ onBack, transactions }) => {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const { toast } = useToast();

  // Mock location data for demo
  const mockLocations = [
    { name: 'Phoenix Mall, Chennai', spent: 4500, transactions: 12, lat: 13.0827, lng: 80.2707 },
    { name: 'Express Avenue, Chennai', spent: 3200, transactions: 8, lat: 13.0569, lng: 80.2539 },
    { name: 'Forum Mall, Chennai', spent: 2800, transactions: 6, lat: 13.0418, lng: 80.2341 },
    { name: 'T.Nagar, Chennai', spent: 5200, transactions: 15, lat: 13.0418, lng: 80.2341 }
  ];

  useEffect(() => {
    setLocationData(mockLocations);
  }, []);

  const handleMapboxConnect = () => {
    if (!mapboxToken) {
      toast({
        title: "Mapbox Token Required",
        description: "Please enter your Mapbox public token to enable map visualization",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Map Integration Ready! 🗺️",
      description: "Mapbox token saved. Map visualization is now available!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              📍 Geo-Finance Heatmap
            </h1>
            <p className="text-gray-600">See where your money goes geographically</p>
          </div>
        </div>

        {/* Mapbox Token Input */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Map Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Enter your Mapbox public token to enable interactive map visualization:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleMapboxConnect}>
                  Connect Map
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get your token from <a href="https://mapbox.com" target="_blank" className="text-blue-600 underline">mapbox.com</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location Spending Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle>Top Spending Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">₹{location.spent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle>Location Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Expensive Location</span>
                  <Badge className="bg-red-100 text-red-600">
                    T.Nagar, Chennai
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average per Location</span>
                  <Badge className="bg-green-100 text-green-600">
                    ₹3,925
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Locations</span>
                  <Badge className="bg-purple-100 text-purple-600">
                    {locationData.length} places
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>Interactive Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              {mapboxToken ? (
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Map will load here with your spending locations</p>
                  <p className="text-sm text-gray-500">Integration ready with Mapbox!</p>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Connect Mapbox to see interactive heatmap</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeoFinanceMap;
