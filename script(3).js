// =================================
// MODERNE PHYSIK WEBSITE 2025
// Interaktive Features & Animationen
// =================================

// GSAP Setup
gsap.registerPlugin(ScrollTrigger);

// Global Variables
let searchTimeout;
let isMenuOpen = false;
let isDarkMode = true;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    startAnimations();
    setupScrollEffects();
    initializeSimulations();
});

// ===========================
// INITIALIZATION
// ===========================
function initializeWebsite() {
    // Initialize theme
    applyTheme();

    // Animate counters
    animateCounters();

    // Setup reading progress
    setupReadingProgress();

    // Initialize MathJax
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

    console.log('🚀 Physik Website initialized');
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', showSearchSuggestions);
        searchInput.addEventListener('blur', hideSearchSuggestions);
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', toggleMobileMenu);
    }

    // FAB menu
    const fabMain = document.getElementById('fabMain');
    if (fabMain) {
        fabMain.addEventListener('click', toggleFabMenu);
    }

    // Navigation hover effects
    setupNavHoverEffects();

    // Solution toggles
    document.querySelectorAll('.solution-toggle').forEach(button => {
        button.addEventListener('click', () => toggleSolution(button));
    });

    // Formula toggles
    document.querySelectorAll('.formula-toggle').forEach(button => {
        button.addEventListener('click', () => toggleFormulas(button));
    });

    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

// ===========================
// ANIMATIONS & EFFECTS
// ===========================
function startAnimations() {
    // Animate navbar on scroll
    gsap.to('.navbar', {
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        scrollTrigger: {
            trigger: '.hero',
            start: 'bottom center',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate sections on scroll
    document.querySelectorAll('.topic-section').forEach(section => {
        gsap.fromTo(section, 
            { opacity: 0, y: 50 },
            {
                opacity: 1, 
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleClass: 'visible'
                }
            }
        );
    });

    // Floating orbs animation
    gsap.to('.gradient-orb', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
    });

    // Parallax effect for hero background
    gsap.to('.hero-bg', {
        yPercent: -50,
        scrollTrigger: {
            trigger: '.hero',
            scrub: true
        }
    });
}

function setupScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: target,
                        offsetY: 80
                    },
                    ease: 'power2.inOut'
                });
            }
        });
    });

    // Update navigation active state
    ScrollTrigger.batch('.topic-section', {
        onEnter: (elements) => updateActiveNavigation(elements[0].id),
        onLeave: (elements) => updateActiveNavigation(null)
    });
}

function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.dataset.target);
        gsap.fromTo(counter, 
            { textContent: 0 },
            {
                textContent: target,
                duration: 2,
                ease: 'power2.out',
                snap: { textContent: 1 },
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 80%'
                }
            }
        );
    });
}

// ===========================
// SEARCH FUNCTIONALITY
// ===========================
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query === '') {
            resetSearch();
            return;
        }

        performSearch(query);
    }, 300);
}

function performSearch(query) {
    const sections = document.querySelectorAll('.topic-section');
    let found = false;

    sections.forEach(section => {
        const content = section.textContent.toLowerCase();

        if (content.includes(query)) {
            section.style.display = 'block';
            highlightSearchTerms(section, query);
            found = true;
        } else {
            section.style.display = 'none';
            removeHighlights(section);
        }
    });

    if (!found) {
        showNoResults();
    } else {
        hideNoResults();
    }

    // Update URL without reload
    updateSearchURL(query);
}

function highlightSearchTerms(element, query) {
    removeHighlights(element);

    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                return node.parentElement.tagName !== 'SCRIPT' && 
                       node.parentElement.tagName !== 'STYLE' ?
                       NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        },
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.toLowerCase().includes(query)) {
            textNodes.push(node);
        }
    }

    textNodes.forEach(textNode => {
        const parent = textNode.parentNode;
        const text = textNode.nodeValue;
        const regex = new RegExp(`(${query})`, 'gi');

        if (regex.test(text)) {
            const highlighted = text.replace(regex, 
                '<mark class="search-highlight">$1</mark>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlighted;
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
        }
    });
}

function removeHighlights(element) {
    const highlights = element.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(
            document.createTextNode(highlight.textContent), 
            highlight
        );
        parent.normalize();
    });
}

function showSearchSuggestions() {
    const suggestions = document.querySelector('.search-suggestions');
    if (suggestions) {
        gsap.to(suggestions, {
            opacity: 1,
            visibility: 'visible',
            y: 0,
            duration: 0.3
        });
    }
}

