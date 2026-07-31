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

    // 轮播代码【修改升级版：支持 far2/far1/near/active 四层，最多7张分层 + 新增拖拽滑动】
    const groups = document.querySelectorAll('[data-carousel]');
    groups.forEach(group => {
        const viewport = group.querySelector('.pattern-viewport');
        const track = group.querySelector('.pattern-cards');
        const items = [...track.querySelectorAll('.pattern-card')];
        const prevBtn = group.querySelector('.carousel-prev');
        const nextBtn = group.querySelector('.carousel-next');

        let offsetX = 0;
        const overlapOffset = 45;
        const baseItemWidth = items[0].offsetWidth - overlapOffset;

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
                item.classList.remove(
                    'level-active',
                    'level-near',
                    'level-far1',
                    'level-far2',
                    'level-hidden'
                );

                const dist = Math.abs(idx - closestIdx);

                if(dist > 3){
                    item.classList.add("level-hidden");
                    return;
                }

                item.style.zIndex = 10 - dist;

                if(dist===0){
                    item.classList.add("level-active");
                }else if(dist===1){
                    item.classList.add("level-near");
                }else if(dist===2){
                    item.classList.add("level-far1");
                }else{
                    item.classList.add("level-far2");
                }
            });
        }

        function renderTrack(){
            track.style.transform = `translateX(${offsetX}px)`;
            updateScaleByCenter();
        }

        prevBtn.addEventListener('click',()=>{
            offsetX += baseItemWidth;
            renderTrack();
        });
        nextBtn.addEventListener('click',()=>{
            offsetX -= baseItemWidth;
            renderTrack();
        });

        renderTrack();
        window.addEventListener('resize', renderTrack);


        // =========拖拽逻辑【修复版】=========
        let isDragging = false;
        let startPosX = 0;
        let startOffsetX = 0;
        let dragTravel = 0;
        const dragThreshold = 40;
        let draggedFlag = false; // 标记是否发生有效拖动

        function dragStart(x){
            isDragging = true;
            startPosX = x;
            startOffsetX = offsetX;
            dragTravel = 0;
            draggedFlag = false;
            track.style.transition = "none";
        }
        function dragMove(x){
            if(!isDragging) return;
            const delta = x - startPosX;
            dragTravel = Math.abs(delta);
            offsetX = startOffsetX + delta;
            renderTrack();
            // 产生足够位移，标记为拖动行为
            if(dragTravel > dragThreshold){
                draggedFlag = true;
            }
        }
        function dragEnd(){
            if(!isDragging) return;
            isDragging = false;
            track.style.transition = "";

            if(draggedFlag){
                const totalDelta = offsetX - startOffsetX;
                if(totalDelta > 0){
                    offsetX = startOffsetX + baseItemWidth;
                }else{
                    offsetX = startOffsetX - baseItemWidth;
                }
            }else{
                // 拖动距离很短，回弹，允许触发a标签原生click
                offsetX = startOffsetX;
            }
            renderTrack();
        }

        // PC鼠标
        track.addEventListener("mousedown", e=> dragStart(e.clientX));
        document.addEventListener("mousemove", e=> dragMove(e.clientX));
        document.addEventListener("mouseup", dragEnd);

        // 触屏
        track.addEventListener("touchstart", e=> dragStart(e.touches[0].clientX), {passive:true});
        document.addEventListener("touchmove", e=>{
            if(isDragging && dragTravel > 8) e.preventDefault();
            dragMove(e.touches[0].clientX);
        }, {passive:false});
        document.addEventListener("touchend", dragEnd);

        track.style.cursor = "grab";
        track.addEventListener("mousedown", ()=> track.style.cursor="grabbing");
        document.addEventListener("mouseup", ()=> track.style.cursor="grab");

        // 关键修复：拖动过就阻止click，没拖动放行原生跳转
        track.addEventListener('click', function(e){
            if(draggedFlag){
                e.preventDefault();
            }
        })
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