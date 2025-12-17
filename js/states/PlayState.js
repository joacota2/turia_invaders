/**
 * TURIA INVADERS - Play State
 * Main gameplay state integrating all systems
 */

import { CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy, FormationController } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { PowerAttack } from '../entities/PowerAttack.js';
import { InputSystem } from '../systems/InputSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';

export class PlayState {
    constructor() {
        this.game = null;

        // Systems
        this.input = new InputSystem();
        this.collision = new CollisionSystem();
        this.score = new ScoreSystem();
        this.spawner = new SpawnSystem();

        // Entities
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.formation = null;
        this.boss = null;
        this.powerAttack = null;

        // Game state
        this.paused = false;
        this.waveTransition = false;
        this.waveTransitionTimer = 0;
        this.bossActive = false;
    }

    /**
     * Called when entering play state
     * @param {Object} data - Data from previous state (playerName)
     */
    enter(data = {}) {
        // Set player name
        this.score.setPlayerName(data.playerName || 'PLAYER');

        // Initialize systems
        this.score.reset();
        this.spawner.reset();
        this.collision.clear();

        // Start input listening
        this.input.start();

        // Create player
        this.player = new Player(
            CONFIG.CANVAS.width / 2,
            CONFIG.GAMEPLAY.playerStartY
        );

        // Reset arrays
        this.bullets = [];
        this.enemies = [];
        this.powerAttack = null;
        this.boss = null;
        this.bossActive = false;

        // Create formation controller
        this.formation = new FormationController();

        // Spawn first wave
        this.spawnWave();
    }

    /**
     * Called when exiting play state
     */
    exit() {
        this.input.stop();
    }

    /**
     * Spawns a new wave of enemies
     */
    spawnWave() {
        const waveNum = this.spawner.nextWave();

        // Check if boss wave
        if (this.spawner.shouldSpawnBoss(waveNum)) {
            this.spawnBoss();
        } else {
            // Spawn regular enemies
            this.enemies = this.spawner.createWave();
            this.formation.reset();
            this.formation.speed = this.spawner.getSpeedForWave(waveNum);
        }

        this.waveTransition = false;
    }

    /**
     * Spawns the boss
     */
    spawnBoss() {
        const bossData = this.spawner.createBossData();
        this.boss = new Boss(bossData.x, bossData.y, bossData.hp);
        this.bossActive = true;
        this.enemies = []; // Clear regular enemies for boss fight
    }

    /**
     * Updates game state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (this.paused) return;

        // Handle wave transition
        if (this.waveTransition) {
            this.waveTransitionTimer -= dt * 1000;
            if (this.waveTransitionTimer <= 0) {
                this.spawnWave();
            }
            return;
        }

        // Update input at end of frame
        this.updatePlayer(dt);
        this.updateBullets(dt);
        this.updateEnemies(dt);
        this.updateBoss(dt);
        this.updatePowerAttack(dt);
        this.checkCollisions();
        this.checkWaveComplete();
        this.checkGameOver();

        // Clear input just-pressed states
        this.input.update();
    }

    /**
     * Updates player
     */
    updatePlayer(dt) {
        this.player.update(dt, this.input, CONFIG.CANVAS.width);

        // Shooting
        if (this.input.isPressed('shoot')) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }

