import { useState, type FormEvent } from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { Accordion } from '../components/Accordion';
import {
  Mail,
  MessageSquare,
  Phone,
  HelpCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useMyTickets, useSubmitTicket } from '../hooks/useSupportTickets';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';
import type { SupportTicket } from '../types';

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

const STATUS_PILL: Record<
  SupportTicket['status'],
  { label: string; classes: string }
> = {
  open: {
    label: 'Open',
    classes: 'border-terracotta/40 text-terracotta bg-terracotta-container/30',
  },
  closed: {
    label: 'Closed',
    classes: 'border-on-surface-variant/40 text-on-surface-variant bg-surface-container/40',
  },
  archived: {
    label: 'Archived',
    classes: 'border-outline-variant/40 text-on-surface-variant/70 bg-surface-container/20',
  },
};

export default function SupportScreen({ onNavigate }: BaseScreenProps) {
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });
  const [form, setForm] = useState({ subject: '', message: '' });
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const { tickets, refresh: refreshTickets } = useMyTickets(user?.id ?? null);
  const { submit, busy } = useSubmitTicket();

  const formRef = useFocusTrap<HTMLFormElement>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = {
      subject: form.subject.trim(),
      message: form.message.trim(),
    };
    const next: typeof errors = {};
    if (trimmed.subject.length < 3) next.subject = 'Subject must be at least 3 characters.';
    if (trimmed.message.length < 10) next.message = 'Message must be at least 10 characters.';
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitError(null);
    const result = await submit(trimmed);
    if (!result.ok) {
      setSubmitError(result.error ?? 'Failed to send the ticket.');
      return;
    }
    setSent(true);
    setForm({ subject: '', message: '' });
    refreshTickets();
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
          <SectionCard className="lg:col-span-7">
            <SectionHeader
              icon={<HelpCircle className="w-5 h-5 text-primary" />}
              title="Frequently Asked Questions"
            />
            <div className="divide-y divide-outline-variant/40">
              {FAQS.map((item, i) => {
                const open = !!openFaq[i];
                return (
                  <Accordion
                    key={i}
                    id={`faq-${i}`}
                    title={item.q}
                    open={open}
                    onToggle={() => setOpenFaq((prev) => ({ ...prev, [i]: !prev[i] }))}
                  >
                    <p className="text-on-surface-variant text-sm leading-relaxed">{item.a}</p>
                  </Accordion>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard className="lg:col-span-5">
            <SectionHeader
              icon={<Send className="w-5 h-5 text-primary" />}
              title="Send us a ticket"
              subtitle="Signed in as you. We'll reply to your account."
            />

            {sent ? (
              <div
                role="status"
                className="bg-tertiary-container/30 border border-tertiary/40 rounded p-6 flex items-start gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-tertiary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface mb-1">Ticket sent</p>
                  <p className="text-sm text-on-surface-variant">
                    Thanks for reaching out. We&apos;ll respond as soon as we can.
                  </p>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="support-subject"
                    className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                  >
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    value={form.subject}
                    onChange={(e) => {
                      setForm({ ...form, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: undefined });
                    }}
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'support-subject-err' : undefined}
                    className={`w-full mt-1 bg-surface-container-low border rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 ${
                      errors.subject
                        ? 'border-error focus:ring-error'
                        : 'border-outline-variant focus:ring-primary'
                    }`}
                    placeholder="What's this about?"
                    maxLength={200}
                  />
                  {errors.subject && (
                    <p id="support-subject-err" className="text-xs text-error mt-1">
                      {errors.subject}
                    </p>
                  )}
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
                    rows={5}
                    value={form.message}
                    onChange={(e) => {
                      setForm({ ...form, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'support-message-err' : undefined}
                    className={`w-full mt-1 bg-surface-container-low border rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 resize-none ${
                      errors.message
                        ? 'border-error focus:ring-error'
                        : 'border-outline-variant focus:ring-primary'
                    }`}
                    placeholder="How can we help?"
                    maxLength={5000}
                  />
                  {errors.message && (
                    <p id="support-message-err" className="text-xs text-error mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
                {submitError && (
                  <p role="alert" className="text-xs text-error">
                    {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-primary text-on-primary py-3 rounded font-semibold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {busy ? 'Sending…' : 'Send Ticket'}
                </button>
              </form>
            )}
          </SectionCard>
        </div>

        {/* My tickets */}
        {tickets.length > 0 && (
          <SectionCard>
            <SectionHeader
              icon={<MessageSquare className="w-5 h-5 text-primary" />}
              title="Your tickets"
              subtitle="Track responses from our team"
            />
            <div className="mt-4 space-y-3">
              {tickets.map((t) => {
                const pill = STATUS_PILL[t.status];
                return (
                  <div
                    key={t.id}
                    className="border border-outline-variant/50 rounded p-4 bg-surface-container-low/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <p className="font-bold text-on-surface">{t.subject}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border self-start sm:self-auto ${pill.classes}`}
                      >
                        {pill.label}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap mb-2">
                      {t.message}
                    </p>
                    {t.admin_note && (
                      <div className="mt-3 p-3 bg-tertiary-container/30 border border-tertiary/40 rounded text-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">
                          Reply from our team
                        </p>
                        <p className="text-on-surface whitespace-pre-wrap">{t.admin_note}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-on-surface-variant mt-2">
                      Submitted {formatDate(Date.parse(t.created_at))}
                      {t.updated_at !== t.created_at && (
                        <> · Updated {formatDate(Date.parse(t.updated_at))}</>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </MainLayout>
  );
}
