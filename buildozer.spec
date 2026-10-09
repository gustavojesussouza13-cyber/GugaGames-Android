[app]
title = GugaGames
package.name = gugagames
package.domain = com.gugagames.pescaria
source.dir = .
source.include_exts = py,png,jpg,json,ttf
source.exclude_dirs = tests,.github,__pycache__,.git
version = 1.0.0
requirements = python3,kivy==2.3.1
orientation = portrait
fullscreen = 1
icon.filename = %(source.dir)s/assets/icone.png
presplash.filename = %(source.dir)s/assets/abertura.png
android.api = 35
android.minapi = 24
android.archs = arm64-v8a
android.accept_sdk_license = True
# Nenhuma permissao de internet, camera ou acesso a arquivos necessaria.
android.permissions =

[buildozer]
log_level = 2
warn_on_root = 1