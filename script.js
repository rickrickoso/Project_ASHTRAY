/**Classe simuladora de consumo de API 
 * Isola a lógica de comunicação externa
 * buscarDados faz requisição HTTP assincrona pro JSON e transformar em objeto no JS 
*/

class DatabaseService {
    async buscarDados(url){
        try{
            const resposta = await fetch(url);
            if(!resposta.ok) throw new Error('Falha ao carregar os dados');
            return await resposta.json();
        } catch (erro){
            console.error("Erro no DatabaseService:", erro);
            return {promocoes: [], maisVendidos:[]};
        }
    }
}

/**Classe Comportamento - Carrinho Lateral  */

class CarrinhoLateral{
    /**Constructor monta a instancia da classe */
    constructor(botaoAbrirId, botaoFecharId, conteinerId) {
        /**this se refere a propria classe, igual o self do python */
        this.botaoAbrir = document.getElementById(botaoAbrirId);
        this.botaoFechar = document.getElementById(botaoFecharId);
        this.container = document.getElementById(conteinerId);

        this.inicializarEventos();
    }
    /** controlador */
    inicializarEventos(){
        if (this.botaoAbrir){
            this.botaoAbrir.addEventListener('click', () => this.abrir());
            this.botaoFechar.addEventListener('click', () => this.fechar())
        }
    }

    /**eventos */
    abrir(){
        this.container.classList.add('aberto');
    }

    fechar(){
        this.container.classList.remove('aberto');
    }
}

/**
 * Classe - Carrossel e Banners
 */
class Carrossel {
    constructor(trilhaId, botAnteriorId, botProximoId, areaId, seletorBanners){
        this.trilha = document.getElementById(trilhaId);
        this.botAnterior = document.getElementById(botAnteriorId);
        this.botProximo = document.getElementById(botProximoId);
        this.areaCarrossel = document.querySelector(areaId);
        this.banners = document.querySelectorAll(seletorBanners);

        this.indiceAtual = 0;
        this.totalBanners = this.banners.length;
        this.intervaloCarrossel = null;

        if (this.totalBanners > 0){
            this.inicializarEventos();
            this.iniciarAutoPlay();
        }
    }

    atualizarPosicao(){
        this.trilha.style.transform = `translateX(-${this.indiceAtual * 100}%)`;
    }

    proximo(){
        this.indiceAtual = (this.indiceAtual + 1) % this.totalBanners;
        this.atualizarPosicao();
    }

    anterior(){
        this.indiceAtual = (this.indiceAtual - 1 + this.totalBanners) % this.totalBanners;
        this.atualizarPosicao();
    }

    iniciarAutoPlay(){
        this.pausarAutoPlay(); // garante que intervalos nao vao se repetir
        this.intervaloCarrossel = setInterval(() => this.proximo(), 4000);
    }

    pausarAutoPlay(){
        clearInterval(this.intervaloCarrossel);
    }

    inicializarEventos(){
        //** Botoes do Carrossel */
        this.botProximo.addEventListener('click', () => {
            this.proximo();
            this.iniciarAutoPlay();
        });

        this.botAnterior.addEventListener('click', () => {
            this.anterior();
            this.iniciarAutoPlay();
        });

        this.areaCarrossel.addEventListener('mouseenter', () => this.pausarAutoPlay());
        this.areaCarrossel.addEventListener('mouseleave', () => this.iniciarAutoPlay());
    }
}       
/**Classe - Produtos <template> */
class RenderizadorProdutos{
    constructor (templateId, modalInstancia, carrinhoInstancia){
        this.template = document.getElementById(templateId);
        this.modal = modalInstancia;
        this.carrinho = carrinhoInstancia;
    }

