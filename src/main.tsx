import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (import.meta.env.DEV) {
  localStorage.removeItem('sb-ryzskohhsqryyjuzcpif-auth-token');
  sessionStorage.removeItem('sb-ryzskohhsqryyjuzcpif-auth-token');
}

createRoot(document.getElementById("root")!).render(<App />);
