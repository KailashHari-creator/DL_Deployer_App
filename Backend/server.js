// import express from 'express';
// import jwt from 'jsonwebtoken';
// import { jwtDecode } from "jwt-decode";
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' });
// import fs from 'fs';
// import path from 'path';
// import pkg from 'body-parser';
// const { json } = pkg;
// import { OAuth2Client } from 'google-auth-library';
// import { Pool } from 'pg';
// import { compare, hash as _hash } from 'bcrypt';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// import fetch from "node-fetch";          // npm install node-fetch@2
// import FormData from "form-data";       // npm install form-data
// import dotenv from 'dotenv';


// const __dirname = dirname(fileURLToPath(import.meta.url));
// const client = new OAuth2Client("130573390246-2ibmnbflcq0hk99svfrqv7om8addmg78.apps.googleusercontent.com");
// const app = express();
// const port = 3000;
// const SERVER_JWT_SECRET = "HareKrishnaHareKrishna123!";
// const SERVER_JWT_EXPIRES_IN = "7d"; // tweak

// // PostgreSQL connection setup
// dotenv.config();

// const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
// });

// app.use(express.json({ limit: '10mb' }));
// app.set('views', join(__dirname, '../Frontend'));
// app.set('view engine', 'ejs');
// app.use(express.static(join(__dirname, '../Frontend')));

// app.post("/auth/google", async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ success: false, message: "No token provided" });

//   try {
//     // Verify the ID token with Google
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: "130573390246-2ibmnbflcq0hk99svfrqv7om8addmg78.apps.googleusercontent.com"
//     });

//     const payload = ticket.getPayload();
//     const googleId = payload.sub;     // stable Google user id
//     const email = payload.email;
//     const name = payload.name || null;
//     const picture = payload.picture || null;

//     // Upsert: find by google_id first, then by email (in case user signed up with email previously)
//     let userResult = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2", [googleId, email]);

//     let user;
//     if (userResult.rows.length === 0) {
//       // create user
//       const insert = await pool.query(
//         `INSERT INTO users (email, google_id, name, picture)
//          VALUES ($1, $2, $3, $4) RETURNING *`,
//         [email, googleId, name, picture]
//       );
//       user = insert.rows[0];
//     } else {
//       // optionally update google_id if matched on email only
//       user = userResult.rows[0];
//       if (!user.google_id) {
//         await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, user.id]);
//         user.google_id = googleId;
//       }
//       // optionally update name/picture
//       await pool.query("UPDATE users SET name = $1, picture = $2 WHERE id = $3", [name, picture, user.id]);
//     }

//     // Create a server-side JWT/session for your app
//     const serverToken = jwt.sign({ userId: user.id, email: user.email }, SERVER_JWT_SECRET, { expiresIn: SERVER_JWT_EXPIRES_IN });

//     res.json({
//       success: true,
//       user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
//       token: serverToken
//     });

//   } catch (err) {
//     console.error("Google auth error:", err);
//     res.status(401).json({ success: false, message: "Invalid Google token" });
//   }
// });

// app.get('/', (req, res) => {
//     res.render('Login_Page'); // Assuming you have a view engine set up
// });
// app.get('/dashboard', (req, res) => {
//     res.render('Dashboard'); // Assuming you have a view engine set up
// });
// app.get('/register', (req, res) => {
//     res.render('Register_Page'); // Assuming you have a view engine set up
// });
// app.post('/query', (req, res) => {
//     const { query } = req.body;
//     // Here you would integrate with your AI model
//     // For demonstration, we return a dummy response
//     res.json({ response: `You asked: ${query}. This is a dummy response from the AI model.` });
// });
// // Simple login endpoint
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
//     if (result.rows.length === 0) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }
//     const user = result.rows[0];

//     if (user.google_id && !user.password_hash) {
//       // account is Google-only and has no local password
//       return res.status(400).json({ message: 'This account is linked to Google. Please sign in with Google or set a password from account settings.' });
//     }

//     const match = await compare(password, user.password_hash);
//     if (!match) return res.status(401).json({ message: 'Invalid username or password' });

//     // create server JWT
//     const serverToken = jwt.sign({ userId: user.id, email: user.email }, SERVER_JWT_SECRET, { expiresIn: SERVER_JWT_EXPIRES_IN });
//     res.json({ message: 'Login successful', token: serverToken });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// // Example user registration endpoint (for testing)
// app.post('/register', async (req, res) => {
//     console.log(req.body);
//     const { username, password } = req.body;
//     try {
//         const hash = await _hash(password, 10);
//         await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);
//         res.json({ message: 'User registered' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// app.post("/query-model", upload.single("image"), async (req, res) => {
//   try {
//     const imagePath = req.file.path;  // local PNG file path

//     console.log("Received file:", imagePath);
//      const formData = new FormData();
//     formData.append("file", fs.createReadStream(imagePath), {
//       filename: "capture.png",
//       contentType: "image/png"
//     });

//     // Call FastAPI (replace port/url with your actual FastAPI endpoint)
//     const fastApiRes = await fetch("http://0.0.0.0:8000/predict/", {
//       method: "POST",
//       body: formData
//     });

