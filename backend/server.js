require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter'); // ✅ ADD THIS LINE

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// CORS Configuration - FIXED to handle multiple URLs
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
    : ['http://localhost:3000']; // Fallback if not set

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'], // Added GET for health check
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting - Applied globally with different limits
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: { 
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to both contact and newsletter routes
app.use('/api/contact', limiter);
app.use('/api/newsletter', limiter); // ✅ ADD THIS LINE

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes); // ✅ ADD THIS LINE

// Health Check - IMPROVED
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        allowedOrigins: allowedOrigins
    });
});

// Root route - UPDATED
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Orivanta Contact API is running',
        endpoints: {
            contact: '/api/contact/submit',
            newsletter: '/api/newsletter/subscribe', // ✅ ADD THIS LINE
            health: '/health'
        }
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error Handler - IMPROVED
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ 
            error: 'CORS policy error',
            message: 'Origin not allowed'
        });
    }
    
    // Generic error response
    res.status(err.status || 500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start Server - IMPROVED logging
app.listen(PORT, () => {
    console.log('\n🚀 ==========================================');
    console.log(`   Contact Form Backend Started Successfully`);
    console.log('   ==========================================');
    console.log(`   📡 Port: ${PORT}`);
    console.log(`   📧 Email: ${process.env.ZOHO_EMAIL || 'Not configured'}`);
    console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   🔗 Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`   ⏰ Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 5} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
    console.log(`   📬 Newsletter API: /api/newsletter/subscribe`); // ✅ ADD THIS LINE
    console.log('   ==========================================\n');
});

module.exports = app;

