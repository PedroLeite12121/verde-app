CREATE DATABASE IF NOT EXISTS dbDadosVerde;
USE dbDadosVerde;

CREATE TABLE tbl_Nivel_Usuario (
  idNivel_Usuario INT PRIMARY KEY AUTO_INCREMENT,
  descricao VARCHAR(30) NOT NULL UNIQUE,

  CONSTRAINT chk_nivel_usuario
    CHECK (descricao IN ('comum', 'admin', 'ong'))
);

CREATE TABLE tbl_Usuario (
  idUsuario INT PRIMARY KEY AUTO_INCREMENT,
  idNivel_Usuario INT NOT NULL DEFAULT 1,
  nome VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  cpf CHAR(11) UNIQUE,
  dataNasc DATE,

  CONSTRAINT fk_usuario_nivel
    FOREIGN KEY (idNivel_Usuario)
    REFERENCES tbl_Nivel_Usuario(idNivel_Usuario)
);

CREATE TABLE tbl_Area (
  idArea INT PRIMARY KEY AUTO_INCREMENT,
  cidade VARCHAR(30) NOT NULL,
  bairro VARCHAR(30) NOT NULL,
  rua VARCHAR(35) NOT NULL,
  statusArea VARCHAR(20) NOT NULL DEFAULT 'identificada',
  latitude DOUBLE,
  longitude DOUBLE,
  raio DOUBLE DEFAULT 180,
  poligono TEXT,

  CONSTRAINT chk_status_area
    CHECK (statusArea IN ('identificada', 'em tratamento', 'reflorestada'))
);

CREATE TABLE tbl_Ong (
  idOng INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL UNIQUE,
  nome VARCHAR(50) NOT NULL,
  regiao VARCHAR(30) NOT NULL,
  cnpj CHAR(14) NOT NULL UNIQUE,
  telefone VARCHAR(15) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  statusOng VARCHAR(50) NOT NULL DEFAULT 'pendente',

  CONSTRAINT fk_ong_usuario
    FOREIGN KEY (idUsuario)
    REFERENCES tbl_Usuario(idUsuario),

  CONSTRAINT chk_status_ong
    CHECK (statusOng IN ('pendente', 'aprovada'))
);

CREATE TABLE tbl_Projeto (
  idProjeto INT PRIMARY KEY AUTO_INCREMENT,
  idOng INT NOT NULL,
  objetivo VARCHAR(50) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  percentualConclusao FLOAT NOT NULL DEFAULT 0,

  CONSTRAINT chk_percentual_projeto
    CHECK (percentualConclusao BETWEEN 0 AND 100),

  CONSTRAINT fk_projeto_ong
    FOREIGN KEY (idOng)
    REFERENCES tbl_Ong(idOng)
);

CREATE TABLE tbl_Denuncia (
  idDenuncia INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  idArea INT NOT NULL,
  titulo VARCHAR(35) NOT NULL,
  dataDenuncia DATE NOT NULL,
  statusDenuncia VARCHAR(20) NOT NULL DEFAULT 'aberta',
  descricao VARCHAR(100) NOT NULL,
  foto VARCHAR(50),

  CONSTRAINT fk_denuncia_usuario
    FOREIGN KEY (idUsuario)
    REFERENCES tbl_Usuario(idUsuario),

  CONSTRAINT fk_denuncia_area
    FOREIGN KEY (idArea)
    REFERENCES tbl_Area(idArea),

  CONSTRAINT chk_status_denuncia
    CHECK (statusDenuncia IN ('aberta', 'em tratamento', 'resolvido'))
);

CREATE TABLE tbl_Ong_Usuario (
  idOng_Usuario INT PRIMARY KEY AUTO_INCREMENT,
  idOng INT NOT NULL,
  idUsuario INT NOT NULL,
  
  CONSTRAINT fk_onguser_ong
    FOREIGN KEY (idOng) REFERENCES tbl_Ong (idOng),
    
  CONSTRAINT fk_onguser_usuario
    FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario (idUsuario),

  CONSTRAINT uq_ong_usuario
    UNIQUE (idOng, idUsuario)
);