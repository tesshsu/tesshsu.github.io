document.addEventListener('DOMContentLoaded', () => {
    // Load blog posts dynamically in descending order
    async function loadBlogPosts() {
        const blogContainer = document.getElementById('blog-posts');
        const blogFiles = [];
        const maxBlogs = 5; // Adjust this number based on the maximum number of blogs you expect

        // Dynamically generate blog file names (blogs/blog-1.html, blogs/blog-2.html, etc.)
        for (let i = 1; i <= maxBlogs; i++) {
            blogFiles.push(`blogs/blog-${i}.html`);
        }

        // Sort blog files in descending order based on the numerical part of the filename
        blogFiles.sort((a, b) => {
            const numA = parseInt(a.match(/blog-(\d+)\.html/)[1]);
            const numB = parseInt(b.match(/blog-(\d+)\.html/)[1]);
            return numB - numA; // Descending order
        });

        for (const file of blogFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const content = await response.text();
                    const div = document.createElement('div');
                    div.innerHTML = content;
                    blogContainer.appendChild(div);
                } else {
                    console.log(`No more blog posts found after ${file}`);
                    break; // Stop loading when a file is not found
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
                break; // Stop on error
            }
        }
    }

    // Load blogs when the page loads
    window.addEventListener('DOMContentLoaded', loadBlogPosts);
    // Language Switcher
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('change', function() {
            const lang = this.value;
            const currentPage = window.location.pathname.split('/').pop();
            if (lang === 'en' && currentPage !== 'index.html') {
                window.location.href = 'index.html';
            } else if (lang === 'fr' && currentPage !== 'fr.html') {
                window.location.href = 'fr.html';
            }
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Slider Functionality
    const slider = document.getElementById('project-slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slider && prevBtn && nextBtn) {
        let currentIndex = 0;
        const totalImages = 11;
        const imageWidth = 310; // Image width (300px) + margin (10px)

        function updateSlider() {
            const maxIndex = totalImages - 1;
            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex > maxIndex - 3) currentIndex = maxIndex - 3; // Show 4 images at a time
            slider.style.transform = `translateX(-${currentIndex * imageWidth}px)`;
        }

        nextBtn.addEventListener('click', () => {
            currentIndex++;
            updateSlider();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex--;
            updateSlider();
        });
    }
});