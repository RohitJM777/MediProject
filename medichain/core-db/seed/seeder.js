const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const MONGO_URI = 'mongodb://localhost:27018/medichain_core';

async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // Load JSON files
    const medicines = JSON.parse(await fs.readFile(path.join(__dirname, 'medicines.json'), 'utf-8'));
    const pharmacies = JSON.parse(await fs.readFile(path.join(__dirname, 'pharmacies.json'), 'utf-8'));
    const inventory = JSON.parse(await fs.readFile(path.join(__dirname,  'inventory.json'), 'utf-8'));

    // Insert into collections
    await db.collection('medicines').deleteMany({});
    await db.collection('medicines').insertMany(medicines);

    await db.collection('pharmacies').deleteMany({});
    await db.collection('pharmacies').insertMany(pharmacies);

    await db.collection('inventory').deleteMany({});
    await db.collection('inventory').insertMany(inventory);

    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await client.close();
  }
}

seed();
