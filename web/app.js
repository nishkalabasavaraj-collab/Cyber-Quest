const $ = (selector) => document.querySelector(selector);
const views = [$('#authView'), $('#dashboardView'), $('#gameView'), $('#infoView')];
let mode = 'login';
let player = null;
let timer = null;
let currentRound = null;

const quiz = [
  ['Password Security','Which choice is the strongest password habit?',['Reuse one long password','Use a unique passphrase for each account','Share it with a friend','Save it in a public note'],1,'Unique passwords limit the damage if one account is exposed. A password manager can help remember them.'],
  ['Phishing Awareness','An email asks you to urgently verify your account through an unfamiliar link. What should you do?',['Click quickly before it expires','Reply with your details','Open the official site separately and check there','Forward it to everyone'],2,'Urgency and an unexpected link are warning signs. Visit the known official site directly.'],
  ['Network Security','What does HTTPS mainly help protect?',['The connection between your browser and a website','Your device from every kind of malware','Your password after you share it','Your Wi-Fi signal from being seen'],0,'HTTPS encrypts data in transit between your browser and the website.'],
  ['Malware Awareness','A file arrives unexpectedly from an unknown sender. What is safest?',['Open it to see what it is','Download it on another computer','Do not open it; verify the sender through another channel','Rename the file'],2,'Unexpected attachments can contain malware. Verify before opening and report suspicious messages.'],
  ['Cryptography Basics','Encryption is used to…',['Turn readable information into protected data using a key','Delete all copies of a file','Make a password easier to guess','Speed up a network'],0,'Encryption makes data unreadable without the right key.'],
  ['Cybersecurity Fundamentals','What is multi-factor authentication (MFA)?',['Using a longer username','Using two or more different kinds of proof to sign in','Changing your screen brightness','Signing in twice with the same password'],1,'MFA combines factors such as something you know and something you have.'],
  ['Password Security','Why should you avoid password reuse?',['It slows down your device','A stolen password could unlock other accounts','It makes your username public','It disables updates'],1,'If a service is breached, reused passwords can put other accounts at risk.'],
  ['Phishing Awareness','A message says you won a prize you never entered. What is a sensible response?',['Share your bank details to claim it','Treat it as suspicious and verify independently','Download its claim form','Send your password to support'],1,'Unexpected prizes paired with requests for data are common scam signals.'],
  ['Network Security','Which is safer on public Wi-Fi?',['Use trusted sites and avoid sensitive tasks on unknown networks','Turn off your device updates','Share the network password online','Disable your device lock'],0,'Public networks may be untrusted. Use secure connections and postpone sensitive work if unsure.'],
  ['Malware Awareness','What is a software update often important for?',['Adding security fixes','Making all passwords public','Removing account permissions','Stopping backups'],0,'Updates often fix vulnerabilities that attackers could otherwise exploit.'],
  ['Cryptography Basics','A digital signature can help verify…',['Who sent a file and whether it changed','The sender’s physical location','That a file is harmless in every way','A password’s length'],0,'A signature helps verify authenticity and integrity, but does not guarantee safety.'],
  ['Cybersecurity Fundamentals','What is the principle of least privilege?',['Give accounts only the access they need','Give every user administrator access','Use the same account for everyone','Disable account reviews'],0,'Limiting access reduces the possible impact of mistakes or compromised accounts.'],
  ['Password Security','Which is a safer place to keep passwords?',['A password manager protected by a strong master password','A public shared document','A sticky note on a monitor','A message sent to a group chat'],0,'A reputable password manager can create and store unique passwords securely.'],
  ['Phishing Awareness','The sender address looks almost like your school address but has an extra character. What does that suggest?',['A possible impersonation','The email is definitely safe','The message was encrypted','The sender knows your password'],0,'Lookalike sender addresses are a common way to impersonate trusted organizations.'],
  ['Network Security','What should you do with your home router’s default admin password?',['Change it to a unique strong password','Post it near the router','Reuse your email password','Leave it unchanged forever'],0,'Changing default credentials makes unauthorized router changes harder.'],
  ['Malware Awareness','A ransomware note appears on a work computer. What is a good first step?',['Disconnect it from the network if instructed by policy and contact IT','Pay immediately using an unknown link','Delete every backup','Forward the note to coworkers'],0,'Follow your organization’s incident plan and contact IT/security promptly.'],
  ['Cryptography Basics','What is a cryptographic key?',['A value used by an encryption or decryption process','A type of computer screen','A list of usernames','A Wi-Fi cable'],0,'Keys control cryptographic operations, so they should be protected.'],
  ['Cybersecurity Fundamentals','Why are backups useful?',['They can help recover data after loss or an incident','They prevent every phishing message','They replace software updates','They make passwords unnecessary'],0,'Current, protected backups support recovery from device failure or incidents.'],
  ['Password Security','Which password is easiest to guess?',['A long unique phrase','A random combination stored safely','A common word with 123 at the end','A unique password generated by a manager'],2,'Common words and predictable number patterns are easy to guess.'],
  ['Phishing Awareness','A colleague asks for a one-time login code in chat. What should you do?',['Never share it; verify the request through a known channel','Send it if they sound urgent','Post it in the team channel','Share only half'],0,'One-time codes are secret credentials. Legitimate support should not ask you to share them.'],
  ['Network Security','What does a firewall generally do?',['Filters network traffic according to rules','Creates passwords for every site','Repairs broken screens','Encrypts every file automatically'],0,'Firewalls allow or block traffic based on configured rules.'],
  ['Malware Awareness','What is a safer way to install software?',['Use the official store or verified publisher','Use a random download link','Disable security tools first','Install an unexpected email attachment'],0,'Trusted sources reduce the chance of installing tampered or unwanted software.'],
  ['Cryptography Basics','Hashing is commonly used to…',['Store a one-way representation for password verification','Restore deleted files','Send email faster','Hide a sender address'],0,'A password hash can be checked without storing the original password.'],
  ['Cybersecurity Fundamentals','You notice an unfamiliar login alert. What should you do?',['Use the official account site to secure the account and report it','Ignore every future alert','Reply with your password','Click any link in the alert'],0,'Check account activity through a known official route and follow recovery steps.'],
  ['Password Security','What is a passphrase?',['A longer sequence of words used as a password','A public profile name','A one-time code','A software update'],0,'A long, unique passphrase can be memorable and difficult to guess.'],
  ['Phishing Awareness','A delivery text asks for a small fee through an odd-looking website. What is safest?',['Check the delivery company using its official app or site','Enter card details right away','Forward it to contacts','Install its attached app'],0,'Unexpected fee requests and unfamiliar domains can signal a scam.'],
  ['Network Security','Why secure a Wi-Fi network with modern encryption?',['To help prevent nearby strangers from joining or reading traffic','To increase screen resolution','To make websites anonymous','To remove malware'],0,'A strong Wi-Fi password and modern router security help protect access to the network.'],
  ['Malware Awareness','What is social engineering?',['Manipulating people into revealing information or taking unsafe actions','A kind of keyboard','A file backup method','A network cable standard'],0,'Social engineering targets human trust, often through pressure or impersonation.'],
  ['Cryptography Basics','Why should a secret key not be shared publicly?',['Others could use it to access or decrypt protected information','It slows down typing','It changes a username','It blocks software updates'],0,'Anyone who obtains a secret key may be able to use it.'],
  ['Cybersecurity Fundamentals','What is a good response to a suspected security incident at school?',['Report it through the approved channel promptly','Try to investigate other accounts yourself','Hide it until it goes away','Post screenshots publicly'],0,'Prompt reporting lets trained staff respond safely and preserve useful information.']
];

