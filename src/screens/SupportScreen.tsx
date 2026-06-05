import { useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import {
  ChevronDown,
  Mail,
  MessageSquare,
  Phone,
  HelpCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How are the questions scored?',
    a: 'Each correct answer earns 1 point. Your final score is the percentage of correct answers out of the total number of items in the exam.',
  },
  {
    q: 'What is the passing score?',
    a: 'The Civil Service Examination Professional and Sub-Professional levels both require a general rating of 80% to pass. This app uses 80% as the passing threshold.',
  },
  {
    q: 'Can I retake an exam I already submitted?',
    a: 'Yes. From the Dashboard or the Performance screen, click "Take Another Exam" to start a fresh attempt. Your previous results remain in your history.',
  },
  {
    q: 'How is the timer handled?',
    a: 'The timer counts down from the moment you start the exam. If the timer reaches zero, your exam is automatically submitted with whatever answers you have provided.',
  },
  {
    q: 'Does flagging an item count against me?',
    a: 'No. Flagging is just a bookmark. It has no impact on your score, and you can return to flagged items at any time before submitting.',
  },
  {
    q: 'Where does my data go?',
    a: 'Your exam history and progress are stored locally in your browser via localStorage. Clearing your browser data will reset your history.',
  },
];

export default function SupportScreen({ onNavigate }: BaseScreenProps) {
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const formRef = useFocusTrap<HTMLFormElement>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="support">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
            Support
          </h1>
          <p className="text-base text-on-surface-variant">
            Find answers to common questions, or get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="mailto:support@mockpass.ph"
            className="bg-surface-container-high p-6 border border-outline-variant rounded hover:border-primary transition-colors group"
          >
            <Mail className="w-6 h-6 text-primary mb-3" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
              Email
            </p>
            <p className="font-bold text-on-surface mb-1">support@mockpass.ph</p>
            <p className="text-sm text-on-surface-variant">Reply within 24 hours</p>
          </a>
          <a
            href="#chat"
            onClick={(e) => e.preventDefault()}
            className="bg-surface-container-high p-6 border border-outline-variant rounded hover:border-primary transition-colors group"
          >
            <MessageSquare className="w-6 h-6 text-primary mb-3" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
              Live Chat
            </p>
            <p className="font-bold text-on-surface mb-1">Available Mon–Fri</p>
            <p className="text-sm text-on-surface-variant">9:00 AM – 6:00 PM PHT</p>
          </a>
          <a
            href="tel:+63281234567"
            className="bg-surface-container-high p-6 border border-outline-variant rounded hover:border-primary transition-colors group"
          >
            <Phone className="w-6 h-6 text-primary mb-3" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
              Hotline
            </p>
            <p className="font-bold text-on-surface mb-1">+63 (2) 8123 4567</p>
            <p className="text-sm text-on-surface-variant">For account-related concerns</p>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-outline-variant/40">
              {FAQS.map((item, i) => {
                const open = !!openFaq[i];
                return (
                  <div key={i}>
                    <button
                      onClick={() =>
                        setOpenFaq((prev) => ({ ...prev, [i]: !prev[i] }))
                      }
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                      className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      <span className="font-semibold text-on-surface pr-4">{item.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 shrink-0 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={`faq-${i}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        open ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-5 bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
            </div>

            {sent ? (
              <div
                role="status"
                className="bg-tertiary-container/30 border border-tertiary/40 rounded p-6 flex items-start gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-tertiary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface mb-1">Message sent</p>
                  <p className="text-sm text-on-surface-variant">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="support-name"
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                  >
                    Name
                  </label>
                  <input
                    id="support-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-email"
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                  >
                    Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-message"
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded font-semibold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
