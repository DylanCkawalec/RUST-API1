module.exports = {
  apps: [{
    name: "rust-pi-calculator",
    script: "./target/release/rust-pi-calculator",
    exec_mode: "cluster",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
}