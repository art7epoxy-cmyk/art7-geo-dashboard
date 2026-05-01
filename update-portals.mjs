import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');

// Parse CSV
const csvContent = readFileSync('/home/ubuntu/upload/art7-portais-controle(1).csv', 'utf-8');
const lines = csvContent.trim().split('\n');

// Remove BOM and parse header
const header = lines[0].replace(/^\uFEFF/, '');
console.log('Header:', header);

// Parse CSV rows (handling quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const portals = [];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length >= 7) {
    portals.push({
      priority: parseInt(fields[0]),
      name: fields[1],
      category: fields[2],
      isPaid: fields[3],
      paidPlanInfo: fields[4],
      smsVerification: fields[5],
      portalUrl: fields[6],
      description: fields[7] || null,
    });
  }
}

console.log(`Parsed ${portals.length} portals from CSV`);

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Clear existing portals and re-insert with updated data
    await connection.execute('DELETE FROM listing_portals');
    console.log('Cleared existing portals');
    
    for (const portal of portals) {
      await connection.execute(
        `INSERT INTO listing_portals (priority, name, description, category, isPaid, paidPlanInfo, smsVerification, portalStatus, portalUrl) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'not_started', ?)`,
        [
          portal.priority,
          portal.name,
          portal.description,
          portal.category,
          portal.isPaid,
          portal.paidPlanInfo,
          portal.smsVerification,
          portal.portalUrl,
        ]
      );
    }
    
    console.log(`Inserted ${portals.length} portals successfully`);
    
    // Verify
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM listing_portals');
    console.log(`Total portals in DB: ${rows[0].count}`);
    
    // Show first 3 for verification
    const [sample] = await connection.execute('SELECT priority, name, category, isPaid, paidPlanInfo, description FROM listing_portals ORDER BY priority LIMIT 3');
    console.log('Sample data:', JSON.stringify(sample, null, 2));
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
