import { useState } from 'react';
import Dashboard from './components/Dashboard';
import PassengerApp from './components/PassengerApp';

// Mock User Session
const MOCK_USER = { uid: 'u1', displayName: 'أحمد صالح', email: 'ahmed@example.com' };

export default function App() {
  const [user, setUser] = useState<typeof MOCK_USER | null>(MOCK_USER);
  const [isOperatorMode, setIsOperatorMode] = useState(false);

  if (isOperatorMode) {
    return <Dashboard onExit={() => setIsOperatorMode(false)} />;
  }

  return (
    <PassengerApp 
      user={user} 
      onLogin={() => setUser(MOCK_USER)} 
      onLogout={() => setUser(null)}
      onLaunchOperator={() => setIsOperatorMode(true)}
    />
  );
}
