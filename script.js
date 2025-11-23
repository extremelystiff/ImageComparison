// ===================================================================
// === CONFIGURATION: THIS IS THE ONLY PART YOU NEED TO EDIT LATER ===
// ===================================================================
// Just add the names of your new folders to this list.
// The script will automatically create buttons and handle everything.
const comparisonFolders = [
    'customize',
    'range',
    'mainmenu',
    'shotgun mod'
];

// Set the labels you want. The first one is for the image on the right (1.png),
// the second one is for the image on the left (2.png).
const labelRight = '1440p';
const labelLeft = '4K';


// ===================================================================
// === SCRIPT LOGIC: NO NEED TO TOUCH ANYTHING BELOW THIS LINE ======
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const container = document.getElementById('image-compare-container');
    const topImageWrapper = container.querySelector('.img-wrapper');
    const handle = container.querySelector('.slider-handle');
    const baseImage = container.querySelector('img'); // The main <img> tag
    const topImage = topImageWrapper.querySelector('img');
    const selectorContainer = document.getElementById('comparison-selector');
    const mainTitle = document.querySelector('h1');
    const handleBefore = document.querySelector('.slider-handle::before');
    const handleAfter = document.querySelector('.slider-handle::after');

    // --- Dynamic Label Setup ---
    // Inject a style tag to set the content of the pseudo-elements
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        #image-compare-container .slider-handle::before { content: '${labelLeft}'; }
        #image-compare-container .slider-handle::after { content: '${labelRight}'; }
    `;
    document.head.appendChild(styleSheet);


    // --- Core Function to Load a Comparison ---
    function loadComparison(folderName) {
        if (!comparisonFolders.includes(folderName)) {
            console.error(`Error: Folder "${folderName}" not found in configuration.`);
            return; // Exit if the folder isn't in our list
        }

        // Update the image sources
        baseImage.src = `${folderName}/1.png`;
        topImage.src = `${folderName}/2.png`;

        // Update the main title to be more descriptive
        const displayName = folderName.replace(/-/g, ' '); // 'Game-A-Comparison' -> 'Game A Comparison'
        mainTitle.textContent = `${displayName}`;

        // Update the URL hash for deep linking
        window.location.hash = folderName;

        // Update button styles to show which is active
        document.querySelectorAll('#comparison-selector button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.folder === folderName);
        });
    }

    // --- UI Generation: Create a button for each folder ---
    comparisonFolders.forEach(folder => {
        const button = document.createElement('button');
        button.textContent = folder.replace(/-/g, ' ');
        button.dataset.folder = folder; // Store the folder name on the button
        button.addEventListener('click', () => {
            loadComparison(folder);
        });
        selectorContainer.appendChild(button);
    });

    // --- Initialization on Page Load ---
    function initialize() {
        // Check if there's a folder name in the URL hash (e.g., #Game-A-Comparison)
        const initialFolder = window.location.hash.substring(1);

        if (initialFolder && comparisonFolders.includes(initialFolder)) {
            // If the URL has a valid folder, load it
            loadComparison(initialFolder);
        } else {
            // Otherwise, load the very first folder in the list as the default
            loadComparison(comparisonFolders[0]);
        }
    }

    // --- Slider Dragging Logic (Unchanged from your original) ---
    let isDragging = false;

    function moveSlider(x) {
        const rect = container.getBoundingClientRect();
        let position = ((x - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        topImageWrapper.style.width = `${position}%`;
        handle.style.left = `${position}%`;
    }

    container.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => { if (isDragging) moveSlider(e.clientX); });
    container.addEventListener('touchstart', e => { isDragging = true; }, { passive: false });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', e => { if (isDragging) { e.preventDefault(); moveSlider(e.touches[0].clientX); } }, { passive: false });

    // --- Final Setup ---
    initialize(); // Run the initialization function
    window.addEventListener('hashchange', initialize); // Listen for back/forward button clicks
});
