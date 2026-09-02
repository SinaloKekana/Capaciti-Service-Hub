import React, { useState, useEffect } from 'react';
import { EmailNotification } from '../types/index.js';
import { X, Mail, Check, CheckCheck } from 'lucide-react';
import { CapacitiLogoIcon } from './CapacitiLogo.js';

interface EmailInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  emailLogs: EmailNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const EmailInboxDrawer: React.FC<EmailInboxDrawerProps> = ({
  isOpen,
  onClose,
  emailLogs,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    emailLogs.length > 0 ? emailLogs[0] : null
  );

  useEffect(() => {
    if (emailLogs.length > 0 && !selectedEmail) {
      setSelectedEmail(emailLogs[0]);
    }
  }, [emailLogs]);

  // When selected email changes, automatically mark it as read if unread
  useEffect(() => {
    if (selectedEmail && !selectedEmail.isRead && onMarkAsRead) {
      onMarkAsRead(selectedEmail.id);
    }
  }, [selectedEmail?.id]);

  if (!isOpen) return null;

  const handleSelectEmail = (email: EmailNotification) => {
    setSelectedEmail(email);
    if (!email.isRead && onMarkAsRead) {
      onMarkAsRead(email.id);
    }
  };

  const unreadCount = emailLogs.filter((e) => !e.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end font-sans">
      <div className="bg-white border-l border-slate-200 w-full max-w-2xl h-full flex flex-col shadow-2xl text-slate-800">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <CapacitiLogoIcon className="w-6 h-6 rounded-md shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Ticket Notifications</h2>
              <p className="text-[11px] text-slate-500">Capaciti delivered email receipts and updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 text-xs">
          {/* Email List Left Column */}
          <div className="border-r border-slate-200 overflow-y-auto p-3 space-y-1.5 bg-slate-50/50 max-h-[40vh] md:max-h-none">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Inbox ({emailLogs.length})
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No notifications recorded yet.</p>
            ) : (
              emailLogs.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isUnread = !email.isRead;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                        : isUnread
                        ? 'bg-white border-slate-200 text-slate-900 font-medium shadow-2xs'
                        : 'bg-white/80 border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <div className="flex items-center space-x-1">
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                        )}
                        <span className="font-mono text-slate-900 font-bold">{email.ticketId}</span>
                      </div>
                      <span>{new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="font-semibold text-xs truncate text-slate-900">{email.subject}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="truncate">To: {email.recipientName}</span>
                      {isUnread ? (
                        <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-slate-200 text-slate-800">NEW</span>
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email Preview Right Column */}
          <div className="p-4 overflow-y-auto bg-white flex-1">
            {selectedEmail ? (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Message Preview</span>
                    <span className="text-[10px] font-mono text-slate-400">{selectedEmail.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedEmail.subject}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    To: <span className="text-slate-800 font-semibold">{selectedEmail.recipientName}</span> ({selectedEmail.recipientEmail})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sent: {new Date(selectedEmail.sentAt).toLocaleString()}
                  </div>
                </div>

                {/* Quick Action for Password Reset Emails */}
                {selectedEmail.bodyHtml && selectedEmail.bodyHtml.includes('resetToken=') && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="text-sky-900 font-medium">
                      🔒 Single-use password reset verification link detected for <strong>{selectedEmail.recipientEmail}</strong>
                    </div>
                    <a
                      href={`/?resetToken=${selectedEmail.bodyHtml.match(/resetToken=([a-f0-9]+)/)?.[1] || ''}`}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-xs shrink-0 transition-all text-center"
                    >
                      Open Reset Form →
                    </a>
                  </div>
                )}

                <div
                  className="bg-slate-50 text-slate-900 p-4 rounded-lg border border-slate-200 overflow-x-auto text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Mail className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="text-xs">Select an email to view message contents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

