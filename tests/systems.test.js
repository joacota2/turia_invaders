/**
 * TURIA INVADERS - System Tests
 * Unit tests for CollisionSystem and ScoreSystem
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import { CollisionSystem } from '../js/systems/CollisionSystem.js';
import { ScoreSystem } from '../js/systems/ScoreSystem.js';
import { SpawnSystem } from '../js/systems/SpawnSystem.js';
import { Enemy, EnemyType, FormationController } from '../js/entities/Enemy.js';
import { Bullet } from '../js/entities/Bullet.js';
import { CONFIG } from '../js/config.js';

describe('CollisionSystem', () => {
    let collisionSystem;

    beforeEach(() => {
        collisionSystem = new CollisionSystem();
    });

    test('initializes with empty events', () => {
        expect(collisionSystem.getEvents().length).toBe(0);
    });

    test('clear removes all events', () => {
        collisionSystem.events = [{ type: 'test' }];
        collisionSystem.clear();
        expect(collisionSystem.getEvents().length).toBe(0);
    });

    describe('checkBulletEnemyCollisions', () => {
        test('detects collision between bullet and enemy', () => {
            const bullet = new Bullet(100, 100, -500);
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);
            const formationOffset = { x: 0, y: 0 };

            const collisions = collisionSystem.checkBulletEnemyCollisions(
                [bullet],
                [enemy],
                formationOffset
            );

            expect(collisions.length).toBe(1);
            expect(collisions[0].type).toBe('bullet_enemy');
            expect(collisions[0].bullet).toBe(bullet);
            expect(collisions[0].enemy).toBe(enemy);
        });

        test('destroys bullet on collision', () => {
            const bullet = new Bullet(100, 100, -500);
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);

            collisionSystem.checkBulletEnemyCollisions([bullet], [enemy], { x: 0, y: 0 });

            expect(bullet.active).toBe(false);
        });

        test('kills enemy on collision', () => {
            const bullet = new Bullet(100, 100, -500);
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);

            collisionSystem.checkBulletEnemyCollisions([bullet], [enemy], { x: 0, y: 0 });

            expect(enemy.dying).toBe(true);
        });

        test('does not detect collision when no overlap', () => {
            const bullet = new Bullet(100, 100, -500);
            const enemy = new Enemy(500, 500, EnemyType.TYPE1);

            const collisions = collisionSystem.checkBulletEnemyCollisions(
                [bullet],
                [enemy],
                { x: 0, y: 0 }
            );

            expect(collisions.length).toBe(0);
        });

        test('ignores inactive bullets', () => {
            const bullet = new Bullet(100, 100, -500);
            bullet.destroy();
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);

            const collisions = collisionSystem.checkBulletEnemyCollisions(
                [bullet],
                [enemy],
                { x: 0, y: 0 }
            );

            expect(collisions.length).toBe(0);
        });

        test('ignores dead enemies', () => {
            const bullet = new Bullet(100, 100, -500);
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);
            enemy.alive = false;

            const collisions = collisionSystem.checkBulletEnemyCollisions(
                [bullet],
                [enemy],
                { x: 0, y: 0 }
            );

            expect(collisions.length).toBe(0);
        });

        test('respects formation offset', () => {
            const bullet = new Bullet(200, 200, -500);
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);
            // With offset (100, 100), enemy world position becomes (200, 200)
            const formationOffset = { x: 100, y: 100 };

            const collisions = collisionSystem.checkBulletEnemyCollisions(
                [bullet],
                [enemy],
                formationOffset
            );

            expect(collisions.length).toBe(1);
        });
    });

    describe('checkEnemyReachBottom', () => {
        test('returns true when enemy crosses bottom line', () => {
            const enemy = new Enemy(100, 520, EnemyType.TYPE1);
            // Enemy at y=520 + height/2 = 536 which is >= 520 (default bottom line)

            const result = collisionSystem.checkEnemyReachBottom(
                [enemy],
                { x: 0, y: 0 },
                520
            );

            expect(result).toBe(true);
        });

        test('returns false when enemies are above bottom line', () => {
            const enemy = new Enemy(100, 100, EnemyType.TYPE1);

            const result = collisionSystem.checkEnemyReachBottom(
                [enemy],
                { x: 0, y: 0 },
                520
            );

            expect(result).toBe(false);
        });

        test('ignores dead enemies', () => {
            const enemy = new Enemy(100, 550, EnemyType.TYPE1);
            enemy.alive = false;

            const result = collisionSystem.checkEnemyReachBottom(
                [enemy],
                { x: 0, y: 0 },
                520
            );

            expect(result).toBe(false);
        });

        test('adds event when enemy reaches bottom', () => {
            const enemy = new Enemy(100, 520, EnemyType.TYPE1);

            collisionSystem.checkEnemyReachBottom([enemy], { x: 0, y: 0 }, 520);

            const events = collisionSystem.getEventsByType('enemy_reach_bottom');
            expect(events.length).toBe(1);
        });
    });

    describe('getEventsByType', () => {
        test('filters events by type', () => {
            collisionSystem.events = [
                { type: 'bullet_enemy' },
                { type: 'bullet_boss' },
                { type: 'bullet_enemy' }
            ];

            const bulletEnemyEvents = collisionSystem.getEventsByType('bullet_enemy');

            expect(bulletEnemyEvents.length).toBe(2);
        });
    });
});

describe('ScoreSystem', () => {
    let scoreSystem;

    beforeEach(() => {
        scoreSystem = new ScoreSystem();
        // Clear any existing scores from previous tests
        scoreSystem.clearScoreboard();
    });

    test('initializes with zero score', () => {
        expect(scoreSystem.getScore()).toBe(0);
    });

    test('initializes with max lives', () => {
        expect(scoreSystem.getLives()).toBe(CONFIG.GAMEPLAY.livesMax);
    });

    test('initializes with zero power', () => {
        expect(scoreSystem.getPower()).toBe(0);
        expect(scoreSystem.getPowerPercentage()).toBe(0);
    });

    describe('addKill', () => {
        test('increases score by default amount', () => {
            scoreSystem.addKill();
            expect(scoreSystem.getScore()).toBe(CONFIG.GAMEPLAY.scorePerKill);
        });

        test('increases power by default amount', () => {
            scoreSystem.addKill();
            expect(scoreSystem.getPower()).toBe(CONFIG.GAMEPLAY.turiaPowerPerKill);
        });

        test('accepts custom points and power', () => {
            scoreSystem.addKill(50, 25);
            expect(scoreSystem.getScore()).toBe(50);
            expect(scoreSystem.getPower()).toBe(25);
        });
    });

    describe('addBossKill', () => {
        test('adds boss reward score', () => {
            scoreSystem.addBossKill();
            expect(scoreSystem.getScore()).toBe(CONFIG.GAMEPLAY.bossRewardScore);
        });

        test('adds boss reward power', () => {
            scoreSystem.addBossKill();
            expect(scoreSystem.getPower()).toBe(CONFIG.GAMEPLAY.bossRewardPower);
        });
    });

    describe('power management', () => {
        test('getPowerPercentage returns correct value', () => {
            scoreSystem.turiaPower = 50;
            expect(scoreSystem.getPowerPercentage()).toBe(0.5);
        });

        test('power caps at max', () => {
            scoreSystem.addPower(200);
            expect(scoreSystem.getPower()).toBe(scoreSystem.turiaPowerMax);
        });

        test('isPowerReady returns true at max', () => {
            scoreSystem.turiaPower = scoreSystem.turiaPowerMax;
            expect(scoreSystem.isPowerReady()).toBe(true);
        });

        test('isPowerReady returns false below max', () => {
            scoreSystem.turiaPower = scoreSystem.turiaPowerMax - 1;
            expect(scoreSystem.isPowerReady()).toBe(false);
        });

        test('consumePower resets power to zero', () => {
            scoreSystem.turiaPower = scoreSystem.turiaPowerMax;
            scoreSystem.consumePower();
            expect(scoreSystem.getPower()).toBe(0);
        });

        test('consumePower returns true when power was ready', () => {
            scoreSystem.turiaPower = scoreSystem.turiaPowerMax;
            expect(scoreSystem.consumePower()).toBe(true);
        });

        test('consumePower returns false when power not ready', () => {
            scoreSystem.turiaPower = 50;
            expect(scoreSystem.consumePower()).toBe(false);
        });

        test('consumePower does not reset when not ready', () => {
            scoreSystem.turiaPower = 50;
            scoreSystem.consumePower();
            expect(scoreSystem.getPower()).toBe(50);
        });
    });

    describe('lives management', () => {
        test('loseLife decrements lives', () => {
            const initialLives = scoreSystem.getLives();
            scoreSystem.loseLife();
            expect(scoreSystem.getLives()).toBe(initialLives - 1);
        });

        test('loseLife returns remaining lives', () => {
            const remaining = scoreSystem.loseLife();
            expect(remaining).toBe(scoreSystem.getLives());
        });

        test('lives cannot go below zero', () => {
            for (let i = 0; i < 10; i++) {
                scoreSystem.loseLife();
            }
            expect(scoreSystem.getLives()).toBe(0);
        });

        test('isGameOver returns true when no lives', () => {
            while (scoreSystem.getLives() > 0) {
                scoreSystem.loseLife();
            }
            expect(scoreSystem.isGameOver()).toBe(true);
        });

        test('isGameOver returns false when lives remain', () => {
            expect(scoreSystem.isGameOver()).toBe(false);
        });
    });

    describe('player name', () => {
        test('setPlayerName stores name', () => {
            scoreSystem.setPlayerName('TEST');
            expect(scoreSystem.getPlayerName()).toBe('TEST');
        });

        test('setPlayerName converts to uppercase', () => {
            scoreSystem.setPlayerName('test');
            expect(scoreSystem.getPlayerName()).toBe('TEST');
        });

        test('setPlayerName truncates to 10 chars', () => {
            scoreSystem.setPlayerName('VERYLONGPLAYERNAME');
            expect(scoreSystem.getPlayerName()).toBe('VERYLONGPL');
        });
    });

    describe('reset', () => {
        test('resets score to zero', () => {
            scoreSystem.score = 1000;
            scoreSystem.reset();
            expect(scoreSystem.getScore()).toBe(0);
        });

        test('resets lives to max', () => {
            scoreSystem.lives = 0;
            scoreSystem.reset();
            expect(scoreSystem.getLives()).toBe(CONFIG.GAMEPLAY.livesMax);
        });

        test('resets power to zero', () => {
            scoreSystem.turiaPower = 100;
            scoreSystem.reset();
            expect(scoreSystem.getPower()).toBe(0);
        });
    });
});

describe('SpawnSystem', () => {
    let spawnSystem;

    beforeEach(() => {
        spawnSystem = new SpawnSystem();
    });

    test('initializes with wave 0', () => {
        expect(spawnSystem.getWaveNumber()).toBe(0);
    });

    describe('createWave', () => {
        test('creates correct number of enemies', () => {
            const enemies = spawnSystem.createWave(4, 8);
            expect(enemies.length).toBe(32);
        });

        test('creates enemies with correct types by row', () => {
            const enemies = spawnSystem.createWave(4, 1);
            expect(enemies[0].type).toBe(EnemyType.TYPE3); // Top row
            expect(enemies[1].type).toBe(EnemyType.TYPE2); // Second row
            expect(enemies[2].type).toBe(EnemyType.TYPE1); // Third row
            expect(enemies[3].type).toBe(EnemyType.TYPE1); // Fourth row
        });

        test('enemies are alive', () => {
            const enemies = spawnSystem.createWave();
            for (const enemy of enemies) {
                expect(enemy.alive).toBe(true);
            }
        });
    });

    describe('shouldSpawnBoss', () => {
        test('returns false for wave 0', () => {
            expect(spawnSystem.shouldSpawnBoss(0)).toBe(false);
        });

        test('returns true for wave 3', () => {
            expect(spawnSystem.shouldSpawnBoss(3)).toBe(true);
        });

        test('returns true for wave 6', () => {
            expect(spawnSystem.shouldSpawnBoss(6)).toBe(true);
        });

        test('returns false for non-boss waves', () => {
            expect(spawnSystem.shouldSpawnBoss(1)).toBe(false);
            expect(spawnSystem.shouldSpawnBoss(2)).toBe(false);
            expect(spawnSystem.shouldSpawnBoss(4)).toBe(false);
        });
    });

    describe('wave management', () => {
        test('nextWave increments wave number', () => {
            spawnSystem.nextWave();
            expect(spawnSystem.getWaveNumber()).toBe(1);
        });

        test('nextWave returns new wave number', () => {
            const wave = spawnSystem.nextWave();
            expect(wave).toBe(1);
        });

        test('reset sets wave to 0', () => {
            spawnSystem.nextWave();
            spawnSystem.nextWave();
            spawnSystem.reset();
            expect(spawnSystem.getWaveNumber()).toBe(0);
        });
    });

    describe('getSpeedForWave', () => {
        test('returns base speed for wave 0', () => {
            const speed = spawnSystem.getSpeedForWave(0);
            expect(speed).toBe(CONFIG.GAMEPLAY.enemySpeed);
        });

        test('increases speed per wave', () => {
            const wave1Speed = spawnSystem.getSpeedForWave(1);
            const wave2Speed = spawnSystem.getSpeedForWave(2);
            expect(wave2Speed).toBeGreaterThan(wave1Speed);
        });
    });
});

describe('FormationController', () => {
    let formation;

    beforeEach(() => {
        formation = new FormationController();
    });

    test('initializes with zero offset', () => {
        const offset = formation.getOffset();
        expect(offset.x).toBe(0);
        expect(offset.y).toBe(0);
    });

    test('initializes moving right', () => {
        expect(formation.direction).toBe(1);
    });

    test('update moves formation horizontally', () => {
        const enemies = [new Enemy(400, 100, EnemyType.TYPE1)];
        formation.update(0.1, enemies);

        const offset = formation.getOffset();
        expect(offset.x).toBeGreaterThan(0);
    });

    test('increaseSpeed increases formation speed', () => {
        const initialSpeed = formation.speed;
        formation.increaseSpeed(10);
        expect(formation.speed).toBe(initialSpeed + 10);
    });

    test('reset resets offset and direction', () => {
        formation.offsetX = 100;
        formation.offsetY = 50;
        formation.direction = -1;

        formation.reset();

        expect(formation.offsetX).toBe(0);
        expect(formation.offsetY).toBe(0);
        expect(formation.direction).toBe(1);
    });
});
