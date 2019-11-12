from player import Player
import asyncio
import json
import time
import random


WORDS = [
    'Angel',
    'Eyeball',
    'Pizza',
    'Angry',
    'Fireworks',
    'Pumpkin',
    'Baby',
    'Flower',
    'Rainbow',
    'Beard',
    'Flying saucer',
    'Recycle',
    'Bible',
    'Giraffe',
    'Sand castle',
    'Bikini',
    'Glasses',
    'Snowflake',
    'Book',
    'High heel',
    'Stairs',
    'Bucket',
    'Ice cream cone',
    'Starfish',
    'Bumble bee',
    'Igloo',
    'Strawberry',
    'Butterfly',
    'Lady bug',
    'Sun',
    'Camera',
    'Lamp',
    'Tire',
    'Cat',
    'Lion',
    'Toast',
    'Church',
    'Mailbox',
    'Toothbrush',
    'Crayon',
    'Night',
    'Toothpaste',
    'Dolphin',
    'Nose',
    'Truck',
    'Egg',
    'Olympics',
    'Volleyball',
    'Eiffel Tower',
    'Peanut'
]


class Game:

    ROUND_LENGTH = 50

    def __init__(self):
        self.players = []
        self.mouse_positions = []
        self.turn = 0
        self.word = 'dancing'
        self.round_start = time.time()

    async def update_clients(self):
        while True:
            await asyncio.sleep(0.05)
            print(len(self.players))
            for i, player in enumerate(self.players):
                info = {
                    'type': 'mouse positions',
                    'data': {
                        'mouse positions': self.mouse_positions,
                        'player index': i,
                        'turn': self.turn,
                        'word': self.word if self.turn == i else False,
                        'points': player.points,
                        'leaderboard': self.get_leaderboard()
                    }
                }
                await player.client.send(json.dumps(info))

            self.mouse_positions = []

    async def add_client(self, client):
        self.players.append(Player(client))

    async def remove_client(self, client):
        for i, player in enumerate(self.players):
            if player.client == client:
                self.players.pop(i)
                break

    async def update_canvas(self, mouse_pos):
        self.mouse_positions.extend(mouse_pos)

    async def update_guess_result(self, client, guess):
        guessed_correct = guess.lower() == self.word.lower()
        index = self.get_player_index(client)
        if guessed_correct:
            self.players[index].guessed_at = int(self.ROUND_LENGTH - (time.time() - self.round_start))
        info = {
            'type': 'guess',
            'data': {
                'guessed correct': guessed_correct
            }
        }
        await client.send(json.dumps(info))

    async def update_player_name(self, client, name):
        index = self.get_player_index(client)
        self.players[index].name = name

    def update_game(self):
        # print('time left: ' + str(int(self.ROUND_LENGTH - (time.time() - self.round_start))))
        if time.time() - self.round_start > self.ROUND_LENGTH:
            print('NEW TURN')
            self.update_turn()

    def update_turn(self):
        self.mouse_positions = []
        for player in self.players:
            if player.guessed_at:
                player.add_points(player.guessed_at + 50)
            player.guessed_at = False

        self.word = random.choice(WORDS)

        self.turn += 1
        if self.turn > len(self.players) - 1:
            self.turn = 0

        self.round_start = time.time()

    def get_leaderboard(self):
        players = [{'name': player.name, 'points': player.points} for player in self.players]
        players.sort(key=lambda x: x['points'], reverse=True)
        return players

    def get_player_index(self, client):
        for i, player in enumerate(self.players):
            if player.client == client:
                return i

        return False
