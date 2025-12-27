const state = {
    doorClosed: false,
    windowClosed: false,
    monitorOpen: false,
    temperature: 25,
    isCooling: false,
    currentCam: 1,
    hour: 0,
    power: 100,
    extremeTempTimer: 0,
    // Posições (Câmeras 1-6. 0 = Escritório)
    freddyPos: 1,
    babyPos: 2,
    springPos: 3
};

// Eventos de Botão
document.getElementById('btn-door-action').addEventListener('pointerdown', () => {
    state.doorClosed = !state.doorClosed;
    document.getElementById('door-right').classList.toggle('closed');
});

document.getElementById('btn-window-action').addEventListener('pointerdown', () => {
    state.windowClosed = !state.windowClosed;
    document.getElementById('window').classList.toggle('closed');
});

document.getElementById('btn-open-monitor').addEventListener('pointerdown', () => {
    state.monitorOpen = true;
    document.getElementById('camera-monitor').style.display = 'flex';
});

document.getElementById('btn-close-cam').addEventListener('pointerdown', () => {
    state.monitorOpen = false;
    document.getElementById('camera-monitor').style.display = 'none';
});

document.getElementById('btn-temp').addEventListener('pointerdown', () => {
    state.isCooling = !state.isCooling;
});

document.getElementById('btn-audio').addEventListener('pointerdown', () => {
    state.springPos = parseInt(state.currentCam);
});

document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        state.currentCam = parseInt(e.target.dataset.cam);
        document.getElementById('cam-name').innerText = "CAM 0" + state.currentCam;
        updateMotionAlert();
    });
});

function updateMotionAlert() {
    let msg = "NENHUM MOVIMENTO";
    let alerts = [];
    
    if (state.freddyPos == state.currentCam) alerts.push("FREDDY");
    if (state.babyPos == state.currentCam) alerts.push("CIRCUS BABY");
    if (state.springPos == state.currentCam) alerts.push("SPRINGBONNIE");

    if (alerts.length > 0) {
        msg = "MOVIMENTO DETECTADO: " + alerts.join(", ");
    }
    document.getElementById('motion-alert').innerText = msg;
}

// Loop de Lógica (1 segundo)
setInterval(() => {
    // 1. Energia e Temperatura
    state.temperature += state.isCooling ? -2 : 1;
    document.getElementById('temp-display').innerText = `TEMP: ${state.temperature}°C`;

    if (state.temperature <= 0 || state.temperature >= 50) {
        state.extremeTempTimer++;
        if (state.extremeTempTimer >= 60) gameOver("SISTEMA FALHOU (TEMP)");
    } else {
        state.extremeTempTimer = 0;
    }

    // Recarga na CAM 4
    if (state.monitorOpen && state.currentCam == 4) {
        state.power = Math.min(100, state.power + 1);
    } else {
        let drain = 0.1;
        if (state.doorClosed) drain += 0.2;
        if (state.windowClosed) drain += 0.2;
        state.power -= drain;
    }
    document.getElementById('power-display').innerText = `BATERIA: ${Math.floor(state.power)}%`;
    if (state.power <= 0) gameOver("SEM ENERGIA");

    // 2. IA de Movimento
    if (Math.random() > 0.85) {
        // Freddy tenta chegar na porta (Aumenta posição até 7, onde 7 é ataque)
        state.freddyPos = (state.freddyPos >= 6) ? 0 : state.freddyPos + 1;
        if (state.freddyPos === 0 && !state.doorClosed) gameOver("FREDDY");
        if (state.freddyPos === 0 && state.doorClosed) state.freddyPos = 1;
    }

    if (Math.random() > 0.9) {
        // Baby tenta chegar na janela
        state.babyPos = (state.babyPos >= 6) ? 0 : state.babyPos + 1;
        if (state.babyPos === 0 && !state.windowClosed) {
            // Se a temperatura estiver alta, ela ataca
            if (state.temperature > 10) gameOver("CIRCUS BABY");
        } else if (state.babyPos === 0 && state.windowClosed) {
            state.babyPos = 2;
        }
    }

    if (Math.random() > 0.8) {
        // Springbonnie tenta chegar na porta (movimento reverso de 6 para 0)
        state.springPos--;
        if (state.springPos <= 0) {
            if (!state.doorClosed) gameOver("SPRINGBONNIE");
            else state.springPos = 4;
        }
    }

    if (state.monitorOpen) updateMotionAlert();
}, 1000);

// Relógio
setInterval(() => {
    state.hour++;
    document.getElementById('clock').innerText = state.hour + " AM";
    if (state.hour >= 6) {
        alert("6 AM! VOCÊ VENCEU!");
        location.reload();
    }
}, 60000);

function gameOver(anim) {
    alert("JUMPSCARE: " + anim + "!");
    location.reload();
}
