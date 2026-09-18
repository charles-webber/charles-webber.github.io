---
title: 学生邮箱申请 Azure for Students：创建 Linux 云服务器与个人网络实验节点
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
description: 从 GitHub Education 与 Azure for Students 的独立认证开始，记录如何选择 Linux VM、配置静态公网 IP 与安全组，并合规地搭建个人网络实验节点。
---

> 本文面向在校学生的学习、开发与个人网络实验。请使用本人真实学生身份与学校邮箱，遵守学校、Azure、所在地区及目标服务的规则；不要伪造材料、共享账号，或用网络工具绕过地区、身份验证和服务安全限制。Azure for Students 仅限教育、非商业研究及软件开发/测试/演示等用途。

很多人把“学生邮箱 + GitHub Education + Azure”说成一条龙福利，但实际上它们是**两套独立的资格验证**：GitHub Education 认证并不会自动让 Azure for Students 通过。把这点先弄清楚，后面会少走很多弯路。

## 0. 先看结论与成本边界

- GitHub Education 需要 GitHub 个人账号、真实在读身份和学校要求的材料；学校邮箱通常需要先添加到 GitHub 并完成验证。
- Azure for Students 需要微软账号和机构邮箱验证学籍，当前为无需信用卡的 100 美元额度，有效期一年；符合资格的在读学生可按年度续订。每人只能有一个符合条件的学生订阅。
- 没有“免费地区”这种固定概念：地区决定的是 SKU 容量、可用机型和价格；学生订阅用的是额度。创建前必须在 Portal 的价格页确认 VM、磁盘与公网 IP 的费用。
- 本文不承诺“100 美元一定够用一年”。轻量 VM 可能够，但磁盘、静态公网 IP、流量、备份和误开资源都会消耗额度；先设置预算并定期查看 Education Hub。

