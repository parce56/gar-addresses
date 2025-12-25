<script>
    let query = $state('')
    let suggestions = $state([])
    let selectedIndex = $state(-1)
    let showDropdown = $state(false)
    let loading = $state(false)
    let error = $state(null)
    
    let timeoutId
    
    const API_URL = `${import.meta.env.API_URL || 'http://localhost'}:${import.meta.env.API_PORT || '3000'}` || 'http://localhost:3000'
    const DEBOUNCE_DELAY = import.meta.env.DEBOUNCE_DELAY || 300
    
    $effect(() => {
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            query = suggestions[selectedIndex]
        }
    })
    
    async function searchAddresses(searchQuery) {
        if (!searchQuery.trim()) {
            suggestions = []
            showDropdown = false
            return
        }
        
        loading = true
        error = null
        showDropdown = true
        
        try {
            const response = await fetch(`${API_URL}/admaddresses?userQueryText=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
            
            console.log('Response status:', response.status)
            
            if (!response.ok) {
                console.warn('API недоступен, используем mock-данные')
                useMockData(searchQuery)
                return
            }
            
            const text = await response.text()
            console.log('Raw response:', text)
            
            let data
            try {
                data = JSON.parse(text)
            } catch (parseError) {
                console.warn('Ошибка парсинга JSON, используем mock-данные')
                useMockData(searchQuery)
                return
            }
            
            if (!Array.isArray(data)) {
                console.warn('Некорректный формат данных, используем mock-данные')
                useMockData(searchQuery)
                return
            }
            
            suggestions = data.map(item => item.full_address)
            
        } catch (error) {
            console.warn('Ошибка запроса, используем mock-данные:', error.message)
            useMockData(searchQuery)
        } finally {
            loading = false
        }
    }
    
    function useMockData(searchQuery) {
        const mockData = [
            { full_address: "Оренбургская обл, г Оренбург" },
            { full_address: "Оренбургская обл, г Оренбург, ул Ленина" },
            { full_address: "Оренбургская обл, г Оренбург, пр-т Победы" },
            { full_address: "Оренбургская обл, г Оренбург, мкр. Пристанционный" },
            { full_address: "Оренбургская обл, г Оренбург, пер Гугучинский" },
            { full_address: "Оренбургская обл, г Оренбург, снт Станция Оренбург" },
            { full_address: "Москва, ул Тверская" },
            { full_address: "Санкт-Петербург, Невский проспект" },
            { full_address: "Новосибирск, Красный проспект" }
        ].filter(item => 
            item.full_address.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        suggestions = mockData.map(item => item.full_address)
    }
    
    function handleInput(e) {
        query = e.target.value
        selectedIndex = -1        
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            searchAddresses(query)
        }, DEBOUNCE_DELAY)
    }
    
    function handleKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (suggestions.length > 0) {
                selectedIndex = (selectedIndex + 1) % suggestions.length
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (suggestions.length > 0) {
                selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1
            }
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                selectSuggestion(suggestions[selectedIndex])
                showDropdown = false
            } else if (query.trim()) {
                searchAddresses(query)
                showDropdown = false
            } else {
                showDropdown = false
            }
        } else if (e.key === 'Escape') {
            showDropdown = false
            selectedIndex = -1
        }
    }
    
    function selectSuggestion(suggestion) {
        query = suggestion
        showDropdown = false
        selectedIndex = -1
    }
    
    function handleBlur() {
        setTimeout(() => {
            showDropdown = false
        }, 200)
    }
</script>

<div class="autocomplete">
    <div class="input-container">
        <input
            type="text"
            value={query}
            oninput={handleInput}
            onkeydown={handleKeyDown}
            onblur={handleBlur}
            placeholder="Введите адрес..."
            class:loading
        />
        {#if loading}
            <div class="spinner"></div>
        {/if}
    </div>
    
    {#if error}
        <div class="error">{error}</div>
    {/if}
    
    {#if showDropdown && suggestions.length > 0}
        <ul class="suggestions">
            {#each suggestions as suggestion, index}
                <li class:selected={index === selectedIndex}>
                    <button
                        type="button"
                        onmousedown={() => selectSuggestion(suggestion)}
                        class="suggestion-button"
                    >
                        {suggestion}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
    
    {#if showDropdown && !loading && suggestions.length === 0 && query.trim()}
        <div class="no-results">Ничего не найдено</div>
    {/if}
</div>

<style>
    .autocomplete {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .input-container {
        position: relative;
    }
    
    input {
        width: 100%;
        padding: 12px 16px;
        font-size: 16px;
        border: 2px solid #00ff00;
        border-radius: 8px;
        background: #1a1a1a;
        color: #00ff00;
        outline: none;
        transition: all 0.3s ease;
    }
    
    input:focus {
        border-color: #00cc00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
    
    input.loading {
        padding-right: 40px;
    }
    
    input::placeholder {
        color: #008800;
    }
    
    .spinner {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        border: 2px solid #00ff00;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: translateY(-50%) rotate(0deg); }
        100% { transform: translateY(-50%) rotate(360deg); }
    }
    
    .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a1a1a;
        border: 2px solid #00ff00;
        border-top: none;
        border-radius: 0 0 8px 8px;
        margin: 0;
        padding: 0;
        list-style: none;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    
    .suggestions li {
        border-bottom: 1px solid #004400;
    }
    
    .suggestions li:last-child {
        border-bottom: none;
    }
    
    .suggestions li.selected {
        background: #004400;
    }
    
    .suggestion-button {
        all: unset;
        width: 100%;
        padding: 12px 16px;
        cursor: pointer;
        color: #00ff00;
        text-align: left;
        font-size: 14px;
        display: block;
        transition: all 0.2s ease;
    }
    
    .suggestion-button:hover,
    .suggestion-button:focus,
    .suggestions li.selected .suggestion-button {
        background: #004400;
        color: #ffffff;
        outline: none;
    }
    
    .error {
        margin-top: 8px;
        padding: 8px 12px;
        background: #330000;
        border: 1px solid #ff0000;
        border-radius: 4px;
        color: #ff6666;
        font-size: 14px;
    }
    
    .no-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        padding: 12px 16px;
        background: #1a1a1a;
        border: 2px solid #00ff00;
        border-top: none;
        border-radius: 0 0 8px 8px;
        color: #008800;
        text-align: center;
    }
    
    .suggestions::-webkit-scrollbar {
        width: 8px;
    }
    
    .suggestions::-webkit-scrollbar-track {
        background: #1a1a1a;
    }
    
    .suggestions::-webkit-scrollbar-thumb {
        background: #00ff00;
        border-radius: 4px;
    }
    
    .suggestions::-webkit-scrollbar-thumb:hover {
        background: #00cc00;
    }
</style>