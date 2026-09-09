# +Verde

App de mapeamento de áreas não verdes e conexão entre pessoas e ONGs de reflorestamento.

## Stack

- **Mobile:** React Native (Expo)
- **Backend:** Node.js + Express
- **Banco:** MySQL + Sequelize ORM
- **Auth:** JWT

---

## Início Rápido

Siga nessa ordem para subir o projeto sem confusão:

### 1) Prepare o ambiente

- Instale o Node.js 18+
- Instale o Docker Desktop
- Abra o Docker Desktop e espere ele ficar ativo

### 2) Instale as dependências do backend

```bash
cd verde-app/backend
npm install
```

### 3) Inicie o banco e a API

No diretório raiz do projeto:

```bash
cd ..
npm run dev
```

Se estiver no Windows PowerShell, use:

```powershell
cd c:\Users\SeuUsuario\verde-app
npm run dev
```

> O projeto usa o MySQL em Docker na porta externa 3307 porque a porta 3306 já pode estar ocupada por outro MySQL local.

### 4) Inicie o app mobile

Em outro terminal:

```bash
cd verde-app/mobile
npm install
npx expo start
```

### 5) Acesse o app

- Backend: `http://localhost:3333`
- MySQL: `localhost:3307`
- Expo: escaneie o QR Code com o Expo Go

---

## Estrutura do Projeto

```
+Verde/
├── backend/                    # API REST
│   ├── src/
│   │   ├── config/            # Database, Sequelize
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── database/
│   │   │   ├── migrations/    # Criação das tabelas
│   │   │   └── seeders/       # Dados de teste
│   │   ├── middlewares/       # Auth, validação, erros
│   │   ├── models/            # Models (Sequelize)
│   │   ├── routes/            # Rotas REST
│   │   └── validators/        # Validação com Yup
│   └── uploads/               # Arquivos enviados
│
├── mobile/                     # App React Native
│   ├── src/
│   │   ├── api/               # Axios + interceptors
│   │   ├── contexts/          # AuthContext
│   │   ├── navigation/        # Stack + Tab Navigator
│   │   └── screens/
│   │       ├── auth/          # Login, Register
│   │       ├── home/          # Dashboard
│   │       ├── areas/         # Lista de áreas
│   │       ├── ngos/          # Lista de ONGs
│   │       ├── projetos/      # Projetos do usuário
│   │       ├── denuncias/     # Denúncias
│   │       └── profile/       # Perfil
│   └── app.json               # Configuração Expo
│
├── admin/                      # Painel admin web (HTML/CSS/JS + server.js)
├── dbDadosVerde.sql            # Script SQL do banco
└── .gitignore
```

---

## Banco de Dados

Estrutura conforme `dbDadosVerde.sql`:

```sql
tbl_Usuario       -- idUsuario, nome, email, senha
tbl_Admin         -- idAdmin, idUsuario (FK)
tbl_UsuarioComum  -- idUsarioComum, idUsuario (FK), cpf, dataNasc
tbl_Area          -- idArea, cidade, bairro, rua, statusArea
tbl_Ongs          -- idOngs, idUsuario (FK), regiao, cnpj, telefone, descricao
tbl_Projeto       -- id_Projeto, idUsuario (FK), objetivo, descricao, percentualConclusao
tbl_Denuncias     -- idDenuncias, idUsuario (FK), idArea (FK), titulo, dataDenuncia,
                    statusDenuncia, descricao, foto
```

### Relacionamentos

```
Usuario ──1:1──> Admin
Usuario ──1:1──> UsuarioComum
Usuario ──1:1──> Ongs
Usuario ──1:N──> Projeto
Usuario ──1:N──> Denuncias
Area ────1:N──> Denuncias
```

---

## Setup

### Pré-requisitos

- Node.js >= 18
- MySQL >= 8 (ou Docker)
- Expo CLI (`npm install -g expo-cli`)

---

### Setup com Docker (Recomendado)

O Docker cuida do banco e do backend. Você não precisa instalar MySQL manualmente.

#### Pré-requisitos

- Node.js 18+
- Docker Desktop instalado e em execução
- Git

> Se o comando `docker-compose` não funcionar no seu ambiente, use `docker compose` no lugar. Em versões recentes do Docker, esse é o comando padrão.

#### Primeira vez

```bash
# 1. Clonar o repositório
git clone https://github.com/vickyAqui/verde-app.git
cd verde-app

# 2. Copiar o .env do backend (opcional para Docker, mas recomendado para rodar localmente)
# Linux/macOS:
cp backend/.env.example backend/.env

# Windows PowerShell:
copy backend\.env.example backend\.env

# 3. Subir o ambiente
npm run dev
```

Esse comando sobe:
1. o container do MySQL na porta externa 3307
2. o container do backend na porta 3333
3. as migrations e os seeders iniciais

Pronto. A API fica disponível em `http://localhost:3333`.

#### Dia a dia

