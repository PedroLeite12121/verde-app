'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const senhaHash = await bcrypt.hash('123456', 10);

    const usuarios = [
      { idUsuario: 1, nome: 'Administrador', email: 'admin@verde.com', senha: senhaHash },
      { idUsuario: 2, nome: 'Maria Silva', email: 'maria@verde.com', senha: senhaHash },
      { idUsuario: 3, nome: 'João Santos', email: 'joao@verde.com', senha: senhaHash },
    ];

    await queryInterface.bulkInsert('tbl_Usuario', usuarios);

    await queryInterface.bulkInsert('tbl_Admin', [
      { idAdmin: 1, idUsuario: 1 },
    ]);

    await queryInterface.bulkInsert('tbl_UsuarioComum', [
      { idUsarioComum: 1, idUsuario: 2, cpf: '12345678901', dataNasc: '1995-06-15' },
      { idUsarioComum: 2, idUsuario: 3, cpf: '98765432100', dataNasc: '1990-03-22' },
    ]);

    await queryInterface.bulkInsert('tbl_Ongs', [
      { idOngs: 1, idUsuario: 2, regiao: 'Cidade Tiradentes', cnpj: '12345678000190', telefone: '(11) 99999-0001', descricao: 'ONG de reflorestamento urbano na Cidade Tiradentes' },
    ]);

    await queryInterface.bulkInsert('tbl_Area', [
      {
        idArea: 1,
        cidade: 'São Paulo',
        bairro: 'Cidade Tiradentes',
        rua: 'Estrada do Iguatemi',
        statusArea: 'identificada',
        latitude: -23.572,
        longitude: -46.4205,
        raio: 220,
        poligono: null,
      },
      {
        idArea: 2,
        cidade: 'São Paulo',
        bairro: 'Cidade Tiradentes',
        rua: 'Rua Inácio Monteiro',
        statusArea: 'em tratamento',
        latitude: -23.5665,
        longitude: -46.415,
        raio: 150,
        poligono: null,
      },
      {
        idArea: 3,
        cidade: 'São Paulo',
        bairro: 'Cidade Tiradentes',
        rua: 'Av. dos Têxteis',
        statusArea: 'reflorestada',
        latitude: -23.5715,
        longitude: -46.427,
        raio: 300,
        poligono: null,
      },
      {
        idArea: 4,
        cidade: 'São Paulo',
        bairro: 'Cidade Tiradentes',
        rua: 'Rua Juá Mirim',
        statusArea: 'em tratamento',
        latitude: -23.564,
        longitude: -46.422,
        raio: 180,
        poligono: JSON.stringify([
          [-23.5632, -46.4232],
          [-23.5632, -46.4208],
          [-23.5648, -46.4208],
          [-23.5648, -46.4232],
        ]),
      },
    ]);

    await queryInterface.bulkInsert('tbl_Projeto', [
      { id_Projeto: 1, idUsuario: 2, objetivo: 'Reflorestar margem da Estrada do Iguatemi', descricao: 'Plantio de 120 árvores na Cidade Tiradentes', percentualConclusao: 30 },
    ]);

    await queryInterface.bulkInsert('tbl_Denuncias', [
      { idDenuncias: 1, idUsuario: 3, idArea: 2, titulo: 'Desmatamento na rua', dataDenuncia: '2026-01-15', statusDenuncia: 'aberta', descricao: 'Área com árvores derrubadas próxima à Rua Inácio Monteiro', foto: null },
      { idDenuncias: 2, idUsuario: 3, idArea: 1, titulo: 'Descarte irregular de entulho', dataDenuncia: '2026-02-10', statusDenuncia: 'em tratamento', descricao: 'Entulho acumulado às margens da Estrada do Iguatemi', foto: null },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tbl_Denuncias', null, {});
    await queryInterface.bulkDelete('tbl_Projeto', null, {});
    await queryInterface.bulkDelete('tbl_Area', null, {});
    await queryInterface.bulkDelete('tbl_Ongs', null, {});
    await queryInterface.bulkDelete('tbl_UsuarioComum', null, {});
    await queryInterface.bulkDelete('tbl_Admin', null, {});
    await queryInterface.bulkDelete('tbl_Usuario', null, {});
  },
};
