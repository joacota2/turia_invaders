/**
 * TURIA INVADERS - Power Attack Entity
 * Handles the radial super attack when TURIA POWER is full
 */

import { CONFIG } from '../config.js';
import { getEightDirections } from '../utils.js';

/**
 * Single projectile in a power attack
 */
export class PowerProjectile {
    /**
     * Creates a new power projectile
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} dirX - Direction X (-1 to 1)
     * @param {number} dirY - Direction Y (-1 to 1)
     */
    constructor(x, y, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = CONFIG.GAMEPLAY.powerAttackSpeed;
        this.width = CONFIG.SIZES.powerProjectile.width;
        this.height = CONFIG.SIZES.powerProjectile.height;
        this.active = true;

        // Trail effect
        this.trail = [];
        this.maxTrailLength = 8;

        // Visual
        this.color = CONFIG.COLORS.powerAttack;
    }

    /**
     * Updates projectile position
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Move in direction
        this.x += this.dirX * this.speed * dt;
        this.y += this.dirY * this.speed * dt;
    }

    /**
     * Checks if projectile is off screen
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {boolean} True if off screen
     */
    isOffScreen(width, height) {
        const margin = 50;
        return (
            this.x < -margin ||
            this.x > width + margin ||
            this.y < -margin ||
            this.y > height + margin
        );
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
     * Renders the projectile with trail
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();

        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.5;
            const size = this.width * ((i + 1) / this.trail.length);

            ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw main projectile with glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        // Outer glow
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Power Attack - manages all projectiles from a single power activation
 */
export class PowerAttack {
    /**
     * Creates a new power attack
     * @param {number} x - Origin x position (player position)
     * @param {number} y - Origin y position (player position)
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.projectiles = [];
        this.active = true;

        // Create projectiles in 8 directions
        this.createProjectiles();

        // Animation state
        this.flashTimer = 100; // ms of screen flash
    }

    /**
     * Creates projectiles in all 8 directions
     */
    createProjectiles() {
        const directions = getEightDirections();

        for (const dir of directions) {
            this.projectiles.push(new PowerProjectile(
                this.x,
                this.y,
                dir.x,
                dir.y
            ));
        }
    }

    /**
     * Gets all active projectiles
     * @returns {Array<PowerProjectile>} Array of active projectiles
     */
    getProjectiles() {
        return this.projectiles.filter(p => p.active);
    }

    /**
     * Updates all projectiles
     * @param {number} dt - Delta time in seconds
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    update(dt, canvasWidth, canvasHeight) {
        // Update flash timer
        if (this.flashTimer > 0) {
            this.flashTimer -= dt * 1000;
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            if (!projectile.active) continue;

            projectile.update(dt);

            // Check if off screen
            if (projectile.isOffScreen(canvasWidth, canvasHeight)) {
                projectile.active = false;
            }
        }

        // Check if attack is complete (all projectiles off screen)
        const activeCount = this.projectiles.filter(p => p.active).length;
        if (activeCount === 0) {
            this.active = false;
        }
    }

    /**
     * Checks if flash effect should be shown
     * @returns {boolean} True if flash is active
     */
    isFlashing() {
        return this.flashTimer > 0;
    }

    /**
     * Renders all projectiles and effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.active) return;

        ctx.save();

        // Draw flash effect
        if (this.isFlashing()) {
            const flashAlpha = (this.flashTimer / 100) * 0.3;
            ctx.fillStyle = `rgba(255, 0, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // Draw radial burst lines from origin
        if (this.flashTimer > 50) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;

            for (const projectile of this.projectiles) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(projectile.x, projectile.y);
                ctx.stroke();
            }
        }

        // Render projectiles
        for (const projectile of this.projectiles) {
            projectile.render(ctx);
        }

        ctx.restore();
    }

    /**
     * Gets the number of remaining active projectiles
     * @returns {number} Count of active projectiles
     */
    getActiveCount() {
        return this.projectiles.filter(p => p.active).length;
    }
}
