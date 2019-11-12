import asyncio
import threading
import websockets
from game import *

clients = set()
game = Game()


def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


async def handler(websocket, path):
    try:
        await game.add_client(websocket)
        async for message in websocket:
            json_data = json.loads(message)
            if json_data['type'] == 'mouse positions':
                mouse_pos = json_data['data']
                await game.update_canvas(mouse_pos)
            elif json_data['type'] == 'guess':
                guess = json_data['data']
                await game.update_guess_result(websocket, guess)
            elif json_data['type'] == 'name':
                name = json_data['data']
                await game.update_player_name(websocket, name)
    finally:
        await game.remove_client(websocket)


async def main():
    asyncio.get_event_loop().create_task(game.update_clients())

start_server = websockets.serve(handler, host='localhost', port=5555)

set_interval(game.update_game, 0.01)
asyncio.get_event_loop().run_until_complete(main())
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
