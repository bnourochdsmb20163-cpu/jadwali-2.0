import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAIlLluBen-njkKuJ04KpyThdYaxfoyETC2mj6KeV8jshu5QZ4qPWKqRBwK4tQQq_3/exec';
const STORAGE_KEY_SIMPLE = 'jadwali_simple_data';

interface SimpleFormData {
  institutionName: string;
  phone: string;
  location: string;
  institutionTypes: string[];
  structure: string;
  materialStructure: string;
  notes: string;
}

export default function SimpleSurvey() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SimpleFormData>({
    institutionName: '',
    phone: '',
    location: '',
    institutionTypes: [],
    structure: '',
    materialStructure: '',
    notes: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [choiceMade, setChoiceMade] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIMPLE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasData = !!(parsed.institutionName || parsed.phone || parsed.location || parsed.structure || parsed.materialStructure || parsed.notes || (parsed.institutionTypes && parsed.institutionTypes.length > 0));

        if (hasData) {
          setFormData({
            institutionName: parsed.institutionName || '',
            phone: parsed.phone || '',
            location: parsed.location || '',
            institutionTypes: parsed.institutionTypes || [],
            structure: parsed.structure || '',
            materialStructure: parsed.materialStructure || '',
            notes: parsed.notes || '',
          });
          setShowChoiceModal(true);
        } else {
          setChoiceMade(true);
        }
      } catch {
        setChoiceMade(true);
      }
    } else {
      setChoiceMade(true);
    }
    setIsLoaded(true);
  }, []);

  const handleNewRequest = () => {
    localStorage.removeItem(STORAGE_KEY_SIMPLE);
    setShowChoiceModal(false);
    setChoiceMade(true);
    setFormData({
      institutionName: '',
      phone: '',
      location: '',
      institutionTypes: [],
      structure: '',
      materialStructure: '',
      notes: '',
    });
  };

  const handleOldRequest = () => {
    setShowChoiceModal(false);
    setChoiceMade(true);
  };

  // Auto-save
  useEffect(() => {
    if (choiceMade) {
      localStorage.setItem(STORAGE_KEY_SIMPLE, JSON.stringify(formData));
    }
  }, [formData, choiceMade]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInstitutionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      institutionTypes: prev.institutionTypes.includes(type)
        ? prev.institutionTypes.filter(t => t !== type)
        : [...prev.institutionTypes, type]
    }));
  };

  const buildWhatsAppText = () => {
    const lines: string[] = [];
    lines.push('=== طلب خدمة إنتاج استعمال الزمن (استبيان بسيط) ===');
    lines.push('');
    lines.push('📌 معلومات المؤسسة:');
    lines.push(`• اسم المؤسسة: ${formData.institutionName || '—'}`);
    lines.push(`• رقم الهاتف: ${formData.phone || '—'}`);
    lines.push(`• الموقع: ${formData.location || '—'}`);
    lines.push('');
    lines.push('🏫 نوع المؤسسة:');
    formData.institutionTypes.forEach(t => {
      lines.push(`• ${t === 'college' ? 'إعدادي عادي' : t === 'college-pioneer' ? 'إعدادي رائد' : 'ثانوي تأهيلي'}`);
    });
    if (formData.institutionTypes.length === 0) lines.push('• —');
    lines.push('');
    lines.push('📚 البنية التربوية:');
    lines.push(`• ${formData.structure || '—'}`);
    lines.push('');
    lines.push('🏢 البنية المادية (عدد القاعات):');
    lines.push(`• ${formData.materialStructure || '—'}`);
    lines.push('');
    lines.push('📝 الملاحظات:');
    lines.push(`• ${formData.notes || '—'}`);
    lines.push('');
    lines.push('===================');
    return lines.join('\n');
  };

  const handleCopyToWhatsApp = async () => {
    const text = buildWhatsAppText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Send to Google Sheet with status "واتساب"
    const submitData = {
      institutionName: formData.institutionName,
      phone: formData.phone,
      region: '',
      province: '',
      commune: formData.location,
      otherCommune: '',
      institutionTypes: formData.institutionTypes,
      teacherConditions: `البنية التربوية: ${formData.structure}`,
      orgWishes: `البنية المادية (عدد القاعات): ${formData.materialStructure}`,
      additionalNotes: formData.notes,
      serviceType: 'simple-survey',
      requestStatus: 'واتساب',
      whatsapp: 'نعم',
      submit: 'لا',
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(submitData),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        mode: 'no-cors',
      });
    } catch (error) {
      console.error('Submit error:', error);
    }

    // Show toast instead of alert
    setToastMessage('✅ تم نسخ جميع المعلومات بنجاح! يمكنك الآن لصقها في واتساب.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send to Google Sheet with status "جديد"
    const submitData = {
      institutionName: formData.institutionName,
      phone: formData.phone,
      region: '',
      province: '',
      commune: formData.location,
      otherCommune: '',
      institutionTypes: formData.institutionTypes,
      teacherConditions: `البنية التربوية: ${formData.structure}`,
      orgWishes: `البنية المادية (عدد القاعات): ${formData.materialStructure}`,
      additionalNotes: formData.notes,
      serviceType: 'simple-survey',
      requestStatus: 'جديد',
      whatsapp: 'لا',
      submit: 'نعم',
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(submitData),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        mode: 'no-cors',
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
    localStorage.removeItem(STORAGE_KEY_SIMPLE);
    setShowSuccess(true);
  };

  if (!isLoaded) {
    return (
      <div className="services-page">
        <section className="form-section page-form">
          <div className="section-container">
            <div className="form-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
              <p>جاري التحميل...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="services-page">
      <section className="form-section page-form">
        <div className="section-container">
          <div className="progress-container" style={{ marginTop: '2rem' }}>
            <div className="step-title-bar">
              <span className="step-title-num">استبيان بسيط</span>
              <span className="step-title-name">طلب خدمة استعمال الزمن</span>
            </div>
          </div>

          <div className="form-wrapper">
            <form onSubmit={handleSubmit}>
              <div className="form-step active">
                <div className="step-header">
                  <div className="step-num">01</div>
                  <div>
                    <h3 className="step-title">معلومات المؤسسة</h3>
                    <p className="step-desc">أدخل البيانات الأساسية لمؤسستك التعليمية</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>اسم المؤسسة <span className="required">*</span></label>
                    <input
                      type="text"
                      name="institutionName"
                      placeholder="ثانوية / إعدادية......"
                      required
                      value={formData.institutionName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>رقم الهاتف للتواصل <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="أدخل رقم الهاتف"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>موقع المؤسسة <span className="required">*</span></label>
                    <input
                      type="text"
                      name="location"
                      placeholder="الجهة / الاقليم / الجماعة.... "
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h4 className="sub-section-title">🏫 نوع المؤسسة</h4>
                  <div className="type-cards">
                    <label className={`type-card ${formData.institutionTypes.includes('college') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.institutionTypes.includes('college')}
                        onChange={() => toggleInstitutionType('college')}
                      />
                      <div className="type-card-inner">
                        <div className="type-icon">🏫</div>
                        <div className="type-title">إعدادي عادي</div>
                      </div>
                    </label>
                    <label className={`type-card ${formData.institutionTypes.includes('college-pioneer') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.institutionTypes.includes('college-pioneer')}
                        onChange={() => toggleInstitutionType('college-pioneer')}
                      />
                      <div className="type-card-inner">
                        <div className="type-icon">🌟</div>
                        <div className="type-title">إعدادي رائد</div>
                      </div>
                    </label>
                    <label className={`type-card ${formData.institutionTypes.includes('highschool') ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.institutionTypes.includes('highschool')}
                        onChange={() => toggleInstitutionType('highschool')}
                      />
                      <div className="type-card-inner">
                        <div className="type-icon">🎓</div>
                        <div className="type-title">ثانوي تأهيلي</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h4 className="sub-section-title">📚 البنية التربوية</h4>
                  <div className="form-group full-width">
                    <label>اكتب البنية التربوية للمؤسسة</label>
                    <textarea
                      name="structure"
                      rows={4}
                      placeholder="مثال: ثلاثة مستويات إعدادية (أولى: 4 أقسام، ثانية: 3 أقسام، ثالثة: 3 أقسام) + مسار دولي..."
                      value={formData.structure}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h4 className="sub-section-title">🏢 البنية المادية (عدد القاعات)</h4>
                  <div className="form-group full-width">
                    <label>اكتب عدد القاعات والمرافق</label>
                    <textarea
                      name="materialStructure"
                      rows={3}
                      placeholder="مثال: 10 قاعات عامة، 2 مختبرات علمية، 1 قاعة إعلاميات، 1 ملعب..."
                      value={formData.materialStructure}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h4 className="sub-section-title">📝 الملاحظات</h4>
                  <div className="form-group full-width">
                    <label>أي ملاحظات أو شروط خاصة</label>
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="اكتب هنا أي ملاحظات إضافية أو شروط خاصة بالأساتذة أو التنظيم..."
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="form-nav" style={{ justifyContent: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCopyToWhatsApp}
                  style={{ background: '#25d366', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}
                >
                  📋 نسخ للواتساب
                </button>
                <button type="submit" className="btn-submit">
                  <span>إرسال البيانات</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#059669',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Choice Modal */}
      {showChoiceModal && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <button className="modal-close" onClick={handleNewRequest}>×</button>
            <div className="modal-icon">📋</div>
            <h3>هل تريد متابعة طلب سابق؟</h3>
            <p>يوجد بيانات غير مكتملة من جلسة سابقة. ماذا تريد أن تفعل؟</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={handleOldRequest} style={{ background: '#2563eb', flex: 1 }}>
                استكمال الطلب السابق
              </button>
              <button className="btn-primary" onClick={handleNewRequest} style={{ background: '#ef4444', flex: 1 }}>
                طلب جديد (مسح البيانات)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-icon">🎉</div>
            <h3>تم إرسال طلبك بنجاح!</h3>
            <p>تم استلام طلبكم بنجاح. سيتم تحليله خلال 24 ساعة وسيتم التواصل معكم قريبًا.</p>
            <p className="note-text">تنبيه: معالجة وتنفيذ طلبكم يتم بالترتيب اعتمادًا على تاريخ ووقت توصلنا بتأكيد الطلب.</p>
            <button
              className="btn-primary"
              onClick={() => {
                setShowSuccess(false);
                navigate('/');
              }}
            >
              حسنًا، شكرًا
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
