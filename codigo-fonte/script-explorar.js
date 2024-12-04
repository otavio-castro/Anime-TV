const API_KEY = 'c7c6fe86cf0a3577128a93aa338260b5'; // Substitua com sua chave da API do The Movie DB
const BASE_URL = 'https://api.themoviedb.org/3';
let categorias = [];

// Função para buscar séries populares
async function fetchPopularSeries(categoria = '') {
    let url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
    if (categoria) {
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${categoria}&page=1`;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

// Função para gerar os cards
async function gerarCards(categorias = '') {
    let url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`;

    if (categorias) {
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${categorias}&page=1`;
    }

    const response = await fetch(url);
    const data = await response.json();
    const series = data.results;

    const explorarSeriesDiv = document.getElementById('explorarSeries');
    explorarSeriesDiv.innerHTML = ''; // Limpar a lista de séries antes de adicionar novas

    series.slice(0, 25).forEach(serie => {
        if (serie.poster_path && serie.name && serie.overview && serie.id !== 95897 && serie.id !== 94722) {
            const descricaoLimitada = serie.overview.length > 150 ? serie.overview.substring(0, 150) + '...' : serie.overview;
            const isAnime = serie.genre_ids.includes(16);

            const serieCard = document.createElement('div');
            serieCard.classList.add('col-md-3', 'col-12');

            const cardHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="card-img-top" alt="${serie.name}">
                    <div class="card-body">
                        <h5 class="card-title text-danger">${serie.name}</h5>
                        <p class="card-text">${descricaoLimitada}</p>
                        <button type="button" class="btn btn-danger">
                            <a href="detalhes.html?id=${serie.id}" class="text-light text-decoration-none">
                                Assistir <i class="fa-solid fa-play"></i>
                            </a>
                        </button>
                    </div>
                </div>
            `;

            if (isAnime) {
                serieCard.classList.add('anime-card');
                serieCard.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="card-img-top" alt="${serie.name}">
                        <div class="card-body">
                            <h5 class="card-title text-warning">${serie.name}</h5>
                            <p class="card-text">${descricaoLimitada}</p>
                            <button type="button" class="btn btn-warning">
                                <a href="detalhes.html?id=${serie.id}" class="text-dark text-decoration-none">
                                    Assistir <i class="fa-solid fa-play"></i>
                                </a>
                            </button>
                        </div>
                    </div>
                `;
            }

            serieCard.innerHTML = cardHTML;
            explorarSeriesDiv.appendChild(serieCard);
        }
    });
}

// Função para aplicar o filtro de categorias
function filtrarPorCategoria() {
    let categoriasID = {
        'Comédia': 35,
        'Drama': 18,
        'Romance': 10749,
        'Desenhos': 16,
        'Documentário': 99
    };

    // Obter todas as categorias selecionadas
    const categoriasSelecionadas = [];
    document.querySelectorAll('.category input[type="checkbox"]:checked').forEach(checkbox => {
        const categoria = checkbox.parentElement.textContent.trim();
        categoriasSelecionadas.push(categoriasID[categoria]);
    });

    // Gerar cards com base nas categorias selecionadas
    gerarCards(categoriasSelecionadas.join(','));
}

// Função para carregar as séries ao abrir a página
async function carregarSeries() {
    const explorarSeriesDiv = document.getElementById('explorarSeries');
    explorarSeriesDiv.innerHTML = ''; // Limpar qualquer conteúdo antes de carregar novas séries
    
    // Garantir que o checkbox de "Desenhos" esteja marcado ao carregar a página
    document.querySelector('input[type="checkbox"][onclick="filtrarPorCategoria(\'Desenhos\')"]').checked = true;
    
    // Filtra automaticamente por "Desenhos" (ID 16) ao carregar a página
    filtrarPorCategoria();
}

// Função de pesquisa para filtrar as séries conforme digitado
async function pesquisarSeries() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    // Se o campo de pesquisa estiver vazio, recarrega todas as séries
    if (searchTerm === '') {
        filtrarPorCategoria();
        return;
    }

    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${searchTerm}&page=1`;

    const response = await fetch(url);
    const data = await response.json();
    const series = data.results;

    const explorarSeriesDiv = document.getElementById('explorarSeries');
    explorarSeriesDiv.innerHTML = ''; // Limpar a lista de séries antes de adicionar novas

    series.slice(0, 25).forEach(serie => {
        if (serie.poster_path && serie.name && serie.overview && serie.id !== 95897 && serie.id !== 94722) {
            const descricaoLimitada = serie.overview.length > 150 ? serie.overview.substring(0, 150) + '...' : serie.overview;
            const isAnime = serie.genre_ids.includes(16);

            const serieCard = document.createElement('div');
            serieCard.classList.add('col-md-3', 'col-12');

            const cardHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="card-img-top" alt="${serie.name}">
                    <div class="card-body">
                        <h5 class="card-title text-danger">${serie.name}</h5>
                        <p class="card-text">${descricaoLimitada}</p>
                        <button type="button" class="btn btn-danger">
                            <a href="detalhes.html?id=${serie.id}" class="text-light text-decoration-none">
                                Assistir <i class="fa-solid fa-play"></i>
                            </a>
                        </button>
                    </div>
                </div>
            `;

            if (isAnime) {
                serieCard.classList.add('anime-card');
                serieCard.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w500${serie.poster_path}" class="card-img-top" alt="${serie.name}">
                        <div class="card-body">
                            <h5 class="card-title text-warning">${serie.name}</h5>
                            <p class="card-text">${descricaoLimitada}</p>
                            <button type="button" class="btn btn-warning">
                                <a href="detalhes.html?id=${serie.id}" class="text-dark text-decoration-none">
                                    Assistir <i class="fa-solid fa-play"></i>
                                </a>
                            </button>
                        </div>
                    </div>
                `;
            }

            serieCard.innerHTML = cardHTML;
            explorarSeriesDiv.appendChild(serieCard);
        }
    });
}

// Carregar as séries ao abrir a página
document.addEventListener('DOMContentLoaded', carregarSeries);



