module.exports = {
  run: [
    // Edit this step to customize the git repository to use
    {
      method: "shell.run",
      params: {
        message: [
          "[ -d app ] || git clone https://github.com/CroSSer23/fish-speech app",
        ]
      }
    },
    // NVIDIA (Windows/Linux)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128",
        ],
        when: "{{gpu === 'nvidia'}}",
      }
    },
    // Apple Silicon (Mac MPS)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0",
        ],
        when: "{{platform === 'darwin'}}",
      }
    },
    // CPU fallback (Linux/Windows without NVIDIA)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cpu",
        ],
        when: "{{gpu !== 'nvidia' && platform !== 'darwin'}}",
      }
    },
    // Edit this step with your custom install commands
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install -e .",
        ]
      }
    },
    // Windows only: triton
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install triton-windows==3.3.1.post21",
        ],
        when: "{{platform === 'win32'}}",
      }
    },
    {
      method: "hf.download",
      params: {
        path: "app",
        "_": [ "fishaudio/s2-pro" ],
        "--local-dir": "./checkpoints/s2-pro",
      }
    }
  ]
}
