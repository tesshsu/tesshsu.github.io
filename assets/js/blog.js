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
    }
}

// State management for lazy loading
let allBlogPosts = [];
let displayedPosts = [];
let filteredPosts = [];
let currentPage = 0;
const POSTS_PER_PAGE = 5;
let isLoading = false;
let hasMore = true;
let currentKeyword = '';
let currentCategory = '';

async function getAllBlogFiles() {
    const blogFiles = [];
    let maxIndex = 1;

    while (true) {
        const file = `blogs/blog-${maxIndex}.html`;
        try {
            const response = await fetch(file, { method: 'HEAD' });
            if (response.ok) {
                blogFiles.push(file);
                maxIndex++;
            } else {
                break;
            }
        } catch (error) {
            break;
        }
    }

    return blogFiles.sort((a, b) => {
        const numA = parseInt(a.match(/blog-(\d+)\.html/)[1]);
        const numB = parseInt(b.match(/blog-(\d+)\.html/)[1]);
        return numB - numA;
    });
}

async function parseBlogFile(file) {
    try {
        const response = await fetch(file);
        if (response.ok) {
            const content = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const blogTitle = doc.querySelector('.blog-title')?.textContent || 'Untitled Blog';
            const blogDate = doc.querySelector('.text-gray-600')?.textContent || 'Date Unknown';
            const blogSubtitle = doc.querySelector('.sub-title')?.innerHTML || 'No subtitle available.';
            const blogCategory = doc.querySelector('.category')?.textContent || 'Uncategorized';
            const blogNumber = file.match(/blog-(\d+)\.html/)[1];

            let categoryClass;
            switch (blogCategory.toLowerCase()) {
                case 'cyber':
                    categoryClass = 'bg-blue-100 text-blue-800';
                    break;
                case 'devops':
                    categoryClass = 'bg-green-100 text-green-800';
                    break;
                case 'compute':
                    categoryClass = 'bg-purple-100 text-purple-800';
                    break;
                default:
                    categoryClass = 'bg-gray-100 text-gray-800';
            }

            return {
                file,
                title: blogTitle,
                date: blogDate,
                subtitle: blogSubtitle,
                category: blogCategory,
                categoryClass,
                number: blogNumber,
                imageSrc: `../img/blog/blog-${blogNumber}.jpeg`
            };
        }
    } catch (error) {
        console.error(`Error parsing ${file}:`, error);
    }
    return null;
}

function createBlogElement(postData) {
    const div = document.createElement('div');
    div.className = 'border-b pb-6';
    div.innerHTML = `
        <h2 class="blog-title text-2xl font-semibold mb-2">${postData.title}</h2>
        <div class="flex items-center mb-2">
            <p class="text-gray-600 mr-4">${postData.date}</p>
            <span class="category ${postData.categoryClass} text-sm font-medium px-2.5 py-0.5 rounded">${postData.category}</span>
        </div>
        <img src="${postData.imageSrc}" alt="Blog ${postData.number} Image" class="w-full max-w-3xl mx-auto h-auto object-cover mb-4 rounded shadow" loading="lazy">
        <p class="sub-title text-lg">${postData.subtitle}</p>
        <a href="${postData.file}" class="blog-link text-blue-600 hover:underline">Lire la suite</a>
        <div class="mt-4 p-4 bg-gray-100 rounded-lg">
            <p class="text-lg font-semibold mb-2">Partagez cet article :</p>
            <div class="flex flex-wrap gap-4 share-buttons">
                <a href="#" class="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <i class="fab fa-linkedin mr-2"></i> LinkedIn
                </a>
                <a href="#" class="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    <i class="fab fa-reddit mr-2"></i> Reddit
                </a>
                <a href="#" class="flex items-center bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500">
                    <i class="fab fa-x-twitter mr-2"></i> X
                </a>
                <a href="#" class="flex items-center bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900">
                    <i class="fab fa-facebook-f mr-2"></i> Facebook
                </a>
            </div>
        </div>
    `;
    return { element: div, title: postData.title, category: postData.category, data: postData };
}

