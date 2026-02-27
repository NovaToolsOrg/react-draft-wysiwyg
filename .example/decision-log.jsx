import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronDown, Search, Download, Share2, Plus, Copy, ExternalLink, Trash2, Edit3, Link2, Upload, FileText, Trophy, MessageSquare, AlertTriangle, AlertCircle, StickyNote, Smile, Filter, Package, Award, Clock, RotateCcw, Bold, Italic, List, Type, Bell, PenLine } from 'lucide-react';

const LOG_TYPES = [
  { key: 'win', label: 'Win / Achievement', color: '#15bba4', bgColor: '#c6efe9', darkColor: '#0a5c51', Icon: Award },
  { key: 'decision', label: 'Conclusion / Decision', color: '#5170ff', bgColor: '#d3e3fe', darkColor: '#2d4a8a', Icon: FileText },
  { key: 'deliverable', label: 'Deliverable', color: '#8b5cf6', bgColor: '#e9d5ff', darkColor: '#5b21b6', Icon: Package },
  { key: 'blocker', label: 'Blocker / Delay', color: '#f59e0b', bgColor: '#fef3c7', darkColor: '#92400e', Icon: Clock },
  { key: 'note', label: 'Note', color: '#64748b', bgColor: '#e2e8f0', darkColor: '#1e293b', Icon: StickyNote },
  { key: 'critical', label: 'Critical Issue', color: '#ef4444', bgColor: '#ffe4e6', darkColor: '#9f1239', Icon: AlertCircle },
];

const REACTIONS = ['👍', '❤️', '🔥', '💯', '👀', '✅', '📌', '⭐'];

const INITIAL_LOGS = [
  {
    id: 1, type: 'deliverable', author: 'James Teel', authorInitials: 'JT', authorColor: '#15bba4',
    date: 'Dec 2nd 2025 at 13:30', session: 'Approval', sessionLink: '#', content: '',
    deliverableType: 'link', deliverableName: 'Final Brand Guidelines v2.0',
    deliverableUrl: 'https://figma.com/brand-guidelines-v2', reactions: { '👍': 3, '✅': 1 }, isOwn: false,
  },
  {
    id: 2, type: 'blocker', author: 'Emma Wilson', authorInitials: 'E', authorColor: '#8b5cf6',
    date: 'Nov 25th 2025 at 9:30', session: 'Discussion about options', sessionLink: '#',
    content: 'Initial due date: Jan 15 → New due date: Jan 25. 10+ day delay | 40+ days total from original plan',
    delayDays: '10+', reactions: { '👀': 2 }, isOwn: false,
  },
  {
    id: 3, type: 'decision', author: 'Emma Wilson', authorInitials: 'E', authorColor: '#8b5cf6',
    date: 'Nov 21st 2025 at 10:30', session: 'Q1 Strategy Session', sessionLink: '#',
    content: 'We will focus on the enterprise segment as our primary target for Q1 2026. This decision is based on market research showing 40% higher conversion rates and better product-market fit.',
    reactions: { '👍': 4, '❤️': 1 }, isOwn: false,
  },
  {
    id: 4, type: 'win', author: 'Sarah Johnson', authorInitials: 'S', authorColor: '#f59e0b',
    date: 'Nov 20th 2025 at 16:00', session: null,
    content: 'Marketing campaign exceeded expectations with 23% conversion rate — 8% above target. Team morale is at an all-time high after this success.',
    reactions: { '🔥': 5, '💯': 3, '❤️': 2 }, isOwn: false,
  },
  {
    id: 5, type: 'critical', author: 'Michael Chen', authorInitials: 'M', authorColor: '#3b82f6',
    date: 'Nov 19th 2025 at 11:00', session: 'Security Review', sessionLink: '#',
    content: 'Production database experienced intermittent connectivity issues. Root cause identified as misconfigured connection pooling. Immediate fix deployed, monitoring for 48hrs.',
    reactions: { '👀': 3, '📌': 1 }, isOwn: false,
  },
  {
    id: 6, type: 'note', author: 'You', authorInitials: 'I', authorColor: '#15bba4',
    date: 'Nov 18th 2025 at 14:20', session: null,
    content: 'Stakeholder alignment meeting scheduled for Dec 5th. All leads must prepare a 5-minute summary of their Q1 priorities.',
    reactions: { '✅': 2 }, isOwn: true,
  },
  {
    id: 7, type: 'decision', author: 'David Kim', authorInitials: 'D', authorColor: '#ef4444',
    date: 'Nov 17th 2025 at 09:45', session: 'Product Planning', sessionLink: '#',
    content: 'Product roadmap for Q2 will prioritize mobile app development. User surveys show 65% of traffic now comes from mobile devices.',
    reactions: { '👍': 2 }, isOwn: false,
  },
  {
    id: 8, type: 'deliverable', author: 'Sarah Johnson', authorInitials: 'S', authorColor: '#f59e0b',
    date: 'Nov 16th 2025 at 10:00', session: 'Q1 Strategy Session', sessionLink: '#',
    content: '', deliverableType: 'file', deliverableName: 'Q1_Budget_Analysis_2026.xlsx',
    deliverableSize: '2.4 MB', reactions: { '👍': 1 }, isOwn: false,
  },
];

