import { expect, test } from '@playwright/test';

test.describe('vídeos', () => {
  test('nada vai ao YouTube até o clique, e aí só ao domínio nocookie', async ({ page }) => {
    const youtube = [];
    // O CI não fala com o YouTube de verdade: o player é trocado por uma página vazia.
    await page.route(/youtube/, (route) => {
      youtube.push(route.request().url());
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>player</title>',
      });
    });

    await page.goto('pages/videos.html');
    await expect(page.getByRole('link', { name: /^Assistir:/ })).toHaveCount(4);
    expect(youtube).toEqual([]);

    await page.getByRole('link', { name: 'Assistir: Conheça o novo iPhone 18 Pro' }).click();
    const player = page.locator('iframe[title="Conheça o novo iPhone 18 Pro"]');
    await expect(player).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/mG_MQL5OcA4?autoplay=1&rel=0',
    );
    await expect(player).toBeFocused();
    await expect.poll(() => youtube.length).toBeGreaterThan(0);
    for (const url of youtube) expect(url).toMatch(/^https:\/\/www\.youtube-nocookie\.com\//);
  });

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('cada vídeo é um link para o YouTube', async ({ page }) => {
      await page.goto('pages/videos.html');
      await expect(
        page.getByRole('link', { name: 'Assistir: Detetives em Zoom de 8x' }),
      ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=97aM_ecZ6gQ');
    });
  });
});