async function loadInitialBlogPosts() {
    const blogContainer = document.getElementById('blog-posts');
    blogContainer.innerHTML = '';

    const blogFiles = await getAllBlogFiles();

    if (blogFiles.length === 0) {
        const div = document.createElement('div');
        div.className = 'text-center text-gray-600 py-10';
        div.textContent = 'Aucun article de blog trouvé.';
        blogContainer.appendChild(div);
        return;
    }

    // Parse all blog files
    allBlogPosts = [];
    for (const file of blogFiles) {
        const postData = await parseBlogFile(file);
        if (postData) {
            allBlogPosts.push(postData);
        }
    }

    // Initial display
    displayLazyLoadPosts();

    // Setup intersection observer for lazy loading
    setupLazyLoadObserver();
}

function displayLazyLoadPosts() {
    const blogContainer = document.getElementById('blog-posts');

    // Apply filters
    filteredPosts = allBlogPosts.filter(post => {
        const matchesKeyword = currentKeyword
            ? post.title.toLowerCase().includes(currentKeyword.toLowerCase())
            : true;
        const matchesCategory = currentCategory
            ? post.category.toLowerCase() === currentCategory.toLowerCase()
            : true;
        return matchesKeyword && matchesCategory;
    });

    if (filteredPosts.length === 0) {
        blogContainer.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'text-center text-gray-600 py-10';
        div.textContent = 'Aucun article de blog trouvé.';
        blogContainer.appendChild(div);
        return;
    }

    // Reset pagination
    currentPage = 0;
    displayedPosts = [];
    blogContainer.innerHTML = '';

    loadMorePosts();
}

function loadMorePosts() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    const start = currentPage * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const postsToLoad = filteredPosts.slice(start, end);

    const blogContainer = document.getElementById('blog-posts');

    postsToLoad.forEach(postData => {
        const post = createBlogElement(postData);
        blogContainer.appendChild(post.element);
        displayedPosts.push(post);
    });

    currentPage++;
    hasMore = end < filteredPosts.length;

    initializeShareButtons();
    isLoading = false;
}

function setupLazyLoadObserver() {
    const options = {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMore) {
                loadMorePosts();
            }
        });
    }, options);

    // Observe the last blog post
    const blogContainer = document.getElementById('blog-posts');
    const observeLastPost = () => {
        const lastPost = blogContainer.lastElementChild;
        if (lastPost) {
            observer.observe(lastPost);
        }
    };

    // Initial observation
    observeLastPost();

    // Re-observe when new posts are added
    const observer2 = new MutationObserver(() => {
        observeLastPost();
    });

    observer2.observe(blogContainer, { childList: true });
}

function filterBlogByKeyword() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        currentKeyword = searchInput.value.trim();
        displayLazyLoadPosts();
    });
}

function filterBlogByCategory() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    categoryFilter.addEventListener('change', () => {
        currentCategory = categoryFilter.value;
        displayLazyLoadPosts();
    });
}

function setupBlogNavigation() {
    const currentPath = window.location.pathname;
    const currentNumber = parseInt(currentPath.match(/blog-(\d+)\.html/)?.[1] || 1);
    const navBlock = document.querySelector('.flex.justify-between');

    if (!navBlock) {
        console.warn('Navigation block not found');
        return;
    }

    const prevLink = navBlock.querySelector('a:nth-child(1)');
    const nextLink = navBlock.querySelector('a:nth-child(2)');
    const maxBlogNumber = 24;

    if (!prevLink || !nextLink) return;

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

async function loadVisitCounterBlock() {
    const mainContent = document.querySelector('main');
    if (mainContent && window.location.pathname.includes('blogs/blog-')) {
        try {
            const response = await fetch('/assets/partials/visit-counter.html');
            if (response.ok) {
                const counterContent = await response.text();
                const counterDiv = document.createElement('div');
                counterDiv.innerHTML = counterContent;
                mainContent.appendChild(counterDiv);
            }
        } catch (error) {
            console.error('Error loading visit counter:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('blog.html')) {
        loadInitialBlogPosts();
        filterBlogByKeyword();
        filterBlogByCategory();
    }

    if (window.location.pathname.includes('blogs/blog-')) {
        Promise.all([loadVisitCounterBlock(), setupBlogNavigation()])
            .catch(error => console.error('Error:', error));
    }
});