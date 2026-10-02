const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const Ticket = require('../models/Ticket');
const { buildSeedTickets } = require('./seedData');

async function seed() {
  await connectDB(env.mongoUri);
  const tickets = buildSeedTickets(30);
  await Ticket.deleteMany({});
  await Ticket.insertMany(tickets);
  console.log(`Seeded ${tickets.length} tickets into ${env.mongoUri}`);
  await disconnectDB();
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
