# Aura Tree API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.auratree.com/api/v1
```

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

## Response Format

All responses follow this structure:
```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": { ... }
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "abc123",
    "email": "user@example.com",
    "username": "johndoe1234",
    "displayName": "John Doe",
    "token": "custom_token"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Users

#### Get Profile
```http
GET /user/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "My bio",
  "username": "newusername"
}
```

#### Upload Avatar
```http
POST /user/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <image_file>
```

#### Get User by Username (Public)
```http
GET /user/:username
```

---

### Aura Trees

#### Create Aura Tree
```http
POST /auratree
Authorization: Bearer <token>
Content-Type: application/json

{
  "slug": "my-page",
  "displayName": "My Page",
  "bio": "Welcome to my page",
  "theme": {
    "background": "linear-gradient(...)",
    "accentColor": "#7B61FF",
    "glassOpacity": 0.06,
    "font": "Inter"
  }
}
```

#### Get Public Aura Tree
```http
GET /auratree/public/:slug
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tree123",
    "slug": "my-page",
    "displayName": "My Page",
    "bio": "Welcome",
    "avatarUrl": "https://...",
    "theme": { ... },
    "qrCodeUrl": "https://...",
    "links": [
      {
        "id": "link1",
        "title": "My Instagram",
        "url": "https://instagram.com/...",
        "platform": "instagram",
        "icon": "instagram",
        "color": "#E4405F"
      }
    ]
  }
}
```

#### Get My Aura Tree
```http
GET /auratree/me
Authorization: Bearer <token>
```

#### Update Aura Tree
```http
PUT /auratree/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Updated Name",
  "bio": "Updated bio",
  "theme": { ... }
}
```

#### Update Slug
```http
PUT /auratree/:id/slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "slug": "new-slug"
}
```

#### Upload Background
```http
POST /auratree/:id/background
Authorization: Bearer <token>
Content-Type: multipart/form-data

background: <image_file>
```

#### Delete Aura Tree
```http
DELETE /auratree/:id
Authorization: Bearer <token>
```

---

### Links

#### Add Link
```http
POST /links/auratree/:id/links
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://instagram.com/username",
  "title": "My Instagram",
  "customTitle": "Follow me on Instagram",
  "order": 1
}
```

**Auto-detection:** The platform will be automatically detected from the URL.

#### Get Links
```http
GET /links/auratree/:id/links
```

#### Update Link
```http
PUT /links/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "auraTreeId": "tree123",
  "title": "Updated Title",
  "isVisible": true
}
```

#### Delete Link
```http
DELETE /links/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "auraTreeId": "tree123"
}
```

#### Reorder Links
```http
PATCH /links/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "auraTreeId": "tree123",
  "linkOrders": [
    { "linkId": "link1", "order": 0 },
    { "linkId": "link2", "order": 1 },
    { "linkId": "link3", "order": 2 }
  ]
}
```

#### Detect Platform
```http
POST /links/detect-platform
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "platform": {
      "name": "youtube",
      "icon": "youtube",
      "label": "YouTube",
      "color": "#FF0000"
    },
    "suggestedTitle": "YouTube Video"
  }
}
```

---

### Payments

#### Initialize Payment
```http
POST /payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "pro"  // or "teams"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "PAY_REF_123"
  }
}
```

#### Verify Payment
```http
POST /payments/verify
Content-Type: application/json

{
  "reference": "PAY_REF_123"
}
```

#### Get Subscription
```http
GET /payments/subscription
Authorization: Bearer <token>
```

#### Cancel Subscription
```http
POST /payments/cancel
Authorization: Bearer <token>
```

#### Get Payment History
```http
GET /payments/history
Authorization: Bearer <token>
```

---

### Admin

All admin endpoints require admin authentication.

#### Get Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 850,
      "recent": 50
    },
    "auraTrees": {
      "total": 800,
      "active": 750
    },
    "links": {
      "total": 5000
    },
    "subscriptions": {
      "free": 700,
      "pro": 250,
      "teams": 50
    },
    "revenue": {
      "total": 500000,
      "currency": "NGN"
    }
  }
}
```

#### Get Users
```http
GET /admin/users?page=1&limit=20&search=john&plan=pro
Authorization: Bearer <admin_token>
```

#### Get User Details
```http
GET /admin/users/:id
Authorization: Bearer <admin_token>
```

#### Update User
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "displayName": "New Name",
  "subscription": {
    "plan": "pro",
    "status": "active"
  }
}
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

#### Get Aura Trees
```http
GET /admin/auratrees?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Get Payments
```http
GET /admin/payments?page=1&limit=20&status=success
Authorization: Bearer <admin_token>
```

#### Get Analytics
```http
GET /admin/analytics?period=30d
Authorization: Bearer <admin_token>
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error - Invalid data format |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 10 requests per 15 minutes
- Webhooks: No limit

## Supported Platforms

The API automatically detects 40+ platforms including:

**Social Media:** Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Snapchat, Pinterest, Reddit

**Video:** YouTube, Twitch

**Music:** Spotify, Apple Music, SoundCloud

**Payment:** PayPal, Venmo, Cash App, Buy Me a Coffee, Ko-fi, Patreon

**Creative:** GitHub, Behance, Dribbble, Figma

**Content:** Medium, Substack, Notion

**Shopping:** Etsy, Amazon, Shopify

**Messaging:** WhatsApp, Telegram, Discord