const messages = [
  {kind:'Legitimate',from:'library@northbridge.edu',subject:'Your reserved book is ready',body:'Hello, your requested book is ready for pickup at the library desk. Please bring your student ID during regular opening hours.',why:'Expected service notice, no demand for credentials, and the sender matches the school library domain.'},
  {kind:'Phishing',from:'security-northbrldge@verify-mail.example',subject:'ACCOUNT CLOSURE IN 15 MINUTES',body:'We detected a problem. Confirm your password at http://account-check.example.invalid immediately or lose access.',why:'Urgent threat, lookalike sender address, unfamiliar link, and a request to enter a password.'},
  {kind:'Suspicious',from:'events@campus.example',subject:'Student event update',body:'The event room has changed. Please see the attached updated schedule. If you were not expecting an attachment, contact the organizer first.',why:'Could be a real event, but an unexpected attachment should be verified through a known contact.'},
  {kind:'Phishing',from:'prizes@reward-center.example',subject:'You have been selected!',body:'Claim your gift card today. Reply with your full name, phone number, and bank details to receive it.',why:'Unexpected prize and request for sensitive personal and financial information.'},
  {kind:'Legitimate',from:'no-reply@northbridge.edu',subject:'Password reset requested',body:'A password reset was requested for your account. If this was you, open the school portal using your usual bookmark. If not, contact IT support.',why:'The notice does not ask you to send a password and directs you to use a known portal.'},
  {kind:'Phishing',from:'it-helpdesk@northbridge-support.example',subject:'IT needs your one-time code',body:'To keep your account active, reply to this message with the six-digit code you just received.',why:'Support should not ask you to share a one-time code. The sender is not the known school domain.'},
  {kind:'Suspicious',from:'coach@northbridge.edu',subject:'Shared team document',body:'I shared a document with you. Please sign in to view it. If you were not expecting it, check with your coach before opening.',why:'A familiar-looking sender is not proof. Verify unexpected shared documents independently.'},
  {kind:'Phishing',from:'parcel-update@delivery-alert.example',subject:'Delivery failed: pay a small fee',body:'Your parcel is waiting. Pay a small redelivery fee at delivery-fee.example.invalid within one hour.',why:'Unexpected fee, urgency, and an unfamiliar link are common delivery scam signs.'},
  {kind:'Legitimate',from:'advising@northbridge.edu',subject:'Appointment reminder',body:'This is a reminder of your advising appointment tomorrow at 10:30. Reply to this email if you need to reschedule.',why:'Routine reminder without a suspicious link, attachment, or credential request.'},
  {kind:'Suspicious',from:'manager@northbridge.edu',subject:'Quick favor, keep this private',body:'I am in a meeting. Buy several gift cards and send me the codes right away. Do not call me.',why:'Unusual secrecy, urgency, and gift-card codes are strong impersonation warning signs. Verify in person or by a known number.'}
];

