"""GugaGames Mobile — Pescaria 2D criada em Python e Kivy, sem internet."""
import json
import math
import os
from pathlib import Path

from kivy.app import App
from kivy.clock import Clock
from kivy.core.text import Label as CoreLabel
from kivy.core.window import Window
from kivy.graphics import (
    Color, Ellipse, Line, PopMatrix, PushMatrix, Rectangle,
    RoundedRectangle, Scale, Translate, Triangle,
)
from kivy.uix.widget import Widget

from game_logic import FishingGame, WIDTH, HEIGHT, HOOK_START, WATERLINE


class GugaCanvas(Widget):
    def __init__(self, game, **kwargs):
        super().__init__(**kwargs)
        self.game = game
        self.frame_time = 0
        self.touch_buttons = {}
        self.keyboard_left = False
        self.keyboard_right = False
        self.text_cache = {}
        self.bind(size=lambda *_: self.draw_game(), pos=lambda *_: self.draw_game())
        Window.bind(on_key_down=self.key_down, on_key_up=self.key_up)
        Clock.schedule_interval(self.tick, 1 / 45)

    def key_down(self, _window, key, _scancode, _codepoint, _modifiers):
        if key in (276, 97):
            self.keyboard_left = True
        if key in (275, 100):
            self.keyboard_right = True
        if key in (32, 13):
            if self.game.state in ('menu', 'won', 'lost'):
                self.start_game()
            elif self.game.state == 'playing':
                self.game.cast()
        if key in (112, 27):
            self.game.toggle_pause()
        self.sync_buttons()
        return True

    def key_up(self, _window, key, _scancode):
        if key in (276, 97):
            self.keyboard_left = False
        if key in (275, 100):
            self.keyboard_right = False
        self.sync_buttons()
        return True

    def tick(self, dt):
        self.frame_time += min(dt, 0.05)
        before = self.game.state
        self.game.update(dt)
        if before != 'won' and self.game.state == 'won':
            App.get_running_app().save_records()
        self.draw_game()

    def scale_values(self):
        scale = min(self.width / WIDTH, self.height / HEIGHT) if self.width and self.height else 1
        return scale, self.x + (self.width - WIDTH * scale) / 2, self.y + (self.height - HEIGHT * scale) / 2

    def point_from_screen(self, touch):
        scale, ox, oy = self.scale_values()
        return (touch.x - ox) / scale, (touch.y - oy) / scale

    def start_game(self):
        self.game.reset()
        self.touch_buttons.clear()
        self.sync_buttons()

    def sync_buttons(self):
        values = set(self.touch_buttons.values())
        self.game.left = self.keyboard_left or 'left' in values
        self.game.right = self.keyboard_right or 'right' in values

    def on_touch_down(self, touch):
        px, py = self.point_from_screen(touch)
        state = self.game.state
        if state in ('menu', 'won', 'lost'):
            if 25 <= px <= 395 and 180 <= py <= 425:
                self.start_game()
            return True
        if state == 'paused':
            self.game.toggle_pause()
            return True
        if 750 <= py <= 830 and px >= 333:
            self.game.toggle_pause()
        elif 0 <= py <= 120:
            if 13 <= px <= 103:
                self.touch_buttons[touch.uid] = 'left'
            elif 106 <= px <= 197:
                self.touch_buttons[touch.uid] = 'right'
            elif 198 <= px <= 418:
                self.game.cast()
        elif 125 < py < 710:
            self.touch_buttons[touch.uid] = 'aim'
            self.game.set_position(px)
        self.sync_buttons()
        return True

    def on_touch_move(self, touch):
        if self.touch_buttons.get(touch.uid) == 'aim':
            px, _ = self.point_from_screen(touch)
            self.game.set_position(px)
        return True

    def on_touch_up(self, touch):
        self.touch_buttons.pop(touch.uid, None)
        self.sync_buttons()
        return True

    @staticmethod
    def color(rgb, alpha=1):
        Color(*rgb, alpha)

    def rect(self, x, y, w, h, c, a=1, r=0):
        Color(*c, a)
        if r:
            RoundedRectangle(pos=(x, y), size=(w, h), radius=[r])
        else:
            Rectangle(pos=(x, y), size=(w, h))

    def oval(self, x, y, w, h, c, a=1):
        Color(*c, a)
        Ellipse(pos=(x, y), size=(w, h))

    def line(self, points, c, width=2, alpha=1):
        Color(*c, alpha)
        Line(points=points, width=width, joint='round', cap='round')

    def triangle(self, pts, c, a=1):
        Color(*c, a)
        Triangle(points=pts)

    def text(self, value, x, y, size=18, color=(1, 1, 1), bold=False, align='center'):
        value = str(value)
        key = (value, int(size), bool(bold))
        texture = self.text_cache.get(key)
        if texture is None:
            label = CoreLabel(text=value, font_size=size, bold=bold)
            label.refresh()
            texture = label.texture
            if len(self.text_cache) >= 200:
                self.text_cache.clear()
            self.text_cache[key] = texture
        w, h = texture.size
        if align == 'center':
            x -= w / 2
        elif align == 'right':
            x -= w
        Color(*color, 1)
        Rectangle(pos=(x, y - h / 2), size=(w, h), texture=texture)

    def fish_shape(self, fish, demo=False):
        x, y, z, d = fish.x, fish.y, fish.size, fish.direction
        y += math.sin(self.frame_time * 2.7 + fish.phase) * 5
        if demo:
            x, y, z, d = 210, 590, 2.05, 1
        if fish.guga:
            pulse = 1 + math.sin(self.frame_time * 4) * 0.1
            self.oval(x - 48 * z * pulse, y - 35 * z * pulse, 96 * z * pulse, 78 * z * pulse, (1, .74, .20), .11)
            self.oval(x - 39 * z, y - 27 * z, 78 * z, 54 * z, (1, .85, .28), .13)
        c = fish.color
        dark = tuple(v * .66 for v in c)
        light = tuple(min(1, v * 1.12 + .04) for v in c)
        self.triangle([x - d * 24*z, y, x-d*49*z, y+20*z, x-d*47*z, y-20*z], dark)
        self.triangle([x-9*z,y+8*z, x+2*z,y+25*z, x+13*z,y+7*z], dark)
        self.oval(x-31*z, y-16*z, 62*z, 32*z, c)
        self.oval(x-12*z, y+2*z, 31*z, 9*z, light, .8)
        self.oval(x+d*18*z-4*z, y+1*z, 7*z, 7*z, (1,1,1))
        self.oval(x+d*19*z-2*z, y+2*z, 4*z, 4*z, (.02,.10,.22))
        if fish.guga:
            # Crown: the three golden points unmistakably identify Guga.
            self.triangle([x-18*z,y+20*z, x-18*z,y+42*z, x-4*z,y+25*z], (1, .89, .35))
            self.triangle([x-8*z,y+25*z, x,y+50*z, x+8*z,y+25*z], (1, .94, .40))
            self.triangle([x+4*z,y+25*z, x+18*z,y+42*z, x+18*z,y+20*z], (1, .89, .35))
            self.rect(x-19*z, y+18*z, 38*z, 10*z, (1, .69, .18), r=2)
            self.oval(x-3*z, y+25*z, 6*z, 6*z, (.99,.38,.37))
            if not demo:
                self.rect(x-36, y-39*z, 72, 23, (.03,.19,.30), .8, 11)
                self.text('GUGA', x, y-39*z+11, 16, (1,.92,.46), True)

    def background(self):
        # Night-blue / turquoise sea with sunset, no image files required.
        self.rect(0, 0, WIDTH, HEIGHT, (.025, .095, .19))
        for i in range(22):
            k = i / 21
            self.rect(0, WATERLINE+i*10, WIDTH, 11, (.04+.10*k,.17+.20*k,.30+.22*k))
        self.oval(286, 698, 82, 82, (1,.72,.35), .16)
        self.oval(304, 716, 46, 46, (1,.85,.49))
        for i in range(3):
            x = ((i * 161 + self.frame_time * 8) % 550) - 90
            yy = 710 + 30 * (i % 2)
            self.oval(x, yy, 92, 22, (1, 1, 1), .11)
            self.oval(x+24, yy+9, 60, 27, (1, 1, 1), .11)
        # horizon and distant land
        self.triangle([0, WATERLINE, 0, 641, 171, WATERLINE], (.12,.35,.42))
        self.triangle([238, WATERLINE, 420, 645, 420, WATERLINE], (.10,.31,.39))
        for i in range(27):
            k=i/26
            self.rect(0, i*24, WIDTH, 24, (.012+.03*k,.11+.28*k,.20+.26*k))
        for j in range(3):
            points=[]
            for i in range(35):
                x=i*13
                y=WATERLINE-7-j*15+math.sin(i*.60+self.frame_time*(1.2+j*.18)+j*1.3)*2.8
                points.extend((x,y))
            self.line(points, (.31,.85,.84) if j==0 else (.11,.64,.73), 1.6, .40)
        # seabed + simple corals / sea plants
        self.rect(0, 0, WIDTH, 48, (.055,.21,.29))
        for i in range(12):
            x=(i*39+19)%430
            h=28+(i*13)%42
            self.line([x,35, x-10, 35+h*.56, x-8,35+h], (.08,.51,.44), 2.6,.68)
            self.line([x,35, x+9, 35+h*.55, x+13, 35+h*.77], (.06,.43,.45), 2.2,.65)
        for i in range(22):
            x=(i*67+23)%420
            y=116+(i*41)%440
            yy=(y+self.frame_time*(9+(i%4)*4))%555+54
            self.oval(x+math.sin(self.frame_time+i)*2, yy, 3+(i%3)*2, 3+(i%3)*2, (.6,.96,1),.20)

    def boat(self):
        x=self.game.player_x
        self.oval(x-65, 621, 135, 11, (.01,.12,.21), .3)
        self.triangle([x-52,654,x+63,654,x+37,626], (.93,.32,.24))
        self.triangle([x-52,654,x+37,626,x-30,626], (.79,.20,.22))
        self.rect(x-19,654,45,20,(.97,.76,.42),r=5)
        self.rect(x+4,667,25,15,(.19,.45,.52),r=4)
        self.line([x+10,685,x+27,706], (.97,.88,.66), 3)
        self.oval(x+2,680,12,12,(.98,.82,.58))
        # Rod attached to the boat; the line stays aligned with the hook.
        self.line([x+28,670, x+8,696,x,705],(.14,.17,.23),4)
        self.line([x,705,x, self.game.hook_y],(.83,.92,.95),1.3,.85)
        if self.game.casting:
            hy=self.game.hook_y
            self.line([x-7,hy+10,x,hy,x+7,hy+10],(.84,.91,.97),2)
        else:
            self.line([x-5,618,x,611,x+5,618],(.9,.97,.99),1.5)

    def buttons(self):
        self.rect(0,0,WIDTH,116,(.015,.07,.14), .96)
        active = set(self.touch_buttons.values())
        for x,width,label,on in [(15,86,'◀', 'left' in active or self.game.left), (109,86,'▶','right' in active or self.game.right)]:
            self.rect(x,19,width,75,(.16,.47,.59) if on else (.075,.29,.41),1,18)
            self.text(label,x+width/2,56,34,(.89,1,1),True)
        cast_color=(.89,.52,.19) if self.game.casting else (1,.73,.27)
        self.rect(203,19,202,75,cast_color,1,19)
        self.text('PESCAR',304,57,23,(.12,.18,.21),True)
        self.text('LANÇAR ANZOL',304,34,11,(.17,.24,.29),True)

    def hud(self):
        self.rect(15,737,389,85,(.018,.10,.20),.82,20)
        self.text('GUGAGAMES',30,804,18,(1,.87,.49),True,'left')
        self.text('GUGA EDITION',30,784,10,(.57,.91,.96),True,'left')
        self.text('TEMPO',220,800,11,(.71,.84,.89),True)
        self.text(str(math.ceil(self.game.time_left))+'s',220,773,27,(1,.46,.43) if self.game.time_left < 16 else (1,1,1),True)
        self.text('ERROS',305,800,11,(.71,.84,.89),True)
        self.text(str(self.game.wrong_catches),305,773,27,(1,1,1),True)
        self.rect(354,764,41,39,(.11,.33,.43),1,12)
        self.text('Ⅱ',375,784,24,(1,1,1),True)
        self.text('Encontre o peixe dourado de coroa!',210,715,14,(.91,.99,1),True)
        if self.game.flash_seconds > 0:
            self.rect(50,683,320,30,(.52,.13,.17), .94,12)
            self.text(self.game.flash,210,698,13,(1,1,1),True)

    def button_middle(self, label, y):
        self.rect(58,y,304,77,(1,.76,.29),1,22)
        self.text(label,210,y+39,24,(.11,.21,.25),True)

    def overlay(self):
        state=self.game.state
        if state=='playing':
            return
        self.rect(0,0,WIDTH,HEIGHT,(.01,.06,.12),.78)
        if state=='menu':
            self.text('GUGAGAMES',210,748,40,(1,.88,.43),True)
            self.text('A GRANDE PESCARIA',210,705,19,(.80,.95,1),True)
            self.oval(101,480,218,182,(1,.75,.32),.1)
            guga=next(f for f in self.game.fish if f.guga)
            self.fish_shape(guga,True)
            self.rect(30,362,360,100,(.045,.18,.28),.94,22)
            self.text('Encontre e pesque o GUGA!',210,434,20,(1,1,1),True)
            self.text('Arraste para mover o barco.',210,404,16,(.73,.93,.98))
            self.text('Toque PESCAR para lançar o anzol.',210,380,14,(.73,.93,.98))
            self.button_middle('JOGAR AGORA',258)
            self.text('90 segundos  •  peixe errado: -6s',210,222,13,(.73,.89,.92))
            if self.game.best_score:
                self.text('RECORDE: '+str(self.game.best_score),210,164,18,(1,.85,.40),True)
            self.text('100% offline  •  Feito em Python',210,54,13,(.6,.8,.85))
        elif state=='paused':
            self.rect(32,330,356,198,(.03,.17,.27),1,28)
            self.text('PAUSADO',210,471,35,(1,.83,.37),True)
            self.text('Toque na tela para continuar',210,415,17,(.87,.96,1))
        else:
            self.rect(26,288,368,314,(.035,.17,.27),.98,27)
            if state=='won':
                self.text('VOCÊ PESCOU',210,553,26,(1,1,1),True)
                self.text('O GUGA!',210,502,47,(1,.84,.36),True)
                self.text('PARABÉNS, PESCADOR!',210,453,17,(.69,1,.83),True)
                self.text('Pontos: '+str(self.game.score),210,415,20,(1,1,1),True)
                self.text('Tempo restante: '+str(math.ceil(self.game.time_left))+'s',210,384,16,(.82,.94,1))
            else:
                self.text('TEMPO ESGOTADO!',210,534,30,(1,.61,.54),True)
                self.text('O Guga escapou dessa vez...',210,472,17,(.83,.94,1))
                self.text('Tente uma nova pescaria!',210,430,17,(1,1,1),True)
            self.button_middle('JOGAR DE NOVO',220)

    def draw_game(self):
        self.canvas.clear()
        if not self.width or not self.height:
            return
        s, ox, oy = self.scale_values()
        with self.canvas:
            Color(.01,.06,.12,1)
            Rectangle(pos=self.pos,size=self.size)
            PushMatrix()
            Translate(ox, oy, 0)
            Scale(s, s, 1)
            self.background()
            for fish in self.game.fish:
                self.fish_shape(fish)
            self.boat()
            self.hud()
            self.buttons()
            self.overlay()
            PopMatrix()


class GugaApp(App):
    title = 'GugaGames - A Grande Pescaria'

    def build(self):
        self.game = FishingGame()
        self.load_records()
        return GugaCanvas(self.game)

    def record_path(self):
        return Path(self.user_data_dir) / 'recordes.json'

    def load_records(self):
        try:
            data = json.loads(self.record_path().read_text(encoding='utf-8'))
            self.game.best_score = max(0, int(data.get('best_score', 0)))
            self.game.best_time = max(0, int(data.get('best_time', 0)))
        except (OSError, ValueError, TypeError):
            pass

    def save_records(self):
        try:
            target = self.record_path()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps({'best_score': self.game.best_score,
                                          'best_time': self.game.best_time}), encoding='utf-8')
        except OSError:
            pass


if __name__ == '__main__':
    GugaApp().run()