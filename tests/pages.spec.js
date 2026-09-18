import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: './', h1: 'Tudo começou com 3,5 polegadas.' },
  { path: 'pages/modelos.html', h1: 'A linha de 2022.', current: 'Modelos' },
  { path: 'pages/fotos.html', h1: 'Feitas com iPhone.', current: 'Fotos' },
  { path: 'pages/videos.html', h1: 'Campanhas em vídeo.', current: 'Vídeos' },
];

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Rola a página inteira para as imagens com loading="lazy" carregarem. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  });
  await page.waitForLoadState('networkidle');
}

for (const { path, h1, current } of PAGES) {
  test.describe(`página ${path}`, () => {
    test('carrega inteira sem erro, sem terceiros e sem rolagem lateral', async ({
      page,
      baseURL,
    }) => {
      const origin = new URL(baseURL).origin;
      const problems = [];
      page.on('console', (msg) => msg.type() === 'error' && problems.push(msg.text()));
      page.on('pageerror', (error) => problems.push(error.message));
      page.on('request', (req) => {
        if (!req.url().startsWith(origin)) problems.push(`terceiro: ${req.url()}`);
      });
      page.on('response', (res) => {
        if (res.status() >= 400) problems.push(`${res.status()} ${res.url()}`);
      });

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      await scrollThrough(page);

      // Só as imagens do HTML: a do lightbox nasce vazia e só recebe foto ao abrir.
      const images = await page.$$eval('img:not(.lightbox__image)', (imgs) =>
        imgs.map((img) => ({
          src: img.getAttribute('src'),
          sized: img.hasAttribute('width') && img.hasAttribute('height'),
          loaded: img.complete && img.naturalWidth > 0,
        })),
      );
      for (const image of images) {
        expect(image.sized, `${image.src} sem width/height`).toBe(true);
        expect(image.loaded, `${image.src} não carregou`).toBe(true);
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'a página rola para o lado').toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });

    test('não tem violações de acessibilidade (axe, WCAG 2.2 AA)', async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      // Espera as animações de entrada terminarem: texto no meio de um fade
      // daria falso alarme de contraste.
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(violations).toEqual([]);
    });

    test('tem título, descrição, canonical e o link de pular para o conteúdo', async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(/Arquivo iPhone/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        /^https:\/\/tiagosaile\.github\.io\/SITEIPHONE\//,
      );

      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
    });

    if (current) {
      test('marca a página atual no menu', async ({ page }) => {
        await page.goto(path);
        const nav = page.getByRole('navigation', { name: 'Principal' });
        await expect(nav.locator('[aria-current="page"]')).toHaveText(current);
      });
    }
  });
}
