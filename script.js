/* =========================================================
   CYBER SECURITY AWARENESS QUIZ 
   ========================================================= */

const STORAGE_KEY = 'cyberQuizState_v2';

/* Answer values are stored base64-encoded so they are not plain-readable
   in the source file. This is basic obfuscation, not real security —
   anyone who decodes it in devtools can still see it, but it stops
   answers from being spotted at a glance in "View Source". */
function _d(s) { return atob(s); }
function _db(s) { return atob(s) === '1'; }

const SECTION_ORDER = ['home', 'rules', 'video', 'quiz', 'password', 'scam', 'apps', 'final'];

const defaultState = {
  section: 'home',
  userName: '',
  quizAnswers: {},      // { q1: true/false correctness }
  passwordsCreated: 0,
  scamIndex: 0,
  scamAnswered: false,
  appProgress: {}
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(defaultState)), parsed);
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = JSON.parse(JSON.stringify(defaultState));
  saveState();
}

/* ---------------------------------------------------------
   HOME: terminal boot line + name capture
--------------------------------------------------------- */
function typeTerminalLine() {
  const el = document.getElementById('typedLine');
  if (!el) return;
  const msg = 'initializing cyber_awareness_module...';
  let i = 0;
  el.textContent = '';
  const interval = setInterval(() => {
    el.textContent += msg[i];
    i++;
    if (i >= msg.length) clearInterval(interval);
  }, 35);
}

function initNameCapture() {
  const input = document.getElementById('userNameInput');
  const warning = document.getElementById('nameWarning');
  if (state.userName) input.value = state.userName;

  input.addEventListener('input', () => {
    state.userName = input.value.trim();
    saveState();
    warning.classList.add('hidden');
  });
}

function handleStartClick() {
  const input = document.getElementById('userNameInput');
  const warning = document.getElementById('nameWarning');
  const name = input.value.trim();
  if (!name) {
    warning.classList.remove('hidden');
    input.focus();
    return;
  }
  state.userName = name;
  saveState();
  updateFinalNameDisplay();
  goTo('rules');
}

function updateFinalNameDisplay() {
  const el = document.getElementById('finalNameDisplay');
  if (!el) return;
  el.textContent = state.userName ? `, ${state.userName}` : '';
}

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */
function goTo(sectionId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + sectionId);
  if (target) target.classList.add('active');
  state.section = sectionId;
  saveState();
  updateTopbar(sectionId);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (sectionId === 'final') startConfetti();
}

const STAGE_LABELS = {
  home: 'Home',
  rules: 'Safety Rules',
  video: 'Level 1 · Video',
  quiz: 'Level 1 · Quiz',
  password: 'Level 2 · Passwords',
  scam: 'Level 3 · Scam or Not',
  apps: 'Level 4 · App Security',
  final: 'Complete'
};

function updateTopbar(sectionId) {
  const idx = SECTION_ORDER.indexOf(sectionId);
  const pct = (idx / (SECTION_ORDER.length - 1)) * 100;
  document.getElementById('globalProgressFill').style.width = pct + '%';
  document.getElementById('stageLabel').textContent = STAGE_LABELS[sectionId] || '';
}

/* ---------------------------------------------------------
   PAGE 2: SAFETY RULES
--------------------------------------------------------- */
const RULES = [
  'Never reveal your OTP.',
  'Use strong passwords.',
  'Enable Two-Factor Authentication.',
  'Avoid suspicious links.',
  'Keep applications updated.',
  'Install apps only from official app stores.',
  'Protect your personal information.',
  'Think before clicking.',
  'Never scan QR Codes to receive money.',
  'Report Cyber Crime to 1930.'
];

function renderRules() {
  const grid = document.getElementById('rulesGrid');
  grid.innerHTML = RULES.map((rule, i) => `
    <div class="rule-card">
      <div class="rule-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="rule-text">${rule}</div>
    </div>
  `).join('');
}

