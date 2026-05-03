import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Bus Icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const cityCoordinates: Record<string, [number, number]> = {
  'بغداد': [33.3152, 44.3661],
  'أربيل': [36.1900, 44.0091],
  'البصرة': [30.5081, 47.7835],
  'السليمانية': [35.5558, 45.4434],
  'ميسان': [31.8415, 47.1415],
  'النجف': [31.9930, 44.3444]
};

interface TrackingMapProps {
  departureCity: string;
  arrivalCity: string;
}

export default function TrackingMap({ departureCity, arrivalCity }: TrackingMapProps) {
  const startPoint = cityCoordinates[departureCity] || cityCoordinates['بغداد'];
  const endPoint = cityCoordinates[arrivalCity] || cityCoordinates['أربيل'];
  
  // Calculate a point in between for the initial bus position
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([
    startPoint[0] + (endPoint[0] - startPoint[0]) * 0.3,
    startPoint[1] + (endPoint[1] - startPoint[1]) * 0.3,
  ]);

  useEffect(() => {
    // Simulate bus movement towards destination
    const latDiff = (endPoint[0] - startPoint[0]) * 0.005;
    const lngDiff = (endPoint[1] - startPoint[1]) * 0.005;

    const interval = setInterval(() => {
      setCurrentPosition((prev) => [
        prev[0] + latDiff,
        prev[1] + lngDiff,
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [endPoint, startPoint]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 z-0 relative">
      <MapContainer 
        center={currentPosition} 
        zoom={7} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={startPoint}>
          <Popup>الانطلاق ({departureCity})</Popup>
        </Marker>
        
        <Marker position={endPoint}>
          <Popup>الوصول ({arrivalCity})</Popup>
        </Marker>
        
        <Polyline 
          positions={[startPoint, endPoint]} 
          color="#10b981" 
          weight={4} 
          dashArray="10, 10" 
          opacity={0.5} 
        />
        
        <Marker position={currentPosition} icon={busIcon}>
          <Popup>الحافلة الحالية</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
