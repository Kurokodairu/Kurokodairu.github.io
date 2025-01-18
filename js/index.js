"use strict";
class App {
    constructor() {
        this.container = document.getElementById('app');
        this.init();
    }
    init() {
        if (this.container) {
            this.container.innerHTML = '<h1>Welcome to my GitHub Pages site!</h1>';
        }
    }
}
// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