/* ---------------------------------------------------------
   PAGE 4: PHISHING QUIZ
--------------------------------------------------------- */
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    type: 'text',
    text: "Liam received a phone call claiming to be from which bank?",
    answer: _d('d29vZmxheXM=')
  },
  {
    id: 'q2',
    type: 'textarea',
    text: "What problem did the scammer claim was happening with Liam's account?",
    keywords: ['YWNjZXNz', 'YWNjb3VudA==', 'ZGV0YWlscw==', 'c3RvcA=='].map(_d)
  },
  {
    id: 'q3',
    type: 'radio',
    text: 'Which psychological trick did the scammer use?',
    options: ['Fear', 'Greed', 'Curiosity', 'Trust'],
    answer: _d('RmVhcg==')
  },
  {
    id: 'q4',
    type: 'radio',
    text: 'Which phishing attack was shown?',
    options: ['Vishing', 'Smishing', 'Email Phishing', 'QR Code Scam'],
    answer: _d('VmlzaGluZw==')
  },
  {
    id: 'q5',
    type: 'radio',
    text: 'If someone claims to be from your bank or family and asks for personal information, what should you do first?',
    options: ['Trust immediately', 'Share personal information', 'Cross-check their identity through an official source', 'Ignore every phone call'],
    answer: _d('Q3Jvc3MtY2hlY2sgdGhlaXIgaWRlbnRpdHkgdGhyb3VnaCBhbiBvZmZpY2lhbCBzb3VyY2U=')
  }
];

