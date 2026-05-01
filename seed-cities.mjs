import { drizzle } from 'drizzle-orm/mysql2';
import { geolocationPages } from './drizzle/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const cities = {
  massachusetts: [
    "Lowell", "Wellesley", "Ashland", "Natick", "Franklin", "Hopkinton",
    "Northborough", "Southborough", "Sudbury", "Maynard", "Acton", "Concord",
    "Walpole", "Hingham", "Milton", "Weymouth", "Randolph", "Canton",
    "Saugus", "Winthrop", "Stoneham", "Wakefield", "Arlington", "Medford",
    "Somerville", "Cambridge", "Newton", "Waltham", "Watertown", "Belmont",
    "Winchester", "Lexington", "Lincoln", "Carlisle", "Westford", "Tewksbury",
    "Billerica", "Chelmsford", "Dracut", "Dunstable", "Pepperell", "Townsend",
    "Fitchburg", "Leominster", "Gardner", "Templeton", "Westminster", "Ashburnham",
    "Ayer", "Groton"
  ],
  connecticut: [
    "New London", "Shelton", "Groton", "Stratford", "Torrington", "Enfield",
    "Middletown", "Manchester", "Meriden", "Milford", "Bristol", "New Britain",
    "Hartford", "West Hartford", "Wethersfield", "East Hartford", "Wallingford",
    "Durham", "Berlin", "Middlefield", "Cheshire", "Waterbury", "Naugatuck",
    "Prospect", "Beacon Falls", "Seymour", "Ansonia", "Derby", "Bridgeport",
    "Fairfield", "Westport", "Weston", "Darien", "New Canaan", "Stamford",
    "Greenwich", "Norwalk", "Wilton", "Ridgefield", "Danbury", "Bethel",
    "Newtown", "Brookfield", "New Milford", "Kent", "Sharon", "Cornwall",
    "Litchfield", "Watertown"
  ]
};

const pages = [];

for (const city of cities.massachusetts) {
  pages.push({
    city,
    state: "MA",
    status: "pending",
    url: null,
  });
}

for (const city of cities.connecticut) {
  pages.push({
    city,
    state: "CT",
    status: "pending",
    url: null,
  });
}

try {
  await db.insert(geolocationPages).values(pages);
  console.log(`✓ Seeded ${pages.length} cities successfully!`);
  process.exit(0);
} catch (error) {
  console.error("Error seeding database:", error);
  process.exit(1);
}
