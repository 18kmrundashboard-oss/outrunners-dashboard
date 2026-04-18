
const SUPABASE_URL = 'https://qcqyyfnsfyuaaaacddsm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uXs2e5aPzrIL_M2xsYDmWg_hPOUaG1l';
const BOT_TOKEN = '8682463984:AAHA2PWT7WtQRskETmOanj0k2b45ZgGfYIs';
const ADMIN_CHAT_ID = '1538316434';

const dbHeaders = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

async function dbPatch(table, col, val, data) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`, {
        method: 'PATCH', headers: dbHeaders, body: JSON.stringify(data)
    });
}
async function dbUpsert(table, data) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST', headers: { ...dbHeaders, 'Prefer': 'resolution=merge-duplicates' }, body: JSON.stringify(data)
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.status(200).send('Alive'); return; }
    try {
        const body = req.body;
        const locationMsg = body.edited_message || body.message;
        if (locationMsg && locationMsg.location) {
            if (locationMsg.chat.id.toString() === ADMIN_CHAT_ID) {
                await dbPatch('live_tracks', 'id', 'admin', { lat: locationMsg.location.latitude, lng: locationMsg.location.longitude, updated_at: new Date().toISOString() });
            }
            res.status(200).send('ok'); return;
        }

        if (body.callback_query) {
            const data = body.callback_query.data;
            if (body.callback_query.message.chat.id.toString() === ADMIN_CHAT_ID) {
                if (data === 'live_track_start') await dbUpsert('live_tracks', { id: 'admin', is_active: true });
                else if (data === 'live_track_stop') await dbUpsert('live_tracks', { id: 'admin', is_active: false });
            }
            res.status(200).send('ok'); return;
        }
        res.status(200).send('ok');
    } catch (e) { res.status(200).send('ok'); }
}
