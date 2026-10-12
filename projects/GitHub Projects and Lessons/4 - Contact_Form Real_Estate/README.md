# Real Estate Portfolio Website

Professional real estate website with portfolio showcase, contact form, and admin panel for managing property photos and drone footage.

## Features

✨ **Professional Design**
- Modern, responsive layout
- Dark/gold color scheme
- Mobile-friendly interface

📸 **Portfolio Management**
- Upload interior, exterior, wide-angle photos
- Upload drone footage
- Categorize and filter images
- Easy-to-use admin dashboard

📧 **Contact Form**
- Form validation
- Integration with Formspree
- Spam protection

🔐 **Admin Panel**
- Username & password protected access
- 12-hour session tokens
- Upload files from any device
- Delete portfolio items

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Admin Credentials
```bash
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your-secure-password"
```

### 3. Start Server
```bash
npm start
```

Server will run at: `http://localhost:3000`

### 4. Access Admin Panel
Visit: `http://localhost:3000/admin.html`
- Username: `admin` (or whatever you set)
- Password: your secure password

## Project Structure

```
.
├── index.html              # Main website
├── admin.html              # Admin dashboard
├── styles.css              # All styling
├── server.js               # Express backend
├── package.json            # Dependencies
├── portfolio.db            # SQLite database (created on first run)
├── uploads/                # Portfolio uploads directory
└── README.md               # This file
```

## Admin Panel Usage

### Login
1. Go to `http://localhost:3000/admin.html`
2. Enter your username and password
3. You're logged in for 12 hours

### Upload Portfolio Items
1. Click "Upload" tab
2. Select category (Interior, Exterior, Wide Angle, Drone)
3. Add optional title
4. Choose file (JPG, PNG, MP4, MOV)
5. Click "Upload"

### Manage Portfolio
1. Click "Manage Portfolio" tab
2. View all uploads
3. Click "Delete" to remove items

## Environment Variables

- `ADMIN_USERNAME` - Admin username (default: admin)
- `ADMIN_PASSWORD` - Admin password (required for security)
- `PORT` - Server port (default: 3000)

## Supported File Types

- **Images:** JPG, PNG, WebP
- **Videos:** MP4, MOV (up to 50MB)

## Deployment

### Heroku/Railway/Render
```bash
# Set environment variables
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Push to deploy
git push heroku main
```

### Self-Hosted
1. Install Node.js
2. Clone repository
3. Run setup above
4. Use nginx/Apache as reverse proxy
5. Use PM2 or systemd to keep running

## Security Notes

- Always use a strong admin password
- Change password periodically
- Use HTTPS in production
- Sessions expire after 12 hours
- File uploads limited to 50MB
- Username and password checked on every login

## Contact Form Integration

Form submits to Formspree at: `https://formspree.io/f/xzzprjvo`

Update the form action in `index.html` with your own Formspree endpoint.

## Support

For issues or questions, check the following:
- Server console for error messages
- Browser console for client-side errors
- Ensure `uploads/` directory exists and is writable
- Verify username and password are set correctly
