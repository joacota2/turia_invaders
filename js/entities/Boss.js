/**
 * TURIA INVADERS - Boss Entity
 * Large enemy that appears every 3 waves
 */

import { CONFIG } from '../config.js';
import { AssetLoader } from '../AssetLoader.js';

export class Boss {
    /**
     * Creates a new Boss
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} hp - Hit points (default from config)
     */
    constructor(x, y, hp = CONFIG.GAMEPLAY.bossHP) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.maxHP = hp;
        this.width = CONFIG.SIZES.boss.width;
        this.height = CONFIG.SIZES.boss.height;
        this.speed = CONFIG.GAMEPLAY.bossSpeed;

        // Movement
        this.direction = 1; // 1 = right, -1 = left
        this.minX = 100;
        this.maxX = CONFIG.CANVAS.width - 100;

        // State
        this.active = true;
        this.dying = false;
        this.deathTimer = 0;
        this.deathDuration = 500; // ms

        // Visual effects
        this.color = CONFIG.COLORS.boss;
        this.glowColor = CONFIG.COLORS.bossGlow;
        this.hitFlash = 0;
        this.hitFlashDuration = 100; // ms

        // Animation
        this.animationTime = 0;
        this.pulseAmount = 0.05;

        // Sprite
        this.sprite = AssetLoader.get('boss');
    }

    /**
     * Updates boss position and state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Update bounds dynamically for fullscreen support
        this.maxX = CONFIG.CANVAS.width - 100;

        this.animationTime += dt;

        // Update hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= dt * 1000;
        }

        // Death animation
        if (this.dying) {
            this.deathTimer -= dt * 1000;
            if (this.deathTimer <= 0) {
                this.active = false;
                this.dying = false;
            }
            return;
        }

        // Move side to side
        this.x += this.speed * this.direction * dt;

        // Reverse at boundaries
        if (this.x >= this.maxX) {
            this.x = this.maxX;
            this.direction = -1;
        } else if (this.x <= this.minX) {
            this.x = this.minX;
            this.direction = 1;
        }
    }

    /**
     * Takes damage from a hit
     * @param {number} amount - Damage amount
     * @returns {boolean} True if boss died
     */
    takeDamage(amount = 1) {
        if (this.dying || !this.active) return false;

        this.hp -= amount;
        this.hitFlash = this.hitFlashDuration;

        if (this.hp <= 0) {
            this.hp = 0;
            this.dying = true;
            this.deathTimer = this.deathDuration;
            return true;
        }

        return false;
    }

    /**
     * Checks if boss is dead
     * @returns {boolean} True if HP is 0 or below
     */
    isDead() {
        return this.hp <= 0 && !this.dying;
    }

    /**
     * Gets HP percentage
     * @returns {number} HP as 0-1 value
     */
    getHPPercentage() {
        return this.hp / this.maxHP;
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
     * Renders the boss
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        if (!this.active && !this.dying) return;

        ctx.save();

        const x = this.x;
        const y = this.y;

        // Death animation
        if (this.dying) {
            const progress = 1 - (this.deathTimer / this.deathDuration);
            ctx.globalAlpha = 1 - progress;

            // Explosion effect
            const explosionSize = progress * 100;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 - progress * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, explosionSize, 0, Math.PI * 2);
            ctx.fill();

            // Multiple explosion rings
            ctx.strokeStyle = `rgba(255, 0, 255, ${0.5 - progress * 0.5})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, explosionSize * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Glow effect
        ctx.shadowColor = this.hitFlash > 0 ? '#ffffff' : this.glowColor;
        ctx.shadowBlur = 25;

        // Pulse animation
        const pulse = 1 + Math.sin(this.animationTime * 2) * this.pulseAmount;
        const drawWidth = this.width * pulse;
        const drawHeight = this.height * pulse;

        // Try to get sprite
        if (!this.sprite) {
            this.sprite = AssetLoader.get('boss');
        }

        if (this.sprite && !this.dying) {
            // Hit flash - draw white overlay
            if (this.hitFlash > 0) {
                ctx.filter = 'brightness(3)';
            }

            // Draw sprite
            ctx.drawImage(
                this.sprite,
                x - drawWidth / 2,
                y - drawHeight / 2,
                drawWidth,
                drawHeight
            );

            ctx.filter = 'none';
        } else {
            // Fallback rendering
            this.renderFallback(ctx, x, y);
        }

        ctx.restore();

        // Draw HP bar
        if (!this.dying) {
            this.renderHPBar(ctx);
        }
    }

    /**
     * Renders fallback shape when sprite not available
     */
    renderFallback(ctx, x, y) {
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // Barrel body
        ctx.beginPath();
        ctx.ellipse(x, y, halfW * 0.8, halfH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Metal bands
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#666666';
        ctx.fillRect(x - halfW * 0.85, y - halfH * 0.6, halfW * 1.7, halfH * 0.2);
        ctx.fillRect(x - halfW * 0.85, y + halfH * 0.4, halfW * 1.7, halfH * 0.2);

        // Face (angry)
        if (!this.dying) {
            // Eyes
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;

            const eyeY = y - halfH * 0.1;
            const eyeSpacing = halfW * 0.35;

            // Left eye
            ctx.beginPath();
            ctx.moveTo(x - eyeSpacing - 8, eyeY - 5);
            ctx.lineTo(x - eyeSpacing + 8, eyeY - 5);
            ctx.lineTo(x - eyeSpacing, eyeY + 8);
            ctx.closePath();
            ctx.fill();

            // Right eye
            ctx.beginPath();
            ctx.moveTo(x + eyeSpacing - 8, eyeY - 5);
            ctx.lineTo(x + eyeSpacing + 8, eyeY - 5);
            ctx.lineTo(x + eyeSpacing, eyeY + 8);
            ctx.closePath();
            ctx.fill();

            // Angry mouth
            ctx.fillStyle = '#000000';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(x - halfW * 0.3, y + halfH * 0.2);
            ctx.quadraticCurveTo(x, y + halfH * 0.1, x + halfW * 0.3, y + halfH * 0.2);
            ctx.quadraticCurveTo(x, y + halfH * 0.35, x - halfW * 0.3, y + halfH * 0.2);
            ctx.fill();
        }
    }

    /**
     * Renders HP bar above boss
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderHPBar(ctx) {
        const barWidth = this.width + 20;
        const barHeight = 10;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 25;

        ctx.save();

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // HP fill
        const hpPercentage = this.getHPPercentage();
        const fillColor = hpPercentage > 0.5 ? '#00ff00' :
                         hpPercentage > 0.25 ? '#ffff00' : '#ff0000';

        ctx.fillStyle = fillColor;
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * hpPercentage, barHeight - 2);

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Boss label
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.x, barY - 5);

        ctx.restore();
    }

    /**
     * Resets boss for new appearance
     * @param {number} x - New x position
     * @param {number} y - New y position
     * @param {number} hp - New HP (default from config)
     */
    reset(x, y, hp = CONFIG.GAMEPLAY.bossHP) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.maxHP = hp;
        this.direction = 1;
        this.active = true;
        this.dying = false;
        this.deathTimer = 0;
        this.hitFlash = 0;
    }
}
