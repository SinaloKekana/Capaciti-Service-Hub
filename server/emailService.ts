import { db } from './db.js';
import { RequestItem, ApprovalRequest, WorkflowRule } from '../src/types/index.js';

export function sendTicketConfirmationEmail(request: RequestItem) {
  const recipientEmail = request.userEmail || 'user@example.com';
  const subject = `Capaciti Service Hub Confirmation: [${request.id}] ${request.title}`;
  
  const categoryBadge = request.aiClassification?.category || 'Pending AI Classification';
  
  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #0f172a; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Capaciti Service Hub</h2>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Automated Ticket Confirmation</p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${request.userName || 'User'},</h3>
        <p>Your business request has been submitted successfully and logged under account <strong>${recipientEmail}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">Ticket Reference</p>
          <p style="margin: 0 0 12px; font-size: 22px; font-family: monospace; font-weight: 700; color: #1e293b;">${request.id}</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 130px;">Account Email:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #4f46e5;">${recipientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Title:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${request.title}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Department:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${request.department || 'General'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Priority:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${request.priority}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">SLA Target:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${request.slaTargetHours || 24} hours</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">AI Category:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #4f46e5;">${categoryBadge}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Status:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #059669;">${request.status}</td>
            </tr>
          </table>
        </div>

        ${request.aiClassification ? `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #166534;">🤖 AI Analysis Summary:</p>
          <p style="margin: 0 0 8px; font-size: 13px; color: #15803d;">${request.aiClassification.summary}</p>
          <p style="margin: 0; font-size: 12px; color: #166534;"><strong>Recommended Action:</strong> ${request.aiClassification.recommendedAction}</p>
        </div>
        ` : ''}
        
        <p>Our operations team will review your request shortly. You can track real-time SLA progress in the Capaciti Service Hub portal.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Automated message sent to ${recipientEmail} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    request.id,
    recipientEmail,
    request.userName || 'User',
    subject,
    bodyHtml,
    'CONFIRMATION'
  );
}

export function sendTicketStatusUpdateEmail(request: RequestItem, oldStatus: string, newStatus: string) {
  const recipientEmail = request.userEmail || 'user@example.com';
  const isResolved = newStatus === 'Resolved';
  const isBlocked = newStatus === 'Account Blocked';

  const subject = isResolved
    ? `[RESOLVED] Issue Ticket Resolved [${request.id}]: ${request.title}`
    : isBlocked
    ? `[IMPORTANT] Account Notice [${request.id}]: Status set to Account Blocked`
    : `Capaciti Ticket Updated [${request.id}]: Status Changed to ${newStatus}`;
  
  const headerBg = isResolved ? '#065f46' : isBlocked ? '#881337' : '#0f172a';
  const bannerBorderColor = isResolved ? '#10b981' : isBlocked ? '#f43f5e' : '#4f46e5';
  const bannerBgColor = isResolved ? '#ecfdf5' : isBlocked ? '#fff1f2' : '#f8fafc';

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: ${headerBg}; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">
          ${isResolved ? '✅ Ticket Resolved Notice' : isBlocked ? '🚫 Account Security Notice' : '🔄 Capaciti Ticket Status Update'}
        </h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Tracking Reference: <strong>${request.id}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${request.userName || 'User'},</h3>
        
        ${isResolved ? `
        <p>The issue reported in your ticket <strong>"${request.title}"</strong> has been processed and marked as <strong>RESOLVED</strong> by our operations team.</p>
        ` : `
        <p>The status of your business ticket <strong>"${request.title}"</strong> has been updated.</p>
        `}
        
        <div style="background-color: ${bannerBgColor}; border: 1px solid #e2e8f0; border-left: 4px solid ${bannerBorderColor}; padding: 18px; border-radius: 6px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">Previous Status:</span>
            <span style="font-size: 12px; color: #94a3b8; text-decoration: line-through;">${oldStatus}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 14px; font-weight: 700; color: #0f172a;">New Ticket Status:</span>
            <span style="font-size: 16px; font-weight: 800; color: ${isResolved ? '#047857' : isBlocked ? '#be123c' : '#4338ca'}; background: #ffffff; padding: 4px 12px; border-radius: 4px; border: 1px solid #cbd5e1;">
              ${newStatus}
            </span>
          </div>
          
          ${request.resolutionNotes ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #cbd5e1;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
              ${isResolved ? 'Solution & Resolution Notes:' : 'Operations Staff Notes:'}
            </p>
            <p style="margin: 0; font-size: 14px; color: #1e293b; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-style: italic;">
              "${request.resolutionNotes}"
            </p>
          </div>
          ` : ''}
        </div>
        
        <p>This update is recorded on your Capaciti Service Hub activity profile (<strong>${recipientEmail}</strong>).</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Direct operational receipt sent to ${recipientEmail} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    request.id,
    recipientEmail,
    request.userName || 'User',
    subject,
    bodyHtml,
    isResolved ? 'RESOLVED_NOTIFICATION' : 'STATUS_UPDATE'
  );
}

export function sendAIResponseDispatchEmail(request: RequestItem, responseText: string, authorName: string) {
  const recipientEmail = request.userEmail || 'user@example.com';
  const subject = `Capaciti Service Hub Update on Ticket [${request.id}]: ${request.title}`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #0f172a; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Capaciti Service Hub</h2>
        <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Operations Response Dispatch • Ticket <strong>${request.id}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${request.userName || 'User'},</h3>
        <p>The operations desk has sent a message regarding your ticket <strong>"${request.title}"</strong>:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 6px; margin: 20px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;">${responseText}</div>

        <p>If you need to provide additional details, please log into your Capaciti Service Hub dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Dispatched by ${authorName} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    request.id,
    recipientEmail,
    request.userName || 'User',
    subject,
    bodyHtml,
    'AI_RESPONSE_DISPATCH'
  );
}

// Week 3 - Sprint 2: Approval Request Email to Supervisors / Admins
export function sendApprovalRequestEmail(approval: ApprovalRequest) {
  const recipientEmail = approval.requiredRole === 'ADMIN' ? 'admin@capaciti.org' : 'manager@capaciti.org';
  const recipientName = approval.requiredRole === 'ADMIN' ? 'Global Administrator' : 'Operations Supervisor';
  const subject = `[ACTION REQUIRED] Approval Needed: [${approval.id}] ${approval.approvalType.replace(/_/g, ' ')} for ${approval.requestorName}`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #7c2d12; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">⚠️ Approval Authorization Required</h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Capaciti Multi-Tier Governance • Reference: <strong>${approval.id}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${recipientName},</h3>
        <p>A new workflow step requires formal manager authorization before tickets can proceed.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; padding: 18px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #92400e; width: 140px; font-weight: 600;">Request Type:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #78350f;">${approval.approvalType.replace(/_/g, ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #92400e; font-weight: 600;">Requestor:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #1e293b;">${approval.requestorName} (${approval.requestorEmail})</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #92400e; font-weight: 600;">Department:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #1e293b;">${approval.department}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #92400e; font-weight: 600;">Linked Ticket:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #0284c7;">${approval.requestId} - ${approval.ticketTitle}</td>
            </tr>
            ${approval.estimatedCost ? `
            <tr>
              <td style="padding: 4px 0; color: #92400e; font-weight: 600;">Estimated Cost:</td>
              <td style="padding: 4px 0; font-weight: 800; color: #059669;">R${approval.estimatedCost.toLocaleString()} ZAR</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 4px 0; color: #92400e; font-weight: 600;">Risk Level:</td>
              <td style="padding: 4px 0; font-weight: 700; color: ${approval.riskLevel === 'Critical' ? '#be123c' : approval.riskLevel === 'High' ? '#c2410c' : '#047857'};">${approval.riskLevel}</td>
            </tr>
          </table>

          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #fef3c7;">
            <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #78350f; text-transform: uppercase;">Business Justification:</p>
            <p style="margin: 0; font-size: 13px; color: #451a03; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #fde68a;">
              "${approval.justification}"
            </p>
          </div>
        </div>

        <p>Please log in to the Capaciti Service Hub to review and execute this approval decision.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Automated governance alert sent to ${recipientEmail} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    approval.requestId,
    recipientEmail,
    recipientName,
    subject,
    bodyHtml,
    'APPROVAL_REQUEST'
  );
}

// Week 3 - Sprint 2: Approval Decision Email to Requestor
export function sendApprovalDecisionEmail(approval: ApprovalRequest) {
  const recipientEmail = approval.requestorEmail;
  const isApproved = approval.status === 'APPROVED';
  const subject = `[${isApproved ? 'APPROVED' : 'REJECTED'}] Approval Decision: [${approval.id}] ${approval.ticketTitle}`;

  const headerBg = isApproved ? '#065f46' : '#991b1b';
  const bannerBorder = isApproved ? '#10b981' : '#f87171';
  const bannerBg = isApproved ? '#ecfdf5' : '#fef2f2';

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: ${headerBg}; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">
          ${isApproved ? '✅ Request Approved' : '❌ Request Rejected'}
        </h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Governance Decision • Reference: <strong>${approval.id}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${approval.requestorName},</h3>
        <p>Your approval request for <strong>"${approval.ticketTitle}"</strong> has been reviewed by <strong>${approval.decidedByName || 'Operations Management'}</strong>.</p>
        
        <div style="background-color: ${bannerBg}; border: 1px solid #e2e8f0; border-left: 4px solid ${bannerBorder}; padding: 18px; border-radius: 6px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Decision:</span>
            <span style="font-size: 15px; font-weight: 800; color: ${isApproved ? '#047857' : '#b91c1c'}; background: #ffffff; padding: 4px 12px; border-radius: 4px; border: 1px solid #cbd5e1;">
              ${approval.status}
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">
            <tr>
              <td style="padding: 3px 0; color: #64748b; width: 130px;">Approval Type:</td>
              <td style="padding: 3px 0; font-weight: 600; color: #1e293b;">${approval.approvalType.replace(/_/g, ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748b;">Reviewed By:</td>
              <td style="padding: 3px 0; font-weight: 600; color: #1e293b;">${approval.decidedByName || 'Supervisor'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #64748b;">Decision Date:</td>
              <td style="padding: 3px 0; font-weight: 600; color: #1e293b;">${approval.decidedAt ? new Date(approval.decidedAt).toLocaleString() : new Date().toLocaleString()}</td>
            </tr>
          </table>

          ${approval.decisionNotes ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #cbd5e1;">
            <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Reviewer Notes:</p>
            <p style="margin: 0; font-size: 13px; color: #1e293b; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; font-style: italic;">
              "${approval.decisionNotes}"
            </p>
          </div>
          ` : ''}
        </div>

        <p>The linked ticket <strong>${approval.requestId}</strong> has been updated accordingly.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Direct notification sent to ${recipientEmail} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    approval.requestId,
    recipientEmail,
    approval.requestorName,
    subject,
    bodyHtml,
    'APPROVAL_DECISION'
  );
}

// Week 3 - Sprint 2: Workflow Automation Alert Email
export function sendWorkflowAlertEmail(recipientEmail: string, recipientName: string, rule: WorkflowRule, ticket: RequestItem, actionSummary: string) {
  const subject = `⚡ [WORKFLOW AUTOMATION] Rule Triggered: "${rule.name}" for Ticket [${ticket.id}]`;

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #1e1b4b; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700;">⚡ Workflow Automation Triggered</h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Business Process Engine • Rule: <strong>${rule.name}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #0f172a;">Hello ${recipientName},</h3>
        <p>The Capaciti Workflow Automation engine automatically executed business actions on ticket <strong>${ticket.id} (${ticket.title})</strong> based on matching routing rules.</p>
        
        <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-left: 4px solid #7c3aed; padding: 18px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #5b21b6;">Automated Actions Executed:</p>
          <p style="margin: 0 0 10px; font-size: 13px; color: #4c1d95; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #c4b5fd;">${actionSummary}</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 3px 0; color: #6b7280; width: 120px;">Trigger Event:</td>
              <td style="padding: 3px 0; font-weight: 600; color: #1e293b;">${rule.trigger}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #6b7280;">Department:</td>
              <td style="padding: 3px 0; font-weight: 600; color: #1e293b;">${ticket.department || 'Operations'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; color: #6b7280;">New Priority:</td>
              <td style="padding: 3px 0; font-weight: 700; color: #7c3aed;">${ticket.priority}</td>
            </tr>
          </table>
        </div>

        <p>You can inspect full automation logs in the Workflow & AI Governance console.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Automated workflow notification sent to ${recipientEmail} • Capaciti Service Hub.</p>
      </div>
    </div>
  `;

  return db.addEmailNotification(
    ticket.id,
    recipientEmail,
    recipientName,
    subject,
    bodyHtml,
    'WORKFLOW_ALERT'
  );
}