const scenarios = [
  ['A classmate says they opened an unexpected attachment and their laptop is acting strangely.',['Tell them to stop using it and report it to campus IT','Ask them to forward the file to you','Post the attachment in the class chat','Tell them to disable updates'],'Tell them to stop interacting with the file, disconnect only if campus guidance says to, and contact IT promptly.'],
  ['You receive a message asking for your sign-in code to prevent account closure.',['Share the code to keep access','Do not share it; check your account through the official portal','Send it to a friend for advice','Reply asking for a discount'],'Never share one-time codes. Use the official portal and contact support through a known channel.'],
  ['A pop-up claims your files are locked and gives an unknown payment address.',['Follow your organization’s incident plan and contact IT','Pay through the address immediately','Download a random cleanup tool','Delete all backups'],'Do not follow unknown instructions. Report it promptly and preserve the device for trained responders.'],
  ['You learn the same password was used on a site that reported a breach.',['Change it on affected and reused accounts; enable MFA','Wait until someone contacts you','Post it so people can check it','Keep it because it is easy to remember'],'Change reused passwords to unique ones and enable MFA where available.'],
  ['Someone claiming to be a supervisor asks you to send a confidential class list to a personal email.',['Verify the request through a known channel and follow data rules','Send it because they sound senior','Ask them to send a link','Share only some names'],'Verify unusual requests through a trusted contact method and follow your institution’s data policy.']
];

