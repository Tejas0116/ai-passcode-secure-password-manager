import React, { useState } from 'react';
import axios from 'axios';

const ResultList = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: '14px' }}>
      <h5 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{title}</h5>
      <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
};

const AITools = ({ addToast }) => {
  const [password, setPassword] = useState('');
  const [emailText, setEmailText] = useState('');
  const [accountName, setAccountName] = useState('Google Account');
  const [context, setContext] = useState('student password manager project');
  const [loadingTool, setLoadingTool] = useState('');
  const [passwordResult, setPasswordResult] = useState(null);
  const [phishingResult, setPhishingResult] = useState(null);
  const [tipsResult, setTipsResult] = useState(null);

  const runTool = async (toolName, request, setter, successMessage) => {
    try {
      setLoadingTool(toolName);
      const { data } = await request();
      setter(data);
      addToast(successMessage, 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'AI tool failed', 'danger');
    } finally {
      setLoadingTool('');
    }
  };

  const cardStyle = {
    padding: '24px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.35))',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.24)'
  };

  const scoreColor = (score) => score >= 80 ? 'var(--success)' : score >= 55 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1150px' }}>
      <div className="glass" style={{ padding: '28px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.82rem' }}>AI Security Lab</p>
            <h2 style={{ fontSize: '2rem', marginTop: '6px' }}>Smart protection for your vault</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Password strength explanation, phishing detection and personalized security checklist powered by OpenAI-ready backend.</p>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(0,247,255,0.08)', border: '1px solid rgba(0,247,255,0.22)', color: 'var(--primary)', fontWeight: 700 }}>
            Unique MCA Feature ✨
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '12px' }}>🔐 AI Password Strength Analyzer</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Shows score, weak points and stronger example.</p>
          <input
            type="text"
            className="form-control"
            placeholder="Enter password to analyze"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loadingTool === 'password'}
            onClick={() => runTool('password', () => axios.post('/api/ai/password-analysis', { password }), setPasswordResult, 'Password analyzed')}
          >
            {loadingTool === 'password' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>} Analyze
          </button>

          {passwordResult && (
            <div style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <strong>{passwordResult.strength}</strong>
                <span style={{ color: scoreColor(passwordResult.score), fontWeight: 800 }}>{passwordResult.score}/100</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${passwordResult.score || 0}%`, height: '100%', background: scoreColor(passwordResult.score) }}></div>
              </div>
              <ResultList title="Issues" items={passwordResult.issues} />
              <ResultList title="Suggestions" items={passwordResult.suggestions} />
              {passwordResult.sample && <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}><b>Sample:</b> {passwordResult.sample}</p>}
              <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {passwordResult.source}</p>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginBottom: '12px' }}>📧 AI Phishing Email Detector</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Paste suspicious email/SMS text and check risk level.</p>
          <textarea
            className="form-control"
            rows="7"
            placeholder="Paste suspicious email text here..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loadingTool === 'phishing'}
            onClick={() => runTool('phishing', () => axios.post('/api/ai/phishing-detection', { emailText }), setPhishingResult, 'Email scanned')}
          >
            {loadingTool === 'phishing' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-shield-halved"></i>} Scan Email
          </button>

          {phishingResult && (
            <div style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Risk: {phishingResult.riskLevel}</strong>
                <span style={{ color: phishingResult.riskLevel === 'High' ? 'var(--danger)' : phishingResult.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)', fontWeight: 800 }}>{phishingResult.confidence}%</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{phishingResult.summary}</p>
              <ResultList title="Red Flags" items={phishingResult.redFlags} />
              <ResultList title="Safe Action" items={phishingResult.safeAction} />
              <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {phishingResult.source}</p>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginBottom: '12px' }}>🧠 AI Security Tips Generator</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Generates account-specific security checklist for viva/demo.</p>
          <input
            type="text"
            className="form-control"
            placeholder="Account name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <textarea
            className="form-control"
            rows="4"
            style={{ marginTop: '12px' }}
            placeholder="Context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loadingTool === 'tips'}
            onClick={() => runTool('tips', () => axios.post('/api/ai/security-tips', { accountName, context }), setTipsResult, 'Security tips generated')}
          >
            {loadingTool === 'tips' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-lightbulb"></i>} Generate Tips
          </button>

          {tipsResult && (
            <div style={{ marginTop: '18px' }}>
              <ResultList title="Priority Tips" items={tipsResult.priorityTips} />
              <ResultList title="Mistakes to Avoid" items={tipsResult.mistakesToAvoid} />
              <ResultList title="Setup Checklist" items={tipsResult.setupChecklist} />
              <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Source: {tipsResult.source}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITools;
