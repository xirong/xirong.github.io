import asyncio
from pathlib import Path

import edge_tts


VOICE = "en-US-JennyNeural"
RATE = "-12%"
OUTPUT_DIR = Path(__file__).parent / "audio" / "under-the-sea"

LINES = [
    ("00-under-the-sea.mp3", "Under the Sea"),
    ("01-is-that-a-mermaid.mp3", "Is that a mermaid?"),
    ("02-im-not-sure.mp3", "I'm not sure."),
    ("03-going-to-find-mermaid.mp3", "I'm going to find the mermaid."),
    ("04-look-jellyfish.mp3", "Look, jellyfish!"),
    ("05-look-a-starfish.mp3", "Look, a starfish!"),
    ("06-where-is-it.mp3", "Where is it?"),
    ("07-on-turtles-back.mp3", "It's on the turtle's back."),
    ("08-look-a-shark.mp3", "Look, a shark!"),
    ("09-where-is-it-shark.mp3", "Where is it?"),
    ("10-behind-the-dolphin.mp3", "It's behind the dolphin!"),
    ("11-thank-you-dolphins.mp3", "Thank you, dolphins!"),
    ("12-we-are-lost.mp3", "We are lost. Who can help us?"),
    ("13-where-is-mermaid.mp3", "Where is the mermaid?"),
    ("14-behind-coral.mp3", "Far away behind the coral."),
    ("15-whale-going-to-eat-us.mp3", "The whale is going to eat us!"),
    ("16-oh-no-help.mp3", "Oh, no! Help!"),
    ("17-leo-where-are-you.mp3", "Leo, where are you?"),
    ("18-between-seal-octopus.mp3", "I'm between a seal and an octopus."),
    ("19-the-mermaids.mp3", "The mermaids!"),
    ("20-thank-you-whale.mp3", "Thank you, whale!"),
]


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, text in LINES:
        path = OUTPUT_DIR / filename
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
        await communicate.save(str(path))
        print(f"generated {path.relative_to(Path.cwd())}")


if __name__ == "__main__":
    asyncio.run(main())
