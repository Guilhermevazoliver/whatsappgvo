
import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

let qrCodeData = null;

client.on('qr', async (qr) => {
    qrCodeData = await qrcode.toDataURL(qr);
    console.log('[QR] Escaneie o QR Code para conectar ao WhatsApp.');
});

client.on('ready', () => {
    console.log('[WA] Cliente conectado e pronto para uso.');
});

client.initialize();

// Endpoint para obter o QR Code
app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.send(`<img src="${qrCodeData}" />`);
    } else {
        res.send('QR Code ainda não gerado ou já expirado.');
    }
});

// Endpoint para enviar mensagem
app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.json({ status: 'Mensagem enviada com sucesso.' });
    } catch (error) {
        res.status(500).json({ status: 'Erro ao enviar mensagem.', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
