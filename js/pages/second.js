const html = String.raw;
import { createFooter } from "../components/footer.js";
class WebSocketClient {
    constructor() {
        this.container = document.getElementById('second');
        this.socket = null;
        this.address = '';
        this.isConnecting = false;
        this.init();
        this.setupEventListeners();
    }
    createMain() {
        return html `
            <div class="flex flex-col items-left w-1/4">
                <p>Enter WebSocket address to connect</p>
                <label for="addressWS">WebSocket address:</label>
                <input type="text" id="addressWS" class="border border-gray-300 rounded p-2" placeholder="ws://localhost:8765" />
                <button id="connect" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Connect</button>
                <button id="sendCommand" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled>Get Server Time</button>
                <p id="messageDisplay" class="min-h-[2rem]"></p>
            </div>

            <div class="flex flex-col items-center justify-center w-1/2 mx-auto">
                <!-- Pixel Grid -->
                <div id="pixelGrid" class="grid grid-cols-9 gap-1 p-4">
                    ${Array(81).fill(0).map((_, idx) => `
                        <button 
                            id="pixel-${idx}" 
                            class="w-8 h-8 border border-gray-300 bg-white"
                            data-index="${idx}">
                        </button>`).join('')}
                </div>
    
                <!-- Color Palette -->
                <div class="flex flex-col items-center justify-center p-4">
                    <p>Select a Color:</p>
                    <div id="colorPalette" class="grid grid-cols-3 gap-2">
                        ${['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white'].map(color => `
                            <button 
                                class="w-8 h-8 border border-gray-300" 
                                style="background-color: ${color}" 
                                data-color="${color}">
                            </button>`).join('')}
                    </div>
                </div>
            </div>
            <p id="messageDisplay" class="min-h-[2rem]"></p>
        `;
    }
    connectWebSocket() {
        if (this.isConnecting)
            return;
        this.isConnecting = true;
        this.updateUIState();
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
        }
        try {
            this.socket = new WebSocket(this.address);
            this.setupWebSocket();
        }
        catch (error) {
            this.handleConnectionError(error);
        }
    }
    setupWebSocket() {
        if (!this.socket)
            return;
        const statusElement = document.getElementById('messageDisplay');
        this.socket.onopen = () => {
            this.isConnecting = false;
            this.updateUIState();
            this.showStatusMessage('Connected to WebSocket server', 'text-green-600');
        };
        this.socket.onerror = (event) => {
            this.handleConnectionError(new Error('WebSocket connection error'));
        };
        this.socket.onclose = () => {
            this.isConnecting = false;
            this.updateUIState();
            this.showStatusMessage('Disconnected from WebSocket server', 'text-red-600');
        };
        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            }
            catch (error) {
                this.showStatusMessage('Invalid message format from server', 'text-red-600');
            }
        };
    }
    handleMessage(message) {
        switch (message.type) {
            case 'text':
                this.handleTextMessage(message.data);
                break;
            case 'command':
                this.handleCommandResponse(message.data);
                break;
            case 'error':
                this.handleError(message.data);
                break;
            case 'updatePixel':
                if (typeof message.data === 'object' && 'index' in message.data && 'color' in message.data) {
                    const { index, color } = message.data;
                    const pixelButton = document.getElementById(`pixel-${index}`);
                    if (pixelButton) {
                        pixelButton.style.backgroundColor = color;
                    }
                }
                break;
            case `initializeGrid`:
                if (Array.isArray(message.data) && message.data.every(item => 'index' in item && 'color' in item)) {
                    this.initializeGrid(message.data);
                }
                break;
            default:
                this.showStatusMessage(`Unknown message type: ${message.type}`, 'text-yellow-600');
        }
    }
    initializeGrid(gridState) {
        gridState.forEach(({ index, color }) => {
            const pixelButton = document.getElementById(`pixel-${index}`);
            if (pixelButton) {
                pixelButton.style.backgroundColor = color;
            }
        });
    }
    handleTextMessage(text) {
        this.showStatusMessage(text, 'text-blue-600');
    }
    handleCommandResponse(response) {
        const messageDisplay = document.getElementById('messageDisplay');
        if (messageDisplay) {
            messageDisplay.textContent = response.status === 'success'
                ? `Server time: ${response.result}`
                : `Error: ${response.message}`;
            messageDisplay.className = response.status === 'success'
                ? 'text-green-600'
                : 'text-red-600';
        }
    }
    handleError(error) {
        this.showStatusMessage(`Server error: ${error}`, 'text-red-600');
    }
    showStatusMessage(message, className) {
        const statusElement = document.getElementById('messageDisplay');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = className;
        }
    }
    updateUIState() {
        const connectButton = document.getElementById('connect');
        const sendButton = document.getElementById('sendCommand');
        if (connectButton) {
            connectButton.disabled = this.isConnecting;
            connectButton.textContent = this.isConnecting ? 'Connecting...' : 'Connect';
        }
        if (sendButton) {
            sendButton.disabled = !this.socket || this.socket.readyState !== WebSocket.OPEN;
        }
    }
    handleConnectionError(error) {
        this.isConnecting = false;
        this.updateUIState();
        this.showStatusMessage(`Connection error: ${error.message}`, 'text-red-600');
        console.error('WebSocket error:', error);
    }
    setupEventListeners() {
        var _a, _b, _c, _d;
        (_a = document.getElementById('connect')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            const addressInput = document.getElementById('addressWS');
            this.address = addressInput.value.trim();
            if (this.address)
                this.connectWebSocket();
        });
        (_b = document.getElementById('sendCommand')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            var _a;
            if (((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: "command",
                    data: "getTime"
                }));
            }
        });
        let selectedColor = 'black';
        (_c = document.getElementById('colorPalette')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (event) => {
            const target = event.target;
            if (target.dataset.color) {
                selectedColor = target.dataset.color;
            }
        });
        // Handle pixel painting
        (_d = document.getElementById('pixelGrid')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', (event) => {
            var _a;
            const target = event.target;
            if (target.dataset.index && ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
                const pixelIndex = parseInt(target.dataset.index, 10);
                target.style.backgroundColor = selectedColor;
                // Send pixel update to server
                this.socket.send(JSON.stringify({
                    type: "updatePixel",
                    data: { index: pixelIndex, color: selectedColor }
                }));
            }
        });
    }
    init() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="flex flex-col min-h-[105vh] bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100">
                    <main class="min-h-[100vh]">
                        ${this.createMain()}
                    </main>
                    ${createFooter()}
                </div>`;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new WebSocketClient();
});
