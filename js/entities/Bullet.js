/**
 * TURIA INVADERS - Bullet Entity
 * Handles bullet movement and rendering
 */

import { CONFIG } from '../config.js';

export class Bullet {
    /**
     * Creates a new Bullet
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} velocityY - Vertical velocity (negative = up, positive = down)
     */
    constructor(x, y, velocityY) {
        this.x = x;
        this.y = y;
        this.velocityY = velocityY;
        this.width = CONFIG.SIZES.bullet.width;
        this.height = CONFIG.SIZES.bullet.height;
        this.active = true;

        // Visual
        this.color = CONFIG.COLORS.bullet;
        this.glowColor = CONFIG.COLORS.bulletGlow;
    }

    /**
     * Updates bullet position
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this.y += this.velocityY * dt;
    }

    /**
     * Checks if bullet is off screen
     * @param {number} canvasHeight - Canvas height
     * @returns {boolean} True if bullet is off screen
     */
    isOffScreen(canvasHeight) {
        return this.y < -this.height || this.y > canvasHeight + this.height;
    }

    /**
     * Gets bounding box for collision detection
     * @returns {Object} Bounding box {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Marks bullet as inactive (for removal)
     */
    destroy() {
        this.active = false;
    }

    /**
     * Renders the bullet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();

        // Draw glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 8;

        // Draw bullet as a small rectangle with rounded ends
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            2
        );
        ctx.fill();

        // Add inner glow/trail effect
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y - this.height / 2,
            this.x,
            this.y + this.height / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
            this.x - this.width / 4,
            this.y - this.height / 2,
            this.width / 2,
            this.height,
            1
        );
        ctx.fill();

        ctx.restore();
    }
}
