"""
Audio Generator for Lessons
============================
Reads lesson definitions (JSON) and generates MP3 files using edge-tts.

Usage:
  python3 generate_audio.py lessons/lesson_1_4.json
  python3 generate_audio.py lessons/lesson_2_1.json

This creates audio/<lesson_id>/step_00.mp3, step_01.mp3, etc.
Each step that has narration text gets an audio file.
Checkpoint confirmText also gets a separate file (step_XX_confirm.mp3).
"""

import asyncio
import json
import os
import sys
import edge_tts

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+5%"  # slightly faster than default

async def generate(text, output_path):
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(output_path)
    print(f"  ✓ {output_path} ({len(text)} chars)")

async def process_lesson(lesson_path):
    with open(lesson_path) as f:
        lesson = json.load(f)

    lesson_id = lesson["id"]
    steps = lesson["steps"]

    out_dir = os.path.join(os.path.dirname(__file__), "audio", lesson_id)
    os.makedirs(out_dir, exist_ok=True)

    tasks = []
    for i, step in enumerate(steps):
        if step.get("text"):
            path = os.path.join(out_dir, f"step_{i:02d}.mp3")
            tasks.append(generate(step["text"], path))
        if step.get("confirmText"):
            path = os.path.join(out_dir, f"step_{i:02d}_confirm.mp3")
            tasks.append(generate(step["confirmText"], path))

    print(f"Generating {len(tasks)} audio files for '{lesson_id}'...")
    await asyncio.gather(*tasks)
    print(f"Done! Files in {out_dir}/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate_audio.py <lesson_json>")
        sys.exit(1)
    asyncio.run(process_lesson(sys.argv[1]))