function renderQuiz() {
  const list = document.getElementById('quizList');
  list.innerHTML = QUIZ_QUESTIONS.map((q, i) => {
    let inputHtml = '';
    if (q.type === 'text') {
      inputHtml = `<input type="text" class="q-input" id="input-${q.id}" placeholder="Type your answer...">`;
    } else if (q.type === 'textarea') {
      inputHtml = `<textarea class="q-textarea" rows="3" id="input-${q.id}" placeholder="Type your answer..."></textarea>`;
    } else if (q.type === 'radio') {
      inputHtml = `<div class="q-options">${q.options.map((opt, oi) => `
        <label class="q-option">
          <input type="radio" name="${q.id}" value="${opt}">
          ${opt}
        </label>`).join('')}</div>`;
    }
    return `
      <div class="quiz-card" id="card-${q.id}">
        <div class="q-num">QUESTION ${i + 1}</div>
        <div class="q-text">${q.text}</div>
        ${inputHtml}
        <div class="q-feedback" id="feedback-${q.id}"></div>
        <div class="nav-row" style="margin-top:16px;">
          <button class="btn btn-secondary" data-check="${q.id}">Check Answer</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-check]').forEach(btn => {
    btn.addEventListener('click', () => checkQuizAnswer(btn.getAttribute('data-check')));
  });

  // restore previously correct answers
  QUIZ_QUESTIONS.forEach(q => {
    if (state.quizAnswers[q.id]) markQuizCorrect(q.id, true);
  });
  updateQuizNextVisibility();
}

function checkQuizAnswer(id) {
  const q = QUIZ_QUESTIONS.find(x => x.id === id);
  let correct = false;
  let userVal = '';

  if (q.type === 'text') {
    userVal = document.getElementById(`input-${id}`).value.trim().toLowerCase();
    correct = userVal.length > 0 && userVal.includes(q.answer);
  } else if (q.type === 'textarea') {
    userVal = document.getElementById(`input-${id}`).value.trim().toLowerCase();
    const hits = q.keywords.filter(k => userVal.includes(k)).length;
    correct = userVal.length > 15 && hits >= 2;
  } else if (q.type === 'radio') {
    const checked = document.querySelector(`input[name="${id}"]:checked`);
    userVal = checked ? checked.value : '';
    correct = userVal === q.answer;
  }

  const fb = document.getElementById(`feedback-${id}`);
  if (correct) {
    fb.textContent = '✅ Correct!';
    fb.className = 'q-feedback ok';
    state.quizAnswers[id] = true;
    markQuizCorrect(id, true);
  } else {
    fb.textContent = '❌ Not quite — try again.';
    fb.className = 'q-feedback bad';
    state.quizAnswers[id] = false;
  }
  saveState();
  updateQuizNextVisibility();
}

function markQuizCorrect(id, correct) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  if (correct) {
    card.classList.add('correct');
    const fb = document.getElementById(`feedback-${id}`);
    fb.textContent = '✅ Correct!';
    fb.className = 'q-feedback ok';
  }
}

function updateQuizNextVisibility() {
  const allCorrect = QUIZ_QUESTIONS.every(q => state.quizAnswers[q.id] === true);
  document.getElementById('quizNextBtn').classList.toggle('hidden', !allCorrect);
}

/* ---------------------------------------------------------
   PAGE 5: PASSWORD SECURITY
--------------------------------------------------------- */
function evaluatePassword(pw) {
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw)
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

const usedPasswords = new Set();

function initPasswordLab() {
  const input = document.getElementById('pwInput');
  const submitBtn = document.getElementById('pwSubmitBtn');
  const feedback = document.getElementById('pwFeedback');

  updatePwCounterUI();

  input.addEventListener('input', () => {
    const { checks, score } = evaluatePassword(input.value);
    Object.keys(checks).forEach(key => {
      const el = document.querySelector(`.req[data-req="${key}"]`);
      el.classList.toggle('met', checks[key]);
    });

    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    let pct = (score / 5) * 100;
    fill.style.width = pct + '%';

    if (score <= 2) { fill.style.background = 'var(--accent)'; label.textContent = 'Weak'; label.style.color = 'var(--accent)'; }
    else if (score <= 4) { fill.style.background = '#ffb84d'; label.textContent = 'Medium'; label.style.color = '#ffb84d'; }
    else { fill.style.background = '#2ee6a8'; label.textContent = 'Strong'; label.style.color = '#2ee6a8'; }

    feedback.textContent = '';
  });

  submitBtn.addEventListener('click', () => {
    const pw = input.value;
    const { score } = evaluatePassword(pw);

    if (score < 5) {
      feedback.textContent = 'This password does not meet all 5 requirements yet.';
      return;
    }
    if (usedPasswords.has(pw)) {
      feedback.textContent = 'You already used this password — try a different one.';
      return;
    }
    usedPasswords.add(pw);
    state.passwordsCreated = Math.min(5, state.passwordsCreated + 1);
    saveState();
    updatePwCounterUI();
    feedback.textContent = `✅ Strong password saved! (${state.passwordsCreated}/5)`;
    feedback.style.color = '#2ee6a8';
    input.value = '';
    input.dispatchEvent(new Event('input'));

    if (state.passwordsCreated >= 5) {
      document.getElementById('passwordNextBtn').classList.remove('hidden');
    }
  });
}

function updatePwCounterUI() {
  document.getElementById('pwCounterText').textContent = `${state.passwordsCreated} / 5`;
  document.getElementById('pwCounterFill').style.width = `${(state.passwordsCreated / 5) * 100}%`;
  if (state.passwordsCreated >= 5) {
    document.getElementById('passwordNextBtn').classList.remove('hidden');
  }
}

/* ---------------------------------------------------------
   PAGE 6: SCAM OR NOT
--------------------------------------------------------- */
const SCENARIOS = [
  { type: 'SMS', sender: 'Unknown Number', body: 'Your bank account has been blocked.\nClick here immediately to verify.', isScam: _db('MQ=='),
    explain: 'Banks never ask you to "click here immediately" via SMS to unblock an account. This urgency + unknown link combo is classic phishing.' },

    { type: 'WhatsApp', sender: 'System Message', body: 'Your login verification code is\n839512\nDo not share this code.', isScam: _db('MA=='),
    explain: 'This is a legitimate one-time code notification that explicitly warns you not to share it — the safe, expected behavior.' },

  { type: 'WhatsApp', sender: 'Unknown Contact', body: 'Congratulations! 🎉\nYou won an iPhone.\nClick here to claim.', isScam: _db('MQ=='),
    explain: 'You cannot win a contest you never entered. This is a lottery scam designed to steal your data or money.' },

  { type: 'Phone Call', sender: 'Caller ID: "Bank"', body: 'I am calling from your bank.\nPlease tell me your OTP.', isScam: _db('MQ=='),
    explain: 'No genuine bank employee will ever ask for your OTP over the phone. This is vishing (voice phishing).' },

    { type: 'College Notice', sender: 'College Admin', body: 'Mid Semester Examination starts from Monday.', isScam: _db('MA=='),
    explain: 'A routine academic notice with no financial request, urgency trick, or suspicious link.' },

      { type: 'Bank Alert', sender: 'Official Bank Sender ID', body: '₹1000 debited from your account.\nIf unauthorized, contact official customer care.', isScam: _db('MA=='),
    explain: 'This tells you what to do through official channels rather than asking you to click a link or share details directly.' },

  { type: 'QR Code', sender: 'Street Stall Poster', body: 'Scan this QR to receive ₹5000 cashback.', isScam: _db('MQ=='),
    explain: 'Scanning a QR code only sends money — it never receives money. Any QR that promises to "give" you cash by scanning is a scam.' },

  { type: 'Delivery Message', sender: 'Unknown Sender', body: 'Your parcel is delayed.\nClick this unknown link to reschedule.', isScam: _db('MQ=='),
    explain: 'Delivery scams use urgency around a package to trick you into clicking malicious links. Always track parcels via the official app.' },

  { type: 'UPI Message', sender: 'Bank UPI Alert', body: '₹450 received successfully in your account.', isScam: _db('MA=='),
    explain: 'A simple transaction confirmation with no request for OTP, PIN, or any action from you.' },

  { type: 'Customer Care', sender: '"Support Executive"', body: 'I will remotely fix your banking problem.\nPlease install AnyDesk.', isScam: _db('MQ=='),
    explain: 'Asking you to install a remote-access app gives a stranger full control of your device and banking apps. Never install these on request.' },

  { type: 'AI Voice Call', sender: '"Family Member"', body: 'Your brother met with an accident.\nTransfer money immediately.', isScam: _db('MQ=='),
    explain: 'AI voice cloning can mimic a relative\'s voice to create panic. Always verify by calling the person back on their known number.' },

    { type: 'Google Alert', sender: 'Google (no-reply@google.com)', body: 'New sign-in detected.\nReview activity on your official Google account.', isScam: _db('MA=='),
    explain: 'This is a standard security notification prompting you to check your own account activity directly — not asking for a password.' },
  { type: 'Amazon', sender: 'Amazon Shipping Updates', body: 'Your order has been shipped.\nTrack your package in the app.', isScam: _db('MA=='),
    explain: 'A normal shipping update that directs you to check status within the official app, with no suspicious link or payment request.' },

  { type: 'Investment', sender: 'Telegram Group', body: 'Invest ₹5000 today.\nGet ₹50000 tomorrow, guaranteed!', isScam: _db('MQ=='),
    explain: 'Guaranteed 10x overnight returns are impossible in legitimate investing. This is a classic Ponzi/investment scam.' },
  { type: 'SIM Block SMS', sender: 'Unknown Number', body: 'Your SIM will be blocked today.\nUpdate your KYC here.', isScam: _db('MQ=='),
    explain: 'Telecom operators never ask for KYC updates through random SMS links. This is a smishing attempt to steal your data.' },
      { type: 'Electricity Bill Reminder', sender: 'State Electricity Board', body: 'Please pay your monthly electricity bill through the official portal.', isScam: _db('MA=='),
    explain: 'This directs you to the official portal rather than an unknown link, and makes no urgent threats — a normal utility reminder.' },
  
  { type: 'Prize Winner', sender: 'Unknown Sender', body: 'You have won ₹25 Lakhs in a lucky draw!\nPay ₹999 registration fee to claim.', isScam: _db('MQ=='),
    explain: 'Genuine prizes never require you to pay a fee first. Asking for upfront "registration" money is a clear scam sign.' },
  { type: 'Instagram DM', sender: '"Brand Partnerships"', body: 'We would love a collaboration!\nClick this shortened link to proceed.', isScam: _db('MQ=='),
    explain: 'Unsolicited brand deals with shortened, unverifiable links are commonly used to steal Instagram login credentials.' },
  { type: 'Public WiFi Popup', sender: 'Free_Airport_WiFi', body: 'Free WiFi available.\nLogin using your Google account password.', isScam: _db('MQ=='),
    explain: 'Legitimate WiFi portals never ask for your Google password. This is a credential-harvesting trap on public networks.' },
  { type: 'Official School Notice', sender: 'School Admin (Verified)', body: "Tomorrow's classes are cancelled due to heavy rain.", isScam: _db('MA=='),
    explain: 'A routine, verified announcement from an official school channel with no request for money, links, or personal data.' }



  
  
];

function renderScenario() {
  const idx = state.scamIndex;
  const total = SCENARIOS.length;
  document.getElementById('scamIndexText').textContent = Math.min(idx + 1, total);

  if (idx >= total) {
    document.getElementById('scenarioCard').innerHTML = `<p style="text-align:center;color:var(--text-dim);">All scenarios complete.</p>`;
    document.getElementById('scamChoices').classList.add('hidden');
    document.getElementById('scamResult').classList.add('hidden');
    document.getElementById('scamNextBtn').classList.remove('hidden');
    return;
  }

  const s = SCENARIOS[idx];
  document.getElementById('scenarioCard').innerHTML = `
    <div class="scenario-type">${s.type}</div>
    <div class="scenario-sender">${s.sender}</div>
    <div class="scenario-body">${s.body}</div>
  `;
  document.getElementById('scamChoices').classList.remove('hidden');
  document.getElementById('scamResult').classList.add('hidden');
  document.getElementById('scamNextBtn').classList.add('hidden');
}

function answerScenario(userSaysScam) {
  const s = SCENARIOS[state.scamIndex];
  const correct = userSaysScam === s.isScam;

  document.getElementById('scamChoices').classList.add('hidden');
  const resultBox = document.getElementById('scamResult');
  resultBox.classList.remove('hidden');

  const verdict = document.getElementById('resultVerdict');
  const explain = document.getElementById('resultExplain');
  verdict.textContent = correct ? '✅ Correct' : '❌ Wrong';
  verdict.className = 'result-verdict ' + (correct ? 'ok' : 'bad');
  explain.textContent = `${s.isScam ? 'This was a SCAM.' : 'This was NOT a scam.'} ${s.explain}`;
}

function nextScenario() {
  state.scamIndex += 1;
  saveState();
  renderScenario();
  if (state.scamIndex >= SCENARIOS.length) {
    document.getElementById('scamNextBtn').classList.remove('hidden');
  }
}

/* ---------------------------------------------------------
   PAGE 7: APP SECURITY SETTINGS
--------------------------------------------------------- */
/* Brand glyphs sourced locally from the Simple Icons project (CC0 licensed,
   https://simpleicons.org) — monochrome identification icons, not official
   marketing logos. fill uses currentColor so CSS controls the color. */
const ICON_SVGS = {
  google: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>',
  whatsapp: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
  instagram: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>',
  facebook: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
  snapchat: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>',
  telegram: '<svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
};

const APPS = [
  { id: 'google', name: 'Google', icon: ICON_SVGS.google, items: [
      'Enable Two-Step Verification',
      'Add Recovery Email',
      'Add Recovery Phone Number',
      'Review Recent Login Activity'
  ]},
  { id: 'whatsapp', name: 'WhatsApp', icon: ICON_SVGS.whatsapp, items: [
      'Turn ON Two-Step Verification',
      'Add Recovery Email',
      'Enable Fingerprint Lock',
      'Review Linked Devices'
  ]},
  { id: 'instagram', name: 'Instagram', icon: ICON_SVGS.instagram, items: [
      'Enable Two-Factor Authentication',
      'Enable Login Alerts',
      'Make Account Private',
      'Review Login Activity'
  ]},
  { id: 'facebook', name: 'Facebook', icon: ICON_SVGS.facebook, items: [
      'Enable Two-Factor Authentication',
      'Privacy Checkup',
      'Login Alerts',
      'Trusted Contacts'
  ]},
  { id: 'snapchat', name: 'Snapchat', icon: ICON_SVGS.snapchat, items: [
      'Enable Login Verification',
      'Verify Email',
      'Ghost Mode Settings',
      'Review Connected Devices'
  ]},
  { id: 'telegram', name: 'Telegram', icon: ICON_SVGS.telegram, items: [
      'Enable Two-Step Verification',
      'Active Sessions Review',
      'Privacy Settings',
      'Passcode Lock'
  ]}
];

function renderApps() {
  const container = document.getElementById('appsAccordion');
  container.innerHTML = APPS.map(app => {
    const progress = state.appProgress[app.id] || [];
    const allDone = progress.length === app.items.length;
    return `
      <div class="app-card ${allDone ? 'secured' : ''}" id="app-${app.id}">
        <div class="app-header" data-toggle="${app.id}">
          <div class="app-name"><span class="app-icon-svg">${app.icon}</span>${app.name}</div>
          <div style="display:flex;align-items:center;gap:14px;">
            <span class="app-status ${allDone ? 'done' : ''}" id="status-${app.id}">${progress.length}/${app.items.length}</span>
            <span class="app-chevron">▾</span>
          </div>
        </div>
        <div class="app-body">
          <div class="app-body-inner">
            ${app.items.map((item, i) => `
              <label class="app-check">
                <input type="checkbox" data-app="${app.id}" data-idx="${i}" ${progress.includes(i) ? 'checked' : ''}>
                ${item}
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const card = document.getElementById('app-' + header.getAttribute('data-toggle'));
      card.classList.toggle('open');
    });
  });

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const appId = cb.getAttribute('data-app');
      const idx = parseInt(cb.getAttribute('data-idx'), 10);
      if (!state.appProgress[appId]) state.appProgress[appId] = [];
      const arr = state.appProgress[appId];
      const pos = arr.indexOf(idx);
      if (cb.checked && pos === -1) arr.push(idx);
      if (!cb.checked && pos !== -1) arr.splice(pos, 1);
      saveState();
      updateAppCardUI(appId);
      updateAppsOverallProgress();
    });
  });

  updateAppsOverallProgress();
}

function updateAppCardUI(appId) {
  const app = APPS.find(a => a.id === appId);
  const progress = state.appProgress[appId] || [];
  const card = document.getElementById('app-' + appId);
  const status = document.getElementById('status-' + appId);
  const allDone = progress.length === app.items.length;
  status.textContent = `${progress.length}/${app.items.length}`;
  status.classList.toggle('done', allDone);
  card.classList.toggle('secured', allDone);
}

function updateAppsOverallProgress() {
  const securedCount = APPS.filter(app => {
    const progress = state.appProgress[app.id] || [];
    return progress.length === app.items.length;
  }).length;

  document.getElementById('appsCounterText').textContent = `${securedCount} / 6 Apps Secured`;
  document.getElementById('appsProgressFill').style.width = `${(securedCount / 6) * 100}%`;
  document.getElementById('finishBtn').classList.toggle('hidden', securedCount < 6);
}

/* ---------------------------------------------------------
   FINAL PAGE — CONFETTI
--------------------------------------------------------- */
let confettiRunning = false;
function startConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#00F5FF', '#FF4D4D', '#2ee6a8', '#ffffff', '#ffb84d'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 2 + 1.5,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8
  }));

  let frame = 0;
  const maxFrames = 480;

  function draw() {
    if (!confettiRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames && document.getElementById('page-final').classList.contains('active')) {
      requestAnimationFrame(draw);
    } else {
      confettiRunning = false;
    }
  }
  draw();
}

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
function init() {
  renderRules();
  renderQuiz();
  initPasswordLab();
  renderScenario();
  renderApps();
  initNameCapture();
  typeTerminalLine();
  updateFinalNameDisplay();

  document.getElementById('startBtn').addEventListener('click', handleStartClick);
  document.getElementById('rulesContinueBtn').addEventListener('click', () => goTo('video'));
  document.getElementById('videoNextBtn').addEventListener('click', () => goTo('quiz'));
  document.getElementById('quizNextBtn').addEventListener('click', () => goTo('password'));
  document.getElementById('passwordNextBtn').addEventListener('click', () => goTo('scam'));
  document.getElementById('scamBtnYes').addEventListener('click', () => answerScenario(true));
  document.getElementById('scamBtnNo').addEventListener('click', () => answerScenario(false));
  document.getElementById('scamContinueBtn').addEventListener('click', nextScenario);
  document.getElementById('scamNextBtn').addEventListener('click', () => goTo('apps'));
  document.getElementById('finishBtn').addEventListener('click', () => goTo('final'));
  document.getElementById('restartBtn').addEventListener('click', () => {
    resetState();
    location.reload();
  });

  // Restore saved section (but always allow re-visiting; start user where they left off)
  goTo(state.section || 'home');
}

document.addEventListener('DOMContentLoaded', init);
