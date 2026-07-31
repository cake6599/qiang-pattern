const fixedThumb1 = "./assets/images/thumb/thumb1.png";
const fixedThumb2 = "./assets/images/thumb/thumb2.png";
const fixedThumb3 = "./assets/images/thumb/thumb3.png";

function getUrlParam(name) {
    return new URL(location.href).searchParams.get(name);
}

const imgPath = getUrlParam("img") || "";

let autoTag = "植物纹";

if (imgPath.includes("/animal/")) {
    autoTag = "动物纹";
} else if (imgPath.includes("/geo/")) {
    autoTag = "几何纹";
} else if (imgPath.includes("/plant/")) {
    autoTag = "植物纹";
}

const params = {
    img: imgPath,
    name: getUrlParam("name"),
    desc: getUrlParam("desc"),
    tag: autoTag,
    sound: getUrlParam("sound"),
    text1: getUrlParam("text1"),
    text2: getUrlParam("text2"),
    text3: getUrlParam("text3"),
    infoText: getUrlParam("infoText"),
    meanText: getUrlParam("meanText"),
    storyText: getUrlParam("storyText"),
    colors: ""
};

if (params.img) {
    patternImg.src = params.img;
}

if (params.name) {
    patternName.innerText = params.name;
}

if (params.desc) {
    patternDesc.innerHTML = params.desc.replaceAll("|", "<br>");
}

patternTag.innerText = params.tag;

function extractColors(src) {
    return new Promise(resolve => {
        let img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
            let canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 400;

            let ctx = canvas.getContext("2d");
            ctx.filter = "saturate(150%) contrast(120%)";
            const crop =10;
            ctx.drawImage(
                img,
                crop,
                crop,
                img.width - crop * 2,
                img.height - crop * 2,
                0,
                0,
                400,
                400
            );

            let data = ctx.getImageData(0, 0, 400, 400).data;

            let colors = [];

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                let max = Math.max(r, g, b);
                let min = Math.min(r, g, b);

                let s = max === 0 ? 0 : (max - min) / max;
                let v = max / 255;

                // if (v < 0.15) continue;
                // if (v > 0.95 && s < 0.1) continue;
                // if (s < 0.25) continue;

                colors.push([r, g, b]);
            }

            if (colors.length < 20) {
                resolve([
                    "#8B4513",
                    "#D4A017",
                    "#A52A2A",
                    "#1E3A8A",
                    "#228B22"
                ]);
                return;
            }

            let centers = [];

            for (let i = 0; i < 5; i++) {
                centers.push(colors[Math.floor(Math.random() * colors.length)]);
            }

            for (let k = 0; k < 15; k++) {
                let groups = [[], [], [], [], []];

                colors.forEach(p => {
                    let best = 0;
                    let dist = 999999;

                    centers.forEach((c, i) => {
                        let d =
                            (p[0] - c[0]) ** 2 +
                            (p[1] - c[1]) ** 2 +
                            (p[2] - c[2]) ** 2;

                        if (d < dist) {
                            dist = d;
                            best = i;
                        }
                    });

                    groups[best].push(p);
                });

                centers = groups.map(g => {
                    if (g.length === 0) return [0, 0, 0];

                    let r = 0;
                    let g1 = 0;
                    let b = 0;

                    g.forEach(p => {
                        r += p[0];
                        g1 += p[1];
                        b += p[2];
                    });

                    return [
                        Math.round(r / g.length),
                        Math.round(g1 / g.length),
                        Math.round(b / g.length)
                    ];
                });
            }

            resolve(
                centers.map(c =>
                    "#" +
                    c.map(x => x.toString(16).padStart(2, "0")).join("")
                )
            );
        };

        img.src = src;
    });
}

function buildRightHtml() {
    let html = "";

    html += `
    <div class="tab-content-item show" data-content="all">
        <div class="line-blue"></div>

        <div class="thumb-row">
            <img src="${fixedThumb1}">
            <img src="${fixedThumb2}">
            <img src="${fixedThumb3}">
            <img src="${fixedThumb1}">
            <img src="${fixedThumb2}">
            <img src="${fixedThumb3}">
        </div>

        <div class="text-content">
            <p>${params.text1 || ""}</p>
            <p>${params.text2 || ""}</p>
            <p>${params.text3 || ""}</p>
        </div>

        <div class="color-row">
            ${params.colors
                .split(",")
                .map(c => `
                <div class="color-item">
                    <div class="color-block" style="background:${c}"></div>
                    <span>${c}</span>
                </div>
            `)
                .join("")}
        </div>

        <div class="line-blue line-second"></div>
    </div>
    `;

    html += `
    <div class="tab-content-item" data-content="info-group">
        <div class="line-blue"></div>

        <div class="info-wrap">
            <div class="info-item" data-target="info">
                <img src="${fixedThumb1}">
                <div>
                    <h4>相关信息</h4>
                    <p>${params.infoText || ""}</p>
                </div>
            </div>

            <div class="info-item" data-target="mean">
                <img src="${fixedThumb2}">
                <div>
                    <h4>语义含义</h4>
                    <p>${params.meanText || ""}</p>
                </div>
            </div>

            <div class="info-item" data-target="story">
                <img src="${fixedThumb3}">
                <div>
                    <h4>历史故事</h4>
                    <p>${params.storyText || ""}</p>
                </div>
            </div>
        </div>

        <div class="line-blue"></div>
    </div>
    `;

    rightContainer.innerHTML = html;

    bindTabEvent();
    bindInfoClick();
}

function bindTabEvent() {
    let tabs = document.querySelectorAll(".tab-nav span");
    let contents = document.querySelectorAll(".tab-content-item");

    tabs.forEach(tab => {
        tab.onclick = function () {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            contents.forEach(c => c.classList.remove("show"));

            let key = this.dataset.tab;

            if (key === "all") {
                document.querySelector('[data-content="all"]').classList.add("show");
            } else {
                document.querySelector('[data-content="info-group"]').classList.add("show");

                document.querySelectorAll(".info-item").forEach(i => {
                    i.classList.remove("active-highlight");
                });

                let item = document.querySelector(`.info-item[data-target="${key}"]`);
                if (item) {
                    item.classList.add("active-highlight");
                }
            }
        };
    });
}

function bindInfoClick() {
    document.querySelectorAll(".info-item").forEach(item => {
        item.onclick = function () {
            document.querySelectorAll(".info-item").forEach(i => {
                i.classList.remove("active-highlight");
            });

            this.classList.add("active-highlight");

            let target = this.dataset.target;

            document.querySelectorAll(".tab-nav span").forEach(tab => {
                tab.classList.remove("active");

                if (tab.dataset.tab === target) {
                    tab.classList.add("active");
                }
            });
        };
    });
}

const playBtn = document.getElementById("audioPlayBtn");

let playing = false;

playBtn.onclick = async () => {
    if (!playing) {
        await window.playPattern(params.sound);
        playBtn.innerHTML = "Ⅱ";
        playing = true;
    } else {
        window.stopAudio();
        playBtn.innerHTML = "▶";
        playing = false;
    }
};

window.addEventListener("audio-stop", () => {
    playBtn.innerHTML = "▶";
    playing = false;
});

if (params.img) {
    extractColors(params.img).then(colors => {
        let defaultColors = [
            "#000000",
            "#ffffff",
            "#b88935",
            "#2254a8",
            "#8b4513"
        ];

        while (colors.length < 5) {
            colors.push(defaultColors[colors.length]);
        }

        params.colors = colors.slice(0, 5).join(",");

        buildRightHtml();
    });
} else {
    buildRightHtml();
}