module.exports = {
  daemon: true,
  run: [
    // Detect GPU (fast, < 1s) — ensures gpu_mode.json is always current
    {
      method: "shell.run",
      params: {
        message: ["python detect_gpu.py"]
      }
    },
    {
      method: "json.get",
      params: { gpu: "gpu_mode.json" }
    },

    // ══ FULL mode: standard Fish Speech (PyTorch) ════════════════════════════
    {
      when: "{{local.gpu.mode === 'full'}}",
      method: "shell.run",
      params: {
        venv: "env",
        env: { TORCHINDUCTOR_ONLINE_SOFTMAX: "0" },
        path: "app",
        message: [
          "python -m tools.run_webui --llama-checkpoint-path checkpoints/s2-pro --decoder-checkpoint-path checkpoints/s2-pro/codec.pth --compile --half",
        ],
        on: [{ event: "/(http:\\/\\/[0-9.:]+)/", done: true }]
      }
    },

    // ══ FP8 mode: Fish Speech with torchao float8 quantization ══════════════
    {
      when: "{{local.gpu.mode === 'fp8'}}",
      method: "shell.run",
      params: {
        venv: "env",
        env: { TORCHINDUCTOR_ONLINE_SOFTMAX: "0" },
        path: "app",
        message: [
          "python -m tools.run_webui --llama-checkpoint-path checkpoints/s2-pro-fp8 --decoder-checkpoint-path checkpoints/s2-pro/codec.pth --fp8 --half",
        ],
        on: [{ event: "/(http:\\/\\/[0-9.:]+)/", done: true }]
      }
    },

    // ══ GGUF mode: s2.cpp Gradio bridge ═════════════════════════════════════
    {
      when: "{{local.gpu.mode === 'gguf'}}",
      method: "shell.run",
      params: {
        venv: "env",
        message: [
          "python app/tools/s2cpp_webui.py --s2cpp-dir s2cpp",
        ],
        on: [{ event: "/(http:\\/\\/[0-9.:]+)/", done: true }]
      }
    },

    // Set URL (works for both modes — input comes from whichever shell.run ran)
    {
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
