document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Load user profile
        const user = await db.getUserProfile(userId);
        
        if (!user) {
            alert('User not found');
            window.location.href = 'index.html';
            return;
        }

        // Update page content
        updatePageContent(user);
        
        // Load user images
        loadUserImages(userId);

    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Error loading user profile');
        window.location.href = 'index.html';
    }
});

async function updatePageContent(user) {
    // Update page title and meta
    document.getElementById('page-title').textContent = `${user.username} - VoltNexis`;
    document.getElementById('page-description').content = `View ${user.username}'s profile and image collection`;
    
    // Update profile info
    document.getElementById('profile-avatar').src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3f51b5&color=fff&size=200`;
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio available.';
    document.getElementById('gallery-username').textContent = user.username;
    
    // Update member since
    const memberSince = new Date(user.created_at);
    const monthYear = memberSince.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
    });
    document.getElementById('member-since').textContent = monthYear;
}

async function loadUserImages(userId) {
    try {
        const images = await db.getUserImages(userId);
        const imageGrid = document.getElementById('user-images-grid');
        const noImagesDiv = document.getElementById('no-images');
        
        if (!images || images.length === 0) {
            imageGrid.style.display = 'none';
            noImagesDiv.style.display = 'block';
            
            // Update stats
            document.getElementById('image-count').textContent = '0';
            document.getElementById('total-views').textContent = '0';
            return;
        }
        
        // Update stats
        document.getElementById('image-count').textContent = images.length;
        const totalViews = images.reduce((sum, img) => sum + (img.views || 0), 0);
        document.getElementById('total-views').textContent = totalViews.toLocaleString();
        
        // Create image cards
        images.forEach(image => {
            const card = createImageCard(image);
            imageGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading user images:', error);
        const imageGrid = document.getElementById('user-images-grid');
        imageGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">Error loading images.</p>';
    }
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('image-card');
    
    const img = document.createElement('img');
    img.src = image.image_url;
    img.alt = image.title;
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.classList.add('image-info');
    
    const views = image.views || 0;
    const uploadDate = new Date(image.created_at).toLocaleDateString();
    
    info.innerHTML = `
        <strong>${image.title}</strong><br>
        <small>${views} views • ${uploadDate}</small>
    `;
    
    card.appendChild(img);
    card.appendChild(info);
    
    // Navigate to image detail page
    card.addEventListener('click', () => {
        window.location.href = `image.html?id=${image.id}`;
    });
    
    return card;
}