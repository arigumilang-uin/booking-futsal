const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  try {
    const password = 'password123';
    const saltRounds = 12;

    console.log('Generating password hash for:', password);
    console.log('Salt rounds:', saltRounds);

    const hash = await bcrypt.hash(password, saltRounds);

    console.log('\n=== GENERATED HASH ===');
    console.log(hash);

    console.log('\n=== SQL UPDATE COMMAND ===');
    console.log(`UPDATE users SET password = '${hash}', updated_at = NOW();`);

    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('\n=== HASH VALIDATION ===');
    console.log('Hash is valid:', isValid);

    // Generate multiple hashes to test
    console.log('\n=== TESTING MULTIPLE HASHES ===');
    for (let i = 0; i < 3; i++) {
      const testHash = await bcrypt.hash(password, saltRounds);
      const testValid = await bcrypt.compare(password, testHash);
      console.log(`Hash ${i+1}: ${testHash}`);
      console.log(`Valid ${i+1}: ${testValid}`);
    }

  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash();
