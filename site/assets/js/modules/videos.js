const VIDEO_ID = /^[\w-]{11}$/;

/**
 * Fachada de vídeo: a página mostra só a miniatura (servida pelo próprio site)
 * e nada é pedido ao YouTube até a pessoa clicar. No clique, a miniatura vira
 * o player do domínio youtube-nocookie.com. Sem JavaScript, o link leva ao
 * vídeo no YouTube.
 */
export function initVideos(root = document) {
  root.querySelectorAll('[data-video]').forEach((poster) => {
    poster.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const id = poster.dataset.video;
      if (!VIDEO_ID.test(id)) return;
      event.preventDefault();

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = poster.dataset.title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      poster.replaceWith(iframe);
      iframe.focus();
    });
  });
}