function hideSearchSuggestions() {
    setTimeout(() => {
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
            gsap.to(suggestions, {
                opacity: 0,
                visibility: 'hidden',
                y: -10,
                duration: 0.3
            });
        }
    }, 200);
}

// ===========================
// THEME SYSTEM
// ===========================
function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();

    // Animate theme transition
    gsap.to('body', {
        duration: 0.5,
        ease: 'power2.inOut'
    });

    // Update icon
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Store preference
    localStorage.setItem('darkMode', isDarkMode);
}

function applyTheme() {
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Update meta theme color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', isDarkMode ? '#0a0a0f' : '#ffffff');
    }
}

// ===========================
// NAVIGATION
// ===========================
function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    const menu = document.querySelector('.nav-menu');

    if (menu) {
        if (isMenuOpen) {
            menu.classList.add('active');
            gsap.fromTo(menu, 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3 }
            );
        } else {
            gsap.to(menu, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => menu.classList.remove('active')
            });
        }
    }

    // Animate hamburger
    animateHamburger();
}

function animateHamburger() {
    const spans = document.querySelectorAll('#mobileMenu span');

    if (isMenuOpen) {
        gsap.to(spans[0], { rotation: 45, y: 6, duration: 0.3 });
        gsap.to(spans[1], { opacity: 0, duration: 0.3 });
        gsap.to(spans[2], { rotation: -45, y: -6, duration: 0.3 });
    } else {
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(spans[1], { opacity: 1, duration: 0.3 });
        gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.3 });
    }
}

function setupNavHoverEffects() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        item.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

function updateActiveNavigation(activeId) {
    document.querySelectorAll('.menu-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === `#${activeId}`) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ===========================
// READING PROGRESS
// ===========================
function setupReadingProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            gsap.to(progressBar, {
                width: `${self.progress * 100}%`,
                duration: 0.1
            });
        }
    });
}

// ===========================
// INTERACTIVE ELEMENTS
// ===========================
function toggleSolution(button) {
    const solution = button.parentElement.querySelector('.exercise-solution');
    const icon = button.querySelector('i');

    if (solution.classList.contains('hidden')) {
        // Show solution
        solution.classList.remove('hidden');
        gsap.fromTo(solution,
            { opacity: 0, height: 0 },
            { opacity: 1, height: 'auto', duration: 0.5 }
        );

        button.innerHTML = '<i class="fas fa-eye-slash"></i> Lösung verstecken';

        // Confetti effect
        createConfetti(button);

    } else {
        // Hide solution
        gsap.to(solution, {
            opacity: 0,
            height: 0,
            duration: 0.3,
            onComplete: () => solution.classList.add('hidden')
        });

        button.innerHTML = '<i class="fas fa-lightbulb"></i> Lösung anzeigen';
    }
}

function toggleFormulas(button) {
    const panel = button.closest('.formula-panel');
    const formulas = panel.querySelectorAll('.formula-card');
    const icon = button.querySelector('i');

    formulas.forEach((formula, index) => {
        gsap.to(formula, {
            opacity: formula.style.opacity === '0.3' ? 1 : 0.3,
            duration: 0.3,
            delay: index * 0.1
        });
    });

    icon.className = icon.className.includes('eye-slash') ? 
        'fas fa-eye' : 'fas fa-eye-slash';
}

// ===========================
// FLOATING ACTION BUTTON
// ===========================
function toggleFabMenu() {
    const fabMenu = document.querySelector('.fab-menu');
    const fabMain = document.getElementById('fabMain');
    const icon = fabMain.querySelector('i');

    if (fabMenu.classList.contains('hidden')) {
        fabMenu.classList.remove('hidden');

        // Animate menu items
        gsap.fromTo('.fab-item', 
            { opacity: 0, x: 20 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 0.3,
                stagger: 0.1 
            }
        );

        // Rotate main FAB
        gsap.to(icon, { rotation: 45, duration: 0.3 });

    } else {
        gsap.to('.fab-item', {
            opacity: 0,
            x: 20,
            duration: 0.2,
            onComplete: () => fabMenu.classList.add('hidden')
        });

        gsap.to(icon, { rotation: 0, duration: 0.3 });
    }
}

// ===========================
// SIMULATIONS
// ===========================
function initializeSimulations() {
    // Initialize pendulum simulation
    const pendulumCanvas = document.getElementById('pendulumSim');
    if (pendulumCanvas) {
        initPendulumSimulation(pendulumCanvas);
    }
}

