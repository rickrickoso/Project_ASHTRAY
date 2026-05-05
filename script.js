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


// Simulacao JSON do BD -----------------------------------------------
const roupasCadastradasPromocoes = [
    {
        id: 1,
        nome: "Camiseta Xtranha",
        preco: "R$ 89,90",
        imagem: "assets/camisa-xtranha.jpg"
    },
    {
        id: 2,
        nome: "Moletom #FreeVetin",
        preco: "R$ 145,00",
        imagem: "assets/moletom-freevetin.jpg"
    },
    {
        id: 3,
        nome: "Boné TrapMixtape",
        preco: "R$ 55,00",
        imagem: "assets/bone-trapmixtape.jpg"
    }
];

const roupasCadastradasMaisVendidos = [
    {
        id: 1,
        nome: "Camiseta Xtranha",
        preco: "R$ 89,90",
        imagem: "assets/camisa-xtranha.jpg"
    },
    {
        id: 2,
        nome: "Moletom #FreeVetin",
        preco: "R$ 145,00",
        imagem: "assets/moletom-freevetin.jpg"
    },
    {
        id: 3,
        nome: "Boné TrapMixtape",
        preco: "R$ 55,00",
        imagem: "assets/bone-trapmixtape.jpg"
    },
        {
        id: 4,
        nome: "Boné CrepeMilkshake",
        preco: "R$ 75,00",
        imagem: "assets/bone-crepemilkshake.jpg"
    }
    
];
// -------------------------------------------------------------------
const gridVitrine = document.querySelector('.vitrine-promocao .grid-produtos');
const gridVitrine2 = document.querySelector('.vitrine-mais-vendidos .grid-produtos');
function renderizarProdutos(listaDeRoupas, containerHtml){
    containerHtml.innerHTML = '';

    listaDeRoupas.forEach(function(roupa){
        const moldeHtml = `
            <div class="cartao-produto">
                <img src="${roupa.imagem}" alt="${roupa.nome}" onerror="this.onerror=null; this.src='assets/placeholder.jpg';">
                <div class="info-produto">
                    <h3 class="titulo-produto">${roupa.nome}</h3>
                    <p class="preco-produto">${roupa.preco}</p>
                    <button class="bot-comprar" data-id="${roupa.id}">
                        <i class="ph ph-bag"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
        containerHtml.innerHTML += moldeHtml;
    });
}

renderizarProdutos(roupasCadastradasPromocoes, gridVitrine);
renderizarProdutos(roupasCadastradasMaisVendidos, gridVitrine2);

// CARROSSEL
// Mapeamento de elementos
const trilhaBanners = document.getElementById('trilha-banners');
const botAnterior = document.getElementById('bot-anterior');
const botProximo = document.getElementById('bot-proximo');
const banners = document.querySelector('.banner-slide');
const areaCarrossel = document.querySelector('.carrossel-banners');

//Variaveis de controle
let indiceAtual = 0; 
const totalBanners = banners.length;
let intervaloCarrossel; //autoplay

//Move o Carrossel
function atualizarCarrossel(){
    //Move a trilha pra esquerda usando o indice atual de base
    trilhaBanners.style.transform = `translateX(-${indiceAtual * 100})`;
}

//Funcoes das setas
function proximoBanner(){
    //Pula pro proximo poster. No último volta pro primeiro.
    indiceAtual = (indiceAtual + 1) % totalBanners;
    atualizarCarrossel();
}
function bannerAnterior(){
    //Volta um. No primeiro pula pro ultimo.
    indiceAtual = (indiceAtual - 1 + totalBanners) % totalBanners;
    atualizarCarrossel();
}

function iniciarAutoPlay(){
    intervaloCarrossel = setInterval(proximoBanner, 4000);
}
function pausarAutoPlay(){
    clearInterval(intervaloCarrossel);
}

// Listeners
botAbrirCarrinho.addEventListener('click', abrirCarrinho);
botFecharCarrinho.addEventListener('click', fecharCarrinho);
botProximo.addEventListener('click', proximoBanner);
botAnterior.addEventListener('click', bannerAnterior);
areaCarrossel.addEventListener('mouseenter', pausarAutoPlay);
areaCarrossel.addEventListener('mouseleave', iniciarAutoPlay);

iniciarAutoPlay();
