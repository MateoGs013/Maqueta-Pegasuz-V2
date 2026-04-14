#!/usr/bin/env python3
"""
Eros Aesthetic Scorer — runs MUSIQ + CLIPIQA on a screenshot.
Requires: pip install pyiqa torch
Returns JSON to stdout: { "musiq": 0-100, "clipiqa": 0-1 }
"""
import sys, json

if len(sys.argv) < 2:
    print(json.dumps({"error": "Usage: python eros-aesthetic.py <screenshot_path>"}))
    sys.exit(1)

path = sys.argv[1]

try:
    import pyiqa
    import torch

    device = "cuda" if torch.cuda.is_available() else "cpu"

    musiq = pyiqa.create_metric('musiq', device=device)
    clipiqa = pyiqa.create_metric('clipiqa', device=device)

    scores = {
        "musiq": round(float(musiq(path)), 2),
        "clipiqa": round(float(clipiqa(path)), 4),
    }
    print(json.dumps(scores))

except ImportError:
    print(json.dumps({"error": "pyiqa not installed. Run: pip install pyiqa torch"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": str(e)[:200]}))
    sys.exit(1)
