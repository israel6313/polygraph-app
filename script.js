const fingerprint = document.querySelector('.scanner-box');
const scanLine = document.getElementById('scan-line');
const statusText = document.getElementById('status-text');
const resultDiv = document.getElementById('result');

let fixedResult = null;
let scanTimer;
let audioCtx; // המוח של הסאונד

// הגדרת האזורים הנסתרים
document.getElementById('trigger-truth').addEventListener('click', () => {
    fixedResult = 'truth';
    navigator.vibrate(50); // רטט קצר לאישור שלחצת
    console.log('מוכן לאמת');
});

document.getElementById('trigger-lie').addEventListener('click', () => {
    fixedResult = 'lie';
    navigator.vibrate(50); // רטט קצר לאישור שלחצת
    console.log('מוכן לשקר');
});

// מאתחל את הסאונד (דפדפנים דורשים אינטראקציה לפני השמעת צליל)
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// פונקציה ליצירת צלילים (Beep)
function playTone(freq, type, duration) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

// התחלת סריקה
const startHandler = (e) => {
    e.preventDefault();
    initAudio(); // הפעלת מערכת הסאונד
    
    document.body.classList.add('scanning');
    statusText.innerText = "מנתח נתונים ביומטריים...";
    resultDiv.innerText = "";
    
    // התחלת רטט מתמשך (עובד בעיקר באנדרואיד)
    navigator.vibrate([50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]); 
    
    // השמעת צלילי סריקה
    let loopCount = 0;
    const scanSoundLoop = setInterval(() => {
        if (!document.body.classList.contains('scanning')) {
            clearInterval(scanSoundLoop);
            return;
        }
        playTone(800 + (loopCount * 100), 'sine', 0.1);
        loopCount++;
    }, 200);

    scanTimer = setTimeout(showResult, 2500); // הארכנו קצת ל-2.5 שניות
};

// הוספת ה-Listener עם התיקון הקודם שלך
fingerprint.addEventListener('touchstart', startHandler, { passive: false });
fingerprint.addEventListener('mousedown', startHandler);

const stopHandler = () => {
    clearTimeout(scanTimer);
    document.body.classList.remove('scanning');
    navigator.vibrate(0); // עצירת רטט
    
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

    fixedResult = null; // איפוס

    if (isTruth) {
        statusText.innerText = "ניתוח הושלם:";
        resultDiv.innerText = "אמת";
        resultDiv.className = "result truth";
        document.body.style.backgroundColor = "#001100";
        
        // אפקטים לאמת
        navigator.vibrate([200]); // רטט אחד ארוך
        playTone(1200, 'sine', 0.5); // צליל גבוה ונעים
    } else {
        statusText.innerText = "ניתוח הושלם:";
        resultDiv.innerText = "שקר";
        resultDiv.className = "result lie";
        document.body.style.backgroundColor = "#110000";
        
        // אפקטים לשקר
        navigator.vibrate([500, 100, 500]); // רטט ארוך-קצר-ארוך (מלחיץ)
        playTone(150, 'sawtooth', 0.8); // צליל נמוך ומחוספס
    }

    setTimeout(() => {
        document.body.style.backgroundColor = "#000";
    }, 500);
}