"""
Detects GPU VRAM and writes gpu_mode.json to choose the right backend:
  mode = "full"  → standard Fish Speech (PyTorch, needs ≥ 20 GB VRAM)
  mode = "gguf"  → s2.cpp GGUF backend  (needs < 20 GB VRAM)
"""
import subprocess
import json
from pathlib import Path


def detect_vram():
    try:
        r = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.total,name",
             "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=10,
        )
        if r.returncode != 0:
            return 0.0, "Unknown"
        parts = r.stdout.strip().splitlines()[0].split(",")
        vram_mb = int(parts[0].strip())
        name = parts[1].strip() if len(parts) > 1 else "Unknown"
        return vram_mb / 1024, name
    except Exception:
        return 0.0, "Unknown"


vram_gb, gpu_name = detect_vram()

if vram_gb >= 20:
    mode = "full"
elif vram_gb > 0:
    mode = "gguf"
else:
    # Can't detect → assume full (safe default on 5090)
    mode = "full"

# Pick the best GGUF quantization that fits in VRAM
if vram_gb >= 10:
    gguf_variant = "s2-pro-q8_0"
elif vram_gb >= 7:
    gguf_variant = "s2-pro-q6_k"
elif vram_gb >= 5:
    gguf_variant = "s2-pro-q5_k_m"
else:
    gguf_variant = "s2-pro-q4_k_m"

result = {
    "mode": mode,
    "vram_gb": round(vram_gb, 1),
    "gpu": gpu_name,
    "gguf_variant": gguf_variant,
}

Path("gpu_mode.json").write_text(json.dumps(result, indent=2))
print(f"GPU: {gpu_name} | VRAM: {vram_gb:.1f} GB | Mode: {mode}"
      + (f" | GGUF: {gguf_variant}" if mode == "gguf" else ""))
