module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",                // Path to your virtual environment
        env: { TORCHINDUCTOR_ONLINE_SOFTMAX: "0" },  // Disable inductor online-softmax (unsupported for inference split-reduction)
        path: "app",              // Change to the tools directory
        message: [
          "python -m tools.run_webui --llama-checkpoint-path checkpoints/s2-pro --decoder-checkpoint-path checkpoints/s2-pro/codec.pth --compile",
        ],
        on: [{
          event: "/(http:\\/\\/[0-9.:]+)/",
          done: true
        }]
      }
    },
    {
      method: "local.set",
      params: {
        url: "{{input.event[1]}}"
      }
    }
  ]
}
