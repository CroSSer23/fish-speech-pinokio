// Install s2.cpp GGUF backend for machines with limited VRAM (< 20 GB)
// Requires: CMake, C++17 compiler, CUDA toolkit (for NVIDIA GPU acceleration)
module.exports = {
  run: [
    // Load GPU info (gguf_variant)
    {
      method: "json.get",
      params: { gpu: "gpu_mode.json" }
    },
    // Install cmake via conda
    {
      method: "shell.run",
      params: {
        message: ["conda install -c conda-forge cmake -y"]
      }
    },
    // Clone s2.cpp (with submodules)
    {
      when: "{{!exists('s2cpp')}}",
      method: "shell.run",
      params: {
        message: ["git clone --recurse-submodules https://github.com/rodrigomatta/s2.cpp.git s2cpp"]
      }
    },
    // Build with CUDA (NVIDIA) — requires MSVC or compatible C++ compiler + CUDA toolkit
    {
      when: "{{gpu === 'nvidia'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release -DS2_CUDA=ON",
          "cmake --build build --config Release",
        ]
      }
    },
    // Build CPU-only fallback (non-NVIDIA or if CUDA build not possible)
    {
      when: "{{gpu !== 'nvidia'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release",
          "cmake --build build --config Release",
        ]
      }
    },
    // Create models directory
    {
      method: "shell.run",
      params: {
        message: ["mkdir -p s2cpp/models"]
      }
    },
    // Download GGUF model (variant selected by detect_gpu.py)
    {
      method: "shell.run",
      params: {
        message: ["huggingface-cli download rodrigomt/s2-pro-gguf {{local.gpu.gguf_variant}}.gguf tokenizer.json --local-dir s2cpp/models"]
      }
    },
    // Install minimal Python deps for the Gradio bridge (no PyTorch needed)
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: ["uv pip install gradio>=5.0 soundfile numpy"]
      }
    },
    {
      method: "notify",
      params: {
        html: "s2.cpp installed — {{local.gpu.gguf_variant}} model ready"
      }
    }
  ]
}
