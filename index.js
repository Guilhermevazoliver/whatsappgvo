import express from 'express';
import qrcode from 'qrcode';
import { Client } from 'whatsapp-web.js';

const app = express();
const client = new Client();

app.use(express.json());

let latestQR = "";

client.on('qr', async (qr) => {
  latestQR = await qrcode.toDataURL(qr);
  console.log('QR Code atualizado');
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

client.initialize();

app.get('/qr', (req, res) => {
  if (latestQR) {
    res.send(`<img src="${latestQR}" />`);
  } else {
    res.send('QR Code ainda não gerado. Aguarde...');
  }
});

app.post('/send', async (req, res) => {
  const { number, message } = req.body;
  try {
    await client.sendMessage(`${number}@c.us`, message);
    res.status(200).send('Mensagem enviada com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao enviar mensagem');
  }
});

// ESSA PARTE É A CRÍTICA PRO RAILWAY FUNCIONAR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
