document.addEventListener('DOMContentLoaded', () => {
    // Load blog posts dynamically in descending order on blog.html
    async function loadBlogPosts() {
        const blogContainer = document.getElementById('blog-posts');
        const blogFiles = [];
        let maxIndex = 1;

        while (true) {
            const file = `blogs/blog-${maxIndex}.html`;
            try {
                const response = await fetch(file);
                if (response.ok) {
                    blogFiles.push(file);
                    maxIndex++;
                } else {
                    break;
                }
            } catch (error) {
                console.log(`No more blog posts found after ${file}`);
                break;
            }
        }

        if (blogFiles.length === 0) {
            const div = document.createElement('div');
            div.className = 'text-center text-gray-600 py-10';
            div.textContent = 'Aucun article de blog trouvé.';
            blogContainer.appendChild(div);
            return;
        }

        blogFiles.sort((a, b) => {
            const numA = parseInt(a.match(/blog-(\d+)\.html/)[1]);
            const numB = parseInt(b.match(/blog-(\d+)\.html/)[1]);
            return numB - numA;
        });

        for (const file of blogFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const content = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    const blogTitle = doc.querySelector('.blog-title')?.textContent || 'Untitled Blog';
                    const blogDate = doc.querySelector('.text-gray-600')?.textContent || 'Date Unknown';
                    const blogSubtitle = doc.querySelector('.sub-title')?.innerHTML || 'No subtitle available.';
                    const blogNumber = file.match(/blog-(\d+)\.html/)[1];
                    const blogImageSrc = `../img/blog/blog-${blogNumber}.jpeg`;

                    const div = document.createElement('div');
                    div.className = 'border-b pb-6';
                    div.innerHTML = `
                        <h2 class="blog-title text-2xl font-semibold mb-2">${blogTitle}</h2>
                        <p class="text-gray-600 mb-2">${blogDate}</p>
                        <img src="${blogImageSrc}" alt="Blog ${blogNumber} Image" class="w-25 h-auto object-cover mb-4">
                        <p class="sub-title text-lg">${blogSubtitle}</p>
                        <a href="${file}" class="blog-link text-blue-600 hover:underline">Lire la suite</a>
                        <!-- Share Block -->
                        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
                            <p class="text-lg font-semibold mb-2">Partagez cet article :</p>
                            <div class="flex space-x-4 share-buttons">
                                <a data-platform="linkedin" href="#" target="_blank" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                                    <i class="fab fa-linkedin mr-2"></i> LinkedIn
                                </a>
                                <a data-platform="reddit" href="#" target="_blank" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center">
                                    <i class="fab fa-reddit mr-2"></i> Reddit
                                </a>
                                <a data-platform="x" href="#" target="_blank" class="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center">
                                    <i class="fab fa-x-twitter mr-2"></i> X
                                </a>
                                <a data-platform="facebook" href="#" target="_blank" class="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 flex items-center">
                                    <i class="fab fa-facebook-f mr-2"></i> Facebook
                                </a>
                            </div>
                        </div>
                    `;
                    blogContainer.appendChild(div);
                }
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }

        initializeShareButtons();
    }

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

                container.querySelectorAll('a[data-platform]').forEach(button => {
                    const platform = button.getAttribute('data-platform');
                    if (shareLinks[platform]) {
                        button.href = shareLinks[platform];
                    }
                });
            });
        } else {
            console.warn('No .share-buttons elements found in the document.');
        }
    }

    if (window.location.pathname.includes('blog.html')) {
        loadBlogPosts().then(() => {
            initializeShareButtons();
        });
    }

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
            const maxIndex = totalImages - 1 
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
                const response = await fetch('/assets/partials/sidebar.html');
                if (response.ok) {
                    const sidebarContent = await response.text();
                    sidebarContainer.innerHTML = sidebarContent;
                } else {
                    console.error('Failed to load sidebar:', response.status);
                }
            } catch (error) {
                console.error('Error loading sidebar:', error);
            }
        }
    }

    async function loadVisitCounterBlock() {
        const mainContent = document.querySelector('main');
        if (mainContent && (window.location.pathname.includes('blogs/blog-') || window.location.pathname.includes('index.html'))) {
            try {
                const response = await fetch('/assets/partials/visit-counter.html');
                if (response.ok) {
                    const counterContent = await response.text();
                    const counterDiv = document.createElement('div');
                    counterDiv.innerHTML = counterContent;
                    const visitCountElement = counterDiv.querySelector('#visit-count');
                    if (visitCountElement) {
                        const pageUrl = window.location.pathname;
                        let visits = localStorage.getItem(`visitCount_${pageUrl}`);
                        if (!visits) {
                            // Generate a random number between 100 and 999
                            visits = Math.floor(Math.random() * 900) + 100;
                        } else {
                            visits = parseInt(visits) + 1;
                        }
                        localStorage.setItem(`visitCount_${pageUrl}`, visits);
                        visitCountElement.textContent = visits;
                    }
                    const navBlock = mainContent.querySelector('.flex.justify-between');
                    if (navBlock) {
                        mainContent.insertBefore(counterDiv, navBlock);
                    } else {
                        mainContent.appendChild(counterDiv);
                    }
                } else {
                    console.error('Failed to load visit counter block:', response.status);
                }
            } catch (error) {
                console.error('Error loading visit counter block:', error);
            }
        }
    }    

    function setupBlogNavigation() {
        const currentPath = window.location.pathname;
        const currentNumber = parseInt(currentPath.match(/blog-(\d+)\.html/)?.[1] || 1);
        const navBlock = document.querySelector('.flex.justify-between');

        if (navBlock) {
            const prevLink = navBlock.querySelector('a:nth-child(1)');
            const nextLink = navBlock.querySelector('a:nth-child(2)');
            const maxBlogNumber = 6;

            if (currentNumber === 1) {
                prevLink.href = '/blog.html';
                prevLink.classList.add('cursor-not-allowed', 'text-gray-400');
                prevLink.classList.remove('hover:underline');
                prevLink.textContent = '← Précédent List blogs';
            } else {
                prevLink.href = `/blogs/blog-${currentNumber - 1}.html`;
                prevLink.textContent = '← Précédent';
            }

            if (currentNumber === maxBlogNumber) {
                nextLink.href = '#';
                nextLink.classList.add('cursor-not-allowed', 'text-gray-400');
                nextLink.classList.remove('hover:underline');
                nextLink.textContent = 'next blog →';
            } else {
                nextLink.href = `/blogs/blog-${currentNumber + 1}.html`;
                nextLink.textContent = 'next blog →';
            }
        }
    }

    // Load sidebar on all pages
    loadSidebar().then(() => {
        // After sidebar is loaded, initialize share buttons on all pages
        initializeShareButtons();
    }).catch(error => {
        console.error('Error loading sidebar:', error);
    });

    // Load visit counter and setup blog navigation only on specific pages
    if (window.location.pathname.includes('blogs/blog-') || window.location.pathname.includes('index.html')) {
        Promise.all([loadVisitCounterBlock(), setupBlogNavigation()])
            .then(() => {
                initializeShareButtons();
            })
            .catch(error => console.error('Error in Promise.all:', error));
    }

    // Ensure share buttons are initialized on pages that don't load the sidebar dynamically
    if (!window.location.pathname.includes('blog.html')) {
        initializeShareButtons();
    }
});