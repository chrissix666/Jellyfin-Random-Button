(function () {
    'use strict';

    /************************************************
     * SCRIPT OVERVIEW
     * ------------------------------------------------
     * This script adds a "Random" button to the Emby/Jellyfin
     * web interface. When clicked, it opens a random movie,
     * series, collection, or episode depending on context.
     *
     * The code is written to be readable for beginners and
     * reverse engineers, with clear sections, predictable
     * control flow, and defensive fallbacks.
     ************************************************/


    /************************************************
     * GLOBAL CONSTANTS & CONFIGURATION
     * ------------------------------------------------
     * These values control limits, retries, and library
     * root IDs. Replace the IDs with your own if needed.
     ************************************************/
    const FETCH_LIMIT = 50;      // Maximum number of items fetched per request
    const MAX_RETRIES = 15;      // Safety limit to avoid infinite retry loops

    // Library root IDs (server-specific)
    const MOVIES_PARENT_ID = 'pasteyouridhere';
    const TVSHOWS_PARENT_ID = 'pasteyouridhere';
    const COLLECTIONS_PARENT_ID = 'pasteyouridhere';
    const HOME1_PARENT_ID = 'pasteyouridhere';
    const HOME2_PARENT_ID = 'pasteyouridhere';

    // Helper to always resolve the current server base URL
    const getServerAddress = () => window.location.origin;


    /************************************************
     * ICONS & CSS INJECTION
     * ------------------------------------------------
     * Dynamically injects Google Material Icons and
     * minimal custom CSS required for the button.
     ************************************************/
    const injectMaterialIcons = () => {
        // Prevent duplicate stylesheet injection
        if (document.getElementById('material-icons-stylesheet')) return;

        const link = document.createElement('link');
        link.id = 'material-icons-stylesheet';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
    };

    const injectCustomCss = () => {
        // Prevent duplicate style injection
        if (document.getElementById('random-movie-button-custom-css')) return;

        const style = document.createElement('style');
        style.id = 'random-movie-button-custom-css';
        style.innerHTML = `
        .random-movie-button .md-icon {
            font-family: 'Material Icons' !important;
            font-style: normal !important;
            font-size: 24px !important;
        }
        button#randomMovieButton {
            padding: 0px !important;
            margin: 0px 5px 0 10px !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }`;
        document.head.appendChild(style);
    };


    /************************************************
     * LIBRARY CONTEXT HELPER
     * ------------------------------------------------
     * Determines which library the user is currently
     * browsing by inspecting the URL hash.
     ************************************************/
    const getCurrentLibraryParentId = () => {
        const hash = window.location.hash.toLowerCase();
        const params = new URLSearchParams(hash.split('?')[1] || '');

        // Emby/Jellyfin uses both parentid and topparentid
        let parentId = params.get('parentid') || params.get('topparentid');

        // Fallback detection based on known routes
        if (!parentId) {
            if (hash.includes('movies.html')) parentId = MOVIES_PARENT_ID;
            else if (hash.includes('tv.html')) parentId = TVSHOWS_PARENT_ID;
            else if (hash.includes('list.html')) parentId = COLLECTIONS_PARENT_ID;
        }

        return parentId || null;
    };


    /************************************************
     * CURRENT ITEM HELPERS
     * ------------------------------------------------
     * Used when the user is currently viewing a detail
     * page (movie, episode, season, etc.).
     ************************************************/
    const getCurrentItemId = () => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.split('?')[1] || '');
        return params.get('id') || null;
    };

    const fetchCurrentItem = async (itemId) => {
        try {
            const userId = ApiClient.getCurrentUserId();
            if (!userId || !itemId) return null;

            const url = `${getServerAddress()}/Users/${userId}/Items/${itemId}?Fields=Type,SeriesId,ParentId`;
            return await ApiClient.ajax({ type: 'GET', url, dataType: 'json' });
        } catch {
            // Fail silently and let higher-level logic decide
            return null;
        }
    };


    /************************************************
     * RANDOM ITEM FETCH (CORE MECHANIC)
     * ------------------------------------------------
     * Fetches random items from a given parent library
     * and filters them by expected item type.
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
            else filtered = Items.filter(i => ['Movie', 'Series', 'Set'].includes(i.Type));

            // Retry logic if nothing usable was returned
            if (!filtered.length && attempt < MAX_RETRIES) {
                return fetchRandomItem(parentId, attempt + 1);
            }

            return filtered[Math.floor(Math.random() * filtered.length)] || null;
        } catch {
            return attempt < MAX_RETRIES
                ? fetchRandomItem(parentId, attempt + 1)
                : null;
        }
    };


    /************************************************
     * HOME FALLBACK STRATEGY
     * ------------------------------------------------
     * Used when the user is on the home screen or when
     * context-based selection fails completely.
     ************************************************/
    const fetchHomeFallback = async () => {
        const movies = await fetchRandomItem(MOVIES_PARENT_ID);
        const series = await fetchRandomItem(TVSHOWS_PARENT_ID);
        const sets   = await fetchRandomItem(COLLECTIONS_PARENT_ID);

        const candidates = [movies, series, sets].filter(Boolean);
        const item = candidates[Math.floor(Math.random() * candidates.length)];

        const parentId = item?.Type === 'Movie'
            ? MOVIES_PARENT_ID
            : item?.Type === 'Series'
                ? TVSHOWS_PARENT_ID
                : COLLECTIONS_PARENT_ID;

        return { item, parentId };
    };


    /************************************************
     * SECONDARY GLOBAL RANDOM FALLBACK
     * ------------------------------------------------
     * Emergency fallback used when all library IDs
     * are placeholders or undefined.
     ************************************************/
    const fetchSecondaryGlobalRandom = async () => {
        const idsArePlaceholder = [
            MOVIES_PARENT_ID,
            TVSHOWS_PARENT_ID,
            COLLECTIONS_PARENT_ID,
            HOME1_PARENT_ID,
            HOME2_PARENT_ID
        ].every(id => !id || id === 'pasteyouridhere');

        // If real IDs exist, do not use this fallback
        if (!idsArePlaceholder) return null;

        const userId = ApiClient.getCurrentUserId();
        if (!userId) return null;

        const ITEM_TYPES = ['Movie', 'Series'];
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
     * NAVIGATION HELPER
     * ------------------------------------------------
     * Opens the selected item in the web interface.
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
     * CONTEXT-AWARE "RANDOM NEXT" LOGIC
     * ------------------------------------------------
     * Determines what "random" means depending on
     * the currently viewed item type.
     ************************************************/
    const fetchRandomNext = async (currentItem) => {
        if (!currentItem) return null;

        const userId = ApiClient.getCurrentUserId();
        if (!userId) return null;

        // SERIES VIEW:
        // Jump to a completely different random series
        if (currentItem.Type === 'Series') {
            return await fetchRandomItem(TVSHOWS_PARENT_ID);
        }

        // SEASON VIEW:
        // Pick a random episode from this specific season
        if (currentItem.Type === 'Season') {
            const url = `${getServerAddress()}/Users/${userId}/Items?ParentId=${currentItem.Id}&IncludeItemTypes=Episode&SortBy=Random&Limit=${FETCH_LIMIT}`;
            try {
                const { Items = [] } = await ApiClient.ajax({ type: 'GET', url, dataType: 'json' });
                return Items[Math.floor(Math.random() * Items.length)] || null;
            } catch {
                return null;
            }
        }

        // EPISODE VIEW:
        // Pick a random episode from the entire series
        if (currentItem.Type === 'Episode') {
            try {
                const seasonsResponse = await ApiClient.ajax({
                    type: 'GET',
                    url: `${getServerAddress()}/Users/${userId}/Items?ParentId=${currentItem.SeriesId}&IncludeItemTypes=Season&Fields=Id&_=${Date.now()}`,
                    dataType: 'json'
                });

                const seasons = seasonsResponse.Items || [];
                let allEpisodes = [];

                for (const season of seasons) {
                    const episodesResponse = await ApiClient.ajax({
                        type: 'GET',
                        url: `${getServerAddress()}/Users/${userId}/Items?ParentId=${season.Id}&IncludeItemTypes=Episode&Fields=Id&_=${Date.now()}`,
                        dataType: 'json'
                    });

                    allEpisodes = allEpisodes.concat(episodesResponse.Items || []);
                }

                if (allEpisodes.length > 0) {
                    return allEpisodes[Math.floor(Math.random() * allEpisodes.length)];
                }
            } catch {
                return null;
            }
        }

        return null;
    };


    /************************************************
     * RANDOM BUTTON UI & EVENT HANDLING
     * ------------------------------------------------
     * Creates the button, wires click behavior, and
     * keeps it in sync with navigation changes.
     ************************************************/
    const addButton = () => {
        // Do not show button on video playback screen
        if (window.location.hash.startsWith('#/video')) return;
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
                let item = null;
                let parentId = null;

                const hash = window.location.hash.toLowerCase();
                const currentId = getCurrentItemId();

                // Context-aware randomization if an item is open
                if (currentId) {
                    const currentItem = await fetchCurrentItem(currentId);
                    if (currentItem) {
                        item = await fetchRandomNext(currentItem);
                        if (currentItem.Type === 'Episode') parentId = currentItem.SeriesId;
                        else parentId = item?.ParentId || currentItem.Id;
                    }
                }

                // Global fallback chain
                if (!item) {
                    const secondary = await fetchSecondaryGlobalRandom();
                    if (secondary) {
                        item = secondary.item;
                        parentId = secondary.parentId;
                    } else if (hash.includes('home.html')) {
                        const fallback = await fetchHomeFallback();
                        item = fallback.item;
                        parentId = fallback.parentId;
                    } else {
                        parentId = getCurrentLibraryParentId();
                        if (!parentId) {
                            const fallback = await fetchHomeFallback();
                            item = fallback.item;
                            parentId = fallback.parentId;
                        } else {
                            item = await fetchRandomItem(parentId);
                            if (!item) {
                                const fallback = await fetchHomeFallback();
                                item = fallback.item;
                                parentId = fallback.parentId;
                            }
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
        if (headerRight) headerRight.prepend(container);

        // Observe DOM changes to keep the button alive
        const observer = new MutationObserver(() => {
            const container = document.getElementById('randomMovieButtonContainer');
            if (!container) return;

            if (window.location.hash.startsWith('#/video')) {
                container.remove();
            } else {
                const headerRight = document.querySelector('.headerRight');
                if (!headerRight) return;
                if (headerRight.firstElementChild !== container) {
                    headerRight.removeChild(container);
                    headerRight.prepend(container);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };


    /************************************************
     * HASH CHANGE MONITOR
     * ------------------------------------------------
     * Polls the URL hash to detect navigation changes
     * in single-page application environments.
     ************************************************/
    let lastHash = window.location.hash;
    const monitorHash = () => {
        if (window.location.hash !== lastHash) {
            lastHash = window.location.hash;
            if (!window.location.hash.startsWith('#/video')) addButton();
        }
    };

    setInterval(monitorHash, 200);


    /************************************************
     * INITIALIZATION SEQUENCE
     ************************************************/
    const init = () => {
        injectMaterialIcons();
        injectCustomCss();
        addButton();
    };

    // Wait until ApiClient is available before starting
    const waitForApiClient = () => {
        if (window.ApiClient?.getCurrentUserId) init();
        else setTimeout(waitForApiClient, 200);
    };

    waitForApiClient();
})();
