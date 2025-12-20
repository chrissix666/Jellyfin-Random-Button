(function () {
    'use strict';

    /************************************************
     * CONSTANTS
     ************************************************/
    const FETCH_LIMIT = 50;
    const MAX_RETRIES = 15;

    const MOVIES_PARENT_ID = 'pasteyouridhere';
    const TVSHOWS_PARENT_ID = 'pasteyouridhere';
    const COLLECTIONS_PARENT_ID = 'pasteyouridhere';
    const HOME1_PARENT_ID = 'pasteyouridhere';
    const HOME2_PARENT_ID = 'pasteyouridhere';

    const getServerAddress = () => window.location.origin;

    /************************************************
     * ICONS + CSS
     ************************************************/
    const injectMaterialIcons = () => {
        if (document.getElementById('material-icons-stylesheet')) return;
        const link = document.createElement('link');
        link.id = 'material-icons-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
    };

    const injectCustomCss = () => {
        if (document.getElementById('random-movie-button-custom-css')) return;
        const style = document.createElement('style');
        style.id = 'random-movie-button-custom-css';
        style.innerHTML = `
        .random-movie-button .md-icon { font-family: 'Material Icons' !important; font-style: normal !important; font-size: 24px !important; }
        button#randomMovieButton { padding: 0px !important; margin: 0px 5px 0 10px !important; display: inline-flex; align-items: center; justify-content: center; }`;
        document.head.appendChild(style);
    };

    /************************************************
     * PARENTID HELPER
     ************************************************/
    const getCurrentLibraryParentId = () => {
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(hash.split('?')[1] || '');
        let parentId = params.get('parentid') || params.get('topparentid');

        // Fallback auf bekannte Libraries anhand Hash
        if (!parentId) {
            if (hash.includes('movies.html')) parentId = MOVIES_PARENT_ID;
            else if (hash.includes('tv.html')) parentId = TVSHOWS_PARENT_ID;
            else if (hash.includes('list.html')) parentId = COLLECTIONS_PARENT_ID;
        }

        return parentId || null;
    };

    /************************************************
     * RANDOM ITEM FETCH
     ************************************************/
    const fetchRandomItem = async (parentId, attempt = 1) => {
        try {
            const userId = ApiClient.getCurrentUserId();
            if (!userId) return null;

            const base = `${getServerAddress()}/Users/${userId}/Items`;
            const url = parentId
                ? `${base}?ParentId=${parentId}&Recursive=true&SortBy=Random&Limit=${FETCH_LIMIT}&Fields=Type,Name&_=${Date.now()}`
                : `${base}?Recursive=true&SortBy=Random&Limit=${FETCH_LIMIT}&Fields=Type,Name&_=${Date.now()}`;

            const { Items = [] } = await ApiClient.ajax({ type: 'GET', url, dataType: 'json' });

            let filtered;
            if (parentId === MOVIES_PARENT_ID) filtered = Items.filter(i => i.Type === 'Movie');
            else if (parentId === TVSHOWS_PARENT_ID) filtered = Items.filter(i => i.Type === 'Series');
            else if (parentId === COLLECTIONS_PARENT_ID) filtered = Items.filter(i => i.Type === 'Set' || i.IsFolder);
            else if (parentId === HOME1_PARENT_ID || parentId === HOME2_PARENT_ID) filtered = Items.filter(i => i.Type === 'Video');
            else if (parentId) filtered = Items.filter(i => i.Type === 'Video');
            else filtered = Items.filter(i => ['Movie','Series','Set'].includes(i.Type)); // Home-Fallback

            if (!filtered.length && attempt < MAX_RETRIES) return fetchRandomItem(parentId, attempt + 1);
            return filtered[Math.floor(Math.random() * filtered.length)] || null;
        } catch {
            return attempt < MAX_RETRIES ? fetchRandomItem(parentId, attempt + 1) : null;
        }
    };

    /************************************************
     * HOME FALLBACK HELPER
     ************************************************/
    const fetchHomeFallback = async () => {
        const movies = await fetchRandomItem(MOVIES_PARENT_ID);
        const series = await fetchRandomItem(TVSHOWS_PARENT_ID);
        const sets = await fetchRandomItem(COLLECTIONS_PARENT_ID);

        const candidates = [movies, series, sets].filter(Boolean);
        const item = candidates[Math.floor(Math.random() * candidates.length)];
        const parentId = item?.Type === 'Movie' ? MOVIES_PARENT_ID :
                         item?.Type === 'Series' ? TVSHOWS_PARENT_ID :
                         COLLECTIONS_PARENT_ID;

        return { item, parentId };
    };

    /************************************************
     * SECONDARY GLOBAL FALLBACK
     ************************************************/
    const fetchSecondaryGlobalRandom = async () => {
        const idsArePlaceholder = [MOVIES_PARENT_ID, TVSHOWS_PARENT_ID, COLLECTIONS_PARENT_ID, HOME1_PARENT_ID, HOME2_PARENT_ID]
            .every(id => !id || id === 'pasteyouridhere');

        if (!idsArePlaceholder) return null;

        const userId = ApiClient.getCurrentUserId();
        if (!userId) return null;

        const ITEM_TYPES = ['Movie','Series'];
        const url = `${getServerAddress()}/Users/${userId}/Items?IncludeItemTypes=${ITEM_TYPES.join(',')}&Recursive=true&SortBy=Random&Limit=${FETCH_LIMIT}&Fields=Type,Name&_=${Date.now()}`;

        try {
            const { Items = [] } = await ApiClient.ajax({ type: 'GET', url, dataType: 'json' });
            const candidates = Items.filter(i => ITEM_TYPES.includes(i.Type));
            if (!candidates.length) return await fetchHomeFallback();

            const item = candidates[Math.floor(Math.random() * candidates.length)];
            return { item, parentId: 'ALL' };
        } catch {
            return await fetchHomeFallback();
        }
    };

    /************************************************
     * OPEN ITEM
     ************************************************/
    const openItem = (item, parentId) => {
        if (!item?.Id) return;
        const serverId = ApiClient.serverId();
        let url = `${getServerAddress()}/web/index.html#!/details?id=${item.Id}`;
        if (serverId) url += `&serverId=${serverId}`;
        if (parentId) url += `&parentId=${parentId}`;
        window.location.href = url;
    };

    /************************************************
     * RANDOM BUTTON
     ************************************************/
    const addButton = () => {
        if (document.getElementById('randomMovieButton')) return;

        const btn = document.createElement('button');
        btn.id = 'randomMovieButton';
        btn.className = 'random-movie-button emby-button button-flat button-flat-hover';
        btn.title = 'Random Movie, Series, or Collection';
        btn.innerHTML = `<i class="md-icon random-icon">casino</i>`;

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = `<i class="md-icon random-icon">hourglass_empty</i>`;

            try {
                const hash = window.location.hash.toLowerCase();
                let item, parentId;

                // Secondary Global Fallback prüfen
                const secondary = await fetchSecondaryGlobalRandom();
                if (secondary) {
                    item = secondary.item;
                    parentId = secondary.parentId;
                } 
                // Home Screen fallback
                else if (hash.includes('home.html')) {
                    const fallback = await fetchHomeFallback();
                    item = fallback.item;
                    parentId = fallback.parentId;
                } 
                // Library / Folder / Container
                else {
                    parentId = getCurrentLibraryParentId();

                    // Wenn ParentId unbekannt → Home-Fallback direkt
                    if (!parentId) {
                        const fallback = await fetchHomeFallback();
                        item = fallback.item;
                        parentId = fallback.parentId;
                    } else {
                        item = await fetchRandomItem(parentId);

                        // Kein Item gefunden → Home-Fallback
                        if (!item) {
                            const fallback = await fetchHomeFallback();
                            item = fallback.item;
                            parentId = fallback.parentId;
                        }
                    }
                }

                if (item) openItem(item, parentId);

            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="md-icon random-icon">casino</i>`;
            }
        });

        const container = document.createElement('div');
        container.id = 'randomMovieButtonContainer';
        container.appendChild(btn);

        const headerRight = document.querySelector('.headerRight');
        const searchInput = document.querySelector('.searchInput');
        if (headerRight) headerRight.prepend(container);
        else if (searchInput) searchInput.parentNode.insertBefore(container, searchInput.nextSibling);
        else {
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.right = '10px';
            container.style.zIndex = 9999;
            document.body.appendChild(container);
        }
    };

    /************************************************
     * INIT
     ************************************************/
    const init = () => {
        injectMaterialIcons();
        injectCustomCss();
        addButton();
    };

    const waitForApiClient = () => {
        if (window.ApiClient?.getCurrentUserId) init();
        else setTimeout(waitForApiClient, 200);
    };

    waitForApiClient();
})();

