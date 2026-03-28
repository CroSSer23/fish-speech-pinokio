const path = require('path')
module.exports = {
  version: "3.7",
  title: "Fish-Speech",
  description: "",
  icon: "icon.png",
  menu: async (kernel, info) => {
    const installedFull = info.exists("app/env") && info.exists("app/checkpoints/s2-pro")
    const installedFp8  = info.exists("app/env") && info.exists("app/checkpoints/s2-pro-fp8")
    const installedGguf = info.exists("s2cpp")
    const installed = installedFull || installedFp8 || installedGguf

    const running = {
      install:     info.running("install.js"),
      installGguf: info.running("install_s2cpp.js"),
      start:       info.running("start.js"),
      update:      info.running("update.js"),
      reset:       info.running("reset.js"),
    }

    // ── Installing ────────────────────────────────────────────────────────────
    if (running.install || running.installGguf) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Installing…",
        href: running.installGguf ? "install_s2cpp.js" : "install.js",
      }]
    }

    // ── Running ───────────────────────────────────────────────────────────────
    if (running.start) {
      const local = info.local("start.js")
      if (local && local.url) {
        return [{
          default: true,
          icon: "fa-solid fa-rocket",
          text: "Open Web UI",
          href: local.url,
        }, {
          icon: "fa-solid fa-terminal",
          text: "Terminal",
          href: "start.js",
        }]
      }
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: installedGguf && !installedFull && !installedFp8 ? "Starting (GGUF)…" : installedFp8 && !installedFull ? "Starting (FP8)…" : "Starting…",
        href: "start.js",
      }]
    }

    if (running.update) {
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Updating…",
        href: "update.js",
      }]
    }

    if (running.reset) {
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Resetting…",
        href: "reset.js",
      }]
    }

    // ── Idle — installed ──────────────────────────────────────────────────────
    if (installed) {
      const menu = [{
        default: true,
        icon: "fa-solid fa-power-off",
        text: "Start",
        href: "start.js",
      }, {
        icon: "fa-solid fa-rotate",
        text: "Update",
        href: "update.js",
      }]

      // Show which mode is active
      const modes = []
      if (installedFull) modes.push("Full (BF16)")
      if (installedFp8)  modes.push("FP8 (torchao)")
      if (installedGguf) modes.push("GGUF (s2.cpp)")
      if (modes.length > 1) {
        menu.push({
          icon: "fa-solid fa-microchip",
          text: `<div><strong>Modes installed</strong><div>${modes.join(" + ")}</div></div>`,
          href: "start.js",
        })
      }

      menu.push({
        icon: "fa-solid fa-plug",
        text: "Install / Reinstall",
        href: "install.js",
      }, {
        icon: "fa-regular fa-circle-xmark",
        text: "<div><strong>Reset</strong><div>Revert to pre-install state</div></div>",
        href: "reset.js",
        confirm: "This will delete all installed files. Are you sure?",
      })

      return menu
    }

    // ── Not installed ─────────────────────────────────────────────────────────
    return [{
      default: true,
      icon: "fa-solid fa-plug",
      text: "Install",
      href: "install.js",
    }]
  }
}
