
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft } from 'lucide-react';
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
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { toast } = useToast();

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUqqo6885S3b3TvjjQ';

  // Map settings
  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
  };

  const center = {
    lat: 20.5937,
    lng: 78.9629
  };

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  // Mock location data for demo - Major Indian Cities
  const mockLocations = [
    { name: 'Mumbai, Maharashtra', spent: 15000, transactions: 25, lat: 19.0760, lng: 72.8777, color: '#ef4444', icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
    { name: 'Delhi NCR', spent: 12500, transactions: 20, lat: 28.7041, lng: 77.1025, color: '#f59e0b', icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
    { name: 'Bangalore, Karnataka', spent: 11000, transactions: 18, lat: 12.9716, lng: 77.5946, color: '#f59e0b', icon: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
    { name: 'Hyderabad, Telangana', spent: 8500, transactions: 15, lat: 17.3850, lng: 78.4867, color: '#eab308', icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    { name: 'Chennai, Tamil Nadu', spent: 7200, transactions: 12, lat: 13.0827, lng: 80.2707, color: '#eab308', icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' },
    { name: 'Kolkata, West Bengal', spent: 6800, transactions: 11, lat: 22.5726, lng: 88.3639, color: '#84cc16', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { name: 'Pune, Maharashtra', spent: 5500, transactions: 10, lat: 18.5204, lng: 73.8567, color: '#84cc16', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { name: 'Ahmedabad, Gujarat', spent: 4200, transactions: 8, lat: 23.0225, lng: 72.5714, color: '#22c55e', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { name: 'Jaipur, Rajasthan', spent: 3800, transactions: 7, lat: 26.9124, lng: 75.7873, color: '#22c55e', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
    { name: 'Lucknow, Uttar Pradesh', spent: 3200, transactions: 6, lat: 26.8467, lng: 80.9462, color: '#10b981', icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }
  ];

  useEffect(() => {
    setLocationData(mockLocations);
  }, []);

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

        {/* Google Maps Integration */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                🇮🇳 India Spending Heatmap
                <Badge className="bg-green-100 text-green-600">Live Map</Badge>
              </span>
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
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={5}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    styles: [
                      {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                      }
                    ]
                  }}
                >
                  {/* Markers for each location */}
                  {isMapLoaded && locationData.map((location, index) => (
                    <Marker
                      key={index}
                      position={{ lat: location.lat, lng: location.lng }}
                      onClick={() => setSelectedLocation(location)}
                      icon={location.icon}
                      title={location.name}
                    />
                  ))}

                  {/* Info Window for selected location */}
                  {selectedLocation && (
                    <InfoWindow
                      position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                      onCloseClick={() => setSelectedLocation(null)}
                    >
                      <div style={{ padding: '8px', minWidth: '200px' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#1f2937' }}>
                          {selectedLocation.name}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>Total Spent:</span>
                            <span style={{ fontWeight: '600', color: '#dc2626' }}>
                              ₹{selectedLocation.spent.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>Transactions:</span>
                            <span style={{ fontWeight: '600', color: '#2563eb' }}>
                              {selectedLocation.transactions}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#4b5563' }}>Avg per Transaction:</span>
                            <span style={{ fontWeight: '600', color: '#16a34a' }}>
                              ₹{Math.round(selectedLocation.spent / selectedLocation.transactions).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
              
              {/* Map Stats Overlay */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-200">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Map Statistics
                </h3>
                <div className="space-y-2 text-xs">
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
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                💡 Click on markers to see detailed spending information
              </p>
              <Badge variant="outline" className="text-xs">
                Powered by Google Maps
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeoFinanceMap;
