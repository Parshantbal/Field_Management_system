import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { api } from '../../api/client';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Info,
  AlertTriangle,
  Radio
} from 'lucide-react';

export const NotificationCenterView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>('INFO');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setStatusFeedback(null);
    try {
      await api.notifications.send({
        title: title.trim(),
        message: message.trim(),
        type,
        recipientEmail: recipientEmail.trim() || undefined
      });
      setTitle('');
      setMessage('');
      setRecipientEmail('');
      setStatusFeedback('Notification dispatched successfully!');
      fetchNotifications();
    } catch (err: any) {
      setStatusFeedback(`Failed to send: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (t: string) => {
    switch (t) {
      case 'ALERT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ALERT</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> WARNING</span>;
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SUCCESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-400" />
          <h2 className="text-xl font-bold text-white">Notification & Alert Broadcast Center</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Broadcast emergency facility alerts, work order dispatch updates, or direct tenant messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Radio className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-white">Broadcast New Alert</h3>
          </div>

          {statusFeedback && (
            <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
              statusFeedback.includes('successfully')
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              <Info className="w-4 h-4 shrink-0" />
              <span>{statusFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient Email (Leave blank to broadcast to all)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. client.apex@keystone.io"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Severity / Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              >
                <option value="INFO">INFO (General announcement)</option>
                <option value="SUCCESS">SUCCESS (Maintenance completed)</option>
                <option value="WARNING">WARNING (Scheduled outage or maintenance)</option>
                <option value="ALERT">ALERT (Critical emergency / fire alarm / leak)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled Chiller Inspection at Apex Tower"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                required
                rows={4}
                placeholder="Details of the notification..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{recipientEmail.trim() ? 'Send Targeted Message' : 'Broadcast to System'}</span>
            </button>
          </form>
        </div>

        {/* History of Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-base font-bold text-white mb-4">Notification Feed & History</h3>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm font-mono">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No notifications recorded yet.</div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(n.type)}
                      <h4 className="font-semibold text-white text-sm">{n.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{n.message}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850">
                    <span>
                      Target:{' '}
                      <span className="text-slate-300 font-mono">
                        {n.recipientEmail ? n.recipientEmail : 'All System Tenants & Techs'}
                      </span>
                    </span>
                    <span className={n.read ? 'text-slate-500' : 'text-purple-400 font-semibold'}>
                      {n.read ? 'Viewed' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
