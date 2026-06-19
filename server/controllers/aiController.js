const Activity = require('../models/Activity');

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.5';

const safeJsonParse = (value) => {
  try {
    const cleaned = String(value || '').replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
};

const callOpenAI = async (systemPrompt, userPrompt) => {
  if (!process.env.OPENAI_API_KEY) return null;

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.output_text || data.output?.[0]?.content?.[0]?.text || '';
};

const getPasswordScore = (password = '') => {
  let score = 0;
  const checks = {
    length12: password.length >= 12,
    length16: password.length >= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    noSpaces: !/\s/.test(password),
    notCommon: !/(password|admin|qwerty|welcome|tejas|123456|india)/i.test(password)
  };

  score += checks.length12 ? 22 : Math.min(password.length * 1.3, 16);
  score += checks.length16 ? 10 : 0;
  score += checks.uppercase ? 12 : 0;
  score += checks.lowercase ? 12 : 0;
  score += checks.number ? 12 : 0;
  score += checks.symbol ? 16 : 0;
  score += checks.noSpaces ? 6 : 0;
  score += checks.notCommon ? 10 : -10;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const fallbackPasswordAnalysis = (password) => {
  const score = getPasswordScore(password);
  const issues = [];
  const suggestions = [];

  if (password.length < 12) issues.push('Password length is below 12 characters.');
  if (!/[A-Z]/.test(password)) issues.push('Missing uppercase letters.');
  if (!/[a-z]/.test(password)) issues.push('Missing lowercase letters.');
  if (!/\d/.test(password)) issues.push('Missing numbers.');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('Missing special symbols.');
  if (/(password|admin|qwerty|welcome|tejas|123456|india)/i.test(password)) issues.push('Contains common or personal-looking words.');

  suggestions.push('Use 14–18 characters with uppercase, lowercase, numbers and symbols.');
  suggestions.push('Avoid name, birth year, mobile number, college name or simple patterns.');
  suggestions.push('Prefer passphrases like 3 random words plus symbols and numbers.');

  return {
    score,
    strength: score >= 80 ? 'Strong' : score >= 55 ? 'Medium' : 'Weak',
    issues: issues.length ? issues : ['No major rule-based issue found.'],
    suggestions,
    sample: 'Cloud#Tiger27!Mango',
    source: 'Local fallback analysis; add OPENAI_API_KEY for AI explanation.'
  };
};

const analyzePassword = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required' });

  try {
    const prompt = `Analyze this password without storing it: ${password}\nReturn only JSON with keys: score(number 0-100), strength(Weak/Medium/Strong), issues(array), suggestions(array), sample(string safe stronger example).`;
    const output = await callOpenAI(
      'You are a cyber security assistant for a password manager. Return strict JSON only. Never include the original password in your response.',
      prompt
    );

    const parsed = safeJsonParse(output) || fallbackPasswordAnalysis(password);
    await Activity.create({ user_id: req.user._id, activity: 'AI Password Strength Analysis Used' });
    res.json({ ...parsed, source: output ? 'OpenAI' : parsed.source });
  } catch (error) {
    res.json(fallbackPasswordAnalysis(password));
  }
};

const detectPhishing = async (req, res) => {
  const { emailText } = req.body;
  if (!emailText) return res.status(400).json({ message: 'Email text is required' });

  try {
    const output = await callOpenAI(
      'You are a phishing detection assistant. Return strict JSON only. Do not click or browse links.',
      `Check this email for phishing risk. Return JSON keys: riskLevel(Low/Medium/High), confidence(number 0-100), redFlags(array), safeAction(array), summary(string). Email:\n${emailText}`
    );

    const parsed = safeJsonParse(output) || {
      riskLevel: /(urgent|blocked|verify|password|otp|click|bank|prize|winner)/i.test(emailText) ? 'High' : 'Medium',
      confidence: 72,
      redFlags: ['Urgency/sensitive request pattern may be present.'],
      safeAction: ['Do not click links directly.', 'Open the official website manually.', 'Never share OTP or password.'],
      summary: 'Fallback scan completed. Add OPENAI_API_KEY for deeper AI detection.',
      source: 'Local fallback analysis'
    };

    await Activity.create({ user_id: req.user._id, activity: 'AI Phishing Detector Used' });
    res.json({ ...parsed, source: output ? 'OpenAI' : parsed.source });
  } catch (error) {
    res.json({
      riskLevel: 'Medium',
      confidence: 60,
      redFlags: ['Unable to call AI service; fallback safety mode used.'],
      safeAction: ['Do not click suspicious links.', 'Verify from official app or website.'],
      summary: 'AI service unavailable or API key missing.',
      source: 'Local fallback analysis'
    });
  }
};

const securityTips = async (req, res) => {
  const { accountName = 'online account', context = '' } = req.body;

  try {
    const output = await callOpenAI(
      'You are a practical cyber security mentor. Return strict JSON only.',
      `Generate password manager security guidance for ${accountName}. Context: ${context}. Return JSON keys: priorityTips(array), mistakesToAvoid(array), setupChecklist(array).`
    );
    const parsed = safeJsonParse(output) || {
      priorityTips: ['Enable two-factor authentication.', 'Use a unique password for every account.', 'Review saved accounts monthly.'],
      mistakesToAvoid: ['Reusing one password everywhere.', 'Saving OTP or recovery codes as plain text.', 'Using personal details in passwords.'],
      setupChecklist: ['Strong master password', 'Auto logout enabled', 'Backup recovery email updated'],
      source: 'Local fallback tips'
    };

    await Activity.create({ user_id: req.user._id, activity: 'AI Security Tips Generated' });
    res.json({ ...parsed, source: output ? 'OpenAI' : parsed.source });
  } catch (error) {
    res.json({
      priorityTips: ['Use 2FA.', 'Use long unique passwords.', 'Keep recovery details updated.'],
      mistakesToAvoid: ['Password reuse.', 'Sharing passwords on chat.', 'Using simple patterns.'],
      setupChecklist: ['Master password', '2FA', 'Auto logout'],
      source: 'Local fallback tips'
    });
  }
};

module.exports = { analyzePassword, detectPhishing, securityTips };
