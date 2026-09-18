---
title: 学生邮箱开 Azure Linux VPS：从学生认证到个人网络实验节点
date: 2026-09-18 22:00:00
cover: https://gitee.com/Charles-Webber/blog-image1/raw/master/img/wallhaven-og6q8l.png
tags:
  - Azure
  - GitHub Education
  - Linux
  - sing-box
  - 云服务器
categories:
  - 折腾记录
description: 记录 GitHub Education、Azure for Students、Linux VM、静态公网 IP 和个人网络实验节点的实际配置。
---

> 这篇只写给在校学生做学习、开发和个人网络实验。学生身份、学校邮箱和账号都用自己的真实信息；学校、Azure、所在地区及目标服务的规则也得一起遵守。别伪造材料、共用账号，或拿网络工具绕过地区、身份验证和服务限制。Azure for Students 适用于教育、非商业研究、软件开发、测试和演示等场景。

学生邮箱、GitHub Education 和 Azure 经常被说成一套“学生福利”，实际要分开看。GitHub Education 过了，不会把 Azure for Students 一起过掉；Azure 仍然要用微软账号和学校邮箱再验一次。这个坑先记住，申请时少走弯路。

## GitHub Education 先单独申请

GitHub 账号建好后，到 **Settings → Emails** 添加并验证学校教育邮箱，再打开 [Education benefits](https://github.com/settings/education/benefits)，点 **Start an application**。

审核时可能要求教育邮箱，也可能要在读材料。学生证、课表、成绩单、学籍或在读证明都可以，但材料里要能看见有效在读日期。学校邮箱域名没被识别，就按 [GitHub 官方说明](https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)联系 GitHub Education Support，附上学校名称、官网和邮箱域名。不要短时间反复提交，更不要拿不真实的材料赌审核。

过审后，能领什么以自己的 Education 面板为准。域名、云服务这类权益会变，期限和领取条件也可能调整。

下面这两份是可以直接打开的操作说明；资格、费用和条款还是以官方页面为准。

- [GitHub Education：申请学生权益](https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)
- [Microsoft AI-edu：如何申请 Azure 学生账号](https://github.com/microsoft/ai-edu/blob/master/docs/FAQ.md#11-如何申请azure学生账号)

## Azure for Students 还要再验一次

从 [Azure for Students](https://azure.microsoft.com/zh-cn/free/students) 入口，用自己的微软账号注册，再按页面要求验证机构邮箱和学生资格。当前学生订阅给的是无信用卡的 100 美元 Azure 额度，有效期一年；符合资格的在读学生可续订，每个人只有一个符合条件的学生订阅。额度不能拿去付 Azure Marketplace 的购买项，所以选镜像时除了能不能创建，还要看 **Pricing + terms**，别误选带额外软件许可的 Marketplace 镜像。

注册好我会马上去看两处：**Azure Education Hub → Overview** 的余额和到期日，以及 **Cost Management** 里的预算告警。100 美元能不能撑一年没有统一答案；小 VM 本身可能花得不多，磁盘、静态公网 IP、流量、备份和忘记删的资源都会慢慢吃额度。

## 选地区和机型，别把 `B1ts` 当成 SKU

Portal 顶部的 Cloud Shell 能直接跑 Azure CLI，本机装了 Azure CLI 也一样。先登录，再看地区名：

```bash
az login
az account list-locations --query "[].{名称:name,显示名:displayName}" -o table
```

下面拿 `eastus` 举例。第一个命令查当前订阅在这个地区可用的 B 系列，第二个专门看 `Standard_B1s` 有没有被地区、配额或订阅限制。它们只能告诉你能不能开，不能告诉你“这个地区免费”。价格、容量和可用机型都要回 Portal 再确认。

```bash
LOCATION="eastus"

# 这个地区当前订阅可创建的 B 系列机型
az vm list-skus \
  --location "$LOCATION" \
  --resource-type virtualMachines \
  --size Standard_B \
  -o table

# 检查 B1s 的 Restrictions；受限就换地区或型号
az vm list-skus \
  --location "$LOCATION" \
  --resource-type virtualMachines \
  --size Standard_B1s \
  --all \
  -o table
```

常见型号叫 `Standard_B1s`，不是 `B1ts`。它是 1 vCPU、1 GiB 内存的 x86-64 突发型机子；`B1ls` 只有 0.5 GiB 且只支持 Linux，`B1ms` 是 2 GiB。B 系列适合轻量服务、学习环境和低负载任务，长时间跑满 CPU 就不合适。B1s 没容量时，按 Portal 实际能开到的低价型号和镜像架构来选，别硬抄别人的地区。

## Portal 里创建第一台 Linux VM

进入 **Virtual machines → Create → Azure virtual machine**。第一台实验机我会按这张表选，配置简单，也方便后面清理账单。

| 配置项 | 建议 |
| --- | --- |
| 订阅/资源组 | 选 Azure for Students；新建单独资源组，查费和删除都方便 |
| Region | 以 `az vm list-skus` 和 Portal 的实际创建结果为准 |
| Image | Canonical 的 **Ubuntu Server 24.04 LTS - x64 Gen2**，或其他官方 LTS 镜像 |
| Security type | `Standard` |
| Size | 优先 `Standard_B1s`；没有就选实际可用、价格能接受的型号 |
| Authentication | **SSH public key**，私钥自己保存好 |
| 管理账户 | 建普通用户，例如 `azureuser`；别留空，也别用 root 加随意密码 |
| Disk | 从 Standard SSD 一类低成本磁盘开始，并在创建页确认价格 |

官方 LTS 云镜像已经带好了 cloud-init 和 Azure 初始化流程，创建完直接用也没有问题。普通用户、SSH 密钥和 sudo 这套更省心；想重装成自己习惯的系统，也可以走下面的 DD 路线。

### 公网 IP 选 Static，账单也要盯着

在 **Networking** 里创建 Public IP。想让 VM 在停止（deallocated）后重启仍保持同一个地址，就确认是 **Standard SKU + Static**。动态 IP 可能在 deallocate 后变掉；静态 IP 会留到你把 Public IP 资源删掉为止。

稳定 IP 只是方便自己连机器和绑服务，不代表网站会因此信任这个地址，也谈不上“风控白名单”。它还可能产生费用，照样放进预算里。

Standard Public IP 默认需要 NSG 明确放行。初始阶段只开 SSH，并把来源收窄到自己的公网出口 `YOUR_IP/32`。其他端口等服务确定后再加，别一上来全开。

## 登录、改 SSH 端口和面板

VM 创建完，从 Overview 复制公网 IP，用私钥登录：

```bash
ssh -i ~/.ssh/azure_vm_ed25519 azureuser@YOUR_PUBLIC_IP
```

[Tabby](https://tabby.sh/) 用来连 SSH 很顺手，不过普通终端也够用。想装 [1Panel](https://1panel.cn/docs/) 可以，先看文档确认它要开哪些端口、吃多少内存。GitHub Education 送不送域名、现在还能不能领，也直接看自己的权益面板，再决定要不要配 Nginx 和域名。

### SSH 改到 4022/TCP（可选）

换端口不等于安全：密钥登录、关密码登录、系统更新和 NSG 来源限制更重要。真要改，顺序不能错：新端口规则先加好，用第二个终端测试能连，再关 22。

```bash
# VM 内先写入端口，检查无误后热加载
echo 'Port 4022' | sudo tee /etc/ssh/sshd_config.d/99-port.conf
sudo sshd -t
sudo systemctl reload ssh
```

在 Azure NSG 放行 `TCP 4022`，来源尽量写自己的 `YOUR_IP/32`。确认 `ssh -p 4022 ...` 能正常连接，才删除旧的 22/TCP 规则。

### 想 DD 重装，就按这个脚本走

这里的 DD 没有删掉，只是不建议还没连过一次机器就直接操作。先用 Azure 创建时的 SSH 密钥确认能进系统、确认 22/TCP 的 NSG 规则在，再执行 [bin456789/reinstall](https://github.com/bin456789/reinstall)。这个项目会清空整块系统盘；重装开始前把私钥、需要的资料和 Serial Console 的恢复方式留好。

下面是重装 Ubuntu 24.04 的一套最直接写法。想用默认 `root` 账号就把 `--username root` 保留，密码替换成自己要设的强密码：

```bash
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh
bash reinstall.sh ubuntu 24.04 --username root --password '替换成自己的强密码'
```

脚本跑完会重启，等十分钟左右再用 `root@公网 IP` 登录。项目 README 也说明了：用户名和密码都不填时会落到 `root` 和随机密码；要自己定密码，就把参数明确写出来。重装后若改 SSH 端口或改回密钥登录，重新检查 `/etc/ssh/sshd_config.d/` 下的配置，并在 Azure NSG 同步端口。

如果你手上本来就有可信的 Linux raw 镜像，才用它的 DD 功能：

```bash
bash reinstall.sh dd --img "https://你的可信镜像地址/系统镜像.xz" --username root --password '替换成自己的强密码'
```

`dd` 模式不会替你修改 Linux 镜像里的内容，镜像来源和里面预置的网络/SSH 配置要自己确认。没有现成 raw 镜像时，上面的 Ubuntu 重装命令更省事。

## sing-box：配置选定以后再放端口

[sing-box 官方安装文档](https://sing-box.sagernet.org/installation/package-manager/)有软件包和服务管理方式。想走一键多协议配置，可以参考第三方项目 [fscarmen/sing-box](https://github.com/fscarmen/sing-box)。这类脚本会以高权限下载和执行内容，README 和脚本自己先看一遍，从项目页拿当前命令；看不懂或不信任来源就别直接跑。

项目给出的交互式入口是：

```bash
bash <(wget -qO- https://raw.githubusercontent.com/fscarmen/sing-box/main/sing-box.sh)
```

小规格 VM 先开一个客户端明确支持的协议就够了。脚本跑完记下实际监听端口和订阅地址，再导入 Clash Verge、Mihomo 等兼容客户端。碰到协议解析错误，优先升级客户端、导出兼容的单协议配置，或者按脚本文档查；不要为了消除报错随手删掉自己看不懂的字段。

### 端口按最终协议开

| 场景/协议 | Azure NSG 要放行 |
| --- | --- |
| SSH 管理 | TCP 22 或 TCP 4022；来源尽量限制为 `YOUR_IP/32` |
| VLESS Reality、Trojan、AnyTLS、Naive | 配置中选定的 **TCP** 端口，常见示例是 443 |
| VLESS/VMess 的 WebSocket、HTTP/2 等 TCP 传输 | 反向代理或入站实际监听的 **TCP** 端口 |
| Shadowsocks | 配置声明的端口和传输；常见情况要放 **TCP + UDP** |
| Hysteria2、TUIC | 配置中选定的 **UDP** 端口，常见示例是 443 |
| Hysteria2 端口跳跃 | 配置的整段 **UDP** 范围；没启用就别开范围 |

下面只演示已经确定需要 TCP/UDP 443 时的 NSG 写法，资源组和 NSG 名称换成自己的。SSH 端口别照这个对全网开放。

```bash
RG="YOUR_RESOURCE_GROUP"
NSG="YOUR_NSG_NAME"

az network nsg rule create \
  --resource-group "$RG" --nsg-name "$NSG" \
  --name Allow-TCP-443 --priority 200 \
  --direction Inbound --access Allow --protocol Tcp \
  --source-address-prefixes '*' --destination-port-ranges 443

az network nsg rule create \
  --resource-group "$RG" --nsg-name "$NSG" \
  --name Allow-UDP-443 --priority 210 \
  --direction Inbound --access Allow --protocol Udp \
  --source-address-prefixes '*' --destination-port-ranges 443
```

## 验证出口，顺手说清 Codex 的代理范围

登录 VM 后，先看机器的公网出口：

```bash
curl https://ifconfig.me
```

客户端启用配置后，再用同类 IP 查询服务确认流量路径。浏览器里可以用 SwitchyOmega 一类的代理切换扩展，单独建“直连”和“本地代理”两个情景；来源不明的 PAC 和订阅别往里导。

Codex 的 `features.network_proxy` 也别理解错。它约束的是**本地命令沙箱里运行的脚本、程序和子进程**，不接管 Web 搜索、浏览器、连接器、Codex 云任务，或者客户端的模型与认证请求。改一个 `config.toml`，不能让桌面 App 或 ChatGPT 的所有流量都强制改道。

如果用的是 Codex CLI，只想让它启动的命令在已有网络权限的前提下遵循本机上游代理，可以在 `~/.codex/config.toml` 写一个收紧过的命令沙箱策略：

```toml
[features.network_proxy]
enabled = true
allow_upstream_proxy = true
domains = { "api.openai.com" = "allow" }
```

再按本地客户端的实际监听端口，在启动 CLI 的终端设置代理环境变量。下面的端口只是占位符，不能直接照抄：

```powershell
$env:HTTP_PROXY = 'http://127.0.0.1:LOCAL_HTTP_PORT'
$env:HTTPS_PROXY = 'http://127.0.0.1:LOCAL_HTTP_PORT'
$env:ALL_PROXY = 'socks5://127.0.0.1:LOCAL_SOCKS_PORT'
codex
```

这只影响本地命令和它的子进程。桌面客户端以及受工作区或管理员管理的环境，仍然要按产品设置和网络策略来。

## 参考资料

- [GitHub Education 学生申请（官方）](https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)
- [Azure for Students 官方说明与使用范围](https://azure.microsoft.com/zh-cn/free/students)
- [Azure 学生资格与额度说明](https://learn.microsoft.com/zh-cn/azure/education-hub/about-azure-for-students)
- [Azure 学生订阅额度与预算](https://learn.microsoft.com/en-us/azure/education-hub/navigate-costs)
- [Azure CLI：查询可用 VM SKU](https://learn.microsoft.com/en-gb/cli/azure/vm?view=azure-cli-latest#az-vm-list-skus)
- [Azure Bv1 系列规格](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/bv1-series)
- [Azure Public IP：Static 与 Dynamic 的差异](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address)
- [sing-box 官方安装](https://sing-box.sagernet.org/installation/package-manager/)
- [fscarmen/sing-box 第三方一键脚本](https://github.com/fscarmen/sing-box)
