import { expect, test } from '@playwright/test';

test.describe('página 404', () => {
  for (const path of ['pagina-que-nao-existe', 'pages/antiga/muito/funda.html']) {
    test(`/${path} responde 404 com a página do acervo, estilizada`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Esta página não está no acervo.',
      );

      // O <base> faz o CSS carregar em qualquer profundidade.
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(background).toBe('rgb(0, 0, 0)');

      await page.getByRole('link', { name: 'Voltar ao início' }).click();
      await expect(page).toHaveURL(/\/SITEIPHONE\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Tudo começou com 3,5 polegadas.',
      );
    });
  }
});
