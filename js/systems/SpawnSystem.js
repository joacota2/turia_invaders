/**
 * TURIA INVADERS - Spawn System
 * Handles spawning of enemies, bosses, and waves
 */

import { CONFIG } from '../config.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { randomInt } from '../utils.js';

export class SpawnSystem {
    constructor() {
        this.waveNumber = 0;
    }

    /**
     * Creates a new wave of enemies
     * @param {number} rows - Number of rows (default from config)
     * @param {number} cols - Number of columns (default from config)
     * @returns {Array<Enemy>} Array of enemies
     */
    createWave(rows = CONFIG.GAMEPLAY.enemyRows, cols = CONFIG.GAMEPLAY.enemyCols) {
        const enemies = [];
        const spacingX = CONFIG.GAMEPLAY.enemySpacingX;
        const spacingY = CONFIG.GAMEPLAY.enemySpacingY;
        const startX = CONFIG.GAMEPLAY.enemyStartX;
        const startY = CONFIG.GAMEPLAY.enemyStartY;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const localX = startX + col * spacingX;
                const localY = startY + row * spacingY;

                // Determine enemy type based on row
                let type;
                if (row === 0) {
                    type = EnemyType.TYPE3; // Top row - strongest
                } else if (row < 2) {
                    type = EnemyType.TYPE2; // Middle rows
                } else {
                    type = EnemyType.TYPE1; // Bottom rows - weakest
                }

                enemies.push(new Enemy(localX, localY, type));
            }
        }

        return enemies;
    }

    /**
     * Creates a wave with random enemy types
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @returns {Array<Enemy>} Array of enemies
     */
    createRandomWave(rows = CONFIG.GAMEPLAY.enemyRows, cols = CONFIG.GAMEPLAY.enemyCols) {
        const enemies = [];
        const spacingX = CONFIG.GAMEPLAY.enemySpacingX;
        const spacingY = CONFIG.GAMEPLAY.enemySpacingY;
        const startX = CONFIG.GAMEPLAY.enemyStartX;
        const startY = CONFIG.GAMEPLAY.enemyStartY;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const localX = startX + col * spacingX;
                const localY = startY + row * spacingY;
                const type = randomInt(1, 3);

                enemies.push(new Enemy(localX, localY, type));
            }
        }

        return enemies;
    }

    /**
     * Checks if boss should spawn based on wave number
     * @param {number} waveNumber - Current wave number
     * @returns {boolean} True if boss should spawn
     */
    shouldSpawnBoss(waveNumber) {
        return waveNumber > 0 && waveNumber % CONFIG.GAMEPLAY.bossSpawnWave === 0;
    }

    /**
     * Creates boss spawn data
     * @returns {Object} Boss spawn data {x, y, hp}
     */
    createBossData() {
        return {
            x: CONFIG.CANVAS.width / 2,
            y: 80,
            hp: CONFIG.GAMEPLAY.bossHP
        };
    }

    /**
     * Gets spawn position for new wave
     * @returns {Object} Spawn position {x, y}
     */
    getWaveSpawnPosition() {
        return {
            x: 0,
            y: 0
        };
    }

    /**
     * Calculates enemy speed for given wave
     * @param {number} waveNumber - Wave number
     * @returns {number} Enemy speed
     */
    getSpeedForWave(waveNumber) {
        return CONFIG.GAMEPLAY.enemySpeed + (waveNumber * CONFIG.GAMEPLAY.speedIncreasePerWave);
    }

    /**
     * Increments wave number
     * @returns {number} New wave number
     */
    nextWave() {
        this.waveNumber++;
        return this.waveNumber;
    }

    /**
     * Gets current wave number
     * @returns {number} Current wave number
     */
    getWaveNumber() {
        return this.waveNumber;
    }

    /**
     * Resets spawn system
     */
    reset() {
        this.waveNumber = 0;
    }
}
