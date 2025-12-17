/**
 * TURIA INVADERS - Utility Functions
 * Pure functions for common operations
 */

/**
 * Clamps a value between min and max
 * @param {number} val - Value to clamp
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 * @returns {number} Clamped value
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Checks if two rectangles intersect (AABB collision)
 * @param {Object} a - First rectangle {x, y, width, height}
 * @param {Object} b - Second rectangle {x, y, width, height}
 * @returns {boolean} True if rectangles intersect
 */
export function rectIntersect(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * Calculates distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Gets direction vectors for 8 cardinal directions
 * @returns {Array<{x: number, y: number}>} Array of direction vectors
 */
export function getEightDirections() {
    return [
        { x: 0, y: -1 },   // N
        { x: 1, y: -1 },   // NE
        { x: 1, y: 0 },    // E
        { x: 1, y: 1 },    // SE
        { x: 0, y: 1 },    // S
        { x: -1, y: 1 },   // SW
        { x: -1, y: 0 },   // W
        { x: -1, y: -1 }   // NW
    ].map(dir => {
        // Normalize diagonal directions
        const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        return { x: dir.x / len, y: dir.y / len };
    });
}
