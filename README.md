# SnackTrack Backend

## 🎯 AI-Powered Food Health Assessment System

SnackTrack is a comprehensive backend system that allows users to scan product barcodes or upload images to receive personalized health assessments based on their individual health profiles.

## 🚀 Features

- **Barcode Scanning**: Decode product barcodes to fetch nutrition information
- **OCR Text Extraction**: Extract nutrition facts from product images
- **Personalized Health Assessments**: AI-powered health scoring based on user profiles
- **Allergy Detection**: Smart ingredient analysis for allergy warnings
- **Dietary Compatibility**: Check products against dietary preferences (vegan, keto, etc.)
- **Health Metrics**: BMI calculation, daily calorie needs, and health recommendations

## 📁 Project Structure

```
snack_track_backend/
├── app/                   # Legacy application files (being phased out)
├── config/               # Database and application configuration
├── controllers/          # Request handlers and business logic
├── middlewares/          # Custom middleware (auth, upload, etc.)
├── migrations/           # Database migration files
├── models/               # Sequelize database models
├── routes/               # API route definitions
├── seeders/              # Database seed files
├── services/             # Business logic services
├── tests/                # Test files
├── uploads/              # File upload directory
├── utils/                # Utility functions
├── app.js                # Express application setup
├── server.js             # Server entry point
└── package.json          # Dependencies and scripts
```

## 🛠️ Technology Stack

### Backend Core
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM (Object-Relational Mapping)

### Authentication & Security
- **bcryptjs** - Password hashing
- **JWT (jsonwebtoken)** - Authentication tokens
- **express-validator** - Input validation

### File Handling
- **Multer** - File upload middleware

### Development & Utilities
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

*Note: Tesseract.js and QuaggaJS are client-side libraries that would be integrated in the frontend application, not this backend API.*

## 📦 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd snack_track_backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Never commit .env to version control
```

4. **Configure database credentials:**
- Install PostgreSQL: https://postgresapp.com/ (macOS) or https://www.postgresql.org/download/
- Update `DB_*` variables in `.env` with your PostgreSQL credentials
- Generate a secure JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

5. **Set up database:**
```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

6. **Start development server:**
```bash
npm run dev
```

## 🔐 Security Configuration

### Environment Variables
- **All sensitive data** must be configured via environment variables
- **No default credentials** are provided - you must set up your own
- Use the `.env.example` file as a template
- **Never commit** your `.env` file to version control

### Database Setup
- Use strong, unique passwords for database access
- Configure separate databases for development, test, and production
- Enable SSL in production environments

## 🌐 CORS Configuration

SnackTrack uses environment-variable-driven CORS configuration for maximum deployment flexibility.

### Development
In development, CORS automatically allows:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative frontend port)

No configuration needed - just start the server.

### Production Environments

Set the `CORS_ORIGIN` environment variable with comma-separated allowed origins:

**Single Domain:**
```bash
CORS_ORIGIN=https://snacktrack.com
```

**Multiple Domains:**
```bash
CORS_ORIGIN=https://snacktrack.com,https://app.snacktrack.com,https://api.snacktrack.com
```

**Staging + Production:**
```bash
CORS_ORIGIN=https://staging.snacktrack.com,https://snacktrack.com
```

### Deployment Examples

**Heroku:**
```bash
heroku config:set CORS_ORIGIN=https://yourapp.herokuapp.com
```

**Vercel:**
```bash
vercel env add CORS_ORIGIN production
# Enter: https://yourapp.vercel.app
```

**Docker:**
```bash
docker run -e CORS_ORIGIN=https://yourapp.com snacktrack-backend
```

**AWS/GCP/Azure:**
Add `CORS_ORIGIN` to your environment variables in the respective console.

---

## 🎯 API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Product Assessment
- `POST /api/assessments/scan` - Scan barcode or upload image
- `GET /api/assessments/history` - Get assessment history
- `GET /api/assessments/:id` - Get specific assessment

### Products
- `GET /api/products` - Search products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Add new product

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

1. Build for production:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 📝 License

MIT License

## 👨‍💻 Developer

Built with ❤️ for interview excellence and real-world impact.