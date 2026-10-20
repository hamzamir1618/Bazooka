"""Build single-file, offline-ready copies of the prototype and the design review.

    python design/scripts/build_share.py

Writes to design/share/:
    BAZOOKA-Prototype.html      the full scroll prototype
    BAZOOKA-Design-Review.html  the manager-facing review doc (embeds the prototype)

Everything is inlined: WebP sprites as data URIs, Google Fonts as base64 woff2,
GSAP / ScrollTrigger / Lenis as inline scripts. The first run downloads the
fonts and libraries into design/vendor/ (cached for later runs); the output
files need no network at all.
"""
import base64
import hashlib
import json
import re
import urllib.request
from pathlib import Path

DESIGN = Path(__file__).resolve().parents[1]
ASSETS = DESIGN / 'assets'
VENDOR = DESIGN / 'vendor'
OUT = DESIGN / 'share'

# Google serves woff2 (with unicode-range subsets) to modern browsers only
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'


def fetch(url):
    """Download once, then serve from design/vendor/."""
    VENDOR.mkdir(exist_ok=True)
    name = re.sub(r'[^A-Za-z0-9._-]', '_', url.split('//', 1)[-1])[-80:]
    path = VENDOR / (hashlib.sha1(url.encode()).hexdigest()[:10] + '-' + name)
    if not path.exists():
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            path.write_bytes(r.read())
    return path.read_bytes()


def used_ranges(sheet_block, chars):
    """True if an @font-face block's unicode-range covers any character on the page."""
    m = re.search(r'unicode-range:\s*([^;]+);', sheet_block)
    if not m:
        return True
    for part in m.group(1).split(','):
        lo, _, hi = part.strip()[2:].partition('-')
        lo = int(lo, 16)
        hi = int(hi, 16) if hi else lo
        if any(lo <= c <= hi for c in chars):
            return True
    return False


def inline_fonts(html):
    html = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', html)
    # Dela Gothic One alone ships 100+ CJK subsets: keep only the ones this page can use
    chars = {ord(ch) for ch in html}

    def css(m):
        sheet = fetch(m.group(1).replace('&amp;', '&')).decode()
        blocks = re.findall(r'(?:/\*[^*]*\*/\s*)?@font-face\s*{[^}]*}', sheet)
        sheet = '\n'.join(b for b in blocks if used_ranges(b, chars))
        sheet = re.sub(
            r'url\((https://[^)]+)\)',
            lambda f: 'url(data:font/woff2;base64,' + base64.b64encode(fetch(f.group(1))).decode() + ')',
            sheet)
        return '<style>\n' + sheet + '</style>'
    return re.sub(r'<link href="(https://fonts\.googleapis\.com/[^"]+)" rel="stylesheet">', css, html)


def inline_scripts(html):
    def js(m):
        code = fetch(m.group(1)).decode().replace('</script', '<\\/script')
        return '<script>' + code + '</script>'
    return re.sub(r'<script src="(https://[^"]+)"></script>', js, html)


def inline_images(html):
    """Embed each sprite once. <img src="assets/x.webp"> becomes data-bz="x", and a tiny
    resolver (placed before the page's main script) points every such <img> at one shared
    data URI, so a sprite used in four places is only stored once."""
    names = sorted(set(re.findall(r'assets/([a-z0-9-]+)\.webp', html)))
    if not names:
        return html
    html = re.sub(r'src="assets/([a-z0-9-]+)\.webp"', r'data-bz="\1"', html)
    data = {n: base64.b64encode((ASSETS / f'{n}.webp').read_bytes()).decode() for n in names}
    resolver = (
        '<script>\n'
        '// Single-file build: every sprite is stored once and shared by all <img data-bz> tags\n'
        'const BZ_IMG = ' + json.dumps(data) + ';\n'
        "document.querySelectorAll('img[data-bz]').forEach(img => { img.src = 'data:image/webp;base64,' + BZ_IMG[img.dataset.bz]; });\n"
        '</script>\n'
    )
    i = html.rindex('<script>')
    return html[:i] + resolver + html[i:]


def drop_share_only(html):
    # elements marked data-share="drop" only make sense next to the source files
    return re.sub(r'<a [^>]*data-share="drop"[^>]*>.*?</a>\n?', '', html)


def standalone(path):
    html = path.read_text(encoding='utf-8')
    return inline_images(inline_scripts(inline_fonts(drop_share_only(html))))


def embed_prototype(review_html, proto_html):
    # < keeps "</script>" and "<!--" inside the JSON string from ending the script early
    payload = json.dumps(proto_html).replace('<', '\\u003c')
    loader = (
        '<script>\n'
        '// Single-file build: the full prototype is embedded below and served to the reels from a blob: URL\n'
        'window.BZ_PROTO = (() => {\n'
        '  const html = ' + payload + ';\n'
        '  let url = null;\n'
        "  const get = () => url || (url = URL.createObjectURL(new Blob([html], { type: 'text/html' })));\n"
        "  return { url: opts => get() + (opts ? '#' + opts : '') };\n"
        '})();\n'
        '</script>\n'
    )
    marker = '<script>\n/* ============================================================================\n   Where the prototype lives.'
    assert review_html.count(marker) == 1, 'review.html loader marker not found'
    return review_html.replace(marker, loader + marker)


def main():
    OUT.mkdir(exist_ok=True)
    proto = standalone(DESIGN / 'prototype.html')
    review = embed_prototype(standalone(DESIGN / 'review.html'), proto)
    for name, html in [('BAZOOKA-Prototype.html', proto), ('BAZOOKA-Design-Review.html', review)]:
        leftovers = re.findall(r'(?:src|href)="(?:https?:)?//[^"]+"|assets/[a-z0-9-]+\.webp', html)
        assert not leftovers, f'{name} still references external files: {leftovers[:5]}'
        (OUT / name).write_text(html, encoding='utf-8')
        print(f'{name}: {len(html.encode()) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
