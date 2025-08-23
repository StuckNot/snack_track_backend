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
├── app/                    # Core application files
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   └── enums/             # Enumerations
├── controllers/           # Business logic controllers
├── services/             # Business logic services
├── routes/               # API route definitions
├── utils/                # Utility functions
├── tests/                # Test files
├── uploads/              # File upload directory
└── config/               # Configuration files
```

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **bcryptjs** - Password hashing
- **JWT** - Authentication
- **Multer** - File uploads
- **Tesseract.js** - OCR processing
- **QuaggaJS** - Barcode scanning

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update database credentials and API keys

3. Set up database:
```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

4. Start development server:
```bash
npm run dev
```

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