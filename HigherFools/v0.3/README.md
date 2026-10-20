# HIGHER FOOLS — Protótipo 3D interno v0.3

**Esta é uma versão interna para avaliação, e NÃO um lançamento experimental no Render nem uma versão oficial.**

## O que mudou

- Renderização de geometria tridimensional REAL: WebGL usando shaders, meshes 3D, câmera em perspectiva, iluminação direcional e profundidade (sem usar a ilustração aprovada como imagem de fundo).
- Renderer alternativo de software com projeção de triângulos 3D para dispositivos sem WebGL (mais lento; o motor principal é WebGL).
- Personagem BRIX 3D com cabeça cúbica, olhos salientes, camisa vermelha, membros e martelo em volumes geométricos.
- Torre de sucata com ~35 mil triângulos estáticos: andaimes, caixas, barris, geladeiras, cordas, plataformas e obstáculos.
- Física de impacto e gravidade preservada e calculada num plano lateral (2D dentro da cena 3D); contato do martelo gera impulso, e não voo nem teletransporte.
- HUD de altura/recorde, pausa, retomada e reinício; tela de seleção com NIX, GROK e SORA marcados como ainda indisponíveis; qualidade gráfica configurável.
- Toque e mouse para orientar o martelo, layout retrato e paisagem.

## Como abrir no celular

- Mais simples: transfira `Higher_Fools_v0.3_jogar.html` para o dispositivo e abra-o em Chrome/Firefox atualizado. Tudo está incluído no HTML, sem rede.
- Alternativa: descompacte o ZIP, mantenha `index.html`, `style.css` e `game.js` na mesma pasta e abra o `index.html`.

O personagem se move usando apenas o martelo, apontado arrastando o dedo. Aperte `Ⅱ` para pausar, `↺` para reiniciar. No computador: mouse para apontar, `R` para reiniciar e `P` para pausar.

## Validação realizada

- `node --check` passou no código JavaScript.
- Chromium headless com 390×844, 320×720 e 844×390 validou carregamento, início, pausa, retomada, reinício e ausência de erros JS.
- Teste programático de colisão com martelo na vertical atingiu aproximadamente 0,98 m de altura, partindo do chão.
- O navegador automatizado desta sessão bloqueou WebGL: as capturas e o teste visual foram executados pelo renderer alternativo de software, não comprovam o pipeline WebGL acelerado em Android. Necessária validação em celular físico antes do lançamento.

## Limitações reais

- **Ainda não alcança o acabamento, densidade de texturas e iluminação da ilustração aprovada.** É uma etapa técnica com arte 3D geométrica feita do zero, não a arte final.
- Física é 2D restrita à lateral, não corpos rígidos completos em Rapier.
- Brix é o único personagem jogável; Nix, Grok e Sora estão em desenvolvimento.
- Sem áudio final, sem API multiplayer e sem APK nativo.
- Não publicar oficialmente sem aprovação explícita do usuário após validação da versão experimental.

## Origem

Projeto separado em `GugaGames-Android`, branch `higher-fools-prototipo`, pasta `HigherFools/v0.3/`. Não altera o jogo Os Peregrinos e não altera a branch principal.