    renderizar(listaDeRoupas, seletorContainer){
        const container = document.querySelector(seletorContainer);
        if (!container || !this.template) return;

        container.innerHTML = '';
        const fragmento = document.createDocumentFragment();

        listaDeRoupas.forEach((roupa) => {
            const clone = this.template.content.cloneNode(true);
            const cartao = clone.querySelector('.cartao-produto');

            const img = clone.querySelector('.produto-img');
            img.src = roupa.imagens ? roupa.imagens[0] : roupa.imagem;
            img.alt = roupa.nome;
            img.onerror = (evento) => {
                evento.target.onerror = null;
                evento.target.src = 'assets/placeholder.jpg';
            };
            
            clone.querySelector('.titulo-produto').textContent = roupa.nome;
            clone.querySelector('.preco-produto').textContent = roupa.preco;
            clone.querySelector('.bot-comprar').dataset.id = roupa.id;

            // Clique: Pop-up de Produto
            // Verifica se o elemento clicado foi o botão de compra
            cartao.addEventListener('click', (evento) => { 
                const clicouNoBotao = evento.target.closest('.bot-comprar');
                if (clicouNoBotao) {
                    const id = clicouNoBotao.dataset.id;
                    this.carrinho.adicionarItem(id);    
                    return;
            }
            // Se o clique foi em qualquer outro lugar do cartão, abre o modal
            this.modal.abrir(roupa);
        });
        fragmento.appendChild(clone);
    });
    container.appendChild(fragmento);
    }
}

/** Classe Inicialização do App */
class App {
    constructor(){
        // Serviços de Dados e Interface Básica
        this.dbService = new DatabaseService();
        this.carrinhoBarra = new CarrinhoLateral('bot-abrir-carrinho', 'bot-fechar-carrinho', 'carrinho-lateral');
        this.carrossel = new Carrossel('trilha-banners', 'bot-anterior', 'bot-proximo', '.carrossel-banners', '.banner-slide');
        
        // 1. Instancia o cérebro lógico (matemático) do carrinho
        this.gerenciadorCarrinho = new GerenciadorCarrinho();

        // 2. Passa o gerenciador de carrinho como parâmetro para o Modal e Renderizador
        this.modal = new ModalProduto(this.gerenciadorCarrinho);
        this.renderizador = new RenderizadorProdutos('template-cartao-produto', this.modal, this.gerenciadorCarrinho);
    }

    async iniciar() {
        const dados = await this.dbService.buscarDados('db.json');

        // Unifica os catálogos para o carrinho saber pesquisar todos os produtos
        const catalogoCompleto = [...dados.promocoes, ...dados.maisVendidos];
        this.gerenciadorCarrinho.setCatalogo(catalogoCompleto);

        this.renderizador.renderizar(dados.promocoes, '.vitrine-promocao .grid-produtos');
        this.renderizador.renderizar(dados.maisVendidos, '.vitrine-mais-vendidos .grid-produtos');
    }
}

/** Inicializa o sistema -> DOM carregada */
document.addEventListener('DOMContentLoaded', () => {
    const aplicacao = new App();
    aplicacao.iniciar();
});

/** Classe - Gerenciador do Modal de Produto */
class ModalProduto {
    constructor(carrinhoInstancia) {
        this.carrinho = carrinhoInstancia;
        this.overlay = document.getElementById('modal-produto');
        this.botFechar = document.getElementById('bot-fechar-modal');
        
        // Elementos de injeção de dados
        this.imgPrincipal = document.getElementById('modal-img-principal');
        this.titulo = document.getElementById('modal-titulo');
        this.preco = document.getElementById('modal-preco');
        this.parcelamento = document.getElementById('modal-parcelamento');
        this.tamanhos = document.getElementById('modal-tamanhos');
        this.cores = document.getElementById('modal-cores');
        this.botComprar = document.getElementById('modal-bot-comprar');

        // Controles de Galeria
        this.botAnterior = document.getElementById('modal-bot-anterior');
        this.botProximo = document.getElementById('modal-bot-proximo');
        
        this.imagensAtuais = [];
        this.indiceImagem = 0;

        this.inicializarEventos();
    }