```bash
# Iniciar o ambiente (MySQL + Backend)
npm run dev

# Em outro terminal, se quiser rodar migrations ou seeders manualmente:
npm run migrate
npm run seed

# Parar tudo
npm run stop
```

O Docker tem hot reload: alterações em `backend/src/` reiniciam o servidor automaticamente.

#### Comandos de controle

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Sobe MySQL + Backend |
| `npm run stop` | Para todos os containers |
| `npm run logs` | Mostra os logs do backend em tempo real |
| `npm run db:shell` | Entra no MySQL via terminal |
| `npm run migrate` | Roda migrations |
| `npm run seed` | Roda seeders |
| `npm run reset` | Apaga tudo e reinicia o banco |
| `npm run test` | Roda a suíte de testes automatizados (Jest + Supertest) no container |
| `npm run admin` | Sobe o painel admin web (`http://localhost:3000`) |

#### Portas

> O MySQL local já pode estar em uso na porta 3306. Para evitar conflito, o projeto usa a porta externa 3307 no Docker.

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend | 3333 | `http://localhost:3333` |
| MySQL | 3307 | `localhost:3307` |

#### Credenciais do MySQL (Docker)

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Porta | `3307` |
| Usuário | `root` |
| Senha | `root` |
| Banco | `dbDadosVerde` |

#### Caso o Docker não iniciar

Se aparecer a mensagem:

```bash
failed to connect to the docker API
```

isso significa que o Docker Desktop não está rodando. Abra o Docker Desktop e espere ele ficar ativo antes de rodar:

```bash
npm run dev
```

#### Criando um novo migration

```bash
# Dentro da pasta backend
npx sequelize-cli migration:generate --name nome-da-migration
npm run migrate
```

#### Resetando o banco

```bash
npm run reset
```

Esse comando apaga os containers e o volume do banco, recria tudo e popula com dados de teste.

#### Sem Docker?

Se preferir rodar sem Docker, com MySQL instalado localmente:

```bash
cd backend
# Linux/macOS:
cp .env.example .env
# Windows PowerShell:
copy .env.example .env

# Ajuste as variáveis em .env com suas credenciais locais
npm install
mysql -u root -e "CREATE DATABASE dbDadosVerde"
npm run migrate
npm run seed
npm run dev
```

> Exemplo de configuração no `.env`: DB_HOST=localhost, DB_PORT=3307, DB_NAME=dbDadosVerde, DB_USER=root, DB_PASSWORD=sua_senha.

---

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Use o Expo Go no celular para abrir o app ou execute em emulador.

> O app se conecta ao backend em `http://localhost:3333`. Certifique-se de que o backend está ativo antes de abrir o app.

---

## Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@verde.com | 123456 |
| Usuário | maria@verde.com | 123456 |
| Usuário | joao@verde.com | 123456 |

---

## API REST

Base URL: `http://localhost:3333/api`

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/login` | Login | Não |
| POST | `/auth/register` | Cadastro | Não |

**Body login:**
```json
{ "email": "admin@verde.com", "senha": "123456" }
```

**Body register:**
```json
{ "nome": "Nome", "email": "email@test.com", "senha": "123456", "cpf": "12345678901", "dataNasc": "1995-06-15" }
```

### Usuários

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/usuarios/profile` | Ver perfil | Sim |
| PUT | `/usuarios/profile` | Atualizar perfil | Sim |
| DELETE | `/usuarios/profile` | Deletar conta | Sim |

### Áreas

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/areas` | Listar áreas | Sim |
| GET | `/areas/:id` | Buscar área | Sim |
| POST | `/areas` | Criar área | Sim |
| PUT | `/areas/:id` | Atualizar área | Sim |
| DELETE | `/areas/:id` | Deletar área | Sim |

**Filtros:** `?cidade=São Paulo&bairro=Mooca&statusArea=identificada`

**Body criar área:**
```json
{ "cidade": "São Paulo", "bairro": "Mooca", "rua": "Rua da Graça", "statusArea": "identificada" }
```

### ONGs

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/ongs` | Listar ONGs | Sim |
| GET | `/ongs/:id` | Buscar ONG | Sim |
| POST | `/ongs` | Cadastrar ONG | Sim |

**Filtro:** `?regiao=Cidade Tiradentes`

### Projetos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/projetos` | Listar projetos do usuário | Sim |
| GET | `/projetos/:id` | Buscar projeto | Sim |
| POST | `/projetos` | Criar projeto | Sim |
| PUT | `/projetos/:id` | Atualizar projeto | Sim |
| DELETE | `/projetos/:id` | Deletar projeto | Sim |

**Body criar projeto:**
```json
{ "objetivo": "Reflorestar área urbana", "descricao": "Plantio de 50 árvores" }
```

