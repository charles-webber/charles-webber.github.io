import requests
import os
import json
import time
import shutil

# ================= 配置 =================
# 想要下载的图片关键词 (英文)
KEYWORD = "anime" # 可以改为 "anime", "hatsune miku", "landscape" 等
# 下载数量 (用户要求 10 张)
LIMIT = 10
# 初始默认值，会在 main 中根据环境自动更新
SAVE_DIR = "downloaded_bgs"
# ========================================

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"创建目录: {directory}")

def get_wallhaven_images(keyword, page=1):
    """从 Wallhaven API 获取图片 URL，严格限制分辨率不超过 2K (2560px)"""
    url = "https://wallhaven.cc/api/v1/search"
    # 添加 resolutions 参数，只请求常见的高清但非4K分辨率
    # 2K = 2560x1440, FHD = 1920x1080
    params = {
        "q": keyword,
        "sorting": "toplist",
        "purity": "100",
        "categories": "111", 
        "page": page,
        # 尝试通过 API 过滤 (但 Wallhaven API 这里的行为有时是 'atleast')
        # 所以我们下面还会手动二次过滤
        "atleast": "1920x1080" 
    }
    
    print(f"正在搜索 Wallhaven: {keyword} (Page {page}, Max 2K)...")
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        res = requests.get(url, params=params, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            image_list = []
            
            for item in data.get("data", []):
                # 获取原图分辨率
                w = item.get("dimension_x", 9999)
                h = item.get("dimension_y", 9999)
                
                # 严格过滤：宽度不能超过 2560 (2K Standard)
                if w > 2560:
                    continue
                    
                image_list.append(item.get("path"))
            
            print(f"本页筛选后符合要求的图片数量: {len(image_list)}")
            return image_list
        else:
            print(f"API 请求失败: {res.status_code}")
            return []
    except Exception as e:
        print(f"搜索出错: {e}")
        return []

def clean_directory(directory):
    """清空目录下的所有文件 (替换模式)"""
    print(f"准备清空原有壁纸: {directory}")
    if not os.path.exists(directory):
        return

    removed_count = 0
    for f in os.listdir(directory):
        fpath = os.path.join(directory, f)
        try:
            if os.path.isfile(fpath):
                os.remove(fpath)
                removed_count += 1
        except Exception as e:
            print(f"删除失败: {fpath}, {e}")

    print(f"目录清理完成，共删除了 {removed_count} 个文件。\n")

def download_image(url, save_dir, index):
    """下载单张图片"""
    if not url:
        return None
    
    filename = f"dl_bg_{index + 1}.jpg" # 统一命名
    filepath = os.path.join(save_dir, filename)
    
    # 获取实际文件扩展名
    ext = url.split('.')[-1]
    if ext in ['jpg', 'png', 'jpeg']:
        filename = f"dl_bg_{index + 1}.{ext}"
        filepath = os.path.join(save_dir, filename)

    print(f"正在下载 [{index+1}]: {url}")
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        res = requests.get(url, headers=headers, stream=True, timeout=20)
        if res.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in res.iter_content(1024):
                    f.write(chunk)
            print(f" -> 已保存: {filepath}")
            return filename
        else:
            print(f" -> 下载失败: {res.status_code}")
            return None
    except Exception as e:
        print(f" -> 下载出错: {e}")
        return None

if __name__ == "__main__":
    # ================= 智能路径判定 =================
    # 如果 source/imgs/bg 存在 (本地开发环境/源码环境)
    if os.path.exists("source"):
        base_dir = "source"
        is_source_env = True
        print("环境检测: 源码目录 (Hexo Source Detected)")
    else:
        # 否则假设在 Public/VPS 部署目录
        base_dir = "." 
        is_source_env = False
        print("环境检测: 部署目录 (Static Public Detected)")
    
    # 图片保存路径
    # - 源码环境：依旧放在 /imgs/bg（由 Hexo 构建进入 public）
    # - 部署/VPS 环境：改为 /bg，方便直接被静态站点访问
    if is_source_env:
        save_dir = os.path.join(base_dir, "imgs", "bg")
        web_prefix = "/imgs/bg/"
    else:
        save_dir = os.path.join(base_dir, "bg")
        web_prefix = "/bg/"

    SAVE_DIR = save_dir # 更新全局变量供 download_file 使用
    # ===============================================

    # 1. 确保目录存在
    ensure_dir(SAVE_DIR)
    
    # ================= 智能更新逻辑 =================
    should_download = True
    vps_config_file = "vps_bg_config.json"
    
    # 仅在 VPS (非源码) 环境下检查时间间隔
    if not is_source_env:
        if os.path.exists(vps_config_file):
            # 检查上次修改时间
            mtime = os.path.getmtime(vps_config_file)
            # 用户要求: 每隔一天 (约 48 小时)
            # 设置为 40 小时，保证每两天能更新一次
            if time.time() - mtime < 40 * 3600:
                print(f"检测到 {vps_config_file} 最近已更新 (未超过 40 小时)。")
                print("保持现有壁纸，跳过本次下载。")
                should_download = False
    # ===============================================

    if should_download:
        # 1.5 清空旧壁纸 (替换模式)
        clean_directory(SAVE_DIR)
        
        # 2. 循环获取与下载，直到满足数量
        total_downloaded = 0
        current_page = 1
        max_pages = 5 # 防止无限循环
        
        print(f"目标下载数量: {LIMIT} 张")

        while total_downloaded < LIMIT and current_page <= max_pages:
            print(f"正在获取第 {current_page} 页图片列表...")
            urls = get_wallhaven_images(KEYWORD, page=current_page)
            
            if not urls:
                print("该页未获取到有效图片或网络异常。")
                if total_downloaded == 0 and current_page == 1:
                     print("尝试使用备用源...")
                     # 备用源: Bing 每日图, Picsum
                     urls = [
                        "https://api.dujin.org/bing/1920.php",
                        "https://picsum.photos/1920/1080"
                     ]
                else:
                    # 如果不是第一页失败，可能只是后面没图了，就此停止
                    break

            for url in urls:
                if total_downloaded >= LIMIT:
                    break
                
                # 传入 total_downloaded 作为 index 命名
                fname = download_image(url, SAVE_DIR, total_downloaded)
                if fname:
                    total_downloaded += 1
                    time.sleep(1) # 礼貌延时
            
            current_page += 1
            if total_downloaded < LIMIT:
                print(f"当前已下载: {total_downloaded}/{LIMIT}，尝试下一页...")
                time.sleep(2)

        # 4. 生成配置 json
        if not is_source_env:
            print("正在生成 bg_config.json ...")
            # 扫描目录下的所有图片
            all_imgs = []
            try:
                if os.path.exists(SAVE_DIR):
                    for f in os.listdir(SAVE_DIR):
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                            # web 路径根据环境选择 /imgs/bg/ 或 /bg/
                            all_imgs.append(f"{web_prefix}{f}")
                
                with open(vps_config_file, 'w', encoding='utf-8') as f:
                    json.dump(all_imgs, f)
                print(f"配置文件已更新: {os.path.abspath(vps_config_file)}")
            except Exception as e:
                print(f"生成配置文件失败: {e}")
    else:
        # 如果跳过下载，仅输出信息
        print("部署流程结束 (使用了现有缓存)。")

    print("\n所有任务完成！")
    print(f"图片位置: {os.path.abspath(SAVE_DIR)}")
