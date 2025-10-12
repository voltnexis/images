document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('id');

    if (!imageId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Load image details
        const image = await db.getImageById(imageId);
        
        if (!image) {
            alert('Image not found');
            window.location.href = 'index.html';
            return;
        }

        // Update page content
        updatePageContent(image);
        
        // Load related images
        loadRelatedImages(image.user_id, imageId);
        
        // Update view count (in a real app, you'd want to track unique views)
        updateViewCount(imageId);

    } catch (error) {
        console.error('Error loading image:', error);
        alert('Error loading image details');
        window.location.href = 'index.html';
    }
});

function updatePageContent(image) {
    // Update page title and meta
    document.getElementById('page-title').textContent = `${image.title} - VoltNexis`;
    document.getElementById('page-description').content = image.description || `View ${image.title} by ${image.users?.username}`;
    
    // Update main image
    const mainImage = document.getElementById('main-image');
    mainImage.src = image.image_url;
    mainImage.alt = image.title;
    
    // Update image details
    document.getElementById('image-title').textContent = image.title;
    document.getElementById('image-description').textContent = image.description || 'No description provided.';
    document.getElementById('view-count').textContent = image.views || 0;
    document.getElementById('file-size').textContent = formatFileSize(image.original_file_size || image.file_size);
    document.getElementById('file-type').textContent = image.original_format ? image.original_format.toUpperCase() : 'Unknown';
    
    // Update photographer info
    const user = image.users;
    if (user) {
        document.getElementById('photographer-avatar').src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3f51b5&color=fff&size=200`;
        document.getElementById('photographer-name').textContent = user.username;
        document.getElementById('photographer-bio').textContent = user.bio || 'No bio available.';
        
        // View profile button
        document.getElementById('view-profile-btn').addEventListener('click', () => {
            window.location.href = `person.html?id=${user.id}`;
        });
    }
    
    // Download button - downloads in original format
    document.querySelector('.download-btn').addEventListener('click', async () => {
        try {
            const downloadBtn = document.querySelector('.download-btn');
            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = 'Converting...';
            downloadBtn.disabled = true;
            
            if (image.original_url) {
                // Download original file directly
                const link = document.createElement('a');
                link.href = image.original_url;
                link.download = `${image.title}.${image.original_format}`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Fallback: convert WebP back to original format
                const response = await fetch(image.image_url);
                const webpBlob = await response.blob();
                const convertedBlob = await imageUtils.convertFromWebP(webpBlob, image.original_format || 'png');
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(convertedBlob);
                link.download = `${image.title}.${image.original_format || 'png'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }
            
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading image');
            document.querySelector('.download-btn').textContent = 'Download';
            document.querySelector('.download-btn').disabled = false;
        }
    });
    
    // Share button
    document.querySelector('.share-btn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: image.title,
                text: `Check out this image: ${image.title}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    });
}

async function loadRelatedImages(userId, currentImageId) {
    try {
        const relatedImages = await db.getUserImages(userId);
        const relatedGrid = document.getElementById('related-grid');
        
        // Filter out current image and limit to 6
        const filteredImages = relatedImages
            .filter(img => img.id !== currentImageId)
            .slice(0, 6);
        
        if (filteredImages.length === 0) {
            relatedGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">No other images from this photographer.</p>';
            return;
        }
        
        filteredImages.forEach(image => {
            const card = createRelatedImageCard(image);
            relatedGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading related images:', error);
        document.getElementById('related-grid').innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">Error loading related images.</p>';
    }
}

function createRelatedImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('image-card');
    
    const img = document.createElement('img');
    img.src = image.image_url;
    img.alt = image.title;
    img.loading = 'lazy';
    
    const info = document.createElement('div');
    info.classList.add('image-info');
    info.innerHTML = `<strong>${image.title}</strong>`;
    
    card.appendChild(img);
    card.appendChild(info);
    
    card.addEventListener('click', () => {
        window.location.href = `image.html?id=${image.id}`;
    });
    
    return card;
}

async function updateViewCount(imageId) {
    try {
        // In a real app, you'd want to track unique views and update the database
        // For now, we'll just increment the display counter
        const viewCountElement = document.getElementById('view-count');
        const currentViews = parseInt(viewCountElement.textContent) || 0;
        viewCountElement.textContent = currentViews + 1;
    } catch (error) {
        console.error('Error updating view count:', error);
    }
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}