#!/usr/bin/env python3
"""
Eros Saliency Predictor — runs DeepGaze IIE on a screenshot.
Requires: pip install deepgaze-pytorch torch scipy pillow numpy
Returns JSON: { "attention_distribution": {quadrants}, "peak_quadrant": "top_left"|... }
"""
import sys, json

if len(sys.argv) < 2:
    print(json.dumps({"error": "Usage: python eros-saliency.py <screenshot_path>"}))
    sys.exit(1)

path = sys.argv[1]

try:
    import numpy as np
    import torch
    from PIL import Image
    from scipy.ndimage import zoom
    from scipy.special import logsumexp
    import deepgaze_pytorch

    model = deepgaze_pytorch.DeepGazeIIE(pretrained=True)
    model.eval()

    img = np.array(Image.open(path).convert('RGB'))
    h, w = img.shape[:2]
    img_t = torch.tensor([img.transpose(2, 0, 1)]).float()

    # Centerbias prior (uniform fallback if file not found)
    try:
        cb = np.load('centerbias_mit1003.npy')
        cb = zoom(cb, (h / cb.shape[0], w / cb.shape[1]), order=1)
    except FileNotFoundError:
        cb = np.zeros((h, w))
    cb -= logsumexp(cb)
    cb_t = torch.tensor([cb]).float()

    with torch.no_grad():
        log_density = model(img_t, cb_t)

    density = torch.exp(log_density).squeeze().numpy()

    # Quadrant attention distribution
    mid_h, mid_w = h // 2, w // 2
    quads = {
        "top_left": float(density[:mid_h, :mid_w].sum()),
        "top_right": float(density[:mid_h, mid_w:].sum()),
        "bottom_left": float(density[mid_h:, :mid_w].sum()),
        "bottom_right": float(density[mid_h:, mid_w:].sum()),
    }
    total = sum(quads.values()) or 1
    quads = {k: round(v / total, 3) for k, v in quads.items()}

    peak = max(quads, key=quads.get)

    print(json.dumps({
        "attention_distribution": quads,
        "peak_quadrant": peak,
    }))

except ImportError:
    print(json.dumps({"error": "deepgaze-pytorch not installed. Run: pip install deepgaze-pytorch torch scipy pillow"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": str(e)[:200]}))
    sys.exit(1)
