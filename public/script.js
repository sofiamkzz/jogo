const socket = io();
let currentQuestionIndex = 0;
let currentQuestions = [];
let selectedCategory = "";
let score = 0;
let timer = null;
let timeLeft = 30;

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
        socket.emit('newPlayer', playerName);
        document.getElementById('nameForm').style.display = 'none';
        document.getElementById('categorySelection').style.display = 'block';
    }
});

// Manipula a escolha da categoria
document.getElementById('jsBtn').addEventListener('click', function() {
    selectedCategory = 'javascript';
    socket.emit('categoryChosen', selectedCategory);
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'block';
});

document.getElementById('pythonBtn').addEventListener('click', function() {
    selectedCategory = 'python';
    socket.emit('categoryChosen', selectedCategory);
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('difficultySelection').style.display = 'block';
});

// Manipula a escolha da dificuldade
document.getElementById('easyBtn').addEventListener('click', () => selectDifficulty('easy'));
document.getElementById('mediumBtn').addEventListener('click', () => selectDifficulty('medium'));
document.getElementById('hardBtn').addEventListener('click', () => selectDifficulty('hard'));

function selectDifficulty(difficulty) {
    socket.emit('difficultyChosen', { difficulty, category: selectedCategory });
    document.getElementById('difficultySelection').style.display = 'none';
}

// Quando as perguntas são enviadas pelo servidor
socket.on('startQuiz', function(questions) {
    currentQuestions = questions;
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = 30;
    clearInterval(timer);
    startTimer();
    showQuestion();
});

// Inicia o cronômetro
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

// Exibe a pergunta
// Exibe a pergunta e atualiza o contador
function showQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        document.getElementById('questionCounter').textContent = `Questão ${currentQuestionIndex + 1} de ${currentQuestions.length}`;
        document.getElementById('question').textContent = question.question;

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';  // Limpa as opções antigas

        question.options.forEach((option) => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.onclick = () => checkAnswer(option, question.answer);
            optionsContainer.appendChild(optionBtn);
        });

        document.getElementById('quiz').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none'; // Oculta o botão "Próxima" até responder
    }
}

// Checa se a resposta está correta e muda a cor dos botões
function checkAnswer(selectedOption, correctAnswer) {
    const optionsContainer = document.getElementById('options');
    const buttons = optionsContainer.querySelectorAll('button');

    buttons.forEach(button => {
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'green'; // Resposta correta em verde
            button.style.color = 'white';
        }
        if (button.textContent === selectedOption && selectedOption !== correctAnswer) {
            button.style.backgroundColor = 'red'; // Resposta errada em vermelho
            button.style.color = 'white';
        }
        button.disabled = true; // Desabilita os botões após a resposta
    });

    if (selectedOption === correctAnswer) {
        score += 10; // Adiciona pontos se estiver correto
    }

    document.getElementById('nextBtn').style.display = 'block'; // Exibe botão "Próxima"
}

// Quando o jogador clica para a próxima pergunta
document.getElementById('nextBtn').addEventListener('click', nextQuestion);

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        timeLeft = 30;
        startTimer();
        showQuestion();
    } else {
        clearInterval(timer);
        alert(`Quiz finalizado! Sua pontuação foi: ${score}`);
    }
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

    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('p');
        suggestionElement.textContent = suggestion;
        suggestionContainer.appendChild(suggestionElement);
    });

    document.body.appendChild(suggestionContainer);
}

socket.on('startQuiz', showSuggestions);
