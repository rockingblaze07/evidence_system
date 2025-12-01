import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PoliceDashboard from "./pages/PoliceDashboard";
import ForensicDashboard from "./pages/ForensicDashboard";
import CourtDashboard from "./pages/CourtDashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VoiceAssistant from "./pages/VoiceAssistant";
import ProtectedRoute from "./components/ProtectedRoute";
// import LanguageSelector from "./components/LanguageSelector";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-black font-['Abel'] text-white">
        <div className="blurry-shape"></div>
        <div className="relative z-10">
          <Navbar />
          {/* <LanguageSelector /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route 
              path="/police" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'police']}>
                  <PoliceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forensic" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'forensic']}>
                  <ForensicDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/court" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'court']}>
                  <CourtDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/voice-assistant" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VoiceAssistant />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
