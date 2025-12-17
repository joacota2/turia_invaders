/**
 * TURIA INVADERS - Enemy Entity
 * Handles enemy rendering and state
 */

import { CONFIG } from '../config.js';

// Enemy types for variety
export const EnemyType = {
    TYPE1: 1,
    TYPE2: 2,
    TYPE3: 3
};

export class Enemy {
    /**
     * Creates a new Enemy
     * @param {number} localX - Local x position within formation
     * @param {number} localY - Local y position within formation
     * @param {number} type - Enemy type (1, 2, or 3)
     */
    constructor(localX, localY, type = EnemyType.TYPE1) {
        this.localX = localX;
        this.localY = localY;
        this.type = type;
        this.width = CONFIG.SIZES.enemy.width;
        this.height = CONFIG.SIZES.enemy.height;
        this.alive = true;

        // Death animation
        this.dying = false;
        this.deathTimer = 0;
        this.deathDuration = 200; // ms

        // Set color based on type
        this.color = this.getColorForType(type);
    }

    /**
     * Gets color based on enemy type
     * @param {number} type - Enemy type
     * @returns {string} Color hex string
     */
    getColorForType(type) {
        switch (type) {
            case EnemyType.TYPE1:
                return CONFIG.COLORS.enemy1;
            case EnemyType.TYPE2:
                return CONFIG.COLORS.enemy2;
            case EnemyType.TYPE3:
                return CONFIG.COLORS.enemy3;
            default:
                return CONFIG.COLORS.enemy1;
        }
    }

    /**
     * Gets world position based on formation offset
     * @param {Object} formationOffset - Formation offset {x, y}
     * @returns {Object} World position {x, y}
     */
    getWorldPosition(formationOffset) {
        return {
            x: this.localX + formationOffset.x,
            y: this.localY + formationOffset.y
        };
    }

