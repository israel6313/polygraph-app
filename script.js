const fingerprint = document.querySelector('.scanner-box');
const scanLine = document.getElementById('scan-line');
const statusText = document.getElementById('status-text');
const resultDiv = document.getElementById('result');
const overlay = document.getElementById('start-overlay');
const initBtn = document.getElementById('init-btn');

let fixedResult = null;
let scanTimer;
let audioCtx; 

// --- אתחול המערכת (פותר את בעיית ההרשאות) ---
initBtn.addEventListener('click', () => {
    // 1. יצירת הקשר הסאונד בלחיצה הראשונה
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 2. הפעלת סאונד "ריק" כדי לשחרר את החסימה של הדפדפן
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // 3. ניסיון להפעיל רטט כדי לשחרר חסימה
    navigator.vibrate(100);

    // 4. העלמת מסך הפתיחה
    overlay.classList.add('hidden');
});
// ------------------------------------------

// אזורים נסתרים
document.getElementById('trigger-truth').addEventListener('click', () => {
    fixedResult = 'truth';
    if(navigator.vibrate) navigator.vibrate(50);
    console.log('מוכן לאמת');
});

document.getElementById('trigger-lie').addEventListener('click', () => {
    fixedResult = 'lie';
    if(navigator.vibrate) navigator.vibrate(50);
    console.log('מוכן לשקר');
});

// פונקציית סאונד משופרת
function playTone(freq, type, duration) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    
    // מונע "קליקים" בסוף הצליל
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.stop(audioCtx.currentTime + duration);
}

// התחלת סריקה
const startHandler = (e) => {
    // מניעת גלילה וזום
    if (e.cancelable) e.preventDefault(); 
    
    // אם לא עברו את מסך הפתיחה, לא עושים כלום
    if (!overlay.classList.contains('hidden')) return;

    document.body.classList.add('scanning');
    statusText.innerText = "מנתח נתונים...";
    resultDiv.innerText = "";
    
    // רטט התחלתי פשוט (פותר את בעיית הביצועים)
    if(navigator.vibrate) navigator.vibrate(200);
    
    // לולאת סאונד סריקה
    let loopCount = 0;
    // מנגנים צליל ראשון מיד
    playTone(800, 'sine', 0.1);
    
    const scanSoundLoop = setInterval(() => {
        if (!document.body.classList.contains('scanning')) {
            clearInterval(scanSoundLoop);
            return;
        }
        loopCount++;
        playTone(800 + (loopCount * 150), 'sine', 0.1);
    }, 250);

    scanTimer = setTimeout(showResult, 2500);
};

// חיבור האירועים
fingerprint.addEventListener('touchstart', startHandler, { passive: false });
fingerprint.addEventListener('mousedown', startHandler);

const stopHandler = (e) => {
    // e.preventDefault(); // לא חובה כאן
    clearTimeout(scanTimer);
    document.body.classList.remove('scanning');
    
    if (resultDiv.innerText === "") {
        statusText.innerText = "סריקה נכשלה.";
    }
};

fingerprint.addEventListener('touchend', stopHandler);
fingerprint.addEventListener('mouseup', stopHandler);

function showResult() {
    document.body.classList.remove('scanning');
    
    let isTruth;
    if (fixedResult === 'truth') isTruth = true;
    else if (fixedResult === 'lie') isTruth = false;
    else isTruth = Math.random() > 0.5;

    fixedResult = null;

    if (isTruth) {
        statusText.innerText = "תוצאה:";
        resultDiv.innerText = "אמת";
        resultDiv.className = "result truth";
        document.body.style.backgroundColor = "#001100";
        if(navigator.vibrate) navigator.vibrate([200]);
        playTone(1200, 'sine', 0.6);
    } else {
        statusText.innerText = "תוצאה:";
        resultDiv.innerText = "שקר";
        resultDiv.className = "result lie";
        document.body.style.backgroundColor = "#110000";
        if(navigator.vibrate) navigator.vibrate([500, 50, 500]); 
        playTone(150, 'sawtooth', 0.8);
    }

    setTimeout(() => {
        document.body.style.backgroundColor = "#000";
    }, 500);
}