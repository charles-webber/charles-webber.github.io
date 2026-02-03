import sys

# Fix _config.yml - Live2D scriptFrom
config_file = r's:\Blog\_config.yml'
with open(config_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and replace the scriptFrom line (around line 151)
for i, line in enumerate(lines):
    if 'scriptFrom:' in line and 'local' in line:
        lines[i] = '  scriptFrom: https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js\n'
        print(f'Fixed line {i+1} in _config.yml')
        break

with open(config_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✓ _config.yml updated')

# Fix _config.butterfly.yml - disable wowjs and electric_clock
butterfly_file = r's:\Blog\_config.butterfly.yml'
with open(butterfly_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_wowjs = False
in_electric = False

for i, line in enumerate(lines):
    # Check if we're in wowjs section
    if line.strip() == 'wowjs:':
        in_wowjs = True
        in_electric = False
    # Check if we're in electric_clock section
    elif line.strip() == 'electric_clock:':
        in_electric = True
        in_wowjs = False
    # Check if we've left these sections
    elif line.strip().endswith(':') and not line.strip().startswith('-'):
        in_wowjs = False
        in_electric = False
    
    # Replace enable: true in these sections
    if (in_wowjs or in_electric) and 'enable:' in line and 'true' in line:
        indent = len(line) - len(line.lstrip())
        lines[i] = ' ' * indent + 'enable: false\n'
        section = 'wowjs' if in_wowjs else 'electric_clock'
        print(f'Fixed line {i+1} in _config.butterfly.yml ({section})')

with open(butterfly_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✓ _config.butterfly.yml updated')
print('\n✓ All files fixed successfully!')
