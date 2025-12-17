/**
 * TURIA INVADERS - Input System
 * Handles keyboard input for game controls
 */

import { CONFIG } from '../config.js';

export class InputSystem {
    constructor() {
        // Current state of keys (pressed or not)
        this.keys = {};

        // Keys that were just pressed this frame
        this.justPressedKeys = {};

        // Keys that were just released this frame
        this.justReleasedKeys = {};

        // Bind event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Track if listeners are attached
        this.listening = false;
    }

    /**
     * Starts listening for keyboard events
     */
    start() {
        if (this.listening) return;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.listening = true;
    }

    /**
     * Stops listening for keyboard events
     */
    stop() {
        if (!this.listening) return;

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.listening = false;
    }

    /**
     * Handles keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (!this.keys[e.code]) {
            this.justPressedKeys[e.code] = true;
        }
        this.keys[e.code] = true;

        // Prevent default for game keys to avoid scrolling
        if (this.isGameKey(e.code)) {
            e.preventDefault();
        }
    }

    /**
     * Handles keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
        this.justReleasedKeys[e.code] = true;
    }

    /**
     * Checks if a key code is used by the game
     * @param {string} code - Key code
     * @returns {boolean} True if key is used by game
     */
    isGameKey(code) {
        const allKeys = [
            ...CONFIG.KEYS.left,
            ...CONFIG.KEYS.right,
            ...CONFIG.KEYS.shoot,
            ...CONFIG.KEYS.power
        ];
        return allKeys.includes(code);
    }

    /**
     * Checks if an action key is currently pressed
     * @param {string} action - Action name (left, right, shoot, power)
     * @returns {boolean} True if any key for action is pressed
     */
    isPressed(action) {
        const keyCodes = CONFIG.KEYS[action];
        if (!keyCodes) return false;

        return keyCodes.some(code => this.keys[code]);
    }

    /**
     * Checks if an action key was just pressed this frame
     * @param {string} action - Action name (left, right, shoot, power)
     * @returns {boolean} True if any key for action was just pressed
     */
    justPressed(action) {
        const keyCodes = CONFIG.KEYS[action];
        if (!keyCodes) return false;

        return keyCodes.some(code => this.justPressedKeys[code]);
    }

    /**
     * Checks if an action key was just released this frame
     * @param {string} action - Action name (left, right, shoot, power)
     * @returns {boolean} True if any key for action was just released
     */
    justReleased(action) {
        const keyCodes = CONFIG.KEYS[action];
        if (!keyCodes) return false;

        return keyCodes.some(code => this.justReleasedKeys[code]);
    }

    /**
     * Checks if a specific key code is pressed
     * @param {string} code - Key code (e.g., 'KeyA', 'Space')
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed(code) {
        return !!this.keys[code];
    }

    /**
     * Clears the just pressed/released states
     * Should be called at the end of each frame
     */
    update() {
        this.justPressedKeys = {};
        this.justReleasedKeys = {};
    }

    /**
     * Resets all key states
     */
    reset() {
        this.keys = {};
        this.justPressedKeys = {};
        this.justReleasedKeys = {};
    }
}
