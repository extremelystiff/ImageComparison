// ===================================================================
// === CONFIGURATION =================================================
// ===================================================================
// On GitHub Pages, folders are AUTO-DISCOVERED via the GitHub API:
// just push a folder containing 1.png and 2.png and a button appears.
// This list is only used as a fallback (e.g. running locally).
const fallbackFolders = [
    'customize',
    'range',
    'mainmenu',
    'shotgunmod'
];

// Optional: folders that should never become buttons
const excludeFolders = [];

// Optional: force the repo as 'username/repo'. Only needed if you use a
// CUSTOM DOMAIN (auto-detection only works on *.github.io URLs).
// Leave '' for auto-detection.
const githubRepo = '';

const labelRight = 'MODDED';   // 1.png (revealed on the right)
const labelLeft  = 'Original'; // 2.png (revealed on the left)

// ===================================================================
// === SCRIPT LOGIC: NO NEED TO TOUCH ANYTHING BELOW THIS LINE ======
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const container = document.getElementById('image-compare-container');
    const baseImage = document.getElementById('base-image');
    const topImage  = document.getElementById('top-image');
    const handle    = container.querySelector('.slider-handle');
    const line      = container.querySelector('.slider-line');
    const selectorContainer = document.getElementById('comparison-selector');
    const mainTitle = document.querySelector('h1');

    let availableFolders = [];

    // --- Dynamic Label Setup ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        #image-compare-container .slider-handle::before { content: '${labelLeft}'; }
        #image-compare-container .slider-handle::after  { content: '${labelRight}'; }
    `;
    document.head.appendChild(styleSheet);

    // --- Core Function to Load a Comparison ---
    function loadComparison(folderName) {
        if (!availableFolders.includes(folderName)) {
            console.error(`Error: Folder "${folderName}" is not available.`);
            return;
        }

        baseImage.src = `${folderName}/1.png`;
        topImage.src  = `${folderName}/2.png`;

        mainTitle.textContent = folderName.replace(/-/g, ' ');

        document.querySelectorAll('#comparison-selector button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.folder === folderName);
        });

        // Update URL hash for deep linking (only if it actually changed,
        // to avoid re-triggering hashchange unnecessarily)
        if (window.location.hash.substring(1) !== folderName) {
            window.location.hash = folderName;
        }
    }

    // --- UI Generation: Create a button for each folder ---
    function buildButtons(folders) {
        selectorContainer.innerHTML = '';
        folders.forEach(folder => {
            const button = document.createElement('button');
            button.textContent = folder.replace(/-/g, ' ');
            button.dataset.folder = folder;
            button.addEventListener('click', () => loadComparison(folder));
            selectorContainer.appendChild(button);
        });
    }

    // --- Initialization on Page Load ---
    function initialize() {
        const initialFolder = window.location.hash.substring(1);

        if (initialFolder && availableFolders.includes(initialFolder)) {
            loadComparison(initialFolder);
        } else if (availableFolders.length > 0) {
            loadComparison(availableFolders[0]);
        }
    }

    // --- Auto-discovery of folders when hosted on GitHub Pages ---
    async function discoverFolders() {
        try {
            let owner, repo;

            if (githubRepo) {
                [owner, repo] = githubRepo.split('/');
            } else {
                const host = window.location.hostname;
                if (!host.endsWith('.github.io')) {
                    throw new Error('Not running on GitHub Pages');
                }
                owner = host.split('.')[0];
                const parts = window.location.pathname.split('/').filter(Boolean);
                // 'user.github.io/' -> root repo named after the user,
                // 'user.github.io/repo/' -> project page
                repo = parts.length > 0 ? parts[0] : owner;
            }

            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/`);
            if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);

            const entries = await res.json();
            const folders = entries
                .filter(entry => entry.type === 'dir')
                .map(entry => entry.name)
                .filter(name => !name.startsWith('.') && !excludeFolders.includes(name));

            if (folders.length === 0) throw new Error('No folders found in repo root');

            console.log('Auto-discovered comparison folders:', folders);
            return folders;
        } catch (err) {
            console.warn(`Folder auto-discovery failed (${err.message}). Using fallback list.`);
            return fallbackFolders;
        }
    }

    // --- Slider Dragging Logic (clip-path based, always pixel-aligned) ---
    let isDragging = false;

    function moveSlider(x) {
        const rect = container.getBoundingClientRect();
        let position = ((x - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        // Reveal the top image from the left edge up to the slider position
        topImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
        handle.style.left = `${position}%`;
        line.style.left = `${position}%`;
    }

    container.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => { if (isDragging) moveSlider(e.clientX); });
    container.addEventListener('touchstart', e => { isDragging = true; }, { passive: false });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', e => {
        if (isDragging) { e.preventDefault(); moveSlider(e.touches[0].clientX); }
    }, { passive: false });

    // --- Final Setup ---
    (async () => {
        availableFolders = await discoverFolders();
        buildButtons(availableFolders);
        initialize();
    })();

    window.addEventListener('hashchange', initialize);
});
