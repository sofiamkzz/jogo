const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Carregar o arquivo JSON de perguntas
let questions = JSON.parse(fs.readFileSync('questions.json'));

// Diretório para servir arquivos estáticos
app.use(express.static('public'));

// Rota inicial
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Rota para seleção de categoria
app.get('/category', (req, res) => {
  res.render('category.ejs');
});

// Rota para seleção de dificuldade
app.get('/difficulty', (req, res) => {
  res.render('difficulty.ejs');
});

// Rota para quiz
app.get('/quiz', (req, res) => {
  res.render('quiz.ejs');
});

// Variável para armazenar a categoria e dificuldade do jogador
let selectedCategory = '';
let selectedDifficulty = '';

// Gerenciar eventos de socket
io.on('connection', (socket) => {
    console.log('Novo jogador conectado');

    socket.on('newPlayer', (playerName) => {
        console.log(`Jogador ${playerName} entrou no jogo.`);
    });

    socket.on('categoryChosen', (category) => {
        selectedCategory = category;  // Salva a categoria escolhida
        console.log(`Categoria escolhida: ${category}`);
        socket.emit('categoryConfirmed', selectedCategory); // Confirma a categoria para o cliente
    });

    socket.on('difficultyChosen', ({ difficulty }) => {
        selectedDifficulty = difficulty;  // Salva a dificuldade escolhida
        console.log(`Dificuldade escolhida: ${difficulty}, Categoria: ${selectedCategory}`);
        
        // Filtra as perguntas com base na categoria e dificuldade
        const filteredQuestions = questions[selectedCategory]?.[selectedDifficulty];
        if (filteredQuestions && filteredQuestions.length > 0) {
            socket.emit('startQuiz', filteredQuestions);  // Envia as perguntas filtradas para o cliente
        } else {
            socket.emit('startQuiz', []);  // Caso não haja perguntas disponíveis para a categoria/dificuldade
        }
    });

    socket.on('disconnect', () => {
        console.log('Jogador desconectado');
    });
});

// Iniciar o servidor
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
