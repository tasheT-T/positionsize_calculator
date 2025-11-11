document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const calculatorForm = document.getElementById('calculatorForm');
    const resultsDiv = document.getElementById('results');
    const resultsBody = document.getElementById('resultsBody');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoritesSection = document.getElementById('favoritesSection');
    const favoritesList = document.getElementById('favoritesList');
    const cancelBtn = document.getElementById('cancelBtn');
    
    let favorites = JSON.parse(localStorage.getItem('favoritePairs')) || [];

    // Display favorites if any exist
    renderFavorites();

    // Favorite button click handler
    favoriteBtn.addEventListener('click', function() {
        const pairSelect = document.getElementById('pair');
        const selectedPair = pairSelect.value;
        const pairName = pairSelect.options[pairSelect.selectedIndex].text;
        
        if (favorites.includes(selectedPair)) {
            // Remove from favorites
            favorites = favorites.filter(p => p !== selectedPair);
            favoriteBtn.innerHTML = '<i data-feather="star" class="text-gray-500"></i>';
        } else {
            // Add to favorites
            favorites.push(selectedPair);
            favoriteBtn.innerHTML = '<i data-feather="star" class="favorite"></i>';
        }
        
        localStorage.setItem('favoritePairs', JSON.stringify(favorites));
        renderFavorites();
        feather.replace();
    });

    // Update favorite button state when pair changes
    document.getElementById('pair').addEventListener('change', function() {
        const selectedPair = this.value;
        const starIcon = favoriteBtn.querySelector('i');
        
        if (favorites.includes(selectedPair)) {
            starIcon.classList.add('favorite');
        } else {
            starIcon.classList.remove('favorite');
        }
        feather.replace();
    });

    // Form submission handler
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const pair = document.getElementById('pair').value;
        const pairName = document.getElementById('pair').options[document.getElementById('pair').selectedIndex].text;
        const balance = parseFloat(document.getElementById('balance').value);
        const risk = parseFloat(document.getElementById('risk').value) / 100;
        const stopLoss = parseFloat(document.getElementById('stopLoss').value);
        
        // Validate inputs
        if (!balance || !risk || !stopLoss) {
            alert('Please fill in all fields');
            return;
        }

        if (balance <= 0 || risk <= 0 || stopLoss <= 0) {
            alert('All values must be greater than zero');
            return;
        }

        // Calculate risk amount
        const riskAmount = balance * risk;
        
        // Calculate lot size based on pair type
        let lotSize;
        let pipValue;
        
        if (pair.includes('JPY')) {
            // JPY pairs (pip value is approximately $9 per standard lot)
            pipValue = 9;
            lotSize = (riskAmount / (stopLoss * pipValue)).toFixed(3);
        } else if (pair === 'XAUUSD') {
            // Gold (pip value is approximately $1 per micro lot)
            pipValue = 1;
            lotSize = (riskAmount / (stopLoss * pipValue)).toFixed(3);
        } else if (pair === 'XAGUSD') {
            // Silver (pip value is approximately $0.05 per micro lot)
            pipValue = 0.05;
            lotSize = (riskAmount / (stopLoss * pipValue)).toFixed(3);
        } else if (pair === 'USOIL') {
            // Oil (pip value is approximately $10 per standard lot)
            pipValue = 10;
            lotSize = (riskAmount / (stopLoss * pipValue)).toFixed(3);
        } else {
            // Major Forex pairs (EUR/USD, GBP/USD, etc.)
            pipValue = 10;
            lotSize = (riskAmount / (stopLoss * pipValue)).toFixed(3);
        }

        // Ensure lot size is reasonable
        if (lotSize <= 0.001) {
            lotSize = '0.001 (Minimum)';
        } else if (lotSize > 100) {
            lotSize = '100.000 (Maximum)';
        }

        // Display results
        displayResults(pairName, lotSize, riskAmount.toFixed(2));
    });

    // Cancel button handler
    cancelBtn.addEventListener('click', function() {
        calculatorForm.reset();
        resultsDiv.classList.add('hidden');
        resultsDiv.classList.remove('show');
    });

    // Function to display results
    function displayResults(pair, lotSize, riskAmount) {
        resultsBody.innerHTML = `
            <tr>
                <td class="px-4 py-2 text-sm text-gray-900">${pair}</td>
                <td class="px-4 py-2 text-sm text-gray-900 font-medium">${lotSize}</td>
                <td class="px-4 py-2 text-sm text-gray-900">$${riskAmount}</td>
            </tr>
        `;
        
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('show');
    }

    // Function to render favorites
    function renderFavorites() {
        favoritesList.innerHTML = '';
        
        if (favorites.length > 0) {
            favoritesSection.classList.remove('hidden');
            
            favorites.forEach(pair => {
                const pairSelect = document.getElementById('pair');
                const pairOption = Array.from(pairSelect.options).find(opt => opt.value === pair);
                const pairName = pairOption ? pairOption.text : pair;
                
                const favoriteChip = document.createElement('div');
                favoriteChip.className = 'favorite-chip';
                favoriteChip.innerHTML = `
                    ${pairName}
                    <i data-feather="x" class="remove-favorite"></i>
                `;
                
                favoriteChip.addEventListener('click', function() {
                    // Set the pair in the dropdown
                    pairSelect.value = pair;
                    pairSelect.dispatchEvent(new Event('change'));
                });
                
                const removeBtn = favoriteChip.querySelector('.remove-favorite');
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    favorites = favorites.filter(p => p !== pair);
                    localStorage.setItem('favoritePairs', JSON.stringify(favorites));
                    renderFavorites();
                    
                    // Update favorite button if this was the selected pair
                    if (pairSelect.value === pair) {
                        favoriteBtn.innerHTML = '<i data-feather="star" class="text-gray-500"></i>';
                        feather.replace();
                    }
                });
                
                favoritesList.appendChild(favoriteChip);
            });
            
            feather.replace();
        } else {
            favoritesSection.classList.add('hidden');
        }
    }

    // Initialize favorite button state
    document.getElementById('pair').dispatchEvent(new Event('change'));
});