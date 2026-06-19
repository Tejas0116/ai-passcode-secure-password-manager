import React, { useState } from 'react';

const PasswordGenerator = ({ onGenerate }) => {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const generatePassword = () => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (!charset) {
      alert('Please select at least one character type!');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    onGenerate(password);
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.25)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Generator Length: {length}</span>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          style={{ width: '60%', accentColor: 'var(--primary)' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} />
          Uppercase (A-Z)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} />
          Lowercase (a-z)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
          Numbers (0-9)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
          Symbols (!@#)
        </label>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={generatePassword}
        style={{ padding: '6px 12px', fontSize: '0.85rem', width: '100%' }}
      >
        <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
