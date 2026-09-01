from pathlib import Path

ROOT = Path('_site')

OFFICIAL_CACHE = 'meu-dinheiro-oficial-routeguard-v2'
BETA_CACHE = 'meu-dinheiro-beta-routeguard-v2'


def service_worker(cache_name: str) -> str:
    return f'''const CACHE = {cache_name!r};
const CACHE_PREFIX = CACHE.includes('beta') ? 'meu-dinheiro-beta-' : 'meu-dinheiro-oficial-';
const CORE = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png'];

self.addEventListener('install', (event) => {{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', (event) => {{
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  const scopePath = new URL(self.registration.scope).pathname;
  const isAppNavigation = url.pathname === scopePath || url.pathname === scopePath + 'index.html';

  if (acceptsHtml && !isAppNavigation) {{
    // Páginas independentes (menu, diagnóstico, recuperação etc.) nunca
    // podem receber index.html como fallback do aplicativo.
    return;
  }}

  if (acceptsHtml) {{
    event.respondWith(
      fetch(request, {{ cache: 'no-store' }})
        .then((response) => {{
          if (response && response.ok) {{
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          }}
          return response;
        }})
        .catch(() => caches.match('./index.html'))
    );
    return;
  }}

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {{
      if (response && response.ok) {{
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }}
      return response;
    }}))
  );
}});
'''


def cleanup_script(root_relative: str) -> str:
    return f'''<script data-finance-menu-route-guard>
(async () => {{
  try {{
    if ('serviceWorker' in navigator) {{
      const regs = await navigator.serviceWorker.getRegistrations();
      const rootScope = new URL({root_relative!r}, location.href).href;
      await Promise.allSettled(regs.filter((reg) => reg.scope === rootScope).map((reg) => reg.unregister()));
    }}
    if ('caches' in window) {{
      const keys = await caches.keys();
      await Promise.allSettled(keys.filter((key) =>
        key.startsWith('meu-dinheiro-inteligente-v') ||
        key.startsWith('meu-dinheiro-oficial-')
      ).map((key) => caches.delete(key)));
    }}
  }} catch (_) {{}}
}})();
</script>'''


def patch_menu(path: Path, root_relative: str) -> None:
    text = path.read_text(encoding='utf-8')
    if 'data-finance-menu-page' not in text:
        text = text.replace('<head>', '<head>\n<meta name="finance-tools-page" content="menu" data-finance-menu-page>\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">', 1)
    if 'data-finance-menu-route-guard' not in text:
        text = text.replace('</body>', cleanup_script(root_relative) + '\n</body>', 1)
    path.write_text(text, encoding='utf-8')


def central_html() -> str:
    return '''<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#f6f7f4"><meta name="finance-tools-page" content="central-clean-entry">
<title>Menu · Meu Dinheiro</title>
<style>html,body{margin:0;min-height:100%;background:#f6f7f4;color:#0b4a34;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}body{min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box}main{text-align:center;width:min(100%,360px)}.icon{width:66px;height:66px;margin:0 auto 16px;border-radius:20px;background:rgba(255,255,255,.85);display:grid;place-items:center;box-shadow:0 8px 30px rgba(11,74,52,.10);font-size:31px}h1{font-size:25px;margin:0 0 7px}p{font-size:13px;line-height:1.45;color:#707873}.bar{height:5px;background:#e0e7e2;border-radius:999px;overflow:hidden;margin:19px 44px}.bar span{display:block;width:32%;height:100%;background:#32c778;border-radius:inherit;animation:m .8s ease-in-out infinite alternate}@keyframes m{to{transform:translateX(210%)}}</style>
</head><body><main><div class="icon">▦</div><h1>Abrindo Menu Principal</h1><p id="status">Removendo somente um controlador antigo da interface. Seus dados financeiros não serão alterados.</p><div class="bar"><span></span></div></main>
<script>
(async()=>{
  const status=document.getElementById('status');
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      const rootScope=new URL('./',location.href).href;
      await Promise.allSettled(regs.filter(r=>r.scope===rootScope).map(r=>r.unregister()));
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.allSettled(keys.filter(k=>k.startsWith('meu-dinheiro-inteligente-v')||k.startsWith('meu-dinheiro-oficial-')).map(k=>caches.delete(k)));
    }
  }catch(_){}
  status.textContent='Abrindo todos os links…';
  location.replace('./menu.html?menu='+Date.now());
})();
</script></body></html>'''


if not ROOT.exists():
    raise SystemExit('_site ainda não foi gerado')

(ROOT / 'sw.js').write_text(service_worker(OFFICIAL_CACHE), encoding='utf-8')
(ROOT / 'beta' / 'sw.js').write_text(service_worker(BETA_CACHE), encoding='utf-8')

patch_menu(ROOT / 'menu.html', './')
patch_menu(ROOT / 'menu' / 'index.html', '../')
(ROOT / 'central.html').write_text(central_html(), encoding='utf-8')

# Também marca páginas auxiliares como independentes e sem cache HTML.
for path in [
    ROOT/'diagnostico/index.html', ROOT/'launch.html', ROOT/'recover.html', ROOT/'safe.html',
    ROOT/'beta/launch.html', ROOT/'beta/recover.html', ROOT/'beta/safe.html'
]:
    if not path.exists():
        continue
    text = path.read_text(encoding='utf-8')
    if 'finance-tools-page' not in text:
        text = text.replace('<head>', '<head>\n<meta name="finance-tools-page" content="independent-tool">\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">', 1)
    path.write_text(text, encoding='utf-8')

print('[OK] Route guard aplicado: páginas de ferramentas não usam fallback do app.')
print('[OK] central.html criado para remover Service Worker antigo sem tocar nos dados.')
