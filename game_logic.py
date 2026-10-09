"""Regras independentes da interface do GugaGames Mobile (Python puro)."""
from dataclasses import dataclass
import math
import random

WIDTH = 420
HEIGHT = 840
TIME_LIMIT = 90.0
WATERLINE = 620
HOOK_START = 625.0
HOOK_BOTTOM = 136.0


@dataclass
class Fish:
    x: float
    y: float
    size: float
    speed: float
    direction: int
    color: tuple
    guga: bool = False
    phase: float = 0.0


class FishingGame:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.best_score = 0
        self.best_time = 0
        self.state = 'menu'
        self.t = 0.0
        self.player_x = 210.0
        self.fish = []
        self.left = False
        self.right = False
        self.reset()
        self.state = 'menu'

    def reset(self):
        self.t = 0.0
        self.time_left = TIME_LIMIT
        self.score = 0
        self.wrong_catches = 0
        self.player_x = 210.0
        self.left = False
        self.right = False
        self.hook_y = HOOK_START
        self.casting = False
        self.retracting = False
        self.flash = ''
        self.flash_seconds = 0.0
        colors = [
            (0.21, 0.86, 0.88), (0.97, 0.48, 0.55),
            (0.76, 0.54, 0.98), (0.33, 0.76, 0.61),
            (0.99, 0.65, 0.37), (0.48, 0.67, 0.99),
        ]
        self.fish = []
        for i in range(9):
            direction = self.rng.choice((-1, 1))
            self.fish.append(Fish(
                x=self.rng.uniform(35, 385),
                y=self.rng.uniform(205, 530),
                size=self.rng.uniform(0.67, 1.06),
                speed=self.rng.uniform(24, 60),
                direction=direction,
                color=colors[i % len(colors)],
                phase=self.rng.random() * math.tau,
            ))
        self.fish.append(Fish(
            x=305, y=392, size=1.32, speed=76,
            direction=-1, color=(1.0, 0.76, 0.24),
            guga=True, phase=0.0,
        ))
        self.state = 'playing'

    def set_position(self, x):
        self.player_x = max(43.0, min(374.0, float(x)))

    def cast(self):
        if self.state != 'playing' or self.casting:
            return False
        self.casting = True
        self.retracting = False
        self.hook_y = HOOK_START
        return True

    def toggle_pause(self):
        if self.state == 'playing':
            self.state = 'paused'
            self.left = self.right = False
        elif self.state == 'paused':
            self.state = 'playing'

    def update(self, dt):
        dt = max(0.0, min(float(dt), 0.05))
        if self.state != 'playing':
            return
        self.t += dt
        self.time_left = max(0.0, self.time_left - dt)
        if self.flash_seconds > 0:
            self.flash_seconds = max(0.0, self.flash_seconds - dt)
        if self.time_left <= 0.0:
            self.state = 'lost'
            return
        if self.left != self.right:
            self.set_position(self.player_x + (self.right - self.left) * 265 * dt)
        for fish in self.fish:
            fish.x += fish.speed * fish.direction * dt
            if fish.x >= 454:
                fish.x = 454
                fish.direction = -1
            elif fish.x <= -34:
                fish.x = -34
                fish.direction = 1
        if not self.casting:
            return
        if not self.retracting:
            self.hook_y = max(HOOK_BOTTOM, self.hook_y - 500 * dt)
            for fish in self.fish:
                fy = fish.y + math.sin(self.t * 2.7 + fish.phase) * 5
                if abs(self.player_x - fish.x) < (31 * fish.size + 6) and abs(self.hook_y - fy) < (15 * fish.size + 8):
                    self._catch(fish)
                    return
            if self.hook_y <= HOOK_BOTTOM:
                self.retracting = True
        else:
            self.hook_y = min(HOOK_START, self.hook_y + 680 * dt)
            if self.hook_y >= HOOK_START:
                self.casting = False
                self.retracting = False

    def _catch(self, fish):
        self.casting = False
        self.hook_y = HOOK_START
        if fish.guga:
            self.score += 100 + int(self.time_left)
            self.state = 'won'
            if self.score > self.best_score:
                self.best_score = self.score
            if int(self.time_left) > self.best_time:
                self.best_time = int(self.time_left)
            self.flash = 'VOCE PESCOU O GUGA!'
            return
        self.time_left = max(0.0, self.time_left - 6.0)
        self.wrong_catches += 1
        self.flash = '-6 SEGUNDOS! PEIXE ERRADO'
        self.flash_seconds = 2.1
        fish.x = -60 if fish.direction > 0 else 480
        fish.y = self.rng.uniform(205, 530)
        if self.time_left <= 0:
            self.state = 'lost'