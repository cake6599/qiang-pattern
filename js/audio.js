// ① 创建音频上下文 AudioContext
let audioCtx = null;
// 初始化函数（浏览器规则：必须用户点击后才能启动音频）
function initAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// ② 核心播放函数 playPattern，接收纹样名称 type
function playPattern(type) {
  // 先初始化音频环境
  initAudioCtx();

  // ③ 创建声音发生器 Oscillator + 音量节点（防爆音）
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // 音量初始值，0.2不会刺耳
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  // 声音结束平滑衰减，避免咔哒爆音
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

  // ④ 五种纹样匹配参数：频率、波形（音色）
  switch (type) {
    case "羊角":
      oscillator.type = "triangle"; // triangle厚重低频
      oscillator.frequency.value = 180;
      break;
    case "火纹":
      oscillator.type = "sawtooth"; // sawtooth尖锐明亮高频
      oscillator.frequency.value = 900;
      break;
    case "云纹":
      oscillator.type = "sine"; // sine空灵顺滑
      oscillator.frequency.value = 500;
      break;
    case "几何":
      oscillator.type = "square"; // square短促硬朗
      oscillator.frequency.value = 650;
      break;
    case "植物":
      oscillator.type = "sine"; // sine柔和
      oscillator.frequency.value = 300;
      break;
    default:
      oscillator.type = "sine";
      oscillator.frequency.value = 400;
  }

  // 音频链路：发声器 → 音量控制器 → 电脑扬声器
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  // 播放0.4秒后停止
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.4);
}

// 把函数挂载到window，html按钮可以直接调用
window.playPattern = playPattern;