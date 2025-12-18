/**
 * TURIA INVADERS - Enemy Entity
 * Handles enemy rendering and state
 */

import { CONFIG } from '../config.js';
import { AssetLoader } from '../AssetLoader.js';

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

        // Sprite
        this.sprite = AssetLoader.get('enemy');

        // Animation
        this.bobOffset = Math.random() * Math.PI * 2; // Random start phase
        this.bobSpeed = 3;
        this.bobAmount = 2;
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
        // Update bob animation
        this.bobOffset += this.bobSpeed * dt;

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
        const y = worldPos.y + Math.sin(this.bobOffset) * this.bobAmount;

        ctx.save();

        // Death animation - flash and shrink
        if (this.dying) {
            const progress = 1 - (this.deathTimer / this.deathDuration);
            ctx.globalAlpha = 1 - progress;

            // Scale down
            const scale = 1 - progress * 0.5;
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.translate(-x, -y);
        }

        // Try to get sprite
        if (!this.sprite) {
            this.sprite = AssetLoader.get('enemy');
        }

        if (this.sprite && !this.dying) {
            // Draw sprite directly without effects for clean visibility
            ctx.drawImage(
                this.sprite,
                x - this.width / 2,
                y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback or death animation
            ctx.fillStyle = this.dying ? '#ffffff' : this.color;
            this.renderFallback(ctx, x, y);
        }

        ctx.restore();
    }

    /**
     * Renders fallback shape
     */
    renderFallback(ctx, x, y) {
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        // Simple barrel/cylinder shape
        ctx.beginPath();
        ctx.ellipse(x, y - halfH * 0.7, halfW * 0.8, halfH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(x - halfW * 0.8, y - halfH * 0.7, halfW * 1.6, halfH * 1.4);

        ctx.beginPath();
        ctx.ellipse(x, y + halfH * 0.7, halfW * 0.8, halfH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Metal bands
        ctx.fillStyle = '#444444';
        ctx.fillRect(x - halfW * 0.85, y - halfH * 0.3, halfW * 1.7, halfH * 0.15);
        ctx.fillRect(x - halfW * 0.85, y + halfH * 0.2, halfW * 1.7, halfH * 0.15);
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
        // Update bounds dynamically for fullscreen support
        this.maxX = CONFIG.CANVAS.width - CONFIG.GAMEPLAY.enemyStartX;

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