        // Power attack
        if (this.input.justPressed('power') && this.score.isPowerReady()) {
            this.activatePowerAttack();
        }
    }

    /**
     * Activates the TURIA POWER attack
     */
    activatePowerAttack() {
        if (this.score.consumePower()) {
            this.powerAttack = new PowerAttack(this.player.x, this.player.y);
            this.game.shake();
        }
    }

    /**
     * Updates all bullets
     */
    updateBullets(dt) {
        for (const bullet of this.bullets) {
            bullet.update(dt);
        }

        // Remove off-screen and inactive bullets
        this.bullets = this.bullets.filter(b =>
            b.active && !b.isOffScreen(CONFIG.CANVAS.height)
        );
    }

    /**
     * Updates all enemies
     */
    updateEnemies(dt) {
        // Update formation
        this.formation.update(dt, this.enemies);

        // Update individual enemies
        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        // Remove dead enemies (after death animation)
        this.enemies = this.enemies.filter(e => e.alive || e.dying);
    }

    /**
     * Updates boss
     */
    updateBoss(dt) {
        if (!this.boss || !this.boss.active) return;
        this.boss.update(dt);
    }

    /**
     * Updates power attack
     */
    updatePowerAttack(dt) {
        if (!this.powerAttack || !this.powerAttack.active) return;

        this.powerAttack.update(dt, CONFIG.CANVAS.width, CONFIG.CANVAS.height);

        if (!this.powerAttack.active) {
            this.powerAttack = null;
        }
    }

    /**
     * Checks all collisions
     */
    checkCollisions() {
        this.collision.clear();
        const offset = this.formation.getOffset();

        // Bullets vs enemies
        const bulletEnemyHits = this.collision.checkBulletEnemyCollisions(
            this.bullets,
            this.enemies,
            offset
        );

        // Add score for kills
        for (const hit of bulletEnemyHits) {
            this.score.addKill();
        }

        // Bullets vs boss
        if (this.boss && this.boss.active) {
            const bossHits = this.collision.checkBulletBossCollisions(
                this.bullets,
                this.boss
            );

            for (const hit of bossHits) {
                const died = this.boss.takeDamage(hit.damage);
                if (died) {
                    this.score.addBossKill();
                    this.bossActive = false;
                    this.game.shake();
                }
            }
        }

        // Power attack vs enemies
        if (this.powerAttack && this.powerAttack.active) {
            const powerEnemyHits = this.collision.checkPowerAttackEnemyCollisions(
                this.powerAttack.getProjectiles(),
                this.enemies,
                offset
            );

            for (const hit of powerEnemyHits) {
                this.score.addKill();
            }

            // Power attack vs boss
            if (this.boss && this.boss.active) {
                const powerBossHits = this.collision.checkPowerAttackBossCollisions(
                    this.powerAttack.getProjectiles(),
                    this.boss
                );

                for (const hit of powerBossHits) {
                    const died = this.boss.takeDamage(hit.damage);
                    if (died) {
                        this.score.addBossKill();
                        this.bossActive = false;
                        this.game.shake();
                    }
                }
            }
        }

        // Enemies reaching bottom
        if (this.collision.checkEnemyReachBottom(this.enemies, offset)) {
            this.handleEnemyReachBottom();
        }
    }

    /**
     * Handles enemies reaching the bottom line
     */
    handleEnemyReachBottom() {
        const remaining = this.score.loseLife();
        this.game.shake();

        if (remaining <= 0) {
            // Game over handled in checkGameOver
            return;
        }

        // Reset formation position
        this.formation.reset();
    }

    /**
     * Checks if wave is complete
     */
    checkWaveComplete() {
        // Check if boss defeated
        if (this.bossActive && this.boss && !this.boss.active && !this.boss.dying) {
            this.startWaveTransition();
            this.boss = null;
            this.bossActive = false;
            return;
        }

        // Check if all enemies dead (for regular waves)
        if (!this.bossActive) {
            const aliveCount = this.enemies.filter(e => e.alive || e.dying).length;
            if (aliveCount === 0 && !this.waveTransition) {
                this.startWaveTransition();
            }
        }
    }

    /**
     * Starts wave transition
     */
    startWaveTransition() {
        this.waveTransition = true;
        this.waveTransitionTimer = 2000; // 2 second delay
    }

    /**
     * Checks for game over
     */
    checkGameOver() {
        if (this.score.isGameOver()) {
            // Save score before transitioning
            this.score.saveScore();

            this.game.changeState('gameover', {
                score: this.score.getScore(),
                wave: this.spawner.getWaveNumber(),
                playerName: this.score.getPlayerName()
            });
        }
    }

    /**
     * Renders the game
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Render enemies
        const offset = this.formation.getOffset();
        for (const enemy of this.enemies) {
            enemy.render(ctx, offset);
        }

        // Render boss
        if (this.boss && (this.boss.active || this.boss.dying)) {
            this.boss.render(ctx);
        }

        // Render bullets
        for (const bullet of this.bullets) {
            bullet.render(ctx);
        }

        // Render power attack
        if (this.powerAttack && this.powerAttack.active) {
            this.powerAttack.render(ctx, CONFIG.CANVAS.width, CONFIG.CANVAS.height);
        }

        // Render player
        this.player.render(ctx);

        // Render UI
        this.renderUI(ctx);

        // Render wave transition
        if (this.waveTransition) {
            this.renderWaveTransition(ctx);
        }
    }

    /**
     * Renders game UI
     */
    renderUI(ctx) {
        ctx.save();

        // Score
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score.getScore()}`, 20, 30);

        // Wave
        ctx.fillText(`WAVE: ${this.spawner.getWaveNumber()}`, 20, 50);

        // Lives
        ctx.textAlign = 'right';
        ctx.fillText('LIVES:', CONFIG.CANVAS.width - 100, 30);
        this.renderLives(ctx, CONFIG.CANVAS.width - 90, 18);

        // TURIA POWER bar
        this.renderPowerBar(ctx);

        // Player name
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textDim;
        ctx.textAlign = 'center';
        ctx.fillText(this.score.getPlayerName(), CONFIG.CANVAS.width / 2, 20);

        ctx.restore();
    }

    /**
     * Renders lives icons
     */
    renderLives(ctx, x, y) {
        const lives = this.score.getLives();
        const iconSize = 16;
        const spacing = 20;

        ctx.fillStyle = CONFIG.COLORS.lifeIcon;
        ctx.shadowColor = CONFIG.COLORS.lifeIcon;
        ctx.shadowBlur = 5;

        for (let i = 0; i < lives; i++) {
            const iconX = x + i * spacing;
            // Draw heart shape
            ctx.beginPath();
            ctx.moveTo(iconX, y + iconSize / 4);
            ctx.bezierCurveTo(iconX, y, iconX - iconSize / 2, y, iconX - iconSize / 2, y + iconSize / 4);
            ctx.bezierCurveTo(iconX - iconSize / 2, y + iconSize / 2, iconX, y + iconSize * 0.7, iconX, y + iconSize);
            ctx.bezierCurveTo(iconX, y + iconSize * 0.7, iconX + iconSize / 2, y + iconSize / 2, iconX + iconSize / 2, y + iconSize / 4);
            ctx.bezierCurveTo(iconX + iconSize / 2, y, iconX, y, iconX, y + iconSize / 4);
            ctx.fill();
        }
    }

    /**
     * Renders TURIA POWER bar
     */
    renderPowerBar(ctx) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = CONFIG.CANVAS.width / 2 - barWidth / 2;
        const barY = CONFIG.CANVAS.height - 40;

        ctx.save();

        // Label
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.textAlign = 'center';
        ctx.fillText('TURIA POWER', CONFIG.CANVAS.width / 2, barY - 5);

        // Background
        ctx.fillStyle = CONFIG.COLORS.powerBarBg;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Fill
        const fillWidth = (barWidth - 4) * this.score.getPowerPercentage();
        const isReady = this.score.isPowerReady();

        if (isReady) {
            // Pulsing glow when ready
            ctx.shadowColor = CONFIG.COLORS.powerBarReady;
            ctx.shadowBlur = 15 + Math.sin(Date.now() / 100) * 5;
            ctx.fillStyle = CONFIG.COLORS.powerBarReady;
        } else {
            ctx.shadowColor = CONFIG.COLORS.powerBarFill;
            ctx.shadowBlur = 5;
            ctx.fillStyle = CONFIG.COLORS.powerBarFill;
        }

        ctx.fillRect(barX + 2, barY + 2, fillWidth, barHeight - 4);

        // Border
        ctx.strokeStyle = isReady ? CONFIG.COLORS.powerBarReady : CONFIG.COLORS.text;
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Ready text
        if (isReady) {
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#000000';
            ctx.fillText('READY! [E]', CONFIG.CANVAS.width / 2, barY + 14);
        }

        ctx.restore();
    }

    /**
     * Renders wave transition screen
     */
    renderWaveTransition(ctx) {
        ctx.save();

        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.width, CONFIG.CANVAS.height);

        // Wave text
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textHighlight;
        ctx.textAlign = 'center';
        ctx.shadowColor = CONFIG.COLORS.textHighlight;
        ctx.shadowBlur = 20;

        const nextWave = this.spawner.getWaveNumber() + 1;
        const isBossWave = this.spawner.shouldSpawnBoss(nextWave);

        if (isBossWave) {
            ctx.fillStyle = CONFIG.COLORS.boss;
            ctx.shadowColor = CONFIG.COLORS.boss;
            ctx.fillText('WARNING!', CONFIG.CANVAS.width / 2, CONFIG.CANVAS.height / 2 - 30);
            ctx.fillText('BOSS INCOMING!', CONFIG.CANVAS.width / 2, CONFIG.CANVAS.height / 2 + 10);
        } else {
            ctx.fillText(`WAVE ${nextWave}`, CONFIG.CANVAS.width / 2, CONFIG.CANVAS.height / 2 - 10);
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = CONFIG.COLORS.text;
            ctx.fillText('GET READY!', CONFIG.CANVAS.width / 2, CONFIG.CANVAS.height / 2 + 20);
        }

        ctx.restore();
    }
}
