/**
 * TURIA INVADERS - Score/LocalStorage Tests
 * Tests for scoreboard persistence
 * Note: localStorage tests will show warnings in Node/Bun but still pass
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import { ScoreSystem } from '../js/systems/ScoreSystem.js';
import { CONFIG } from '../js/config.js';

// Mock localStorage for testing
const mockStorage = {};
const mockLocalStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, value) => { mockStorage[key] = value; },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Store original if exists
const originalLocalStorage = typeof localStorage !== 'undefined' ? localStorage : undefined;

describe('ScoreSystem - Scoreboard Logic', () => {
    let scoreSystem;

    beforeEach(() => {
        scoreSystem = new ScoreSystem();
        mockLocalStorage.clear();
    });

    describe('isHighScore', () => {
        test('returns true when scoreboard has less than 10 entries', () => {
            // With empty scoreboard, any score qualifies
            // Note: actual localStorage calls may fail in test env
            expect(scoreSystem.isHighScore(100)).toBe(true);
        });
    });

    describe('score tracking', () => {
        test('tracks kills correctly', () => {
            scoreSystem.addKill();
            scoreSystem.addKill();
            scoreSystem.addKill();

            expect(scoreSystem.getScore()).toBe(CONFIG.GAMEPLAY.scorePerKill * 3);
        });

        test('tracks boss kills with bonus', () => {
            scoreSystem.addBossKill();

            expect(scoreSystem.getScore()).toBe(CONFIG.GAMEPLAY.bossRewardScore);
            expect(scoreSystem.getPower()).toBe(CONFIG.GAMEPLAY.bossRewardPower);
        });

        test('power accumulates correctly', () => {
            const killsToFill = CONFIG.GAMEPLAY.turiaPowerMax / CONFIG.GAMEPLAY.turiaPowerPerKill;

            for (let i = 0; i < killsToFill; i++) {
                scoreSystem.addKill();
            }

            expect(scoreSystem.isPowerReady()).toBe(true);
        });
    });

    describe('player name handling', () => {
        test('stores and retrieves player name', () => {
            scoreSystem.setPlayerName('TESTER');
            expect(scoreSystem.getPlayerName()).toBe('TESTER');
        });

        test('converts name to uppercase', () => {
            scoreSystem.setPlayerName('lowercase');
            expect(scoreSystem.getPlayerName()).toBe('LOWERCASE');
        });

        test('truncates long names', () => {
            scoreSystem.setPlayerName('VERYLONGNAMETHATEXCEEDSLIMIT');
            expect(scoreSystem.getPlayerName().length).toBeLessThanOrEqual(10);
        });

        test('handles empty name', () => {
            scoreSystem.setPlayerName('');
            expect(scoreSystem.getPlayerName()).toBe('');
        });
    });

    describe('save and load (mocked)', () => {
        test('saveScore returns false without player name', () => {
            scoreSystem.score = 1000;
            scoreSystem.playerName = '';

            const result = scoreSystem.saveScore();

            expect(result).toBe(false);
        });

        test('saveScore returns false with zero score', () => {
            scoreSystem.setPlayerName('TEST');
            scoreSystem.score = 0;

            const result = scoreSystem.saveScore();

            expect(result).toBe(false);
        });

        test('getScoreboard returns array', () => {
            const scoreboard = scoreSystem.getScoreboard();
            expect(Array.isArray(scoreboard)).toBe(true);
        });
    });

    describe('getCurrentRank', () => {
        test('returns 0 when player not in scoreboard', () => {
            scoreSystem.setPlayerName('NOTFOUND');
            scoreSystem.score = 999999;

            const rank = scoreSystem.getCurrentRank();

            expect(rank).toBe(0);
        });
    });
});

describe('ScoreSystem - Integration', () => {
    test('full game flow simulation', () => {
        const scoreSystem = new ScoreSystem();

        // Set player
        scoreSystem.setPlayerName('PLAYER1');
        expect(scoreSystem.getPlayerName()).toBe('PLAYER1');

        // Start fresh
        scoreSystem.reset();
        expect(scoreSystem.getScore()).toBe(0);
        expect(scoreSystem.getLives()).toBe(CONFIG.GAMEPLAY.livesMax);
        expect(scoreSystem.getPower()).toBe(0);

        // Kill some enemies
        for (let i = 0; i < 5; i++) {
            scoreSystem.addKill();
        }

        expect(scoreSystem.getScore()).toBe(50);
        expect(scoreSystem.getPower()).toBe(50);

        // Fill power bar
        for (let i = 0; i < 5; i++) {
            scoreSystem.addKill();
        }

        expect(scoreSystem.isPowerReady()).toBe(true);

        // Use power
        expect(scoreSystem.consumePower()).toBe(true);
        expect(scoreSystem.getPower()).toBe(0);
        expect(scoreSystem.isPowerReady()).toBe(false);

        // Cannot use again
        expect(scoreSystem.consumePower()).toBe(false);

        // Lose lives
        scoreSystem.loseLife();
        expect(scoreSystem.getLives()).toBe(2);
        expect(scoreSystem.isGameOver()).toBe(false);

        scoreSystem.loseLife();
        scoreSystem.loseLife();
        expect(scoreSystem.getLives()).toBe(0);
        expect(scoreSystem.isGameOver()).toBe(true);
    });

    test('power percentage calculation', () => {
        const scoreSystem = new ScoreSystem();

        expect(scoreSystem.getPowerPercentage()).toBe(0);

        scoreSystem.addPower(25);
        expect(scoreSystem.getPowerPercentage()).toBe(0.25);

        scoreSystem.addPower(25);
        expect(scoreSystem.getPowerPercentage()).toBe(0.5);

        scoreSystem.addPower(50);
        expect(scoreSystem.getPowerPercentage()).toBe(1);

        // Cannot exceed max
        scoreSystem.addPower(100);
        expect(scoreSystem.getPowerPercentage()).toBe(1);
    });
});