function show(view) { views.forEach(v => v.classList.add('hidden')); view.classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'}); }
async function api(path, data = {}) {
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) return hostedApi(path, data);
  const response = await fetch(path, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(data)});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Something went wrong.');
  return result;
}
// Vercel serves the browser files as a static site. The hosted demo keeps its
// own sample account and scores in this browser; the Java server is for local use.
async function hostedApi(path, data) {
  const key = 'cyberquestHostedPlayers';
  const readPlayers = () => JSON.parse(localStorage.getItem(key) || '[]');
  const savePlayers = list => localStorage.setItem(key, JSON.stringify(list));
  const playerView = p => ({id:p.id,username:p.username,points:p.points,challenges:p.challenges,correct:p.correct,attempted:p.attempted,level:levelFor(p.points)});
  if (path === '/api/register') {
    const username=(data.username||'').trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) throw new Error('Username must be 3–20 letters, digits, or underscores.');
    if (!data.password || data.password.length<8) throw new Error('Use a sample password with at least 8 characters.');
    const list=readPlayers();
    if(list.some(p=>p.username.toLowerCase()===username.toLowerCase())) throw new Error('That username is already registered.');
    const saltBytes=crypto.getRandomValues(new Uint8Array(16));
    const salt=bytesToBase64(saltBytes);
    const player={id:crypto.randomUUID(),username,salt,passwordHash:await hashPassword(data.password,saltBytes),points:0,challenges:0,correct:0,attempted:0};
    list.push(player);savePlayers(list);return playerView(player);
  }
  if (path === '/api/login') {
    const player=readPlayers().find(p=>p.username.toLowerCase()===(data.username||'').trim().toLowerCase());
    if(!player || await hashPassword(data.password||'',base64ToBytes(player.salt))!==player.passwordHash) throw new Error('Username or password was not recognized.');
    return playerView(player);
  }
  if (path === '/api/profile') {
    const player=readPlayers().find(p=>p.id===data.id);
    if(!player) throw new Error('Player not found. Please log in.');
    return playerView(player);
  }
  if (path === '/api/score') {
    const list=readPlayers(), player=list.find(p=>p.id===data.id);
    if(!player) throw new Error('Please log in again to save your score.');
    const correct=Number(data.correct),total=Number(data.total);
    if(!Number.isInteger(correct)||!Number.isInteger(total)||total<0||total>100||correct<0||correct>total) throw new Error('The submitted score was not valid.');
    const pointsPerAnswer={quiz:10,phishing:10,scenario:10,password:20};
    if(!(data.type in pointsPerAnswer)) throw new Error('Unknown challenge type.');
    const earned=data.type==='password'?(correct>0?20:10):correct*pointsPerAnswer[data.type];
    player.points+=earned;player.challenges++;player.correct+=correct;player.attempted+=total;savePlayers(list);return playerView(player);
  }
  if (path === '/api/leaderboard') return readPlayers().sort((a,b)=>b.points-a.points).slice(0,10).map(playerView);
  if (path === '/api/generate') {
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const bytes=crypto.getRandomValues(new Uint8Array(16));
    return {password:Array.from(bytes,value=>chars[value%chars.length]).join('')};
  }
  throw new Error('Unknown request.');
}
function levelFor(points) { return points>=500?'Cyber Guardian':points>=300?'Threat Analyst':points>=180?'Cyber Defender':points>=80?'Security Explorer':'Cyber Beginner'; }
async function hashPassword(password,salt) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:65536,hash:'SHA-256'},key,256);
  return bytesToBase64(new Uint8Array(bits));
}
function bytesToBase64(bytes) { return btoa(Array.from(bytes,value=>String.fromCharCode(value)).join('')); }
function base64ToBytes(text) { return Uint8Array.from(atob(text),char=>char.charCodeAt(0)); }
function setMode(next) {
  mode = next;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));
  $('#authTitle').textContent = mode === 'login' ? 'Welcome back' : 'Create your profile';
  $('#authIntro').textContent = mode === 'login' ? 'Sign in to continue your training.' : 'Choose a username and a sample password.';
  $('#authSubmit').innerHTML = mode === 'login' ? 'Enter the arena <span>↗</span>' : 'Create profile <span>↗</span>';
  $('#authMessage').textContent = '';
}
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
$('#authForm').addEventListener('submit', async event => {
  event.preventDefault(); $('#authMessage').textContent = 'Checking your details…';
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    player = await api(mode === 'login' ? '/api/login' : '/api/register', data);
    localStorage.setItem('cyberquestPlayerId', player.id); await refreshPlayer(); showDashboard();
  } catch (error) { $('#authMessage').textContent = error.message; }
});

