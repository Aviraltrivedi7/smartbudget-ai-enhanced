
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

  // Mock location data for demo - Major Indian Cities
  const mockLocations = [
    { name: 'Mumbai, Maharashtra', spent: 15000, transactions: 25, lat: 19.0760, lng: 72.8777, color: '#ef4444' },
    { name: 'Delhi NCR', spent: 12500, transactions: 20, lat: 28.7041, lng: 77.1025, color: '#f59e0b' },
    { name: 'Bangalore, Karnataka', spent: 11000, transactions: 18, lat: 12.9716, lng: 77.5946, color: '#f59e0b' },
    { name: 'Hyderabad, Telangana', spent: 8500, transactions: 15, lat: 17.3850, lng: 78.4867, color: '#eab308' },
    { name: 'Chennai, Tamil Nadu', spent: 7200, transactions: 12, lat: 13.0827, lng: 80.2707, color: '#eab308' },
    { name: 'Kolkata, West Bengal', spent: 6800, transactions: 11, lat: 22.5726, lng: 88.3639, color: '#84cc16' },
    { name: 'Pune, Maharashtra', spent: 5500, transactions: 10, lat: 18.5204, lng: 73.8567, color: '#84cc16' },
    { name: 'Ahmedabad, Gujarat', spent: 4200, transactions: 8, lat: 23.0225, lng: 72.5714, color: '#22c55e' },
    { name: 'Jaipur, Rajasthan', spent: 3800, transactions: 7, lat: 26.9124, lng: 75.7873, color: '#22c55e' },
    { name: 'Lucknow, Uttar Pradesh', spent: 3200, transactions: 6, lat: 26.8467, lng: 80.9462, color: '#10b981' }
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
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Most Expensive Location</span>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      {locationData.length > 0 ? locationData[0].name.split(',')[0] : 'N/A'}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-600 px-3 py-1">
                    ₹{locationData.length > 0 ? locationData[0].spent.toLocaleString() : 0}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Average per Location</span>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      ₹{locationData.length > 0 ? Math.round(locationData.reduce((sum, loc) => sum + loc.spent, 0) / locationData.length).toLocaleString() : 0}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-600 px-3 py-1">
                    {locationData.length} cities
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Total Spending</span>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ₹{locationData.reduce((sum, loc) => sum + loc.spent, 0).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600 px-3 py-1">
                    {locationData.reduce((sum, loc) => sum + loc.transactions, 0)} txns
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Cheapest Location</span>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {locationData.length > 0 ? locationData[locationData.length - 1].name.split(',')[0] : 'N/A'}
                    </p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-600 px-3 py-1">
                    ₹{locationData.length > 0 ? locationData[locationData.length - 1].spent.toLocaleString() : 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive India Map */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🇮🇳 India Spending Heatmap</span>
              <div className="flex items-center gap-2 text-sm font-normal">
                <span className="text-gray-600">Spending Scale:</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} title="Low"></div>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} title="Medium"></div>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} title="High"></div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8">
              {/* India Map SVG */}
              <svg viewBox="0 0 800 900" className="w-full h-auto max-h-[600px] mx-auto">
                {/* India Outline (Simplified) */}
                <path
                  d="M 350 100 L 400 120 L 450 110 L 480 140 L 510 160 L 530 200 L 540 250 L 530 300 L 540 350 L 530 400 L 520 450 L 500 500 L 470 550 L 440 580 L 410 600 L 380 620 L 350 630 L 320 620 L 290 600 L 270 570 L 250 540 L 240 500 L 220 460 L 210 420 L 200 380 L 190 340 L 180 300 L 190 260 L 200 220 L 220 180 L 250 150 L 280 130 L 310 115 L 350 100"
                  fill="#e0f2fe"
                  stroke="#0369a1"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:fill-blue-100"
                />
                
                {/* State Borders (Simplified) */}
                <path
                  d="M 250 150 L 280 200 L 320 250 M 400 200 L 450 250 L 480 300 M 300 400 L 350 450 L 400 500"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.5"
                />
                
                {/* City Markers with Data */}
                {mockLocations.map((location, index) => {
                  // Convert lat/lng to SVG coordinates (simplified projection)
                  const x = ((location.lng - 68) / (97 - 68)) * 400 + 150;
                  const y = ((35 - location.lat) / (35 - 8)) * 600 + 80;
                  const size = Math.min(Math.max(location.spent / 500, 8), 30);
                  
                  return (
                    <g key={index} className="cursor-pointer group">
                      {/* Pulse Animation Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={size + 5}
                        fill={location.color}
                        opacity="0.2"
                        className="animate-pulse"
                      />
                      
                      {/* Main Marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        fill={location.color}
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-300 hover:r-8 filter drop-shadow-lg"
                      />
                      
                      {/* Amount Label */}
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white pointer-events-none"
                        style={{ fontSize: '10px' }}
                      >
                        ₹{(location.spent / 1000).toFixed(1)}k
                      </text>
                      
                      {/* Hover Tooltip */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <rect
                          x={x - 80}
                          y={y - 60}
                          width="160"
                          height="50"
                          fill="white"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          rx="8"
                          className="filter drop-shadow-xl"
                        />
                        <text
                          x={x}
                          y={y - 40}
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-900"
                          style={{ fontSize: '12px' }}
                        >
                          {location.name.split(',')[0]}
                        </text>
                        <text
                          x={x}
                          y={y - 25}
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                          style={{ fontSize: '10px' }}
                        >
                          ₹{location.spent.toLocaleString()} • {location.transactions} txns
                        </text>
                      </g>
                    </g>
                  );
                })}
                
                {/* Legend */}
                <g transform="translate(50, 800)">
                  <text x="0" y="0" className="text-sm font-semibold fill-gray-700" style={{ fontSize: '14px' }}>
                    💰 Spending by City
                  </text>
                  <text x="0" y="20" className="text-xs fill-gray-600" style={{ fontSize: '11px' }}>
                    Circle size = Amount spent | Color = Spending intensity
                  </text>
                </g>
              </svg>
              
              {/* Map Stats Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Map Statistics
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Total Locations:</span>
                    <span className="font-semibold">{locationData.length} cities</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold text-red-600">
                      ₹{locationData.reduce((sum, loc) => sum + loc.spent, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Avg per City:</span>
                    <span className="font-semibold text-blue-600">
                      ₹{Math.round(locationData.reduce((sum, loc) => sum + loc.spent, 0) / locationData.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Hover over circles to see detailed spending information for each city
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeoFinanceMap;
