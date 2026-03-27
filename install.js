module.exports = {
  run: [
    // ── Step 0: Detect GPU VRAM → writes gpu_mode.json ──────────────────────
    {
      method: "shell.run",
      params: {
        message: ["python detect_gpu.py"]
      }
    },
    // Load result into local.gpu
    {
      method: "json.get",
      params: { gpu: "gpu_mode.json" }
    },

    // ══ FULL mode (≥ 20 GB VRAM): standard Fish Speech ═══════════════════════

    // Clone app repo
    {
      when: "{{local.gpu.mode === 'full' && !exists('app')}}",
      method: "shell.run",
      params: {
        message: ["git clone https://github.com/CroSSer23/fish-speech app"]
      }
    },
    // PyTorch — NVIDIA
    {
      when: "{{local.gpu.mode === 'full' && gpu === 'nvidia'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: ["uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128"]
      }
    },
    // PyTorch — Apple Silicon
    {
      when: "{{local.gpu.mode === 'full' && platform === 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: ["uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0"]
      }
    },
    // PyTorch — CPU fallback
    {
      when: "{{local.gpu.mode === 'full' && gpu !== 'nvidia' && platform !== 'darwin'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: ["uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cpu"]
      }
    },
    // fish_speech package
    {
      when: "{{local.gpu.mode === 'full'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: ["uv pip install -e ."]
      }
    },
    // triton-windows
    {
      when: "{{local.gpu.mode === 'full' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: ["uv pip install triton-windows==3.3.1.post21"]
      }
    },
    // Download s2-pro checkpoint
    {
      when: "{{local.gpu.mode === 'full'}}",
      method: "hf.download",
      params: {
        path: "app",
        "_": ["fishaudio/s2-pro"],
        "--local-dir": "./checkpoints/s2-pro"
      }
    },

    // ══ GGUF mode (< 20 GB VRAM): s2.cpp + quantized model ══════════════════

    {
      when: "{{local.gpu.mode === 'gguf'}}",
      method: "script.start",
      params: { uri: "install_s2cpp.js" }
    },

    // ── Done ─────────────────────────────────────────────────────────────────
    {
      method: "notify",
      params: {
        html: "Fish Speech installed — {{local.gpu.gpu}} ({{local.gpu.vram_gb}} GB) → {{local.gpu.mode}} mode"
      }
    }
  ]
}
