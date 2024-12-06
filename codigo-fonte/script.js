const API_KEY = "c7c6fe86cf0a3577128a93aa338260b5";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const LANGUAGE = "pt-BR";

// Nomes das séries para o carrossel
const seriesNames = ["Arcane", "Castlevania", "Avatar: The Last Airbender"];

// IDs das séries para os cards
const seriesIDs = [240411, 235758, 236994, 72517];

// Função para buscar séries pelo nome (carrossel)
async function fetchSeriesByName(name) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&language=${LANGUAGE}&query=${name}`
    );
    const data = await response.json();
    return data.results[0]; // Retorna a primeira série encontrada
  } catch (error) {
    console.error(`Erro ao buscar a série ${name}:`, error);
  }
}

// Função para buscar séries pelo ID (cards)
async function fetchSeriesData(ids) {
  return await Promise.all(
    ids.map((id) =>
      fetch(
        `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}`
      ).then((response) => response.json())
    )
  );
}

// Renderizar o carrossel
async function renderSelectedSeries() {
  const carouselInner = document.querySelector(".carousel-inner");
  const carouselIndicators = document.querySelector(".carousel-indicators");

  carouselInner.innerHTML = "";
  carouselIndicators.innerHTML = "";

  for (let i = 0; i < seriesNames.length; i++) {
    const name = seriesNames[i];
    const seriesData = await fetchSeriesByName(name);

    if (!seriesData) continue;

    const isActive = i === 0 ? "active" : "";

    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.setAttribute("data-bs-target", "#carouselExampleCaptions");
    indicator.setAttribute("data-bs-slide-to", i);
    indicator.className = isActive;
    indicator.setAttribute("aria-current", isActive ? "true" : "");
    indicator.setAttribute("aria-label", `Slide ${i + 1}`);
    carouselIndicators.appendChild(indicator);

    const carouselItem = document.createElement("div");
    carouselItem.className = `carousel-item ${isActive}`;

    const image = document.createElement("img");
    image.src = `${IMAGE_BASE_URL}${seriesData.backdrop_path.replace('/w500/', '/original/')}`;
    image.className = "d-block w-100";
    image.alt = seriesData.name;

    const link = document.createElement("a");
    link.href = `detalhes.html?id=${seriesData.id}`;
    link.className = "stretched-link"; 

    const caption = document.createElement("div");
    caption.className = "carousel-caption d-none d-md-block";
    caption.innerHTML = `
      <h5>${seriesData.name}</h5>
      <p>${seriesData.overview}</p>
    `;

    carouselItem.appendChild(link); 
    link.appendChild(image); 
    carouselItem.appendChild(caption);

    carouselInner.appendChild(carouselItem);
  }
}
function limitarDescricao(descricao, limite = 25) {
  const palavras = descricao.split(" ");
  if (palavras.length > limite) {
    return palavras.slice(0, limite).join(" ") + "..."; 
  }
  return descricao; 
}


// Renderizar os cards
function renderSeriesCards(series) {
  const seriesCardsContainer = document.getElementById("seriesCards");
  seriesCardsContainer.innerHTML = ""; 

  series.forEach((serie) => {
    const { name, overview, poster_path, id } = serie;

   
    const descricaoLimitada = limitarDescricao(overview, 40);

    
    const cardHTML = `
<div class="col-md-3 col-12">
  <div class="card">
    <img src="https://image.tmdb.org/t/p/w500${poster_path}" class="card-img-top" alt="${name}">
    <div class="card-body">
      <h5 class="card-title text-danger">${name}</h5>
      <p class="card-text">${descricaoLimitada}</p>
      <button type="button" class="btn btn-primary">
        <a href="detalhes.html?id=${id}" class="text-light text-decoration-none">
          Assistir <i class="fa-solid fa-play"></i>
        </a>
      </button>
    </div>
  </div>
</div>
`;

    seriesCardsContainer.insertAdjacentHTML("beforeend", cardHTML);
  });
}


async function init() {
  await renderSelectedSeries();
  const series = await fetchSeriesData(seriesIDs); 
  renderSeriesCards(series); 
}


async function fetchAlunoData() {
  try {
    const response = await fetch("db.json");
    const data = await response.json();
    return data.aluno;
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  }
}


async function renderAlunoInfo() {
  const aluno = await fetchAlunoData();

  if (aluno) {
    
    document.querySelector(".aluno .col-md-8 p").textContent = aluno.sobre;
    document.querySelector(
      ".aluno .col-md-4 .info p:nth-child(1)"
    ).innerHTML = `<strong>Aluno:</strong> ${aluno.nome}`;
    document.querySelector(
      ".aluno .col-md-4 .info p:nth-child(2)"
    ).innerHTML = `<strong>Curso:</strong> ${aluno.curso}`;
    document.querySelector(
      ".aluno .col-md-4 .info p:nth-child(3)"
    ).innerHTML = `<strong>Turma:</strong> ${aluno.turma}`;
    document.querySelector(".aluno .col-md-4 img").src = aluno.foto_autoria;

  
    const linkedinLink = document.querySelector(".redes a:first-child");
    const instagramLink = document.querySelector(".redes a:last-child");
    linkedinLink.setAttribute("href", aluno.redes_sociais.linkedin);
    instagramLink.setAttribute("href", aluno.redes_sociais.instagram);
  }
}


function carregarSeries() {
  fetch("db.json") 
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("serie-cards");

     
      data.seriesFavoritas.forEach((serie) => {
       
        fetch(
          `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
            serie.nome
          )}&language=pt-BR`
        )
          .then((response) => response.json())
          .then((apiData) => {
            if (apiData.results && apiData.results.length > 0) {
           
              serie.imagem = IMAGE_BASE_URL + apiData.results[0].poster_path;
            } else {
      
              serie.imagem = "img/cards/default_image.png";
            }

            const card = document.createElement("div");
            card.classList.add("col");

            card.innerHTML = `
                <div class="card">
                  <img src="${serie.imagem}" class="card-img-top" alt="${serie.nome}">
                  <div class="card-body">
                    <h5 class="card-title">${serie.nome}</h5>
                    <p class="card-text">${serie.descricao}</p>
                    <button type="button" class="btn btn-primary">
        <a href="detalhes.html?id=${serie.id}" class="text-light text-decoration-none">
          Assistir <i class="fa-solid fa-play"></i>
        </a>
      </button>

                  </div>
                </div>
              `;

           
            container.appendChild(card);
          })
          .catch((error) => {
            console.error("Erro ao buscar imagem da API:", error);
       
            serie.imagem = "img/cards/default_image.png";

            const card = document.createElement("div");
            card.classList.add("col");

            card.innerHTML = `
                <div class="card">
                  <img src="${serie.imagem}" class="card-img-top" alt="${
              serie.nome
            }">
                  <div class="card-body">
                   <h5 class="card-title text-crimson">${serie.nome}</h5>
                    <p class="card-text">${serie.descricao}</p>
                    <button type="button" class="btn btn-danger">
                      <a href="detalhes_${serie.nome
                        .toLowerCase()
                        .replace(
                          /\s+/g,
                          "_"
                        )}.html" class="text-light text-decoration-none">
                        Assistir <i class="fa-solid fa-play"></i>
                      </a>
                    </button>
                  </div>
                </div>
              `;

 
            container.appendChild(card);
          });
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar o arquivo JSON:", error);
    });
}

document.addEventListener(
  "DOMContentLoaded",
  init,
  renderAlunoInfo(),
  carregarSeries()
);
