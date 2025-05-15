const results = document.getElementById("results");
const searchInput = document.getElementById("search-input");

const dialog = document.getElementById("popup-dialog");
const characterTitle = document.getElementById("character-title");
const dialogContent = document.getElementById("dialog-content");
const closeDialogButton = document.getElementById("close-dialog");

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://swapi.py4e.com/api/people")
    .then(resp => {
      if (!resp.ok) {
        throw new Error("Network response was not ok");
      }
      return resp.json();
    })
    .then(data => {
      if (data.count >= 1) {
        displayCharacters(data.results);
      } else {
        displayError();
      }
    })
    .catch(error => {
      console.error("There was a problem with the fetch operation:", error);
      displayError();
    });
});

function displayCharacters(characters) {
  if (characters.length === 0) {
    displayError();
    return;
  }

  const listOfNames = characters.map(character => {
    return `<li><a href="#" data-url="${character.url}">${character.name}</a></li>`;
  }).join(" ");

  results.innerHTML = `<ul class="characters">${listOfNames}</ul>`;

  const links = document.querySelectorAll('.characters a');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const characterUrl = link.getAttribute('data-url');
      openCharacterDialog(characterUrl);
    });
  });
}

function displayError() {
  results.innerHTML = "<ul class='characters'><li>The characters you seek are not here</li></ul>";
}

async function searchForCharacter(query) {
  try {
    const characterData = await fetch(`https://swapi.py4e.com/api/people?search=${query}`)
      .then(resp => resp.json());

    if (characterData.count >= 1) {
      displayCharacters(characterData.results);
    } else {
      displayError();
    }
  } catch (error) {
    console.error("Search error:", error);
    displayError();
  }
}

const debouncedCharacterSearch = debounce(searchForCharacter, 500);

searchInput.addEventListener("input", function (e) {
  const input = e.target.value.trim();
  if (input.length >= 1) {
    debouncedCharacterSearch(input);
  }
});

function openCharacterDialog(url) {
  dialogContent.innerHTML = "Loading...";
  dialog.showModal();

  fetch(url)
    .then(response => response.json())
    .then(data => {
      characterTitle.textContent = data.name;

      dialogContent.innerHTML = `
        <p><strong>Height:</strong> ${data.height} cm</p>
        <p><strong>Mass:</strong> ${data.mass} kg</p>
        <p><strong>Hair Color:</strong> ${data.hair_color}</p>
        <p><strong>Skin Color:</strong> ${data.skin_color}</p>
        <p><strong>Eye Color:</strong> ${data.eye_color}</p>
        <p><strong>Birth Year:</strong> ${data.birth_year}</p>
        <p><strong>Gender:</strong> ${data.gender}</p>
      `;
    })
    .catch(error => {
      dialogContent.innerHTML = "Failed to load character details.";
      console.error(error);
    });
}

closeDialogButton.addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

dialog.addEventListener("close", () => {
  characterTitle.innerText = "";
  dialogContent.innerHTML = "Loading...";
});
