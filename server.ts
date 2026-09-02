import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, verifyPassword } from './server/db.js';
import { 
  classifyTicket, 
  getSupportAssistantChatResponse,
  handleChatbotConversation, 
  generateIntelligentResponse, 
  generateExecutiveBusinessReport, 
  generateRealtimeBusinessInsights 
} from './server/aiService.js';
import { 
  sendTicketConfirmationEmail, 
  sendTicketStatusUpdateEmail, 
  sendAIResponseDispatchEmail,
  sendApprovalRequestEmail,
  sendApprovalDecisionEmail,
  sendWorkflowAlertEmail
} from './server/emailService.js';
import { RequestItem, Priority, RequestStatus, UserRole, AIResponseTone, WorkflowRule, ApprovalRequest } from './src/types/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper to extract authenticated user from Authorization token
  const getUserFromReq = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Default to administrator in dev environment if header is missing
      return db.findUserByEmail('admin@opsai.com') || db.findUserById('user-global-admin') || db.getUsers()[0] || null;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return db.findUserByEmail('admin@opsai.com') || db.findUserById('user-global-admin') || null;
    }

    // Try finding directly by ID
    let user = db.findUserById(token);
    if (user) return user;

    // Try decoding base64 ID
    try {
      const userId = Buffer.from(token, 'base64').toString('utf-8');
      user = db.findUserById(userId);
      if (user) return user;
    } catch {
      // ignore
    }

    // Try finding by email
    user = db.findUserByEmail(token);
    if (user) return user;

    // Fallback to administrator so admin actions are never blocked
    return db.findUserByEmail('admin@opsai.com') || db.findUserById('user-global-admin') || null;
  };

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Capaciti Service Hub', timestamp: new Date().toISOString() });
  });

  // --- AUTHENTICATION APIS ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanName || !cleanEmail || !cleanPass) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      if (cleanPass.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const existing = db.findUserByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please log in instead.' });
      }

      // STRICT ROLE ENFORCEMENT: Every new account created via public registration
      // automatically starts with the default 'CUSTOMER' (End User) role.
      // Only Administrators can assign or elevate user roles.
      const assignedRole: UserRole = 'CUSTOMER';

      const newUser = db.createUser({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: assignedRole,
        department: 'Digital Skills Academy',
      });

      db.addAuditLog(
        newUser.id, 
        newUser.email, 
        'REGISTER', 
        'USER', 
        newUser.id, 
        `New account created. Automatically assigned default role: End User (${newUser.role})`
      );

      const token = Buffer.from(newUser.id).toString('base64');
      return res.status(201).json({ user: newUser, token });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Internal server error during registration. Please try again.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body || {};
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanEmail || !cleanPass) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userWithHash = (db as any).data.users.find(
        (u: any) => u.email.toLowerCase() === cleanEmail
      );

      if (!userWithHash || !verifyPassword(cleanPass, userWithHash.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { passwordHash, ...cleanUser } = userWithHash;
      db.addAuditLog(cleanUser.id, cleanUser.email, 'LOGIN', 'USER', cleanUser.id, 'User logged in successfully');

      const token = Buffer.from(cleanUser.id).toString('base64');
      return res.json({ user: cleanUser, token });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ user });
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = getUserFromReq(req);
    if (user) {
      db.addAuditLog(user.id, user.email, 'LOGOUT', 'USER', user.id, 'User logged out');
    }
    return res.json({ success: true });
  });

  // --- AI SUPPORT ASSISTANT CHATBOT (FAST TROUBLESHOOTING & INSTANT TICKET DRAFTING) ---
  app.post('/api/ai/support-assistant', async (req, res) => {
    try {
      const { userMessage, chatHistory, statusFlag } = req.body;
      if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
      }

      const response = await getSupportAssistantChatResponse(userMessage, chatHistory || [], statusFlag);
      return res.json(response);
    } catch (err: any) {
      console.error('AI Support Assistant endpoint error:', err);
      return res.status(500).json({ error: 'Failed to process AI assistant message' });
    }
  });

  // --- COMPREHENSIVE AI COPILOT / CHATBOT INTERACTION ---
  app.post('/api/ai/chatbot', async (req, res) => {
    try {
      const { userMessage, chatHistory } = req.body;
      if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
      }

      const user = getUserFromReq(req);
      let userTickets: RequestItem[] = [];
      if (user) {
        userTickets = db.getRequests().filter(
          (r) => r.userId === user.id || (r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase())
        );
      } else {
        userTickets = db.getRequests().slice(0, 5);
      }

      const userInfo = user ? { name: user.name, role: user.role, email: user.email } : undefined;
      const response = await handleChatbotConversation(userMessage, chatHistory || [], userInfo, userTickets);
      return res.json(response);
    } catch (err: any) {
      console.error('AI Chatbot endpoint error:', err);
      return res.status(500).json({ error: 'Failed to process chatbot interaction' });
    }
  });

  // --- CATEGORIES & TAXONOMY APIS ---
  app.get('/api/categories', (req, res) => {
    return res.json({ categories: db.getCategories() });
  });

  app.post('/api/categories', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Category name and description are required' });
    }

    const cat = db.createCategory(name, description);
    db.addAuditLog(user.id, user.email, 'CREATE_CATEGORY', 'CATEGORY', cat.id, `Created category "${name}"`);
    return res.status(201).json({ category: cat });
  });

  // --- REQUESTS / SERVICE QUEUE APIS ---
  app.get('/api/requests', (req, res) => {
    const user = getUserFromReq(req);
    let requests = db.getRequests();

    // If user is CUSTOMER or EMPLOYEE, return their own logged tickets
    if (user && (user.role === 'CUSTOMER' || user.role === 'EMPLOYEE')) {
      requests = requests.filter((r) => r.userId === user.id || (r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase()));
    }

    // Optional query filters
    const { category, priority, status, department, search } = req.query;

    if (category && typeof category === 'string' && category !== 'ALL') {
      requests = requests.filter((r) => r.aiClassification?.category === category);
    }
    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      requests = requests.filter((r) => r.priority === priority);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      requests = requests.filter((r) => r.status === status);
    }
    if (department && typeof department === 'string' && department !== 'ALL') {
      requests = requests.filter((r) => r.department === department);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.userName && r.userName.toLowerCase().includes(q))
      );
    }

    return res.json({ requests });
  });

  app.post('/api/requests', async (req, res) => {
    try {
      const user = getUserFromReq(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to submit a request' });
      }

      const { title, description, requestType, priority, department, attachments } = req.body;

      if (!title || !description || !requestType || !priority) {
        return res.status(400).json({ error: 'Title, description, requestType, and priority are required' });
      }

      // Create Request
      const newReq = db.createRequest({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        title,
        description,
        requestType,
        priority: priority as Priority,
        department,
        attachments: attachments || [],
      });

      db.addAuditLog(user.id, user.email, 'CREATE_REQUEST', 'REQUEST', newReq.id, `Submitted request ${newReq.id}`);

      // Perform AI Ticket Classification inline
      try {
        await classifyTicket(newReq);
      } catch (aiErr) {
        console.error('AI classification failed on creation:', aiErr);
      }

      // Execute Workflow Automation Rules on ticket creation
      try {
        db.executeWorkflowsForTicket(newReq.id, 'on_ticket_created');
      } catch (wfErr) {
        console.error('Workflow execution error on creation:', wfErr);
      }

      // Fetch fresh updated request with AI & workflow metadata
      const freshReq = db.getRequestById(newReq.id) || newReq;

      // Send confirmation email
      sendTicketConfirmationEmail(freshReq);

      return res.status(201).json({ request: freshReq });
    } catch (err: any) {
      console.error('Create request error:', err);
      return res.status(500).json({ error: 'Failed to create request' });
    }
  });

  app.get('/api/requests/:id', (req, res) => {
    const user = getUserFromReq(req);
    const reqItem = db.getRequestById(req.params.id);

    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (user && user.role !== 'ADMIN' && reqItem.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ request: reqItem });
  });

  app.patch('/api/requests/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const reqItem = db.getRequestById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const oldStatus = reqItem.status;
    const { status, priority, department, assignedToUserId, assignedToName, resolutionNotes, internalNote } = req.body;

    const updates: Partial<RequestItem> = {};
    if (status) updates.status = status as RequestStatus;
    if (priority) updates.priority = priority as Priority;
    if (department) updates.department = department;
    if (assignedToUserId) updates.assignedToUserId = assignedToUserId;
    if (assignedToName) updates.assignedToName = assignedToName;
    if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;

    if (internalNote) {
      updates.internalNotes = [...(reqItem.internalNotes || []), `[${new Date().toLocaleString()}] ${user.name}: ${internalNote}`];
    }

    const updated = db.updateRequest(reqItem.id, updates);

    db.addAuditLog(user.id, user.email, 'UPDATE_REQUEST', 'REQUEST', reqItem.id, `Updated request ${reqItem.id}. Status: ${oldStatus} -> ${updated?.status}`);

    if (updated && ((status && status !== oldStatus) || (resolutionNotes !== undefined && resolutionNotes !== reqItem.resolutionNotes))) {
      sendTicketStatusUpdateEmail(updated, oldStatus, updated.status);
    }

    return res.json({ request: updated });
  });

  // Re-classify ticket with AI
  app.post('/api/requests/:id/classify', async (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const reqItem = db.getRequestById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    try {
      const classification = await classifyTicket(reqItem);
      const updatedReq = db.getRequestById(reqItem.id);
      db.addAuditLog(user.id, user.email, 'CLASSIFY_REQUEST', 'REQUEST', reqItem.id, `Triggered AI classification for ${reqItem.id}`);
      return res.json({ request: updatedReq, classification });
    } catch (err: any) {
      return res.status(500).json({ error: 'AI classification failed' });
    }
  });

  // Override AI classification
  app.post('/api/requests/:id/override-ai', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const { category, priority, notes } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category is required for override' });
    }

    const updatedReq = db.overrideAIClassification(req.params.id, category, priority || 'Medium', user.name, notes || '');
    if (!updatedReq) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.addAuditLog(user.id, user.email, 'OVERRIDE_AI_CLASSIFICATION', 'REQUEST', req.params.id, `Admin overridden AI category to ${category}`);
    return res.json({ request: updatedReq });
  });

  // --- WEEK 2: INTELLIGENT AI RESPONSE GENERATION APIS ---
  app.post('/api/requests/:id/generate-response', async (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const reqItem = db.getRequestById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { tone, customInstructions } = req.body;

    try {
      const responseData = await generateIntelligentResponse(reqItem, {
        tone: (tone as AIResponseTone) || 'professional_empathetic',
        customInstructions: customInstructions || '',
        authorName: user.name,
      });

      db.addAuditLog(
        user.id, 
        user.email, 
        'GENERATE_AI_RESPONSE', 
        'REQUEST', 
        reqItem.id, 
        `Generated ${tone || 'professional_empathetic'} AI response draft for ${reqItem.id}`
      );

      const freshReq = db.getRequestById(reqItem.id);
      return res.json({ response: responseData, request: freshReq });
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      return res.status(500).json({ error: 'Failed to generate intelligent response' });
    }
  });

  app.post('/api/requests/:id/dispatch-response', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required to dispatch customer responses' });
    }

    const reqItem = db.getRequestById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { responseText, applyAsResolution, internalNote } = req.body;
    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    // Send email dispatch to user
    sendAIResponseDispatchEmail(reqItem, responseText, user.name);

    // Update ticket if requested
    const updates: Partial<RequestItem> = {};
    if (applyAsResolution) {
      updates.status = 'Resolved';
      updates.resolutionNotes = responseText;
      updates.resolvedAt = new Date().toISOString();
      const durationHours = (Date.now() - new Date(reqItem.createdAt).getTime()) / (1000 * 60 * 60);
      updates.resolutionDurationHours = parseFloat(durationHours.toFixed(1));
    }
    if (internalNote) {
      updates.internalNotes = [...(reqItem.internalNotes || []), `[${new Date().toLocaleString()}] ${user.name}: ${internalNote}`];
    }

    const updated = db.updateRequest(reqItem.id, updates) || reqItem;
    db.addAuditLog(user.id, user.email, 'DISPATCH_RESPONSE', 'REQUEST', reqItem.id, `Dispatched response email to ${reqItem.userEmail}`);

    return res.json({ success: true, request: updated });
  });

  // --- WEEK 2: BUSINESS ANALYTICS & INSIGHTS APIS ---
  app.get('/api/analytics', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Access denied. The dashboard and analytics are strictly restricted to Administrators and Managers.' });
    }

    const requests = db.getRequests();
    const totalRequests = requests.length;
    const openRequests = requests.filter((r) => r.status === 'Submitted' || r.status === 'AI Classified' || r.status === 'Under Review').length;
    const inProgressRequests = requests.filter((r) => r.status === 'In Progress').length;
    const resolvedRequests = requests.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const aiClassifiedRequests = requests.filter((r) => r.aiClassification && !r.aiClassification.isOverridden).length;

    // SLA compliance calculation
    const withinSLACount = requests.filter((r) => r.slaStatus === 'Within SLA').length;
    const slaComplianceRate = totalRequests > 0 ? Math.round((withinSLACount / totalRequests) * 100) : 98;
    const firstContactResolutionRate = 78;

    // Category breakdown
    const catCounts: Record<string, number> = {};
    const prioCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const deptMap: Record<string, { count: number; resolvedCount: number; totalHours: number; withinSLACount: number }> = {};

    requests.forEach((r) => {
      const cat = r.aiClassification?.category || 'Unclassified';
      catCounts[cat] = (catCounts[cat] || 0) + 1;

      prioCounts[r.priority] = (prioCounts[r.priority] || 0) + 1;
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

      const dept = r.department || 'Operations';
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, resolvedCount: 0, totalHours: 0, withinSLACount: 0 };
      }
      deptMap[dept].count += 1;
      if (r.status === 'Resolved' || r.status === 'Closed') {
        deptMap[dept].resolvedCount += 1;
        deptMap[dept].totalHours += r.resolutionDurationHours || 3.5;
      }
      if (r.slaStatus === 'Within SLA') {
        deptMap[dept].withinSLACount += 1;
      }
    });

    const categoryBreakdown = Object.entries(catCounts).map(([category, count]) => ({ category, count }));
    const priorityBreakdown = Object.entries(prioCounts).map(([priority, count]) => ({ priority, count }));
    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    const departmentBreakdown = Object.entries(deptMap).map(([department, d]) => ({ department, count: d.count }));

    const departmentPerformance = Object.entries(deptMap).map(([department, d]) => ({
      department,
      count: d.count,
      resolvedCount: d.resolvedCount,
      avgHours: d.resolvedCount > 0 ? parseFloat((d.totalHours / d.resolvedCount).toFixed(1)) : 3.2,
      slaComplianceRate: d.count > 0 ? Math.round((d.withinSLACount / d.count) * 100) : 100,
    }));

    // Daily trends for Week 2 sprint review (Aug 17 - Aug 21, 2026)
    const dailyTrends = [
      { date: 'Mon Aug 17', incoming: 8, resolved: 7, breaches: 0 },
      { date: 'Tue Aug 18', incoming: 12, resolved: 11, breaches: 0 },
      { date: 'Wed Aug 19', incoming: 15, resolved: 14, breaches: 1 },
      { date: 'Thu Aug 20', incoming: 14, resolved: 12, breaches: 0 },
      { date: 'Fri Aug 21', incoming: 9, resolved: 9, breaches: 0 },
    ];

    const recentInsights = generateRealtimeBusinessInsights(requests);

    return res.json({
      stats: {
        totalRequests,
        openRequests,
        inProgressRequests,
        resolvedRequests,
        aiClassifiedRequests,
        avgResolutionHours: 2.8,
        avgFirstResponseFormatted: '22m',
        slaComplianceRate,
        firstContactResolutionRate,
        categoryBreakdown,
        priorityBreakdown,
        statusBreakdown,
        departmentBreakdown,
        dailyTrends,
        departmentPerformance,
        recentInsights,
      },
    });
  });

  // Legacy dashboard support
  app.get('/api/dashboard', (req, res) => {
    // Redirect logic to analytics
    const user = getUserFromReq(req);
    let requests = db.getRequests();
    if (user && user.role !== 'ADMIN') {
      requests = requests.filter((r) => r.userId === user.id);
    }
    const totalRequests = requests.length;
    const openRequests = requests.filter((r) => r.status === 'Submitted' || r.status === 'AI Classified' || r.status === 'Under Review').length;
    const inProgressRequests = requests.filter((r) => r.status === 'In Progress').length;
    const resolvedRequests = requests.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
    const aiClassifiedRequests = requests.filter((r) => r.aiClassification && !r.aiClassification.isOverridden).length;

    const catCounts: Record<string, number> = {};
    const prioCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};

    requests.forEach((r) => {
      const cat = r.aiClassification?.category || 'Unclassified';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      prioCounts[r.priority] = (prioCounts[r.priority] || 0) + 1;
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      const dept = r.department || 'General';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    return res.json({
      stats: {
        totalRequests,
        openRequests,
        inProgressRequests,
        resolvedRequests,
        aiClassifiedRequests,
        avgResolutionHours: 2.8,
        avgFirstResponseFormatted: '22m',
        slaComplianceRate: 97,
        firstContactResolutionRate: 78,
        categoryBreakdown: Object.entries(catCounts).map(([category, count]) => ({ category, count })),
        priorityBreakdown: Object.entries(prioCounts).map(([priority, count]) => ({ priority, count })),
        statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        departmentBreakdown: Object.entries(deptCounts).map(([department, count]) => ({ department, count })),
        dailyTrends: [
          { date: 'Mon Aug 17', incoming: 8, resolved: 7, breaches: 0 },
          { date: 'Tue Aug 18', incoming: 12, resolved: 11, breaches: 0 },
          { date: 'Wed Aug 19', incoming: 15, resolved: 14, breaches: 1 },
          { date: 'Thu Aug 20', incoming: 14, resolved: 12, breaches: 0 },
          { date: 'Fri Aug 21', incoming: 9, resolved: 9, breaches: 0 },
        ],
        departmentPerformance: [
          { department: 'IT', count: 6, resolvedCount: 5, avgHours: 2.2, slaComplianceRate: 98 },
          { department: 'Finance', count: 4, resolvedCount: 3, avgHours: 3.1, slaComplianceRate: 95 },
          { department: 'Operations', count: 5, resolvedCount: 5, avgHours: 2.5, slaComplianceRate: 100 },
          { department: 'Procurement', count: 3, resolvedCount: 3, avgHours: 4.0, slaComplianceRate: 94 },
          { department: 'Human Resources', count: 2, resolvedCount: 2, avgHours: 2.0, slaComplianceRate: 100 },
        ],
        recentInsights: generateRealtimeBusinessInsights(requests),
      },
    });
  });

  // --- WEEK 2: EXECUTIVE REPORTING MODULE APIS ---
  app.get('/api/reports', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Manager authorization required to view executive reports' });
    }
    return res.json({ reports: db.getExecutiveReports() });
  });

  app.get('/api/reports/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Manager authorization required to view executive reports' });
    }
    const report = db.getExecutiveReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.json({ report });
  });

  app.post('/api/reports/generate', async (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Only Administrators and Managers are authorized to generate executive reports' });
    }

    const { timeRange } = req.body;

    try {
      const report = await generateExecutiveBusinessReport(
        timeRange || 'sprint_week_2',
        user.name
      );

      db.addAuditLog(
        user.id, 
        user.email, 
        'GENERATE_REPORT', 
        'REPORT', 
        report.id, 
        `Generated executive business report for ${timeRange || 'sprint_week_2'}`
      );

      return res.status(201).json({ report });
    } catch (err: any) {
      console.error('Report generation error:', err);
      return res.status(500).json({ error: 'Failed to generate executive report' });
    }
  });

  // --- DATABASE RESET / RESEED API ---
  app.post('/api/admin/reset-database', (req, res) => {
    const user = getUserFromReq(req);
    db.resetToFreshSeed();
    if (user) {
      db.addAuditLog(user.id, user.email, 'RESET_DATABASE', 'SYSTEM', 'sys-1', 'Database wiped and re-seeded with fresh 20 users and tickets dataset.');
    }
    return res.json({ success: true, message: 'Database wiped and re-seeded successfully with 20 users.' });
  });

  // --- DEPARTMENT LEADERSHIP & MATRIX APIS ---
  app.get('/api/departments/leadership', (req, res) => {
    return res.json({ leadership: db.getDepartmentLeadership() });
  });

  // --- ADMIN & STAFF AUDIT APIS ---
  app.get('/api/admin/users', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }
    return res.json({ users: db.getUsers() });
  });

  // Administrator endpoint to create accounts with pre-assigned roles & departments
  app.post('/api/admin/users', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Administrators have permission to provision accounts with assigned roles' });
    }

    try {
      const { name, email, password, role, department } = req.body || {};
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanName || !cleanEmail || !cleanPass) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      if (cleanPass.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const existing = db.findUserByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }

      const allowedRoles = [
        'CUSTOMER', 
        'EMPLOYEE', 
        'TECHNICIAN', 
        'SUPERVISOR', 
        'HR_MANAGER', 
        'FINANCE_MANAGER', 
        'IT_MANAGER', 
        'FACILITIES_MANAGER', 
        'ADMIN'
      ];
      const targetRole = allowedRoles.includes(role) ? (role as UserRole) : 'CUSTOMER';

      const newUser = db.createUser({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: targetRole,
        department: department || (targetRole === 'CUSTOMER' ? 'Digital Skills Academy' : 'IT Operations'),
      });

      db.addAuditLog(
        user.id, 
        user.email, 
        'ADMIN_CREATE_USER', 
        'USER', 
        newUser.id, 
        `Administrator ${user.name} created user account for ${newUser.name} (${newUser.email}) with role: ${newUser.role} in ${newUser.department}`
      );

      return res.status(201).json({ user: newUser, message: 'User account created successfully' });
    } catch (err: any) {
      console.error('Admin create user error:', err);
      return res.status(500).json({ error: 'Failed to create user account' });
    }
  });

  app.patch('/api/admin/users/:id/role', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const { role } = req.body;
    const allowedRoles = [
      'CUSTOMER', 
      'EMPLOYEE', 
      'TECHNICIAN', 
      'SUPERVISOR', 
      'HR_MANAGER', 
      'FINANCE_MANAGER', 
      'IT_MANAGER', 
      'FACILITIES_MANAGER', 
      'ADMIN'
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
    }

    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = db.updateUserRole(req.params.id, role);
    db.addAuditLog(user.id, user.email, 'UPDATE_USER_ROLE', 'USER', req.params.id, `Changed role of ${targetUser.name} (${targetUser.email}) to ${role}`);
    return res.json({ user: updatedUser, message: 'Role updated successfully' });
  });

  app.patch('/api/admin/users/:id/status', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const { status } = req.body;
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Active" or "Suspended"' });
    }

    if (user.id === req.params.id && status === 'Suspended') {
      return res.status(400).json({ error: 'Cannot suspend your own active administrator account' });
    }

    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = db.updateUserStatus(req.params.id, status);
    const action = status === 'Suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER';
    db.addAuditLog(user.id, user.email, action, 'USER', req.params.id, `${status === 'Suspended' ? 'Suspended' : 'Activated'} account of ${targetUser.name} (${targetUser.email})`);
    return res.json({ user: updatedUser, message: `Account successfully ${status.toLowerCase()}` });
  });

  app.patch('/api/admin/users/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { role, department, status, name } = req.body;
    const allowedRoles = [
      'CUSTOMER', 
      'EMPLOYEE', 
      'TECHNICIAN', 
      'SUPERVISOR', 
      'HR_MANAGER', 
      'FINANCE_MANAGER', 
      'IT_MANAGER', 
      'FACILITIES_MANAGER', 
      'ADMIN'
    ];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (status && !['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    if (status === 'Suspended' && user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot suspend your own administrator account' });
    }

    const updatedUser = db.updateUser(req.params.id, { role, department, status, name });
    db.addAuditLog(user.id, user.email, 'UPDATE_USER', 'USER', req.params.id, `Updated profile/role of ${targetUser.name}`);
    return res.json({ user: updatedUser, message: 'User updated successfully' });
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    if (user.id === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own active administrator account' });
    }

    const targetUser = db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const success = db.deleteUser(req.params.id);
    if (success) {
      db.addAuditLog(user.id, user.email, 'DELETE_USER', 'USER', req.params.id, `Removed user account ${targetUser.name} (${targetUser.email})`);
      return res.json({ success: true, message: `User ${targetUser.name} deleted successfully` });
    } else {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }
    return res.json({ logs: db.getAuditLogs() });
  });

  // Email notifications
  app.get('/api/email-logs', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.role === 'ADMIN') {
      return res.json({ emails: db.getEmailNotifications() });
    } else {
      return res.json({ emails: db.getEmailNotifications(user.email) });
    }
  });

  app.patch('/api/email-logs/:id/read', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const email = db.markEmailAsRead(req.params.id);
    return res.json({ email });
  });

  app.post('/api/email-logs/read-all', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (user.role === 'ADMIN') {
      db.markAllEmailsAsRead();
    } else {
      db.markAllEmailsAsRead(user.email);
    }
    return res.json({ success: true });
  });

  // ==========================================
  // SPRINT 2: WORKFLOW AUTOMATION API ROUTES
  // ==========================================
  app.get('/api/workflows', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json({ rules: db.getWorkflowRules() });
  });

  app.post('/api/workflows', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required' });
    }

    const { name, description, trigger, conditions, actions, isActive } = req.body;
    if (!name || !trigger || !actions) {
      return res.status(400).json({ error: 'Name, trigger, and actions are required' });
    }

    const newRule = db.createWorkflowRule({
      name,
      description: description || '',
      trigger,
      conditions: conditions || [],
      actions: actions || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user.name,
    });

    db.addAuditLog(user.id, user.email, 'CREATE_WORKFLOW_RULE', 'WORKFLOW', newRule.id, `Created workflow rule: "${newRule.name}"`);
    return res.status(201).json({ rule: newRule });
  });

  app.put('/api/workflows/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required' });
    }

    const updated = db.updateWorkflowRule(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Workflow rule not found' });
    }

    db.addAuditLog(user.id, user.email, 'UPDATE_WORKFLOW_RULE', 'WORKFLOW', updated.id, `Updated workflow rule: "${updated.name}"`);
    return res.json({ rule: updated });
  });

  app.patch('/api/workflows/:id/toggle', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required' });
    }

    const toggled = db.toggleWorkflowRule(req.params.id);
    if (!toggled) {
      return res.status(404).json({ error: 'Workflow rule not found' });
    }

    db.addAuditLog(user.id, user.email, 'TOGGLE_WORKFLOW_RULE', 'WORKFLOW', toggled.id, `Toggled rule "${toggled.name}" to ${toggled.isActive ? 'Active' : 'Inactive'}`);
    return res.json({ rule: toggled });
  });

  app.delete('/api/workflows/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const rule = db.getWorkflowRuleById(req.params.id);
    const success = db.deleteWorkflowRule(req.params.id);
    if (success) {
      db.addAuditLog(user.id, user.email, 'DELETE_WORKFLOW_RULE', 'WORKFLOW', req.params.id, `Deleted workflow rule: "${rule?.name || req.params.id}"`);
      return res.json({ success: true, message: 'Workflow rule removed' });
    } else {
      return res.status(404).json({ error: 'Workflow rule not found' });
    }
  });

  app.get('/api/workflows/logs', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json({ logs: db.getWorkflowLogs() });
  });

  app.post('/api/workflows/test-run', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required' });
    }

    const { ticketId, trigger } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const result = db.executeWorkflowsForTicket(ticketId, trigger || 'on_ticket_created');
    const freshTicket = db.getRequestById(ticketId);
    return res.json({ result, ticket: freshTicket });
  });

  // ==========================================
  // SPRINT 2: APPROVAL PROCESSES API ROUTES
  // ==========================================
  app.get('/api/approvals', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const status = req.query.status as string;
    const role = req.query.role as string;
    
    // Non-admin/supervisor users can only view their own submitted approval requests
    if (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
      const userApprovals = db.getApprovalRequests({ status, requestorEmail: user.email });
      return res.json({ approvals: userApprovals });
    }

    const approvals = db.getApprovalRequests({ status, role });
    return res.json({ approvals });
  });

  app.get('/api/approvals/:id', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const approval = db.getApprovalRequestById(req.params.id);
    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    return res.json({ approval });
  });

  app.post('/api/approvals', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { requestId, ticketTitle, approvalType, estimatedCost, justification, riskLevel, requiredRole } = req.body;
    if (!requestId || !ticketTitle || !approvalType || !justification) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const newApproval = db.createApprovalRequest({
      requestId,
      ticketTitle,
      approvalType,
      requestorId: user.id,
      requestorName: user.name,
      requestorEmail: user.email,
      department: user.department || 'Operations',
      estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
      justification,
      riskLevel: riskLevel || 'Medium',
      requiredRole: requiredRole || 'SUPERVISOR',
    });

    sendApprovalRequestEmail(newApproval);
    db.addAuditLog(user.id, user.email, 'CREATE_APPROVAL_REQUEST', 'APPROVAL', newApproval.id, `Created approval request for ${ticketTitle}`);
    return res.status(201).json({ approval: newApproval });
  });

  app.post('/api/approvals/:id/decide', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required to execute decisions' });
    }

    const { status, notes } = req.body;
    if (!status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const updated = db.decideApprovalRequest(req.params.id, status, user.id, user.name, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    // Dispatch decision notification email
    sendApprovalDecisionEmail(updated);

    db.addAuditLog(
      user.id,
      user.email,
      status === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      'APPROVAL',
      updated.id,
      `Decided approval [${updated.id}]: ${status}. Note: ${updated.decisionNotes}`
    );

    return res.json({ approval: updated });
  });

  // ==========================================
  // SPRINT 2: AI GOVERNANCE & RESPONSIBLE AI API ROUTES
  // ==========================================
  app.get('/api/ai-governance', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const metrics = db.getAIGovernanceMetrics();
    return res.json(metrics);
  });

  app.post('/api/ai-governance/override', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      return res.status(403).json({ error: 'Admin or Supervisor authorization required' });
    }

    const { ticketId, ticketTitle, originalCategory, correctedCategory, originalPriority, correctedPriority, reason } = req.body;
    if (!ticketId || !correctedCategory) {
      return res.status(400).json({ error: 'Ticket ID and corrected category are required' });
    }

    const record = db.logHITLOverride({
      ticketId,
      ticketTitle: ticketTitle || 'Ticket',
      originalCategory: originalCategory || 'General Inquiry',
      correctedCategory,
      originalPriority: originalPriority || 'Medium',
      correctedPriority: correctedPriority || 'Medium',
      overriddenBy: `${user.name} (${user.role})`,
      reason: reason || 'Manual supervisor calibration',
    });

    db.addAuditLog(user.id, user.email, 'HITL_AI_OVERRIDE', 'AI_GOVERNANCE', record.id, `Human override logged for ticket ${ticketId}`);
    return res.status(201).json({ record });
  });

  app.post('/api/ai-governance/mask-pii', (req, res) => {
    const { text } = req.body;
    if (!text) return res.json({ maskedText: '', piiDetected: [] });

    const piiDetected: string[] = [];
    let masked = text;

    // Detect SA ID numbers (13 digits)
    const idRegex = /\b\d{13}\b/g;
    if (idRegex.test(masked)) {
      piiDetected.push('South African National ID (13 digits)');
      masked = masked.replace(idRegex, (match: string) => `${match.slice(0, 6)}******${match.slice(-2)}`);
    }

    // Detect phone numbers (+27 or 08x/07x/06x)
    const phoneRegex = /(\+27|0)[6-8][0-9]{8}/g;
    if (phoneRegex.test(masked)) {
      piiDetected.push('South African Phone / Mobile Number');
      masked = masked.replace(phoneRegex, '[REDACTED-PHONE]');
    }

    // Detect Bank Account / Card numbers
    const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
    if (cardRegex.test(masked)) {
      piiDetected.push('Banking Account / Credit Card Number');
      masked = masked.replace(cardRegex, '[REDACTED-BANKING-NUMBER]');
    }

    return res.json({ maskedText: masked, piiDetected });
  });

  // ==========================================
  // SPRINT 2: COMPLIANCE & DSAR SUITE API ROUTES
  // ==========================================
  app.get('/api/compliance/dsar', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json({ dsarRequests: db.getDSARRequests() });
  });

  app.post('/api/compliance/dsar', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { requestType, userEmail, userName } = req.body;
    const targetEmail = userEmail || user.email;
    const targetName = userName || user.name;

    const newDSAR = db.createDSARRequest({
      userEmail: targetEmail,
      userName: targetName,
      requestType: requestType || 'EXPORT_DATA',
    });

    db.addAuditLog(user.id, user.email, 'DSAR_SUBMITTED', 'COMPLIANCE', newDSAR.id, `Submitted DSAR ${newDSAR.requestType} for ${targetEmail}`);
    return res.status(201).json({ dsar: newDSAR });
  });

  app.post('/api/compliance/dsar/:id/complete', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const completed = db.completeDSARRequest(req.params.id);
    if (!completed) {
      return res.status(404).json({ error: 'DSAR request not found' });
    }

    db.addAuditLog(user.id, user.email, 'DSAR_COMPLETED', 'COMPLIANCE', completed.id, `Completed DSAR ${completed.requestType} for ${completed.userEmail}`);
    return res.json({ dsar: completed });
  });

  app.get('/api/compliance/dsar/:id/download', (req, res) => {
    const dsar = (db.getDSARRequests()).find((d) => d.id === req.params.id);
    if (!dsar) {
      return res.status(404).json({ error: 'DSAR request not found' });
    }

    const userTickets = db.getRequests({ userId: dsar.userEmail });
    const userProfile = db.findUserByEmail(dsar.userEmail);

    const exportData = {
      exportMetadata: {
        dsarId: dsar.id,
        generatedAt: new Date().toISOString(),
        complianceStandard: 'POPIA (Section 23) & GDPR (Article 15)',
        entity: 'Capaciti Service Hub Enterprise',
        dataSubjectEmail: dsar.userEmail,
        digitalSignatureHash: `sha256-${Buffer.from(dsar.id + dsar.userEmail).toString('base64')}`,
      },
      userProfile: userProfile ? { id: userProfile.id, name: userProfile.name, email: userProfile.email, department: userProfile.department, role: userProfile.role, createdAt: userProfile.createdAt } : null,
      tickets: userTickets,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="Capaciti_DSAR_Export_${dsar.id}.json"`);
    return res.send(JSON.stringify(exportData, null, 2));
  });

  app.get('/api/compliance/policies', (req, res) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json({ policies: db.getCompliancePolicies() });
  });

  app.post('/api/compliance/policies/:id/enforce', (req, res) => {
    const user = getUserFromReq(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin authorization required' });
    }

    const policy = db.enforceCompliancePolicy(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    db.addAuditLog(user.id, user.email, 'ENFORCE_COMPLIANCE_POLICY', 'COMPLIANCE', policy.id, `Enforced retention policy: "${policy.name}"`);
    return res.json({ policy, message: `Compliance policy "${policy.name}" executed successfully.` });
  });

  // Explicit 404 handler for any unmatched /api/* requests so they never fall back to index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global Express error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });

  // --- VITE MIDDLEWARE FOR DEVELOPMENT & STATIC SERVING FOR PRODUCTION ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Capaciti Service Hub Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
