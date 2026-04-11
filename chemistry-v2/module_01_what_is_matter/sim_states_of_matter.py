"""
Interactive Simulation: States of Matter
=========================================
Watch how particles behave in solid, liquid, and gas states.
Change the temperature and see particles respond in real-time!

Run: python3 sim_states_of_matter.py

Controls:
  UP arrow   = increase temperature (add energy)
  DOWN arrow = decrease temperature (remove energy)
  q          = quit
"""

import random
import time
import os
import sys
import select

# --- Configuration ---
WIDTH = 50
HEIGHT = 20
NUM_PARTICLES = 30
MIN_TEMP = 0
MAX_TEMP = 100
FRAME_DELAY = 0.15

# Temperature thresholds
MELTING_POINT = 33
BOILING_POINT = 66


class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.home_x = x  # for solid state vibration
        self.home_y = y

    def move(self, state, temperature):
        if state == "SOLID":
            # Vibrate in place — small random jitter around home position
            jitter = max(1, temperature // 15)
            self.x = self.home_x + random.randint(-jitter, jitter)
            self.y = self.home_y + random.randint(-jitter, jitter)

        elif state == "LIQUID":
            # Slide around — moderate movement, but stay in bottom half
            speed = max(1, temperature // 20)
            self.x += random.randint(-speed, speed)
            self.y += random.randint(-speed, speed)
            # Gravity-like: particles tend toward bottom
            if self.y < HEIGHT // 2:
                self.y += random.randint(0, 2)

        elif state == "GAS":
            # Fly freely — large random movement, fill the space
            speed = max(2, temperature // 15)
            self.x += random.randint(-speed, speed)
            self.y += random.randint(-speed, speed)

        # Keep in bounds
        self.x = max(1, min(WIDTH - 2, self.x))
        self.y = max(1, min(HEIGHT - 2, self.y))


def get_state(temperature):
    if temperature < MELTING_POINT:
        return "SOLID"
    elif temperature < BOILING_POINT:
        return "LIQUID"
    else:
        return "GAS"


def create_particles(state):
    particles = []
    if state == "SOLID":
        # Grid arrangement
        cols = 6
        rows = 5
        start_x = WIDTH // 2 - cols
        start_y = HEIGHT // 2 - rows // 2
        for i in range(NUM_PARTICLES):
            r, c = divmod(i, cols)
            x = start_x + c * 3
            y = start_y + r * 2
            x = max(1, min(WIDTH - 2, x))
            y = max(1, min(HEIGHT - 2, y))
            particles.append(Particle(x, y))
    else:
        for _ in range(NUM_PARTICLES):
            particles.append(Particle(
                random.randint(2, WIDTH - 3),
                random.randint(2, HEIGHT - 3)
            ))
    return particles


def render(particles, temperature, state):
    os.system('clear' if os.name != 'nt' else 'cls')

    # State colors
    state_display = {
        "SOLID": "SOLID  (particles locked in place, vibrating)",
        "LIQUID": "LIQUID (particles sliding around each other)",
        "GAS":   "GAS    (particles flying freely in all directions)",
    }

    # Temperature bar
    bar_len = 40
    filled = int((temperature / MAX_TEMP) * bar_len)
    bar = "=" * filled + "-" * (bar_len - filled)

    print("=" * (WIDTH + 2))
    print("  STATES OF MATTER SIMULATION")
    print(f"  Temperature: [{bar}] {temperature}")
    print(f"  State:       {state_display[state]}")
    print(f"  Controls:    UP/DOWN arrows to change temp, 'q' to quit")
    print("=" * (WIDTH + 2))

    # Build grid
    grid = [[' ' for _ in range(WIDTH)] for _ in range(HEIGHT)]

    # Draw border
    for x in range(WIDTH):
        grid[0][x] = '-'
        grid[HEIGHT - 1][x] = '-'
    for y in range(HEIGHT):
        grid[y][0] = '|'
        grid[y][WIDTH - 1] = '|'

    # Draw particles
    for p in particles:
        px = max(1, min(WIDTH - 2, int(p.x)))
        py = max(1, min(HEIGHT - 2, int(p.y)))
        grid[py][px] = 'o'

    # Print grid
    for row in grid:
        print(''.join(row))

    # Phase transition hints
    if abs(temperature - MELTING_POINT) < 5:
        print("\n  ** Near melting/freezing point! **")
    elif abs(temperature - BOILING_POINT) < 5:
        print("\n  ** Near boiling/condensation point! **")
    else:
        print()

    print("  Concepts:")
    print("  - Higher temp = more kinetic energy = faster particles")
    print("  - State changes happen at specific temperatures")
    print("  - Same particles, different arrangement & energy")


def get_key_nonblocking():
    """Non-blocking key read for Unix systems."""
    import tty
    import termios
    old = termios.tcgetattr(sys.stdin)
    try:
        tty.setcbreak(sys.stdin.fileno())
        if select.select([sys.stdin], [], [], 0.0)[0]:
            ch = sys.stdin.read(1)
            if ch == '\x1b':
                ch2 = sys.stdin.read(1)
                if ch2 == '[':
                    ch3 = sys.stdin.read(1)
                    if ch3 == 'A':
                        return 'UP'
                    elif ch3 == 'B':
                        return 'DOWN'
            return ch
    finally:
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old)
    return None


def main():
    temperature = 10  # Start cold (solid)
    particles = create_particles("SOLID")

    prev_state = "SOLID"

    print("Starting States of Matter simulation...")
    print("Use UP/DOWN arrow keys to change temperature.")
    print("Press 'q' to quit.")
    time.sleep(1)

    try:
        while True:
            state = get_state(temperature)

            # If state changed, rearrange particles
            if state != prev_state:
                if state == "SOLID":
                    particles = create_particles("SOLID")
                prev_state = state

            # Move particles
            for p in particles:
                p.move(state, temperature)

            # Render
            render(particles, temperature, state)

            # Check input
            key = get_key_nonblocking()
            if key == 'q':
                print("\n  Goodbye! Remember: matter = mass + volume.")
                break
            elif key == 'UP':
                temperature = min(MAX_TEMP, temperature + 3)
            elif key == 'DOWN':
                temperature = max(MIN_TEMP, temperature - 3)

            time.sleep(FRAME_DELAY)

    except KeyboardInterrupt:
        print("\n  Simulation ended.")


if __name__ == "__main__":
    main()
