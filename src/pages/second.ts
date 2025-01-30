const html = String.raw;
import { createFooter } from "../components/footer.js";


class second {
    private container: HTMLElement | null;
    private socket: WebSocket;

    constructor() {
        this.container = document.getElementById('second');
        this.socket = new WebSocket('wss://localhost:5000');
        this.init();
    }
  

    private createMain(): string {
        return html`
            <p id="status">Second Page</p>
            <button id="sendCommand" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled>Send Command</button>
            <p id="messageDisplay"></p>
            <div class="flex flex-col items-center justify-center w-1/2 mx-auto">
                <img id="receivedImage" class="max-w-md mx-auto object-contain" />
            </div>
       `;

    }


    private setupWebSocket(): void {
        const statusElement = document.getElementById('status');
        this.socket.onopen = () => {
            
            if (statusElement) statusElement.textContent = "Connected to local server";
            const sendButton = document.getElementById('sendCommand') as HTMLButtonElement;
            if (sendButton) sendButton.disabled = false;
        };

        this.socket.onerror = () => {
            if (statusElement) statusElement.textContent = "Local server not found";
        };

        this.socket.onclose = () => {
            if (statusElement) statusElement.textContent = "Disconnected from server";
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
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send('EXECUTE_COMMAND');
                    const statusElement = document.getElementById('status');
                    if (statusElement) statusElement.textContent = 'Command sent';
                } else {
                    const statusElement = document.getElementById('status');
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
            this.setupWebSocket();
            this.setupEventListeners();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new second();
});