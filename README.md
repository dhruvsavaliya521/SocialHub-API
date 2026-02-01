# 🚀 SocialHub API

A **production-grade, robust RESTful API** for a modern social media platform built using **Node.js, Express, MongoDB, and Mongoose**.
This backend serves as the engine for social interactions, including content creation, user relationships (follow/unfollow), and media management.

---

## 🧠 High-Level Architecture

This project follows a **Layered + MVC (Model-View-Controller) Architecture**, optimized for scalability and clean code separation.

```
   Client (Web/Mobile)
          │
          ▼
    Global Middlewares (CORS, Helmet, Rate Limit)
          │
          ▼
      API Routes
          │
          ▼
    Specific Middlewares (JWT Auth, Multer Upload, Validator)
          │
          ▼
     Controllers (Request handling & Response formatting)
          │
          ▼
      Services (Core business logic & complex calculations)
          │
          ▼
      Models (Data Layer / Mongoose Schemas)
```

### Key Principles

* **Separation of Concerns:** Routes don't know about database logic; Controllers don't handle business rules.
* **Media Handling:** Integrated efficient image/file upload strategies (Multer/Cloudinary).
* **Aggregation Pipelines:** Complex data fetching (e.g., Feed generation) is handled at the Database level for performance.
* **Secure:** Inputs are validated, and sensitive data is hashed.

---

## 📁 Final Folder Structure

```
SocialHub-API/
│
├── src/
│   ├── app.js
│   ├── index.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js         # Media storage config
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   ├── comment.routes.js
│   │   └── like.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   └── comment.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── post.model.js
│   │   ├── comment.model.js
│   │   └── like.model.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js    # JWT Verification
│   │   ├── multer.middleware.js  # File Uploads
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   │
│   └── constants.js
│
├── public/
│   └── temp/                     # Temporary storage for uploads
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Core Features

### 🔐 Authentication & User Management
* **Secure Sign-up/Login:** JWT-based authentication (Access + Refresh tokens).
* **Password Security:** Bcrypt hashing.
* **Profile Management:** Update avatar, cover image, bio, and details.
* **Password Reset:** Secure flow for forgotten passwords.

### 📸 Content & Media
* **Rich Posts:** Create posts with text and image attachments.
* **Media Handling:** Seamless integration with Cloudinary for image hosting.
* **CRUD Operations:** Full control to Update and Delete own posts.

### 🤝 Social Interactions
* **Like System:** Toggle likes on posts and comments.
* **Commenting:** Nested or linear comment threads on posts.
* **Social Graph:** Follow and Unfollow system (Many-to-Many relationships).

### 📡 Feed & Discovery
* **Personalized Feed:** Aggregation pipelines to show posts from followed users.
* **Pagination:** Efficient data loading using `limit` and `skip`.

---

## 🧪 API Routes

### 👤 User & Auth Routes

| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/users/register` | Register a new user | ❌ |
| POST | `/api/v1/users/login` | Login user | ❌ |
| POST | `/api/v1/users/logout` | Logout user | ✅ |
| POST | `/api/v1/users/refresh-token` | Refresh Access Token | ❌ |
| POST | `/api/v1/users/change-password` | Change current password | ✅ |
| GET | `/api/v1/users/current-user` | Get current user profile | ✅ |
| PATCH | `/api/v1/users/update-account` | Update account details | ✅ |
| PATCH | `/api/v1/users/avatar` | Update profile picture | ✅ |
| GET | `/api/v1/users/c/:username` | Get channel/user profile | ✅ |

### 📝 Post Routes

| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/posts` | Create a new post (w/ Image) | ✅ |
| GET | `/api/v1/posts` | Get all posts (Feed) | ✅ |
| GET | `/api/v1/posts/:postId` | Get single post details | ✅ |
| PATCH | `/api/v1/posts/:postId` | Update a post | ✅ |
| DELETE | `/api/v1/posts/:postId` | Delete a post | ✅ |

### ❤️ Like & Comment Routes

| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/api/v1/likes/toggle/p/:postId` | Toggle like on a post |
| POST | `/api/v1/comments/:postId` | Add a comment to a post |
| DELETE | `/api/v1/comments/:commentId` | Delete a comment |

---

## 🔁 Request Lifecycle Example (Create Post)

This demonstrates how a request with a file upload flows through the system.

```
Client (Multipart Form Data)
  ↓
POST /api/v1/posts
  ↓
Multer Middleware
(Extracts file -> Saves to ./public/temp)
  ↓
Auth Middleware
(Verifies JWT -> Attaches User to Req)
  ↓
Post Controller
  ↓
Cloudinary Utility
(Uploads file from local temp to Cloud -> Returns URL)
  ↓
Post Model (MongoDB)
(Saves Post Data + Image URL)
  ↓
JSON Response
(Returns Created Post Object)
```

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<your_user>:<your_pass>@cluster0.mongodb.net
CORS_ORIGIN=*

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Running the Project

### 1️⃣ Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/dhruvsavaliya521/SocialHub-API.git](https://github.com/dhruvsavaliya521/SocialHub-API.git)
cd SocialHub-API
npm install
```

### 2️⃣ Development Mode

Runs the server with Nodemon (auto-restart on changes).

```bash
npm run dev
```

### 3️⃣ Production Mode

```bash
npm start
```

---

## 🧠 Database Design (Mongoose)

We utilize the power of **MongoDB Aggregations** to handle complex social relationships.

* **Users:** Stores basic info + `watchHistory` (if video based).
* **Posts:** Links to `User` (owner).
* **Subscriptions/Follows:** A separate collection handling `subscriber` and `channel` relationships to avoid array bloat in the User document.
* **Likes/Comments:** Linked via ObjectIDs for fast relational queries.

---

## 🔮 Future Enhancements

* **Real-time Chat:** Integration with Socket.io for direct messaging.
* **Notification System:** Alerts for likes, comments, and follows.
* **Video Support:** Transcoding pipeline for video uploads.
* **Redis Caching:** For caching feed results and improving read speeds.

---

## 🏁 Final Notes

This API is designed to be **scalable**, **modular**, and **easy to extend**. It follows modern JavaScript standards (ES6+) and industry best practices for error handling and API response formatting.

its deployed on https://socialhub-api-p3xp.onrender.com
