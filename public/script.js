const socket = io();
let currentQuestionIndex = 0;
let currentQuestions = [];
let selectedCategory = "";  // Variável para armazenar a categoria selecionada
let score = 0;  // Pontuação do jogador
let timer = null;  // Cronômetro
let timeLeft = 30;  // Tempo de cada pergunta em segundos

// Atualiza o display da pontuação e do tempo restante
function updateDisplay() {
    document.getElementById('score').textContent = `Pontuação: ${score}`;
    document.getElementById('timer').textContent = `Tempo restante: ${timeLeft}s`;
}

// Espera o nome ser inserido
document.getElementById('nameForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const playerName = document.getElementById('name').value;
    if (playerName) {
        // Emitir o nome para o servidor
        socket.emit('newPlayer', playerName);
        // Esconder o formulário de nome
        document.getElementById('nameForm').style.display = 'none';
        // Mostrar o formulário de seleção de categoria
        document.getElementById('categorySelection').style.display = 'block';
    }
});

// Manipula a escolha da categoria
document.getElementById('jsBtn').addEventListener('click', function() {
    selectedCategory = 'javascript';  // Guarda a categoria selecionada
    socket.emit('categoryChosen', selectedCategory);  // Envia para o servidor
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'block';
});

document.getElementById('pythonBtn').addEventListener('click', function() {
    selectedCategory = 'python';  // Guarda a categoria selecionada
    socket.emit('categoryChosen', selectedCategory);  // Envia para o servidor
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'block';
});

// Manipula a escolha da dificuldade
document.getElementById('easyBtn').addEventListener('click', function() {
    socket.emit('difficultyChosen', { difficulty: 'easy', category: selectedCategory });
    document.getElementById('difficultySelection').style.display = 'none';
});

document.getElementById('mediumBtn').addEventListener('click', function() {
    socket.emit('difficultyChosen', { difficulty: 'medium', category: selectedCategory });
    document.getElementById('difficultySelection').style.display = 'none';
});

document.getElementById('hardBtn').addEventListener('click', function() {
    socket.emit('difficultyChosen', { difficulty: 'hard', category: selectedCategory });
    document.getElementById('difficultySelection').style.display = 'none';
});

// Quando as perguntas são enviadas pelo servidor
socket.on('startQuiz', function(questions) {
    currentQuestions = questions;
    score = 0;  // Reinicia a pontuação ao começar o quiz
    currentQuestionIndex = 0;
    timeLeft = 30;  // Reinicia o tempo
    startTimer();
    showQuestion();
});

// Inicia o cronômetro
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        // Se o tempo acabar, pula para a próxima pergunta
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

// Exibe a pergunta
function showQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        document.getElementById('question').textContent = question.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';  // Limpa as opções antigas

        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.onclick = () => checkAnswer(option, question.correctAnswer);
            optionsContainer.appendChild(optionBtn);
        });

        document.getElementById('quiz').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none';  // Desabilita o botão "Próxima" até responder
    }
}

// Checa se a resposta está correta
function checkAnswer(selectedOption, correctAnswer) {
    if (selectedOption === correctAnswer) {
        score += 10;  // Adiciona pontos por resposta correta
    }

    // Desabilita as opções após uma escolha
    const optionsContainer = document.getElementById('options');
    optionsContainer.querySelectorAll('button').forEach(button => button.disabled = true);

    // Habilita o botão "Próxima"
    document.getElementById('nextBtn').style.display = 'block';
}

// Quando o jogador clica para a próxima pergunta
document.getElementById('nextBtn').addEventListener('click', nextQuestion);

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        timeLeft = 30;  // Reinicia o tempo para a próxima pergunta
        startTimer();
        showQuestion();
    } else {
        alert('Quiz finalizado! Você terminou o quiz!');
    }
}

// Atualiza o display da pontuação e do cronômetro
function updateDisplay() {
    document.getElementById('score').textContent = `Pontuação: ${score}`;
    document.getElementById('timer').textContent = `Tempo restante: ${timeLeft}s`;
}

// Exibe as sugestões
function showSuggestions() {
    const suggestions = [
        "Se você não sabe a resposta, tente chutar! Às vezes, a resposta mais óbvia é a certa.",
        "Leia a pergunta com atenção, não se apresse.",
        "Tente lembrar dos conceitos chave de cada linguagem antes de responder.",
        "Boa sorte e divirta-se!"
    ];

    const suggestionContainer = document.createElement('div');
    suggestionContainer.setAttribute('id', 'suggestions');

    suggestions.forEach((suggestion, index) => {
        const suggestionElement = document.createElement('p');
        suggestionElement.textContent = suggestion;
        suggestionContainer.appendChild(suggestionElement);
    });

    document.body.appendChild(suggestionContainer);
}

// Exibir sugestões quando o quiz começar
socket.on('startQuiz', function() {
    showSuggestions();
});
