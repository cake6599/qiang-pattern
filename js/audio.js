// 全局音频变量
let audioCtx = null;
let currentNodes = null;
let analyser = null;
let canvas, canvasCtx;
let animationId = null;
let isDrawing = false;

// 初始化音频上下文（iOS必须手势触发，不自动唤醒）
async function initAudioCtx() {

    if (!audioCtx) {

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        analyser = audioCtx.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65; 

    }

    if (audioCtx.state === "suspended") {

        await audioCtx.resume();

    }

}

// 初始化画布 高清DPR适配
function initCanvas() {

    canvas = document.getElementById("wave");

    if (!canvas) return;

    canvasCtx = canvas.getContext("2d");

    function resize() {

        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();

        const width = rect.width || 700;
        const height = rect.height || 130;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvasCtx.setTransform(1, 0, 0, 1, 0, 0);

        canvasCtx.scale(dpr, dpr);

    }

    resize();

    window.addEventListener("resize", resize);

}

// 绘制波形
function drawWaveform(){
    if(!isDrawing || !canvas || !canvasCtx || !analyser)
        return;

    animationId=requestAnimationFrame(drawWaveform);
    const bufferLen=analyser.fftSize;
    const dataArr=new Uint8Array(bufferLen);
    analyser.getByteTimeDomainData(dataArr);

    const rect=canvas.getBoundingClientRect();
    const w=rect.width || 120;
    const h=rect.height || 45;

    canvasCtx.clearRect(0,0,w,h);
    canvasCtx.strokeStyle="#ffffff";
    canvasCtx.lineWidth=2;

    const barCount=30;
    const barSpace=w/barCount;

    for(let i=0;i<barCount;i++){
        const index = Math.floor(i / barCount * bufferLen);
        let value=dataArr[index];
        // 原始范围：0~255，中线128
        const offset = (value - 128)/128;
        // 【放大系数】调整这里！数值越大线条越长，推荐 1.3 ~ 2.0
        const scale = 1.6;
        let height = Math.abs(offset) * h * scale;

        // 限制最高不要超出画布，最低保持6（一直看得见）
        height = Math.max(6, Math.min(height, h));
        
        let x=i*barSpace;
        canvasCtx.beginPath();
        canvasCtx.moveTo(
            x,
            h/2-height/2
        );
        canvasCtx.lineTo(
            x,
            h/2+height/2
        );
        canvasCtx.stroke();
    }
}

// 核心播放函数
// 核心播放函数
async function playPattern(type){
    await initAudioCtx();
    if (!canvas) {
        initCanvas();
    }
    isDrawing = true;
    if (!animationId) {
        drawWaveform();
    }

    // 新声音停止旧声音
    if(currentNodes){
        try{
            currentNodes.osc.stop();
        }catch(e){}
        currentNodes.gain.disconnect();
        currentNodes.osc.disconnect();
    }

    const soundConfig = {
        "植物纹": { freq: 260, wave: "sine", attack:0.20, decay:0.62 },
        "动物纹": { freq: 180, wave: "triangle", attack:0.12, decay:0.58 },
        "几何纹": { freq: 740, wave: "square", attack:0.02, decay:0.30 }
    };
    const cfg = soundConfig[type];
    console.log("播放音效类型：", type, "是否匹配成功：", !!cfg);
    if(!cfg) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = cfg.wave;
    osc.frequency.value = cfg.freq;
    
    const now = audioCtx.currentTime;
    const attack = cfg.attack;
    const decay = cfg.decay;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + attack + decay+0.5);

    osc.connect(gain);
    gain.connect(analyser);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + attack + decay + 0.5);
    currentNodes = {
        osc,
        gain
    };

    // 抛出事件
    window.dispatchEvent(new CustomEvent("audio-play", {detail:{soundType:type}}));

    // 音频结束回调
    osc.onended = ()=>{
        currentNodes = null;
        isDrawing = false;
        cancelAnimationFrame(animationId);
        animationId = null;
        window.dispatchEvent(new CustomEvent("audio-stop"));
    }
}

// 全局停止音频接口
window.stopAudio = function(){

    if(currentNodes){

        try{

            currentNodes.osc.stop();

        }catch(e){}

        currentNodes.gain.disconnect();

        currentNodes.osc.disconnect();

        currentNodes = null;

    }

    isDrawing = false;

    cancelAnimationFrame(animationId);

    animationId = null;

    window.dispatchEvent(new CustomEvent("audio-stop"));

}

// 页面卸载释放资源
window.addEventListener('beforeunload',()=>{
    if(audioCtx) audioCtx.close();
    cancelAnimationFrame(animationId);
})

// 挂载全局
window.playPattern = playPattern;