//     const result = await fastApiRes.json();

//     // Cleanup uploaded file
//     fs.unlinkSync(imagePath);

//     res.json({ success: true, result });
//   } catch (err) {
//     console.error("Error forwarding to FastAPI:", err);
//     res.status(500).json({ success: false, error: "Failed to query model" });
//   }
// });

// // Example mock DL model call
// async function fakeModelCall(imagePath) {
//   // For demo, just return file name. Replace with real inference.
//   return `Model processed file: ${path.basename(imagePath)}`;
// }

// // app.post('/auth/google', async (req, res) => {
// //   const token = req.body.token;

// //   try {
// //     const ticket = await client.verifyIdToken({
// //       idToken: token,
// //       audience: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
// //     });

// //     const payload = ticket.getPayload();
// //     const userid = payload['sub'];  // Google user ID
// //     const email = payload['email'];

// //     // You can now create/find a user in your DB
// //     res.json({ success: true, email });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(401).json({ success: false, message: 'Invalid token' });
// //   }
// // });

// app.post("/upload", (req, res) => {
//   const { image } = req.body;
//   // image is a base64 string like "data:image/png;base64,...."

//   console.log("Received image data length:", image.length);
//   res.json({ status: "ok", message: "Image received" });
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });
// server.js
import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { Pool } from 'pg';
import { compare, hash as _hash } from 'bcrypt';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';          // npm install node-fetch@2
import FormData from 'form-data';       // npm install form-data
import dotenv from 'dotenv';

dotenv.config(); // MUST run before using process.env

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "130573390246-2ibmnbflcq0hk99svfrqv7om8addmg78.apps.googleusercontent.com");
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SERVER_JWT_SECRET = process.env.SERVER_JWT_SECRET || "HareKrishnaHareKrishna123!";
const SERVER_JWT_EXPIRES_IN = "7d";

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },

});

// parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true })); // <-- needed for HTML form POSTS

// views and static
app.set('views', join(__dirname, '../Frontend'));
app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, '../Frontend')));

/**
 * Google OAuth POST
 * expects { token } in body (idToken from client)
 */
app.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "No token provided" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || null;
    const picture = payload.picture || null;

    // Upsert by google_id OR email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE google_id = $1 OR email = $2",
      [googleId, email]
    );

    let user;
    if (userResult.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO users (email, google_id, name, picture)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email, googleId, name, picture]
      );
      user = insert.rows[0];
    } else {
      user = userResult.rows[0];
      if (!user.google_id) {
        await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, user.id]);
        user.google_id = googleId;
      }
      // update name/picture every time (optional)
      await pool.query("UPDATE users SET name = $1, picture = $2 WHERE id = $3", [name, picture, user.id]);
    }

    const serverToken = jwt.sign({ userId: user.id, email: user.email }, SERVER_JWT_SECRET, { expiresIn: SERVER_JWT_EXPIRES_IN });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
      token: serverToken
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});

// Views
app.get('/', (req, res) => res.render('Login_Page'));
app.get('/dashboard', (req, res) => res.render('Dashboard'));
app.get('/register', (req, res) => res.render('Register_Page'));

// Search/query sample
app.post('/query', (req, res) => {
  const { query } = req.body;
  res.json({ response: `You asked: ${query}. This is a dummy response from the AI model.` });
});

// Local login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'No such user registered.' });
    }
    const user = result.rows[0];

    if (user.google_id && !user.password_hash) {
      return res.status(400).json({ message: 'This account is linked to Google. Please sign in with Google or set a password from account settings.' });
    }
    console.log(user);
    if (user.password != password)
      return res.status(401).json({ message: 'Invalid username or password' });

    const serverToken = jwt.sign({ userId: user.id, email: user.email }, SERVER_JWT_SECRET, { expiresIn: SERVER_JWT_EXPIRES_IN });
    res.status(200).json({ message: 'Login successful', token: serverToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error: ',err });
  }
});

// Register endpoint (handles HTML form POST)
app.post('/register', async (req, res) => {
  // form posts: username, email, password
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password required' });
  }

  try {
    const hash = await _hash(password, 10);
    const insert = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [username, email, hash]
    );

    if (!insert.rows.length) {
      // user already exists (by email)
      alert("User has already been registered");
      res.status(409).redirect('/login')
    }
    res.redirect('/'); // redirect to login page after successful registration
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Other routes unchanged; kept your query-model example)
app.post("/query-model", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath), { filename: "capture.png", contentType: "image/png" });

    const fastApiRes = await fetch("http://0.0.0.0:8000/predict/", {
      method: "POST",
      body: formData
    });

    const result = await fastApiRes.json();
    fs.unlinkSync(imagePath);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ success: false, error: "Failed to query model" });
  }
});

app.post("/upload", (req, res) => {
  const { image } = req.body;
  console.log("Received image data length:", image ? image.length : 0);
  res.json({ status: "ok", message: "Image received" });
});

app.listen(port, '0.0.0.0',  () => {
  console.log(`Server running on port ${port}`);
});
