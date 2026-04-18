
const BOT_TOKEN = '8682463984:AAHA2PWT7WtQRskETmOanj0k2b45ZgGfYIs';
const ADMIN_CHAT_ID = '1538316434';

async function sendMessage(chatId, text, replyMarkup = null) {
    const body = { chat_id: chatId, text, parse_mode: 'Markdown' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.status(200).send('Alive'); return; }
    try {
        const body = req.body;
        const chatId = body.message?.chat.id.toString() || body.callback_query?.message.chat.id.toString();

        if (chatId === ADMIN_CHAT_ID) {
            if (body.message?.text === '/start' || body.message?.text === '/menu') {
                await sendMessage(chatId, "👟 *Outrunners Community UK*\n\nWelcome back! The dashboard is live. You can upload GPX files to see your route.");
            }
        }
        res.status(200).send('ok');
    } catch (e) {
        res.status(200).send('ok');
    }
}
