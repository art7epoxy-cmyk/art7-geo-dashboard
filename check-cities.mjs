import { drizzle } from "drizzle-orm/mysql2";
import { geolocationPages } from "./drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);
const pages = await db.select().from(geolocationPages);
const ma = pages.filter(p => p.state === 'MA');
const nh = pages.filter(p => p.state === 'NH');
console.log('Total:', pages.length);
console.log('MA:', ma.length);
console.log('NH:', nh.length);
console.log('\nMA Cities:');
ma.forEach(p => console.log(`  ${p.city}`));
console.log('\nNH Cities:');
nh.forEach(p => console.log(`  ${p.city}`));
process.exit(0);
