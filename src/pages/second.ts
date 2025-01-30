const html = String.raw;
import { createFooter } from "../components/footer.js";


class second {
    private container: HTMLElement | null;
    private socket: WebSocket | null;
    private address: string;

    constructor() {
        this.container = document.getElementById('second');
        this.socket = null;
        this.address = '';
        this.init();

        document.getElementById('connect')?.addEventListener('click', () => {   
            const addressInput = document.getElementById('addressWS') as HTMLInputElement;
            this.address = addressInput.value;
            this.connectWebSocket();
        });
    }

    private createMain(): string {
        return html`
            <div class="flex flex-col items-left w-1/4">
                <p>Enter WebSocket address to connect</p>
                <label for="addressWS">WebSocket address:</label>
                <input type="text" id="addressWS" class="border border-gray-300 rounded p-2" />
                <button id="connect" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Connect</button>

                <button id="sendCommand" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled>Send Command</button>
                <p id="messageDisplay"></p>
            </div>
            <div class="flex flex-col items-center justify-center w-1/2 mx-auto">
                <img id="receivedImage" class="w-1/6 mx-auto object-contain mt-32" />
            </div>
        `;
    }

    private connectWebSocket(): void {
        if (this.socket) {
            this.socket.close();
        }

        try {
            this.socket = new WebSocket(this.address);
            this.setupWebSocket();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            const statusElement = document.getElementById('messageDisplay');
            if (statusElement) statusElement.textContent = "Failed to connect to WebSocket";
        }
    }

    
    private setupWebSocket(): void {
        if (!this.socket) return;

        const statusElement = document.getElementById('messageDisplay');
        this.socket.onopen = () => {
            if (statusElement) statusElement.textContent = "Connected to WebSocket server";
            const sendButton = document.getElementById('sendCommand') as HTMLButtonElement;
            if (sendButton) sendButton.disabled = false;
        };

        this.socket.onerror = () => {
            if (statusElement) statusElement.textContent = "WebSocket connection error";
        };

        this.socket.onclose = () => {
            if (statusElement) statusElement.textContent = "Disconnected from WebSocket server";
            const sendButton = document.getElementById('sendCommand') as HTMLButtonElement;
            if (sendButton) sendButton.disabled = true;
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch(message.type) {
                case 'image':
                    this.handleImageMessage(message.data);
                    break;
                case 'text':
                    this.handleTextMessage(message.data);
                    break;
                case 'command':
                    this.handleCommandResponse(message.data);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        };
    }

    private handleImageMessage(imageData: string): void {
        const receivedImage = document.getElementById('receivedImage') as HTMLImageElement;
        if (receivedImage) receivedImage.src = imageData;
    }

    private handleTextMessage(text: string): void {
        const messageDisplay = document.getElementById('messageDisplay');
        if (messageDisplay) messageDisplay.textContent = text;
    }

    private handleCommandResponse(response: string): void {
        // Process command response
        console.log('Command response:', response);
    }


        private setupEventListeners(): void {
        const sendButton = document.getElementById('sendCommand');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send('EXECUTE_COMMAND');
                } else {
                    const statusElement = document.getElementById('messageDisplay');
                    if (statusElement) statusElement.textContent = 'Not connected to server';
                }
            });
        }
    }



    private init(): void {
        if (this.container) {
            this.container.innerHTML = `
                <div class="flex flex-col min-h-[105vh] bg-gradient-to-br from-blue-100 via-purple-50 to-purple-100">
                <main class="min-h-[100vh]">
                    ${this.createMain()}
                </main>
                ${createFooter()}
            </div>
            `;
            
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new second();
});