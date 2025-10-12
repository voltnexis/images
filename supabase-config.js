// Supabase Configuration
const SUPABASE_URL = 'https://lvzlrmkgvosrpnyrvpff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2emxybWtndm9zcnBueXJ2cGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTI3MzQsImV4cCI6MjA3NTgyODczNH0.k8ILuG-kduFb0yQLyWnoQXYtzcAS0Egp-mFhK3BEkjo';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Image conversion utilities
const imageUtils = {
    // Convert any image to WebP
    async convertToWebP(file, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(resolve, 'image/webp', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    },

    // Convert WebP back to original format
    async convertFromWebP(webpBlob, targetFormat, quality = 0.9) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const mimeType = `image/${targetFormat.toLowerCase()}`;
                canvas.toBlob(resolve, mimeType, quality);
            };
            
            img.src = URL.createObjectURL(webpBlob);
        });
    }
};

// Database helper functions
const db = {
    // Upload image (converts to WebP and stores both formats)
    async uploadImage(file, title, description, userId) {
        try {
            const timestamp = Date.now();
            const originalFormat = file.type.split('/')[1];
            
            // Convert to WebP
            const webpBlob = await imageUtils.convertToWebP(file);
            
            // Upload WebP version
            const webpFileName = `${timestamp}-${file.name.split('.')[0]}.webp`;
            const { error: webpError } = await supabase.storage
                .from('images')
                .upload(webpFileName, webpBlob);
            
            if (webpError) throw webpError;
            
            // Upload original version
            const originalFileName = `${timestamp}-original-${file.name}`;
            const { error: originalError } = await supabase.storage
                .from('images')
                .upload(originalFileName, file);
            
            if (originalError) throw originalError;
            
            // Get public URLs
            const { data: { publicUrl: webpUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(webpFileName);
                
            const { data: { publicUrl: originalUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(originalFileName);

            // Insert image record
            const { data, error } = await supabase
                .from('images')
                .insert([{
                    title,
                    description,
                    image_url: webpUrl,
                    original_url: originalUrl,
                    file_name: webpFileName,
                    original_file_name: originalFileName,
                    user_id: userId,
                    file_size: webpBlob.size,
                    original_file_size: file.size,
                    file_type: 'image/webp',
                    original_format: originalFormat
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Get all images with pagination
    async getImages(page = 0, limit = 6) {
        try {
            const { data, error } = await supabase
                .from('images')
                .select(`
                    *,
                    users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false })
                .range(page * limit, (page + 1) * limit - 1);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching images:', error);
            throw error;
        }
    },

    // Get single image by ID
    async getImageById(id) {
        try {
            const { data, error } = await supabase
                .from('images')
                .select(`
                    *,
                    users (
                        id,
                        username,
                        avatar_url,
                        bio,
                        created_at
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching image:', error);
            throw error;
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Get user's images
    async getUserImages(userId) {
        try {
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user images:', error);
            throw error;
        }
    },

    // Create user profile
    async createUser(username, bio = null) {
        try {
            const userData = {
                username,
                bio,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3f51b5&color=fff&size=200`
            };

            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Find user by username
    async findUserByUsername(username) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    }
};