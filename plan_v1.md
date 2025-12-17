Goal and Scope (MVP)

MVP in 6–8 hours

One endless level (waves).

Player moves L/R, shoots upward.

Enemy formation moves side-to-side, steps down.

3 beer “types” (colors) + matching ammo (must match to kill).

Score + lives.

Game over + restart.

2 powerups (ice slow, foam wide shot).

1 boss every N waves or every 60 seconds.

Nice-to-have (if time remains)

Sound effects + 1 background track.

High score saved locally.

Screen shake + particles.

Core Design Decisions (to prevent scope creep)

Only 1 twist: matching ammo type to enemy type.

No complex enemy AI: all enemies are a formation controller.

Simple collisions: axis-aligned bounding boxes (AABB).

One scene/state machine: Menu → Playing → GameOver.

Assets List (Minimal)

Sprites (pixel, 32x32 recommended)

Player (bar/beer cannon) x1

Bullet x3 (one per beer type) or 1 bullet tinted by type

Enemy x3 (one per beer type) or 1 enemy tinted by type

Boss x1 (keg)

Powerups x2 (ice, foam)

UI: heart/beer mug for lives, small icons for ammo type

Audio (optional but quick)

shoot.wav, hit.wav, powerup.wav, lose.wav

1 loop music track (or none)

Background

static starfield image OR procedural stars

Hackathon trick: Use 1 sprite sheet + tint for variants.

Data Model (keep it simple)
Enums / constants

BeerType = {LAGER, IPA, STOUT}

GameState = {MENU, PLAYING, GAMEOVER}

Player

x, y

speed

currentType (BeerType)

fireCooldown, fireRate

lives

Bullet

x, y

vx, vy (usually vy < 0)

type

damage (default 1)

isFoam (if foam powerup active, spawn 3 bullets)

Enemy

x, y

type

alive

Formation Controller (single object)

offsetX, offsetY

direction (+1 / -1)

speed

stepDownAmount

boundsLeft, boundsRight

Boss (optional object)

active

x, y

hp

pattern (just slow side-to-side)

Powerup

x, y

kind = {ICE, FOAM}

vy

duration (applies when collected)

Global

score

waveIndex

timeElapsed

difficultyMultiplier

Systems / Responsibilities

Input

Left/Right movement

Shoot

Switch beer type (keys 1/2/3 or Q/E cycling)

Spawning

Wave spawner: creates a grid of enemies with random/structured types

Boss spawner: every 3 waves or every 60 seconds

Powerup drops: random chance on enemy death (low, e.g., 8%)

Update Loop

Player movement

Bullets move & get culled off-screen

Formation moves; if hits screen edge → reverse + step down

Collision checks:

bullet vs enemy

player vs powerup

enemy reaching “bar line” (lose life)

Difficulty ramping

Rendering/UI

Score

Lives

Current ammo indicator

Optional: drunk meter (skip for MVP)

Game State

Menu screen

Game over screen with restart

Implementation Plan by Milestones (with timeboxes)
Milestone 0 — Project setup (15–30 min)

Deliverables

Running window/canvas

Game loop

Basic folder structure

Structure

/assets/sprites/

/assets/audio/

/src/

main

state (menu, play, gameover)

entities (player, bullet, enemy, powerup)

systems (collision, spawner, formation)

Milestone 1 — Player movement + shooting (45–60 min)

Steps

Create player entity at bottom center.

Add left/right movement with clamped bounds.

Add shooting:

On key press, spawn bullet from player position

Add cooldown (e.g., 200ms)

Update bullets: move up, destroy off-screen.

Acceptance criteria

You can move and shoot continuously without lag.

Bullets don’t accumulate forever.

Milestone 2 — Enemy formation movement (60–90 min)

Steps

Spawn a grid (e.g., 8 columns × 4 rows).

Implement formation controller:

Compute min/max x of alive enemies (or use offset bounds)

Move sideways by speed * dt * direction

If formation hits edge → direction *= -1, offsetY += stepDownAmount

