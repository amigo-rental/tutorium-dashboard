# Tutorium Backend Documentation

## 🚀 Overview

This is the backend for the Tutorium application, built with Next.js 15 API routes, Prisma ORM, and PostgreSQL. The backend provides authentication, user management, group management, student management, and recording management for language teachers.

## 🗄️ Database

- **Database**: PostgreSQL (deployed on Railway)
- **ORM**: Prisma
- **Connection**: The database is automatically connected via environment variables

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://postgres:tGNgoLVIGaZQFCIvDNEcGWzdFKPMFUeb@ballast.proxy.rlwy.net:34961/railway"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
NODE_ENV="development"
PORT=3001
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with test data
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

## 📊 Database Schema

### Models

#### User
- `id`: Unique identifier
- `email`: User email (unique per user)
- `name`: User's full name
- `password`: Hashed password
- `role`: ADMIN, TEACHER, or STUDENT
- `avatar`: Optional avatar initials
- `createdAt`, `updatedAt`: Timestamps

#### Group
- `id`: Unique identifier
- `name`: Group name (unique per teacher)
- `description`: Optional group description
- `level`: Language level (A1, A2, B1, B2, etc.)
- `maxStudents`: Maximum number of students
- `isActive`: Whether the group is active
- `teacherId`: Reference to the teacher
- `students`: List of students in the group
- `recordings`: List of recordings for this group

#### Student
- `id`: Unique identifier
- `name`: Student's full name
- `email`: Student email (unique per teacher)
- `level`: Language level
- `avatar`: Optional avatar initials
- `isActive`: Whether the student is active
- `teacherId`: Reference to the teacher
- `groupId`: Optional reference to a group
- `recordings`: List of recordings for this student

#### Recording
- `id`: Unique identifier
- `lessonType`: GROUP or INDIVIDUAL
- `date`: Lesson date
- `youtubeLink`: YouTube video link
- `message`: Optional lesson notes
- `isPublished`: Whether the recording is published
- `teacherId`: Reference to the teacher
- `groupId`: Reference to group (for group lessons)
- `students`: List of students (for individual lessons)
- `attachments`: List of file attachments

#### Attachment
- `id`: Unique identifier
- `filename`: Generated filename
- `originalName`: Original file name
- `mimeType`: File MIME type
- `size`: File size in bytes
- `path`: File path on disk
- `recordingId`: Reference to the recording

## 🔐 Authentication

### JWT Tokens
- Tokens are valid for 7 days
- Stored in localStorage
- Automatically included in API requests

### Protected Routes
All API routes (except auth) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Groups
- `GET /api/groups` - Get all groups for authenticated teacher
- `POST /api/groups` - Create a new group

### Students
- `GET /api/students` - Get all students for authenticated teacher
- `POST /api/students` - Create a new student

### Recordings
- `GET /api/recordings` - Get all recordings for authenticated teacher
- `POST /api/recordings` - Create a new recording

### File Uploads
- `POST /api/uploads` - Upload files for a recording

## 🧪 Test Data

The seed script creates:
- 1 teacher account: `teacher@tutorium.com` / `password123`
- 3 groups (A1, A2, B1 levels)
- 5 students (assigned to groups)
- 2 sample recordings

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- File upload validation
- SQL injection protection via Prisma

## 📁 File Structure

```
tutorium/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── groups/            # Group management
│   ├── students/          # Student management
│   ├── recordings/        # Recording management
│   └── uploads/           # File uploads
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication utilities
│   ├── db/                # Database utilities
│   └── utils/             # General utilities
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── uploads/               # File upload directory
```

## 🚀 Deployment

The backend is designed to work with:
- Vercel (for API routes)
- Railway (for PostgreSQL database)
- Any file storage service (for file uploads)

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Verify Railway database is running

2. **JWT Errors**
   - Ensure JWT_SECRET is set
   - Check token expiration

3. **File Upload Issues**
   - Verify uploads directory exists
   - Check file size limits
   - Ensure proper permissions

### Logs
Check the console output for detailed error messages and API request logs.

## 📝 Development Notes

- The backend uses Next.js 15 App Router
- All API routes are serverless functions
- Prisma provides type-safe database access
- File uploads are stored locally (consider cloud storage for production)
- Authentication state is managed via React Context

## 🔮 Future Enhancements

- Email verification
- Password reset functionality
- File storage in cloud (AWS S3, Cloudinary)
- Real-time notifications
- Analytics and reporting
- Multi-language support
