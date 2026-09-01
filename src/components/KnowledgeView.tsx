import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, ChevronRight, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export const KnowledgeView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  const articles = [
    {
      id: 1,
      title: 'Resolving Wi-Fi & Network Connectivity Failures',
      category: 'Network',
      readTime: '3 min',
      summary: 'Step-by-step diagnostic procedures for DHCP lease renewal, DNS cache flushes, and gateway verification.',
      content: `### Network Diagnostic Standard Operating Procedure

1. **Verify Physical / Interface State:**
   - Confirm Wi-Fi adapter is enabled: \`ip link set wlan0 up\`
   - Check available SSIDs: Ensure enterprise authentication certificates are valid.

2. **Renew DHCP Lease:**
   - Release existing IP: \`ipconfig /release\` (Windows) or \`sudo dhclient -r\` (Linux)
   - Request new lease: \`ipconfig /renew\` or \`sudo dhclient\`

3. **Flush DNS Cache:**
   - Clear resolver cache: \`ipconfig /flushdns\` or \`sudo systemd-resolve --flush-caches\`
   - Test external reachability with ICMP: \`ping 8.8.8.8\`

4. **Captive Portal / Proxy Resolution:**
   - Ensure local corporate proxy settings are set to automatic detection.`,
    },
    {
      id: 2,
      title: 'Bluetooth Peripheral Device Pairing & Driver Reset',
      category: 'Hardware',
      readTime: '2 min',
      summary: 'Troubleshooting steps for wireless mice, headsets, and keyboard peripheral recognition.',
      content: `### Bluetooth Troubleshooting Protocol

1. **Power Cycle Device:**
   - Turn peripheral off, wait 10 seconds, then hold pairing button for 5 seconds until LED blinks rapidly.

2. **Remove Stale Pairings:**
   - Open Bluetooth settings, select the affected device, and choose "Remove Device".
   - Clear cached pairings from device manager.

3. **Restart Bluetooth Support Service:**
   - Open \`services.msc\`, locate "Bluetooth Support Service", and select Restart.
   - Set Startup type to "Automatic".`,
    },
    {
      id: 3,
      title: 'Single Sign-On (SSO) & Account Password Lockout Policy',
      category: 'Access & Accounts',
      readTime: '4 min',
      summary: 'Security guidelines for account unlocks, Multi-Factor Authentication (MFA) reset, and role approvals.',
      content: `### Access & Account Unlock SOP

1. **Automated Lockout Window:**
   - Accounts lock automatically after 5 consecutive failed authentication attempts.
   - Automatic unlock occurs after 30 minutes if no security escalation is flagged.

2. **Immediate Administrator Override:**
   - Administrators can navigate to **Users** in the sidebar, search for the account, and verify identity.
   - Click "Assign role" or "Active status" to clear lock flags.

3. **MFA Token Resets:**
   - Requires secondary identity verification via registered phone or manager approval.`,
    },
  ];

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified technical standard operating procedures and self-service diagnostics.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, technical guides, or keywords..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Articles Grid or Article View */}
      {selectedArticle !== null ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs text-sky-600 font-semibold hover:underline cursor-pointer flex items-center gap-1 mb-2"
          >
            ← Back to all articles
          </button>
          {(() => {
            const art = articles.find((a) => a.id === selectedArticle);
            if (!art) return null;
            return (
              <div className="space-y-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {art.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">{art.title}</h2>
                  <p className="text-slate-500 text-xs mt-1">{art.summary}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-line leading-relaxed text-slate-800 font-mono text-[11px]">
                  {art.content}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filtered.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art.id)}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between cursor-pointer space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{art.readTime}</span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 mb-1">{art.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{art.summary}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sky-600 text-xs font-semibold">
                <span>Read article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
