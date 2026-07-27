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
// 绘制竖线音频波形
// 绘制动态音频条
function drawWaveform(){

    if(!isDrawing || !canvas || !canvasCtx || !analyser)
        return;


    animationId=requestAnimationFrame(drawWaveform);



    const bufferLen=analyser.frequencyBinCount;

    const dataArr=new Uint8Array(bufferLen);


    analyser.getByteFrequencyData(dataArr);



    const rect=canvas.getBoundingClientRect();

    const w=rect.width || 120;

    const h=rect.height || 45;



    canvasCtx.clearRect(0,0,w,h);



    canvasCtx.strokeStyle="#ffffff";

    canvasCtx.lineWidth=2;



    const barCount=30;

    const barSpace=w/barCount;



    for(let i=0;i<barCount;i++){


        //直接取频段，不平均
        let value=dataArr[i*3];



        //增强变化
        let height=(value/255)*h;



        //最低高度
        height=Math.max(height,6);



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

    // =====================16组完整音效配置=====================
    const soundConfig = {
        "花卉纹": { freq: 260, wave: "sine", attack:0.20, decay:0.50 },
        "卷草藤蔓纹": { freq: 330, wave: "sine", attack:0.32, decay:0.62 },
        "果蔬谷穗纹": { freq: 210, wave: "triangle", attack:0.16, decay:0.42 },
        "羊角图腾纹": { freq: 180, wave: "triangle", attack:0.25, decay:0.60 },
        "灵猴纹": { freq: 420, wave: "sine", attack:0.12, decay:0.36 },
        "瑞兽纹": { freq: 150, wave: "triangle", attack:0.22, decay:0.58 },
        "飞鸟纹": { freq: 820, wave: "sine", attack:0.08, decay:0.32 },
        "蝴蝶蛾纹": { freq: 750, wave: "sine", attack:0.10, decay:0.34 },
        "鲤鱼纹": { freq: 380, wave: "sine", attack:0.30, decay:0.52 },
        "蝙蝠纹": { freq: 680, wave: "sawtooth", attack:0.11, decay:0.33 },
        "基础直线几何纹": { freq: 740, wave: "square", attack:0.02, decay:0.22 },
        "方形菱形几何纹": { freq: 660, wave: "square", attack:0.03, decay:0.26 },
        "阶梯复合几何纹": { freq: 570, wave: "square", attack:0.04, decay:0.30 },
        "火焰天象纹": { freq: 920, wave: "sawtooth", attack:0.05, decay:0.40 },
        "流云天象纹": { freq: 490, wave: "sine", attack:0.40, decay:0.70 },
        "山峦水波纹": { freq: 350, wave: "triangle", attack:0.33, decay:0.64 }
    };
    const cfg = soundConfig[type];
    console.log("播放音效类型：", type, "是否匹配成功：", !!cfg);
    if(!cfg) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = cfg.wave;
    osc.frequency.value = cfg.freq;
    const osc2 = audioCtx.createOscillator();

    osc2.type = cfg.wave;

    osc2.frequency.value = cfg.freq * 2;
    const now = audioCtx.currentTime;
    const attack = cfg.attack;
    const decay = cfg.decay;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + attack + decay+0.5);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(analyser);

    gain.connect(audioCtx.destination);
    console.log(audioCtx.state);
    osc.start(now);
    osc2.start(now);
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