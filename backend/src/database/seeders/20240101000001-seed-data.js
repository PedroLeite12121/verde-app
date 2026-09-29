'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const nivel_usuarios = [
      { idNivel_Usuario: 1, descricao: 'comum' },
      { idNivel_Usuario: 2, descricao: 'ong' },
      { idNivel_Usuario: 3, descricao: 'admin' },
    ];
    await queryInterface.bulkInsert('tbl_Nivel_Usuario', nivel_usuarios);

    const senhaHash = await bcrypt.hash('123456', 10);

    const usuarios = [
      { idUsuario: 1, idNivel_Usuario: 3, nome: 'Administrador', email: 'admin@verde.com', senha: senhaHash },
      { idUsuario: 2, idNivel_Usuario: 2, nome: 'Maria Silva', email: 'maria@verde.com', senha: senhaHash },
      { idUsuario: 3, idNivel_Usuario: 1, nome: 'João Santos', email: 'joao@verde.com', senha: senhaHash },
      { idUsuario: 4, idNivel_Usuario: 2, nome: 'Roberto Carlos', email: 'roberto@verde.com', senha: senhaHash}
    ];
    await queryInterface.bulkInsert('tbl_Usuario', usuarios);

    const ongs = [ 
      { idOng: 1, idUsuario: 2, nome: 'ONG da Cidade Tiradentes', regiao: 'Cidade Tiradentes', cnpj: '12345678000190', telefone: '(11) 99999-0001', descricao: 'ONG de reflorestamento urbano na Cidade Tiradentes', statusOng: 'aprovada' },
      { idOng: 2, idUsuario: 4, nome: 'ONG de Itaquera', regiao: 'Itaquera', cnpj: '12345678000191', telefone: '(11) 99999-0001', descricao: 'ONG de reflorestamento urbano na Itaquera', statusOng: 'aprovada' },
    ]
    await queryInterface.bulkInsert('tbl_Ong', ongs);

    const areas = [ 
      {
        idArea: 1, cidade: 'São Paulo', bairro: 'Cidade Tiradentes',
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
    ]
    await queryInterface.bulkInsert('tbl_Area', areas);

    const projetos = [ 
      { idProjeto: 1, idOng: 2, objetivo: 'Reflorestar margem da Estrada do Iguatemi', descricao: 'Plantio de 120 árvores na Cidade Tiradentes', percentualConclusao: 30 },
      { idProjeto: 2, idOng: 1, objetivo: 'Criar um corredor verde em Itaquera', descricao: 'Plantio de 80 mudas em vias do bairro', percentualConclusao: 15 },
      { idProjeto: 3, idOng: 2, objetivo: 'Recuperar área verde em Guaianases', descricao: 'Plantio de 60 árvores nativas na região', percentualConclusao: 0 },
    ]
    await queryInterface.bulkInsert('tbl_Projeto', projetos);

    const denuncias = [ 
      { idDenuncia: 1, idUsuario: 3, idArea: 2, titulo: 'Desmatamento na rua', dataDenuncia: '2026-01-15', statusDenuncia: 'aberta', descricao: 'Área com árvores derrubadas próxima à Rua Inácio Monteiro', foto: null },
      { idDenuncia: 2, idUsuario: 3, idArea: 1, titulo: 'Descarte irregular de entulho', dataDenuncia: '2026-02-10', statusDenuncia: 'em tratamento', descricao: 'Entulho acumulado às margens da Estrada do Iguatemi', foto: null },
    ]
    await queryInterface.bulkInsert('tbl_Denuncia', denuncias);

    const ong_usuarios = [ 
      { idOng_Usuario: 1, idOng: 1, idUsuario: 1},
      { idOng_Usuario: 2, idOng: 2, idUsuario: 1},
      { idOng_Usuario: 3, idOng: 1, idUsuario: 2},
    ]
    await queryInterface.bulkInsert('tbl_Ong_Usuario', ong_usuarios)
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tbl_Ong_Usuario', null, {})
    await queryInterface.bulkDelete('tbl_Denuncia', null, {});
    await queryInterface.bulkDelete('tbl_Projeto', null, {});
    await queryInterface.bulkDelete('tbl_Area', null, {});
    await queryInterface.bulkDelete('tbl_Ong', null, {});
    await queryInterface.bulkDelete('tbl_Usuario', null, {});
    await queryInterface.bulkDelete('tbl_Nivel_Usuario', null, {})
  },
};
