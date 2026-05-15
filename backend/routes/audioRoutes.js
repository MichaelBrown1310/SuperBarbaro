const express = require('express');
const router = express.Router();
const controller = require('../controllers/audioController');

router.post('/audio/transcribir', controller.upload.single('audio'), controller.transcribirAudio);

module.exports = router;