async function refreshPlayer() {
  if (player?.id) player = await api('/api/profile', {id:player.id});
  if (!player) return;
  $('#welcomeName').textContent = player.username;
  $('#playerLevel').textContent = player.level;
  $('#statPoints').textContent = player.points;
  $('#statChallenges').textContent = player.challenges;
  const accuracy = player.attempted ? Math.round(player.correct * 100 / player.attempted) : 0;
  $('#statAccuracy').innerHTML = `${accuracy}<small>%</small>`;
  const levels = [[0,'Cyber Beginner'],[80,'Security Explorer'],[180,'Cyber Defender'],[300,'Threat Analyst'],[500,'Cyber Guardian']];
  const next = levels.find(item => player.points < item[0]);
  $('#statNext').textContent = next ? `${next[0]} pts` : 'MAX';
  $('#nextHint').textContent = next ? next[1] : 'All ranks unlocked';
  $('#accountButton').textContent = player.username; $('#accountButton').classList.remove('hidden');
}
function showDashboard() { show($('#dashboardView')); }
$('#accountButton').addEventListener('click', showDashboard);
$('#logoutButton').addEventListener('click', () => { player = null; localStorage.removeItem('cyberquestPlayerId'); $('#accountButton').classList.add('hidden'); setMode('login'); show($('#authView')); });
const shuffle = list => [...list].sort(() => Math.random() - .5);
function openGame(title, kicker) { $('#gameTitle').textContent = title; $('#gameKicker').textContent = kicker; $('#gameContent').innerHTML = ''; $('#timerChip').classList.add('hidden'); show($('#gameView')); }
function renderQuestion(round, index) {
  const item = round.items[index];
  const options = item[2];
  $('#gameContent').innerHTML = `<div class="progress-track"><div class="progress-fill" style="width:${index / round.items.length * 100}%"></div></div><article class="question-card"><div class="question-meta">ROUND ${index + 1} / ${round.items.length} &nbsp;·&nbsp; ${escapeHtml(item[0])}</div><h2>${escapeHtml(item[1])}</h2><div class="answer-list">${options.map((option,i)=>`<button class="answer-button" data-answer="${i}">${String.fromCharCode(65+i)}. &nbsp;${escapeHtml(option)}</button>`).join('')}</div><p class="explanation hidden" id="explanation"></p><button class="button primary hidden" id="nextQuestion" style="margin-top:17px">Continue <span>→</span></button></article>`;
  document.querySelectorAll('.answer-button').forEach(button => button.addEventListener('click', () => answerQuestion(Number(button.dataset.answer))));
}
function startQuiz() {
  openGame('Quiz Arena','CYBERSECURITY KNOWLEDGE');
  currentRound = {type:'quiz', items:shuffle(quiz).slice(0,10), index:0, correct:0};
  $('#timerChip').classList.remove('hidden'); let seconds=120; $('#timerValue').textContent=seconds;
  clearInterval(timer); timer=setInterval(()=>{seconds--;$('#timerValue').textContent=seconds;if(seconds<=0){clearInterval(timer);finishRound(true);}},1000);
  renderQuestion(currentRound,0);
}
function answerQuestion(choice) {
  const round=currentRound, item=round.items[round.index], right=choice===item[3];
  if(right)round.correct++;
  document.querySelectorAll('.answer-button').forEach((button,i)=>{button.disabled=true;if(i===item[3])button.classList.add('correct');else if(i===choice)button.classList.add('wrong');});
  $('#explanation').textContent=(right?'Correct. ':'Not quite. ')+item[4];$('#explanation').classList.remove('hidden');$('#nextQuestion').classList.remove('hidden');
  $('#nextQuestion').addEventListener('click',()=>{round.index++;if(round.index>=round.items.length)finishRound();else renderQuestion(round,round.index);},{once:true});
}
function startPhishing() {
  openGame('Phishing Detective','MESSAGE INSPECTION');
  currentRound={type:'phishing',items:shuffle(messages),index:0,correct:0}; renderMessage();
}
function renderMessage() {
  const r=currentRound,m=r.items[r.index];
  $('#gameContent').innerHTML=`<div class="progress-track"><div class="progress-fill" style="width:${r.index/r.items.length*100}%"></div></div><article class="question-card"><div class="question-meta">MESSAGE ${r.index+1} / ${r.items.length}</div><div class="message-header"><span>FROM &nbsp;${escapeHtml(m.from)}</span><span>SUBJECT &nbsp;${escapeHtml(m.subject)}</span></div><div class="message-body">${escapeHtml(m.body)}</div><p class="explanation hidden" id="explanation"></p></article><div class="class-buttons"><button data-kind="Legitimate">✓ &nbsp; Legitimate</button><button data-kind="Suspicious">⌕ &nbsp; Suspicious</button><button data-kind="Phishing">⚑ &nbsp; Phishing</button></div>`;
  document.querySelectorAll('.class-buttons button').forEach(b=>b.addEventListener('click',()=>{const right=b.dataset.kind===m.kind;if(right)r.correct++;document.querySelectorAll('.class-buttons button').forEach(x=>x.disabled=true);$('#explanation').textContent=`${right?'Correct.':'This one was '+m.kind+'.'} ${m.why}`;$('#explanation').classList.remove('hidden');setTimeout(()=>{r.index++;if(r.index>=r.items.length)finishRound();else renderMessage();},2100);}));
}
function startScenarios() {
  openGame('Defender Scenarios','MAKE THE SAFE CALL');
  const items=scenarios.map(([prompt,options,explanation])=>['Defensive Response',prompt,options,0,explanation]);
  currentRound={type:'scenario',items,index:0,correct:0};renderQuestion(currentRound,0);
}
async function finishRound(timedOut=false) {
  clearInterval(timer);$('#timerChip').classList.add('hidden');
  const r=currentRound,total=r.items.length,earned=r.correct*10;
  try{player=await api('/api/score',{id:player.id,type:r.type,correct:r.correct,total});}catch(error){alert(error.message);}
  const message=timedOut?'Time is up. Your answers have been saved.':`You answered ${r.correct} of ${total} correctly.`;
  $('#gameContent').innerHTML=`<article class="result-card"><div class="result-mark">${r.correct>=total*.7?'✦':'✓'}</div><div class="question-meta">CHALLENGE COMPLETE</div><h2>Good work, ${escapeHtml(player.username)}.</h2><div class="result-score">+${earned} pts</div><p>${message}<br>Your current rank is <b>${escapeHtml(player.level)}</b>.</p><div class="result-actions"><button class="button primary" id="doneButton">Back to dashboard</button><button class="button" id="againButton">Play again</button></div></article>`;
  $('#doneButton').addEventListener('click',async()=>{await refreshPlayer();showDashboard();});
  $('#againButton').addEventListener('click',()=>{if(r.type==='quiz')startQuiz();else if(r.type==='phishing')startPhishing();else startScenarios();});
}

