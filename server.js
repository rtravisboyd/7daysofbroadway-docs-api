require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

const drive = google.drive({ version: 'v3', auth });

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: '7 Days of Broadway Documents API' });
});

// Get documents endpoint
app.get('/documents', async (req, res) => {
  try {
    const folderId = process.env.FOLDER_ID; // Your Google Drive folder ID
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    res.json(response.data.files);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document content endpoint
app.get('/documents/:id', async (req, res) => {
  try {
    const file = await drive.files.get({
      fileId: req.params.id,
      alt: 'media'
    });
    res.json(file.data);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
