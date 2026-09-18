// Ponto de entrada. Cada módulo procura o próprio marcador na página e não
// faz nada se ele não existir, então o mesmo arquivo serve todas as páginas.
import { initCarousels } from './modules/carousel.js';
import { initLightbox } from './modules/lightbox.js';
import { initTimeline } from './modules/timeline.js';
import { initVideos } from './modules/videos.js';

initTimeline();
initCarousels();
initLightbox();
initVideos();
