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