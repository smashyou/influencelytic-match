# Influencelytic Match Platform 🚀

AI-powered platform connecting influencers with brands for authentic partnerships and campaign management.

## 🌟 Features

### For Brands
- **Campaign Creation**: Design campaigns with specific requirements and budgets
- **AI Matching**: Find perfect influencers using advanced matching algorithms
- **Application Management**: Review and manage influencer applications
- **Secure Payments**: Process payments through Stripe Connect
- **Analytics Dashboard**: Track campaign performance and ROI

### For Influencers
- **Profile Builder**: Showcase your social media presence and portfolio
- **Smart Discovery**: Find campaigns that match your niche and audience
- **Easy Applications**: Apply to campaigns with custom proposals
- **Payment Processing**: Receive payments directly through Stripe
- **Performance Tracking**: Monitor your campaign success

### Platform Features
- **Multi-Platform Integration**: Instagram, TikTok, YouTube, Twitter, LinkedIn
- **Real-time Notifications**: Stay updated on campaign activities
- **AI-Powered Matching**: Advanced algorithms for optimal partnerships
- **Secure Authentication**: JWT-based auth with social login options
- **Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

Get up and running in 15 minutes! See [QUICK_START.md](./QUICK_START.md)

```bash
# Clone and setup
git clone https://github.com/yourusername/influencelytic-match.git
cd influencelytic-match
npm run setup

# Start development servers
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app!

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get running in 15 minutes
- **[Master Deployment Guide](./MASTER_DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Environment Setup](./ENVIRONMENT_SETUP.md)** - All environment variables explained
- **[API Integration Guide](./API_INTEGRATION_GUIDE.md)** - Social media API setup
- **[Integration Checklist](./INTEGRATION_CHECKLIST.md)** - Pre-launch checklist
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing strategies and examples
- **[Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)** - Optimization techniques
- **[Monitoring Setup](./MONITORING_SETUP.md)** - Error tracking and monitoring
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **TailwindCSS** + **Shadcn/ui** components
- **TanStack Query** for data fetching
- **React Hook Form** + **Zod** for forms
- **Supabase Client** for real-time features

### Backend
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL) database
- **Redis** for caching
- **Stripe** for payments
- **SendGrid** for emails
- **JWT** authentication

### AI Service
- **Python** + **FastAPI**
- **Transformers** for NLP
- **Sentence embeddings** for matching
- **scikit-learn** for ML algorithms

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Redis
- Git

### Full Setup

1. **Clone repository**
```bash
git clone https://github.com/yourusername/influencelytic-match.git
cd influencelytic-match
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Configure environment**
```bash
# Copy example env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ai_service/.env.example ai_service/.env

# Edit with your API keys
```

4. **Setup database**
- Create Supabase project
- Run migrations from `supabase/migrations/APPLY_IN_SUPABASE.sql`

5. **Start development**
```bash
npm run dev
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:ai          # Start AI service only

# Building
npm run build           # Build all services
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Testing
npm test                # Run all tests
npm run test:e2e       # Run E2E tests
npm run test:coverage  # Generate coverage report

# Utilities
npm run check:env      # Validate environment variables
npm run lint           # Run linters
npm run clean          # Clean all build artifacts
npm run setup          # Complete setup process
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run deploy:frontend
```

### Backend (Railway/Render)
```bash
npm run deploy:backend
```

### Database (Supabase)
- Already hosted on Supabase cloud
- Enable point-in-time recovery for production

See [MASTER_DEPLOYMENT_GUIDE.md](./MASTER_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:frontend
npm run test:backend
npm run test:ai

# E2E tests
npm run test:e2e

# Load testing
k6 run k6-load-test.js
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing strategies.

## 📊 Performance

- **Frontend**: Lighthouse score > 90
- **API Response**: < 200ms (p50), < 500ms (p95)
- **Database Queries**: < 100ms
- **Bundle Size**: < 500KB gzipped

See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) for optimization details.

## 🔐 Security

- JWT authentication with refresh tokens
- Row Level Security (RLS) in database
- Rate limiting on all endpoints
- Input validation and sanitization
- HTTPS enforced in production
- Regular security audits

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Campaign Endpoints
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Application Endpoints
- `POST /api/campaigns/:id/apply` - Apply to campaign
- `GET /api/applications` - List applications
- `PUT /api/applications/:id` - Update application status

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/influencelytic-match/issues)
- **Email**: support@influencelytic.com
- **Discord**: [Join our community](https://discord.gg/influencelytic)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing database platform
- [Stripe](https://stripe.com) for payment processing
- [Vercel](https://vercel.com) for frontend hosting
- [Railway](https://railway.app) for backend hosting
- [Shadcn/ui](https://ui.shadcn.com) for beautiful components

## 📈 Project Status

- ✅ Core platform complete
- ✅ Social media integrations
- ✅ Payment processing
- ✅ AI matching algorithm
- ✅ Real-time notifications
- 🚧 Advanced analytics (coming soon)
- 🚧 Mobile app (planned)

---

Built with ❤️ by the Influencelytic team

**Ready to connect influencers and brands?** [Get Started →](./QUICK_START.md)