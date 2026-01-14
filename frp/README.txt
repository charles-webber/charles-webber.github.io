请从 https://github.com/fatedier/frp/releases 下载对应 Windows 版本的 frp (如 frp_0.xx.x_windows_amd64.zip)。
解压后，将 frpc.exe 放入此文件夹 (s:\Blog\frp\)。

配置说明 (frpc.toml):
1. serverAddr: 你的 VPS IP 地址。
2. serverPort: frps (服务端) 监听的端口，默认为 7000。
3. remotePort: 你希望在 VPS 上暴露的端口 (通过 http://VPS_IP:6000 访问)。
4. auth.token: 如果服务端设置了 token，请取消注释并填写。

完成设置后，可以通过 run.bat 中的新选项启动 frp 服务。
