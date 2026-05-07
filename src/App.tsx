import { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import About from './pages/About';
import SimpleSurvey from './pages/SimpleSurvey';

// ===== THEME CONTEXT =====
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ===== SURVEY CHOICE CONTEXT =====
interface SurveyChoiceContextType {
  showSurveyChoice: boolean;
  setShowSurveyChoice: (show: boolean) => void;
}

const SurveyChoiceContext = createContext<SurveyChoiceContextType>({
  showSurveyChoice: false,
  setShowSurveyChoice: () => {},
});

export const useSurveyChoice = () => useContext(SurveyChoiceContext);

// ===== THEME PROVIDER =====
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('jadwali-theme');
    if (saved === 'dark') return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jadwali-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ===== THEME TOGGLE BUTTON =====
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'تبديل للوضع النهاري' : 'تبديل للوضع الليلي'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

// ===== GLOBAL SURVEY CHOICE MODAL =====
function GlobalSurveyModal() {
  const navigate = useNavigate();
  const { showSurveyChoice, setShowSurveyChoice } = useSurveyChoice();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedSurveyType, setSelectedSurveyType] = useState<'simple' | 'detailed' | null>(null);

  const STORAGE_KEY = 'jadwali_form_data';
  const STORAGE_KEY_SIMPLE = 'jadwali_simple_data';

  useEffect(() => {
    if (showSurveyChoice) {
      setShowChoiceModal(true);
      setShowSurveyChoice(false);
    }
  }, [showSurveyChoice, setShowSurveyChoice]);

  const closeSurveyChoiceModal = () => {
    setShowChoiceModal(false);
    setSelectedSurveyType(null);
  };

  const handleSurveyChoice = (type: 'simple' | 'detailed') => {
    setSelectedSurveyType(type);
    setShowChoiceModal(false);

    const storageKey = type === 'simple' ? STORAGE_KEY_SIMPLE : STORAGE_KEY;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let hasData = false;
        if (type === 'simple') {
          hasData = !!(parsed.institutionName || parsed.phone || parsed.location || parsed.structure || parsed.materialStructure || parsed.notes || (parsed.institutionTypes && parsed.institutionTypes.length > 0));
        } else {
          hasData = Object.keys(parsed).some(key => {
            if (key === 'currentStep') return false;
            const val = parsed[key];
            if (Array.isArray(val) && val.length === 0) return false;
            if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) return false;
            return val !== undefined && val !== '' && val !== 0;
          });
        }

        if (hasData) {
          setShowResumeModal(true);
        } else {
          navigate(type === 'simple' ? '/simple-survey' : '/services');
        }
      } catch {
        navigate(type === 'simple' ? '/simple-survey' : '/services');
      }
    } else {
      navigate(type === 'simple' ? '/simple-survey' : '/services');
    }
  };

  const closeResumeModal = () => {
    setShowResumeModal(false);
    setSelectedSurveyType(null);
  };

  const handleCorrect = () => {
    closeResumeModal();
    if (selectedSurveyType) {
      sessionStorage.setItem('jadwali_resume_navigated', 'true');
      navigate(selectedSurveyType === 'simple' ? '/simple-survey' : '/services');
    }
  };

  const handleNew = () => {
    if (selectedSurveyType === 'simple') {
      localStorage.removeItem(STORAGE_KEY_SIMPLE);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    closeResumeModal();
    if (selectedSurveyType) {
      navigate(selectedSurveyType === 'simple' ? '/simple-survey' : '/services');
    }
  };

  return (
    <>
      {/* Survey Choice Modal */}
      {showChoiceModal && (
        <div className="modal-overlay open" onClick={closeSurveyChoiceModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeSurveyChoiceModal}>×</button>
            <div className="modal-icon">📋</div>
            <h3>اختر نوع الاستبيان</h3>
            <p>اختر الطريقة التي تناسبك لطلب الخدمة:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => handleSurveyChoice('simple')}
                style={{ background: '#059669', flex: 1, flexDirection: 'column', gap: '0.5rem', height: 'auto', padding: '1.5rem 1rem' }}
              >
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <span>استبيان بسيط</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 400 }}>ملء سريع بخطوة واحدة</span>
              </button>
              <button
                className="btn-primary"
                onClick={() => handleSurveyChoice('detailed')}
                style={{ background: '#2563eb', flex: 1, flexDirection: 'column', gap: '0.5rem', height: 'auto', padding: '1.5rem 1rem' }}
              >
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <span>استبيان دقيق</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 400 }}>تفاصيل كاملة بـ 11 خطوة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Modal for existing data */}
      {showResumeModal && (
        <div className="modal-overlay open" onClick={closeResumeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeResumeModal}>×</button>
            <div className="modal-icon">📋</div>
            <h3>هل تريد متابعة طلب سابق؟</h3>
            <p>يوجد بيانات غير مكتملة من جلسة سابقة. ماذا تريد أن تفعل؟</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn-primary"
                onClick={handleCorrect}
                style={{ background: '#2563eb', flex: 1 }}
              >
                استكمال الطلب السابق
              </button>
              <button
                className="btn-primary"
                onClick={handleNew}
                style={{ background: '#ef4444', flex: 1 }}
              >
                طلب جديد (مسح البيانات)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== NAVIGATION COMPONENT =====
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setShowSurveyChoice } = useSurveyChoice();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    if (path === '/services') {
      setShowSurveyChoice(true);
      setIsMobileMenuOpen(false);
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/services', label: 'طلب الخدمة' },
    { path: '/portfolio', label: 'نماذج أعمالنا' },
    { path: '/pricing', label: 'الأسعار' },
    { path: '/about', label: 'من نحن' },
    { path: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>
          <span className="logo-icon">&#x29D6;</span>
          <span className="logo-text">جدولي</span>
        </div>
        <div className="nav-links">
          {navLinks.map(link => (
            <a key={link.path} className={isActive(link.path) ? 'active' : ''} onClick={() => handleNavClick(link.path)}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle />
          <button className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <a key={link.path} className={isActive(link.path) ? 'active' : ''} onClick={() => handleNavClick(link.path)}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ===== FOOTER COMPONENT =====
function Footer() {
  const navigate = useNavigate();
  const { setShowSurveyChoice } = useSurveyChoice();

  const handleNavClick = (path: string) => {
    if (path === '/services') {
      setShowSurveyChoice(true);
      return;
    }
    navigate(path);
    window.scrollTo(0, 0);
  };

  const footerLinks = [
    { path: '/', label: 'الرئيسية' },
    { path: '/services', label: 'طلب الخدمة' },
    { path: '/portfolio', label: 'نماذج أعمالنا' },
    { path: '/pricing', label: 'الأسعار' },
    { path: '/about', label: 'من نحن' },
    { path: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="nav-logo" onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>
            <span className="logo-icon">&#x29D6;</span>
            <span className="logo-text">جدولي</span>
          </div>
          <p>خدمة متخصصة في إنتاج استعمالات الزمن للمؤسسات التعليمية المغربية</p>
        </div>
        <div className="footer-links">
          <h5>روابط سريعة</h5>
          {footerLinks.map(link => (
            <a key={link.path} onClick={() => handleNavClick(link.path)}>{link.label}</a>
          ))}
        </div>
        <div className="footer-contact">
          <h5>تواصل معنا</h5>
          <p>
            <a href="https://wa.me/212651011102" className="contact-link" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-light)' }}>
              WhatsApp: 0651011102
            </a>
          </p>
          <p>⏰ نعمل طوال أيام الأسبوع</p>
          <p>🕐 من 08:00 إلى 20:00</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 جدولي — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}

// ===== WHATSAPP FLOAT BUTTON =====
function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/212651011102"
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      title="تواصل عبر واتساب"
    >
      💬
    </a>
  );
}

// ===== MAIN APP =====
function App() {
  const [showSurveyChoice, setShowSurveyChoice] = useState(false);

  return (
    <ThemeProvider>
      <SurveyChoiceContext.Provider value={{ showSurveyChoice, setShowSurveyChoice }}>
        <Router>
          <div className="app">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/simple-survey" element={<SimpleSurvey />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFloat />
            <GlobalSurveyModal />
          </div>
        </Router>
      </SurveyChoiceContext.Provider>
    </ThemeProvider>
  );
}

export default App;
