// TEST
console.log("test-merge")

const video = document.querySelector('#video');
const apiUrl = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
const datasets = ['sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB', 'demo_mlexpec?sex=T&age=Y1', 'demo_pjan?sex=T&age=TOTAL'];
const countries = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'];
const years = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018'];
const svg = document.getElementById('grafic');
let data1table = [];
let data2table = [];

fetch('media/date.json')
  .then(response => response.json())
  .then(data => {
    const table = document.querySelector('.table tbody');

    data.forEach(item => {
      data1table.push(item);
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
          data2table.push(obj);
          updateSecondTableWithData(obj);
        }

      } catch (error) {
        console.error('Eroarea:', error);
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


const select = document.getElementById('tara-aleasa');
const country = [...new Set(data2table.map(item => item.tara))];
countries.forEach(country => {
  const option = document.createElement('option');
  option.value = country;
  option.textContent = country;
  select.appendChild(option);
});

const grafic = document.getElementById('grafic');

function createHistogram(data) {
  grafic.innerHTML = '';

  const w = +grafic.getAttribute('width');
  const h = +grafic.getAttribute('height');
  const barPadding = 5;

  const filteredData = data.filter(d => d.indicator === 'POP');

  const values = filteredData.map(d => d.valoare);
  const maxVal = Math.max(...values);

  const xScale = val => (val / maxVal) * w;
  const yScale = i => (i + 1) * ((h - barPadding) / filteredData.length);

  filteredData.forEach((d, i) => {
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    const barWidth = xScale(d.valoare);
    const barHeight = (h - barPadding) / filteredData.length;

    bar.setAttribute('x', 0);
    bar.setAttribute('y', h - yScale(i));
    bar.setAttribute('width', barWidth);
    bar.setAttribute('height', barHeight);
    bar.setAttribute('fill', 'steelblue');


    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    bar.addEventListener('mouseover', () => {
      console.log('over');
      tooltip.style.display = 'block';
    });

    bar.addEventListener('mousemove', (event) => {
      const mouseY = event.pageY - grafic.getBoundingClientRect().top;
      // console.log(mouseY);
      const barIndex = Math.floor((filteredData.length * (h - mouseY)) / h); 

      let tooltip = document.querySelector('#tooltip');
      tooltip.style.left = `${event.pageX}px`;
      tooltip.style.top = `${event.pageY}px`;
      tooltip.innerHTML = `AN: ${d.an}, POP: ${d.valoare}`;
      console.log(`AN: ${d.an}, POP: ${d.valoare}`);
    });

    bar.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });

    grafic.appendChild(bar);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  alert('Pentru a se incarca datele complet, recomandarea este sa asteptati intre 3-5 secunde! Va multumesc!');
});

select.addEventListener('change', function () {
  const selectedCountry = this.value;
  const filteredByCountry = data2table.filter(d => d.tara === selectedCountry && d.indicator === 'POP');
  grafic.innerHTML = '';
  createHistogram(filteredByCountry);
});


const select2 = document.getElementById('an-ales');
const anul = [...new Set(data1table.map(item => item.an))];
years.forEach(anul => {
  const option = document.createElement('option');
  option.value = anul;
  option.textContent = anul;
  select2.appendChild(option);
});

function createBubbleChart(data) {
  const canvas = document.getElementById('bubbleChartCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const maxVal = Math.max(...data.map(item => item.valoare));

  const scaleX = width / data.length;
  const scaleY = height / maxVal;

  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet'];

  data.forEach((item, index) => {
    const x = (item.an - 2000 + 1) * scaleX;
    const y = height - item.valoare * scaleY;
    const size = 20;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = colors[index % colors.length]; 
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'black';
    ctx.fillText(item.tara, x - size / 2, y - size / 2); 
    ctx.fillText(item.valoare.toString(), x - size / 2, y + size); 
  });
}


select2.addEventListener('change', function () {
  const selectedYear = this.value;
  const filteredByYear = data1table.filter(d => d.an === selectedYear);
  grafic.innerHTML = '';
  createBubbleChart(filteredByYear);
});


fetchData(apiUrl, datasets, countries);
console.log(data1table);
console.log(data2table);



