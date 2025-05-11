function initializeShareButtons() {
    const shareButtonsContainers = document.querySelectorAll('.share-buttons');
    if (shareButtonsContainers.length > 0) {
        shareButtonsContainers.forEach(container => {
            const blogPost = container.closest('.border-b');
            const blogTitle = blogPost?.querySelector('.blog-title')?.textContent || document.querySelector('.blog-title')?.textContent || 'Blog Post';
            const blogUrl = blogPost?.querySelector('.blog-link')?.href || window.location.href;

            const encodedUrl = encodeURIComponent(blogUrl);
            const encodedTitle = encodeURIComponent(blogTitle);

            const shareLinks = {
                linkedin: `https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`,
                reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
                x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
            };

            container.querySelectorAll('a').forEach(button => {
                const platform = button.querySelector('i').classList.contains('fa-linkedin') ? 'linkedin' :
                                button.querySelector('i').classList.contains('fa-reddit') ? 'reddit' :
                                button.querySelector('i').classList.contains('fa-x-twitter') ? 'x' :
                                button.querySelector('i').classList.contains('fa-facebook-f') ? 'facebook' : null;
                if (platform && shareLinks[platform]) {
                    button.href = shareLinks[platform];
                }
            });
        });
    } else {
        console.warn('No .share-buttons elements found in the document.');
    }
}

const initializeLanguageSwitcher = () => {
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) {
        console.log('Language switcher found:', languageSwitcher);
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'fr.html') {
            languageSwitcher.value = 'fr';
        } else {
            languageSwitcher.value = 'en';
        }

        languageSwitcher.addEventListener('change', function() {
            const lang = this.value;
            console.log('Language selected:', lang);
            console.log('Current page:', currentPage);

            if (lang === 'fr' && currentPage !== 'fr.html') {
                console.log('Navigating to fr.html');
                window.location.href = '/fr.html';
            } else if (lang === 'en' && currentPage !== 'index.html') {
                console.log('Navigating to index.html');
                window.location.href = '/index.html';
            } else {
                console.log('No navigation needed');
            }
        });
    } else {
        console.error('Language switcher not found in the DOM');
    }
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const projectSlider = document.getElementById('project-slider');
const prevBtnProject = document.querySelector('.prev-btn');
const nextBtnProject = document.querySelector('.next-btn');

if (projectSlider && prevBtnProject && nextBtnProject) {
    let currentIndex = 0;
    const totalImages = 15;
    const imageWidth = 310;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const projectImages = [];
    for (let i = 1; i <= totalImages; i++) {
        projectImages.push({ src: `img/work/img-${i}.jpg`, alt: `Projet ${i}` });
    }
    const shuffledProjects = shuffle([...projectImages]);
    projectSlider.innerHTML = shuffledProjects.map(project => `<img src="${project.src}" alt="${project.alt}">`).join('');

    function updateProjectSlider() {
        const maxIndex = totalImages - 1;
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex - 3) currentIndex = maxIndex - 3;
        projectSlider.style.transform = `translateX(-${currentIndex * imageWidth}px)`;
    }

    nextBtnProject.addEventListener('click', () => {
        currentIndex++;
        updateProjectSlider();
    });

    prevBtnProject.addEventListener('click', () => {
        currentIndex--;
        updateProjectSlider();
    });

    updateProjectSlider();
}

const blogSlider = document.getElementById('blog-slider');
const prevBtnBlog = document.querySelector('.prev-btn-blog');
const nextBtnBlog = document.querySelector('.next-btn-blog');

if (blogSlider && prevBtnBlog && nextBtnBlog) {
    let currentIndex = 0;
    const totalBlogs = 6;
    const imageWidth = 310;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const blogImages = [
        { src: '../img/blog/blog-1.jpeg', href: '/blogs/blog-1.html' },
        { src: '../img/blog/blog-2.jpeg', href: '/blogs/blog-2.html' },
        { src: '../img/blog/blog-3.jpeg', href: '/blogs/blog-3.html' },
        { src: '../img/blog/blog-4.jpeg', href: '/blogs/blog-4.html' },
        { src: '../img/blog/blog-5.jpeg', href: '/blogs/blog-5.html' },
        { src: '../img/blog/blog-6.jpeg', href: '/blogs/blog-6.html' }
    ];

    const shuffledBlogs = shuffle([...blogImages]);
    blogSlider.innerHTML = shuffledBlogs.map(blog => `<a href="${blog.href}"><img src="${blog.src}" alt="Blog ${blog.href.match(/blog-(\d+)\.html/)[1]}"></a>`).join('');

    function updateBlogSlider() {
        const maxIndex = totalBlogs - 1;
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex - 3) currentIndex = maxIndex - 3;
        blogSlider.style.transform = `translateX(-${currentIndex * imageWidth}px)`;
    }

    nextBtnBlog.addEventListener('click', () => {
        currentIndex++;
        updateBlogSlider();
    });

    prevBtnBlog.addEventListener('click', () => {
        currentIndex--;
        updateBlogSlider();
    });

    updateBlogSlider();
}

async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        try {
            // Use absolute path to ensure correct loading from any page
            const response = await fetch('/assets/partials/sidebar.html');
            if (response.ok) {
                const sidebarContent = await response.text();
                sidebarContainer.innerHTML = sidebarContent;
                console.log('Sidebar loaded successfully');
                initializeLanguageSwitcher();
            } else {
                console.error('Failed to load sidebar:', response.status);
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    } else {
        console.error('Sidebar container not found in the DOM');
    }
}

async function loadFooter() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        try {
            const response = await fetch('/assets/partials/footer.html');
            if (response.ok) {
                const footerContent = await response.text();
                const footerDiv = document.createElement('div');
                footerDiv.innerHTML = footerContent;
                mainContent.appendChild(footerDiv);
                console.log('Footer loaded successfully');
            } else {
                console.error('Failed to load footer:', response.status);
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    } else {
        console.error('Main content not found in the DOM for footer injection');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Ensure full-height layout for footer positioning
    const body = document.body;
    if (!body.classList.contains('min-h-screen') || !body.classList.contains('flex') || !body.classList.contains('flex-col')) {
        body.classList.add('min-h-screen', 'flex', 'flex-col');
    }
    const main = document.querySelector('main');
    if (main && !main.classList.contains('flex-1')) {
        main.classList.add('flex-1');
    }

    Promise.all([loadSidebar(), loadFooter()])
        .then(() => {
            initializeShareButtons();
        })
        .catch(error => {
            console.error('Error loading sidebar or footer:', error);
        });

    if (!window.location.pathname.includes('blog.html')) {
        initializeShareButtons();
    }
});