function startPasswordLab() {
  openGame('Password Lab','CHECK A SAMPLE · NEVER A REAL PASSWORD');
  $('#gameContent').innerHTML=`<article class="question-card"><div class="question-meta">YOUR INPUT STAYS IN THIS BROWSER</div><h2>Explore what makes a password stronger.</h2><p class="muted">Use a made-up sample. This tool does not send or save the text you enter.</p><label for="samplePassword">SAMPLE PASSWORD</label><input id="samplePassword" type="text" autocomplete="off" placeholder="Type a fictional sample"><div class="password-meter"><span id="meterFill" style="width:0%"></span></div><div id="strengthLabel" class="question-meta">WAITING FOR SAMPLE</div><ul class="rule-list" id="ruleList"><li>At least 12 characters</li><li>Uppercase and lowercase letters</li><li>At least one number</li><li>At least one symbol</li><li>Avoid common words and repeated patterns</li></ul><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="button" id="generateButton">Generate a sample</button><button class="button primary" id="passwordDone">Finish challenge</button></div><p id="generatedNotice" class="explanation"></p></article>`;
  $('#samplePassword').addEventListener('input',evaluatePassword);
  $('#generateButton').addEventListener('click',async()=>{try{const result=await api('/api/generate');$('#samplePassword').value=result.password;$('#generatedNotice').textContent='Sample generated by Java SecureRandom. Copy it only if you want to use it as a demo value.';evaluatePassword();}catch(e){$('#generatedNotice').textContent=e.message;}});
  $('#passwordDone').addEventListener('click',async()=>{const strength=evaluatePassword();try{player=await api('/api/score',{id:player.id,type:'password',correct:strength>=3?1:0,total:1});}catch(e){alert(e.message);}$('#gameContent').innerHTML=`<article class="result-card"><div class="result-mark">▣</div><div class="question-meta">PASSWORD LAB COMPLETE</div><h2>Your sample was not saved.</h2><div class="result-score">+${strength>=3?20:10} pts</div><p>Password evaluation happened in this browser. Java received only the challenge result.</p><div class="result-actions"><button class="button primary" id="doneButton">Back to dashboard</button></div></article>`;$('#doneButton').addEventListener('click',async()=>{await refreshPlayer();showDashboard();});});
}
function evaluatePassword() {
  const value=$('#samplePassword')?.value||'';
  const checks=[value.length>=12,/[a-z]/.test(value)&&/[A-Z]/.test(value),/[0-9]/.test(value),/[^A-Za-z0-9]/.test(value),!/(password|qwerty|123456|letmein|.)\1{3,}/i.test(value)&&!/(password|qwerty|123456|letmein)/i.test(value)];
  document.querySelectorAll('#ruleList li').forEach((li,i)=>li.classList.toggle('pass',checks[i]));
  const score=checks.filter(Boolean).length;const label=score<=1?'Very Weak':score===2?'Weak':score===3?'Moderate':score===4?'Strong':'Strong';
  $('#strengthLabel').textContent=value?`${label.toUpperCase()} · ${score}/5 RULES`:'WAITING FOR SAMPLE';$('#meterFill').style.width=`${score*20}%`;
  $('#meterFill').style.background=score<2?'#f58374':score<4?'#edc56e':'#c5f36b';return score;
}

