process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const Ticket = require('../src/models/Ticket');
const { buildSeedTickets } = require('../src/seed/seedData');

let mongod;
let app;

beforeAll(async () => {
  let uri = process.env.MONGODB_URI_TEST;
  if (!uri) {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri('ticket_tests');
  }
  await connectDB(uri);
  app = createApp();
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Ticket.deleteMany({});
});

const validPayload = {
  title: 'Printer on fire',
  description: 'It is literally on fire.',
  customerEmail: 'Someone@Example.com',
  priority: 'High',
};

describe('POST /api/tickets (validation)', () => {
  it('creates a ticket with defaults, normalised email and timestamps', async () => {
    const res = await request(app).post('/api/tickets').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: 'Printer on fire',
      status: 'Open',
      priority: 'High',
      customerEmail: 'someone@example.com',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.createdAt).toBeDefined();
    expect(res.body.data.updatedAt).toBeDefined();
  });

  it('rejects missing fields with field-level error details', async () => {
    const res = await request(app).post('/api/tickets').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'description', 'customerEmail']));
  });

  it('rejects a title over 120 characters, an invalid email and a bad priority', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ ...validPayload, title: 'x'.repeat(121), customerEmail: 'not-an-email', priority: 'Urgent' });

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'customerEmail', 'priority']));
  });

  it('returns a consistent error body for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{ bad json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

describe('GET /api/tickets (querying)', () => {
  beforeEach(async () => {
    await Ticket.insertMany(buildSeedTickets(30));
  });

  it('paginates 10 per page and reports totals', async () => {
    const page1 = await request(app).get('/api/tickets');
    const page3 = await request(app).get('/api/tickets?page=3');

    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.pagination).toEqual({ page: 1, limit: 10, total: 30, totalPages: 3 });
    expect(page3.body.data).toHaveLength(10);
  });

  it('sorts by creation date, newest or oldest first', async () => {
    const newest = await request(app).get('/api/tickets?sort=newest');
    const oldest = await request(app).get('/api/tickets?sort=oldest');

    const nTimes = newest.body.data.map((t) => new Date(t.createdAt).getTime());
    const oTimes = oldest.body.data.map((t) => new Date(t.createdAt).getTime());
    expect(nTimes).toEqual([...nTimes].sort((a, b) => b - a));
    expect(oTimes).toEqual([...oTimes].sort((a, b) => a - b));
    expect(nTimes[0]).toBeGreaterThan(oTimes[0]);
  });

  it('combines search, status and priority filters', async () => {
    const all = await Ticket.find({});
    const expected = all.filter(
      (t) =>
        t.status === 'Open' &&
        t.priority === 'High' &&
        (t.title.toLowerCase().includes('a') || t.customerEmail.includes('a'))
    ).length;

    const res = await request(app).get('/api/tickets?status=Open&priority=High&search=A&limit=50');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(expected);
    res.body.data.forEach((t) => {
      expect(t.status).toBe('Open');
      expect(t.priority).toBe('High');
    });
  });

  it('searches by customer email and treats regex characters literally', async () => {
    const byEmail = await request(app).get('/api/tickets?search=alice.martin');
    expect(byEmail.body.data.length).toBeGreaterThan(0);
    byEmail.body.data.forEach((t) => expect(t.customerEmail).toContain('alice.martin'));

    const regexLike = await request(app).get('/api/tickets?search=.*');
    expect(regexLike.status).toBe(200);
    expect(regexLike.body.data).toHaveLength(0);
  });

  it('rejects invalid query values', async () => {
    const res = await request(app).get('/api/tickets?status=Closed&page=0');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/tickets/stats', () => {
  it('counts the whole dataset regardless of filters', async () => {
    await Ticket.insertMany(buildSeedTickets(30));
    const expectedOpen = await Ticket.countDocuments({ status: 'Open' });

    const res = await request(app).get('/api/tickets/stats?status=Resolved');

    expect(res.status).toBe(200);
    const { total, open, inProgress, resolved } = res.body.data;
    expect(total).toBe(30);
    expect(open).toBe(expectedOpen);
    expect(open + inProgress + resolved).toBe(30);
  });
});

describe('PATCH /api/tickets/:id (updates)', () => {
  it('updates status and priority, persists, and bumps updatedAt', async () => {
    const created = await request(app).post('/api/tickets').send(validPayload);
    const { id, updatedAt } = created.body.data;
    await new Promise((r) => setTimeout(r, 15));

    const patch = await request(app).patch(`/api/tickets/${id}`).send({ status: 'Resolved', priority: 'Low' });
    expect(patch.status).toBe(200);
    expect(patch.body.data).toMatchObject({ status: 'Resolved', priority: 'Low' });
    expect(new Date(patch.body.data.updatedAt).getTime()).toBeGreaterThan(new Date(updatedAt).getTime());

    const fetched = await request(app).get(`/api/tickets/${id}`);
    expect(fetched.body.data).toMatchObject({ status: 'Resolved', priority: 'Low' });
  });

  it('rejects invalid values and fields that cannot be edited', async () => {
    const { body } = await request(app).post('/api/tickets').send(validPayload);

    const badStatus = await request(app).patch(`/api/tickets/${body.data.id}`).send({ status: 'Closed' });
    const badField = await request(app).patch(`/api/tickets/${body.data.id}`).send({ title: 'Hacked' });
    const empty = await request(app).patch(`/api/tickets/${body.data.id}`).send({});

    expect(badStatus.status).toBe(400);
    expect(badField.status).toBe(400);
    expect(empty.status).toBe(400);
  });

  it('returns 404 for unknown tickets and 400 for malformed ids', async () => {
    const missing = await request(app)
      .patch(`/api/tickets/${new mongoose.Types.ObjectId()}`)
      .send({ status: 'Open' });
    const malformed = await request(app).get('/api/tickets/123');
    const unknownRoute = await request(app).get('/api/nope');

    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('INVALID_ID');
    expect(unknownRoute.status).toBe(404);
  });
});
