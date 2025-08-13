# 🎓 Tutorium - Next-Gen Student Dashboard

A modern, sophisticated student dashboard for Tutorium - an ultra-modern Gen Z online Spanish school. Built with Next.js 15, React 18, Tailwind CSS v4, and HeroUI components.

## ✨ Features

### 🎯 **Student Dashboard**
- **Current Courses**: Display multiple courses with progress tracking
- **Upcoming Lessons**: Next lesson information with teacher details
- **Recent Lessons**: Past lessons with recordings, files, and teacher messages
- **Lesson Rating System**: 5-emoji rating system for lesson feedback
- **Course Management**: Continue learning, view details, and course navigation

### 👥 **Groups Management**
- **Group Overview**: Current groups with schedule, teacher, and progress
- **Community Groups**: Discover and join other active groups
- **Advanced Filtering**: Sort by time, type, and program blocks
- **Group Cards**: Beautiful product-style cards with all relevant information

### 👨‍🏫 **Teacher Portal**
- **Lesson Recording Upload**: Upload group and individual lesson recordings
- **File Management**: Attach files and resources to lessons
- **YouTube Integration**: Link to lesson recordings
- **Student Selection**: Multiple student selection with beautiful chips
- **Recording Management**: Edit and manage existing recordings

### ⚙️ **Settings & Profile**
- **Profile Management**: Update name, email, phone, and avatar
- **Theme Switching**: Light/dark mode support
- **Telegram Integration**: Relink Telegram account
- **Responsive Design**: Mobile-first, tablet, and desktop optimized

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.1, React 18.3.1
- **Styling**: Tailwind CSS v4.1.11, HeroUI components
- **Language**: TypeScript 5.6.3
- **Fonts**: Custom Gilroy font family
- **Deployment**: Vercel
- **Database**: PostgreSQL (Railway)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tutorium.git
   cd tutorium
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_railway_postgres_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tutorium/
├── app/                    # Next.js App Router
│   ├── courses/           # Groups management page
│   ├── settings/          # User settings page
│   ├── teacher/           # Teacher portal
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home
│   └── providers.tsx      # Theme and UI providers
├── components/            # Reusable components
│   ├── dashboard-layout.tsx
│   ├── sidebar.tsx
│   ├── dashboard-cards.tsx
│   └── theme-switch.tsx
├── config/               # Configuration files
│   ├── fonts.ts         # Font configuration
│   └── site.ts          # Site metadata
├── styles/              # Global styles
│   └── globals.css      # Tailwind and custom CSS
└── public/              # Static assets
    └── fonts/           # Custom Gilroy fonts
```

## 🎨 Design System

### **Color Palette**
- **Primary**: `#007EFB` (Main accent blue)
- **Secondary**: `#EE7A3F` (Orange)
- **Accent**: `#FDD130` (Yellow)
- **Success**: `#00B67A` (Green)
- **Background**: Pure white
- **Text**: Pure black

### **Typography**
- **Font Family**: Gilroy (Custom)
- **Weights**: 500 (Medium), 700 (Bold)
- **Sizes**: Responsive scale from 14px to 48px

### **Components**
- **Cards**: Large border radius (24px), subtle shadows
- **Buttons**: Consistent styling with hover effects
- **Inputs**: Flat design, focus states with brand colors
- **Layout**: Spacious, clean, modern aesthetic

## 🚀 Deployment

### **Vercel Deployment**

1. **Connect GitHub Repository**
   - Push your code to GitHub
   - Connect repository to Vercel

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure database connection strings are secure

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Preview deployments for pull requests

### **Railway Database Setup**

1. **Create Railway Project**
   - Sign up at [railway.app](https://railway.app)
   - Create new project

2. **Add PostgreSQL**
   - Add PostgreSQL service
   - Note connection details

3. **Database Schema**
   - Run the provided SQL schema
   - Set up Row Level Security policies

4. **Environment Variables**
   - Add `DATABASE_URL` to Vercel
   - Update local `.env.local`

## 🔧 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Code Style**

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with Next.js rules
- **Prettier**: Consistent code formatting
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with custom components

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tailwind responsive utilities
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Optimized images and lazy loading

## 🔐 Security Features

- **Authentication**: Secure user authentication system
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Environment Variables**: Secure configuration management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] **Real-time Notifications**: Live updates for lessons and messages
- [ ] **Video Chat Integration**: Built-in video calling for lessons
- [ ] **Progress Analytics**: Detailed learning progress tracking
- [ ] **Mobile App**: React Native mobile application
- [ ] **AI Tutor**: AI-powered learning assistance
- [ ] **Multi-language Support**: Internationalization (i18n)

---

**Built with ❤️ for Tutorium - Empowering the next generation of Spanish learners**
