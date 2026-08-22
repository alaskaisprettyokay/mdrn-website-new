const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_API_URL = 'https://api.resend.com';

function resendHeaders(apiKey) {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MDRN-Signup/1.0',
    };
}

function parseBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body !== 'string') return {};

    const contentType = String(req.headers?.['content-type'] || '');
    if (contentType.includes('application/json')) return JSON.parse(req.body);
    return Object.fromEntries(new URLSearchParams(req.body));
}

module.exports = async function subscribe(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'method not allowed.' });
    }

    let body;
    try {
        body = parseBody(req);
    } catch {
        return res.status(400).json({ error: 'invalid request.' });
    }

    const email = typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: 'enter a valid email address.' });
    }

    const apiKey = process.env.RESEND_CONTACTS_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!apiKey || !audienceId) {
        console.error('MDRN signup is missing Resend configuration');
        return res.status(503).json({ error: 'signup is temporarily unavailable.' });
    }

    const headers = resendHeaders(apiKey);
    const contactUrl = `${RESEND_API_URL}/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`;

    try {
        const existing = await fetch(contactUrl, { headers });

        if (existing.ok) {
            return res.status(200).json({ success: true, alreadySubscribed: true });
        }

        if (existing.status !== 404) {
            console.error('Resend contact lookup failed', existing.status);
            return res.status(502).json({ error: "couldn't join the list — please try again." });
        }

        const created = await fetch(
            `${RESEND_API_URL}/audiences/${audienceId}/contacts`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, unsubscribed: false }),
            },
        );

        if (!created.ok) {
            const result = await created.json().catch(() => ({}));
            const message = String(result.message || '').toLowerCase();
            if (message.includes('already exists') || message.includes('duplicate')) {
                return res.status(200).json({ success: true, alreadySubscribed: true });
            }

            console.error('Resend contact creation failed', created.status);
            return res.status(502).json({ error: "couldn't join the list — please try again." });
        }

        return res.status(201).json({ success: true });
    } catch (error) {
        console.error('MDRN signup failed', error);
        return res.status(502).json({ error: "couldn't join the list — please try again." });
    }
};
