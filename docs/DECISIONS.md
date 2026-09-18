# Decisões

Por que o site é do jeito que é. Cada item diz o que foi decidido, por quê e o que ficou de fora.

## Conteúdo

**O site virou um acervo.** Os modelos da versão de 2023 (iPhone 13 Pro, 13, 12 e SE de 3ª
geração) eram a linha à venda em 2022. Em vez de trocar por aparelhos atuais, que envelheceriam do
mesmo jeito, a página assume o que eles são: "A linha de 2022". A linha do tempo da página inicial
cobre o resto da história, de 2007 a 2025.

**A marca é própria.** O logo da Apple saiu do cabeçalho e os botões "Comprar" (que levavam para `#`)
viraram ficha técnica. Com o logo e um botão de compra, o site se passava por um site da Apple. O
rodapé diz que é um projeto de estudo sem vínculo com a empresa.

**Texto escrito do zero.** A seção de história da versão antiga era copiada da Wikipédia. A linha do
tempo e as fichas técnicas foram escritas de novo, e o chip do iPhone 12 foi corrigido (A14, não A15).

**Vídeos novos.** Os quatro vídeos da versão antiga estão privados no YouTube. Entraram quatro vídeos
públicos da Apple Brasil, e a página diz isso. Vídeo de marca sai do ar com o tempo; por isso cada um
também é um link comum para o YouTube, e o site mostra uma miniatura própria em vez do player.

## Linha do tempo em escala

As silhuetas são desenhadas em CSS a partir da altura e da largura oficiais de cada modelo
(`--h` e `--w`, em milímetros, multiplicados por `--mm`). Tela, cantos, botão de início, entalhe e
Dynamic Island são aproximados, e o texto avisa disso. Desenho em CSS em vez de foto porque as fotos
de produto não estão na mesma escala nem no mesmo ângulo, o que desmentiria a comparação.

O teste `tests/timeline.spec.js` garante que as medidas do desenho são as mesmas do texto e que todos
os aparelhos usam a mesma escala.

## Sem framework e sem build

O site tem quatro páginas estáticas. Um framework ou um bundler resolveria problemas que ele não tem
e colocaria uma etapa de build entre o código e o que vai ao ar. O Node é usado só para as
ferramentas de qualidade (lint, testes, Lighthouse), todas em `devDependencies`.

O cabeçalho e o rodapé se repetem em cada HTML. É o preço de não ter build; a alternativa seria
montá-los com JavaScript, e aí o conteúdo principal deixaria de estar no HTML.

## Sem jQuery e sem plugins

A versão antiga carregava 127 KB de jQuery, bxSlider e Magnific Popup para um carrossel e um
lightbox. Hoje o navegador faz quase tudo sozinho:

- **Carrossel:** `scroll-snap` cuida do arrastar e do encaixe. O JavaScript acrescenta setas, pontos,
  teclado e a rotação automática com pausa. O Chrome descarta um `scrollTo` suave pedido no meio de
  outro (dois cliques rápidos); o carrossel confere a posição quando a rolagem para e corrige.
- **Lightbox:** `<dialog>` com `showModal()` já prende o foco, fecha com Esc e devolve o foco.
- **Vídeo:** uma fachada (miniatura + botão). O player do `youtube-nocookie.com` só é criado no clique.

## Privacidade e segurança

Site estático tem superfície de ataque pequena. O que importa aqui é não vazar o visitante para
terceiros sem ele saber:

- Fonte hospedada no próprio site (antes vinha do Google Fonts, que recebia o IP de cada visitante).
- Miniaturas dos vídeos servidas pelo site; o YouTube só é contatado no clique, e pelo domínio
  `youtube-nocookie.com`.
- CSP por `<meta>` (o GitHub Pages não permite configurar cabeçalhos): só recursos do próprio site e
  o player do YouTube. `frame-ancestors` não funciona via `<meta>` e ficou de fora.

Os testes conferem que nenhuma página faz pedido a outro domínio ao carregar.

## Design

- **Paleta:** preto (o fundo da foto do iPhone de 2007, que se funde com a página), cinza de galeria
  `#eceef1`, tinta `#15171a` e o Azul-Sierra `#9bb5ce` do acabamento do iPhone 13 Pro, com a versão
  escura `#2c5a87` para texto. Todo texto passa o contraste AA do WCAG.
- **Tipografia:** Instrument Sans (com eixo de largura: os títulos usam a versão estreita) e IBM Plex
  Mono nas etiquetas, anos e medidas, como etiqueta de museu.
- **Movimento:** só dois momentos, a entrada da abertura e as silhuetas subindo quando a linha do tempo
  aparece. Os dois somem para quem pediu ao sistema para reduzir movimento.
- **Menu no celular:** com quatro links, uma segunda linha no cabeçalho é mais simples e mais rápida de
  usar do que um botão de menu que esconde tudo.

## Deploy

O GitHub Pages publica a partir do workflow de CI, e só na `main`, depois que estilo, links, testes e
Lighthouse passam. Só a pasta `site/` vai ao ar. As URLs antigas (`/pages/modelos.html` etc.)
continuam as mesmas.

## Fora do escopo

- **Tema escuro automático:** a paleta já alterna seções claras e escuras de propósito, como numa
  página de produto.
- **`robots.txt` e `sitemap.xml`:** num site de projeto do GitHub Pages (`usuario.github.io/projeto`),
  os buscadores só leem o `robots.txt` da raiz do domínio, que não é deste repositório.
- **Análise de visitas:** nenhum script de terceiros.
