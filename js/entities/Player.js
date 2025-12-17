/**
 * TURIA INVADERS - Player Entity
 * Handles player movement, rendering, and shooting
 */

import { CONFIG } from '../config.js';
import { clamp } from '../utils.js';
import { Bullet } from './Bullet.js';

export class Player {
    /**
     * Creates a new Player
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.SIZES.player.width;
        this.height = CONFIG.SIZES.player.height;
        this.speed = CONFIG.GAMEPLAY.playerSpeed;

        // Shooting
        this.fireCooldown = 0;
        this.fireCooldownMax = CONFIG.GAMEPLAY.fireCooldown;

        // Visual
        this.color = CONFIG.COLORS.player;
        this.glowColor = CONFIG.COLORS.playerGlow;
    }

    /**
     * Updates player position based on input
     * @param {number} dt - Delta time in seconds
     * @param {Object} input - Input system reference
     * @param {number} canvasWidth - Canvas width for bounds
     */
    update(dt, input, canvasWidth) {
        // Movement
        if (input.isPressed('left')) {
            this.x -= this.speed * dt;
        }
        if (input.isPressed('right')) {
            this.x += this.speed * dt;
        }

        // Clamp to screen bounds
        this.x = clamp(this.x, this.width / 2, canvasWidth - this.width / 2);

        // Update fire cooldown
        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt * 1000; // Convert to ms
        }
    }

    /**
     * Attempts to shoot a bullet
     * @returns {Bullet|null} New bullet if can shoot, null otherwise
     */
    shoot() {
        if (this.fireCooldown <= 0) {
            this.fireCooldown = this.fireCooldownMax;
            return new Bullet(
                this.x,
                this.y - this.height / 2,
                -CONFIG.GAMEPLAY.bulletSpeed // Negative = upward
            );
        }
        return null;
    }

    /**
     * Checks if player can shoot
     * @returns {boolean} True if cooldown is ready
     */
    canShoot() {
        return this.fireCooldown <= 0;
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
     * Renders the player
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        ctx.save();

        // Draw glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        // Draw player ship (retro pixel-art style triangle/spaceship)
        ctx.fillStyle = this.color;
        ctx.beginPath();

        // Ship body (main triangle)
        ctx.moveTo(this.x, this.y - this.height / 2); // Top point
        ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2); // Bottom left
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2); // Bottom right
        ctx.closePath();
        ctx.fill();

        // Cockpit (smaller darker shape)
        ctx.fillStyle = CONFIG.COLORS.background;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height / 4);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height / 4);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 4);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.fillStyle = CONFIG.COLORS.enemy1;
        ctx.shadowColor = CONFIG.COLORS.enemy1;
        ctx.shadowBlur = 10;
        const engineWidth = 8;
        const engineHeight = 6;
        ctx.fillRect(
            this.x - engineWidth / 2 - 10,
            this.y + this.height / 2 - 2,
            engineWidth,
            engineHeight
        );
        ctx.fillRect(
            this.x - engineWidth / 2 + 10,
            this.y + this.height / 2 - 2,
            engineWidth,
            engineHeight
        );

        ctx.restore();
    }

    /**
     * Resets player to starting position
     * @param {number} canvasWidth - Canvas width
     */
    reset(canvasWidth) {
        this.x = canvasWidth / 2;
        this.y = CONFIG.GAMEPLAY.playerStartY;
        this.fireCooldown = 0;
    }
}