function initPendulumSimulation(canvas) {
    const ctx = canvas.getContext('2d');
    let isRunning = false;
    let angle = Math.PI / 4;
    let angleVel = 0;
    let amplitude = 0.1;
    let mass = 0.2;
    let gravity = 9.81;
    let length = 200;

    function animate() {
        if (!isRunning) return;

        // Physics calculation
        const angleAcc = -(gravity / length) * Math.sin(angle);
        angleVel += angleAcc;
        angle += angleVel;
        angleVel *= 0.999; // Damping

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pendulum
        const centerX = canvas.width / 2;
        const centerY = 50;
        const bobX = centerX + length * Math.sin(angle);
        const bobY = centerY + length * Math.cos(angle);

        // Draw string
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 10 + mass * 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();

        requestAnimationFrame(animate);
    }

    // Control event listeners
    document.getElementById('amplitude')?.addEventListener('input', function(e) {
        amplitude = parseFloat(e.target.value);
        angle = amplitude * 4; // Convert to radians
        document.getElementById('ampValue').textContent = amplitude;
    });

    document.getElementById('mass')?.addEventListener('input', function(e) {
        mass = parseFloat(e.target.value);
        document.getElementById('massValue').textContent = mass;
    });

    window.toggleSimulation = function(type) {
        const button = document.querySelector('.sim-play');
        if (isRunning) {
            isRunning = false;
            button.innerHTML = '<i class="fas fa-play"></i> Start';
        } else {
            isRunning = true;
            button.innerHTML = '<i class="fas fa-pause"></i> Stop';
            animate();
        }
    };
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        gsap.to(window, {
            duration: 1.2,
            scrollTo: {
                y: section,
                offsetY: 80
            },
            ease: 'power3.inOut'
        });
    }
}

function createConfetti(element) {
    const colors = ['#00d4ff', '#8b5cf6', '#f472b6', '#10b981'];
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;

        document.body.appendChild(confetti);

        gsap.to(confetti, {
            x: (Math.random() - 0.5) * 200,
            y: Math.random() * -100 - 50,
            rotation: Math.random() * 360,
            scale: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => confetti.remove()
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
        }

        // Escape to close search
        if (e.key === 'Escape') {
            if (document.activeElement === document.getElementById('searchInput')) {
                resetSearch();
                document.getElementById('searchInput').blur();
            }
        }

        // Arrow keys for navigation
        if (e.key === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            scrollToNextSection();
        }

        if (e.key === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            scrollToPrevSection();
        }
    });
}

function updateSearchURL(query) {
    const url = new URL(window.location);
    if (query) {
        url.searchParams.set('search', query);
    } else {
        url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url);
}

function resetSearch() {
    document.querySelectorAll('.topic-section').forEach(section => {
        section.style.display = 'block';
        removeHighlights(section);
    });
    hideNoResults();
}

function showNoResults() {
    let noResults = document.getElementById('noResults');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'noResults';
        noResults.className = 'no-results glass-panel';
        noResults.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search"></i>
                <h3>Keine Ergebnisse gefunden</h3>
                <p>Versuche andere Suchbegriffe wie "Schwingung", "Welle", "Quanten"</p>
                <button onclick="resetSearch(); document.getElementById('searchInput').value = ''">
                    Suche zurücksetzen
                </button>
            </div>
        `;
        document.querySelector('.main-content').appendChild(noResults);
    }

    gsap.fromTo(noResults, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
    );
}

function hideNoResults() {
    const noResults = document.getElementById('noResults');
    if (noResults) {
        gsap.to(noResults, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => noResults.remove()
        });
    }
}

// ===========================
// MODAL FUNCTIONS
// ===========================
window.showQuickAccess = function() {
    const quickAccess = document.getElementById('quickAccess');
    if (quickAccess) {
        quickAccess.classList.remove('hidden');
        gsap.fromTo('.quick-panel',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
    }
};

window.openFormula = function(type) {
    console.log('Opening formula collection:', type);
    // Implement formula modal
};

window.openSimulation = function(type) {
    console.log('Opening simulation:', type);
    // Implement simulation modal
};

window.openExercises = function() {
    console.log('Opening exercises');
    // Implement exercises modal
};

window.openGlossary = function() {
    console.log('Opening glossary');
    // Implement glossary modal
};

window.openNotes = function() {
    console.log('Opening notes');
    // Implement notes feature
};

window.openCalculator = function() {
    console.log('Opening calculator');
    // Implement calculator modal
};

window.openBookmarks = function() {
    console.log('Opening bookmarks');
    // Implement bookmarks feature
};

// Initialize everything when page loads
console.log('🔬 Modern Physics Website Script Loaded');