async function showLeaderboard() {
  show($('#infoView'));$('#infoContent').innerHTML='<div class="eyebrow"><span class="eyebrow-line"></span> PLAYER RANKINGS</div><h1>Leaderboard</h1><article class="info-card"><div class="empty-state">Loading scores…</div></article>';
  try{const list=await api('/api/leaderboard');$('#infoContent').innerHTML=`<div class="eyebrow"><span class="eyebrow-line"></span> PLAYER RANKINGS</div><h1>Leaderboard</h1><article class="info-card"><table class="table"><thead><tr><th>RANK</th><th>PLAYER</th><th>POINTS</th><th>LEVEL</th></tr></thead><tbody>${list.length?list.map((p,i)=>`<tr><td>#${i+1}</td><td>${escapeHtml(p.username)}${p.id===player.id?' (you)':''}</td><td>${p.points}</td><td>${escapeHtml(p.level)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty-state">No scores yet. Play a challenge to appear here.</td></tr>'}</tbody></table></article>`;}catch(error){$('#infoContent').textContent=error.message;}
}
async function showProfile() {
  await refreshPlayer();const accuracy=player.attempted?Math.round(player.correct*100/player.attempted):0;
  const badges=[];if(player.challenges>=1)badges.push('First Steps');if(player.correct>=10)badges.push('Careful Observer');if(player.points>=180)badges.push('Cyber Defender');if(player.points>=500)badges.push('Cyber Guardian');
  show($('#infoView'));$('#infoContent').innerHTML=`<div class="eyebrow"><span class="eyebrow-line"></span> PLAYER REPORT</div><h1>Performance</h1><article class="info-card"><h2>${escapeHtml(player.username)}</h2><table class="table"><tbody><tr><th>PLAYER ID</th><td>${escapeHtml(player.id)}</td></tr><tr><th>TOTAL POINTS</th><td>${player.points}</td></tr><tr><th>CHALLENGES COMPLETED</th><td>${player.challenges}</td></tr><tr><th>QUESTIONS / DECISIONS</th><td>${player.attempted}</td></tr><tr><th>CORRECT</th><td>${player.correct}</td></tr><tr><th>INCORRECT</th><td>${Math.max(0,player.attempted-player.correct)}</td></tr><tr><th>ACCURACY</th><td>${accuracy}%</td></tr><tr><th>CURRENT LEVEL</th><td>${escapeHtml(player.level)}</td></tr><tr><th>BADGES</th><td>${badges.length?badges.map(escapeHtml).join(' · '):'Complete a challenge to earn your first badge'}</td></tr></tbody></table></article><p class="muted">Passwords from the Password Lab are never included in this report or saved.</p>`;
}
function escapeHtml(text) { return String(text??'').replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

document.querySelectorAll('.module-card').forEach(card=>card.addEventListener('click',()=>{if(card.dataset.module==='quiz')startQuiz();else if(card.dataset.module==='phishing')startPhishing();else if(card.dataset.module==='password')startPasswordLab();else startScenarios();}));
$('#leaderboardButton').addEventListener('click',showLeaderboard);$('#profileButton').addEventListener('click',showProfile);$('#infoBack').addEventListener('click',showDashboard);
$('#backButton').addEventListener('click',()=>{clearInterval(timer);currentRound=null;showDashboard();});

(async function restoreSession(){
  const id=localStorage.getItem('cyberquestPlayerId');if(!id)return;
  try{player=await api('/api/profile',{id});await refreshPlayer();showDashboard();}catch{localStorage.removeItem('cyberquestPlayerId');}
})();
