import random
import string

def random_string(string_length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(string_length))

class Player:

    def __init__(self, client):
        self.client = client
        self.guessed_at = False
        self.points = 0
        self.name = random_string(5)

    def add_points(self, points):
        self.points += points
