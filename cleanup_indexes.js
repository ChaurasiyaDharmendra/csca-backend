import { sequelize } from './config/db.js';

async function cleanupIndexes() {
  try {
    console.log("Starting index cleanup for 'Users' table...");
    
    // 1. Get all indexes on the Users table
    const [results] = await sequelize.query("SHOW INDEX FROM Users;");
    
    // Group by column name to identify duplicates
    const indexGroups = results.reduce((acc, row) => {
      const col = row.Column_name;
      if (!acc[col]) acc[col] = [];
      acc[col].push(row.Key_name);
      return acc;
    }, {});

    console.log("Current indexes found per column:");
    console.dir(indexGroups);

    // 2. Identify redundant indexes (anything with more than 1 entry that isn't PRIMARY)
    for (const column of Object.keys(indexGroups)) {
      const keys = indexGroups[column];
      
      // If there's more than 1 index for this column, we have redundancy
      // Note: primary keys are usually named PRIMARY. Unique keys can have any name.
      if (keys.length > 1) {
        // Keep the first index, drop the others
        // (Special case: if PRIMARY is in there, keep PRIMARY and drop others)
        let keysToDrop = [];
        const hasPrimary = keys.includes('PRIMARY');
        
        if (hasPrimary) {
          keysToDrop = keys.filter(k => k !== 'PRIMARY');
        } else {
          // Keep the first one found, drop the rest
          keysToDrop = keys.slice(1);
        }

        for (const key of keysToDrop) {
          console.log(`Dropping redundant index '${key}' for column '${column}'...`);
          try {
            await sequelize.query(`ALTER TABLE Users DROP INDEX ${key};`);
          } catch (e) {
            console.error(`  - Failed to drop index ${key} (might be already gone):`, e.message);
          }
        }
      }
    }

    console.log("Index cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Critical error during index cleanup:", error);
    process.exit(1);
  }
}

cleanupIndexes();
