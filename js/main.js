/**
 * TURIA INVADERS - Entry Point
 * Initializes the game and starts the loop
 */

import { Game } from './Game.js';
import { CONFIG } from './config.js';
import { MenuState } from './states/MenuState.js';
import { PlayState } from './states/PlayState.js';
import { GameOverState } from './states/GameOverState.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Set canvas size from config
    canvas.width = CONFIG.CANVAS.width;
    canvas.height = CONFIG.CANVAS.height;

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

    // Store game instance globally for debugging
    window.game = game;

    console.log('TURIA INVADERS - Game started!');
});
