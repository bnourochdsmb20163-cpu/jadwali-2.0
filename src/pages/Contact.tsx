import { useState } from 'react';

const WHATSAPP_NUMBER = '212651011102';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

// رابط Google Script الخاص بورقة الرسائل فقط
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZKqexIDBhO4TjlI6_rUDs3DhSed1DH8oLQpr4DYyNMxicbnDTPFejZTCgNSeK6i_A/exec';

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(submitData),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
      });
      
      setShowSuccess(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('حدث خطأ في إرسال رسالتك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // باقي الكود كما هو...
  const faqs = [
    {
      question: "ما هو متوسط وقت إنجاز استعمال الزمن؟",
      answer: "متوسط وقت الإنجاز هو 48 ساعة من استلام جميع المعطيات المطلوبة."
    },
    {
      question: "هل يمكن تعديل استعمال الزمن بعد الإنتاج؟",
      answer: "نعم، نقدم مواكبة مجانية طوال السنة الدراسية لأي تعديلات طارئة."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عبر التحويل البنكي أو عبر وكالات تحويل الأموال."
    },
    {
      question: "هل تدعمون المؤسسات خارج المغرب؟",
      answer: "حالياً نركز على المؤسسات التعليمية المغربية فقط."
    }
  ];

  return (
    <div className="contact-page">
      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag">تواصل معنا</div>
            <h2 className="section-title">نحن هنا لمساعدتك</h2>
            <p className="section-subtitle">لديك سؤال أو استفسار؟ تواصل معنا وسنرد عليك في أقرب وقت</p>
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📱</div>
                <h3>واتساب</h3>
                <p>متاح للتواصل السريع — اضغط على الرقم للتواصل مباشرة</p>
                <a href={WHATSAPP_LINK} className="contact-link" target="_blank" rel="noopener noreferrer">
                  0651011102
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>البريد الإلكتروني</h3>
                <p>أرسل لنا استفسارك</p>
                <a href="mailto:contact@jadwali.ma" className="contact-link">
                  contact@jadwali.ma
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">⏰</div>
                <h3>ساعات العمل</h3>
                <p>طوال أيام الأسبوع</p>
                <span className="contact-text">8:00 صباحاً - 8:00 مساءً</span>
              </div>

              <div className="contact-card">
                <div className="contact-icon">⚡</div>
                <h3>سرعة الرد</h3>
                <p>نرد على جميع الاستفسارات</p>
                <span className="contact-text">في غضون 24 ساعة</span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h3>أرسل رسالتك</h3>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>الاسم الكامل <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل اسمك"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف <span className="required">*</span></label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="أدخل رقم هاتفك"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@gmail.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>الموضوع <span className="required">*</span></label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">— اختر الموضوع —</option>
                      <option value="inquiry">استفسار عام</option>
                      <option value="pricing">الأسعار</option>
                      <option value="service">طلب خدمة</option>
                      <option value="support">دعم فني</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>الرسالة <span className="required">*</span></label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  {!isSubmitting && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3 className="faq-title">الأسئلة الشائعة</h3>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div className="faq-item" key={index}>
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Section */}
          <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>تواصل مباشر عبر واتساب</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>أسرع طريقة للتواصل معنا والحصول على استشارة مجانية</p>
            <a
              href={WHATSAPP_LINK}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25d366', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}
            >
              📱 فتح المحادثة على واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-icon">✅</div>
            <h3>تم إرسال رسالتك بنجاح!</h3>
            <p>سنقوم بالرد عليك في أقرب وقت ممكن.</p>
            <button className="btn-primary" onClick={() => setShowSuccess(false)}>حسنًا، شكرًا</button>
          </div>
        </div>
      )}
    </div>
  );
}
