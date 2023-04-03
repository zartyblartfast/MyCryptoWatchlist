const tagContainer = document.getElementById('tag-container');
const coinSearch = document.getElementById('coin-search');
const coinSearchResults = document.getElementById('coin-search-results');

let coinList = [];

fetch('coingecko_coinlist.json')
  .then(response => response.json())
  .then(data => {
    coinList = data;
  });

const storedSelectedCoins = localStorage.getItem('selectedCoins');
const selectedCoins = storedSelectedCoins ? JSON.parse(storedSelectedCoins).map(coin => ({ id: coin.id, symbol: coin.symbol, name: coin.name })) : [
        {
          "id": "bitcoin",
          "symbol": "BTC",
          "name": "Bitcoin"
        },
        // ... other coins from crypto_list.json
];

function updateLocalStorage() {
    localStorage.setItem('selectedCoins', JSON.stringify(selectedCoins));
    renderCGWidget_Coin_List(); // Add this line to update the coin list widget after updating local storage
}

async function fetchTrendingCoins() {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  const data = await response.json();
  const coinIds = data.coins.map(coin => coin.item.id).join(',');

  await loadScript('https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js');

  const tickerWidget = document.createElement('coingecko-coin-price-marquee-widget');
  tickerWidget.setAttribute('coin-ids', coinIds);
  tickerWidget.setAttribute('currency', 'usd');
  tickerWidget.setAttribute('background-color', '#ffffff');
  tickerWidget.setAttribute('locale', 'en');

  const widgetContainer = document.getElementById('trending-ticker-widget');
  widgetContainer.appendChild(tickerWidget);
}

async function renderTags() {
  tagContainer.innerHTML = '';
  selectedCoins.forEach((coin, index) => {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.textContent = `${coin.name} (${coin.symbol})`;

    if (index === 0) tag.classList.add('tag-selected');

    tag.addEventListener('click', async (event) => {
      //console.log('Tag clicked:', tag.textContent); 
      const allTags = tagContainer.querySelectorAll('.tag');
      allTags.forEach(t => t.classList.remove('tag-selected'));

      tag.classList.add('tag-selected');

      await renderCGWidget_Coin_Price_Chart();
      await renderCGWidget_Market_Ticker();
    });

    const removeTag = document.createElement('span');
    removeTag.classList.add('remove-tag');
    removeTag.textContent = 'X';
    removeTag.addEventListener('click', (event) => {
      const index = selectedCoins.findIndex(c => c.id === coin.id);
      if (index !== -1) {
        tag.removeEventListener('click', event);
        selectedCoins.splice(index, 1);
        renderTags();
        updateLocalStorage();
      }
      event.stopPropagation();
    });

    tag.appendChild(removeTag);
    tagContainer.appendChild(tag);
  });

  // Only render the widgets if there are any tags
  if (selectedCoins.length > 0) {
    await renderCGWidget_Coin_Price_Chart();
    await renderCGWidget_Market_Ticker();
  } else {
    // Clear the chart and market ticker containers if there are no tags
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';
    const marketTickerContainer = document.getElementById('market-ticker-container');
    marketTickerContainer.innerHTML = '';
  }
 
  renderCGWidget_Coin_Compare_Chart();

  // Add the contact information below the Coin Compare Chart widget
  const contactInfo = `
    <div class="contact-info">
      <p>Get in touch: <a href="mailto:techdibdabs@gmail.com">techdibdabs@gmail.com</a></p>
      <p>Buy me a coffee: <a href="https://paypal.me/techdibdabs" target="_blank">https://paypal.me/techdibdabs</a></p>
    </div>
  `;
  const thirdColumn = document.querySelector('.column:nth-child(3)');
  thirdColumn.insertAdjacentHTML('beforeend', contactInfo);
}

async function renderCGWidget_Coin_Compare_Chart() {
  const selectedCoinIds = selectedCoins.map(coin => coin.id).join(',');
  if (!selectedCoinIds) return;

  console.log('Selected coin IDs:', selectedCoinIds);

  const thirdColumn = document.querySelector('.column:nth-child(3)'); // Select the third column
  thirdColumn.innerHTML = '';

  await loadScript('https://widgets.coingecko.com/coingecko-coin-compare-chart-widget.js');

  const widgetElement = document.createElement('coingecko-coin-compare-chart-widget');
  widgetElement.setAttribute('coin-ids', selectedCoinIds);
  widgetElement.setAttribute('currency', 'usd');
  widgetElement.setAttribute('width', '400');
  widgetElement.setAttribute('locale', 'en');
  thirdColumn.appendChild(widgetElement);
}

