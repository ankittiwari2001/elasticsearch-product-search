// seed.js
const client = require('./elastic');
const { faker } = require('@faker-js/faker');

async function generateProducts(count) {
  console.log(`🔄 Starting to generate and index ${count} products...\n`);

  const operations = [];

  for (let i = 0; i < count; i++) {
    const product = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
    };

    operations.push({ index: { _index: 'products' } });
    operations.push(product);

    if ((i + 1) % 1000 === 0) {
      console.log(`✅ Prepared ${i + 1} documents for bulk insert...`);
    }
  }

 try {
  console.log('\n🚀 Sending bulk request to Elasticsearch...');
  const bulkResponse = await client.bulk({
    refresh: true,
    body: operations,
  });

  if (bulkResponse.errors) {
    const erroredDocs = bulkResponse.items.filter(item => item.index && item.index.error);
    console.error(`❌ Bulk insert completed with ${erroredDocs.length} errors`);
    erroredDocs.slice(0, 5).forEach((doc, i) =>
      console.error(`Error ${i + 1}:`, doc.index.error)
    );
  } else {
    console.log(`✅ Successfully indexed ${count} products into 'products' index.`);
  }
} catch (error) {
  console.error('🔥 An error occurred during bulk insert:', error);
}


  console.log('\n✅ Seeding complete.');
}

generateProducts(50);
