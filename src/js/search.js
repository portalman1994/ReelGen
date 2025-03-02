async function findUPCInJSON(filePath, searchTerm, yearColumn, upcColumn, titleColumn, imageColumn) {
  try {
      const response = await fetch(filePath);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json(); // Parse JSON

      const results = [];
      const titles = [];
      const images = [];
      const years = [];

      for (const item of jsonData) {
          if (item[titleColumn]) {
              const title = String(item[titleColumn]).trim().toLowerCase();
              const search = searchTerm.trim().toLowerCase();

              if (title.includes(search)) {
                  if (item[upcColumn] && item[titleColumn] && item[imageColumn]) {
                      const upcValue = String(item[upcColumn]).trim();
                      const imageFile = "images/" + String(item[imageColumn]) + ".webp";
                      if (!upcValue.toLowerCase().includes("scraping failed")) {
                          results.push(upcValue);
                          titles.push(String(item[titleColumn]).trim());
                          images.push(imageFile);
                          years.push(String(item[yearColumn]).trim())
                      }
                  }
              }
          }
      }
      return { upcs: results, titles: titles, years: years, images: images };
  } catch (error) {
      console.error('Error reading JSON:', error);
      return null;
  }
}

function displayBarcodes(upcs, titles, years, images) {
  const movieList = document.getElementById("movie-list");
  const fullScreenBarcodeContainer = document.getElementById("full-screen-barcode-container");

  upcs.forEach((upc, index) => {
    if (upc.length === 12 || upc.length === 11) {

      // Add movie title below barcode
      const movieContainer = document.createElement("div");
      movieContainer.classList.add("movie-container");

      const posterContainer = document.createElement("div");
      posterContainer.classList.add("movie-poster");

      const posterImg = document.createElement("img");
      posterImg.src = images[index];
      posterImg.alt = titles[index] + " Poster";

      posterImg.onerror = function () {
        posterImg.src = "images/backup.webp"; // Replace with your backup image path
        posterImg.alt = "Backup Poster";
      };
      
      posterContainer.appendChild(posterImg);
      
      const icon = document.createElement('i');
      icon.classList.add('hover-icon');
      icon.classList.add('fa-solid', 'fa-barcode'); // Example: Font Awesome play icon
      posterContainer.appendChild(icon);

      const titleDiv = document.createElement("div");
      titleDiv.textContent = titles[index];
      titleDiv.classList.add("movie-title");
      const fullTitle = titles[index];
      titleDiv.setAttribute('title', fullTitle);

      const yearDiv = document.createElement("div");
      yearDiv.textContent = years[index];
      yearDiv.classList.add("movie-year");

      movieContainer.appendChild(posterContainer);
      movieContainer.appendChild(titleDiv);
      movieContainer.appendChild(yearDiv);
      movieList.appendChild(movieContainer);

      movieContainer.addEventListener("click", () => {
        JsBarcode(`#full-screen-barcode`, upc, {
          format: 'UPC',
          displayValue: true,
          width: 5,
          height: 400,
          margin: 10,
        });
        fullScreenBarcodeContainer.style.display = "flex"; // Show the large image
      });

      // Add click event to close the large image
      fullScreenBarcodeContainer.addEventListener("click", () => {
        fullScreenBarcodeContainer.style.display = "none"; // Hide the large image
      });

    }
  });
}

async function search() {
  const FilePath = "src/data/upc.json";
  const yearColumnKey = "Year";
  const upcColumnKey = "upc";
  const titleColumnKey = "Title";
  const imageColumnKey = "id";


  document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const clearButton = document.querySelector('.clear-button');

    if (searchInput && searchButton) {
      searchButton.addEventListener('click', async function () {
        const searchTerm = searchInput.value;

        document.getElementById('movie-list').innerHTML = "";
        document.getElementById('full-screen-barcode-container').style.display = "none";


        const results = await findUPCInJSON(FilePath, searchTerm, yearColumnKey, upcColumnKey, titleColumnKey, imageColumnKey);

        if (results && results.upcs.length > 0) {
          results.upcs.forEach(upc => {
            console.log(`UPC: ${upc}`);
          });
          displayBarcodes(results.upcs, results.titles, results.years, results.images);
        } else {
          document.getElementById('movie-list').textContent = `"${searchTerm}" not found in JSON.`;
        }
      });

      searchInput.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
          const searchTerm = searchInput.value;

          document.getElementById('movie-list').innerHTML = "";
          document.getElementById('full-screen-barcode-container').style.display = "none";


          const results = await findUPCInJSON(FilePath, searchTerm, yearColumnKey, upcColumnKey, titleColumnKey, imageColumnKey);

          if (results && results.upcs.length > 0) {
            results.upcs.forEach(upc => {
              console.log(`UPC: ${upc}`);
            });
            displayBarcodes(results.upcs, results.titles, results.years, results.images);
          } else {
            document.getElementById('movie-list').textContent = `"${searchTerm}" not found in JSON.`;
          }
        }
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          searchInput.value = "";
          searchInput.focus();
        });
      }
    } else {
      console.error('Search elements not found!');
    }
  });
}

search();
