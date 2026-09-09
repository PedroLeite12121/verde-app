require('dotenv').config();
const { app, httpServer, io } = require('./app');

const PORT = process.env.PORT || 3333;

httpServer.listen(PORT, () => {
  console.log(`[+Verde] Servidor rodando na porta ${PORT}`);
});

module.exports = { app, httpServer, io };