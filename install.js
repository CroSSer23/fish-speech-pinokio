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
    // Install torch 2.8.0 + matching torchvision 0.23.0 for the detected GPU
    // (torch.js installs latest torch which conflicts with fish-speech's pinned torch==2.8.0)
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
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "app",
        message: [
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cpu",
        ],
        when: "{{gpu !== 'nvidia'}}",
      }
    },
    // Edit this step with your custom install commands
    {
      method: "shell.run",
      params: {
        venv: "env",                // Edit this to customize the venv folder path
        path: "app",                // Edit this to customize the path to start the shell from
        message: [
          "uv pip install -e .",
          "uv pip install triton-windows==3.3.1.post21",
        ]
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
