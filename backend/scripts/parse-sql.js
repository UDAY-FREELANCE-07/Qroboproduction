const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'postgres', 'seeds');
console.log('Reading migrations from:', migrationsDir);

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
console.log('Files:', files);
