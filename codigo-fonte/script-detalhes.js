// Função para obter parâmetros da URL
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Função para buscar detalhes da série pela API usando o ID
async function fetchSeriesDetails(id) {
  const API_KEY = "c7c6fe86cf0a3577128a93aa338260b5";
  const BASE_URL = "https://api.themoviedb.org/3";
  const LANGUAGE = "pt-BR";

  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=credits,season`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar detalhes da série:", error);
  }
}

// Função para carregar o elenco com imagens e número de episódios
async function carregarInformacoes() {
  const id = getURLParameter("id"); // Obter o ID da URL

  if (id) {
    const serieData = await fetchSeriesDetails(id); // Buscar os detalhes da série

    if (serieData) {
      // Preencher os elementos com as informações da série
      document.getElementById("serieTitle").innerText = serieData.name;
      document.getElementById("sinopse").innerText = serieData.overview;
      document.getElementById(
        "serieImage"
      ).src = `https://image.tmdb.org/t/p/w500${serieData.poster_path}`;

      // Preencher outros detalhes como gêneros, plataformas, etc.
      const generos = serieData.genres.map((genre) => genre.name).join(", ");
      document.getElementById("generos").innerText = generos;

      // Preencher a seção de criação
      document.getElementById("criador").innerText = serieData.created_by
        .map((creator) => creator.name)
        .join(", ");

      // Exibir plataformas
      const plataformas = serieData.production_companies.map((company) => {
        return {
          logo: company.logo_path
            ? `https://image.tmdb.org/t/p/w500${company.logo_path}`
            : null,
        };
      });

      const plataformasContainer = document.getElementById("plataformas");
      plataformas.forEach((plataforma) => {
        const plataformaDiv = document.createElement("div");
        plataformaDiv.classList.add("plataforma");

        if (plataforma.logo) {
          plataformaDiv.innerHTML = `
                        <img src="${plataforma.logo}" alt="${plataforma.name}" class="plataforma-logo">
                    `;
        }

        plataformasContainer.appendChild(plataformaDiv);
      });

      // Calcular o número total de episódios da série
      const totalEpisodios = serieData.seasons.reduce(
        (total, temporada) => total + temporada.episode_count,
        0
      );

      // Carregar o elenco com número de episódios
      const elencoList = document.getElementById("elencoList");
      elencoList.classList.add("row", "g-2"); // Altere para 'g-2' ou 'g-1' para espaçamento menor

      // Limitar a 4 atores
      const elenco = serieData.credits.cast.slice(0, 4); // Pega os primeiros 4 atores

      elenco.forEach((actor) => {
        const actorCard = document.createElement("div");
        actorCard.classList.add("col-md-3", "col-6"); // Ajuste para 4 cards por linha

        // Exibir o número total de episódios para cada ator
        actorCard.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" class="card-img-top" alt="${actor.name}">
                        <div class="card-body">
                            <h4 class="card-title"><strong>${actor.name}</strong></h4>
                            <h5>${actor.character}</h5>
                            <p class="card-text">${totalEpisodios} episódios</p>
                        </div>
                    </div>
                `;
        elencoList.appendChild(actorCard);
      });
    }
  } else {
    console.error("ID da série não encontrado na URL");
  }
}

// Função para buscar detalhes das temporadas de acordo com o ID da série
async function fetchSeasons(id) {
  const API_KEY = "c7c6fe86cf0a3577128a93aa338260b5";
  const BASE_URL = "https://api.themoviedb.org/3";
  const LANGUAGE = "pt-BR";

  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=seasons`
    );
    const data = await response.json();
    return data.seasons; // Retorna as temporadas diretamente da resposta
  } catch (error) {
    console.error("Erro ao buscar temporadas:", error);
  }
}

// Função para carregar as temporadas e episódios
async function carregarTemporadas() {
  const id = getURLParameter("id"); // Obter o ID da série
  if (id) {
    const temporadas = await fetchSeasons(id); // Buscar as temporadas
    const temporadasList = document.getElementById("temporadasList");

    temporadas.forEach((temporada) => {
      const temporadaDiv = document.createElement("div");
      temporadaDiv.classList.add("temporada-item");

      // Criação do card da temporada
      temporadaDiv.innerHTML = `
                
                <img src="https://image.tmdb.org/t/p/w500${
                  temporada.poster_path
                }" alt="Poster da Temporada">
                <div class="descricao">
                    <h4>Temporada ${temporada.season_number}</h4>
                    <p>${temporada.overview}</p>
                    <p><strong>Ano:</strong> ${
                      temporada.air_date
                        ? temporada.air_date.split("-")[0]
                        : "Desconhecido"
                    } - <strong>${
        temporada.episode_count
      } Episódios</strong></p>
                </div>
            `;

      // Adiciona a temporada à lista
      temporadasList.appendChild(temporadaDiv);
    });
  } else {
    console.error("ID da série não encontrado na URL");
  }
}

// Função para truncar a descrição para 25 palavras
function truncateDescription(description, wordLimit = 25) {
  const words = description.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return description;
}

// Função para adicionar a série aos favoritos no db.json
async function adicionarAosFavoritos(serieData) {
  try {
    // Obter a lista atual de séries favoritas
    const responseGet = await fetch("http://localhost:3000/seriesFavoritas");
    const seriesFavoritas = await responseGet.json();

    // Verificar se a série já está na lista
    if (seriesFavoritas.some((favorito) => favorito.id === serieData.id)) {
      alert("Essa série já está nos favoritos!");
      return;
    }

    // Truncar a descrição para 25 palavras
    const descricaoTruncada = truncateDescription(serieData.overview);

    // Criar o objeto da série a ser adicionada
    const novaSerie = {
      id: serieData.id,
      nome: serieData.name,
      descricao: descricaoTruncada,
      link: `detalhes_${serieData.id}.html`, 
    };

    // Enviar o POST para adicionar ao JSON
    const responsePost = await fetch("http://localhost:3000/seriesFavoritas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaSerie),
    });

    if (responsePost.ok) {
      alert("Série adicionada aos favoritos com sucesso!");
    } else {
      alert("Erro ao adicionar a série aos favoritos.");
    }
  } catch (error) {
    console.error("Erro ao adicionar aos favoritos:", error);
  }
}

// Adicionar evento ao botão
document.getElementById("favoritosBtn").addEventListener("click", async () => {
  const id = getURLParameter("id"); // Obter o ID da série
  if (id) {
    const serieData = await fetchSeriesDetails(id); // Buscar detalhes da série
    if (serieData) {
      adicionarAosFavoritos(serieData); // Adicionar aos favoritos
    }
  } else {
    alert("Série não encontrada.");
  }
});

// Chamar a função para carregar as informações de temporadas e episódios assim que a página for carregada
document.addEventListener("DOMContentLoaded", () => {
  carregarInformacoes();
  carregarTemporadas();
});
