let canvas = document.getElementById('canvas');
let guess = document.getElementById("guess");
let changeName = document.getElementById("change-name");
let wordDiv = document.getElementById("word-div");
let guessDiv = document.getElementById("guess-div");
let leaderboardEl = document.getElementById("leaderboard");
canvas.width = 600;
canvas.height = 600;
let c = canvas.getContext('2d');

let board = new DrawingBoard(c, canvas.width, canvas.height);
let mouseDown = false;
let mousePositions = [];
let drawing = false;
let turn = 0;
let prevTurn = turn;
let index = 0;
let word = '';
let leaderboard = [];
let guessedCorrect = false;

document.addEventListener('mousedown', e => {
    if (drawing) {
        mouseDown = true;
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        mousePositions.push({x, y, color: board.drawColor, radius: board.drawRadius});
        board.draw(x, y);
    }
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

document.addEventListener('mousemove', e => {
    if (drawing && mouseDown) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        mousePositions.push({x, y, color: board.drawColor, radius: board.drawRadius});
        board.draw(x, y);
    }
});

guess.addEventListener("keydown", e => {

    // Enter is pressed
    if (e.keyCode === 13) { submitGuess(); }
});

changeName.addEventListener("keydown", e => {

    // Enter is pressed
    if (e.keyCode === 13) { submitName(); }
});



let ws = new WebSocket('ws://localhost:5555/');
wsopen = false;
ws.onopen = () => {
    window.wsopen = true;
    console.log('CONNECTED');
};
ws.onclose = () => {
    window.wsopen = false;
    console.log('DISCONNECT')
};
ws.onmessage = event => {
    let data = event.data;
    let json_data = JSON.parse(data);
    switch (json_data['type']) {
        case 'mouse positions':
            mousePositions = json_data['data']['mouse positions'];
            turn = json_data['data']['turn'];
            index = json_data['data']['player index'];
            leaderboard = json_data['data']['leaderboard'];
            if (word !== json_data['data']['word']) {
                console.log(word);
                word = json_data['data']['word'];
                if (word) {
                    wordDiv.innerText = word;
                    wordDiv.style.display = 'block';
                    guessDiv.style.display = 'none';
                } else {
                    wordDiv.style.display = 'none';
                    guessDiv.style.display = 'block';
                }
            }
            drawing = index === turn;
            update_leaderboard(leaderboard);
            break;
        case 'guess':
            guessedCorrect = json_data['data']['guessed correct'];
            if (guessedCorrect) {
                alert('YOU GUESSED IT! GOOD JOB!');
                console.log('YAY!!!!!!!!');
            } else {
                console.log('NO :((');
            }
            break;
    }
};
ws.onerror = error => { console.log('ERROR: ', error); };

function update_leaderboard(leaderboard) {
    leaderboardEl.innerHTML = '';
    let i = 1;
    for (let player of leaderboard) {
        let color = 'transparent';
        switch (i) {
            case 1:
                color = 'gold';
                break;
            case 2:
                color = '#F2F2F2';
                break;
            case 3:
                color = '#cd7f32';
                break;
        }
        let el = document.createElement('li');
        el.className = 'leaderboard-item';
        el.innerHTML = i + ") " + player.name + ": " + player.points;
        el.style.backgroundColor = color;
        leaderboardEl.appendChild(el);
        i++;
    }
}

function submitGuess() {
    if (wsopen) {
        let msg = {
            'type': 'guess',
            'data': guess.value
        };
        guess.value = '';
        ws.send(JSON.stringify(msg));
    }
}

function submitName() {
    if (wsopen) {
        let msg = {
            'type': 'name',
            'data': changeName.value
        };
        changeName.value = '';
        ws.send(JSON.stringify(msg));
    }
}

function updateServer() {
    if (prevTurn !== turn) {
        board.clear();
        prevTurn = turn;
    }
    if (wsopen) {
        if (drawing) {
            let msg = {
                'type': 'mouse positions',
                'data': mousePositions
            };
            ws.send(JSON.stringify(msg));
            mousePositions = [];
        } else {
            for (let pos of mousePositions) {
                board.drawColor = pos.color;
                board.drawRadius = pos.radius;
                board.draw(pos.x, pos.y)
            }
        }
    }
    requestAnimationFrame(updateServer);
}

updateServer();