Render enemies at enemy.localX + offsetX, enemy.localY + offsetY.

Acceptance criteria

Enemies sweep side-to-side and step down like Space Invaders.

Works even after some enemies die (doesn’t break spacing).

Milestone 3 — Collisions + score + lives (60–90 min)

Steps

Bullet vs enemy AABB collision:

If collision:

If bullet.type == enemy.type → enemy dies, bullet dies, score += 10

Else bullet dies (or “no damage” effect)

Define a “bar line” near bottom:

If any enemy crosses it → lose life, reset wave (or push enemies back up)

Add Game Over when lives == 0.

Acceptance criteria

Matching kills, mismatching doesn’t.

Lives decrease when enemies reach bottom.

GameOver screen appears.

Milestone 4 — Beer twist (ammo switching) (30–45 min)

Steps

Implement currentType on player.

Add switching controls:

1/2/3 sets type OR Q/E cycles

Bullet inherits currentType.

UI indicator shows current type.

Acceptance criteria

You can clearly switch and see it.

Match mechanic is obvious to players.

Milestone 5 — Waves + difficulty ramp (45–75 min)

Steps

When all enemies are dead:

waveIndex++

spawn a new grid

Difficulty scaling:

formation.speed += 5 each wave (tune)

optionally decrease step interval / increase stepDown

Keep wave size constant for simplicity.

Acceptance criteria

Endless progression.

Noticeable increase in challenge.

Milestone 6 — Powerups (45–75 min)

Implement only two:

ICE (slow enemies)

On pickup: formation.speed *= 0.6 for 6 seconds, then restore.

FOAM (wide shot)

On pickup: for 6 seconds, shooting spawns 3 bullets in a spread (small vx offsets).

Steps

Powerup drop chance on enemy death (8–12%).

Powerup falls down slowly.

Player pickup collision triggers effect with timers.

UI shows active powerup timers (optional; can just show icon).

Acceptance criteria

Drops sometimes.

Effects clearly noticeable.

Timers expire reliably.

Milestone 7 — Boss (optional but impressive) (45–90 min)

Boss concept

A big keg appears at top after every 3 waves (or at 60s intervals).

Has HP (e.g., 20).

Accepts damage only from matching type OR from any type (choose easiest).

Implementation

Spawn boss at center top.

Boss moves slowly side-to-side.

Boss takes hits; on death grants big score and drops guaranteed powerup.

Acceptance criteria

Boss is not buggy, doesn’t break formation.

Feels like a “moment” in the demo.

Milestone 8 — Juice + polish (as time allows) (30–90 min)

Priority order:

Sound effects (shoot, hit, powerup, lose)

Simple particle burst on kill

Screen shake on boss hit / life lost

Menu instructions (controls + matching rule)

Testing Checklist (fast but effective)

Run this checklist before demo:

Switching types works while moving.

Fire cooldown can’t be bypassed.

Formation reverses correctly at edges.

No crashes when last enemy dies (wave transition).

Powerup timer doesn’t stack weirdly (decide: refresh timer or ignore).

GameOver reliably resets everything (score optional, lives reset, clear bullets/powerups).

FPS stable (bullets culled, dead enemies removed).

“Demo Script” (hackathon win condition)

In 60 seconds you should be able to show:

“It’s Space Invaders but beer-themed.”

“Twist: you must match beer type to kill.”

“Powerups: ice slows, foam makes spread shot.”

“Boss keg appears.”

“Score ramps and difficulty increases.”

Recommended Task Split (2–3 people)

If 2 people

Dev A: Player + bullets + input + UI

Dev B: Formation + enemies + collisions + waves

Both: integrate + polish

If 3 people

Dev A: Core gameplay loop + state machine

Dev B: Formation + spawner + difficulty

Dev C: Assets + UI + sound + juice

What you should NOT do (time traps)

Pathfinding enemies / complex AI

Physics engines beyond AABB

Too many powerups

Multiple levels/maps

Networking / leaderboards (unless trivial)
