const ICONS = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
};

function iconButton(className, label, icon) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `icon-button ${className}`;
  button.setAttribute('aria-label', label);
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[icon]}</svg>`;
  return button;
}

/**
 * Amplia as fotos num <dialog> nativo: o navegador cuida do foco preso, do
 * Esc e de devolver o foco ao fechar. Sem JavaScript, cada miniatura continua
 * sendo um link para a foto grande.
 */
export function initLightbox(root = document) {
  const links = [...root.querySelectorAll('[data-lightbox]')];
  if (!links.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Foto ampliada');

  const top = document.createElement('div');
  top.className = 'lightbox__top';
  const count = document.createElement('p');
  count.className = 'lightbox__count';
  const close = iconButton('lightbox__close', 'Fechar', 'close');
  top.append(count, close);

  const stage = document.createElement('div');
  stage.className = 'lightbox__stage';
  const prev = iconButton('lightbox__prev', 'Foto anterior', 'prev');
  const next = iconButton('lightbox__next', 'Próxima foto', 'next');
  const image = document.createElement('img');
  image.className = 'lightbox__image';
  image.decoding = 'async';
  stage.append(prev, image, next);

  const caption = document.createElement('p');
  caption.className = 'lightbox__caption';

  dialog.append(top, stage, caption);
  document.body.append(dialog);

  let index = 0;

  function show(i) {
    index = (i + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    image.src = link.href;
    image.alt = thumb.alt;
    image.width = Number(link.dataset.width);
    image.height = Number(link.dataset.height);
    caption.textContent = thumb.alt;
    count.textContent = `${index + 1} de ${links.length}`;
  }

  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      // Ctrl/Cmd+clique continua abrindo a foto numa aba nova.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      show(i);
      dialog.showModal();
    });
  });

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });

  // Clique fora da foto (no fundo do diálogo) fecha.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === stage) dialog.close();
  });

  dialog.addEventListener('close', () => {
    links[index].focus();
  });
}
