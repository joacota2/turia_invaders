/**
 * TURIA INVADERS - Game Configuration
 * Easy to modify colors, sizes, and gameplay settings
 */

export const CONFIG = {
    // Game identity - easy to change
    GAME_TITLE: 'TURIA INVADERS',

    // Canvas dimensions
    CANVAS: {
        width: 800,
        height: 600
    },

    // Color palette - night-life dark theme
    COLORS: {
        background: '#0a0a12',
        backgroundGradientTop: '#0a0a1a',
        backgroundGradientBottom: '#1a0a2e',

        // Player
        player: '#00ff88',
        playerGlow: 'rgba(0, 255, 136, 0.5)',

        // Enemies
        enemy1: '#ff0066',
        enemy2: '#00ccff',
        enemy3: '#ffcc00',

        // Boss
        boss: '#ff00ff',
        bossGlow: 'rgba(255, 0, 255, 0.5)',

        // Projectiles
        bullet: '#ffffff',
        bulletGlow: 'rgba(255, 255, 255, 0.5)',
        powerAttack: '#ff00ff',

        // UI
        text: '#00ff00',
        textHighlight: '#ffff00',
        textDim: '#006600',

        // TURIA POWER bar
        powerBarBg: '#1a1a2e',
        powerBarFill: '#ff00ff',
        powerBarGlow: 'rgba(255, 0, 255, 0.8)',
        powerBarReady: '#00ffff',

        // Lives
        lifeIcon: '#ff0066',

        // Stars
        star: '#ffffff',
        starDim: '#666666'
    },

    // Entity sizes
    SIZES: {
        player: { width: 72, height: 48 },
        enemy: { width: 48, height: 48 },
        boss: { width: 96, height: 96 },
        bullet: { width: 4, height: 12 },
        powerProjectile: { width: 8, height: 8 }
    },

    // Gameplay settings
    GAMEPLAY: {
        // Player
        playerSpeed: 300,
        playerStartY: 500,

        // Shooting
        bulletSpeed: 500,
        fireCooldown: 200, // ms

        // Enemies
        enemySpeed: 50,
        enemyStepDown: 20,
        enemyRows: 4,
        enemyCols: 8,
        enemySpacingX: 50,
        enemySpacingY: 40,
        enemyStartX: 100,
        enemyStartY: 80,

        // Boss
        bossHP: 20,
        bossSpeed: 30,
        bossSpawnWave: 3, // Spawn boss every N waves
        bossRewardScore: 500,
        bossRewardPower: 50,

        // TURIA POWER
        turiaPowerMax: 100,
        turiaPowerPerKill: 10,
        powerAttackSpeed: 400,
        powerAttackDirections: 8,

        // Lives & Score
        livesMax: 3,
        scorePerKill: 10,

        // Difficulty scaling
        speedIncreasePerWave: 5,

        // Bottom line (where enemies shouldn't cross)
        bottomLine: 470
    },

    // Keyboard controls
    KEYS: {
        left: ['ArrowLeft', 'KeyA'],
        right: ['ArrowRight', 'KeyD'],
        shoot: ['Space'],
        power: ['KeyE', 'ShiftLeft', 'ShiftRight']
    },

    // Asset paths - easy to change
    ASSETS: {
        player: 'assets/spaceship.png',
        enemy: 'assets/small_barrel.png',
        boss: 'assets/big_barrel.png'
    }
};
