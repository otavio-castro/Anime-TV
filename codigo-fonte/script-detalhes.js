function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

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

async function carregarInformacoes() {
  const id = getURLParameter("id"); 

  if (id) {
    const serieData = await fetchSeriesDetails(id);

    if (serieData) {
      document.getElementById("serieTitle").innerText = serieData.name;
      document.getElementById("sinopse").innerText = serieData.overview;
      document.getElementById(
        "serieImage"
      ).src = `https://image.tmdb.org/t/p/w500${serieData.poster_path}`;

      const generos = serieData.genres.map((genre) => genre.name).join(", ");
      document.getElementById("generos").innerText = generos;


      document.getElementById("criador").innerText = serieData.created_by
        .map((creator) => creator.name)
        .join(", ");

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

      const totalEpisodios = serieData.seasons.reduce(
        (total, temporada) => total + temporada.episode_count,
        0
      );

    
      const elencoList = document.getElementById("elencoList");
      elencoList.classList.add("row", "g-2");


      const elenco = serieData.credits.cast.slice(0, 4);

      elenco.forEach((actor) => {
        const actorCard = document.createElement("div");
        actorCard.classList.add("col-md-3", "col-6");

        actorCard.innerHTML = `
    <div class="card elenco-card">
      <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" class="card-img-top" alt="${actor.name}">
      <div class="card-body">
        <h4 class="card-title">${actor.name}</h4>
        <h5">${actor.character}</h5>
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

async function fetchSeasons(id) {
  const API_KEY = "c7c6fe86cf0a3577128a93aa338260b5";
  const BASE_URL = "https://api.themoviedb.org/3";
  const LANGUAGE = "pt-BR";

  try {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=seasons`
    );
    const data = await response.json();
    return data.seasons;
  } catch (error) {
    console.error("Erro ao buscar temporadas:", error);
  }
}


async function carregarTemporadas() {
  const id = getURLParameter("id"); 
  if (id) {
    const temporadas = await fetchSeasons(id); 
    const temporadasList = document.getElementById("temporadasList");

    temporadas.forEach((temporada) => {
      const temporadaDiv = document.createElement("div");
      temporadaDiv.classList.add("temporada-item");

      temporadaDiv.innerHTML = `
                
                <img src="https://image.tmdb.org/t/p/w500${
                  temporada.poster_path
                }" alt="Poster da Temporada">
                <div class="descricao">
                    <h4 class ="text-primary">Temporada ${temporada.season_number}</h4>
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

      temporadasList.appendChild(temporadaDiv);
    });
  } else {
    console.error("ID da série não encontrado na URL");
  }
}

function truncateDescription(description, wordLimit = 25) {
  const words = description.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return description;
}


async function adicionarAosFavoritos(serieData) {
  try {
  
    const responseGet = await fetch("http://localhost:3000/seriesFavoritas");
    const seriesFavoritas = await responseGet.json();


    if (seriesFavoritas.some((favorito) => favorito.id === serieData.id)) {
      alert("Essa série já está nos favoritos!");
      return;
    }


    const descricaoTruncada = truncateDescription(serieData.overview);


    const novaSerie = {
      id: serieData.id,
      nome: serieData.name,
      descricao: descricaoTruncada,
      link: `detalhes_${serieData.id}.html`,
    };

   
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
  const id = getURLParameter("id"); 
  if (id) {
    const serieData = await fetchSeriesDetails(id); 
    if (serieData) {
      adicionarAosFavoritos(serieData); 
    }
  } else {
    alert("Série não encontrada.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  carregarInformacoes();
  carregarTemporadas();
});