官方入口：[GitHub Education 学生申请](https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)｜[Azure for Students](https://azure.microsoft.com/zh-cn/free/students)｜[Azure 学生资格与额度说明](https://learn.microsoft.com/zh-cn/azure/education-hub/about-azure-for-students)

## 1. 申请 GitHub Education：用真实材料，不要靠反复提交碰运气

先创建 GitHub 个人账号，在 **Settings → Emails** 添加并验证学校教育邮箱；然后进入 [Education benefits](https://github.com/settings/education/benefits)，在 GitHub Education 下点击 **Start an application**。

GitHub 会根据学校与申请情况要求教育邮箱或在读证明。可用的证明包括带有效在读日期的学生证、课表、成绩单或学籍/在读证明。若学校域名未被识别，按官方要求向 GitHub Education Support 提供学校名称、官网和邮箱域名；不要短时间重复提交，也不要使用不真实的材料。

通过后，在 GitHub Education 门户领取当期可用权益。权益会调整，域名、云服务等项目是否存在、期限和领取条件，都以你的权益面板为准。

如果想先看中文界面经验，可以把这两个链接当作**非官方补充检索**，涉及资格、费用和条款仍以官方页面为准：

- [知乎检索：GitHub Education 学生认证](https://www.zhihu.com/search?type=content&q=GitHub%20Education%20%E5%AD%A6%E7%94%9F%E8%AE%A4%E8%AF%81)
- [知乎检索：Azure for Students 学生账号](https://www.zhihu.com/search?type=content&q=Azure%20for%20Students%20%E5%AD%A6%E7%94%9F%E8%B4%A6%E6%88%B7)

## 2. 再申请 Azure for Students：它不会读取 GitHub 的认证结果

打开 [Azure for Students](https://azure.microsoft.com/zh-cn/free/students)，使用自己的微软账号完成注册，并按页面要求用机构邮箱验证学籍。GitHub Education 认证可以证明你已准备好学生开发者工具，但它不是 Azure 的身份凭证；Azure 仍会独立审核。

目前官方说明是：学生订阅提供 100 美元 Azure 额度、有效期一年，且无需信用卡；额度不能用于 Azure Marketplace 购买项。也就是说，创建 VM 时不要只看“镜像能不能选”，还要看 **Pricing + terms**：有单独 Marketplace 计划或额外软件许可的镜像不应当作学生额度可覆盖的选择。

注册后立刻做两件事：

1. 打开 **Azure Education Hub → Overview**，确认订阅、余额和到期日；
2. 在 **Cost Management** 建一个预算/告警，用来发现意外开出的 VM、磁盘、公网 IP 或备份费用。

## 3. 选择地区与机型：`B1ts` 不是 Azure SKU

在 Azure Portal 顶部打开 **Cloud Shell**，或在本机安装 Azure CLI 后登录：

```bash
az login
az account list-locations --query "[].{名称:name,显示名:displayName}" -o table
```

把 `LOCATION` 换成候选地区，例如 `eastus`。下面第一条查看当前订阅可用的 B 系列 SKU；第二条用 `--all` 排查某个型号是否被区域、配额或订阅限制。它们查询的是**可用性**，不是“免费地区”。

```bash
LOCATION="eastus"

# 当前订阅可创建的 B 系列机型
az vm list-skus \
  --location "$LOCATION" \
  --resource-type virtualMachines \
  --size Standard_B \
  -o table

# 诊断 Standard_B1s 是否被限制；有 Restrictions 时换地区或型号
az vm list-skus \
  --location "$LOCATION" \
  --resource-type virtualMachines \
  --size Standard_B1s \
  --all \
  -o table
```

`Standard_B1s` 才是常见的正确名称，不是 `B1ts`。Bv1 系列的 `Standard_B1s` 为 1 vCPU / 1 GiB 内存，是 x86-64；`B1ls` 只有 0.5 GiB 且仅支持 Linux，`B1ms` 则有 2 GiB。B 系列是突发型 CPU，适合轻量学习和低负载服务，不适合持续高 CPU 工作。若地区没有 B1s、容量不足或配额不够，就选 Portal 实际显示的最低可用、与镜像架构匹配的型号，而不是强行照抄别人的地区。

## 4. 在 Portal 创建 Linux VM：从官方 LTS 镜像和 SSH 密钥开始

在 **Virtual machines → Create → Azure virtual machine** 中，建议按下面的最小化配置建立第一台实验机：

| 配置项 | 建议 |
| --- | --- |
| 订阅/资源组 | 选择 Azure for Students；单独新建一个资源组，便于删除与查账 |
| Region | 以 `az vm list-skus` 和 Portal 实际可创建结果为准 |
| Image | Canonical 的 **Ubuntu Server 24.04 LTS - x64 Gen2** 或同类官方 LTS 镜像 |
| Security type | `Standard` |
| Size | 优先 `Standard_B1s`；不提供就按实际可用型号与价格选择 |
| Authentication | **SSH public key**；下载并妥善保存私钥 |
| 管理账户 | 自己创建普通用户，例如 `azureuser`；不要留空，也不要以 root + 随意密码为默认方案 |
| Disk | 从 Standard SSD 等低成本选项开始，创建前检查磁盘价格 |

官方 Ubuntu LTS 云镜像已经是可用的干净系统，保留 cloud-init 和 Azure 的网络初始化流程。不要因为“纯净系统”就默认重装 DD，也不要开启 root 密码 SSH 登录；SSH 密钥 + 普通用户 + sudo 更安全，也更不容易把自己锁在门外。

### 公网 IP：要稳定就选 Static，但它不等于“风控白名单”

在 **Networking** 中创建 Public IP。若你确实需要在 VM 停止（deallocated）后仍保持同一地址，请确认是 **Standard SKU + Static**。动态地址可能在 deallocate 后再次启动时变化；静态地址会一直保留到你删除 Public IP 资源为止。

公网 IP 只是稳定的网络终点，并不让任何网站“信任”你，也不保证不会触发风控。它本身还有计费可能，所以仍要把它纳入预算。

Standard Public IP 默认需要 NSG 显式放行流量。创建时不要把所有入站端口都打开：先只放行 SSH，且将来源限制为你自己的公网出口 IP（`YOUR_IP/32`）；之后再按实际服务协议增量放行。

## 5. 连接、换端口与面板：先保证不会断连

创建完成后，从 VM Overview 复制公网 IP，用私钥登录：

```bash
ssh -i ~/.ssh/azure_vm_ed25519 azureuser@YOUR_PUBLIC_IP
```

[Tabby](https://tabby.sh/) 是可选的 SSH 客户端；不用面板也完全可以。若要安装 [1Panel](https://1panel.cn/docs/)，先阅读官方文档并确认它会开放哪些端口、消耗多少内存。学生福利中的域名权益也可能随时间改变，先在自己的 GitHub Education 面板核对后再绑定域名和配置 Nginx。

### 可选：把 SSH 改到 4022/TCP

改端口不是安全的替代品，SSH 密钥、禁用密码登录、及时更新系统和 NSG 来源限制更重要。若仍要修改，**先添加新端口规则并在第二个终端测试成功，再关闭 22**：

```bash
# VM 内：先增加端口，再检查配置并热加载
echo 'Port 4022' | sudo tee /etc/ssh/sshd_config.d/99-port.conf
sudo sshd -t
sudo systemctl reload ssh
```

同时在 Azure NSG 放行 `TCP 4022`，并在主机防火墙放行同一端口；建议来源填写你的固定出口 `YOUR_IP/32`。确认 `ssh -p 4022 ...` 能连接后，才删除旧的 22/TCP 规则。

`[bin456789/reinstall](https://github.com/bin456789/reinstall)` 是第三方重装脚本链接，不是 Azure 官方操作，也会影响云初始化、SSH 和网络配置。除非你了解恢复路径并已做好快照、Serial Console/救援方案和密钥备份，否则不建议把它作为首选步骤。

## 6. 用 sing-box 做个人网络实验：选择协议后再开端口

[sing-box 官方安装文档](https://sing-box.sagernet.org/installation/package-manager/)提供受维护的软件包与服务管理方式。若确实要使用一键多协议工具，可参考第三方项目 [fscarmen/sing-box](https://github.com/fscarmen/sing-box)。它会以高权限下载并执行脚本，使用前应阅读项目 README 和脚本内容，并从 GitHub 项目页取得当前命令；不要在不理解配置或不信任来源时直接 `curl | bash`。

该项目的交互式入口为：

```bash
bash <(wget -qO- https://raw.githubusercontent.com/fscarmen/sing-box/main/sing-box.sh)
```

小规格 VM 建议先只启用自己客户端确认支持的一种协议，再记录脚本最终输出的端口与订阅地址。导入 Clash Verge / Mihomo 兼容客户端前先备份本地配置；如果出现协议解析错误，优先升级客户端、导出兼容的单协议配置或查看脚本文档，**不要删除自己不理解的字段**。

### 端口清单：以你的最终配置为准

| 场景/协议 | Azure NSG 与主机防火墙要放行 |
| --- | --- |
| SSH 管理 | TCP 22 或 TCP 4022；来源尽量限制为 `YOUR_IP/32` |
| VLESS Reality、Trojan、AnyTLS、Naive | 选定的 **TCP** 端口，常见示例为 443 |
| VLESS/VMess 的 WebSocket、HTTP/2 等 TCP 传输 | 对外反向代理或入站实际监听的 **TCP** 端口 |
| Shadowsocks | 配置声明的端口与传输；常见为 **TCP + UDP** 都需要 |
| Hysteria2、TUIC | 选定的 **UDP** 端口，常见示例为 443 |
| Hysteria2 端口跳跃 | 配置的整个 **UDP** 端口范围；不启用就不要放行范围 |

Azure NSG 与 VM 内防火墙是两层规则，二者必须同时匹配。下例仅演示“已确定需要 TCP/UDP 443”时的 NSG 规则；将变量替换为自己的资源组和 NSG 名称。SSH 端口不要照此对全网开放。

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

如果启用了 UFW，也只放行最终实际使用的端口：

```bash
sudo ufw allow 4022/tcp       # 仅在你已迁移 SSH 时需要
sudo ufw allow 443/tcp        # 仅在你的配置需要 TCP 443 时需要
sudo ufw allow 443/udp        # 仅在你的配置需要 UDP 443 时需要
sudo ufw status numbered
```

## 7. 验证出口与 Codex 的正确理解

连接到 VM 后可先查看 VM 出口地址：

```bash
curl https://ifconfig.me
```

在客户端启用所选配置后，再访问同类 IP 查询服务确认流量路径。浏览器可以用代理切换扩展（例如 SwitchyOmega 系列）建立“直连”和“本地代理”两个明确的情景；不要导入来源不明的 PAC 或订阅。

### Codex 不是改一个 `config.toml` 就能“强制所有流量走代理”

这点需要特别纠正。Codex 官方文档中的 `features.network_proxy` 约束的是**本地命令沙箱中运行的脚本、程序和子进程**，不会接管 Web 搜索、浏览器、连接器、Codex 云任务，或客户端的模型与认证请求。因此它不是让桌面 App/ChatGPT 所有流量强制改道的万能开关。

如果你使用 Codex CLI，且只是希望它启动的命令在已获网络权限的前提下遵循本机上游代理，可以在 `~/.codex/config.toml` 做最小化的命令沙箱策略；按实际需要收紧域名，不要盲目放开所有目的地：

```toml
[features.network_proxy]
enabled = true
allow_upstream_proxy = true
domains = { "api.openai.com" = "allow" }
```

然后再按本地客户端实际监听端口，在启动 CLI 的终端设置标准代理环境变量。以下端口只是占位符，不能照抄：

```powershell
$env:HTTP_PROXY = 'http://127.0.0.1:LOCAL_HTTP_PORT'
$env:HTTPS_PROXY = 'http://127.0.0.1:LOCAL_HTTP_PORT'
$env:ALL_PROXY = 'socks5://127.0.0.1:LOCAL_SOCKS_PORT'
codex
```

这只适用于本地命令与其子进程的网络路径；桌面客户端或受工作区/管理员管理的环境应以其产品设置和网络策略为准。

## 收尾：把资源管理当作部署的一部分

最后检查一次 Azure Portal：确认 VM、磁盘、Public IP、NSG 和可能的备份资源都在预期资源组内；不再使用时停止/删除不需要的资源。学生额度是学习资源，不是无限免费服务器。保持最小端口暴露、密钥登录、定期更新和预算告警，才能让这台实验机长期稳定地服务于你的课程与个人项目。

## 参考资料

- [GitHub Education 学生申请（官方）](https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)
- [Azure for Students 官方说明与使用范围](https://azure.microsoft.com/zh-cn/free/students)
- [Azure 学生订阅额度与预算](https://learn.microsoft.com/en-us/azure/education-hub/navigate-costs)
- [Azure CLI：查询可用 VM SKU](https://learn.microsoft.com/en-gb/cli/azure/vm?view=azure-cli-latest#az-vm-list-skus)
- [Azure Bv1 系列规格](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/bv1-series)
- [Azure Public IP：Static 与 Dynamic 的差异](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address)
- [sing-box 官方安装](https://sing-box.sagernet.org/installation/package-manager/)
- [fscarmen/sing-box 第三方一键脚本](https://github.com/fscarmen/sing-box)
