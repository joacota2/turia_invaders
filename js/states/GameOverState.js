/**
 * TURIA INVADERS - Game Over State
 * Shows final score and scoreboard
 */

import { CONFIG } from '../config.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';

export class GameOverState {
    constructor() {
        this.game = null;
        this.finalScore = 0;
        this.wave = 0;
        this.playerName = '';
        this.scoreboard = [];
        this.playerRank = 0;

        // Animation
        this.animTime = 0;
        this.canRestart = false;
        this.restartDelay = 1500; // ms before allowing restart

        // Bind handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Called when entering game over state
     * @param {Object} data - Score data from play state
     */
    enter(data = {}) {
        this.finalScore = data.score || 0;
        this.wave = data.wave || 1;
        this.playerName = data.playerName || 'PLAYER';
        this.animTime = 0;
        this.canRestart = false;

        // Get scoreboard
        const scoreSystem = new ScoreSystem();
        this.scoreboard = scoreSystem.getScoreboard();

        // Find player rank
        this.playerRank = this.findPlayerRank();

        // Add keyboard listener
        window.addEventListener('keydown', this.handleKeyDown);

        // Enable restart after delay
        setTimeout(() => {
            this.canRestart = true;
        }, this.restartDelay);
    }

    /**
     * Called when exiting game over state
     */
    exit() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Finds player's rank in scoreboard
     * @returns {number} Rank (1-based) or 0 if not in top 10
     */
    findPlayerRank() {
        for (let i = 0; i < this.scoreboard.length; i++) {
            if (this.scoreboard[i].name === this.playerName &&
                this.scoreboard[i].score === this.finalScore) {
                return i + 1;
            }
        }
        return 0;
    }

    /**
     * Handles keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        if (!this.canRestart) return;

        if (e.key === 'Enter') {
            this.restartGame();
        }
    }

    /**
     * Restarts the game
     */
    restartGame() {
        this.game.changeState('menu', {
            playerName: this.playerName
        });
    }

    /**
     * Updates animations
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this.animTime += dt;
    }

    /**
     * Renders the game over screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const centerX = CONFIG.CANVAS.width / 2;

        // Game Over title
        this.renderGameOver(ctx, centerX, 80);

        // Final stats
        this.renderStats(ctx, centerX, 180);

        // Scoreboard
        this.renderScoreboard(ctx, centerX, 280);

        // Restart prompt
        if (this.canRestart) {
            this.renderRestartPrompt(ctx, centerX, 550);
        }
    }

    /**
     * Renders GAME OVER text
     */
    renderGameOver(ctx, x, y) {
        ctx.save();

        // Pulsing glow
        const pulse = Math.sin(this.animTime * 3) * 0.3 + 0.7;

        ctx.shadowColor = CONFIG.COLORS.enemy1;
        ctx.shadowBlur = 20 * pulse;
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.enemy1;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', x, y);

        ctx.restore();
    }

    /**
     * Renders final stats
     */
    renderStats(ctx, x, y) {
        ctx.save();
        ctx.textAlign = 'center';

        // Player name
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textHighlight;
        ctx.fillText(this.playerName, x, y);

        // Final score
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.shadowColor = CONFIG.COLORS.text;
        ctx.shadowBlur = 10;
        ctx.fillText(`SCORE: ${this.finalScore}`, x, y + 35);

        // Wave reached
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.textDim;
        ctx.shadowBlur = 0;
        ctx.fillText(`WAVE REACHED: ${this.wave}`, x, y + 60);

        // High score notification
        if (this.playerRank > 0 && this.playerRank <= 3) {
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillStyle = CONFIG.COLORS.textHighlight;
            ctx.shadowColor = CONFIG.COLORS.textHighlight;
            ctx.shadowBlur = 15;
            const medals = ['', '1ST', '2ND', '3RD'];
            ctx.fillText(`NEW HIGH SCORE! ${medals[this.playerRank]} PLACE!`, x, y + 90);
        } else if (this.playerRank > 0) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = CONFIG.COLORS.text;
            ctx.fillText(`TOP 10! RANK #${this.playerRank}`, x, y + 90);
        }

        ctx.restore();
    }

    /**
     * Renders the scoreboard
     */
    renderScoreboard(ctx, x, y) {
        ctx.save();

        // Title
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = CONFIG.COLORS.text;
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', x, y);

        // Draw decorative line
        ctx.strokeStyle = CONFIG.COLORS.textDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 150, y + 10);
        ctx.lineTo(x + 150, y + 10);
        ctx.stroke();

        // Scoreboard entries
        ctx.font = '10px "Press Start 2P", monospace';
        const startY = y + 35;
        const lineHeight = 22;

        for (let i = 0; i < Math.min(this.scoreboard.length, 10); i++) {
            const entry = this.scoreboard[i];
            const entryY = startY + i * lineHeight;
            const isCurrentPlayer = entry.name === this.playerName &&
                                   entry.score === this.finalScore;

            // Highlight current player
            if (isCurrentPlayer) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
                ctx.fillRect(x - 145, entryY - 12, 290, 18);
            }

            // Rank
            ctx.textAlign = 'left';
            ctx.fillStyle = i < 3 ? CONFIG.COLORS.textHighlight : CONFIG.COLORS.textDim;
            ctx.fillText(`${i + 1}.`, x - 140, entryY);

            // Name
            ctx.fillStyle = isCurrentPlayer ? CONFIG.COLORS.textHighlight : CONFIG.COLORS.text;
            ctx.fillText(entry.name, x - 100, entryY);

            // Score
            ctx.textAlign = 'right';
            ctx.fillText(entry.score.toString(), x + 140, entryY);
        }

        // Empty slots
        if (this.scoreboard.length < 10) {
            ctx.fillStyle = CONFIG.COLORS.textDim;
            for (let i = this.scoreboard.length; i < 10; i++) {
                const entryY = startY + i * lineHeight;
                ctx.textAlign = 'left';
                ctx.fillText(`${i + 1}.`, x - 140, entryY);
                ctx.fillText('---', x - 100, entryY);
                ctx.textAlign = 'right';
                ctx.fillText('---', x + 140, entryY);
            }
        }

        ctx.restore();
    }

    /**
     * Renders restart prompt
     */
    renderRestartPrompt(ctx, x, y) {
        ctx.save();

        // Blink effect
        const visible = Math.floor(this.animTime * 2) % 2 === 0;

        if (visible) {
            ctx.shadowColor = CONFIG.COLORS.text;
            ctx.shadowBlur = 10;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = CONFIG.COLORS.text;
            ctx.textAlign = 'center';
            ctx.fillText('PRESS ENTER TO CONTINUE', x, y);
        }

        ctx.restore();
    }
}
