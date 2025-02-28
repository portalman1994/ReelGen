async function findUPCInCSV(csvFilePath, searchTerm, searchColumnIndex, upcColumnIndex, titleColumnIndex, imageColumnIndex) {
  try {
    const response = await fetch(csvFilePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const rows = csvText.split('\n');
    const results = [];
    const titles = [];
    const images = [];

    for (const row of rows) {
      const columns = parseCSVRow(row);
      if (columns[searchColumnIndex]) {
        const title = columns[searchColumnIndex].trim().toLowerCase();
        const search = searchTerm.trim().toLowerCase();
        const image = `${columns[imageColumnIndex]}.jpg`
        if (title.includes(search)) {
          if (columns[upcColumnIndex] && columns[titleColumnIndex]) {
            const upcValue = columns[upcColumnIndex].trim();
            if (!upcValue.toLowerCase().includes("scraping failed")) {
              results.push(columns[upcColumnIndex].trim());
              titles.push(columns[titleColumnIndex].trim());
              images.push(image);
            }
          }
        }
      }
    }
    return { upcs: results, titles: titles, images: images };
  } catch (error) {
    console.error('Error reading CSV:', error);
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
      posterImg.src = `./images/${images[index]}`;
      posterImg.alt = titles[index] + " Poster";
      posterImg.classList.add("movie-poster");

      posterImg.onerror = function () {
        posterImg.src = "./images/backup.jpg"; // Replace with your backup image path
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
  const csvFilePath = "src/data/upc.csv";
  const searchColumnIndex = 1;
  const upcColumnIndex = 3;
  const titleColumnIndex = 1;
  const imageColumnIndex = 0;

  document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const clearButton = document.querySelector('.clear-button');

    if (searchInput && searchButton) {
      searchButton.addEventListener('click', async function () {
        const searchTerm = searchInput.value;

        document.getElementById('movie-list').innerHTML = "";
        document.getElementById('full-screen-barcode-container').style.display = "none";


        const results = await findUPCInCSV(csvFilePath, searchTerm, searchColumnIndex, upcColumnIndex, titleColumnIndex, imageColumnIndex);

        if (results && results.upcs.length > 0) {
          results.upcs.forEach(upc => {
            console.log(`UPC: ${upc}`);
          });
          displayBarcodes(results.upcs, results.titles, results.images);
        } else {
          document.getElementById('movie-list').textContent = `"${searchTerm}" not found in CSV.`;
        }
      });

      searchInput.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
          const searchTerm = searchInput.value;

          document.getElementById('movie-list').innerHTML = "";
          document.getElementById('full-screen-barcode-container').style.display = "none";


          const results = await findUPCInCSV(csvFilePath, searchTerm, searchColumnIndex, upcColumnIndex, titleColumnIndex, imageColumnIndex);

          if (results && results.upcs.length > 0) {
            results.upcs.forEach(upc => {
              console.log(`UPC: ${upc}`);
            });
            displayBarcodes(results.upcs, results.titles, results.images);
          } else {
            document.getElementById('movie-list').textContent = `"${searchTerm}" not found in CSV.`;
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

function parseCSVRow(row) {
  const columns = [];
  let currentValue = '';
  let inQuotes = false;

  for (let char of row) {
    if (char === '"') {
      inQuotes = !inQuotes; // Toggle inQuotes state
    } else if (char === ',' && !inQuotes) {
      columns.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  columns.push(currentValue.trim()); // Add the last column

  return columns;
}

search();
