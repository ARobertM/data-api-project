// TEST
console.log("10")

//Video Loop Background
const video = document.querySelector('#video');
const apiUrl = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
const datasets = ['sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB', 'demo_mlexpec?sex=T&age=Y1', 'demo_pjan?sex=T&age=TOTAL'];
const countries = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'];

// Luam datele din JSON pt a le afisa in primimul tabel
fetch('media/date.json')
  .then(response => response.json())
  .then(data => {
    const table = document.querySelector('.table tbody');

    data.forEach(item => {
      const row = table.insertRow();
      const taraCell = row.insertCell(0);
      const anCell = row.insertCell(1);
      const indicatorCell = row.insertCell(2);
      const valoareCell = row.insertCell(3);

      taraCell.innerHTML = item.tara;
      anCell.innerHTML = item.an;
      indicatorCell.innerHTML = item.indicator;
      valoareCell.innerHTML = item.valoare;
    });
  })
  .catch(error => console.error('Eroare:', error));



  async function fetchData(apiUrl, datasets, countries) {
    const results = [];
  
    for (const dataset of datasets) {
      for (const country of countries) {
        try {
          const response = await fetch(`${apiUrl}${dataset}&geo=${country}&sinceTimePeriod=2008`);
          const data = await response.json();
  
          const timeLabels = Object.values(data.dimension.time.category.label);
          const valueKeys = Object.keys(data.value);
  
  
          for (const key of valueKeys) {
            const yearIndex = parseInt(key);
            const year = timeLabels[yearIndex];
  
            const obj = {
              "tara": country,
              "an": year,
              "indicator": '',
              "valoare": data.value[key]
            };
  
            if (dataset.includes('sdg_08_10')) {
              obj.indicator = 'PIB';
            } else if (dataset.includes('demo_mlexpec')) {
              obj.indicator = 'SV';
            } else if (dataset.includes('demo_pjan')) {
              obj.indicator = 'POP';
            }
  
            updateSecondTableWithData(obj);
          }
  
        } catch (error) {
          console.error('Eroare în timpul preluării datelor:', error);
        }
      }
    }
  }
  
  function updateSecondTableWithData(data) {
    const table = document.getElementById('secondTable').querySelector('tbody');
  
    const row = table.insertRow();
  
    const countryCell = row.insertCell();
    countryCell.textContent = data.tara;
  
    const yearCell = row.insertCell();
    yearCell.textContent = data.an;
  
    const indicatorCell = row.insertCell();
    indicatorCell.textContent = data.indicator;
  
    const valueCell = row.insertCell();
    valueCell.textContent = data.valoare;
  }

  
  
  


fetchData(apiUrl, datasets, countries);





