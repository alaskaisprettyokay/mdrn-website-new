const assert = require('node:assert/strict');
const test = require('node:test');

const subscribe = require('../api/subscribe');

function request(body, method = 'POST') {
    return { method, body, headers: { 'content-type': 'application/json' } };
}

function response() {
    return {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

function resendResponse(status, body = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    };
}

test.beforeEach(() => {
    process.env.RESEND_CONTACTS_API_KEY = 're_test';
    process.env.RESEND_AUDIENCE_ID = 'audience_test';
});

test('rejects invalid email addresses before calling Resend', async () => {
    let called = false;
    global.fetch = async () => { called = true; };
    const res = response();

    await subscribe(request({ email: 'not-an-email' }), res);

    assert.equal(res.statusCode, 400);
    assert.equal(called, false);
});

test('treats an existing audience contact as a successful signup', async () => {
    const calls = [];
    global.fetch = async (...args) => {
        calls.push(args);
        return resendResponse(200, { id: 'contact_1' });
    };
    const res = response();

    await subscribe(request({ email: ' Person@Example.com ' }), res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, alreadySubscribed: true });
    assert.equal(calls.length, 1);
    assert.match(calls[0][0], /person%40example\.com$/);
});

test('creates a missing contact in the configured audience', async () => {
    const calls = [];
    global.fetch = async (...args) => {
        calls.push(args);
        return calls.length === 1
            ? resendResponse(404)
            : resendResponse(201, { id: 'contact_2' });
    };
    const res = response();

    await subscribe(request({ email: 'new@example.com' }), res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, { success: true });
    assert.equal(calls.length, 2);
    assert.equal(calls[1][1].method, 'POST');
    assert.deepEqual(JSON.parse(calls[1][1].body), {
        email: 'new@example.com',
        unsubscribed: false,
    });
});

test('does not claim success when Resend rejects contact creation', async () => {
    let call = 0;
    global.fetch = async () => (++call === 1
        ? resendResponse(404)
        : resendResponse(422, { name: 'validation_error' }));
    const res = response();

    await subscribe(request({ email: 'new@example.com' }), res);

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { error: "couldn't join the list — please try again." });
});
