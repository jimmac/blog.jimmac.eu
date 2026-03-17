find content/posts -name "*.md" -type f | while read f; do
  # Only process files that still have YAML front matter
  if head -1 "$f" | grep -q "^---"; then
    python3 - "$f" << 'EOF'
import sys, re

path = sys.argv[1]
with open(path) as fh:
    content = fh.read()

# Split on YAML front matter
m = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
if not m:
    sys.exit(0)

fm, body = m.group(1), m.group(2)

# Fix date: strip time and timezone
fm = re.sub(r'^(date:\s*\d{4}-\d{2}-\d{2})[\s\d:+\-]*$', r'\1', fm, flags=re.MULTILINE)

# Convert YAML list tags to TOML taxonomies
tags_m = re.search(r'^tags:\n((?:- .+\n?)+)', fm, re.MULTILINE)
tags_toml = ""
if tags_m:
    tags = re.findall(r'- (.+)', tags_m.group(1))
    tags_toml = '\n[taxonomies]\ntags = [' + ', '.join(f'"{t.strip()}"' for t in tags) + ']'
    fm = fm[:tags_m.start()] + fm[tags_m.end():]

# Convert remaining YAML key: value lines to TOML
def yaml_to_toml(line):
    m = re.match(r'^(\w+):\s*(.*)', line)
    if not m:
        return line
    k, v = m.group(1), m.group(2).strip()
    if not v:
        return None
    if v.startswith('"') or v.startswith("'"):
        v = v.strip('"\'')
    return f'{k} = "{v}"'

toml_lines = []
for line in fm.splitlines():
    converted = yaml_to_toml(line)
    if converted:
        toml_lines.append(converted)

new_fm = '\n'.join(toml_lines) + tags_toml

with open(path, 'w') as fh:
    fh.write(f'+++\n{new_fm}\n+++\n{body}')

print(f"Converted: {path}")
EOF
  fi
done