export default function DecisionLog() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [addContent, setAddContent] = useState('');
  const [addAttachments, setAddAttachments] = useState([]);
  const [showAddLinkInput, setShowAddLinkInput] = useState(false);
  const [addLinkUrl, setAddLinkUrl] = useState('');
  const [addLinkName, setAddLinkName] = useState('');
  const [notifyOption, setNotifyOption] = useState('nobody');
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [notifySearchQuery, setNotifySearchQuery] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);
  const [showDelivNote, setShowDelivNote] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [userReactions, setUserReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareLink, setShareLink] = useState('app.nova.com/files/q1-strategy-decision-log');
  const [linkReset, setLinkReset] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showLinkToolbar, setShowLinkToolbar] = useState(false);
  const [linkToolbarUrl, setLinkToolbarUrl] = useState('');
  // Mobile expanded row
  const [expandedRowId, setExpandedRowId] = useState(null);

  const TEAM_MEMBERS = [
    { id: 'sarah', name: 'Sarah Johnson', initials: 'S', color: '#f59e0b', role: 'Product Manager' },
    { id: 'emma', name: 'Emma Wilson', initials: 'E', color: '#8b5cf6', role: 'Designer' },
    { id: 'michael', name: 'Michael Chen', initials: 'M', color: '#3b82f6', role: 'Engineer' },
    { id: 'david', name: 'David Kim', initials: 'D', color: '#ef4444', role: 'Developer' },
    { id: 'james', name: 'James Teel', initials: 'JT', color: '#15bba4', role: 'Lead' },
  ];
  const NOTIFY_GROUPS = [
    { id: '_nobody', label: 'Nobody', emoji: '🔕', color: '#94a3b8' },
    { id: '_project_leads', label: 'All project leaders', emoji: '⚡️', color: '#f59e0b' },
    { id: '_session_leads', label: 'All session leaders', emoji: '👑', color: '#8b5cf6' },
  ];

  const filteredNotifyPeople = TEAM_MEMBERS.filter(p =>
    p.name.toLowerCase().includes(notifySearchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(notifySearchQuery.toLowerCase())
  );
  const filteredNotifyGroups = NOTIFY_GROUPS.filter(g =>
    g.label.toLowerCase().includes(notifySearchQuery.toLowerCase())
  );

  const isNotifySelected = (id) => {
    if (id === '_nobody') return notifyOption === 'nobody' && selectedPeople.length === 0;
    if (id === '_project_leads') return notifyOption === 'project_leads';
    if (id === '_session_leads') return notifyOption === 'session_leads';
    return selectedPeople.includes(id);
  };
  const handleNotifySelect = (id) => {
    if (id === '_nobody') { setNotifyOption('nobody'); setSelectedPeople([]); return; }
    if (id === '_project_leads' || id === '_session_leads') {
      const optKey = id === '_project_leads' ? 'project_leads' : 'session_leads';
      if (notifyOption === optKey) setNotifyOption(selectedPeople.length > 0 ? 'select' : 'nobody');
      else setNotifyOption(optKey);
      return;
    }
    const alreadySelected = selectedPeople.includes(id);
    const newPeople = alreadySelected ? selectedPeople.filter(p => p !== id) : [...selectedPeople, id];
    setSelectedPeople(newPeople);
    if (newPeople.length > 0 && notifyOption === 'nobody') setNotifyOption('select');
    else if (newPeople.length === 0 && notifyOption === 'select') setNotifyOption('nobody');
  };
  const clearNotifySelection = () => { setNotifyOption('nobody'); setSelectedPeople([]); setNotifySearchQuery(''); };
  const getNotifyTriggerLabel = () => {
    const parts = [];
    if (notifyOption === 'project_leads') parts.push('Project leads');
    if (notifyOption === 'session_leads') parts.push('Session leads');
    if (selectedPeople.length > 0) parts.push(`${selectedPeople.length} ${selectedPeople.length === 1 ? 'person' : 'people'}`);
    return parts.length === 0 ? 'Nobody' : parts.join(' + ');
  };
  const hasNotifySelection = notifyOption !== 'nobody' || selectedPeople.length > 0;

  const fileInputRef = useRef(null);
  const reactionRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const sharePopoverRef = useRef(null);
  const editorRef = useRef(null);
  const linkInputRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const notifyDropdownRef = useRef(null);

  const overview = {
    wins: logs.filter(l => l.type === 'win').length,
    decisions: logs.filter(l => l.type === 'decision').length,
    deliverables: logs.filter(l => l.type === 'deliverable').length,
    sessionsCompleted: 0,
    dateChanges: logs.filter(l => l.type === 'blocker').length,
    blockers: logs.filter(l => l.type === 'blocker').length,
    sessionsOverdue: 0,
    delaysFromDeadline: 1,
    criticalIssues: logs.filter(l => l.type === 'critical').length,
    sessionsNoLead: 0,
    tasksNoAssignee: 0,
  };

  const toggleFilter = (key) => setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  const clearFilters = () => setActiveFilters([]);
  const handleOverviewFilter = (filterKey) => {
    if (!filterKey) return;
    if (activeFilters.length === 1 && activeFilters[0] === filterKey) setActiveFilters([]);
    else setActiveFilters([filterKey]);
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(log.type);
    const matchesSearch = searchQuery === '' ||
      log.content?.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.deliverableName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddLog = () => {
    if (!addType) return;
    const editorContent = editorRef.current ? editorRef.current.innerHTML : '';
    const textContent = editorRef.current ? editorRef.current.innerText.trim() : addContent.trim();
    const hasText = textContent.length > 0;
    const hasAttachments = addAttachments.length > 0;
    if (!hasText && !hasAttachments) return;
    const newLog = {
      id: Date.now(), type: addType, author: 'You', authorInitials: 'I', authorColor: '#15bba4',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      session: null, content: (isNoteType || isDeliverableType) ? editorContent : addContent.trim(),
      contentHtml: (isNoteType || isDeliverableType) ? editorContent : null,
      attachments: hasAttachments ? addAttachments : undefined,
      reactions: {}, isOwn: true,
    };
    setLogs(prev => [newLog, ...prev]);
    resetAddForm();
  };

  const resetAddForm = () => {
    setShowAddModal(false); setAddType(null); setAddContent(''); setAddAttachments([]);
    setShowAddLinkInput(false); setAddLinkUrl(''); setAddLinkName('');
    setShowLinkToolbar(false); setLinkToolbarUrl('');
    setNotifyOption('nobody'); setSelectedPeople([]); setNotifySearchQuery('');
    setShowTypeDropdown(false); setShowNotifyDropdown(false); setShowDelivNote(false);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const handleAddAttachmentLink = () => {
    if (!addLinkUrl.trim()) return;
    setAddAttachments(prev => [...prev, { type: 'link', name: addLinkName.trim() || addLinkUrl.trim(), url: addLinkUrl.trim() }]);
    setAddLinkUrl(''); setAddLinkName(''); setShowAddLinkInput(false);
  };
  const handleRemoveAttachment = (index) => setAddAttachments(prev => prev.filter((_, i) => i !== index));
  const handleDelete = (id) => setLogs(prev => prev.filter(l => l.id !== id));
  const handleEdit = (log) => { setEditingId(log.id); setEditContent(log.content || ''); };
  const handleSaveEdit = (id) => { setLogs(prev => prev.map(l => l.id === id ? { ...l, content: editContent.trim() } : l)); setEditingId(null); setEditContent(''); };
  const handleCopy = (text, id) => { try { navigator.clipboard.writeText(text); } catch (e) { } setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const toggleReaction = (logId, emoji) => { const key = `${logId}-${emoji}`; setUserReactions(prev => ({ ...prev, [key]: !prev[key] })); setShowReactionPicker(null); };
  const handleShare = () => { setShowSharePopover(prev => !prev); setShareLinkCopied(false); };
  const handleCopyShareLink = () => { try { navigator.clipboard.writeText(shareLink); } catch (e) { } setShareLinkCopied(true); setTimeout(() => setShareLinkCopied(false), 2000); };
  const handleResetLink = () => { const rand = Math.random().toString(36).substring(2, 8); setShareLink(`app.nova.com/files/q1-strategy-${rand}`); setShareLinkCopied(false); setLinkReset(true); setTimeout(() => setLinkReset(false), 2000); };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragActive(false);
    const files = e.dataTransfer?.files || e.target?.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(f => ({
        type: 'file', name: f.name,
        size: f.size < 1024 * 1024 ? (f.size / 1024).toFixed(1) + ' KB' : (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      }));
      setAddAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const getTypeInfo = (key) => LOG_TYPES.find(t => t.key === key) || LOG_TYPES[4];
  const isNoteType = addType && addType !== 'deliverable';
  const isDeliverableType = addType === 'deliverable';

  const execFormat = (cmd, val = null) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); };
  const handleBold = () => execFormat('bold');
  const handleList = () => execFormat('insertUnorderedList');
  const handleInsertLink = () => { if (linkToolbarUrl.trim()) { execFormat('createLink', linkToolbarUrl.trim()); setLinkToolbarUrl(''); setShowLinkToolbar(false); } };
  const handleClearEditor = () => { if (editorRef.current) { editorRef.current.innerHTML = ''; setAddContent(''); } };
  const handleEditorInput = () => { if (editorRef.current) setAddContent(editorRef.current.innerHTML); };

  useEffect(() => {
    const handler = (e) => {
      if (reactionRef.current && !reactionRef.current.contains(e.target)) setShowReactionPicker(null);
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) setShowFilterDropdown(false);
      if (sharePopoverRef.current && !sharePopoverRef.current.contains(e.target)) setShowSharePopover(false);
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) setShowTypeDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fcfe 0%, #f0f4f8 50%, #f9fcfe 100%)',
      fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      paddingBottom: '4rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: 'Figtree', sans-serif; cursor: pointer; border: none; background: none; }
        input, textarea, select { font-family: 'Figtree', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .dl-container { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem; }
        .dl-header-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; }
        .dl-header-left { flex: 1; min-width: 0; }
        .dl-header-title { font-size: 2.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        .dl-header-subtitle { font-size: 0.8125rem; color: #64748b; font-weight: 400; }
        .dl-header-actions { display: flex; gap: 0.75rem; flex-shrink: 0; }
        .dl-timeline { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .dl-filters-row { display: flex; gap: 0.625rem; margin-bottom: 1.25rem; align-items: center; }
        .dl-search-wrap { position: relative; flex: 1; max-width: 280px; }
        .dl-cta { width: 100%; display: flex; align-items: center; gap: 1rem; padding: 1.125rem 1.5rem; border-radius: 18px; border: 2px solid #d3e3fe; background: linear-gradient(135deg, #f9fcfe 0%, #f0f4ff 50%, #f5f8fe 100%); margin-bottom: 1.25rem; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; box-shadow: 0 2px 12px rgba(81,112,255,0.06); }
        .dl-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(81,112,255,0.06) 0%, rgba(21,187,164,0.04) 100%); opacity: 0; transition: opacity 0.35s; }
        .dl-cta:hover { border-color: #94b8ff; box-shadow: 0 8px 32px rgba(81,112,255,0.12), 0 2px 8px rgba(0,0,0,0.04); transform: translateY(-2px); }
        .dl-cta:hover::before { opacity: 1; }
        .dl-cta:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(81,112,255,0.08); }
        .dl-inline-form { position: relative; border-radius: 18px; border: 1px solid rgba(0,0,0,0.06); background: white; margin-bottom: 1.25rem; overflow: visible; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06); animation: formExpand 0.3s cubic-bezier(0.2,0.8,0.2,1); }
        .dl-inline-form::before { content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 2.5px; border-radius: 0 0 2px 2px; background: var(--form-accent, #d2dbe7); transition: background 0.35s cubic-bezier(0.4,0,0.2,1); }
        @keyframes formExpand { from { opacity: 0; transform: translateY(-6px) scale(0.995); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .ilf-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.125rem 0.625rem; }
        .ilf-header-title { font-size: 0.8125rem; font-weight: 600; color: #64748b; letter-spacing: 0.01em; }
        .ilf-close { width: 28px; height: 28px; border-radius: 8px; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
        .ilf-close:hover { background: #f1f5f9; }

        /* Type Picker Tiles */
        .ilf-type-picker { display: flex; flex-direction: column; gap: 2px; padding: 0 1.125rem 0.875rem; }
        .ilf-type-tile { display: flex; align-items: center; gap: 0.875rem; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9375rem; font-weight: 450; color: #475569; background: transparent; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); text-align: left; width: 100%; cursor: pointer; border: 1.5px solid transparent; }
        .ilf-type-tile:hover { background: #f4f7fb; color: #1f2937; transform: translateX(4px); border-color: #edf2f9; }
        .ilf-type-tile.active { font-weight: 600; color: #0f172a; border-color: #d3e3fe; background: #f4f7fb; }
        .ilf-type-tile .ilf-type-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.25s; }
        .ilf-type-tile:hover .ilf-type-icon { transform: scale(1.08); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .ilf-type-tile.active .ilf-type-icon { transform: scale(1.08); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .ilf-type-tile .ilf-check { width: 18px; height: 18px; border-radius: 6px; border: 1.5px solid #d2dbe7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: auto; transition: all 0.2s; background: white; }
        .ilf-type-tile.active .ilf-check { background: #5170ff; border-color: #5170ff; }
        .ilf-body { padding: 0 1.125rem; }
        .ilf-editor-wrap { border-radius: 12px; border: none; background: transparent; overflow: hidden; transition: all 0.2s; }
        .ilf-editor-wrap:focus-within { background: rgba(249,252,254,0.5); }
        .ilf-deliverable-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; }
        .ilf-deliv-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: 12px; border: 1.5px solid #edf2f9; background: #f9fcfe; transition: all 0.2s; cursor: pointer; }
        .ilf-deliv-card:hover { border-color: #d3e3fe; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.05); transform: translateY(-1px); }
        .ilf-deliv-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ilf-att-list { display: flex; flex-direction: column; gap: 6px; margin-top: 0.75rem; padding: 0 0.25rem; }
        .ilf-att-item { display: flex; align-items: center; gap: 10px; padding: 0.625rem 1rem; border-radius: 11px; background: #f4f7fb; border: 1.5px solid #edf2f9; font-size: 0.875rem; color: #1f2937; font-weight: 500; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .ilf-att-item:hover { background: #edf2f9; border-color: #d3e3fe; transform: translateX(2px); }
        .ilf-bottombar { display: flex; align-items: center; gap: 1px; padding: 0.375rem 1rem 0.625rem; margin-top: 0.25rem; }
        .ilf-bottombar .fmt-btn { width: 30px; height: 30px; border-radius: 8px; color: #c1cad6; transition: all 0.15s; }
        .ilf-bottombar .fmt-btn:hover { color: #475569; background: #f1f5f9; }
        .ilf-bar-sep { width: 1px; height: 12px; background: #edf2f9; margin: 0 4px; flex-shrink: 0; }
        .ilf-cancel-btn { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-left: 4px; color: #c1cad6; }
        .ilf-cancel-btn:hover { background: #f1f5f9; color: #64748b; }
        .ilf-add-btn { display: flex; align-items: center; gap: 5px; padding: 0.4375rem 1.125rem; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; background: #0f172a; color: white; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-shrink: 0; margin-left: 6px; }
        .ilf-add-btn:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .ilf-add-btn:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
        .ilf-add-btn:disabled:hover { transform: none; }
        .dl-share-popover { position: absolute; top: calc(100% + 8px); right: 0; z-index: 50; background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.04); width: 340px; padding: 1.25rem; animation: fadeSlideIn 0.2s ease-out; }

        .rich-editor { min-height: 100px; outline: none; font-size: 0.875rem; color: #1f2937; line-height: 1.65; word-break: break-word; }
        .rich-editor:empty::before { content: attr(data-placeholder); color: #a0aec0; font-weight: 400; pointer-events: none; }
        .rich-editor b, .rich-editor strong { font-weight: 700; }
        .rich-editor ul { padding-left: 1.25rem; margin: 0.25rem 0; }
        .rich-editor li { margin-bottom: 0.15rem; }
        .rich-editor a { color: #5170ff; text-decoration: underline; }
        .fmt-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.15s; }
        .fmt-btn:hover { background: #edf2f9; color: #1f2937; }

        /* ─── TABLE STYLES ─── */
        .log-table-container {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(229,231,235,0.6);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(31,38,135,0.1), inset 0 1px 0 0 rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04);
        }
        .log-table-wrap { overflow-x: auto; }
        .log-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .log-table thead { background-color: #f8fafc; position: sticky; top: 0; z-index: 10; }
        .log-table th {
          padding: 0.875rem 1rem;
          text-align: left;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1.5px solid #e5e7eb;
          border-right: 1px solid #f1f5f9;
          white-space: nowrap;
        }
        .log-table th:last-child { border-right: none; }
        .log-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background-color 0.15s ease; }
        .log-table tbody tr:last-child { border-bottom: none; }
        .log-table tbody tr:hover { background-color: rgba(211,227,254,0.12); }
        .log-table td {
          padding: 1rem;
          vertical-align: top;
          border-right: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.8125rem;
        }
        .log-table td:last-child { border-right: none; }
        .log-table tbody tr:last-child td { border-bottom: none; }

        /* Column widths */
        .log-table .col-type { width: 140px; min-width: 120px; }
        .log-table .col-update { min-width: 260px; }
        .log-table .col-date { width: 140px; min-width: 120px; }
        .log-table .col-where { width: 160px; min-width: 130px; }
        .log-table .col-who { width: 140px; min-width: 120px; }
        .log-table .col-actions { width: 80px; min-width: 70px; text-align: center; }

        /* Mobile card view */
        .mobile-log-card {
          background: white;
          border: 1px solid #edf2f9;
          border-radius: 14px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .mobile-log-card:hover {
          border-color: #d3e3fe;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .mobile-log-card .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.625rem;
        }
        .mobile-log-card .card-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #f1f5f9;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .overview-grid { grid-template-columns: 1fr; }
          .dl-container { padding: 1.25rem 1rem; }
          .dl-header-row { flex-direction: column; gap: 0.75rem; }
          .dl-header-title { font-size: 1.625rem; }
          .dl-header-subtitle { font-size: 0.75rem; }
          .dl-header-actions { width: 100%; }
          .dl-header-actions > button, .dl-header-actions > div { flex: 1; }
          .dl-header-actions > div > button { width: 100%; justify-content: center; }
          .dl-timeline { gap: 1rem; }
          .dl-filters-row { flex-wrap: wrap; }
          .dl-search-wrap { max-width: 100%; min-width: 0; flex-basis: 100%; order: -1; }
          .dl-share-popover { position: fixed; top: auto; bottom: 0; left: 0; right: 0; width: 100%; border-radius: 20px 20px 0 0; max-height: 60vh; }
          .ilf-deliverable-row { grid-template-columns: 1fr; }
          .ilf-selectors { flex-direction: column; gap: 0.3125rem; }
          .desktop-table { display: none !important; }
          .mobile-cards { display: block !important; }
          .dl-cta .cta-type-hints { display: none; }
          .dl-cta { padding: 1rem 1.25rem; }
        }
        @media (min-width: 769px) {
          .desktop-table { display: block !important; }
          .mobile-cards { display: none !important; }
        }
        @media (max-width: 480px) {
          .dl-container { padding: 1rem 0.75rem; }
          .dl-header-title { font-size: 1.375rem; }
          .dl-timeline { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .dl-timeline .tl-separator { width: 100%; height: 1px; }
        }
      `}</style>

      <div className="dl-container">

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="dl-header-row">
            <div className="dl-header-left">
              <h1 className="dl-header-title">Decision Log</h1>
              <p className="dl-header-subtitle">[Project name] Centralized Decision Log to track changes affecting decisions and timelines</p>
            </div>
            <div className="dl-header-actions">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, background: 'white', color: '#64748b', border: '1.5px solid #e5e7eb', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
              ><Download size={16} /> Export Excel</button>
              <div style={{ position: 'relative' }} ref={sharePopoverRef}>
                <button onClick={handleShare} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 600, background: '#13233d', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'; }}
                ><Share2 size={16} /> Share</button>
                {showSharePopover && (
                  <div className="dl-share-popover">
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Share this collection</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.5 }}>Share files and links with your team or external collaborators</p>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '-0.01em' }}>{shareLink}</div>
                      <button onClick={handleCopyShareLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.625rem 1rem', background: shareLinkCopied ? '#15bba4' : '#13233d', color: 'white', fontSize: '0.8125rem', fontWeight: 600, borderLeft: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                        {shareLinkCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleResetLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500, color: linkReset ? '#15bba4' : '#64748b', transition: 'all 0.2s' }}>
                        {linkReset ? <><Check size={14} /> Link reset</> : <><RotateCcw size={14} /> Reset link</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="dl-timeline">
            <div><div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Project Start</div><div style={{ fontSize: '0.9375rem', color: '#1f2937', fontWeight: 600 }}>Jan 15, 2026</div></div>
            <div className="tl-separator" style={{ width: 32, height: 2, background: 'linear-gradient(90deg, #cbd5e1, #94a3b8, #cbd5e1)', borderRadius: 2 }} />
            <div><div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Project End</div><div style={{ fontSize: '0.9375rem', color: '#1f2937', fontWeight: 600 }}>Mar 30, 2026</div></div>
            <div style={{ padding: '0.5rem 1rem', background: '#edf2f9', borderRadius: 8, fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>74 days</div>
          </div>
        </div>

        {/* ─── OVERVIEW DASHBOARD ─── */}
        <div className="overview-grid">
          {[
            { title: 'Info', color: '#15bba4', items: [['Wins / Achievements', overview.wins, 'win'], ['Conclusions / Decisions', overview.decisions, 'decision'], ['Deliverables shared', overview.deliverables, 'deliverable'], ['Sessions completed', overview.sessionsCompleted, null]] },
            { title: 'Warning / Monitor', color: '#f59e0b', items: [['Date changes', overview.dateChanges, 'blocker'], ['Blockers / Delays reported', overview.blockers, 'blocker'], ['Sessions overdue', overview.sessionsOverdue, null]] },
            { title: 'Critical', color: '#ef4444', items: [['Delays from deadline', overview.delaysFromDeadline, 'blocker'], ['Critical issues logged', overview.criticalIssues, 'critical'], ['Sessions without a lead', overview.sessionsNoLead, null], ['Tasks without assignee', overview.tasksNoAssignee, null]] },
          ].map(section => (
            <div key={section.title} style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(229,231,235,0.6)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${section.color}15` }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: section.color }} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{section.title}</span>
              </div>
              {section.items.map(([label, val, filterKey], i, arr) => {
                const isActive = filterKey && activeFilters.length === 1 && activeFilters[0] === filterKey;
                return (
                  <div key={label} onClick={() => handleOverviewFilter(filterKey)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.4rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: filterKey ? 'pointer' : 'default', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (filterKey) { const l = e.currentTarget.querySelector('.metric-label'); l.style.color = '#5170ff'; l.style.fontWeight = '600'; } }}
                    onMouseLeave={e => { if (filterKey) { const l = e.currentTarget.querySelector('.metric-label'); l.style.color = isActive ? '#5170ff' : '#64748b'; l.style.fontWeight = isActive ? '600' : '400'; } }}
                  >
                    <span className="metric-label" style={{ fontSize: '0.8125rem', color: isActive ? '#5170ff' : '#64748b', fontWeight: isActive ? 600 : 400, transition: 'all 0.2s' }}>{label}</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: val > 0 ? '#1f2937' : '#cbd5e1' }}>{val}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ─── DECISION LOG TITLE ─── */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Centralized Decision Log</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            <span>ALL CONCLUSIONS & UPDATES</span><span>·</span><span>Newest first</span><span>·</span><span>{filteredLogs.length} items</span>
          </div>
        </div>

        {/* ─── FILTERS + SEARCH ─── */}
        <div className="dl-filters-row">
          <div style={{ position: 'relative' }} ref={filterDropdownRef}>
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.875rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500, background: activeFilters.length > 0 ? '#eef2ff' : 'white', color: activeFilters.length > 0 ? '#5170ff' : '#64748b', border: activeFilters.length > 0 ? '1.5px solid #c7d2fe' : '1.5px solid #e5e7eb', transition: 'all 0.2s', whiteSpace: 'nowrap', height: 38 }}
            >
              <Filter size={14} />
              {activeFilters.length > 0 ? (<>{activeFilters.length === 1 ? LOG_TYPES.find(t => t.key === activeFilters[0])?.label : `${activeFilters.length} filters`}<span style={{ width: 18, height: 18, borderRadius: '50%', background: '#5170ff', color: 'white', fontSize: '0.6875rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters.length}</span></>) : (<>All updates <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0)' }} /></>)}
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', width: 260, overflow: 'hidden', animation: 'fadeSlideIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>Filter by</span>
                  {activeFilters.length > 0 && <button onClick={clearFilters} style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5170ff' }}>Clear all</button>}
                </div>
                <button onClick={() => { clearFilters(); setShowFilterDropdown(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 500, color: activeFilters.length === 0 ? '#0f172a' : '#64748b', textAlign: 'left' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: activeFilters.length === 0 ? 'none' : '1.5px solid #d1d5db', background: activeFilters.length === 0 ? '#5170ff' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeFilters.length === 0 && <Check size={12} style={{ color: 'white' }} strokeWidth={3} />}
                  </div>All updates
                </button>
                {LOG_TYPES.map(t => {
                  const active = activeFilters.includes(t.key);
                  return (
                    <button key={t.key} onClick={() => toggleFilter(t.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: active ? 500 : 400, color: active ? '#0f172a' : '#475569', textAlign: 'left' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: active ? 'none' : '1.5px solid #d1d5db', background: active ? '#5170ff' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {active && <Check size={12} style={{ color: 'white' }} strokeWidth={3} />}
                      </div>
                      {React.createElement(t.Icon, { size: 15, style: { color: t.color, flexShrink: 0 }, strokeWidth: 1.75 })}
                      {t.label}
                    </button>
                  );
                })}
                <div style={{ height: 6 }} />
              </div>
            )}
          </div>
          <div className="dl-search-wrap">
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name..."
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.125rem', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.8125rem', color: '#1f2937', background: 'white', outline: 'none', transition: 'all 0.2s', height: 38 }}
              onFocus={e => { e.target.style.borderColor = '#5170ff'; e.target.style.boxShadow = '0 0 0 3px rgba(81,112,255,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* ─── LOG AN UPDATE — INLINE FORM ─── */}
        {!showAddModal ? (
          <button className="dl-cta" onClick={() => setShowAddModal(true)}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #5170ff, #7b93ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.35s', boxShadow: '0 2px 10px rgba(81,112,255,0.25)', flexShrink: 0 }}>
              <Plus size={18} style={{ color: 'white' }} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', display: 'block', lineHeight: 1.3, letterSpacing: '-0.01em' }}>Log an update</span>
              <div className="cta-type-hints" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                {LOG_TYPES.map(t => (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {React.createElement(t.Icon, { size: 12, style: { color: t.color, opacity: 0.75 }, strokeWidth: 1.75 })}
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 450 }}>{t.shortLabel || t.label.split('/')[0].split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94b8ff', transition: 'color 0.2s' }}>Add</span>
              <ChevronDown size={14} style={{ color: '#94b8ff', flexShrink: 0, transform: 'rotate(-90deg)' }} />
            </div>
          </button>
        ) : (
          <div className="dl-inline-form" style={{ '--form-accent': addType ? getTypeInfo(addType).color : '#5170ff' }}>
            <div className="ilf-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #5170ff, #7b93ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(81,112,255,0.2)' }}>
                  <Plus size={14} style={{ color: 'white' }} strokeWidth={2.5} />
                </div>
                <span className="ilf-header-title" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>Log an update</span>
              </div>
              <button className="ilf-close" onClick={resetAddForm}><X size={14} style={{ color: '#94a3b8' }} /></button>
            </div>

            {/* Subtitle when no type selected */}
            {!addType && (
              <div style={{ padding: '0 1.125rem 0.5rem' }}>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 400 }}>Choose the type of update</p>
              </div>
            )}

            {/* TYPE PICKER — inline tile list */}
            {!addType && (
              <div className="ilf-type-picker" style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                {LOG_TYPES.map(t => (
                  <button key={t.key}
                    className={`ilf-type-tile ${addType === t.key ? 'active' : ''}`}
                    onClick={() => { setAddType(t.key); if (t.key !== 'deliverable') setTimeout(() => editorRef.current?.focus(), 100); }}
                  >
                    <div className="ilf-type-icon" style={{ background: t.bgColor }}>
                      {React.createElement(t.Icon, { size: 16, style: { color: t.color, transition: 'color 0.2s' }, strokeWidth: 1.75 })}
                    </div>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected type badge — shown once a type is picked */}
            {addType && (
              <div style={{ padding: '0 1.125rem 0.5rem', animation: 'fadeSlideIn 0.15s ease-out' }}>
                <button
                  onClick={() => setAddType(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0.3125rem 0.75rem 0.3125rem 0.5rem',
                    borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                    background: getTypeInfo(addType).bgColor,
                    color: getTypeInfo(addType).darkColor,
                    border: `1.5px solid ${getTypeInfo(addType).color}20`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                  title="Change type"
                >
                  {React.createElement(getTypeInfo(addType).Icon, { size: 13, strokeWidth: 1.75 })}
                  <span>{getTypeInfo(addType).label}</span>
                  <X size={11} style={{ color: getTypeInfo(addType).color, marginLeft: 2, opacity: 0.5 }} />
                </button>
              </div>
            )}
            {/* BODY */}
            <div className="ilf-body">
              {isNoteType && (
                <div className="ilf-editor-wrap" style={{ animation: 'fadeSlideIn 0.15s ease-out' }}>
                  <div ref={editorRef} contentEditable suppressContentEditableWarning className="rich-editor" data-placeholder="Write your update…" onInput={handleEditorInput} style={{ padding: '0.5rem 0.5rem', minHeight: 80 }} />
                  {addAttachments.length > 0 && (
                    <div className="ilf-att-list">
                      {addAttachments.map((att, idx) => (
                        <div key={idx} className="ilf-att-item">
                          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: att.type === 'link' ? '#eef2ff' : '#f3e8ff' }}>
                            {att.type === 'link' ? <Link2 size={15} style={{ color: '#5170ff' }} /> : <FileText size={15} style={{ color: '#8b5cf6' }} />}
                          </div>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{att.name}</span>
                          {att.size && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{att.size}</span>}
                          <button onClick={() => handleRemoveAttachment(idx)} style={{ padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          ><X size={14} style={{ color: '#94a3b8' }} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {showAddLinkInput && (<div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 0.25rem 0.375rem' }}><input value={addLinkUrl} onChange={e => setAddLinkUrl(e.target.value)} placeholder="https://…" autoFocus style={{ flex: 1, padding: '0.25rem 0.5rem', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: '0.6875rem', outline: 'none', color: '#1f2937', minWidth: 0 }} onKeyDown={e => { if (e.key === 'Enter') handleAddAttachmentLink(); if (e.key === 'Escape') { setShowAddLinkInput(false); setAddLinkUrl(''); setAddLinkName(''); } }} /><input value={addLinkName} onChange={e => setAddLinkName(e.target.value)} placeholder="Title" style={{ flex: 1, padding: '0.25rem 0.5rem', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: '0.6875rem', outline: 'none', color: '#1f2937', minWidth: 0 }} onKeyDown={e => { if (e.key === 'Enter') handleAddAttachmentLink(); }} /><button onClick={handleAddAttachmentLink} disabled={!addLinkUrl.trim()} style={{ padding: '0.25rem 0.4375rem', borderRadius: 5, fontSize: '0.625rem', fontWeight: 600, background: addLinkUrl.trim() ? '#13233d' : '#e5e7eb', color: addLinkUrl.trim() ? 'white' : '#94a3b8' }}>Add</button><button onClick={() => { setShowAddLinkInput(false); setAddLinkUrl(''); setAddLinkName(''); }}><X size={12} style={{ color: '#94a3b8' }} /></button></div>)}
                </div>
              )}
              {isDeliverableType && (
                <div style={{ animation: 'fadeSlideIn 0.15s ease-out' }}>
                  <div className="ilf-deliverable-row">
                    <div className="ilf-deliv-card" onClick={() => setShowAddLinkInput(true)} style={showAddLinkInput ? { borderColor: '#5170ff', background: '#f8fafc' } : {}}><div className="ilf-deliv-icon" style={{ background: '#eef2ff' }}><Link2 size={18} style={{ color: '#5170ff' }} /></div><div><div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1f2937', marginBottom: 1 }}>Add a link</div><div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Paste any URL</div></div></div>
                    <div className="ilf-deliv-card" onClick={() => fileInputRef.current?.click()} onDragEnter={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={e => { e.preventDefault(); setDragActive(false); }} onDragOver={e => e.preventDefault()} onDrop={handleFileDrop} style={dragActive ? { borderColor: '#8b5cf6', background: 'rgba(139,92,246,0.04)' } : {}}><div className="ilf-deliv-icon" style={{ background: '#f1f5f9' }}><Upload size={18} style={{ color: '#64748b' }} /></div><div><div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1f2937', marginBottom: 1 }}>Upload file</div><div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Drop or <span style={{ color: '#5170ff', fontWeight: 500 }}>browse</span></div></div><input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileDrop} /></div>
                  </div>
                  {showAddLinkInput && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.625rem', padding: '0.5rem', borderRadius: 11, border: '1.5px solid #d3e3fe', background: '#f9fcfe' }}><input value={addLinkUrl} onChange={e => setAddLinkUrl(e.target.value)} placeholder="https://…" autoFocus style={{ flex: 1, padding: '0.4375rem 0.625rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.8125rem', outline: 'none', color: '#1f2937', minWidth: 0, background: 'white' }} onKeyDown={e => { if (e.key === 'Enter') handleAddAttachmentLink(); }} /><input value={addLinkName} onChange={e => setAddLinkName(e.target.value)} placeholder="Title (optional)" style={{ flex: 1, padding: '0.4375rem 0.625rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '0.8125rem', outline: 'none', color: '#1f2937', minWidth: 0, background: 'white' }} onKeyDown={e => { if (e.key === 'Enter') handleAddAttachmentLink(); }} /><button onClick={handleAddAttachmentLink} disabled={!addLinkUrl.trim()} style={{ padding: '0.4375rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: addLinkUrl.trim() ? '#13233d' : '#e5e7eb', color: addLinkUrl.trim() ? 'white' : '#94a3b8' }}>Add</button><button onClick={() => { setShowAddLinkInput(false); setAddLinkUrl(''); setAddLinkName(''); }}><X size={14} style={{ color: '#94a3b8' }} /></button></div>)}
                  {/* Attachment list — bigger items */}
                  {addAttachments.length > 0 && (
                    <div className="ilf-att-list">
                      {addAttachments.map((att, idx) => (
                        <div key={idx} className="ilf-att-item">
                          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: att.type === 'link' ? '#eef2ff' : '#f3e8ff' }}>
                            {att.type === 'link' ? <Link2 size={15} style={{ color: '#5170ff' }} /> : <FileText size={15} style={{ color: '#8b5cf6' }} />}
                          </div>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{att.name}</span>
                          {att.size && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{att.size}</span>}
                          <button onClick={() => handleRemoveAttachment(idx)} style={{ padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          ><X size={14} style={{ color: '#94a3b8' }} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Note / description area for deliverable */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>Add a note</span>
                      <span style={{ fontSize: '0.6875rem', color: '#c1cad6' }}>(optional)</span>
                    </div>
                    <div className="ilf-editor-wrap">
                      <div ref={editorRef} contentEditable suppressContentEditableWarning className="rich-editor" data-placeholder="Describe this deliverable…" onInput={handleEditorInput} style={{ padding: '0.5rem 0.5rem', minHeight: 56 }} />
                    </div>
                  </div>
                </div>
              )}
              {!addType && (
                <div style={{ display: 'none' }}><div ref={editorRef} contentEditable suppressContentEditableWarning className="rich-editor" data-placeholder="Write your update…" onInput={handleEditorInput} /></div>
              )}
            </div>
            {addType && (
              <div className="ilf-bottombar">
                {(isNoteType || isDeliverableType) && (<>
                  <button onClick={handleBold} className="fmt-btn" title="Bold"><Bold size={13} strokeWidth={2.5} /></button>
                  <button onClick={() => document.execCommand('italic')} className="fmt-btn" title="Italic"><Italic size={13} strokeWidth={2} /></button>
                  <button onClick={handleList} className="fmt-btn" title="List"><List size={13} strokeWidth={2} /></button>
                  {isNoteType && (<>
                    <div className="ilf-bar-sep" />
                    <button onClick={() => fileInputRef.current?.click()} className="fmt-btn" title="Attach file"><Upload size={13} strokeWidth={2} /></button>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowLinkToolbar(!showLinkToolbar)} className="fmt-btn" title="Insert link" style={{ color: showLinkToolbar ? '#5170ff' : undefined, background: showLinkToolbar ? '#edf2f9' : undefined }}><Link2 size={13} strokeWidth={2} /></button>
                      {showLinkToolbar && (<div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, zIndex: 10, background: 'white', borderRadius: 9, padding: '0.375rem', border: '1.5px solid #e5e7eb', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 4, width: 220 }}><input ref={linkInputRef} value={linkToolbarUrl} onChange={e => setLinkToolbarUrl(e.target.value)} placeholder="https://…" autoFocus style={{ flex: 1, padding: '0.25rem 0.4375rem', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: '0.6875rem', outline: 'none', color: '#1f2937', minWidth: 0 }} onKeyDown={e => { if (e.key === 'Enter') handleInsertLink(); if (e.key === 'Escape') { setShowLinkToolbar(false); setLinkToolbarUrl(''); } }} /><button onClick={handleInsertLink} style={{ padding: '0.25rem 0.4375rem', borderRadius: 6, fontSize: '0.625rem', fontWeight: 600, background: linkToolbarUrl.trim() ? '#13233d' : '#e5e7eb', color: linkToolbarUrl.trim() ? 'white' : '#94a3b8' }}>Add</button></div>)}
                    </div>
                    <button onClick={() => setShowAddLinkInput(!showAddLinkInput)} className="fmt-btn" title="Attach link" style={{ color: showAddLinkInput ? '#5170ff' : undefined }}><ExternalLink size={13} strokeWidth={2} /></button>
                  </>)}
                  <button className="fmt-btn" title="Emoji" onClick={() => { if (editorRef.current) { editorRef.current.focus(); document.execCommand('insertText', false, '😊'); } }}><Smile size={13} strokeWidth={2} /></button>
                  <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileDrop} />
                </>)}
                <div style={{ flex: 1 }} />
                <button className="ilf-cancel-btn" onClick={resetAddForm} title="Cancel"><X size={14} style={{ color: '#94a3b8' }} /></button>
                <button className="ilf-add-btn" onClick={handleAddLog} disabled={isNoteType ? !(editorRef.current?.innerText?.trim()) : isDeliverableType ? (addAttachments.length === 0 && !(editorRef.current?.innerText?.trim())) : !addContent.trim()}>Add</button>
              </div>
            )}
          </div>
        )}

        {/* ─── LOG ENTRIES — DESKTOP TABLE ─── */}
        <div className="desktop-table">
          <div className="log-table-container">
            <div className="log-table-wrap">
              <table className="log-table">
                <thead>
                  <tr>
                    <th className="col-type">Type</th>
                    <th className="col-update">Update</th>
                    <th className="col-date">Date</th>
                    <th className="col-where">Where</th>
                    <th className="col-who">Who</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>No entries match your filters.</td></tr>
                  )}
                  {filteredLogs.map((log) => {
                    const typeInfo = getTypeInfo(log.type);
                    return (
                      <tr key={log.id} style={{ animation: 'fadeSlideIn 0.3s ease-out both' }}>
                        {/* TYPE */}
                        <td className="col-type" style={{ verticalAlign: 'top' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '0.25rem 0.625rem', borderRadius: 7,
                            fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap',
                            background: typeInfo.bgColor, color: typeInfo.darkColor || typeInfo.color,
                          }}>
                            {React.createElement(typeInfo.Icon, { size: 11, strokeWidth: 2 })}
                            {typeInfo.label}
                          </span>
                        </td>

                        {/* UPDATE — content + copy + reactions */}
                        <td className="col-update" style={{ verticalAlign: 'top' }}>
                          {editingId === log.id ? (
                            <div>
                              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} autoFocus
                                style={{ width: '100%', minHeight: 70, padding: '0.625rem', borderRadius: 10, border: '1.5px solid #5170ff', fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6, outline: 'none', resize: 'vertical', background: 'white' }}
                              />
                              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingId(null)} style={{ padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500, background: '#edf2f9', color: '#6b7280' }}>Cancel</button>
                                <button onClick={() => handleSaveEdit(log.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: '#13233d', color: 'white' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {/* Content */}
                              {log.content && (
                                log.contentHtml ? (
                                  <div className="rich-editor" style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.55, minHeight: 'unset' }} dangerouslySetInnerHTML={{ __html: log.contentHtml }} />
                                ) : (
                                  <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.55, margin: 0 }}>{log.content}</p>
                                )
                              )}
                              {log.type === 'deliverable' && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.4rem 0.625rem', borderRadius: 8, background: 'white', border: '1px solid #e5e7eb', marginTop: log.content ? 6 : 0 }}>
                                  {log.deliverableType === 'link' ? <Link2 size={14} style={{ color: '#5170ff' }} /> : <FileText size={14} style={{ color: '#8b5cf6' }} />}
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937' }}>{log.deliverableName}</span>
                                  {log.deliverableSize && <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>({log.deliverableSize})</span>}
                                  {log.deliverableType === 'link' && <a href={log.deliverableUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#5170ff', display: 'flex' }}><ExternalLink size={13} /></a>}
                                  {log.deliverableType === 'file' && <button style={{ color: '#5170ff', display: 'flex' }}><Download size={13} /></button>}
                                </div>
                              )}
                              {log.type === 'blocker' && log.delayDays && (
                                <span style={{ display: 'inline-flex', marginTop: 6, padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600, background: '#ffe4e6', color: '#e11d48' }}>{log.delayDays} days delayed</span>
                              )}
                              {log.attachments && log.attachments.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                                  {log.attachments.map((att, aidx) => (
                                    <div key={aidx} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.625rem', borderRadius: 8, background: 'white', border: '1.5px solid #d3e3fe', width: 'fit-content' }}>
                                      {att.type === 'link' ? <Link2 size={12} style={{ color: '#5170ff' }} /> : <FileText size={12} style={{ color: '#8b5cf6' }} />}
                                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#1f2937' }}>{att.name}</span>
                                      {att.size && <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>({att.size})</span>}
                                      {att.type === 'link' && att.url && <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: '#5170ff', display: 'flex' }}><ExternalLink size={11} /></a>}
                                      {att.type === 'file' && <button style={{ color: '#5170ff', display: 'flex' }}><Download size={11} /></button>}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reactions + Copy — inside update cell */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', position: 'relative' }} ref={showReactionPicker === log.id ? reactionRef : null}>
                                {Object.entries(log.reactions || {}).map(([emoji, count]) => {
                                  const key = `${log.id}-${emoji}`;
                                  const reacted = userReactions[key];
                                  const display = count + (reacted ? 1 : 0);
                                  return (
                                    <button key={emoji} onClick={() => toggleReaction(log.id, emoji)} style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 3,
                                      padding: '0.2rem 0.5rem', borderRadius: 14,
                                      fontSize: '0.6875rem', fontWeight: 500,
                                      background: reacted ? '#dbeafe' : '#edf2f9',
                                      border: reacted ? '1.5px solid #5170ff' : '1.5px solid transparent',
                                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                      cursor: 'pointer',
                                    }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        if (!reacted) {
                                          e.currentTarget.style.background = '#d3e3fe';
                                          e.currentTarget.style.borderColor = '#94b8ff';
                                        } else {
                                          e.currentTarget.style.background = '#bfdbfe';
                                        }
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.background = reacted ? '#dbeafe' : '#edf2f9';
                                        e.currentTarget.style.borderColor = reacted ? '#5170ff' : 'transparent';
                                      }}
                                    >
                                      <span style={{ fontSize: '0.8125rem' }}>{emoji}</span>
                                      <span style={{ color: '#475569' }}>{display}</span>
                                    </button>
                                  );
                                })}
                                <button onClick={() => setShowReactionPicker(showReactionPicker === log.id ? null : log.id)}
                                  style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf2f9', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer', border: '1.5px solid transparent' }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#d3e3fe';
                                    e.currentTarget.style.transform = 'scale(1.12)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(81,112,255,0.15)';
                                    e.currentTarget.style.borderColor = '#94b8ff';
                                    e.currentTarget.querySelector('svg').style.color = '#5170ff';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#edf2f9';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.querySelector('svg').style.color = '#64748b';
                                  }}
                                ><Smile size={12} style={{ color: '#64748b', transition: 'color 0.2s' }} /></button>

                                {/* Separator */}
                                <div style={{ width: 1, height: 16, background: '#edf2f9', margin: '0 2px', flexShrink: 0 }} />

                                {/* Copy button */}
                                <button onClick={() => handleCopy((log.content || log.deliverableName || '').replace(/<[^>]*>/g, ''), log.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '0.25rem 0.625rem', borderRadius: 8,
                                    fontSize: '0.6875rem', fontWeight: 500,
                                    color: copiedId === log.id ? '#15bba4' : '#6b7280',
                                    background: copiedId === log.id ? '#c6efe9' : 'transparent',
                                    border: copiedId === log.id ? '1.5px solid #15bba4' : '1.5px solid transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={e => {
                                    if (copiedId !== log.id) {
                                      e.currentTarget.style.background = '#edf2f9';
                                      e.currentTarget.style.borderColor = '#d3e3fe';
                                      e.currentTarget.style.color = '#1f2937';
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    if (copiedId !== log.id) {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.borderColor = 'transparent';
                                      e.currentTarget.style.color = '#6b7280';
                                      e.currentTarget.style.transform = 'scale(1)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }
                                  }}
                                  title={copiedId === log.id ? 'Copied!' : 'Copy text'}
                                >{copiedId === log.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}</button>

                                {/* Reaction picker popover */}
                                {showReactionPicker === log.id && (
                                  <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, padding: '0.4rem', background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #edf2f9', display: 'flex', gap: 3, zIndex: 50 }}>
                                    {REACTIONS.map(emoji => (
                                      <button key={emoji} onClick={() => toggleReaction(log.id, emoji)}
                                        style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.12s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#edf2f9'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                                      >{emoji}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="col-date" style={{ verticalAlign: 'top', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                          {log.date}
                        </td>

                        {/* WHERE */}
                        <td className="col-where" style={{ verticalAlign: 'top' }}>
                          {log.session ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937' }}>{log.session}</span>
                              {log.sessionLink && (
                                <a href={log.sessionLink} target="_blank" rel="noopener noreferrer"
                                  style={{ color: '#94a3b8', display: 'flex', flexShrink: 0, width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', border: '1.5px solid transparent', cursor: 'pointer' }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#d3e3fe';
                                    e.currentTarget.style.borderColor = '#94b8ff';
                                    e.currentTarget.style.color = '#5170ff';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(81,112,255,0.15)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Logged here</span>
                          )}
                        </td>

                        {/* WHO */}
                        <td className="col-who" style={{ verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: log.authorColor, flexShrink: 0,
                            }}>
                              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'white' }}>{log.authorInitials}</span>
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.author}</span>
                          </div>
                        </td>

                        {/* ACTIONS — only remove/edit if own */}
                        <td className="col-actions" style={{ verticalAlign: 'top', textAlign: 'center' }}>
                          {log.isOwn ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                              {log.type !== 'deliverable' && (
                                <button onClick={() => handleEdit(log)}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', border: '1.5px solid transparent', cursor: 'pointer' }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#edf2f9';
                                    e.currentTarget.style.borderColor = '#d3e3fe';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    e.currentTarget.querySelector('svg').style.color = '#475569';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.querySelector('svg').style.color = '#6b7280';
                                  }}
                                  title="Edit"
                                ><Edit3 size={14} style={{ color: '#6b7280', transition: 'color 0.2s' }} /></button>
                              )}
                              <button onClick={() => handleDelete(log.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', border: '1.5px solid transparent', cursor: 'pointer' }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#fff1f2';
                                  e.currentTarget.style.borderColor = '#fecdd3';
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.12)';
                                  e.currentTarget.querySelector('svg').style.color = '#dc2626';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.borderColor = 'transparent';
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.querySelector('svg').style.color = '#ef4444';
                                }}
                                title="Delete"
                              ><Trash2 size={14} style={{ color: '#ef4444', transition: 'color 0.2s' }} /></button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.6875rem', color: '#d2dbe7' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── LOG ENTRIES — MOBILE CARDS ─── */}
        <div className="mobile-cards" style={{ display: 'none' }}>
          {filteredLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>No entries match your filters.</div>
          )}
          {filteredLogs.map((log) => {
            const typeInfo = getTypeInfo(log.type);
            const isExpanded = expandedRowId === log.id;
            return (
              <div key={log.id} className="mobile-log-card" onClick={() => setExpandedRowId(isExpanded ? null : log.id)}>
                {/* Header: type tag + who */}
                <div className="card-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600, background: typeInfo.bgColor, color: typeInfo.darkColor }}>
                    {React.createElement(typeInfo.Icon, { size: 10, strokeWidth: 2 })}
                    {typeInfo.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: log.authorColor }}>
                      <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'white' }}>{log.authorInitials}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>{log.author}</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ marginBottom: 8 }}>
                  {log.content && <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden' }}>{log.content.replace(/<[^>]*>/g, '')}</p>}
                  {log.type === 'deliverable' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.5rem', borderRadius: 7, background: 'white', border: '1px solid #e5e7eb', marginTop: log.content ? 6 : 0, fontSize: '0.75rem' }}>
                      {log.deliverableType === 'link' ? <Link2 size={12} style={{ color: '#5170ff' }} /> : <FileText size={12} style={{ color: '#8b5cf6' }} />}
                      <span style={{ fontWeight: 500, color: '#1f2937' }}>{log.deliverableName}</span>
                      {log.deliverableSize && <span style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>({log.deliverableSize})</span>}
                    </div>
                  )}
                  {log.type === 'blocker' && log.delayDays && <span style={{ display: 'inline-flex', marginTop: 4, padding: '0.15rem 0.4rem', borderRadius: 5, fontSize: '0.625rem', fontWeight: 600, background: '#ffe4e6', color: '#e11d48' }}>{log.delayDays} days delayed</span>}
                </div>

                {/* Meta row */}
                <div className="card-meta">
                  <span>{log.date}</span>
                  <span style={{ color: '#d1d5db' }}>|</span>
                  {log.session ? (
                    <span style={{ fontWeight: 500, color: '#475569' }}>{log.session}</span>
                  ) : (
                    <span style={{ fontStyle: 'italic' }}>Logged here</span>
                  )}
                </div>

                {/* Expanded: actions + reactions */}
                {isExpanded && (
                  <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9', marginTop: 4, animation: 'fadeSlideIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 8, position: 'relative' }} ref={showReactionPicker === log.id ? reactionRef : null}>
                      {Object.entries(log.reactions || {}).map(([emoji, count]) => {
                        const key = `${log.id}-${emoji}`;
                        const reacted = userReactions[key];
                        return (
                          <button key={emoji} onClick={() => toggleReaction(log.id, emoji)} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '0.2rem 0.4rem', borderRadius: 14, fontSize: '0.6875rem', fontWeight: 500, background: reacted ? '#dbeafe' : '#edf2f9', border: reacted ? '1.5px solid #5170ff' : '1px solid transparent' }}>
                            <span style={{ fontSize: '0.8125rem' }}>{emoji}</span><span style={{ color: '#475569' }}>{count + (reacted ? 1 : 0)}</span>
                          </button>
                        );
                      })}
                      <button onClick={() => setShowReactionPicker(showReactionPicker === log.id ? null : log.id)} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf2f9' }}><Smile size={13} style={{ color: '#64748b' }} /></button>
                      {showReactionPicker === log.id && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, padding: '0.4rem', background: 'white', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #edf2f9', display: 'flex', gap: 3, zIndex: 50 }}>
                          {REACTIONS.map(emoji => (<button key={emoji} onClick={() => toggleReaction(log.id, emoji)} style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{emoji}</button>))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => handleCopy((log.content || log.deliverableName || '').replace(/<[^>]*>/g, ''), log.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.625rem', borderRadius: 7, fontSize: '0.6875rem', fontWeight: 500, color: copiedId === log.id ? '#15bba4' : '#6b7280', background: copiedId === log.id ? '#c6efe9' : '#f1f5f9' }}
                      >{copiedId === log.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}</button>
                      {log.isOwn && log.type !== 'deliverable' && <button onClick={() => handleEdit(log)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.625rem', borderRadius: 7, fontSize: '0.6875rem', fontWeight: 500, color: '#6b7280', background: '#f1f5f9' }}><Edit3 size={12} /> Edit</button>}
                      {log.isOwn && <button onClick={() => handleDelete(log.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.625rem', borderRadius: 7, fontSize: '0.6875rem', fontWeight: 500, color: '#ef4444', background: '#fff1f2' }}><Trash2 size={12} /> Delete</button>}
                      {log.session && log.sessionLink && <a href={log.sessionLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.625rem', borderRadius: 7, fontSize: '0.6875rem', fontWeight: 500, color: '#5170ff', background: '#eef2ff', textDecoration: 'none', marginLeft: 'auto' }}><ExternalLink size={12} /> Session</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Toast */}
        {showShareToast && (
          <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', padding: '0.75rem 1.25rem', borderRadius: 12, background: '#13233d', color: 'white', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 2000, display: 'flex', alignItems: 'center', gap: 8, animation: 'toastIn 0.3s ease-out' }}>
            <Check size={16} /> Link copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
}