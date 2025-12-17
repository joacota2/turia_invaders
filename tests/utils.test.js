/**
 * TURIA INVADERS - Utils Tests
 * Unit tests for utility functions
 */

import { describe, expect, test } from 'bun:test';
import {
    clamp,
    rectIntersect,
    randomRange,
    randomInt,
    distance,
    lerp,
    degToRad,
    getEightDirections
} from '../js/utils.js';

describe('clamp', () => {
    test('returns value when within bounds', () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });

    test('returns min when value is below', () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });

    test('returns max when value is above', () => {
        expect(clamp(15, 0, 10)).toBe(10);
    });

    test('handles edge cases at boundaries', () => {
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });

    test('handles negative ranges', () => {
        expect(clamp(-5, -10, -1)).toBe(-5);
        expect(clamp(-15, -10, -1)).toBe(-10);
        expect(clamp(0, -10, -1)).toBe(-1);
    });
});

describe('rectIntersect', () => {
    test('detects overlapping rectangles', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        const b = { x: 5, y: 5, width: 10, height: 10 };
        expect(rectIntersect(a, b)).toBe(true);
    });

    test('detects non-overlapping rectangles', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        const b = { x: 20, y: 20, width: 10, height: 10 };
        expect(rectIntersect(a, b)).toBe(false);
    });

    test('detects edge-touching rectangles as non-overlapping', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        const b = { x: 10, y: 0, width: 10, height: 10 };
        expect(rectIntersect(a, b)).toBe(false);
    });

    test('detects contained rectangle', () => {
        const a = { x: 0, y: 0, width: 20, height: 20 };
        const b = { x: 5, y: 5, width: 5, height: 5 };
        expect(rectIntersect(a, b)).toBe(true);
    });

    test('handles same rectangle', () => {
        const a = { x: 0, y: 0, width: 10, height: 10 };
        expect(rectIntersect(a, a)).toBe(true);
    });
});

describe('randomRange', () => {
    test('returns value within range', () => {
        for (let i = 0; i < 100; i++) {
            const val = randomRange(0, 10);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(10);
        }
    });

    test('handles negative ranges', () => {
        for (let i = 0; i < 100; i++) {
            const val = randomRange(-10, -5);
            expect(val).toBeGreaterThanOrEqual(-10);
            expect(val).toBeLessThanOrEqual(-5);
        }
    });

    test('handles decimal ranges', () => {
        for (let i = 0; i < 100; i++) {
            const val = randomRange(0.5, 1.5);
            expect(val).toBeGreaterThanOrEqual(0.5);
            expect(val).toBeLessThanOrEqual(1.5);
        }
    });
});

describe('randomInt', () => {
    test('returns integer within range', () => {
        for (let i = 0; i < 100; i++) {
            const val = randomInt(0, 10);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(10);
            expect(Number.isInteger(val)).toBe(true);
        }
    });

    test('can return boundary values', () => {
        const results = new Set();
        for (let i = 0; i < 1000; i++) {
            results.add(randomInt(0, 2));
        }
        expect(results.has(0)).toBe(true);
        expect(results.has(2)).toBe(true);
    });
});

describe('distance', () => {
    test('calculates distance between two points', () => {
        expect(distance(0, 0, 3, 4)).toBe(5);
    });

    test('returns 0 for same point', () => {
        expect(distance(5, 5, 5, 5)).toBe(0);
    });

    test('handles negative coordinates', () => {
        expect(distance(-3, -4, 0, 0)).toBe(5);
    });
});

describe('lerp', () => {
    test('returns start value at t=0', () => {
        expect(lerp(0, 100, 0)).toBe(0);
    });

    test('returns end value at t=1', () => {
        expect(lerp(0, 100, 1)).toBe(100);
    });

    test('returns midpoint at t=0.5', () => {
        expect(lerp(0, 100, 0.5)).toBe(50);
    });

    test('handles negative values', () => {
        expect(lerp(-100, 100, 0.5)).toBe(0);
    });
});

describe('degToRad', () => {
    test('converts 0 degrees', () => {
        expect(degToRad(0)).toBe(0);
    });

    test('converts 180 degrees', () => {
        expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    });

    test('converts 90 degrees', () => {
        expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 10);
    });

    test('converts 360 degrees', () => {
        expect(degToRad(360)).toBeCloseTo(Math.PI * 2, 10);
    });
});

describe('getEightDirections', () => {
    test('returns 8 directions', () => {
        const directions = getEightDirections();
        expect(directions.length).toBe(8);
    });

    test('all directions are normalized', () => {
        const directions = getEightDirections();
        for (const dir of directions) {
            const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            expect(length).toBeCloseTo(1, 5);
        }
    });

    test('contains cardinal directions', () => {
        const directions = getEightDirections();
        // North (0, -1)
        expect(directions.some(d => d.x === 0 && d.y === -1)).toBe(true);
        // East (1, 0)
        expect(directions.some(d => d.x === 1 && d.y === 0)).toBe(true);
        // South (0, 1)
        expect(directions.some(d => d.x === 0 && d.y === 1)).toBe(true);
        // West (-1, 0)
        expect(directions.some(d => d.x === -1 && d.y === 0)).toBe(true);
    });
});
