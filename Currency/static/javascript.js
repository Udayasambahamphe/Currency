// DOM Elements
        const amountInput = document.getElementById('amountInput');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        const liveRateDisplay = document.getElementById('liveRateDisplay');
        const exchangeRateValue = document.getElementById('exchangeRateValue');
        const lastUpdated = document.getElementById('lastUpdated');
        const popularConversions = document.getElementById('popularConversions');
        
        // Exchange rates cache
        let exchangeRates = {};
        let lastFetchTime = null;

        // Popular currency pairs
        const popularPairs = [
            { from: 'USD', to: 'EUR', label: 'USD → EUR' },
            { from: 'USD', to: 'GBP', label: 'USD → GBP' },
            { from: 'EUR', to: 'USD', label: 'EUR → USD' },
            { from: 'USD', to: 'JPY', label: 'USD → JPY' },
            { from: 'USD', to: 'INR', label: 'USD → INR' },
            { from: 'USD', to: 'NPR', label: 'USD → NPR' },
            { from: 'EUR', to: 'GBP', label: 'EUR → GBP' },
            { from: 'GBP', to: 'USD', label: 'GBP → USD' }
        ];

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Load exchange rates
            fetchExchangeRates();
            
            // Load popular conversions and history
            loadPopularConversions();
        
            // Auto-refresh rates every 5 minutes
            setInterval(fetchExchangeRates, 300000);
        });

        // Fetch exchange rates from API
        async function fetchExchangeRates() {
            try {
                const response = await axios.get('https://open.er-api.com/v6/latest/USD');
                exchangeRates = response.data.rates;
                lastFetchTime = new Date().toLocaleTimeString();
                
                // Update live rate display
                updateLiveRate();
                loadPopularConversions();
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        }

        // Update live exchange rate display
        function updateLiveRate() {
            const from = fromCurrency.value;
            const to = toCurrency.value;
            
            if (exchangeRates[from] && exchangeRates[to]) {
                const rate = (exchangeRates[to] / exchangeRates[from]).toFixed(4);
                exchangeRateValue.textContent = `1 ${from} = ${rate} ${to}`;
                lastUpdated.textContent = `Last updated: ${lastFetchTime || 'Loading...'}`;
                liveRateDisplay.classList.remove('hidden');
            }
        }

        // Load popular conversions
        function loadPopularConversions() {
            if (!exchangeRates.USD) return;
            
            popularConversions.innerHTML = '';
            popularPairs.forEach(pair => {
                if (exchangeRates[pair.from] && exchangeRates[pair.to]) {
                    const rate = (exchangeRates[pair.to] / exchangeRates[pair.from]).toFixed(4);
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer';
                    div.innerHTML = `
                        <span class="font-medium">${pair.label}</span>
                        <span class="text-blue-600 font-semibold">${rate}</span>
                    `;
                    div.onclick = () => {
                        fromCurrency.value = pair.from;
                        toCurrency.value = pair.to;
                        updateLiveRate();
                    };
                    popularConversions.appendChild(div);
                }
            });
        }

        // Swap currencies
        function swapCurrencies() {
            const temp = fromCurrency.value;
            fromCurrency.value = toCurrency.value;
            toCurrency.value = temp;
            updateLiveRate();
        }

        // Set amount using quick buttons
        function setAmount(amount) {
            amountInput.value = amount;
        }

        // Clear amount input
        function clearAmount() {
            amountInput.value = '';
        }
    

        // Copy result to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            });
        }

        // Form validation
        document.getElementById('converterForm').addEventListener('submit', function(e) {
            const amount = parseFloat(amountInput.value);
            if (!amount || amount <= 0) {
                e.preventDefault();
                alert('Please enter a valid amount');
                amountInput.focus();
                return;
            }
            
        });

        // Update live rate when currencies change
        fromCurrency.addEventListener('change', updateLiveRate);
        toCurrency.addEventListener('change', updateLiveRate);