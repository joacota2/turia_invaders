/**
 * TURIA INVADERS - Main Game Class
 * Handles game loop, state management, and rendering
 */

import { CONFIG } from './config.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = CONFIG.CANVAS.width;
        this.height = CONFIG.CANVAS.height;

        // Time tracking
        this.lastTime = 0;
        this.deltaTime = 0;
        this.running = false;

        // State management
        this.currentState = null;
        this.states = {};

        // Stars for background
        this.stars = this.createStars(100);
    }

    /**
     * Creates procedural stars for background
     * @param {number} count - Number of stars
     * @returns {Array} Array of star objects
     */
    createStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 20 + 10,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
        return stars;
    }

    /**
     * Registers a game state
     * @param {string} name - State name
     * @param {Object} state - State object with enter, update, render, exit methods
     */
    registerState(name, state) {
        this.states[name] = state;
        state.game = this;
    }

    /**
     * Changes to a new state
     * @param {string} name - Name of state to change to
     * @param {Object} data - Optional data to pass to new state
     */
    changeState(name, data = {}) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        this.currentState = this.states[name];

        if (this.currentState && this.currentState.enter) {
            this.currentState.enter(data);
        }
    }

    /**
     * Starts the game loop
     */
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    /**
     * Stops the game loop
     */
    stop() {
        this.running = false;
    }

    /**
     * Main game loop
     */
    loop() {
        if (!this.running) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame(() => this.loop());
    }

    /**
     * Updates game state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Update stars
        this.updateStars(dt);

        // Update current state
        if (this.currentState && this.currentState.update) {
            this.currentState.update(dt);
        }
    }

    /**
     * Updates star positions for scrolling effect
     * @param {number} dt - Delta time in seconds
     */
    updateStars(dt) {
        for (const star of this.stars) {
            star.y += star.speed * dt;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        }
    }

    /**
     * Renders the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.COLORS.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw gradient background
        this.renderBackground();

        // Draw stars
        this.renderStars();

        // Render current state
        if (this.currentState && this.currentState.render) {
            this.currentState.render(this.ctx);
        }
    }

    /**
     * Renders gradient background
     */
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, CONFIG.COLORS.backgroundGradientTop);
        gradient.addColorStop(1, CONFIG.COLORS.backgroundGradientBottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Renders stars
     */
    renderStars() {
        for (const star of this.stars) {
            const alpha = star.brightness;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Triggers screen shake effect
     */
    shake() {
        this.canvas.parentElement.classList.add('shake');
        setTimeout(() => {
            this.canvas.parentElement.classList.remove('shake');
        }, 100);
    }
}
