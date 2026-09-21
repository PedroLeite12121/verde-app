CREATE DATABASE IF NOT EXISTS dbDadosVerde;
USE dbDadosVerde;

-- Tabelas fortes
CREATE TABLE tbl_Usuario(
	idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR (100),
    senha VARCHAR (255),
    email VARCHAR (50)
);

CREATE TABLE tbl_Area(
	idArea INT PRIMARY KEY AUTO_INCREMENT,
    cidade VARCHAR (30),
    bairro VARCHAR (30),
    rua VARCHAR (35),
    statusArea VARCHAR (20),
    latitude DOUBLE,
    longitude DOUBLE,
    raio DOUBLE DEFAULT 180,
    poligono TEXT
);

-- Tabelas fracas
CREATE TABLE tbl_Admin(
	idAdmin INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario(idUsuario)
);

CREATE TABLE tbl_UsuarioComum(
	idUsarioComum INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    cpf CHAR (11),
    dataNasc DATE,
    FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario(idUsuario)
);

CREATE TABLE tbl_Ongs(
	idOngs INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    regiao VARCHAR (30),
    cnpj CHAR (14),
    telefone VARCHAR (15),
    descricao VARCHAR (100),
	FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario(idUsuario)
);

CREATE TABLE tbl_Projeto(
	id_Projeto INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    objetivo VARCHAR (50),
    descricao VARCHAR (100),
    percentualConclusao FLOAT,
    FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario(idUsuario)
);

CREATE TABLE tbl_Denuncias(
	idDenuncias INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT,
    idArea INT,
    titulo VARCHAR (35),
    dataDenuncia DATE,
    statusDenuncia VARCHAR (20),
    descricao VARCHAR (100),
    foto VARCHAR (50),
    FOREIGN KEY (idUsuario) REFERENCES tbl_Usuario(idUsuario),
    FOREIGN KEY (idArea) REFERENCES tbl_Area(idArea)
);