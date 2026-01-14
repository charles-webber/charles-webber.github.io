import re

file_path = r'S:\Blog\_config.yml'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open(file_path, 'r', encoding='gbk') as f:
        content = f.read()

# 目标： position: right, hOffset: 100 (往左挪 100px)

# 1. 先把 left 改回 right
content = re.sub(r'(display:\s*\n\s*position:\s*)left', r'\1right', content)

# 2. 找到 hOffset 并改大
# 匹配 hOffset: 数字
if re.search(r'hOffset:\s*\d+', content):
    content = re.sub(r'hOffset:\s*\d+', r'hOffset: 100', content)
else:
    # 如果没有，就在 width 后面加一行
    content = re.sub(r'(width:\s*\d+)', r'\1\n    hOffset: 100', content)

print("Updated Live2D: Position -> Right, Offset -> 100")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
