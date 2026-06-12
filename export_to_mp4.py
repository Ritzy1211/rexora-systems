"""
Export Rexora-Systems-Pitch.pptx to MP4 using PowerPoint's COM API.
Requires Microsoft PowerPoint installed on this Windows machine.

Usage:  python export_to_mp4.py
Output: Rexora-Systems-Pitch.mp4
"""

import os
import sys
import time
import win32com.client
import pythoncom

HERE = os.path.dirname(os.path.abspath(__file__))
# Prefer narrated version if it exists
_narrated = os.path.join(HERE, "Rexora-Systems-Pitch-Narrated.pptx")
_silent   = os.path.join(HERE, "Rexora-Systems-Pitch.pptx")
PPTX = _narrated if os.path.exists(_narrated) else _silent
MP4  = os.path.join(HERE, "Rexora-Systems-Pitch.mp4")

# Video options
RESOLUTION_HEIGHT = 1080      # 720 / 1080 / 2160
FRAMES_PER_SECOND = 30
QUALITY           = 85        # 0-100
SECONDS_PER_SLIDE = 5         # only used for slides without recorded timings

if not os.path.exists(PPTX):
    sys.exit(f"Source not found: {PPTX}")

# Remove previous output (PowerPoint refuses to overwrite)
if os.path.exists(MP4):
    os.remove(MP4)

pythoncom.CoInitialize()
pp = win32com.client.DispatchEx("PowerPoint.Application")
# PowerPoint must be visible OR the export silently fails on some versions
pp.Visible = 1

print("Opening presentation…")
pres = pp.Presentations.Open(PPTX, WithWindow=False)

print(f"Exporting to MP4 ({RESOLUTION_HEIGHT}p, {FRAMES_PER_SECOND} fps)…")
# CreateVideo(FileName, UseTimingsAndNarrations, DefaultVideoDuration, VertResolution, FramesPerSecond, Quality)
pres.CreateVideo(MP4, -1, SECONDS_PER_SLIDE, RESOLUTION_HEIGHT, FRAMES_PER_SECOND, QUALITY)

# Poll Application.Tasks-style: wait for the file to finish writing
print("Encoding (this can take a minute)…")
last_size = -1
stable_for = 0
while True:
    time.sleep(2)
    if not os.path.exists(MP4):
        continue
    size = os.path.getsize(MP4)
    if size == last_size and size > 1024:
        stable_for += 1
        if stable_for >= 3:           # ~6 seconds of no growth = done
            break
    else:
        stable_for = 0
    last_size = size
    print(f"  …{size/1024:.0f} KB written")

pres.Close()
pp.Quit()
pythoncom.CoUninitialize()

print(f"\nDone: {MP4}  ({os.path.getsize(MP4)/1024/1024:.1f} MB)")
