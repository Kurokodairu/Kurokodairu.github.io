interface User {
    name: string;
    age: number;
}

class App {
    private container: HTMLElement | null;

    constructor() {
        this.container = document.getElementById('app');
        this.init();
    }

    private init(): void {
        if (this.container) {
            this.container.innerHTML = '<h1>Welcome to my GitHub Pages site!</h1>';
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});