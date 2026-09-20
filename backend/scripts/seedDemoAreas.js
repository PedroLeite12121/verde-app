const { Area } = require('../src/models');

const CT = [
  { rua: 'Rua das Laranjeiras', bairro: 'Cidade Tiradentes', statusArea: 'identificada', latitude: -23.5654, longitude: -46.4262 },
  { rua: 'Avenida dos Ipês', bairro: 'Cidade Tiradentes', statusArea: 'identificada', latitude: -23.5701, longitude: -46.4129 },
  { rua: 'Rua do Sabiá', bairro: 'Cidade Tiradentes', statusArea: 'em tratamento', latitude: -23.5739, longitude: -46.4188 },
  { rua: 'Travessa Esperança', bairro: 'Cidade Tiradentes', statusArea: 'em tratamento', latitude: -23.5622, longitude: -46.4214 },
  { rua: 'Rua Girassol', bairro: 'Cidade Tiradentes', statusArea: 'identificada', latitude: -23.5682, longitude: -46.4142 },
  { rua: 'Praça do Encontro', bairro: 'Cidade Tiradentes', statusArea: 'reflorestada', latitude: -23.5715, longitude: -46.4201 },
  { rua: 'Rua Santa Etelvina', bairro: 'Cidade Tiradentes', statusArea: 'identificada', latitude: -23.5671, longitude: -46.4311 },
  { rua: 'Rua dos Guarantãs', bairro: 'Cidade Tiradentes', statusArea: 'identificada', latitude: -23.5748, longitude: -46.4078 },
];

(async () => {
  let count = 0;
  for (const area of CT) {
    const data = { cidade: 'São Paulo', ...area };
    const exists = await Area.findOne({ where: { rua: area.rua } });
    if (exists) {
      await exists.update(data);
      console.log(`~ ${area.rua} atualizada`);
    } else {
      await Area.create(data);
      console.log(`+ ${area.rua}`);
    }
    count += 1;
  }
  console.log(`${count} área(s) garantidas para demo.`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});