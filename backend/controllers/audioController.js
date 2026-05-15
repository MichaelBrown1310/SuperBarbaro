const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

const TRANSCRIPTION_URL = 'https://api.openai.com/v1/audio/transcriptions';
const DEFAULT_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1';

const transcribirAudio = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Falta configurar OPENAI_API_KEY en el backend para transcribir archivos de audio'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Debes enviar un archivo de audio' });
    }

    const formData = new FormData();
    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });

    formData.append('file', audioBlob, req.file.originalname || 'audio.webm');
    formData.append('model', DEFAULT_MODEL);
    formData.append('language', 'es');
    formData.append('response_format', 'json');

    const response = await fetch(TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'No se pudo transcribir el audio'
      });
    }

    return res.json({
      success: true,
      texto: data.text || ''
    });
  } catch (error) {
    console.error('Error transcribiendo audio:', error);
    return res.status(500).json({ error: 'No se pudo transcribir el archivo de audio' });
  }
};

module.exports = {
  upload,
  transcribirAudio
};
