'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  BarChart3,
  Users,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function AIAssistantPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm ProgressHub Assistant, your intelligent team analytics assistant. I can help you analyze team reports, identify trends, and provide insights about your team's performance.\n\nHere are some things you can ask me:\n• \"What did the team work on last week?\"\n• \"Who has the most open blockers?\"\n• \"Summarize the latest reports\"\n• \"Show me project workload distribution\"",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedPrompts = [
    { icon: FileText, text: 'Summarize this week\'s reports', color: 'var(--primary-light)' },
    { icon: BarChart3, text: 'Show team productivity trends', color: 'var(--info)' },
    { icon: Users, text: 'Who hasn\'t submitted their report?', color: 'var(--warning)' },
    { icon: AlertTriangle, text: 'List all open blockers', color: 'var(--error)' },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m currently unavailable. Please check your connection and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 'var(--space-lg)', height: 'calc(100vh - 64px)' }}>
      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-base) 0', marginBottom: 'var(--space-base)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>ProgressHub Assistant</h2>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Online
              </div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setMessages([messages[0]])}>
            <RefreshCw size={14} />
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 'var(--space-base) 0',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)',
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 'var(--space-md)',
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, var(--primary), var(--accent-cyan))'
                  : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                color: 'white',
              }}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div style={{
                maxWidth: '75%',
                padding: 'var(--space-base) var(--space-lg)',
                borderRadius: msg.role === 'user' ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                background: msg.role === 'user' ? 'var(--primary-subtle)' : 'var(--bg-card)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(124, 58, 237, 0.2)' : 'var(--border)'}`,
              }}>
                <div style={{
                  fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              }}>
                <Bot size={16} />
              </div>
              <div style={{
                padding: 'var(--space-base) var(--space-lg)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              }}>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)',
            padding: 'var(--space-base) 0',
          }}>
            {suggestedPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    padding: 'var(--space-md) var(--space-base)', background: 'var(--bg-glass)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer',
                    textAlign: 'left', transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => { setInput(prompt.text); inputRef.current?.focus(); }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <Icon size={16} style={{ color: prompt.color, flexShrink: 0 }} />
                  {prompt.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div style={{
          display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end',
          padding: 'var(--space-base) 0',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about team activity, reports, or performance..."
              style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontFamily: 'inherit',
                resize: 'none', minHeight: '44px', maxHeight: '120px',
                transition: 'border-color var(--transition-fast)',
                outline: 'none',
              }}
              rows={1}
              id="ai-chat-input"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ height: '44px', width: '44px', padding: 0, flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Active Context */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Active Context</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { label: 'Team Size', value: '12 members' },
              { label: 'Active Projects', value: '5 projects' },
              { label: 'Report Period', value: 'This Week' },
              { label: 'Data Range', value: 'Last 30 days' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Intelligence Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              { text: 'Team productivity increased 12% this week', color: 'var(--success)', icon: '📈' },
              { text: '3 recurring blockers detected across projects', color: 'var(--warning)', icon: '⚠️' },
              { text: 'Report submission rate at 92% compliance', color: 'var(--info)', icon: '📊' },
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${item.color}`,
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
