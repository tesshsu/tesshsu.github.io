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
                    <img src="${blogImageSrc}" alt="Blog ${blogNumber} Image" class="w-full max-w-3xl mx-auto h-auto object-cover mb-4 rounded shadow">
                    <p class="sub-title text-lg">${blogSubtitle}</p>
                    <a href="${file}" class="blog-link text-blue-600 hover:underline">Lire la suite</a>
                    <!-- Share Block -->
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
                blogContainer.appendChild(div);
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }

    initializeShareButtons();
}

async function loadVisitCounterBlock() {
    const mainContent = document.querySelector('main');
    // Only load the visit counter on individual blog pages (e.g., blogs/blog-1.html)
    if (mainContent && window.location.pathname.includes('blogs/blog-')) {
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
                        visits = Math.floor(Math.random() * 900) + 100;
                    } else {
                        visits = parseInt(visits) + 1;
                    }
                    localStorage.setItem(`visitCount_${pageUrl}`, visits);
                    visitCountElement.textContent = visits;
                }
                const navBlock = mainContent.querySelector('.flex.justify-between');
                if (navBlock && navBlock.parentNode === mainContent) {
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

    // Check if navBlock exists before proceeding
    if (!navBlock) {
        console.warn('Navigation block (.flex.justify-between) not found in the DOM');
        return;
    }

    const prevLink = navBlock.querySelector('a:nth-child(1)');
    const nextLink = navBlock.querySelector('a:nth-child(2)');
    const maxBlogNumber = 9;

    // Check if prevLink and nextLink exist
    if (!prevLink || !nextLink) {
        console.warn('Previous or Next link not found in navigation block');
        return;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('blog.html')) {
        loadBlogPosts().then(() => {
            initializeShareButtons();
        });
    }

    if (window.location.pathname.includes('blogs/blog-')) {
        Promise.all([loadVisitCounterBlock(), setupBlogNavigation()])
            .then(() => {
                initializeShareButtons();
            })
            .catch(error => console.error('Error in Promise.all:', error));
    }
});