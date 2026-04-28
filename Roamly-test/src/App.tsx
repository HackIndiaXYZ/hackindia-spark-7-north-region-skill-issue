import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import Planner from './pages/Planner';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Community from './pages/Community';
import SharedItinerary from './pages/SharedItinerary';
import About from './pages/About';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Press from './pages/Press';
import HelpCenter from './pages/HelpCenter';
import Safety from './pages/Safety';
import Cancellation from './pages/Cancellation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
      {/* Background Orbs & Gradients */}
      <div className="bg-gradient"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/community" element={<Community />} />
          <Route path="/shared/:planId" element={<SharedItinerary />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/cancellation" element={<Cancellation />} />
        </Routes>
        <Footer />
      </div>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
