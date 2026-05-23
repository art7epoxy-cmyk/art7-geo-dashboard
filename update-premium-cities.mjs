import { drizzle } from "drizzle-orm/mysql2";
import { geolocationPages } from "./drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

// 36 Premium Cities - Only Wellesley, MA is active
const premiumCities = [
  // MASSACHUSETTS (21 cities)
  { number: 1, city: "Wellesley", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-wellesley-ma-2/" },
  { number: 2, city: "Belmont", state: "MA", status: "pending", url: null },
  { number: 3, city: "Newton", state: "MA", status: "pending", url: null },
  { number: 4, city: "Winchester", state: "MA", status: "pending", url: null },
  { number: 5, city: "Weston", state: "MA", status: "pending", url: null },
  { number: 6, city: "Brookline", state: "MA", status: "pending", url: null },
  { number: 7, city: "Carlisle", state: "MA", status: "pending", url: null },
  { number: 8, city: "Needham", state: "MA", status: "pending", url: null },
  { number: 9, city: "Dover", state: "MA", status: "pending", url: null },
  { number: 10, city: "Lexington", state: "MA", status: "pending", url: null },
  { number: 11, city: "North Andover", state: "MA", status: "pending", url: null },
  { number: 12, city: "Milton", state: "MA", status: "pending", url: null },
  { number: 13, city: "Natick", state: "MA", status: "pending", url: null },
  { number: 14, city: "Framingham", state: "MA", status: "pending", url: null },
  { number: 15, city: "Marlborough", state: "MA", status: "pending", url: null },
  { number: 16, city: "Haverhill", state: "MA", status: "pending", url: null },
  { number: 17, city: "Beverly", state: "MA", status: "pending", url: null },
  { number: 18, city: "Ipswich", state: "MA", status: "pending", url: null },
  { number: 19, city: "Marblehead", state: "MA", status: "pending", url: null },
  { number: 20, city: "Gloucester", state: "MA", status: "pending", url: null },
  { number: 21, city: "Rockport", state: "MA", status: "pending", url: null },

  // MASSACHUSETTS CONTINUED (5 more)
  { number: 22, city: "Shrewsbury", state: "MA", status: "pending", url: null },
  { number: 23, city: "Fitchburg", state: "MA", status: "pending", url: null },
  { number: 24, city: "Gardner", state: "MA", status: "pending", url: null },
  { number: 25, city: "Waltham", state: "MA", status: "pending", url: null },
  { number: 26, city: "Winthrop", state: "MA", status: "pending", url: null },
  { number: 27, city: "Watertown", state: "MA", status: "pending", url: null },
  { number: 28, city: "Cambridge", state: "MA", status: "pending", url: null },
  { number: 29, city: "Norwood", state: "MA", status: "pending", url: null },
  { number: 30, city: "Martha's Vineyard", state: "MA", status: "pending", url: null },
  { number: 31, city: "Nantucket", state: "MA", status: "pending", url: null },

  // NEW HAMPSHIRE (6 cities)
  { number: 32, city: "Salem", state: "NH", status: "pending", url: null },
  { number: 33, city: "Londonderry", state: "NH", status: "pending", url: null },
  { number: 34, city: "Hooksett", state: "NH", status: "pending", url: null },
  { number: 35, city: "Chester", state: "NH", status: "pending", url: null },
  { number: 36, city: "Bow", state: "NH", status: "pending", url: null },
];

async function updateDatabase() {
  console.log("Starting premium cities database update...");
  console.log(`Total cities: ${premiumCities.length}`);
  console.log(`Active: ${premiumCities.filter(c => c.status === "active").length}`);
  console.log(`Pending: ${premiumCities.filter(c => c.status === "pending").length}`);

  // Step 1: Delete all existing geolocation pages
  await db.delete(geolocationPages);
  console.log("✓ Cleared existing geolocation pages");

  // Step 2: Insert all premium cities
  const values = premiumCities.map(c => ({
    city: c.city,
    state: c.state,
    status: c.status,
    url: c.url,
  }));

  await db.insert(geolocationPages).values(values);
  console.log(`✓ Inserted ${values.length} premium cities`);

  // Step 3: Verify
  const allPages = await db.select().from(geolocationPages);
  const active = allPages.filter(p => p.status === "active").length;
  const pending = allPages.filter(p => p.status === "pending").length;
  
  console.log(`\n=== Premium Cities Summary ===`);
  console.log(`Total: ${allPages.length}`);
  console.log(`Active: ${active}`);
  console.log(`Pending: ${pending}`);
  console.log(`Progress: ${Math.round((active / allPages.length) * 100)}%`);
  console.log(`\nActive cities:`);
  allPages.filter(p => p.status === "active").forEach(p => {
    console.log(`  ${p.city}, ${p.state}`);
  });

  process.exit(0);
}

updateDatabase().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
