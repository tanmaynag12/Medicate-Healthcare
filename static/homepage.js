const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Button ripple effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-ripple');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('active');
        
        setTimeout(() => {
            ripple.classList.remove('active');
        }, 600);
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card, .testimonial-card, .about-card').forEach(el => {
    observer.observe(el);
});

// Dropdown menu functionality
const accountToggle = document.getElementById('accountToggle');
const accountMenu = document.getElementById('accountMenu');

if (accountToggle && accountMenu) {
    accountToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents click from bubbling up and immediately closing the menu
        accountMenu.classList.toggle('show');
    });

    // Close the dropdown if the user clicks outside of it
    document.addEventListener('click', (e) => {
        if (!accountMenu.contains(e.target) && !accountToggle.contains(e.target)) {
            accountMenu.classList.remove('show');
        }
    });
}