const { useState, useEffect, useCallback, useMemo, useRef } = React;

/* ============================================
   ChatWidget — 对齐 WS /api/chat
   ============================================ */
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', content: '你好！我是软通新闻AI助手，可以帮你查询新闻、回答问题。有什么想了解的？', sources: [] }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const nextId = useRef(1);
  const wsRef = useRef(null);
  const sessionIdRef = useRef(null);
  const currentAssistantIdRef = useRef(null);

  useEffect(() => {
    if (open) {
      msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, thinking, open]);

  // WebSocket 连接管理 — 返回 Promise，确保连接已打开
  const getWs = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return Promise.resolve(wsRef.current);
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${location.host}${BASE}/api/chat`);
    wsRef.current = ws;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        wsRef.current = null;
        reject(new Error('WebSocket 连接超时'));
      }, 5000);
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'token') {
            const aid = currentAssistantIdRef.current;
            if (aid !== null) {
              setMessages(prev => prev.map(m =>
                m.id === aid ? { ...m, content: (m.content || '') + data.content } : m
              ));
            }
          } else if (data.type === 'sources') {
            const aid = currentAssistantIdRef.current;
            if (aid !== null) {
              setMessages(prev => prev.map(m =>
                m.id === aid ? { ...m, sources: data.news } : m
              ));
            }
          } else if (data.type === 'done') {
            if (data.sessionId) sessionIdRef.current = data.sessionId;
            setThinking(false);
            currentAssistantIdRef.current = null;
          } else if (data.type === 'error') {
            setThinking(false);
            currentAssistantIdRef.current = null;
          }
        };
        ws.onerror = () => { setThinking(false); };
        resolve(ws);
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        wsRef.current = null;
        reject(new Error('WebSocket 连接失败'));
      };
    });
  }, []);

  // 清理 WebSocket
  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const uid = nextId.current++;
    const aid = nextId.current++;
    currentAssistantIdRef.current = aid;
    setMessages(prev => [...prev,
      { id: uid, role: 'user', content: text },
      { id: aid, role: 'assistant', content: '', sources: [] },
    ]);
    setInput('');
    setThinking(true);
    try {
      const ws = await getWs();
      ws.send(JSON.stringify({
        type: 'message',
        content: text,
        sessionId: sessionIdRef.current || undefined,
      }));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aid ? { ...m, content: '连接失败，请稍后重试。' } : m
      ));
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} aria-label="智能问答" style={{
        position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)',
        width: 56, height: 56, borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-400))',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-overlay)',
        transition: 'transform var(--duration-fast) var(--ease-spring)',
        transform: open ? 'scale(0.9)' : 'scale(1)',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 'calc(var(--space-6) + 72px)', right: 'var(--space-6)',
          width: 360, height: 500,
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'var(--shadow-xl)', zIndex: 'var(--z-modal)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp var(--duration-normal) var(--ease-spring)',
        }}>
          {/* Header */}
          <div style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>智能问答</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="关闭对话" style={{
              color: 'var(--text-tertiary)', fontSize: 'var(--text-lg)',
            }}>&times;</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: 'var(--space-4)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%', padding: 'var(--space-3) var(--space-4)',
                  borderRadius: msg.role === 'user'
                    ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                  background: msg.role === 'user' ? 'var(--color-brand-500)' : 'var(--bg-elevated)',
                  fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)',
                }}>
                  {msg.role === 'assistant' ? (
                    <div className="chat-markdown"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content)) }}
                    />
                  ) : msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {msg.sources.map(src => (
                        <a key={src.id} href={src.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
                          display: 'block', padding: 'var(--space-2) var(--space-3)',
                          background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)', color: 'var(--color-brand-300)',
                          textDecoration: 'none', lineHeight: 'var(--leading-snug)',
                        }}>📄 {src.title}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)',
                        animation: `typingDot 1.4s ${i * 0.2}s infinite ease-in-out`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 'var(--space-2)', flexShrink: 0,
          }}>
            <input ref={inputRef} type="text" value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="输入问题..." disabled={thinking} aria-label="输入问题"
              style={{
                flex: 1, padding: 'var(--space-2) var(--space-3)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', outline: 'none',
              }}
            />
            <button onClick={handleSend} disabled={thinking || !input.trim()} aria-label="发送"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                background: input.trim() && !thinking ? 'var(--color-brand-500)' : 'var(--bg-elevated)',
                color: input.trim() && !thinking ? '#fff' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all var(--duration-fast)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
