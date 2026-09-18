import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('galeria de fotos', () => {
  test('amplia a foto, passa pelas setas e devolve o foco ao fechar', async ({ page }) => {
    await page.goto('pages/fotos.html');
    const links = page.locator('[data-lightbox]');
    await expect(links).toHaveCount(8);

    await links.nth(2).click();
    const dialog = page.getByRole('dialog', { name: 'Foto ampliada' });
    const count = dialog.locator('.lightbox__count');
    const image = dialog.getByRole('img');

    await expect(dialog).toBeVisible();
    await expect(count).toHaveText('3 de 8');
    await expect(image).toHaveAttribute('src', /friends-sky\.webp$/);
    await expect(image).toHaveAttribute('alt', /Quatro amigos/);
    await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBe(1358);

    await page.keyboard.press('ArrowRight');
    await expect(count).toHaveText('4 de 8');
    await dialog.getByRole('button', { name: 'Foto anterior' }).click();
    await expect(count).toHaveText('3 de 8');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(links.nth(2)).toBeFocused();
  });

  test('da primeira foto, "anterior" vai para a última', async ({ page }) => {
    await page.goto('pages/fotos.html');
    await page.locator('[data-lightbox]').first().click();
    const dialog = page.getByRole('dialog', { name: 'Foto ampliada' });
    await dialog.getByRole('button', { name: 'Foto anterior' }).click();
    await expect(dialog.locator('.lightbox__count')).toHaveText('8 de 8');
    await dialog.getByRole('button', { name: 'Fechar' }).click();
    await expect(dialog).toBeHidden();
  });

  test('não tem violações de acessibilidade com a foto aberta', async ({ page }) => {
    await page.goto('pages/fotos.html');
    await page.locator('[data-lightbox]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).include('.lightbox').analyze();
    expect(violations).toEqual([]);
  });

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('a miniatura continua sendo um link para a foto grande', async ({ page }) => {
      await page.goto('pages/fotos.html');
      await page.locator('[data-lightbox]').nth(2).click();
      await expect(page).toHaveURL(/assets\/img\/photos\/friends-sky\.webp$/);
    });
  });
});
