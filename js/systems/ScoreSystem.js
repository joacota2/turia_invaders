/**
 * TURIA INVADERS - Score System
 * Handles score, lives, and TURIA POWER bar
 */

import { CONFIG } from '../config.js';

const STORAGE_KEY = 'turiaScores';

export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.lives = CONFIG.GAMEPLAY.livesMax;
        this.turiaPower = 0;
        this.turiaPowerMax = CONFIG.GAMEPLAY.turiaPowerMax;

        // Track current player for scoreboard
        this.playerName = '';
    }

    /**
     * Sets the player name
     * @param {string} name - Player name
     */
    setPlayerName(name) {
        this.playerName = name.toUpperCase().substring(0, 10);
    }

    /**
     * Gets the player name
     * @returns {string} Player name
     */
    getPlayerName() {
        return this.playerName;
    }

    /**
     * Adds points and TURIA POWER for killing an enemy
     * @param {number} points - Points to add (default from config)
     * @param {number} power - Power to add (default from config)
     */
    addKill(points = CONFIG.GAMEPLAY.scorePerKill, power = CONFIG.GAMEPLAY.turiaPowerPerKill) {
        this.score += points;
        this.addPower(power);
    }

    /**
     * Adds points and power for killing boss
     */
    addBossKill() {
        this.score += CONFIG.GAMEPLAY.bossRewardScore;
        this.addPower(CONFIG.GAMEPLAY.bossRewardPower);
    }

    /**
     * Adds TURIA POWER
     * @param {number} amount - Amount to add
     */
    addPower(amount) {
        this.turiaPower = Math.min(this.turiaPower + amount, this.turiaPowerMax);
    }

    /**
     * Gets current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Gets current lives
     * @returns {number} Current lives
     */
    getLives() {
        return this.lives;
    }

    /**
     * Gets TURIA POWER as percentage (0-1)
     * @returns {number} Power percentage
     */
    getPowerPercentage() {
        return this.turiaPower / this.turiaPowerMax;
    }

    /**
     * Gets current TURIA POWER value
     * @returns {number} Current power
     */
    getPower() {
        return this.turiaPower;
    }

    /**
     * Checks if TURIA POWER is ready (full)
     * @returns {boolean} True if power is at max
     */
    isPowerReady() {
        return this.turiaPower >= this.turiaPowerMax;
    }

    /**
     * Consumes TURIA POWER (resets to 0)
     * @returns {boolean} True if power was consumed
     */
    consumePower() {
        if (this.isPowerReady()) {
            this.turiaPower = 0;
            return true;
        }
        return false;
    }

    /**
     * Loses a life
     * @returns {number} Remaining lives
     */
    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        return this.lives;
    }

    /**
     * Checks if game is over (no lives left)
     * @returns {boolean} True if game over
     */
    isGameOver() {
        return this.lives <= 0;
    }

    /**
     * Resets score system for new game
     */
    reset() {
        this.score = 0;
        this.lives = CONFIG.GAMEPLAY.livesMax;
        this.turiaPower = 0;
    }

    // ==================
    // Scoreboard Methods
    // ==================

    /**
     * Saves current score to localStorage
     * @returns {boolean} True if saved successfully
     */
    saveScore() {
        if (!this.playerName || this.score <= 0) return false;

        try {
            const scores = this.getScoreboard();
            scores.push({
                name: this.playerName,
                score: this.score,
                date: Date.now()
            });

            // Sort by score descending
            scores.sort((a, b) => b.score - a.score);

            // Keep only top 10
            const topScores = scores.slice(0, 10);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
            return true;
        } catch (e) {
            console.error('Failed to save score:', e);
            return false;
        }
    }

    /**
     * Gets scoreboard from localStorage
     * @returns {Array} Array of score objects {name, score, date}
     */
    getScoreboard() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const scores = JSON.parse(data);
            return Array.isArray(scores) ? scores : [];
        } catch (e) {
            console.error('Failed to load scoreboard:', e);
            return [];
        }
    }

    /**
     * Checks if a score qualifies for the scoreboard
     * @param {number} score - Score to check
     * @returns {boolean} True if score qualifies for top 10
     */
    isHighScore(score) {
        const scores = this.getScoreboard();
        if (scores.length < 10) return true;

        const lowestScore = scores[scores.length - 1].score;
        return score > lowestScore;
    }

    /**
     * Gets rank of current score in scoreboard
     * @returns {number} Rank (1-based) or 0 if not in top 10
     */
    getCurrentRank() {
        const scores = this.getScoreboard();
        for (let i = 0; i < scores.length; i++) {
            if (scores[i].name === this.playerName && scores[i].score === this.score) {
                return i + 1;
            }
        }
        return 0;
    }

    /**
     * Clears the scoreboard (for testing)
     */
    clearScoreboard() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear scoreboard:', e);
        }
    }
}
