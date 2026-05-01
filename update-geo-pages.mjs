import { drizzle } from "drizzle-orm/mysql2";
import { geolocationPages } from "./drizzle/schema.ts";
import { eq, and } from "drizzle-orm";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

// Cities from PDF with verified status from art7epoxy.com
// Pattern: /garage-floor-coating-in-{slug}-{state}/
const citiesFromPDF = [
  // MA Cities - ACTIVE (HTTP 200)
  { city: "Lowell", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-lowell-ma/" },
  { city: "Tewksbury", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-tewksbury-ma/" },
  { city: "Dracut", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-dracut-ma/" },
  { city: "Chelmsford", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-chelmsford-ma/" },
  { city: "Burlington", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-burlington-ma/" },
  { city: "Wilmington", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-wilmington-ma/" },
  { city: "Reading", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-reading-ma/" },
  { city: "Lexington", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-lexington-ma/" },
  { city: "Arlington", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-arlington-ma/" },
  { city: "Acton", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-acton-ma/" },
  { city: "Ayer", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-ayer-ma/" },
  { city: "Westford", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-westford-ma/" },
  { city: "Andover", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-andover-ma/" },
  { city: "North Andover", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-north-andover-ma/" },
  { city: "Methuen", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-methuen-ma/" },
  { city: "Haverhill", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-haverhill-ma/" },
  { city: "Billerica", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-billerica-ma/" },
  { city: "Concord", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-concord-ma/" },
  { city: "Carlisle", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-carlisle-ma/" },
  { city: "Maynard", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-maynard-ma/" },
  { city: "Sudbury", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-sudbury-ma/" },
  { city: "Southborough", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-southborough-ma/" },
  { city: "Northborough", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-northborough-ma/" },
  { city: "Natick", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-natick-ma/" },
  { city: "Wellesley", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-wellesley-ma/" },
  { city: "Newton", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-newton-ma/" },
  { city: "Waltham", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-waltham-ma/" },
  { city: "Watertown", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-watertown-ma/" },
  { city: "Belmont", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-belmont-ma/" },
  { city: "Fitchburg", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-fitchburg-ma/" },
  { city: "Leominster", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-leominster-ma/" },
  { city: "Framingham", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-framingham-ma/" },
  { city: "Marlborough", state: "MA", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-marlborough-ma/" },

  // MA Cities - PENDING (HTTP 404)
  { city: "Lawrence", state: "MA", status: "pending", url: null },
  { city: "Bedford", state: "MA", status: "pending", url: null },
  { city: "Littleton", state: "MA", status: "pending", url: null },
  { city: "Pepperell", state: "MA", status: "pending", url: null },
  { city: "Townsend", state: "MA", status: "pending", url: null },
  { city: "Groton", state: "MA", status: "pending", url: null },
  { city: "Hudson", state: "MA", status: "pending", url: null },
  { city: "Stow", state: "MA", status: "pending", url: null },
  { city: "Boxborough", state: "MA", status: "pending", url: null },
  { city: "Clinton", state: "MA", status: "pending", url: null },
  { city: "Lancaster", state: "MA", status: "pending", url: null },
  { city: "Shirley", state: "MA", status: "pending", url: null },
  { city: "Tyngsborough", state: "MA", status: "pending", url: null },

  // NH Cities - ACTIVE (HTTP 200)
  { city: "Nashua", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-nashua-nh/" },
  { city: "Hudson", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-hudson-nh/" },
  { city: "Derry", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-derry-nh/" },
  { city: "Londonderry", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-londonderry-nh/" },
  { city: "Salem", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-salem-nh/" },
  { city: "Windham", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-windham-nh/" },
  { city: "Hollis", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-hollis-nh/" },
  { city: "Amherst", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-amherst-nh/" },
  { city: "Merrimack", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-merrimack-nh/" },
  { city: "Litchfield", state: "NH", status: "active", url: "https://art7epoxy.com/garage-floor-coating-in-litchfield-nh/" },

  // NH Cities - PENDING (HTTP 404)
  { city: "Pelham", state: "NH", status: "pending", url: null },
];

async function updateDatabase() {
  console.log("Starting database update...");
  console.log(`Total cities from PDF: ${citiesFromPDF.length}`);
  console.log(`Active: ${citiesFromPDF.filter(c => c.status === "active").length}`);
  console.log(`Pending: ${citiesFromPDF.filter(c => c.status === "pending").length}`);

  // Step 1: Delete all existing geolocation pages
  await db.delete(geolocationPages);
  console.log("✓ Cleared existing geolocation pages");

  // Step 2: Insert all cities from PDF with correct status
  const values = citiesFromPDF.map(c => ({
    city: c.city,
    state: c.state,
    status: c.status,
    url: c.url,
  }));

  await db.insert(geolocationPages).values(values);
  console.log(`✓ Inserted ${values.length} cities with verified status`);

  // Step 3: Verify
  const allPages = await db.select().from(geolocationPages);
  const active = allPages.filter(p => p.status === "active").length;
  const pending = allPages.filter(p => p.status === "pending").length;
  console.log(`\n=== Database Summary ===`);
  console.log(`Total: ${allPages.length}`);
  console.log(`Active: ${active}`);
  console.log(`Pending: ${pending}`);
  console.log(`Progress: ${Math.round((active / allPages.length) * 100)}%`);

  process.exit(0);
}

updateDatabase().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
