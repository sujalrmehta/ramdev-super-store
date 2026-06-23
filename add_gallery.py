import re

with open('db.js', 'r', encoding='utf-8') as f:
    content = f.read()

def repl(match):
    img_url_line = match.group(0)
    original_url = match.group(1)
    return img_url_line + '\n        gallery: [\n            ' + original_url + ',\n            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",\n            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"\n        ],'

new_content = re.sub(r'image_url:\s*("[^"]+"),', repl, content)

with open('db.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated db.js with gallery arrays')
