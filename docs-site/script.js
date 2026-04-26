document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const code = button.previousElementSibling.innerText;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerText;
            button.innerText = 'Copied!';
            button.style.backgroundColor = 'var(--primary)';
            button.style.color = 'white';
            
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = 'var(--card-bg)';
                button.style.color = 'var(--text-dim)';
            }, 2000);
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 2rem';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    } else {
        nav.style.padding = '1.5rem 2rem';
        nav.style.boxShadow = 'none';
    }
});
