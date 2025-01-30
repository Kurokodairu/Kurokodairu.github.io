const html = String.raw;

export function createFooter(): string {
    return html`
    <footer class="text-grey-300 mt-auto">
        <hr class="border-t border-gray-700 my-4 opacity-10 w-4/5 mx-auto">
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 grid-cols-2 gap-8">
                <!-- Navigation Links -->
                <div>
                    <ul class="space-y-2">
                        <li><a href="/" class="hover:text-gray-300">Home</a></li>
                        <li><a href="/second" class="hover:text-gray-300">Second Page</a></li>
                    </ul>
                </div>
                
                <!-- Additional Info -->
                <div class="text-right">
                    <h3 class="text-lg font-semibold mb-4">About</h3>
                    <p class="text-gray-500">ok</p>
                </div>
            </div>
        </div>
    </footer>
    `;
}