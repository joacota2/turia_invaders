/**
 * TURIA INVADERS - Entry Point
 * Initializes the game and starts the loop
 */

import { Game } from './Game.js';
import { CONFIG } from './config.js';
import { AssetLoader } from './AssetLoader.js';
import { MenuState } from './states/MenuState.js';
import { PlayState } from './states/PlayState.js';
import { GameOverState } from './states/GameOverState.js';

/**
 * Renders loading screen
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} progress - Loading progress (0-1)
 */
function renderLoadingScreen(ctx, progress) {
    const width = CONFIG.CANVAS.width;
    const height = CONFIG.CANVAS.height;

    // Background
    ctx.fillStyle = CONFIG.COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.textAlign = 'center';
    ctx.fillText(CONFIG.GAME_TITLE, width / 2, height / 2 - 60);

    // Loading text
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('LOADING ASSETS...', width / 2, height / 2);

    // Progress bar background
    const barWidth = 300;
    const barHeight = 20;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 20;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress bar fill
    ctx.fillStyle = CONFIG.COLORS.powerBarFill;
    ctx.shadowColor = CONFIG.COLORS.powerBarFill;
    ctx.shadowBlur = 10;
    ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * progress, barHeight - 4);

    // Progress bar border
    ctx.strokeStyle = CONFIG.COLORS.text;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Progress percentage
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`${Math.floor(progress * 100)}%`, width / 2, barY + barHeight + 25);
}

/**
 * Main initialization function
 */
/**
 * Sets canvas to fullscreen and updates CONFIG
 */
function setFullscreen(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CONFIG.CANVAS.width = canvas.width;
    CONFIG.CANVAS.height = canvas.height;

    // Update gameplay positions based on new size
    CONFIG.GAMEPLAY.playerStartY = canvas.height - 100;
    CONFIG.GAMEPLAY.bottomLine = canvas.height - 130;
}

async function init() {
    // Get canvas element
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Set canvas to fullscreen
    setFullscreen(canvas);

    const ctx = canvas.getContext('2d');

    // Show initial loading screen
    renderLoadingScreen(ctx, 0);

    // Load assets with progress updates
    console.log('Loading assets...');

    // Create a simple loading animation
    let loadingComplete = false;
    const loadingAnimation = () => {
        if (!loadingComplete) {
            renderLoadingScreen(ctx, AssetLoader.getProgress());
            requestAnimationFrame(loadingAnimation);
        }
    };
    loadingAnimation();

    // Load all assets
    await AssetLoader.loadAll();
    loadingComplete = true;

    console.log('Assets loaded!');

    // Create game instance
    const game = new Game(canvas);

    // Create and register game states
    const menuState = new MenuState();
    const playState = new PlayState();
    const gameOverState = new GameOverState();

    game.registerState('menu', menuState);
    game.registerState('play', playState);
    game.registerState('gameover', gameOverState);

    // Start with menu state
    game.changeState('menu');

    // Start the game loop
    game.start();

    // Handle window resize
    window.addEventListener('resize', () => {
        setFullscreen(canvas);
    });

    // Store game instance globally for debugging
    window.game = game;

    console.log('TURIA INVADERS - Game started!');
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', init);
