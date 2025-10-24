document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".carrossel-depoiments");
  if (!container) return;

  const visibleCount = 3;
  const gap = 16;
  const autoplayDelay = 3000;
  const transitionDuration = 600;

  if (container.dataset.initialized === "true") return;
  container.dataset.initialized = "true";

  // --- TRACK ---
  let track = container.querySelector(".carrossel-track");
  if (!track) {
    const cards = Array.from(container.querySelectorAll(".carrossel-card"));
    track = document.createElement("div");
    track.className = "carrossel-track";
    cards.forEach(c => track.appendChild(c));
    container.appendChild(track);
  }

  Array.from(track.querySelectorAll("[data-clone='true']")).forEach(n => n.remove());

  let realCards = Array.from(track.querySelectorAll(".carrossel-card"));
  const realCount = realCards.length;
  if (realCount === 0) return;

  const clonesNeeded = visibleCount;
  if (realCount > visibleCount) {
    const lastClones = realCards.slice(-clonesNeeded).map(c => {
      const clone = c.cloneNode(true);
      clone.dataset.clone = "true";
      track.insertBefore(clone, track.firstChild);
      return clone;
    });
    const firstClones = realCards.slice(0, clonesNeeded).map(c => {
      const clone = c.cloneNode(true);
      clone.dataset.clone = "true";
      track.appendChild(clone);
      return clone;
    });
    realCards = Array.from(track.querySelectorAll(".carrossel-card"));
  }

  const leftArrow = document.querySelector(".arrow-left");
  const rightArrow = document.querySelector(".arrow-right");
  const countContainer = document.querySelector(".carrossel-count");

  // --- CONTADOR ---
  if (countContainer) {
    countContainer.innerHTML = "";
    for (let i = 0; i < realCount; i++) {
      const ball = document.createElement("div");
      ball.className = "ball";
      if (i === 0) ball.classList.add("active");
      ball.addEventListener("click", () => goTo(i));
      countContainer.appendChild(ball);
    }
  }
  const balls = countContainer ? Array.from(countContainer.querySelectorAll(".ball")) : [];

  let currentIndex = 0;
  let isTransitioning = false;
  let autoplayTimer = null;

  // --- Cálculo de largura dinâmica ---
  const computeStep = () => {
    const card = track.querySelector(".carrossel-card");
    return card ? card.getBoundingClientRect().width + gap : 0;
  };
  let step = computeStep();

  const initialOffset = realCards.length > realCount ? visibleCount * step : 0;
  track.style.transform = `translateX(-${initialOffset}px)`;

  const updateDots = () => {
    if (!balls.length) return;
    balls.forEach((b, idx) => b.classList.toggle("active", idx === currentIndex));
  };

  const animateTo = (offsetPx, callback) => {
    if (isTransitioning) return;
    isTransitioning = true;
    track.style.transition = `transform ${transitionDuration}ms ease`;
    track.style.transform = `translateX(-${offsetPx}px)`;

    const onEnd = () => {
      track.removeEventListener("transitionend", onEnd);
      isTransitioning = false;

      if (currentIndex >= realCount) {
        currentIndex = 0;
        track.style.transition = "none";
        track.style.transform = `translateX(-${initialOffset}px)`;
        void track.offsetHeight;
        track.style.transition = `transform ${transitionDuration}ms ease`;
      } else if (currentIndex < 0) {
        currentIndex = realCount - 1;
        const lastOffset = initialOffset + (realCount - 1) * step;
        track.style.transition = "none";
        track.style.transform = `translateX(-${lastOffset}px)`;
        void track.offsetHeight;
        track.style.transition = `transform ${transitionDuration}ms ease`;
      }

      if (callback) callback();
    };

    track.addEventListener("transitionend", onEnd);
  };

  const next = () => {
    if (isTransitioning) return;
    currentIndex++;
    const offset = initialOffset + currentIndex * step;
    animateTo(offset, updateDots);
  };

  const prev = () => {
    if (isTransitioning) return;
    currentIndex--;
    const offset = initialOffset + currentIndex * step;
    animateTo(offset, updateDots);
  };

  const goTo = (index) => {
    if (isTransitioning) return;
    currentIndex = index;
    const offset = initialOffset + currentIndex * step;
    animateTo(offset, updateDots);
    resetAutoplay();
  };

  leftArrow?.addEventListener("click", () => { prev(); resetAutoplay(); });
  rightArrow?.addEventListener("click", () => { next(); resetAutoplay(); });

  // --- AUTOPLAY ---
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplayDelay);
  };
  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  };
  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const topContainer = document.querySelector(".carrossel");

  // --- PAUSA HOVER (DESKTOP) ---
  topContainer?.addEventListener("mouseenter", stopAutoplay);
  topContainer?.addEventListener("mouseleave", startAutoplay);

  // --- SWIPE (MOBILE) ---
  let touchStartX = 0;
  let touchEndX = 0;

  topContainer?.addEventListener("touchstart", (e) => {
    stopAutoplay();
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  topContainer?.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0].clientX;
  }, { passive: true });

  topContainer?.addEventListener("touchend", () => {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance < 0) next();
      else prev();
    }
    resetAutoplay();
  });

  // --- Inicializa autoplay imediatamente ---
  updateDots();
  startAutoplay(); // 🚀 garante que o autoplay inicie sempre

  // --- Recalcula ao redimensionar ---
  window.addEventListener("resize", () => {
    step = computeStep();
    const offset = initialOffset + currentIndex * step;
    track.style.transition = "none";
    track.style.transform = `translateX(-${offset}px)`;
    void track.offsetHeight;
    track.style.transition = `transform ${transitionDuration}ms ease`;
  });
});
