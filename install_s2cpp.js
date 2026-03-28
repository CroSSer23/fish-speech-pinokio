// Install s2.cpp GGUF backend for machines with limited VRAM (< 20 GB)
// Requires: CMake, C++17 compiler, CUDA toolkit (for NVIDIA GPU acceleration)
module.exports = {
  run: [
    // Load GPU info (gguf_variant)
    {
      method: "json.get",
      params: { gpu: "gpu_mode.json" }
    },
    // Clone app repo (needed for the Gradio webui even in GGUF mode)
    {
      when: "{{!exists('app/tools/s2cpp_webui.py')}}",
      method: "shell.run",
      params: {
        message: ["git clone --depth 1 https://github.com/CroSSer23/fish-speech app"]
      }
    },
    // Install cmake + ninja via conda (always)
    {
      method: "shell.run",
      params: {
        message: ["conda install -c conda-forge cmake ninja -y"]
      }
    },
    // Windows + NVIDIA: install MSVC Build Tools (required for CUDA compilation)
    {
      when: "{{gpu === 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        message: [
          "winget install --id Microsoft.VisualStudio.2022.BuildTools -e --silent --override \"--quiet --wait --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64\" --accept-source-agreements --accept-package-agreements"
        ]
      }
    },
    // Windows + NVIDIA: install CUDA toolkit via conda (provides nvcc)
    {
      when: "{{gpu === 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        message: ["conda install -c conda-forge cuda-toolkit -y"]
      }
    },
    // Clone s2.cpp (with submodules) — check CMakeLists.txt so a partial/empty dir triggers re-clone
    {
      when: "{{!exists('s2cpp/CMakeLists.txt')}}",
      method: "shell.run",
      params: {
        message: ["git clone --recurse-submodules https://github.com/rodrigomatta/s2.cpp.git s2cpp"]
      }
    },
    // Build CUDA — Windows NVIDIA (explicit VS 2022 generator overrides conda's VS 2019 default)
    {
      when: "{{gpu === 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release -DS2_CUDA=ON -G \"Visual Studio 17 2022\" -A x64",
          "cmake --build build --config Release",
        ]
      }
    },
    // Build CUDA — Linux/Mac NVIDIA
    {
      when: "{{gpu === 'nvidia' && platform !== 'win32'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release -DS2_CUDA=ON -G Ninja",
          "cmake --build build --config Release",
        ]
      }
    },
    // Build CPU — non-NVIDIA Linux/Mac
    {
      when: "{{gpu !== 'nvidia' && platform !== 'win32'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release -G Ninja",
          "cmake --build build --config Release",
        ]
      }
    },
    // Build CPU — non-NVIDIA Windows (MinGW)
    {
      when: "{{gpu !== 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        message: ["conda install -c conda-forge m2w64-toolchain -y"]
      }
    },
    {
      when: "{{gpu !== 'nvidia' && platform === 'win32'}}",
      method: "shell.run",
      params: {
        path: "s2cpp",
        message: [
          "cmake -B build -DCMAKE_BUILD_TYPE=Release -G \"MinGW Makefiles\"",
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
