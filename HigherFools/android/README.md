# Higher Fools — APK Android experimental (v0.3.1)

Esta pasta contém o projeto Android que empacota a versão web 3D 0.3.1 original, preservando seu código e o MP3 de 29,7 segundos. O APK contém todo o conteúdo localmente, inclusive a música, e não necessita de internet para executar.

O jogo roda dentro de um WebView Android em tela cheia e orientação retrato. WebGL depende da implementação de Android System WebView do dispositivo. Toque em **Começar a subir** para iniciar o jogo; o tema começa com o primeiro toque e repete automaticamente sem controles de som dentro do jogo. As teclas físicas de volume do aparelho continuam funcionando.

**Compilação:** GitHub Actions, workflow `higher-fools-android.yml`, gera `app-debug.apk` assinado com a chave de depuração. Este arquivo é somente para instalação e testes pessoais; não deve ser publicado na Play Store como lançamento oficial. `minSdk 26`, `targetSdk 35`.

A compilação copia arquivos originais de `HigherFools/v0.3.1` para `app/src/main/assets`. Não editar `Os Peregrinos` nem a branch `main`.
