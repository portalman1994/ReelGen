async function findUPCInJSON(filePath, searchTerm, searchColumn, upcColumn, titleColumn, imageColumn) {
  try {
      const response = await fetch(filePath);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json(); // Parse JSON

      const results = [];
      const titles = [];
      const images = [];

      for (const item of jsonData) {
          if (item[searchColumn]) {
              const title = String(item[searchColumn]).trim().toLowerCase();
              const search = searchTerm.trim().toLowerCase();

              if (title.includes(search)) {
                  if (item[upcColumn] && item[titleColumn] && item[imageColumn]) {
                      const upcValue = String(item[upcColumn]).trim();
                      const imageFile = "images/" + String(imagesitem[imageColumn]) + ".webp";
                      if (!upcValue.toLowerCase().includes("scraping failed")) {
                          results.push(upcValue);
                          titles.push(String(item[titleColumn]).trim());
                          images.push(imageFile); // Construct image path
                      }
                  }
              }
          }
      }
      return { upcs: results, titles: titles, images: images };
  } catch (error) {
      console.error('Error reading JSON:', error);
      return null;
  }
}

function displayBarcodes(upcs, titles, images) {
  const movieList = document.getElementById("movie-list");
  const fullScreenBarcodeContainer = document.getElementById("full-screen-barcode-container");

  upcs.forEach((upc, index) => {
    if (upc.length === 12) {

      // Add movie title below barcode
      const movieContainer = document.createElement("div");
      movieContainer.classList.add("movie-container");

      const icon = document.createElement('i');
      icon.classList.add('hover-icon');
      icon.classList.add('fa-solid', 'fa-barcode'); // Example: Font Awesome play icon
      movieContainer.appendChild(icon);

      const posterImg = document.createElement("img");
      posterImg.src = images[index];
      posterImg.alt = titles[index] + " Poster";
      posterImg.classList.add("movie-poster");

      posterImg.onerror = function () {
        posterImg.src = "images/backup.webp"; // Replace with your backup image path
        posterImg.alt = "Backup Poster";
      };

      const titleDiv = document.createElement("div");
      titleDiv.textContent = titles[index];
      titleDiv.classList.add("movie-title");

      movieContainer.appendChild(posterImg);
      movieContainer.appendChild(titleDiv);
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
  const searchColumnKey = "Title"; // Replace with your JSON keys
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


        const results = await findUPCInJSON(FilePath, searchTerm, searchColumnKey, upcColumnKey, titleColumnKey, imageColumnKey);

        if (results && results.upcs.length > 0) {
          results.upcs.forEach(upc => {
            console.log(`UPC: ${upc}`);
          });
          displayBarcodes(results.upcs, results.titles, results.images);
        } else {
          document.getElementById('movie-list').textContent = `"${searchTerm}" not found in JSON.`;
        }
      });

      searchInput.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
          const searchTerm = searchInput.value;

          document.getElementById('movie-list').innerHTML = "";
          document.getElementById('full-screen-barcode-container').style.display = "none";


          const results = await findUPCInJSON(FilePath, searchTerm, searchColumnKey, upcColumnKey, titleColumnKey, imageColumnKey);

          if (results && results.upcs.length > 0) {
            results.upcs.forEach(upc => {
              console.log(`UPC: ${upc}`);
            });
            displayBarcodes(results.upcs, results.titles, results.images);
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
