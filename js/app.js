window.addEventListener("DOMContentLoaded", function () {
    console.log("页面加载完成");

    // iOS手机触摸解锁音频（只执行一次）
    document.addEventListener("touchstart", function () {
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }, { once: true });
});