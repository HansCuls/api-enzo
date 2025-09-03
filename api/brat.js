const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const router = express.Router();


registerFont(path.join(__dirname, '../fonts/LiberationSans-Regular.ttf'), { family: 'LiberationSans' });

router.get('/', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).json({
            status: 400,
            message: 'Masukkan parameter text.'
        });
    }

    try {
        const width = 370;
        const height = 390;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // background putih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // cari ukuran font yang pas
        let fontSize = 60; // mulai dari besar
        let lines = [];
        const margin = 10;
        const maxWidth = width - margin * 2;
        const maxHeight = height - margin * 2;
        let lineHeight = 0;

        while (fontSize > 10) {
            ctx.font = `bold ${fontSize}px LiberationSans`;
            lineHeight = fontSize * 1.2;

            lines = [];
            let line = '';
            const words = text.split(' ');

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line.trim());

            const totalHeight = lines.length * lineHeight;

            if (totalHeight <= maxHeight) break; // kalau muat, berhenti
            fontSize -= 2; // kecilkan font
        }

        // tulis teks
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let y = margin;
        for (const line of lines) {
            ctx.fillText(line, margin, y);
            y += lineHeight;
        }

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
