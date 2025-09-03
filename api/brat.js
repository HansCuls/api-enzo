const express = require('express');
const { createCanvas } = require('canvas');
const router = express.Router();

router.get('/', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).json({
            status: 400,
            message: 'Masukkan parameter text.'
        });
    }

    try {
        const size = 600; 
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // teks hitam standar
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 120px Arial'; // standar font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // tulis teks di tengah canvas
        ctx.fillText(text, size / 2, size / 2);

        // kirim output png
        res.set('Content-Type', 'image/png');
        res.send(canvas.toBuffer('image/png'));
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: 'Terjadi kesalahan saat membuat gambar.',
            error: err.message
        });
    }
});

module.exports = router;