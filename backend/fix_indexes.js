const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const collections = ['roles', 'leavetypes', 'shifts', 'payrollconfigurations', 'overtimepolicies', 'payrolltemplates', 'salarycomponents', 'leavesettings', 'companyinfos'];

  for (const collName of collections) {
    try {
      const collection = mongoose.connection.collection(collName);
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        if (index.name !== '_id_' && !index.name.includes('company_1')) {
           // We expect the new unique indexes to be compound, like name_1_company_1
           if (index.unique && index.key.company === undefined) {
             console.log(`Dropping old unique index ${index.name} from ${collName}`);
             await collection.dropIndex(index.name);
           }
        }
      }
    } catch (err) {
      console.log(`Error checking indexes for ${collName}:`, err.message);
    }
  }

  console.log('Finished fixing indexes');
  process.exit(0);
}

fixIndexes();
