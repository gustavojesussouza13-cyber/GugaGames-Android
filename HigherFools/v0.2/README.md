# Higher Fools — prévia interna v0.2

**Esta versão é um protótipo 2.5D local, não uma versão 3D definitiva nem a publicação experimental/oficial.**

## O que mudou desde v0.1

- Brix redesenhado com cabeça cúbica maior, olhos salientes, sorriso e camisa vermelha, próximo do conceito aprovado.
- Retratos geométricos de Brix, Nix, Grok e Sora substituem emojis no seletor (apenas Brix é jogável).
- Cenário redesenhado com vigas de andaime, estruturas em diagonal, madeira sombreada, caixas reforçadas, metal, geladeiras, barris, pneus, cordas e neblina atmosférica.
- Gradientes, superfícies extrudadas, sombreamento e parallax dão uma sensação maior de volume sem criar colisões invisíveis.
- Mensagens e menus em português, recorde local, pausa, reinício, controles por toque/mouse.

## Como abrir

Abra `index.html` em Chrome/Safari/Firefox atualizado. Toque em **Começar a subir**. Arraste o dedo para orientar o martelo e toque-o no chão e nas plataformas para impulsionar o corpo; o progresso é perdido ao cair. No computador use mouse para apontar e R para reiniciar.

## O que os testes comprovaram

- Chromium simulado em 390×844, 320×720 e 844×390, DPR 2.
- Menu, início, HUD, renderização, toque (eventos de touch emulados), pausa e reset executados sem erros JS.
- Física preservada: testes matemáticos alcançaram cerca de 11 metros usando ângulos do martelo de apoio no chão.

## Limitações ainda pendentes

- O render desta entrega é **2.5D Canvas, não modelos 3D reais em Three.js**. O conceito artístico aprovado exige uma reconstrução futura em geometria 3D, materiais e iluminação melhores.
- Brix, controles, física e posições das plataformas precisam de testes adicionais num Android físico; a ergonomia, trajetórias de queda e escalabilidade do gameplay não estão aprovadas.
- Outros três personagens são prévias visuais, ainda não possuem mecânicas específicas.
- Nenhum deploy Render, build APK ou publicação oficial feito.

## Segurança do projeto

Arquivos da v0.1 permanecem no GitHub sem alterações. O protótipo v0.2 está em `HigherFools/v0.2/` na branch isolada `higher-fools-prototipo` do repositório `GugaGames-Android`. Este caminho **não** modifica Os Peregrinos ou outros jogos. A versão oficial requer aprovação expressa do proprietário após avaliação da versão experimental.