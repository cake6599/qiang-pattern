// 全局音频变量
let audioCtx = null;
let currentOscillator = null; // 记录当前播放声音，实现点新停旧
let analyser = null;
let canvas, canvasCtx;
let animationId = null;

// 初始化音频上下文（兼容iOS）
function initAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
    }
    // iOS 唤醒音频
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

// 初始化画布
function initCanvas() {
    canvas = document.getElementById("wave");
    canvasCtx = canvas.getContext("2d");
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
}

// 绘制波形
function drawWaveform() {
    animationId = requestAnimationFrame(drawWaveform);
    const bufferLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufferLen);
    analyser.getByteTimeDomainData(dataArr);

    // 清空画布
    canvasCtx.fillStyle = "#f7f7f7";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#2563eb";
    canvasCtx.beginPath();

    let x = 0;
    const sliceWidth = canvas.width / bufferLen;
    for (let i = 0; i < bufferLen; i++) {
        const v = dataArr[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

// 核心播放函数
function playPattern(type) {
    // 1. 初始化音频+画布
    initAudioCtx();
    if (!canvas) initCanvas();
    if (!animationId) drawWaveform();

    // 2. 播放冲突：停止上一个声音
    if (currentOscillator) {
        try {
            currentOscillator.stop();
        } catch (err) {}
        currentOscillator = null;
    }

    // 3. 五种纹样音色配置
    const soundConfig = {
        "羊角": { freq: 180, wave: "triangle" },
        "火纹": { freq: 900, wave: "sawtooth" },
        "云纹": { freq: 500, wave: "sine" },
        "几何": { freq: 650, wave: "square" },
        "植物": { freq: 300, wave: "sine" }
    };
    const cfg = soundConfig[type];

    // 创建发声器、音量控制器
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = cfg.wave;
    osc.frequency.value = cfg.freq;

    // 4. Attack + Decay 音量包络（渐起渐消）
    const now = audioCtx.currentTime;
    const attack = 0.15;
    const decay = 0.35;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

    // 音频链路：振荡器 → 音量 → 波形分析 → 扬声器
    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // 播放与停止
    osc.start(now);
    osc.stop(now + attack + decay);
    currentOscillator = osc;
}

// 暴露给html按钮调用
window.playPattern = playPattern;