### Denúncias

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/denuncias` | Listar denúncias | Sim |
| GET | `/denuncias/:id` | Buscar denúncia | Sim |
| POST | `/denuncias` | Criar denúncia | Sim |
| PUT | `/denuncias/:id` | Atualizar denúncia | Sim |

**Filtros:** `?idArea=1&statusDenuncia=aberta`

**Body criar denúncia:**
```json
{ "idArea": 1, "titulo": "Desmatamento", "descricao": "Área com árvores derrubadas", "foto": "url_foto" }
```

### Admin

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/admin/dashboard` | Estatísticas gerais | Admin |
| GET | `/admin/usuarios` | Listar todos os usuários | Admin |
| GET | `/admin/areas` | Listar todas as áreas | Admin |
| GET | `/admin/ongs` | Listar todas as ONGs | Admin |
| GET | `/admin/denuncias` | Listar todas as denúncias | Admin |

---

## Painel Admin (Web)

Interface web simples (HTML/CSS/JS puro, sem build) que consome as APIs de Admin.

### Como rodar

```bash
# Com os containers de pé (npm run dev)
npm run admin
```

Abra `http://localhost:3000` no navegador e entre com as credenciais de admin:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | `admin@verde.com` | `123456` |

O painel permite:
- Dashboard com totais de usuários, admins, usuários comuns, áreas, ONGs, projetos e denúncias (abertas).
- Listagem de usuários (com perfil admin/comum), áreas, ONGs e denúncias.
- Acesso restrito: apenas contas com perfil `admin` conseguem entrar.

O servidor (`admin/server.js`) é Node puro (sem dependências), serve os arquivos estáticos na
porta `3000` e faz proxy de `/api` para o backend em `http://localhost:3333`, evitando problemas
de CORS na demonstração. Para mudar a porta ou o backend:

```bash
PORT=3001 BACKEND_URL=http://localhost:3333 npm run admin
```

---

## Testes Automatizados

O backend usa **Jest + Supertest** (padrão de mercado para APIs Express). Os testes rodam contra um
banco isolado (`verde_db_test`, criado automaticamente), com migrations e seeders próprios — sem
tocar no banco de demonstração.

```bash
# Rodar tudo (recria o banco de teste, aplica migrations + seeders e executa a suíte)
npm run test

# Dentro da pasta backend, rodar só os testes (sem recriar o banco)
cd backend
npm test                  # executa uma vez
npm run test:watch        # fica assistindo as mudanças
```

Cobertura atual (57 testes):

| Suíte | O que verifica |
|-------|----------------|
| `tests/auth.test.js` | Login (admin/comum, senha errada, email inexistente, validação) e registro (criação, duplicado, obrigatórios) |
| `tests/admin.test.js` | Acesso restrito a admin (401/403), dashboard com estatísticas e listagens (usuários, áreas, ONGs, denúncias) |
| `tests/usuarios.test.js` | Perfil (buscar, atualizar, deletar conta) |
| `tests/areas.test.js` | CRUD de áreas, filtros (bairro, status) e suíte garante que tudo é da região Cidade Tiradentes |
| `tests/ongs.test.js` | Listagem, busca, filtro por região e criação de ONG |
| `tests/projetos.test.js` | CRUD de projetos com controle de dono (403 para terceiros) |
| `tests/denuncias.test.js` | Listagem, filtros, criação em área válida/inválida e atualização de status |

---

## Autenticação

Para rotas autenticadas, enviar header:

```
Authorization: Bearer <token>
```

O token é retornado no login/register.

### Roles

- **admin:** Acessa rotas `/admin/*`. Identificado pela existência de registro em `tbl_Admin`.
- **comum:** Usuário comum. Identificado pela existência de registro em `tbl_UsuarioComum`.

---

## Mobile - Screens

| Screen | Descrição |
|--------|-----------|
| LoginScreen | Tela de login |
| RegisterScreen | Cadastro de usuário |
| HomeScreen | Dashboard com resumo |
| AreasScreen | Lista de áreas não verdes |
| NGOsScreen | Lista de ONGs |
| ProjetosScreen | Projetos do usuário (com % conclusão) |
| DenunciasScreen | Lista de denúncias |
| ProfileScreen | Perfil + logout |

---

## Mobile - Navegação

```
AuthStack (não logado)
├── Login
└── Register

MainTab (logado)
├── Home
├── Areas
├── ONGs
├── Projetos
├── Denuncias
└── Profile
```

---

## Deploy (futuro)

### Backend
- Railway, Render, ou Vercel (serverless)
- MySQL: PlanetScale, Railway, ou AWS RDS

### Mobile
- EAS Build (Expo)
- Produção: `eas build --platform android` / `eas build --platform ios`

---

## Comandos Úteis

```bash
# Backend
npm run dev              # Iniciar em dev
npm run migrate          # Rodar migrations
npm run migrate:undo     # Desfazer última migration
npm run seed             # Rodar seeders
npm run seed:undo        # Desfazer seeders

# Mobile
npx expo start           # Iniciar Expo
npx expo start --clear   # Limpar cache
```

---

## Contribuição

1. Criar branch (`git checkout -b feature/nome`)
2. Commitar (`git commit -m "feat: descrição"`)
3. Push (`git push origin feature/nome`)
4. Abrir Pull Request
