"""
Generate per-slide voiceover MP3s using Microsoft Edge TTS.

Voice: Nigerian English (en-NG-AbeoNeural) — warm, confident male.
Switch to en-NG-EzinneNeural for a female Nigerian voice.

Outputs:  audio/slide_1.mp3 … slide_8.mp3
Usage:    python generate_narration.py
"""

import asyncio
import os
import edge_tts

VOICE = "en-NG-AbeoNeural"   # alt: en-NG-EzinneNeural | en-US-GuyNeural | en-ZA-LukeNeural
RATE  = "+0%"
PITCH = "+0Hz"

NARRATION = {
    1: "If your business runs on WhatsApp chats and a notebook... this is for you.",
    2: "Nine out of ten African S M Es we audit have the same exact problem.",
    3: "Your business runs on WhatsApp, a notebook, one person's mind, and an Instagram bio. That's not a system. That's a patchwork.",
    4: "When that one person travels, business stops. When the chat gets archived, money is lost. When you want to grow, you simply can't.",
    5: "Your business deserves a system... not a notebook.",
    6: "We build three things. Websites that drive growth. Automations that run themselves. And brands that finally feel premium.",
    7: "Trusted by ambitious teams across Africa. Schools, ministries, clinics, and growing S M Es.",
    8: "Visit rexora systems dot com for a free audit. We'll map exactly what to automate, what to launch, and what it'll be worth to your bottom line.",
}

OUT_DIR = "audio"
os.makedirs(OUT_DIR, exist_ok=True)


async def synthesize_one(idx: int, text: str) -> None:
    out_path = os.path.join(OUT_DIR, f"slide_{idx}.mp3")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(out_path)
    print(f"  slide_{idx}.mp3  ({os.path.getsize(out_path)/1024:.1f} KB)")


async def main() -> None:
    print(f"Generating narration with {VOICE} ...")
    for idx, text in NARRATION.items():
        await synthesize_one(idx, text)
    print(f"\nDone. {len(NARRATION)} files in ./{OUT_DIR}/")


if __name__ == "__main__":
    asyncio.run(main())
