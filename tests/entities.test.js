/**
 * TURIA INVADERS - Entity Tests
 * Unit tests for Player, Bullet, and InputSystem
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import { Player } from '../js/entities/Player.js';
import { Bullet } from '../js/entities/Bullet.js';
import { InputSystem } from '../js/systems/InputSystem.js';
import { CONFIG } from '../js/config.js';

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(400, 550);
    });

    test('initializes with correct position', () => {
        expect(player.x).toBe(400);
        expect(player.y).toBe(550);
    });

    test('initializes with config dimensions', () => {
        expect(player.width).toBe(CONFIG.SIZES.player.width);
        expect(player.height).toBe(CONFIG.SIZES.player.height);
    });

    test('initializes with zero fire cooldown', () => {
        expect(player.fireCooldown).toBe(0);
    });

    test('canShoot returns true when cooldown is zero', () => {
        player.fireCooldown = 0;
        expect(player.canShoot()).toBe(true);
    });

    test('canShoot returns false when cooldown is active', () => {
        player.fireCooldown = 100;
        expect(player.canShoot()).toBe(false);
    });

    test('shoot creates bullet when cooldown ready', () => {
        player.fireCooldown = 0;
        const bullet = player.shoot();

        expect(bullet).not.toBeNull();
        expect(bullet).toBeInstanceOf(Bullet);
    });

    test('shoot returns null when cooldown active', () => {
        player.fireCooldown = 100;
        const bullet = player.shoot();

        expect(bullet).toBeNull();
    });

    test('shoot sets cooldown after firing', () => {
        player.fireCooldown = 0;
        player.shoot();

        expect(player.fireCooldown).toBe(CONFIG.GAMEPLAY.fireCooldown);
    });

    test('shoot creates bullet at player position', () => {
        const bullet = player.shoot();

        expect(bullet.x).toBe(player.x);
        expect(bullet.y).toBe(player.y - player.height / 2);
    });

    test('shoot creates bullet with upward velocity', () => {
        const bullet = player.shoot();

        expect(bullet.velocityY).toBeLessThan(0);
    });

    test('getBounds returns correct bounding box', () => {
        const bounds = player.getBounds();

        expect(bounds.x).toBe(player.x - player.width / 2);
        expect(bounds.y).toBe(player.y - player.height / 2);
        expect(bounds.width).toBe(player.width);
        expect(bounds.height).toBe(player.height);
    });

    test('update moves player left when left is pressed', () => {
        const mockInput = {
            isPressed: (action) => action === 'left'
        };
        const initialX = player.x;

        player.update(0.1, mockInput, 800);

        expect(player.x).toBeLessThan(initialX);
    });

    test('update moves player right when right is pressed', () => {
        const mockInput = {
            isPressed: (action) => action === 'right'
        };
        const initialX = player.x;

        player.update(0.1, mockInput, 800);

        expect(player.x).toBeGreaterThan(initialX);
    });

    test('update clamps player to left boundary', () => {
        player.x = 10;
        const mockInput = {
            isPressed: (action) => action === 'left'
        };

        player.update(1, mockInput, 800);

        expect(player.x).toBeGreaterThanOrEqual(player.width / 2);
    });

    test('update clamps player to right boundary', () => {
        player.x = 790;
        const mockInput = {
            isPressed: (action) => action === 'right'
        };

        player.update(1, mockInput, 800);

        expect(player.x).toBeLessThanOrEqual(800 - player.width / 2);
    });

    test('update decreases fire cooldown', () => {
        player.fireCooldown = 200;
        const mockInput = { isPressed: () => false };

        player.update(0.1, mockInput, 800); // 100ms

        expect(player.fireCooldown).toBeLessThan(200);
    });

    test('reset restores player to center position', () => {
        player.x = 100;
        player.fireCooldown = 500;

        player.reset(800);

        expect(player.x).toBe(400);
        expect(player.fireCooldown).toBe(0);
    });
});

describe('Bullet', () => {
    let bullet;

    beforeEach(() => {
        bullet = new Bullet(100, 200, -500);
    });

    test('initializes with correct position', () => {
        expect(bullet.x).toBe(100);
        expect(bullet.y).toBe(200);
    });

    test('initializes with correct velocity', () => {
        expect(bullet.velocityY).toBe(-500);
    });

    test('initializes as active', () => {
        expect(bullet.active).toBe(true);
    });

    test('initializes with config dimensions', () => {
        expect(bullet.width).toBe(CONFIG.SIZES.bullet.width);
        expect(bullet.height).toBe(CONFIG.SIZES.bullet.height);
    });

    test('update moves bullet by velocity', () => {
        const initialY = bullet.y;

        bullet.update(0.1); // 100ms

        expect(bullet.y).toBe(initialY + bullet.velocityY * 0.1);
    });

    test('update moves bullet upward when velocity is negative', () => {
        const initialY = bullet.y;

        bullet.update(0.1);

        expect(bullet.y).toBeLessThan(initialY);
    });

    test('isOffScreen returns true when above screen', () => {
        bullet.y = -20;

        expect(bullet.isOffScreen(600)).toBe(true);
    });

    test('isOffScreen returns true when below screen', () => {
        bullet.y = 650;

        expect(bullet.isOffScreen(600)).toBe(true);
    });

    test('isOffScreen returns false when on screen', () => {
        bullet.y = 300;

        expect(bullet.isOffScreen(600)).toBe(false);
    });

    test('destroy sets active to false', () => {
        bullet.destroy();

        expect(bullet.active).toBe(false);
    });

    test('getBounds returns correct bounding box', () => {
        const bounds = bullet.getBounds();

        expect(bounds.x).toBe(bullet.x - bullet.width / 2);
        expect(bounds.y).toBe(bullet.y - bullet.height / 2);
        expect(bounds.width).toBe(bullet.width);
        expect(bounds.height).toBe(bullet.height);
    });
});

describe('InputSystem', () => {
    let input;

    beforeEach(() => {
        input = new InputSystem();
    });

    test('initializes with empty key states', () => {
        expect(Object.keys(input.keys).length).toBe(0);
        expect(Object.keys(input.justPressedKeys).length).toBe(0);
    });

    test('isPressed returns false for unpressed action', () => {
        expect(input.isPressed('left')).toBe(false);
    });

    test('isPressed returns true when key is set', () => {
        // Simulate pressing ArrowLeft
        input.keys['ArrowLeft'] = true;

        expect(input.isPressed('left')).toBe(true);
    });

    test('isPressed works with alternative keys', () => {
        // KeyA is alternative for left
        input.keys['KeyA'] = true;

        expect(input.isPressed('left')).toBe(true);
    });

    test('justPressed returns false initially', () => {
        expect(input.justPressed('shoot')).toBe(false);
    });

    test('justPressed returns true when key just pressed', () => {
        input.justPressedKeys['Space'] = true;

        expect(input.justPressed('shoot')).toBe(true);
    });

    test('update clears justPressed states', () => {
        input.justPressedKeys['Space'] = true;

        input.update();

        expect(input.justPressed('shoot')).toBe(false);
    });

    test('update clears justReleased states', () => {
        input.justReleasedKeys['Space'] = true;

        input.update();

        expect(input.justReleased('shoot')).toBe(false);
    });

    test('reset clears all key states', () => {
        input.keys['ArrowLeft'] = true;
        input.keys['Space'] = true;
        input.justPressedKeys['KeyA'] = true;

        input.reset();

        expect(Object.keys(input.keys).length).toBe(0);
        expect(Object.keys(input.justPressedKeys).length).toBe(0);
    });

    test('isKeyPressed returns state of specific key', () => {
        input.keys['KeyW'] = true;

        expect(input.isKeyPressed('KeyW')).toBe(true);
        expect(input.isKeyPressed('KeyS')).toBe(false);
    });

    test('handleKeyDown sets key state to true', () => {
        const mockEvent = {
            code: 'Space',
            preventDefault: () => {}
        };

        input.handleKeyDown(mockEvent);

        expect(input.keys['Space']).toBe(true);
    });

    test('handleKeyDown sets justPressed for new key', () => {
        const mockEvent = {
            code: 'Space',
            preventDefault: () => {}
        };

        input.handleKeyDown(mockEvent);

        expect(input.justPressedKeys['Space']).toBe(true);
    });

    test('handleKeyDown does not set justPressed for held key', () => {
        input.keys['Space'] = true;
        const mockEvent = {
            code: 'Space',
            preventDefault: () => {}
        };

        input.handleKeyDown(mockEvent);

        expect(input.justPressedKeys['Space']).toBeUndefined();
    });

    test('handleKeyUp sets key state to false', () => {
        input.keys['Space'] = true;
        const mockEvent = { code: 'Space' };

        input.handleKeyUp(mockEvent);

        expect(input.keys['Space']).toBe(false);
    });

    test('handleKeyUp sets justReleased', () => {
        const mockEvent = { code: 'Space' };

        input.handleKeyUp(mockEvent);

        expect(input.justReleasedKeys['Space']).toBe(true);
    });

    test('isGameKey returns true for configured keys', () => {
        expect(input.isGameKey('ArrowLeft')).toBe(true);
        expect(input.isGameKey('Space')).toBe(true);
        expect(input.isGameKey('KeyE')).toBe(true);
    });

    test('isGameKey returns false for non-game keys', () => {
        expect(input.isGameKey('KeyZ')).toBe(false);
        expect(input.isGameKey('F1')).toBe(false);
    });
});
