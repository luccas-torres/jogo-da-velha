const ws = new WebSocket('ws://localhost:8081');

ws.onopen = () => {
    console.log('Conectado ao servidor WebSocket.');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'move') {
        atualizarTabuleiro(message.data);
    }
};

ws.onclose = () => {
    console.log('Conexão encerrada.');
};
