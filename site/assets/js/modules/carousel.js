import { prefersReducedMotion } from './motion.js';

const INTERVAL_MS = 7000;

/**
 * Carrossel sobre rolagem nativa (scroll-snap): arrastar no celular e rolar
 * com o trackpad funcionam sem código. O JavaScript só acrescenta setas,
 * pontos, teclado e a rotação automática, que pode ser pausada (WCAG 2.2.2)
 * e nem começa para quem pediu menos movimento.
 */
export function initCarousels(root = document) {
  root.querySelectorAll('[data-carousel]').forEach(setupCarousel);
}

function setupCarousel(carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = [...track.children];
  const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  const toggle = carousel.querySelector('[data-carousel-toggle]');

  let current = 0;
  let pending = -1; // slide pedido pelos controles que a rolagem ainda não alcançou
  let timer = 0;
  let playing = !prefersReducedMotion();
  let hovered = false;
  let focused = false;

  function show(index) {
    current = (index + slides.length) % slides.length;
    pending = current;
    track.scrollTo({
      left: slides[current].offsetLeft,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
    markCurrent();
  }

  function markCurrent() {
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  }

  function schedule() {
    window.clearTimeout(timer);
    if (!playing || hovered || focused || document.hidden) return;
    timer = window.setTimeout(() => {
      show(current + 1);
      schedule();
    }, INTERVAL_MS);
  }

  function setPlaying(value) {
    playing = value;
    toggle.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pausar a rotação' : 'Retomar a rotação');
    // Com a rotação parada, leitores de tela anunciam cada troca de slide.
    track.setAttribute('aria-live', playing ? 'off' : 'polite');
    schedule();
  }

  // Quem navega por conta própria assume o controle: a rotação para.
  function navigate(index) {
    setPlaying(false);
    show(index);
  }

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => {
    navigate(current - 1);
  });
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => {
    navigate(current + 1);
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => navigate(i)));
  toggle.addEventListener('click', () => setPlaying(!playing));

  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    navigate(current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  // Mantém os pontos certos quando a pessoa arrasta com o dedo. Só lê a
  // posição depois que a rolagem para: durante uma animação disparada pelas
  // setas, os slides do meio passam pela tela e não podem virar o "atual".
  let settle = 0;
  track.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const settled = Math.round(track.scrollLeft / track.clientWidth);
        // O Chrome descarta um scrollTo suave pedido no meio de outro (dois
        // cliques rápidos). Se parou no slide errado, completa sem animação.
        if (pending !== -1 && settled !== pending) {
          track.scrollTo({ left: slides[pending].offsetLeft, behavior: 'instant' });
          pending = -1;
          return;
        }
        pending = -1;
        current = settled;
        markCurrent();
      }, 120);
    },
    { passive: true },
  );

  carousel.addEventListener('pointerenter', () => {
    hovered = true;
    schedule();
  });
  carousel.addEventListener('pointerleave', () => {
    hovered = false;
    schedule();
  });
  carousel.addEventListener('focusin', () => {
    focused = true;
    schedule();
  });
  carousel.addEventListener('focusout', (event) => {
    focused = carousel.contains(event.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);

  carousel.classList.add('is-ready');
  markCurrent();
  setPlaying(playing);
}
