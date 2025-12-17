/**
 * TURIA INVADERS - Menu State
 * Title screen with name input
 */

import { CONFIG } from '../config.js';

export class MenuState {
    constructor() {
        this.game = null;
        this.playerName = '';
        this.maxNameLength = 10;
        this.minNameLength = 3;
        this.cursorBlink = 0;
        this.cursorVisible = true;

        // Animation
        this.titleBounce = 0;
        this.pressStartBlink = 0;

        // Input state
        this.inputActive = true;

        // Bind keyboard handler
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Called when entering this state
     * @param {Object} data - Optional data passed from previous state
     */
    enter(data = {}) {
        this.playerName = data.playerName || '';
        this.inputActive = true;

        // Add keyboard listener for name input
        window.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Called when exiting this state
     */
    exit() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Handles keyboard input for name entry
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (!this.inputActive) return;

        // Handle Enter to start game
        if (e.key === 'Enter') {
            if (this.playerName.length >= this.minNameLength) {
                this.startGame();
            }
            return;
        }

        // Handle Backspace
        if (e.key === 'Backspace') {
            this.playerName = this.playerName.slice(0, -1);
            return;
        }

        // Handle letter/number input
        if (e.key.length === 1 && this.playerName.length < this.maxNameLength) {
            const char = e.key.toUpperCase();
            // Only allow alphanumeric
            if (/[A-Z0-9]/.test(char)) {
                this.playerName += char;
            }
        }
    }

    /**
     * Starts the game with current player name
     */
    startGame() {
        this.inputActive = false;
        this.game.changeState('play', {
            playerName: this.playerName
        });
    }

    /**
     * Updates menu animations
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Cursor blink
        this.cursorBlink += dt * 1000;
        if (this.cursorBlink >= 500) {
            this.cursorBlink = 0;
            this.cursorVisible = !this.cursorVisible;
        }

        // Title bounce animation
        this.titleBounce += dt * 3;

        // Press Start blink
        this.pressStartBlink += dt * 1000;
    }

    /**
     * Renders the menu screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const centerX = CONFIG.CANVAS.width / 2;

        // Title with bounce effect
        const titleY = 120 + Math.sin(this.titleBounce) * 5;
        this.renderTitle(ctx, centerX, titleY);

        // Instructions
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textDim;
        ctx.textAlign = 'center';
        ctx.fillText('DEFEND EARTH FROM THE ALIEN INVASION!', centerX, 200);

        // Name input section
        this.renderNameInput(ctx, centerX, 280);

        // Controls info
        this.renderControls(ctx, centerX, 420);

        // Press Start prompt
        this.renderStartPrompt(ctx, centerX, 520);

        // High scores preview
        this.renderHighScores(ctx, centerX, 560);
    }

    /**
     * Renders the game title
     */
    renderTitle(ctx, x, y) {
        ctx.save();

        // Glow effect
        ctx.shadowColor = CONFIG.COLORS.powerBarFill;
        ctx.shadowBlur = 20;

        // Title text
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.textAlign = 'center';
        ctx.fillText(CONFIG.GAME_TITLE, x, y);

        // Subtitle
        ctx.shadowBlur = 10;
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textHighlight;
        ctx.fillText('SPACE DEFENDER', x, y + 35);

        ctx.restore();
    }

    /**
     * Renders the name input field
     */
    renderNameInput(ctx, x, y) {
        ctx.save();

        // Label
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.textAlign = 'center';
        ctx.fillText('ENTER YOUR NAME', x, y);

        // Input box background
        const boxWidth = 240;
        const boxHeight = 40;
        const boxX = x - boxWidth / 2;
        const boxY = y + 15;

        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = CONFIG.COLORS.text;
        ctx.lineWidth = 2;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Name text
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textHighlight;
        ctx.textAlign = 'left';

        const displayName = this.playerName + (this.cursorVisible ? '_' : ' ');
        ctx.fillText(displayName, boxX + 10, boxY + 28);

        // Character count
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = this.playerName.length >= this.minNameLength ?
            CONFIG.COLORS.text : CONFIG.COLORS.enemy1;
        ctx.textAlign = 'right';
        ctx.fillText(`${this.playerName.length}/${this.maxNameLength}`, boxX + boxWidth - 10, boxY + boxHeight + 15);

        // Min length hint
        if (this.playerName.length < this.minNameLength) {
            ctx.textAlign = 'center';
            ctx.fillStyle = CONFIG.COLORS.enemy1;
            ctx.fillText(`(MIN ${this.minNameLength} CHARS)`, x, boxY + boxHeight + 35);
        }

        ctx.restore();
    }

    /**
     * Renders control instructions
     */
    renderControls(ctx, x, y) {
        ctx.save();
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        const controls = [
            ['ARROW KEYS / A,D', 'MOVE'],
            ['SPACE', 'SHOOT'],
            ['E / SHIFT', 'TURIA POWER']
        ];

        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.fillText('CONTROLS', x, y);

        controls.forEach((control, i) => {
            ctx.fillStyle = CONFIG.COLORS.textHighlight;
            ctx.fillText(control[0], x - 80, y + 25 + i * 20);
            ctx.fillStyle = CONFIG.COLORS.textDim;
            ctx.fillText(control[1], x + 80, y + 25 + i * 20);
        });

        ctx.restore();
    }

    /**
     * Renders the start game prompt
     */
    renderStartPrompt(ctx, x, y) {
        if (this.playerName.length < this.minNameLength) return;

        ctx.save();

        // Blink effect
        const visible = Math.floor(this.pressStartBlink / 500) % 2 === 0;
        if (visible) {
            ctx.shadowColor = CONFIG.COLORS.textHighlight;
            ctx.shadowBlur = 15;
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillStyle = CONFIG.COLORS.textHighlight;
            ctx.textAlign = 'center';
            ctx.fillText('PRESS ENTER TO START', x, y);
        }

        ctx.restore();
    }

    /**
     * Renders high scores preview
     */
    renderHighScores(ctx, x, y) {
        ctx.save();
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textDim;
        ctx.textAlign = 'center';
        ctx.fillText('TOP SCORES SAVED LOCALLY', x, y);
        ctx.restore();
    }
}
