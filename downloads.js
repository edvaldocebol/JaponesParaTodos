const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'arquivos')));

app.get('/download/Apk', (req, res) => {
    const arquivoPath = path.join(__dirname, 'arquivos', 'Aplicativo.apk');
    res.download(arquivoPath, 'Aplicativo.apk');
});

