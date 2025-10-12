document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Image preview
    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                imageUpload.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                imageUpload.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
                uploadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '<p>No image selected.</p>';
            uploadBtn.disabled = true;
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = document.getElementById('imageTitle').value.trim();
        const description = document.getElementById('imageDescription').value.trim();
        const uploaderName = document.getElementById('uploaderName').value.trim();
        const uploaderBio = document.getElementById('uploaderBio').value.trim();
        const file = imageUpload.files[0];

        if (!file || !title || !uploaderName) {
            alert('Please select an image, enter a title, and your name');
            return;
        }

        // Show progress
        uploadBtn.style.display = 'none';
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Uploading...';

        try {
            // Show conversion progress
            progressFill.style.width = '20%';
            progressText.textContent = 'Converting to WebP...';

            // Find or create user
            let user = await db.findUserByUsername(uploaderName);
            if (!user) {
                progressFill.style.width = '30%';
                progressText.textContent = 'Creating user profile...';
                user = await db.createUser(uploaderName, uploaderBio);
            }

            progressFill.style.width = '50%';
            progressText.textContent = 'Uploading images...';

            // Upload image (will convert to WebP internally)
            const uploadedImage = await db.uploadImage(file, title, description, user.id);
            
            progressFill.style.width = '100%';
            progressText.textContent = 'Upload complete!';

            // Success message
            setTimeout(() => {
                alert('Image uploaded successfully!');
                
                // Reset form
                uploadForm.reset();
                imagePreview.innerHTML = '<p>No image selected.</p>';
                uploadBtn.disabled = true;
                uploadBtn.style.display = 'block';
                uploadProgress.style.display = 'none';
                
                // Redirect to image detail page
                window.location.href = `image.html?id=${uploadedImage.id}`;
            }, 1000);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
            
            uploadBtn.style.display = 'block';
            uploadProgress.style.display = 'none';
            progressFill.style.width = '0%';
        }
    });
});