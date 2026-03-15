# Aura Tree Backend API

A production-ready Node.js/TypeScript backend for Aura Tree - a premium link-in-bio platform.

## 🚀 Features

- **Authentication**: Firebase Authentication with email/password
- **Database**: Firebase Firestore for data storage
- **Media Storage**: Cloudinary for image uploads and optimization
- **Payments**: Paystack integration for subscriptions
- **QR Codes**: Automatic QR code generation for Aura Trees
- **Smart Platform Detection**: Auto-detects 40+ platforms from URLs
- **Admin Dashboard**: Full-featured admin panel for management
- **Security**: Rate limiting, input validation, and secure headers

## 📁 Project Structure

```
/server
  /config
    firebase.ts          # Firebase Admin SDK configuration
    cloudinary.ts        # Cloudinary configuration
    paystack.ts          # Paystack payment configuration
  /controllers
    auth.controller.ts   # Authentication handlers
    user.controller.ts   # User profile management
    auraTree.controller.ts # Aura Tree CRUD operations
    link.controller.ts   # Link management
    payment.controller.ts # Payment processing
    admin.controller.ts  # Admin dashboard operations
  /routes
    auth.routes.ts       # Auth routes
    user.routes.ts       # User routes
    auraTree.routes.ts   # Aura Tree routes
    link.routes.ts       # Link routes
    payment.routes.ts    # Payment routes
    admin.routes.ts      # Admin routes
  /middlewares
    auth.middleware.ts   # Token verification
    error.middleware.ts  # Error handling
    upload.middleware.ts # File upload handling
  /utils
    detectPlatform.ts    # Platform detection utility
    generateQRCode.ts    # QR code generation
    helpers.ts           # General helper functions
  /admin
    index.html           # Admin dashboard UI
  app.ts                 # Express app configuration
  index.ts               # Server entry point
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

#### Firebase Configuration
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

#### Cloudinary Configuration
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Paystack Configuration
```env
PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_SECRET_KEY=sk_test_your_key
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Authentication (Email/Password provider)
4. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file
   - Copy the values to your `.env` file

### 4. Cloudinary Setup

1. Create an account at [cloudinary.com](https://cloudinary.com)
2. Get your API credentials from the Dashboard
3. Create an upload preset named `aura_tree_uploads`

### 5. Paystack Setup

1. Create an account at [paystack.com](https://paystack.com)
2. Get your API keys from the Dashboard
3. Set up webhook endpoint: `https://your-api.com/api/v1/payments/webhook`

### 6. Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.email in ['admin@auratree.com'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Aura Trees collection
    match /auraTrees/{treeId} {
      allow read: if resource.data.isActive == true || 
        (isAuthenticated() && request.auth.uid == resource.data.userId);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow delete: if isAuthenticated() && 
        (request.auth.uid == resource.data.userId || isAdmin());
      
      // Links subcollection
      match /links/{linkId} {
        allow read: if get(/databases/$(database)/documents/auraTrees/$(treeId)).data.isActive == true ||
          (isAuthenticated() && request.auth.uid == get(/databases/$(database)/documents/auraTrees/$(treeId)).data.userId);
        allow write: if isAuthenticated() && 
          request.auth.uid == get(/databases/$(database)/documents/auraTrees/$(treeId)).data.userId;
      }
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow write: if isAdmin();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow write: if isAdmin();
    }
    
    // Admin logs
    match /adminLogs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/verify-email` | Request email verification |
| POST | `/api/v1/auth/logout` | Logout user |
| DELETE | `/api/v1/auth/account` | Delete account |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/me` | Get user profile |
| PUT | `/api/v1/user/profile` | Update profile |
| POST | `/api/v1/user/avatar` | Upload avatar |
| DELETE | `/api/v1/user/avatar` | Delete avatar |
| PUT | `/api/v1/user/password` | Change password |
| PUT | `/api/v1/user/email` | Change email |
| GET | `/api/v1/user/:username` | Get user by username |
| GET | `/api/v1/user/check-username/:username` | Check username availability |

### Aura Tree Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auratree` | Create Aura Tree |
| GET | `/api/v1/auratree/me` | Get my Aura Tree |
| GET | `/api/v1/auratree/public/:slug` | Get public Aura Tree |
| PUT | `/api/v1/auratree/:id` | Update Aura Tree |
| PUT | `/api/v1/auratree/:id/slug` | Update slug |
| POST | `/api/v1/auratree/:id/background` | Upload background |
| DELETE | `/api/v1/auratree/:id` | Delete Aura Tree |
| GET | `/api/v1/auratree/:id/analytics` | Get analytics |

### Link Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/links/auratree/:id/links` | Add link |
| GET | `/api/v1/links/auratree/:id/links` | Get links |
| PUT | `/api/v1/links/:id` | Update link |
| DELETE | `/api/v1/links/:id` | Delete link |
| PATCH | `/api/v1/links/reorder` | Reorder links |
| POST | `/api/v1/links/:id/click` | Track link click |
| POST | `/api/v1/links/detect-platform` | Detect platform from URL |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/initialize` | Initialize payment |
| POST | `/api/v1/payments/verify` | Verify payment |
| GET | `/api/v1/payments/subscription` | Get subscription |
| POST | `/api/v1/payments/cancel` | Cancel subscription |
| GET | `/api/v1/payments/history` | Get payment history |
| POST | `/api/v1/payments/webhook` | Paystack webhook |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Get dashboard stats |
| GET | `/api/v1/admin/analytics` | Get analytics |
| GET | `/api/v1/admin/users` | Get all users |
| GET | `/api/v1/admin/users/:id` | Get user details |
| PUT | `/api/v1/admin/users/:id` | Update user |
| DELETE | `/api/v1/admin/users/:id` | Delete user |
| GET | `/api/v1/admin/auratrees` | Get all Aura Trees |
| GET | `/api/v1/admin/payments` | Get all payments |
| GET | `/api/v1/admin/logs` | Get admin logs |
| POST | `/api/v1/admin/logs` | Create admin log |

## 🎨 Admin Dashboard

Access the admin dashboard at:
```
http://localhost:5000/admin
```

Default credentials (for development):
- Email: `admin@auratree.com`
- Password: `admin123`

**Important**: Change these credentials in production!

## 🔧 Platform Detection

The backend automatically detects 40+ platforms including:
- Social: Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Snapchat
- Video: YouTube, Twitch
- Music: Spotify, Apple Music, SoundCloud
- Payment: PayPal, Venmo, Cash App, Buy Me a Coffee, Ko-fi, Patreon
- Creative: GitHub, Behance, Dribbble, Figma
- Content: Medium, Substack, Notion
- Shopping: Etsy, Amazon, Shopify
- Messaging: WhatsApp, Telegram, Discord

## 📦 Deployment

### Deploy to Render/Railway/Heroku

1. Set environment variables in your hosting platform
2. Deploy the code
3. Update frontend API URL

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

For support, email support@auratree.com or join our Discord community.
