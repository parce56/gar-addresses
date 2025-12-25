<script>
    import AddressAutocomplete from './components/AddressAutocomplete.svelte'
</script>

<main>
    <div class="container">
        <h1>Поиск адресов России</h1>
        <AddressAutocomplete />
    </div>
</main>

<style>
    main {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0a;
        padding: 20px;
    }

    .container {
        text-align: center;
        width: 100%;
        max-width: 600px;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #00ff00;
    }
</style>