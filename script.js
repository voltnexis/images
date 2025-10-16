document.addEventListener('DOMContentLoaded', async () => {
    const imageGrid = document.getElementById('imageGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let currentPage = 0;
    const imagesPerPage = 8;
    let isLoading = false;

    // Initialize hero slideshow
    await initHeroSlideshow();

    function createImageCard(image) {
        const card = document.createElement('div');
        card.classList.add('image-card');

        const img = document.createElement('img');
        img.src = image.image_url;
        img.alt = image.title;
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.classList.add('image-info');
        info.innerHTML = `
            <strong>${image.title}</strong><br>
            <small>by ${image.users?.username || 'Unknown'}</small>
        `;

        card.appendChild(img);
        card.appendChild(info);

        // Navigate to image detail page
        card.addEventListener('click', () => {
            window.location.href = `image.html?id=${image.id}`;
        });

        return card;
    }

    async function loadImages() {
        if (isLoading) return;
        
        isLoading = true;
        loadMoreBtn.textContent = 'Loading...';
        loadMoreBtn.disabled = true;

        try {
            const images = await db.getImages(currentPage, imagesPerPage);
            
            if (images && images.length > 0) {
                images.forEach(image => {
                    const imageCard = createImageCard(image);
                    imageGrid.appendChild(imageCard);
                });
                
                currentPage++;
                
                // Hide load more button if we got fewer images than requested
                if (images.length < imagesPerPage) {
                    loadMoreBtn.style.display = 'none';
                }
            } else {
                loadMoreBtn.style.display = 'none';
                if (currentPage === 0) {
                    imageGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">No images found. Be the first to upload!</p>';
                }
            }
        } catch (error) {
            console.error('Error loading images:', error);
            if (currentPage === 0) {
                imageGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">Error loading images. Please try again later.</p>';
            }
        } finally {
            isLoading = false;
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.disabled = false;
        }
    }

    // Initial load
    await loadImages();

    // Load more button functionality
    loadMoreBtn.addEventListener('click', loadImages);
});

// Hero slideshow functionality
let heroSlides = [
    { src: 'assets/hero1.png', title: 'Premium Image Library', subtitle: 'Discover stunning visuals from talented photographers' },
    { src: 'assets/hero2.png', title: 'High Quality Photos', subtitle: 'Professional grade images for your projects' },
    { src: 'assets/hero3.png', title: 'Creative Collection', subtitle: 'Curated selection of premium visuals' },
    { src: 'assets/hero4.png', title: 'Inspiration AT Work', subtitle: 'Fuel Your Day, Create Your Future' }
];
let currentSlide = 0;
let slideInterval;

async function initHeroSlideshow() {
    createHeroSlides();
    startSlideshow();
}

function createHeroSlides() {
    const slideshow = document.querySelector('.hero-slideshow');
    const dotsContainer = document.getElementById('hero-dots');
    
    slideshow.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    heroSlides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slideElement.id = `hero-slide-${index}`;
        slideElement.style.backgroundImage = `url(${slide.src})`;
        
        slideElement.innerHTML = `
            <div class="hero-content">
                <h1>${slide.title}</h1>
                <p>${slide.subtitle}</p>
            </div>
        `;
        
        slideshow.appendChild(slideElement);
        
        const dot = document.createElement('div');
        dot.className = `hero-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
}

function createDefaultSlide() {
    const slideshow = document.querySelector('.hero-slideshow');
    slideshow.innerHTML = `
        <div class="hero-slide active" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color))">
            <div class="hero-content">
                <h1>Premium Image Library</h1>
                <p>Discover a curated collection of premium visuals from talented photographers worldwide.</p>
            </div>
        </div>
    `;
}

function goToSlide(index) {
    if (index === currentSlide || heroSlides.length === 0) return;
    
    // Update slides
    document.querySelector(`#hero-slide-${currentSlide}`).classList.remove('active');
    document.querySelector(`#hero-slide-${index}`).classList.add('active');
    
    // Update dots
    document.querySelectorAll('.hero-dot')[currentSlide].classList.remove('active');
    document.querySelectorAll('.hero-dot')[index].classList.add('active');
    
    currentSlide = index;
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % heroSlides.length;
    goToSlide(nextIndex);
}

function startSlideshow() {
    if (heroSlides.length <= 1) return;
    
    slideInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
    
    // Pause on hover
    const heroSection = document.querySelector('.hero-section');
    heroSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
    heroSection.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 4000);
    });
}

