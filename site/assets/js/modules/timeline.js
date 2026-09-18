import { prefersReducedMotion } from './motion.js';

/**
 * Desenha as silhuetas de baixo para cima quando a linha do tempo entra na
 * tela. Só "arma" a animação se a linha do tempo ainda estiver fora da tela:
 * quem chega por um link direto para #historia vê o desenho pronto.
 */
export function initTimeline(root = document) {
  const timeline = root.querySelector('[data-timeline]');
  if (!timeline || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  if (timeline.getBoundingClientRect().top < window.innerHeight) return;

  timeline.classList.add('is-armed');

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      timeline.classList.add('is-drawn');
      observer.disconnect();
    },
    { threshold: 0.35 },
  );
  observer.observe(timeline);
}
