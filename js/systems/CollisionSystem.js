/**
 * TURIA INVADERS - Collision System
 * Handles all collision detection and responses
 */

import { rectIntersect } from '../utils.js';
import { CONFIG } from '../config.js';

export class CollisionSystem {
    constructor() {
        // Store collision events for this frame
        this.events = [];
    }

    /**
     * Clears collision events from previous frame
     */
    clear() {
        this.events = [];
    }

    /**
     * Checks collisions between bullets and enemies
     * @param {Array} bullets - Array of Bullet objects
     * @param {Array} enemies - Array of Enemy objects
     * @param {Object} formationOffset - Formation offset {x, y}
     * @returns {Array} Array of collision events {bullet, enemy}
     */
    checkBulletEnemyCollisions(bullets, enemies, formationOffset) {
        const collisions = [];

        for (const bullet of bullets) {
            if (!bullet.active) continue;

            const bulletBounds = bullet.getBounds();

            for (const enemy of enemies) {
                if (!enemy.alive || enemy.dying) continue;

                const enemyBounds = enemy.getBounds(formationOffset);

                if (rectIntersect(bulletBounds, enemyBounds)) {
                    collisions.push({
                        type: 'bullet_enemy',
                        bullet,
                        enemy
                    });

                    // Mark bullet as hit (will be destroyed)
                    bullet.destroy();

                    // Start enemy death animation
                    enemy.kill();

                    // Only one collision per bullet
                    break;
                }
            }
        }

        this.events.push(...collisions);
        return collisions;
    }

    /**
     * Checks collisions between bullets and boss
     * @param {Array} bullets - Array of Bullet objects
     * @param {Object} boss - Boss object (or null)
     * @returns {Array} Array of collision events {bullet, boss, damage}
     */
    checkBulletBossCollisions(bullets, boss) {
        if (!boss || !boss.active) return [];

        const collisions = [];
        const bossBounds = boss.getBounds();

        for (const bullet of bullets) {
            if (!bullet.active) continue;

            const bulletBounds = bullet.getBounds();

            if (rectIntersect(bulletBounds, bossBounds)) {
                collisions.push({
                    type: 'bullet_boss',
                    bullet,
                    boss,
                    damage: 1
                });

                bullet.destroy();
            }
        }

        this.events.push(...collisions);
        return collisions;
    }

    /**
     * Checks if any enemy has reached the bottom line
     * @param {Array} enemies - Array of Enemy objects
     * @param {Object} formationOffset - Formation offset {x, y}
     * @param {number} bottomLine - Y coordinate of bottom line (default from config)
     * @returns {boolean} True if any enemy crossed the line
     */
    checkEnemyReachBottom(enemies, formationOffset, bottomLine = CONFIG.GAMEPLAY.bottomLine) {
        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const worldPos = enemy.getWorldPosition(formationOffset);
            const bottomY = worldPos.y + enemy.height / 2;

            if (bottomY >= bottomLine) {
                this.events.push({
                    type: 'enemy_reach_bottom',
                    enemy
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Checks collision between player and powerup
     * @param {Object} player - Player object
     * @param {Array} powerups - Array of powerup objects
     * @returns {Array} Array of collision events {player, powerup}
     */
    checkPlayerPowerupCollisions(player, powerups) {
        const collisions = [];
        const playerBounds = player.getBounds();

        for (const powerup of powerups) {
            if (!powerup.active) continue;

            const powerupBounds = powerup.getBounds();

            if (rectIntersect(playerBounds, powerupBounds)) {
                collisions.push({
                    type: 'player_powerup',
                    player,
                    powerup
                });

                powerup.active = false;
            }
        }

        this.events.push(...collisions);
        return collisions;
    }

    /**
     * Checks collisions between power attack projectiles and enemies
     * @param {Array} projectiles - Array of power attack projectile objects
     * @param {Array} enemies - Array of Enemy objects
     * @param {Object} formationOffset - Formation offset {x, y}
     * @returns {Array} Array of collision events {projectile, enemy}
     */
    checkPowerAttackEnemyCollisions(projectiles, enemies, formationOffset) {
        const collisions = [];

        for (const projectile of projectiles) {
            if (!projectile.active) continue;

            const projectileBounds = projectile.getBounds();

            for (const enemy of enemies) {
                if (!enemy.alive || enemy.dying) continue;

                const enemyBounds = enemy.getBounds(formationOffset);

                if (rectIntersect(projectileBounds, enemyBounds)) {
                    collisions.push({
                        type: 'power_enemy',
                        projectile,
                        enemy
                    });

                    enemy.kill();
                }
            }
        }

        this.events.push(...collisions);
        return collisions;
    }

    /**
     * Checks collisions between power attack projectiles and boss
     * @param {Array} projectiles - Array of power attack projectile objects
     * @param {Object} boss - Boss object (or null)
     * @returns {Array} Array of collision events {projectile, boss, damage}
     */
    checkPowerAttackBossCollisions(projectiles, boss) {
        if (!boss || !boss.active) return [];

        const collisions = [];
        const bossBounds = boss.getBounds();

        for (const projectile of projectiles) {
            if (!projectile.active) continue;

            const projectileBounds = projectile.getBounds();

            if (rectIntersect(projectileBounds, bossBounds)) {
                collisions.push({
                    type: 'power_boss',
                    projectile,
                    boss,
                    damage: 1
                });

                projectile.active = false;
            }
        }

        this.events.push(...collisions);
        return collisions;
    }

    /**
     * Gets all collision events from this frame
     * @returns {Array} All collision events
     */
    getEvents() {
        return this.events;
    }

    /**
     * Gets collision events of a specific type
     * @param {string} type - Event type
     * @returns {Array} Filtered collision events
     */
    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }
}
