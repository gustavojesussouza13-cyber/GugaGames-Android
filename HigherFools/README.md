# Higher Fools — protótipo interno 0.1

**Não é uma publicação oficial.** Prévia técnica para validar a jogabilidade de um Foddy-like para Android antes da publicação experimental.

## Como jogar

Abra `index.html` num navegador moderno. Toque em **Começar a subir**. Arraste o dedo ao redor do Brix para apontar o martelo, apoiá-lo em plataformas e se impulsionar. O objetivo é escalar a torre de sucata. Cair faz parte da experiência, sem teletransporte nem checkpoints. Em computadores, mova o mouse para apontar; use as setas esquerda/direita ou A/D para ajustar a direção, R para reiniciar e P/Esc para pausar.

O recorde fica guardado apenas no armazenamento local do navegador. Nenhuma conta, compra ou backend é necessário.

## Estado desta entrega

- Protótipo jogável em **Canvas 2D com projeção de profundidade 2.5D** (sem dependências externas, funciona offline).
- Mecânica de martelo articulado, força de contato, colisão, gravidade e quedas, feita em JavaScript.
- Brix e torre de sucata estilizados e originais. Nix, Grok e Sora são apenas conceitos ainda indisponíveis.
- Interface retrato adaptável a celulares, pausa, reiniciar, altura e recorde local.
- Este é o **primeiro teste de física**, ainda não uma versão com modelos 3D/engine Three.js + Rapier. Esse será um incremento técnico posterior, se a jogabilidade for aprovada.

## Publicação

O código está isolado deste projeto. **Não atualizar Os Peregrinos ou outros repositórios.** A versão experimental só deverá ser hospedada em um projeto próprio; a versão oficial depende de aprovação expressa após o teste.

## Verificações realizadas

- Testado via navegador Chromium automatizado em 390×844 px com interface mobile.
- Carregamento de menu, início, aplicação de gravidade, movimento do martelo, subida/queda, pausa e ausência de erros JavaScript básicos foram verificados.
- A simulação alcançou mais de 8 metros e registrou recorde superior a 11 metros em teste guiado. O desempenho, controles reais por toque e a consistência de todas as colisões ainda precisam de validação em Android físico.
- A sensibilidade agora influencia a velocidade angular do martelo e a reinicialização redefine seu comprimento.

## Onde guardar

O protótipo está isolado dos repositórios existentes. O GitHub da conta conectada não expõe operação de criar novo repositório; portanto, o pacote independente fica preservado para futura publicação em um repositório exclusivo.