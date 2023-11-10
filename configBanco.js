const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const idGerado = crypto.randomBytes(8).toString('hex');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const db = new sqlite3.Database('banco.db', (err) => {
    if (err) {
        console.error('Erro ao abrir ou criar o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
    }
});

db.run('CREATE TABLE IF NOT EXISTS USUARIOS(ID TEXT, NOME TEXT, EMAIL TEXT, TEXTOCONTATO TEXT)', (err) => {
    if (err) {
        console.error('Erro ao criar a tabela', err.message);
    } else {
        console.log('Tabela criada com sucesso');
    }
});

app.get('/index.html', (req, res) => {
    // Lê os cookies da solicitação
    const userCookie = req.cookies.user || 'Visitante';

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/salvarDados', (req, res) => {
    const valorDoInputNome = req.body.nomeInput;
    const valorDoInputEmail = req.body.emailInput;
    const valorDoTextoInput = req.body.textoInput;

    if (valorDoInputNome.trim().length === 0) {
        res.send('Campo nome obrigatório!');
    } else if (valorDoInputEmail.trim().length === 0) {
        res.send('Campo email obrigatório!');
    } else if (valorDoTextoInput.trim().length === 0) {
        res.send('Campo mensagem obrigatório!');
    } else {
        // Se todos os campos estiverem preenchidos, continue com a inserção no banco de dados e envio de e-mail
        db.run('INSERT INTO USUARIOS (ID, NOME, EMAIL, TEXTOCONTATO) VALUES (?, ?, ?, ?)', [idGerado, valorDoInputNome, valorDoInputEmail, valorDoTextoInput], (err) => {
            if (err) {
                console.error('Erro ao inserir dados na tabela', err.message);
                res.status(500).send('Erro ao inserir dados na tabela: ' + err.message);
            } else {
                console.log('Dados inseridos com sucesso');
                // Agora, você pode redirecionar após a inserção no banco de dados
                setTimeout(() => {
                    res.redirect('/index.html');
                }, 200);
            }
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'edson.paula.caos@gmail.com',
                pass: 'cqyi aamj xryr chut',
            },
        });

        const mailOptions = {
            from: valorDoInputEmail,
            to: 'juninhotv23@gmail.com',
            subject: 'Contato do cliente',
            text: `Obrigado por entrar em contato conosco, responderemos o seu e-mail assim que possível 😊😊 ` +
                `===================================================` +
                `Mensagem:\n\n${valorDoTextoInput}\n` +
                `====================================================`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail:', error);
            } else {
                console.log('E-mail enviado com sucesso:', info.response);
            }
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
