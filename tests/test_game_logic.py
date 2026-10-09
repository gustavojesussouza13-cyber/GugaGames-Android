"""Rodar com: python -m unittest discover -s tests -v"""
import unittest
from game_logic import FishingGame, HOOK_START, TIME_LIMIT


class TestFishingGame(unittest.TestCase):
    def test_game_starts_from_menu(self):
        game = FishingGame(seed=4)
        self.assertEqual(game.state, 'menu')
        game.reset()
        self.assertEqual(game.state, 'playing')
        self.assertEqual(game.time_left, TIME_LIMIT)
        self.assertEqual(len(game.fish), 10)
        self.assertEqual(sum(f.guga for f in game.fish), 1)

    def test_boat_stays_in_screen(self):
        game = FishingGame(seed=5)
        game.set_position(-400)
        self.assertEqual(game.player_x, 43)
        game.set_position(1000)
        self.assertEqual(game.player_x, 374)

    def test_pause_stops_time(self):
        game = FishingGame(seed=1)
        game.toggle_pause()  # ignored in menu
        game.reset()
        game.toggle_pause()
        self.assertEqual(game.state, 'paused')
        game.update(.05)
        self.assertEqual(game.time_left, TIME_LIMIT)
        game.toggle_pause()
        self.assertEqual(game.state, 'playing')
        game.update(.05)
        self.assertLess(game.time_left, TIME_LIMIT)

    def test_cannot_cast_twice_simultaneously(self):
        game = FishingGame(seed=2)
        game.reset()
        self.assertTrue(game.cast())
        self.assertFalse(game.cast())
        self.assertEqual(game.hook_y, HOOK_START)

    def test_catching_wrong_fish_penalizes_time(self):
        game = FishingGame(seed=1)
        game.reset()
        for fish in game.fish:
            fish.x = 400
            fish.speed = 0
        wrong = next(f for f in game.fish if not f.guga)
        wrong.x, wrong.y = 160, 410
        game.set_position(160)
        game.cast()
        for _ in range(80):
            game.update(.01)
            if game.wrong_catches:
                break
        self.assertEqual(game.wrong_catches, 1)
        self.assertAlmostEqual(game.time_left, 84-.4, delta=.15)
        self.assertEqual(game.state, 'playing')

    def test_catching_guga_wins_and_saves_record(self):
        game = FishingGame(seed=1)
        game.reset()
        for fish in game.fish:
            fish.x = 480
            fish.speed = 0
        guga = next(f for f in game.fish if f.guga)
        guga.x, guga.y = 160, 410
        game.set_position(160)
        game.cast()
        for _ in range(80):
            game.update(.01)
            if game.state == 'won':
                break
        self.assertEqual(game.state, 'won')
        self.assertGreater(game.score, 100)
        self.assertEqual(game.best_score, game.score)

    def test_time_out(self):
        game = FishingGame(seed=1)
        game.reset()
        game.time_left = 0.01
        game.update(.05)
        self.assertEqual(game.state, 'lost')


if __name__ == '__main__':
    unittest.main()