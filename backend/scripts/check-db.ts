import { db } from '../config/firebase';

async function check() {
  try {
    console.log('--- STARTING DATABASE CHECK ---');
    const users = await db.collection('users').get();
    const trees = await db.collection('auraTrees').get();
    const links = await db.collectionGroup('links').get();
    
    console.log('Total Users Document Count:', users.size);
    console.log('Total Trees Document Count:', trees.size);
    console.log('Total Links Document Count:', links.size);
    
    users.docs.forEach((d, i) => {
      const data = d.data();
      console.log(`User ${i+1}: ${data.email} | Created: ${data.createdAt}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('Check failed:', e);
    process.exit(1);
  }
}

check();
