document.addEventListener('DOMContentLoaded', function(){
    // 导航菜单
    const menuBtn = document.querySelector('.menu-button');
    const nav = document.querySelector('.main-nav');
    if(menuBtn && nav){
        menuBtn.addEventListener('click', function(){
            nav.classList.toggle('is-open');
            const open = nav.classList.contains('is-open');
            menuBtn.textContent = open ? '✕' : '☰';
            menuBtn.setAttribute('aria-expanded', open);
        })
        nav.querySelectorAll('a').forEach(link=>{
            link.addEventListener('click',()=>{
                nav.classList.remove('is-open');
                menuBtn.textContent = '☰';
                menuBtn.setAttribute('aria-expanded','false');
            })
        })
    }

    // 轮播代码【修改升级版：支持 far2/far1/near/active 四层，最多7张分层】
// 轮播代码【修改升级版：支持 far2/far1/near/active 四层，最多7张分层 + 鼠标拖拽 + 移动端手指滑动】
const groups = document.querySelectorAll('[data-carousel]');
groups.forEach(group => {
    const viewport = group.querySelector('.pattern-viewport');
    const track = group.querySelector('.pattern-cards');
    const items = [...track.querySelectorAll('.pattern-card')];
    const prevBtn = group.querySelector('.carousel-prev');
    const nextBtn = group.querySelector('.carousel-next');

    let offsetX = 0;
    const overlapOffset = 45; /* 和css margin-left:-45px保持一致！！ */
    const baseItemWidth = items[0].offsetWidth - overlapOffset;

    // ========== 拖拽相关变量 ==========
    let isDragging = false;
    let startX = 0;
    let dragStartOffset = 0;
    let moveDistance = 0; // 判断是拖动还是点击

    function updateScaleByCenter(){
        const viewCenterX = viewport.offsetWidth / 2;
        let closestIdx = 0;
        let minDistance = Infinity;

        items.forEach((item, idx)=>{
            const itemLeft = item.offsetLeft + offsetX;
            const itemCenterX = itemLeft + item.offsetWidth / 2;
            const dist = Math.abs(itemCenterX - viewCenterX);

            if(dist < minDistance){
                minDistance = dist;
                closestIdx = idx;
            }
        })

        items.forEach((item, idx)=>{
            // 清除旧class
            item.classList.remove('level-active','level-near','level-far1','level-far2');
            const dist = Math.abs(idx - closestIdx);
            
            // 距离越大，z-index越小；距离中心越近，z-index越大
            const zBase = 10 - dist; 
            item.style.zIndex = zBase;

            if(dist === 0){
                item.classList.add('level-active');
            }else if(dist === 1){
                item.classList.add('level-near');
            }else if(dist === 2){
                item.classList.add('level-far1');
            }else if(dist === 3){
                item.classList.add('level-far2');
            }
        })
    }

    function renderTrack(){
        track.style.transform = `translateX(${offsetX}px)`;
        updateScaleByCenter();
    }

    // 切换到上一张/下一张（封装函数，按钮和拖拽共用）
    function slidePrev(){
        offsetX += baseItemWidth;
        renderTrack();
    }
    function slideNext(){
        offsetX -= baseItemWidth;
        renderTrack();
    }

    prevBtn.addEventListener('click', slidePrev);
    nextBtn.addEventListener('click', slideNext);

    renderTrack();
    window.addEventListener('resize', renderTrack);

    // ===================== 拖拽逻辑 =====================
    // 拖动开始
    function dragStart(clientX) {
        isDragging = true;
        startX = clientX;
        dragStartOffset = offsetX;
        moveDistance = 0;
        track.style.transition = 'none'; // 拖动时关闭缓动，跟随鼠标
    }
    // 拖动进行中
    function dragMove(clientX) {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        moveDistance = Math.abs(deltaX);
        offsetX = dragStartOffset + deltaX;
        renderTrack();
    }
    // 拖动结束，松手吸附
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = ''; // 恢复css动画缓动

        // 阈值：拖动超过 40px 判定有效滑动
        const threshold = 40;
        if (moveDistance > threshold) {
            const deltaTotal = offsetX - dragStartOffset;
            if (deltaTotal > 0) {
                slidePrev();
            } else {
                slideNext();
            }
        } else {
            // 拖动距离太短，回弹原位
            offsetX = dragStartOffset;
            renderTrack();
        }
    }

    // 鼠标事件
    track.addEventListener('mousedown', e => dragStart(e.clientX));
    document.addEventListener('mousemove', e => dragMove(e.clientX));
    document.addEventListener('mouseup', dragEnd);

    // 移动端触摸事件
    track.addEventListener('touchstart', e => {
        dragStart(e.touches[0].clientX);
        e.preventDefault();
    }, { passive:false });
    document.addEventListener('touchmove', e => {
        dragMove(e.touches[0].clientX);
    }, { passive:false });
    document.addEventListener('touchend', dragEnd);

    // 鼠标样式优化
    track.style.cursor = 'grab';
    track.addEventListener('mousedown',()=> track.style.cursor='grabbing');
    document.addEventListener('mouseup',()=> track.style.cursor='grab');
})

    // ========= 订阅邮箱【正式可用】 =========
    const sendBtn = document.querySelector('.send-btn');
    const emailInput = document.getElementById('emailInput');

    function submitEmail() {
        const email = emailInput.value.trim();
        const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            alert('请输入邮箱地址');
            return;
        }
        if (!reg.test(email)) {
            alert('邮箱格式不正确');
            return;
        }
        alert(`订阅成功！\n邮箱：${email}`);
        emailInput.value = '';
    }

    if(sendBtn && emailInput){
        sendBtn.onclick = submitEmail;
        emailInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') submitEmail();
        });
    }



})