function searchCoins(searchText) {
    const results = coinList.filter(coin => (
      coin.name.toLowerCase().startsWith(searchText.toLowerCase()) ||
      coin.symbol.toLowerCase().startsWith(searchText.toLowerCase())
    ));
  
    // Sort results alphanumerically
    results.sort((a, b) => {
      if (a.symbol.toLowerCase() < b.symbol.toLowerCase()) {
        return -1;
      }
      if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  
    return results;
  }
  

function renderSearchResults(results) {
  coinSearchResults.innerHTML = '';
  if (results.length === 0) {
    coinSearchResults.style.display = 'none';
  } else {
    coinSearchResults.style.display = 'flex';
    results.forEach(coin => {
      const result = document.createElement('div');
      result.classList.add('coin-search-result');
      result.textContent = `${coin.symbol.toUpperCase()} - ${coin.name}`;
      result.addEventListener('click', () => {
        if (!selectedCoins.some(c => c.id === coin.id)) {
          selectedCoins.push(coin);
          renderTags();
          coinSearch.value = '';
          coinSearchResults.innerHTML = '';
          coinSearchResults.style.display = 'none';
          updateLocalStorage();
        }
      });
      coinSearchResults.appendChild(result);
    });
  }
}

coinSearch.addEventListener('input', (event) => {
  const searchText = event.target.value;
  const results = searchCoins(searchText);
  renderSearchResults(results);
});

function loadScript(src) {
  const existingScript = document.querySelector(`script[src='${src}']`);
  if (existingScript) return;

  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
}

async function renderCGWidget_Coin_List() {
  await loadScript('https://widgets.coingecko.com/coingecko-coin-list-widget.js'); // Add this line

  const selectedCoinIds = selectedCoins.map(coin => coin.id).join(',');
  const widgetContainer = document.getElementById('coin-list-widget-container');
  widgetContainer.innerHTML = '';

  const widgetElement = document.createElement('coingecko-coin-list-widget');
  widgetElement.setAttribute('coin-ids', selectedCoinIds);
  widgetElement.setAttribute('currency', 'usd');
  widgetElement.setAttribute('locale', 'en');
  widgetElement.setAttribute('width', 400);
  widgetContainer.appendChild(widgetElement);
}

function getSelectedCoinId() {
    const selectedTag = document.querySelector('.tag-selected');
    if (!selectedTag) return null;
  
    const tagText = selectedTag.textContent;
    const coinNameMatch = tagText.match(/^(.+)\s\(/); // Match the coin name before the open parenthesis
    if (!coinNameMatch) return null;
  
    const coinName = coinNameMatch[1];
    console.log('Coin name:', coinName); // Add this line
    const selectedCoin = selectedCoins.find(coin => coin.name === coinName);
    return selectedCoin ? selectedCoin.id : null;
  }

function handleClickOutsideSearchResults(event) {
    if (!coinSearchResults.contains(event.target) && event.target !== coinSearch) {
      coinSearchResults.innerHTML = '';
      coinSearchResults.style.display = 'none';
    }
  }
  
document.addEventListener('click', handleClickOutsideSearchResults);


async function renderCGWidget_Coin_Price_Chart() {
  const coinId = getSelectedCoinId();
  if (!coinId) return;

  const chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = '';

  const script = document.createElement('script');
  script.src = 'https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js';
  document.body.appendChild(script);

  const widgetElement = document.createElement('coingecko-coin-price-chart-widget');
  widgetElement.setAttribute('coin-id', coinId);
  widgetElement.setAttribute('currency', 'usd');
  widgetElement.setAttribute('width', '400');
  widgetElement.setAttribute('height', '200');
  widgetElement.setAttribute('locale', 'en');
  chartContainer.appendChild(widgetElement);
}

async function renderCGWidget_Market_Ticker() {
  const coinId = getSelectedCoinId();
  if (!coinId) return;

  const marketTickerContainer = document.getElementById('market-ticker-container');
  marketTickerContainer.innerHTML = '';

  const script = document.createElement('script');
  script.src = 'https://widgets.coingecko.com/coingecko-coin-market-ticker-list-widget.js';
  document.body.appendChild(script);

  const widgetElement = document.createElement('coingecko-coin-market-ticker-list-widget');
  widgetElement.setAttribute('coin-id', coinId);
  widgetElement.setAttribute('currency', 'usd');
  widgetElement.setAttribute('width', '400');
  widgetElement.setAttribute('locale', 'en');
  marketTickerContainer.appendChild(widgetElement);
}

// Initialize the dashboard
renderTags();
renderCGWidget_Coin_List();
fetchTrendingCoins();
