const express = require('express');
const cloudscraper = require('cloudscraper');
const router = express.Router();

async function saveweb2zip(url, options = {}) {
    if (!url) throw new Error('Url is required');
    url = url.startsWith('https://') ? url : `https://${url}`;
    const {
        renameAssets = false,
        saveStructure = false,
        alternativeAlgorithm = false,
        mobileVersion = false
    } = options;

    // Kirim request ke API saveweb2zip pakai cloudscraper (tembus cloudflare)
    let response = await cloudscraper.post('https://copier.saveweb2zip.com/api/copySite', {
        json: {
            url,
            renameAssets,
            saveStructure,
            alternativeAlgorithm,
            mobileVersion
        },
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            origin: 'https://saveweb2zip.com',
            referer: 'https://saveweb2zip.com/'
        }
    });

    const { md5 } = response;

    // Loop sampai proses selesai
    while (true) {
        let process = await cloudscraper.get(`https://copier.saveweb2zip.com/api/getStatus/${md5}`, {
            json: true,
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://saveweb2zip.com',
                referer: 'https://saveweb2zip.com/'
            }
        });

        if (!process.isFinished) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        } else {
            return {
                url,
                error: {
                    text: process.errorText,
                    code: process.errorCode,
                },
                copiedFilesAmount: process.copiedFilesAmount,
                downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${process.md5}`
            }
        }
    }
}

router.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: 'Parameter ?url= wajib diisi.' });

    try {
        const result = await saveweb2zip(url, { renameAssets: true });

        if (result.error?.code) {
            return res.status(500).json({
                status: false,
                error: result.error.text || 'Gagal menyimpan website.'
            });
        }

        return res.json({
            status: true,
            originalUrl: result.url,
            copiedFilesAmount: result.copiedFilesAmount,
            downloadUrl: result.downloadUrl
        });

    } catch (e) {
        return res.status(500).json({ status: false, error: e.message });
    }
});

module.exports = router;