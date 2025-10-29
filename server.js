const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const { signToken, verifyToken } = require('./utils/jwt');

const app = express();
const PORT = 4000;
const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.static('public'));

// Login page
app.get('/auth', (req, res) => {
  const { client_id, redirect_uri } = req.query;
  res.send(`
    <html>
      <body style="font-family: sans-serif; max-width: 400px; margin: 40px auto; padding: 20px;">
        <h1>Jazz Login</h1>
        <form method="POST" action="/login">
          <input type="hidden" name="client_id" value="${client_id}" />
          <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
          <input type="email" name="email" placeholder="Enter email" required style="width:100%; padding:10px; margin:10px 0;" />
          <button type="submit" style="width:100%; padding:10px; background:#1d4ed8; color:white; border:none; border-radius:8px;">Login</button>
        </form>
      </body>
    </html>
  `);
});

// Verify email
app.post('/login', (req, res) => {
  const { email, client_id, redirect_uri } = req.body;
  const user = users.find(u => u.email === email);
  if (user) {
    const code = 'auth-code-' + Math.random().toString(36).substring(7);
    res.redirect(`${redirect_uri}?code=${code}&client_id=${client_id}`);
  } else {
    res.status(401).send('Invalid email');
  }
});

// Token + Set Cookie
app.post('/token', (req, res) => {
  const { code, client_id } = req.body;
  if (code?.startsWith('auth-code-')) {
    const token = signToken({ userId: 'user123', client: client_id });
res.cookie('jazz_sso_token', token, {
  httpOnly: false,
  secure: false,
  sameSite: 'lax',
  path: '/',
  // domain: 'localhost',  ← REMOVE THIS
  maxAge: 3600000
});
    res.json({ access_token: token });
  } else {
    res.status(400).json({ error: 'Invalid code' });
  }
});

// SSO Check – Read Cookie
app.get('/sso-check', (req, res) => {
  const token = req.cookies.jazz_sso_token;
  if (token && verifyToken(token)) {
    res.json({ access_token: token });
  } else {
    res.status(401).json({ error: 'No session' });
  }
});

// Products
app.get('/products/:app', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { app } = req.params;
  if (token && verifyToken(token)) {
    const products = {
      tamasha: ['Tamasha Movie Pass', 'Live TV'],
      cricket: ['Cricket Live', 'Match Highlights']
    };
    res.json(products[app] || []);
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(PORT, () => {
  console.log(`Jazz IdP → http://localhost:${PORT}`);
});