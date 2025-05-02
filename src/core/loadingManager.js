
import * as THREE from 'three';

export class LoadingManager {
    constructor() {
        this.loadingScreen = document.querySelector('.loading-screen');
        this.loadingLog = document.querySelector('.loading-log');
        this.loadingBar = document.getElementById('loadingBar');
        this.isLoading = false;
        this.totalItemsToLoad = 0;
        this.loadedItems = 0;
        this._onProgress = null;
        this._onComplete = null;
        this._updateLog = null;
        this.hideTimeout = null;
        this.lastProgress = 0;  // Track last progress to avoid unnecessary updates
    }

    startLoading(totalItems) {
        this.isLoading = true;
        this.totalItemsToLoad = totalItems;
        this.loadedItems = 0;
        this.lastProgress = 0;
        this.show();
        this.updateProgress(0);
    }

    itemLoaded() {
        this.loadedItems++;
        const progress = Math.min((this.loadedItems / this.totalItemsToLoad) * 100, 100);
        this.updateProgress(progress);
        
        if (this.loadedItems >= this.totalItemsToLoad) {
            setTimeout(() => this.hide(), 500);
        }
    }

    updateProgress(percentage) {
        // Convert to number and ensure it's within bounds
        const progress = Math.min(Math.max(Number(percentage) || 0, 0), 100);
        
        // Only update if there's a significant change
        if (Math.abs(this.lastProgress - progress) >= 5) {
            this.lastProgress = progress;
            
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }
            
            if (this._onProgress) {
                this._onProgress(progress);
            }
        }
    }

    updateLog(message) {
        if (this.loadingLog) {
            this.loadingLog.textContent = message;
        }
        if (this._updateLog) {
            this._updateLog(message);
        }
    }

    show() {
        if (this.loadingScreen) {
            clearTimeout(this.hideTimeout);
            this.isLoading = true;
            this.loadingScreen.classList.remove('hidden');
            this.loadingScreen.style.display = 'flex';
            requestAnimationFrame(() => {
                this.loadingScreen.style.opacity = '1';
            });
        }
    }
    
    hide() {
        if (this.loadingScreen && this.isLoading) {
            this.isLoading = false;
            this.loadingScreen.style.opacity = '0';
            
            clearTimeout(this.hideTimeout);
            this.hideTimeout = setTimeout(() => {
                if (!this.isLoading && this.loadingScreen) {
                    this.loadingScreen.classList.add('hidden');
                    this.loadingScreen.style.display = 'none';
                    this.updateProgress(0);
                    
                    if (this._onComplete) {
                        this._onComplete();
                    }
                }
            }, 1000);
        }
    }

    createThreeJSManager() {
        const manager = new THREE.LoadingManager();
        
        manager.onStart = (url) => {
            this.show();
            this.updateLog(`Loading: ${url.split('/').pop()}`);
        };

        manager.onLoad = () => {
            this.updateLog('Loading complete!');
            this.hide();
        };

        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = itemsTotal ? (itemsLoaded / itemsTotal * 100) : 0;
            this.updateLog(`Loading: ${Math.round(progress)}%`);
            this.updateProgress(progress);
        };

        manager.onError = (url) => {
            this.updateLog(`Error loading: ${url.split('/').pop()}`);
            setTimeout(() => this.hide(), 2000);
        };

        return manager;
    }
}