const { Area } = require('../src/models');
const { geocodeAddress } = require('../src/services/geocode');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const areas = await Area.findAll({ where: { latitude: null, longitude: null } });
  console.log(`${areas.length} área(s) sem coordenadas`);

  for (const a of areas) {
    const coords = await geocodeAddress({
      rua: a.rua,
      bairro: a.bairro,
      cidade: a.cidade,
    });

    if (coords) {
      await a.update(coords);
      console.log(`✓ ${a.rua} → ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
    } else {
      console.log(`— ${a.rua} sem resultado (fica só na lista)`);
    }
    await sleep(1100);
  }

  console.log('Concluído.');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});