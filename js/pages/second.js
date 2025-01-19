const html = String.raw;
import { createFooter } from "../components/footer.js";
class second {
    constructor() {
        this.container = document.getElementById('second');
        this.init();
    }
    createMain() {
        return html `
            <p>Second Page</p>
        `;
    }
    init() {
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
