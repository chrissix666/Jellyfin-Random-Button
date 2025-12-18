(function () {
    'use strict';

    ///////////////////////////
    // CONFIGURATION / CONSTANTS
    ///////////////////////////

    const FETCH_LIMIT = 50;  // Number of items to fetch per request
    const MAX_RETRIES = 15;  // Max attempts if no item is found

    // Library ID placeholders
    // Users must replace 'pasteyouridhere' with their own Jellyfin library IDs
    const MOVIES_PARENT_ID      = 'pasteyouridhere'; // Jellyfin Media Type: Movie
    const TVSHOWS_PARENT_ID     = 'pasteyouridhere'; // Jellyfin Media Type: Series
    const COLLECTIONS_PARENT_ID = 'pasteyouridhere'; // Jellyfin Media Type: Other (= Set/Collection)
    const HOME1                 = 'pasteyouridhere'; // Jellyfin Media Type: Home Videos and Photos
    const HOME2                 = 'pasteyouridhere'; // Jellyfin Media Type: Home Videos and Photos

    // Helper to get the Jellyfin server address
    const getServerAddress = () => window.location.origin;

    ///////////////////////////
    // ICONS + CSS INJECTION
    ///////////////////////////

    // Inject Google Material Icons if not already loaded
    const injectMaterialIcons = () => {
        if (document.getElementById('material-icons-stylesheet')) return;
        const link = document.createElement('link');
        link.id = 'material-icons-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
    };

    // Inject custom CSS for the random button
    const injectCustomCss = () => {
        if (document.getElementById('random-movie-button-custom-css')) return;
        const style = document.createElement('style');
        style.id = 'random-movie-button-custom-css';
        style.innerHTML = `
        .random-movie-button .md-icon { font-family: 'Material Icons' !important; font-style: normal !important; font-size: 24px !important; }
        button#randomMovieButton { padding: 0px !important; margin: 0px 5px 0 10px !important; display: inline-flex; align-items: center; justify-content: center; }`;
        document.head.appendChild(style);
    };

    ///////////////////////////
    // RANDOM ITEM FETCH
    ///////////////////////////

    /**
     * Fetch a random item from a library
     * @param {string} parentId - Library ID or 'ALL'
     * @param {number} attempt - Current attempt for retries
     */
    const fetchRandomItem = async (parentId, attempt = 1) => {
        try {
            const userId = ApiClient.getCurrentUserId();
            if (!userId) return null;

            const base = `${getServerAddress()}/Users/${userId}/Items`;
            const url = parentId === 'ALL'
                ? `${base}?Recursive=true&SortBy=Random&Limit=${FETCH_LIMIT}&Fields=Type,Name&_=${Date.now()}`
                : `${base}?ParentId=${parentId}&Recursive=true&SortBy=Random&Limit=${FETCH_LIMIT}&Fields=Type,Name&_=${Date.now()}`;

            const { Items = [] } = await ApiClient.ajax({ type: 'GET', url, dataType: 'json' });

            // Filter items based on type
            let filtered;
            if (parentId === MOVIES_PARENT_ID) filtered = Items.filter(i => i.Type === 'Movie');
            else if (parentId === TVSHOWS_PARENT_ID) filtered = Items.filter(i => i.Type === 'Series');
            else if (parentId === COLLECTIONS_PARENT_ID) filtered = Items.filter(i => i.Type === 'Set' || i.IsFolder);
            else if (parentId === HOME1 || parentId === HOME2) filtered = Items.filter(i => i.Type === 'Video');
            else if (parentId !== 'ALL') filtered = Items.filter(i => i.Type === 'Video');
            else if (parentId === 'ALL') filtered = Items.filter(i => ['Movie','Series','Set'].includes(i.Type));
            else filtered = [];

            if (!filtered.length && attempt < MAX_RETRIES) return fetchRandomItem(parentId, attempt + 1);

            return filtered[Math.floor(Math.random() * filtered.length)] || null;
        } catch {
            return attempt < MAX_RETRIES ? fetchRandomItem(parentId, attempt + 1) : null;
        }
    };

    ///////////////////////////
    // OPEN ITEM IN JELLYFIN
    ///////////////////////////

    const openItem = (item, parentId) => {
        if (!item.Id) return;
        const serverId = ApiClient.serverId();
        const url = `${getServerAddress()}/web/index.html#!details?id=${item.Id}` +
            (serverId ? `&serverId=${serverId}` : '') + `&parentId=${parentId}`;
        window.location.href = url;
    };

    ///////////////////////////
    // HOME PAGE FALLBACK
    ///////////////////////////

    const fetchHomeFallback = async () => {
        const movies = await fetchRandomItem(MOVIES_PARENT_ID);
        const series = await fetchRandomItem(TVSHOWS_PARENT_ID);
        const sets = await fetchRandomItem(COLLECTIONS_PARENT_ID);

        const candidates = [movies, series, sets].filter(Boolean);
        const item = candidates[Math.floor(Math.random() * candidates.length)];
        const parentId = item.Type === 'Movie' ? MOVIES_PARENT_ID
                         : item.Type === 'Series' ? TVSHOWS_PARENT_ID
                         : COLLECTIONS_PARENT_ID;
        return { item, parentId };
    };

    ///////////////////////////
    // ADD RANDOM BUTTON TO UI
    ///////////////////////////

    const addButton = () => {
        if (document.getElementById('randomMovieButton')) return;

        const btn = document.createElement('button');
        btn.id = 'randomMovieButton';
        btn.className = 'random-movie-button emby-button button-flat button-flat-hover';
        btn.title = 'Random Movie, Series, or Collection';
        btn.innerHTML = `<i class="md-icon random-icon casino"></i>`;

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = `<i class="md-icon random-icon hourglass_empty"></i>`;

            try {
                const hash = window.location.hash.toLowerCase();
                let item, parentId;

                // HOME PAGE LOGIC
                if (hash.includes('home.html')) {
                    const movies = await fetchRandomItem(MOVIES_PARENT_ID);
                    const series = await fetchRandomItem(TVSHOWS_PARENT_ID);
                    const sets = await fetchRandomItem(COLLECTIONS_PARENT_ID);

                    const candidates = [movies, series, sets].filter(Boolean);
                    item = candidates[Math.floor(Math.random() * candidates.length)];

                    parentId = item.Type === 'Movie' ? MOVIES_PARENT_ID
                               : item.Type === 'Series' ? TVSHOWS_PARENT_ID
                               : COLLECTIONS_PARENT_ID;

                    if (item) openItem(item, parentId);
                    return; // Home handled
                }

                // OTHER LIBRARIES LOGIC
                const params = new URLSearchParams(hash.split('?')[1]);
                parentId = params.get('parentid');

                if ([MOVIES_PARENT_ID, TVSHOWS_PARENT_ID, COLLECTIONS_PARENT_ID, HOME1, HOME2].includes(parentId)) {
                    item = await fetchRandomItem(parentId);
                } else if (parentId) { 
                    item = await fetchRandomItem(parentId);
                } else if (hash.includes('movies.html')) {
                    parentId = MOVIES_PARENT_ID;
                    item = await fetchRandomItem(MOVIES_PARENT_ID);
                } else if (hash.includes('tv.html')) {
                    parentId = TVSHOWS_PARENT_ID;
                    item = await fetchRandomItem(TVSHOWS_PARENT_ID);
                } else if (hash.includes('list.html')) {
                    parentId = COLLECTIONS_PARENT_ID;
                    item = await fetchRandomItem(COLLECTIONS_PARENT_ID);
                }

                // FALLBACK IF NO ITEM FOUND
                if (!item) {
                    const fallback = await fetchHomeFallback();
                    item = fallback.item;
                    parentId = fallback.parentId;
                }

                if (item) openItem(item, parentId);

            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="md-icon random-icon casino"></i>`;
            }
        });

        // Add button to the header
        const container = document.createElement('div');
        container.id = 'randomMovieButtonContainer';
        container.appendChild(btn);

        const headerRight = document.querySelector('.headerRight');
        const searchInput = document.querySelector('.searchInput');
        if (headerRight) headerRight.prepend(container);
        else if (searchInput) searchInput.parentNode.insertBefore(container, searchInput.nextSibling);
        else document.body.prepend(container);
    };

    ///////////////////////////
    // INITIALIZATION
    ///////////////////////////

    const init = () => {
        injectMaterialIcons();
        injectCustomCss();
        addButton();
    };

    // Wait until ApiClient is available
    const waitForApiClient = () => {
        if (window.ApiClient.getCurrentUserId) init();
        else setTimeout(waitForApiClient, 200);
    };

    waitForApiClient();

})();
