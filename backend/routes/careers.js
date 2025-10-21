const express = require('express');
const multer = require('multer');
const { sendApplicationEmail } = require('../services/emailService');

const router = express.Router();

// Configure multer for file uploads (stores in memory)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF and DOC files
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
});

// POST /api/careers/apply - Handle job applications
router.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, portfolio, jobTitle, message } = req.body;
        const resumeFile = req.file;

        // Validation
        if (!name || !email || !jobTitle) {
            return res.status(400).json({ 
                message: 'Name, email, and job title are required' 
            });
        }

        if (!resumeFile) {
            return res.status(400).json({ 
                message: 'Please upload your resume' 
            });
        }

        // Send application email with resume attachment
        await sendApplicationEmail(
            { name, email, portfolio, jobTitle, message }, 
            resumeFile
        );

        res.status(200).json({ 
            message: 'Application submitted successfully!' 
        });

    } catch (error) {
        console.error('Career application error:', error);
        res.status(500).json({ 
            message: 'Failed to submit application. Please try again.' 
        });
    }
});

module.exports = router;
