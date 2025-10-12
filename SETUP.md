# VoltNexis Image Vault - Setup Instructions

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `image-vault`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (2-3 minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Your Application

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Anon key
   ```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire content from `supabase-setup.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create:
   - `users` table for user profiles
   - `images` table for image metadata
   - Storage bucket for image files
   - Row Level Security policies
   - Sample data (optional)

### 5. Configure Storage

1. Go to Storage in your Supabase dashboard
2. You should see an `images` bucket created by the SQL script
3. The bucket is configured to be public for reading
4. Upload policies are set for authenticated users

## File Structure

```
imag vault/
├── index.html              # Main gallery page
├── image.html              # Individual image detail page
├── person.html             # User profile page
├── upload.html             # Image upload page
├── style.css               # All styles
├── script.js               # Main gallery functionality
├── upload-script.js        # Upload page functionality
├── image-detail.js         # Image detail page functionality
├── person.js               # Profile page functionality
├── supabase-config.js      # Supabase configuration and helpers
├── supabase-setup.sql      # Database schema setup
└── SETUP.md               # This file
```

## Features

### ✅ Implemented Features

- **Dynamic Image Gallery**: Loads images from Supabase with pagination
- **Image Upload**: Users can upload images with metadata
- **User Profiles**: Each user has a profile page showing their images
- **Image Detail Pages**: Individual pages for each image with photographer info
- **SEO Optimized**: Dynamic meta tags for better Google indexing
- **Responsive Design**: Works on all device sizes
- **Ad Spaces**: Non-intrusive ad placement areas
- **Image Statistics**: View counts, file info, upload dates

### 🔧 Technical Features

- **Supabase Integration**: Full database and storage integration
- **Row Level Security**: Secure data access policies
- **WebP Conversion**: Automatic client-side conversion to WebP for storage
- **Dual Format Storage**: Stores both WebP (for display) and original format (for download)
- **Smart Downloads**: Downloads in original format with client-side conversion fallback
- **User Management**: Simple user creation and profile management
- **Progressive Loading**: Images load as users scroll
- **Error Handling**: Graceful error handling throughout

## Usage

### For Users

1. **Browse Images**: Visit the main page to see all uploaded images
2. **Upload Images**: 
   - Go to upload page
   - Enter your name, image title, and description
   - Select image and upload!
3. **View Details**: Click any image to see full details and photographer info
4. **View Profiles**: Click on photographer names to see their full portfolio

### For Developers

1. **Adding Features**: The modular structure makes it easy to add new features
2. **Customizing**: Update CSS variables in `style.css` for easy theming
3. **Database Changes**: Modify `supabase-setup.sql` for schema changes
4. **API Extensions**: Add new functions to `supabase-config.js`

## SEO Features

- Dynamic page titles and meta descriptions
- Semantic HTML structure
- Image alt tags
- Clean URLs with query parameters
- Fast loading with lazy image loading
- Mobile-responsive design

## Ad Integration

Ad spaces are strategically placed:
- Between hero and gallery on main page
- Top of image detail pages
- Top of profile pages
- **Not on upload page** (better user experience)

Replace the placeholder ad content in `.ad-banner` elements with your actual ad code.

## Security Notes

- Row Level Security is enabled but allows public access
- No authentication required - users identified by name only
- Image storage is public for all operations
- Simple username-based user identification

## Troubleshooting

### Common Issues

1. **Images not loading**: Check your Supabase URL and API key
2. **Upload failing**: Ensure storage bucket exists and has correct policies
3. **Database errors**: Verify the SQL setup script ran successfully
4. **CORS errors**: Make sure your domain is added to Supabase allowed origins

### Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **This Application**: Review the code comments and console logs

## Image Format Handling

### Upload Process
1. User selects any image format (JPEG, PNG, GIF, etc.)
2. Client-side converts to WebP for efficient storage and display
3. Both WebP and original format are uploaded to Supabase
4. Database stores metadata for both versions

### Download Process
1. User clicks download button
2. System downloads the original format file
3. If original not available, converts WebP back to original format
4. File is downloaded in the user's original format

### Benefits
- **Faster Loading**: WebP images are 25-35% smaller than JPEG/PNG
- **Better UX**: Users get their files in original format when downloading
- **Storage Efficient**: WebP reduces bandwidth and storage costs
- **Universal Compatibility**: Fallback conversion ensures compatibility

## Next Steps

Consider adding:
- Image categories and tags
- Search functionality
- Image likes/favorites
- Comments system
- Admin panel
- Advanced image compression settings
- CDN integration
- Optional user authentication for enhanced features