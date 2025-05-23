const html = String.raw;
import { createFooter } from './components/footer.js';
import { initFireworks } from './fireworks.js';
class App {
    constructor() {
        this.container = document.getElementById('app');
        this.projects = [
            {
                title: "Data Science Project",
                description: "Lorem ipsum dolor sit amet",
                tools: ["Python", "Pandas", "Matplotlib"],
                link: "https://github.com/Kurokodairu/"
            },
            {
                title: "Machine Learning Model",
                description: "Lorem ipsum dolor sit amet",
                tools: ["scikit-learn", "TensorFlow", "Jupyter"],
                link: "https://github.com/Kurokodairu/"
            },
            {
                title: "Machine Learning Model",
                description: "Lorem ipsum dolor sit amet",
                tools: ["scikit-learn", "TensorFlow", "Jupyter"]
            }
        ];
        this.init();
    }

    // REMOVE META TAG WHEN NO REFRESH IS WANTED
    createHeroSection() {
        return html `
            <meta http-equiv="refresh" content="0; url=https://kurokodairu.com/shop" /> 
            <div class="pt-24 flex flex-col items-center justify-center text-center px-4">

                <h1 class="text-6xl font-bold text-gray-900  
                bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
                animate-gradient
                bg-[size:200%_auto]
                bg-clip-text text-transparent 
                leading-relaxed overflow-visible">
                    { Projects }
                </h1>
                <p class="text-xl md:text-2xl text-[#7c619c] max-w-2xl mb-12">
                    Kurokodairu - Data Science
                </p>
                <a href="https://github.com/Kurokodairu" 
                   class="inline-flex items-center gap-2 bg-[#9d7cd1] hover:bg-[#8b6bc4] text-white px-8 py-3 rounded-full font-medium transition duration-300">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                    </svg>
                    View GitHub Profile
                </a>
            </div>
        `;
    }
    createProjectCard(project) {
        return html `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition duration-300">
                <div class="p-6">
                    <h3 class="text-2xl font-semibold text-purple-800 mb-3">
                        ${project.title}
                    </h3>
                    <p class="text-gray-600 mb-4">
                        ${project.description}
                    </p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${project.tools.map(tool => `
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                ${tool}
                            </span>
                        `).join('')}
                    </div>
                    ${project.link ? `
                        <a href="${project.link}" 
                           class="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1">
                            View Project
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M9 5l7 7-7 7"></path>
                            </svg>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }
    createProjectsSection() {
        return html `
            <div class="py-16">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-purple-800 mb-12 text-center">
                        Featured Projects
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${this.projects.map(project => this.createProjectCard(project)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    init() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="flex flex-col min-h-[105vh] bg-gradient-to-br from-blue-200 via-purple-100 to-purple-200">
                <main class="min-h-[100vh]">
                    ${this.createHeroSection()}
                    ${this.createProjectsSection()}
                </main>
                <canvas id="fireworksCanvas"></canvas>
                ${createFooter()}
            </div>
            `;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new App();
    initFireworks();
});
