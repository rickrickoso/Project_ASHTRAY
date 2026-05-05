// DOM
const botAbrirCarrinho = document.getElementById('bot-abrir-carrinho');
const botFecharCarrinho = document.getElementById('bot-fechar-carrinho');
const carrinhoLateral = document.getElementById('carrinho-lateral');

// Funções
function abrirCarrinho(){
    carrinhoLateral.classList.add('aberto');
}

function fecharCarrinho(){
    carrinhoLateral.classList.remove('aberto');
}

// Listeners
botAbrirCarrinho.addEventListener('click', abrirCarrinho);
botFecharCarrinho.addEventListener('click', fecharCarrinho);