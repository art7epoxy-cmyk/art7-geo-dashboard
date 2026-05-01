import { drizzle } from 'drizzle-orm/mysql2';
import { geolocationPages } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const pages = await db.select().from(geolocationPages);
console.log('Total pages:', pages.length);

const cities = new Set(pages.map(p => p.city));
console.log('Unique cities:', cities.size);

// Find duplicates
const cityCount = {};
pages.forEach(p => {
  cityCount[p.city] = (cityCount[p.city] || 0) + 1;
});

const duplicates = Object.entries(cityCount).filter(([_, count]) => count > 1);
console.log('Duplicates:', duplicates);
