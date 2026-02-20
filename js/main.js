const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav__links");

hamburger.onclick = function () {
    hamburger.classList.toggle("hamburger_active");
    navLinks.classList.toggle("nav__links_active");
}

    ; (() => {
        const section = document.querySelector(".reviews");
        if (!section) return;

        const viewport = section.querySelector(".reviews__viewport");
        const track = section.querySelector(".reviews__track");
        const cards = Array.from(section.querySelectorAll(".reviews__card"));
        const btnPrev = section.querySelector(".reviews__arrow--left");
        const btnNext = section.querySelector(".reviews__arrow--right");
        const dotsWrap = section.querySelector(".reviews__dots");

        let page = 0;
        let pages = 1;
        let perView = 3;

        const getGapPx = () => {
            const styles = window.getComputedStyle(track);
            const gap = parseFloat(styles.gap || styles.columnGap || "0");
            return Number.isFinite(gap) ? gap : 0;
        };

        // ВАЖНО: matchMedia стабильно совпадает с CSS media queries
        const getPerView = () => {
            if (window.matchMedia("(max-width: 700px)").matches) return 1;
            if (window.matchMedia("(max-width: 1100px)").matches) return 2;
            return 3;
        };

        const maxTranslate = () => {
            const gap = getGapPx();
            const trackWidth = track.scrollWidth;
            const viewWidth = viewport.clientWidth;
            return Math.max(0, trackWidth - viewWidth + gap);
        };

        const renderDots = () => {
            dotsWrap.innerHTML = "";

            for (let i = 0; i < pages; i++) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "reviews__dot" + (i === page ? " is-active" : "");
                b.setAttribute("aria-label", `Перейти к отзывам: страница ${i + 1}`);
                b.addEventListener("click", () => {
                    page = i;
                    update();
                });
                dotsWrap.appendChild(b);
            }
        };

        const update = () => {
            if (!cards.length) return;

            const gap = getGapPx();
            const cardW = cards[0].getBoundingClientRect().width;

            const step = cardW + gap;
            let translate = page * step * perView;

            const maxT = maxTranslate();
            translate = Math.max(0, Math.min(translate, maxT));

            track.style.transform = `translateX(${-Math.round(translate)}px)`;

            btnPrev.disabled = page <= 0;
            btnNext.disabled = page >= pages - 1;

            const dots = Array.from(dotsWrap.querySelectorAll(".reviews__dot"));
            dots.forEach((d, i) => d.classList.toggle("is-active", i === page));
        };

        const compute = () => {
            perView = getPerView();

            // 9 отзывов:
            // phone perView=1 => 9 точек
            // tablet perView=2 => 5 точек (ceil(9/2)=5)
            pages = Math.max(1, Math.ceil(cards.length / perView));
            page = Math.min(page, pages - 1);

            renderDots();

            // ждём кадр + ещё кадр (на мобилках иногда нужно)
            requestAnimationFrame(() => requestAnimationFrame(update));
        };

        btnPrev.addEventListener("click", () => {
            page = Math.max(0, page - 1);
            update();
        });

        btnNext.addEventListener("click", () => {
            page = Math.min(pages - 1, page + 1);
            update();
        });

        window.addEventListener("resize", compute);
        window.addEventListener("orientationchange", compute);
        window.addEventListener("load", compute);

        // старт
        compute();
    })();

(() => {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("imgModalImg");
    if (!modal || !modalImg) return;

    // Кликаем по картинкам в отзывах
    document.addEventListener("click", (e) => {
        const img = e.target.closest(".reviews__img");
        if (!img) return;

        modalImg.src = img.src;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    });

    // Закрытие: по оверлею/кнопке
    modal.addEventListener("click", (e) => {
        const close = e.target.closest('[data-close="true"]');
        if (!close) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modalImg.src = "";
        document.body.style.overflow = "";
    });

    // Закрытие: Esc
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!modal.classList.contains("is-open")) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modalImg.src = "";
        document.body.style.overflow = "";
    });
})();
