/**
 * TURIA INVADERS - Asset Loader
 * Preloads and caches game assets
 */

import { CONFIG } from './config.js';

class AssetLoaderClass {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadingProgress = 0;
    }

    /**
     * Loads a single image
     * @param {string} key - Asset key
     * @param {string} src - Image source path
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}, using fallback`);
                // Create a fallback colored rectangle
                this.images[key] = null;
                resolve(null);
            };
            img.src = src;
        });
    }

    /**
     * Loads all game assets
     * @returns {Promise<void>}
     */
    async loadAll() {
        const assets = CONFIG.ASSETS;
        const entries = Object.entries(assets);
        let loadedCount = 0;

        const promises = entries.map(async ([key, src]) => {
            await this.loadImage(key, src);
            loadedCount++;
            this.loadingProgress = loadedCount / entries.length;
        });

        await Promise.all(promises);
        this.loaded = true;
    }

    /**
     * Gets a loaded image
     * @param {string} key - Asset key
     * @returns {HTMLImageElement|null}
     */
    get(key) {
        return this.images[key] || null;
    }

    /**
     * Checks if all assets are loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Gets loading progress (0-1)
     * @returns {number}
     */
    getProgress() {
        return this.loadingProgress;
    }
}

// Singleton instance
export const AssetLoader = new AssetLoaderClass();