    abrir(roupa) {
        // Preenche os dados
        this.titulo.textContent = roupa.nome;
        this.preco.textContent = roupa.preco;
        this.parcelamento.textContent = roupa.parcelamento || ''; // Trata se não existir
        this.tamanhos.textContent = roupa.tamanhos ? roupa.tamanhos.join(', ') : 'Único';
        this.cores.textContent = roupa.cores ? roupa.cores.join(', ') : 'Padrão';
        this.botComprar.dataset.id = roupa.id;

        // Configura a Galeria
        this.imagensAtuais = roupa.imagens || [roupa.imagem]; // Aceita o array novo ou a imagem antiga
        this.indiceImagem = 0;
        this.atualizarImagem();

        // Mostra o Modal
        this.overlay.classList.add('ativo');
    }

    fechar() {
        this.overlay.classList.remove('ativo');
    }

    atualizarImagem() {
        this.imgPrincipal.src = this.imagensAtuais[this.indiceImagem];
    }

    navegarGaleria(direcao) {
        this.indiceImagem = (this.indiceImagem + direcao + this.imagensAtuais.length) % this.imagensAtuais.length;
        this.atualizarImagem();
    }

    inicializarEventos() {
        // Fecha no botão X
        this.botFechar.addEventListener('click', () => this.fechar());
        
        // Fecha clicando fora do modal (no fundo preto)
        this.overlay.addEventListener('click', (evento) => {
            if (evento.target === this.overlay) this.fechar();
        });

        // Setas da galeria (1 para direita, -1 para esquerda)
        this.botProximo.addEventListener('click', () => this.navegarGaleria(1));
        this.botAnterior.addEventListener('click', () => this.navegarGaleria(-1));

        // PROTEÇÃO: Placeholder para imagens quebradas na galeria
        this.imgPrincipal.onerror = (evento) => {
            evento.target.onerror = null; 
            evento.target.src = 'assets/placeholder.jpg';
        };
        // Adiciona o item no carrinho
        this.botComprar.addEventListener('click', () => {
            const id = this.botComprar.dataset.id;
            this.carrinho.adicionarItem(id);
            this.fechar();            
        });
    }
}

/** Classe - Gerenciador de Compras e Totais */
class GerenciadorCarrinho {
    constructor() {
        this.itens = []; 
        this.conteudoCarrinho = document.querySelector('.carrinho-conteudo');
        this.catalogo = []; 
    }

    setCatalogo(produtos) {
        this.catalogo = produtos;
    }

    adicionarItem(idProduto) {
        const produto = this.catalogo.find(item => item.id === parseInt(idProduto));

        if (produto) {
            this.itens.push(produto);
            this.atualizarInterface();
            document.getElementById('carrinho-lateral').classList.add('aberto');
        }
    }

    atualizarInterface() {
        if (this.itens.length === 0) {
            this.conteudoCarrinho.innerHTML = '<p>O carrinho está vazio.</p>';
            return;
        }

        this.conteudoCarrinho.innerHTML = ''; 
        let total = 0;

        this.itens.forEach((item, index) => {
            const precoNumerico = parseFloat(item.preco.replace('R$ ', '').replace(',', '.'));
            total += precoNumerico;

            const divItem = document.createElement('div');
            divItem.style.display = 'flex';
            divItem.style.gap = '10px';
            divItem.style.marginBottom = '15px';
            divItem.style.borderBottom = '1px solid #eee';
            divItem.style.paddingBottom = '10px';

            divItem.innerHTML = `
                <img src="${item.imagens ? item.imagens[0] : item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1; text-align: left;">
                    <p style="font-weight: bold; font-size: 0.9rem; margin-bottom: 5px;">${item.nome}</p>
                    <p style="color: var(--cor-primaria);">${item.preco}</p>
                </div>
            `;
            this.conteudoCarrinho.appendChild(divItem);
        });

        const divTotal = document.createElement('div');
        divTotal.style.marginTop = '20px';
        divTotal.style.fontWeight = 'bold';
        divTotal.style.fontSize = '1.2rem';
        divTotal.innerHTML = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
        this.conteudoCarrinho.appendChild(divTotal);
    }
}