    /**
     * Gets bounding box for collision detection
     * @param {Object} formationOffset - Formation offset {x, y}
     * @returns {Object} Bounding box {x, y, width, height}
     */
    getBounds(formationOffset) {
        const worldPos = this.getWorldPosition(formationOffset);
        return {
            x: worldPos.x - this.width / 2,
            y: worldPos.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Starts death animation
     */
    kill() {
        if (!this.alive) return;
        this.dying = true;
        this.deathTimer = this.deathDuration;
    }

    /**
     * Updates enemy state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (this.dying) {
            this.deathTimer -= dt * 1000;
            if (this.deathTimer <= 0) {
                this.alive = false;
                this.dying = false;
            }
        }
    }

    /**
     * Renders the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} formationOffset - Formation offset {x, y}
     */
    render(ctx, formationOffset) {
        if (!this.alive && !this.dying) return;

        const worldPos = this.getWorldPosition(formationOffset);
        const x = worldPos.x;
        const y = worldPos.y;

        ctx.save();

        // Death animation - flash and shrink
        if (this.dying) {
            const progress = 1 - (this.deathTimer / this.deathDuration);
            ctx.globalAlpha = 1 - progress;

            // Flash white
            if (Math.floor(progress * 6) % 2 === 0) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = this.color;
            }

            // Scale down
            const scale = 1 - progress * 0.5;
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Draw glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        // Draw enemy body (pixel-art alien style)
        ctx.fillStyle = this.dying ? ctx.fillStyle : this.color;

        // Main body
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        // Draw based on type for variety
        switch (this.type) {
            case EnemyType.TYPE1:
                this.drawType1(ctx, x, y, halfW, halfH);
                break;
            case EnemyType.TYPE2:
                this.drawType2(ctx, x, y, halfW, halfH);
                break;
            case EnemyType.TYPE3:
                this.drawType3(ctx, x, y, halfW, halfH);
                break;
        }

        ctx.restore();
    }

    /**
     * Draws type 1 enemy (classic space invader shape)
     */
    drawType1(ctx, x, y, halfW, halfH) {
        ctx.beginPath();
        // Body
        ctx.fillRect(x - halfW * 0.6, y - halfH * 0.4, halfW * 1.2, halfH * 0.8);
        // Top
        ctx.fillRect(x - halfW * 0.3, y - halfH * 0.8, halfW * 0.6, halfH * 0.4);
        // Arms
        ctx.fillRect(x - halfW, y - halfH * 0.2, halfW * 0.3, halfH * 0.6);
        ctx.fillRect(x + halfW * 0.7, y - halfH * 0.2, halfW * 0.3, halfH * 0.6);
        // Legs
        ctx.fillRect(x - halfW * 0.5, y + halfH * 0.4, halfW * 0.3, halfH * 0.4);
        ctx.fillRect(x + halfW * 0.2, y + halfH * 0.4, halfW * 0.3, halfH * 0.4);

        // Eyes
        ctx.fillStyle = CONFIG.COLORS.background;
        ctx.fillRect(x - halfW * 0.3, y - halfH * 0.2, halfW * 0.2, halfH * 0.2);
        ctx.fillRect(x + halfW * 0.1, y - halfH * 0.2, halfW * 0.2, halfH * 0.2);
    }

    /**
     * Draws type 2 enemy (squid-like shape)
     */
    drawType2(ctx, x, y, halfW, halfH) {
        // Dome top
        ctx.beginPath();
        ctx.arc(x, y - halfH * 0.3, halfW * 0.7, Math.PI, 0);
        ctx.fill();

        // Body
        ctx.fillRect(x - halfW * 0.7, y - halfH * 0.3, halfW * 1.4, halfH * 0.6);

        // Tentacles
        for (let i = -2; i <= 2; i++) {
            const tentacleX = x + i * halfW * 0.3;
            ctx.fillRect(tentacleX - halfW * 0.1, y + halfH * 0.3, halfW * 0.2, halfH * 0.5);
        }

        // Eyes
        ctx.fillStyle = CONFIG.COLORS.background;
        ctx.fillRect(x - halfW * 0.4, y - halfH * 0.1, halfW * 0.25, halfH * 0.25);
        ctx.fillRect(x + halfW * 0.15, y - halfH * 0.1, halfW * 0.25, halfH * 0.25);
    }

    /**
     * Draws type 3 enemy (crab-like shape)
     */
    drawType3(ctx, x, y, halfW, halfH) {
        // Body
        ctx.fillRect(x - halfW * 0.5, y - halfH * 0.5, halfW, halfH);

        // Top spikes
        ctx.fillRect(x - halfW * 0.7, y - halfH * 0.8, halfW * 0.3, halfH * 0.3);
        ctx.fillRect(x + halfW * 0.4, y - halfH * 0.8, halfW * 0.3, halfH * 0.3);

        // Claws
        ctx.fillRect(x - halfW, y - halfH * 0.2, halfW * 0.4, halfH * 0.4);
        ctx.fillRect(x + halfW * 0.6, y - halfH * 0.2, halfW * 0.4, halfH * 0.4);

        // Bottom
        ctx.fillRect(x - halfW * 0.3, y + halfH * 0.5, halfW * 0.6, halfH * 0.3);

        // Eyes
        ctx.fillStyle = CONFIG.COLORS.background;
        ctx.fillRect(x - halfW * 0.3, y - halfH * 0.3, halfW * 0.2, halfH * 0.2);
        ctx.fillRect(x + halfW * 0.1, y - halfH * 0.3, halfW * 0.2, halfH * 0.2);
    }
}

/**
 * Formation Controller - manages enemy group movement
 */
export class FormationController {
    constructor() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.speed = CONFIG.GAMEPLAY.enemySpeed;
        this.stepDownAmount = CONFIG.GAMEPLAY.enemyStepDown;

        // Formation bounds
        this.minX = CONFIG.GAMEPLAY.enemyStartX;
        this.maxX = CONFIG.CANVAS.width - CONFIG.GAMEPLAY.enemyStartX;
    }

    /**
     * Updates formation position
     * @param {number} dt - Delta time in seconds
     * @param {Array<Enemy>} enemies - Array of enemies
     */
    update(dt, enemies) {
        // Move horizontally
        this.offsetX += this.speed * this.direction * dt;

        // Check if we need to reverse and step down
        const aliveEnemies = enemies.filter(e => e.alive || e.dying);
        if (aliveEnemies.length === 0) return;

        // Find bounds of alive enemies
        let minEnemyX = Infinity;
        let maxEnemyX = -Infinity;

        for (const enemy of aliveEnemies) {
            const worldX = enemy.localX + this.offsetX;
            minEnemyX = Math.min(minEnemyX, worldX - enemy.width / 2);
            maxEnemyX = Math.max(maxEnemyX, worldX + enemy.width / 2);
        }

        // Check boundaries
        if (maxEnemyX >= this.maxX && this.direction > 0) {
            this.direction = -1;
            this.offsetY += this.stepDownAmount;
        } else if (minEnemyX <= this.minX && this.direction < 0) {
            this.direction = 1;
            this.offsetY += this.stepDownAmount;
        }
    }

    /**
     * Gets current formation offset
     * @returns {Object} Offset {x, y}
     */
    getOffset() {
        return {
            x: this.offsetX,
            y: this.offsetY
        };
    }

    /**
     * Increases formation speed for difficulty scaling
     * @param {number} amount - Amount to increase
     */
    increaseSpeed(amount) {
        this.speed += amount;
    }

    /**
     * Resets formation for new wave
     */
    reset() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.direction = 1;
    }
}
