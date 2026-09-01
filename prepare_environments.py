from pathlib import Path
import json
import os
import re
import shutil

ROOT = Path(__file__).resolve().parent
STABLE = ROOT / "_stable"
SITE = ROOT / "_site"
STABLE_RELEASE = os.environ.get("STABLE_RELEASE", "1.0.0").strip()
BETA_LABEL = os.environ.get("BETA_LABEL", "1.1.0-beta.1").strip()

RUNTIME_FILES = [
    ".nojekyll",
    "index.html",
    "404.html",
    "manifest.webmanifest",
    "icon.svg",
    "apple-touch-icon.png",
    "sw.js",
]


def copy_runtime(source: Path, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    for name in RUNTIME_FILES:
        src = source / name
        if src.exists():
            shutil.copy2(src, target / name)
    assets = source / "assets"
    if not assets.exists():
        raise SystemExit(f"Assets ausentes em {source}")
    shutil.copytree(assets, target / "assets", dirs_exist_ok=True)


def service_worker(cache_name: str, beta: bool) -> str:
    exclude = "false" if beta else "url.pathname.includes('/Controle-financeiro/beta/') || url.pathname.includes('/Controle-financeiro/diagnostico/')"
    prefix = "meu-dinheiro-beta-" if beta else "meu-dinheiro-oficial-"
    old_match = "key.startsWith('meu-dinheiro-inteligente-beta-')" if beta else "key.startsWith('meu-dinheiro-inteligente-v')"
    return f'''const CACHE = {json.dumps(cache_name)};
const CACHE_PREFIX = {json.dumps(prefix)};
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./apple-touch-icon.png"];

self.addEventListener("install", (event) => {{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
}});

self.addEventListener("activate", (event) => {{
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => (key.startsWith(CACHE_PREFIX) || {old_match}) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
}});

self.addEventListener("fetch", (event) => {{
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  if ({exclude}) return;
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {{
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }}
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {{
      if (response && response.ok && url.origin === location.origin) {{
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }}
      return response;
    }})),
  );
}});
'''


def launcher_html(release: str, beta: bool) -> str:
    title = "Meu Dinheiro Beta" if beta else "Meu Dinheiro"
    scope_test = "scope.includes('/Controle-financeiro/beta/')" if beta else "scope.includes('/Controle-financeiro/') && !scope.includes('/Controle-financeiro/beta/')"
    cache_test = "key.startsWith('meu-dinheiro-beta-') || key.startsWith('meu-dinheiro-inteligente-beta-')" if beta else "key.startsWith('meu-dinheiro-oficial-') || key.startsWith('meu-dinheiro-inteligente-v')"
    accent = "#ff9500" if beta else "#0b4a34"
    beta_line = "<strong>BETA</strong> · dados isolados do Oficial" if beta else "Versão Oficial estável"
    return f'''<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#f6f7f4"><title>{title} · abertura segura</title>
<style>html,body{{margin:0;min-height:100%;background:#f6f7f4;color:#111;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}body{{min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box}}main{{width:min(100%,360px);text-align:center}}.mark{{width:54px;height:54px;margin:0 auto 15px;border-radius:17px;background:#fff;display:grid;place-items:center;box-shadow:0 8px 28px rgba(0,0,0,.07);font-size:24px}}h1{{font-size:23px;margin:0 0 7px}}p{{font-size:13px;color:#6e746f;line-height:1.45;margin:0}}.env{{margin-top:8px;font-size:11px;color:{accent}}}.bar{{height:5px;background:#dfe3df;border-radius:999px;overflow:hidden;margin:18px 38px}}.bar span{{display:block;width:35%;height:100%;background:{accent};border-radius:inherit;animation:move 1s ease-in-out infinite alternate}}@keyframes move{{to{{transform:translateX(185%)}}}}</style>
</head><body><main><div class="mark">$</div><h1>{title}</h1><p id="status">Preparando uma abertura limpa…</p><p class="env">{beta_line} · {release}</p><div class="bar"><span></span></div></main>
<script>
(async()=>{{
  const status=document.getElementById('status');
  try{{
    if('serviceWorker' in navigator){{
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(regs.filter(r=>{{const scope=String(r.scope||'');return {scope_test};}}).map(r=>r.unregister()));
    }}
    if('caches' in window){{
      const keys=await caches.keys();
      await Promise.allSettled(keys.filter(key=>{cache_test}).map(key=>caches.delete(key)));
    }}
  }}catch(_){{}}
  status.textContent='Abrindo a interface…';
  setTimeout(()=>location.replace(`./?release={release}&launch=${{Date.now()}}`),80);
}})();
</script></body></html>'''


def recover_html(release: str, beta: bool) -> str:
    title = "Recuperar Beta" if beta else "Recuperar app Oficial"
    scope_test = "scope.includes('/Controle-financeiro/beta/')" if beta else "scope.includes('/Controle-financeiro/') && !scope.includes('/Controle-financeiro/beta/')"
    cache_test = "key.startsWith('meu-dinheiro-beta-') || key.startsWith('meu-dinheiro-inteligente-beta-')" if beta else "key.startsWith('meu-dinheiro-oficial-') || key.startsWith('meu-dinheiro-inteligente-v')"
    warning = "Somente a Beta será afetada." if beta else "Seus lançamentos, contas e configurações não serão apagados."
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>{title}</title><style>html,body{{margin:0;min-height:100%;background:#f6f7f4;color:#111;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}main{{max-width:430px;margin:auto;padding:calc(34px + env(safe-area-inset-top)) 18px 40px}}.card{{background:#fff;border-radius:22px;padding:19px;box-shadow:0 4px 20px rgba(0,0,0,.05)}}h1{{font-size:25px;margin:0 0 8px}}p{{font-size:14px;line-height:1.5;color:#69706b}}button,a{{display:block;width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:13px;margin-top:10px;text-align:center;text-decoration:none;font:700 14px inherit}}button{{background:#0b4a34;color:#fff}}a{{background:#e9ece9;color:#253029}}</style></head><body><main><div class="card"><h1>{title}</h1><p>Esta ferramenta remove somente service workers e caches da interface. <strong>Não toca no IndexedDB nem no localStorage onde seus dados ficam salvos.</strong> {warning}</p><button id="recover">Limpar interface e reabrir</button><a href="./">Voltar sem limpar</a><p id="status"></p></div></main><script>
document.getElementById('recover').onclick=async()=>{{const status=document.getElementById('status');status.textContent='Limpando apenas a interface…';try{{if('serviceWorker' in navigator){{const regs=await navigator.serviceWorker.getRegistrations();await Promise.allSettled(regs.filter(r=>{{const scope=String(r.scope||'');return {scope_test};}}).map(r=>r.unregister()));}}if('caches' in window){{const keys=await caches.keys();await Promise.allSettled(keys.filter(key=>{cache_test}).map(key=>caches.delete(key)));}}status.textContent='Concluído. Seus dados pessoais foram preservados.';setTimeout(()=>location.replace('./launch.html?recover='+Date.now()),500);}}catch(e){{status.textContent='Não foi possível concluir a limpeza da interface.';}}}};
</script></body></html>'''


def safe_html(release: str, beta: bool) -> str:
    db_name = "meu-dinheiro-inteligente-beta" if beta else "meu-dinheiro-inteligente"
    fallback = "meu-dinheiro-inteligente-beta-state" if beta else "meu-dinheiro-inteligente-state"
    title = "Modo seguro · Beta" if beta else "Modo seguro · Oficial"
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>{title}</title><style>html,body{{margin:0;min-height:100%;background:#f6f7f4;color:#111;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}main{{max-width:430px;margin:auto;padding:calc(28px + env(safe-area-inset-top)) 18px 40px}}.card{{background:#fff;border-radius:18px;padding:16px;margin:10px 0;box-shadow:0 4px 18px rgba(0,0,0,.04)}}h1{{font-size:27px;margin:0 0 7px}}p{{font-size:13px;line-height:1.45;color:#69706b}}strong.big{{display:block;font-size:24px;margin-top:4px}}button,a{{display:block;width:100%;box-sizing:border-box;border:0;border-radius:13px;padding:12px;margin-top:9px;text-align:center;text-decoration:none;font:700 13px inherit}}button{{background:#0b4a34;color:#fff}}a{{background:#e9ece9;color:#253029}}pre{{white-space:pre-wrap;word-break:break-word;font-size:11px;max-height:160px;overflow:auto;background:#f1f3f1;padding:10px;border-radius:12px}}</style></head><body><main><h1>{title}</h1><p>Leitura independente do armazenamento local. Esta página não edita nem apaga seus dados.</p><div class="card"><span>Status</span><strong class="big" id="status">Lendo…</strong><p id="summary"></p></div><div class="card"><strong>Backup de emergência</strong><p>Gera uma cópia JSON do estado encontrado sem alterar o app.</p><button id="backup" disabled>Baixar backup</button><pre id="preview"></pre></div><a href="./">Voltar ao app</a></main><script>
const DB={json.dumps(db_name)}, FALLBACK={json.dumps(fallback)}, STORE='app', KEY='current-state';let STATE=null;
function openExisting(){{return new Promise((resolve,reject)=>{{const r=indexedDB.open(DB);let created=false;r.onupgradeneeded=()=>{{created=true;try{{r.transaction?.abort()}}catch(_){{}}}};r.onsuccess=()=>created?reject(new Error('Banco vazio')):resolve(r.result);r.onerror=()=>reject(r.error);}})}}
async function read(){{try{{const db=await openExisting();if(db.objectStoreNames.contains(STORE)){{STATE=await new Promise((resolve,reject)=>{{const q=db.transaction(STORE,'readonly').objectStore(STORE).get(KEY);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);}})}}db.close();}}catch(_){{}}if(!STATE){{try{{const raw=localStorage.getItem(FALLBACK);STATE=raw?JSON.parse(raw):null;}}catch(_){{}}}}const status=document.getElementById('status'),summary=document.getElementById('summary'),preview=document.getElementById('preview'),backup=document.getElementById('backup');if(!STATE){{status.textContent='Sem dados salvos';summary.textContent='Nenhum estado foi encontrado neste ambiente.';return;}}const t=Array.isArray(STATE.transactions)?STATE.transactions.length:0,a=Array.isArray(STATE.accounts)?STATE.accounts.length:0,c=Array.isArray(STATE.categories)?STATE.categories.length:0;status.textContent='Dados encontrados';summary.textContent=`${{t}} movimentações · ${{a}} contas · ${{c}} categorias · ambiente {release}`;preview.textContent=JSON.stringify(STATE,null,2).slice(0,9000);backup.disabled=false;backup.onclick=()=>{{const blob=new Blob([JSON.stringify({{environment:{json.dumps('beta' if beta else 'official')},release:{json.dumps(release)},exportedAt:new Date().toISOString(),state:STATE}},null,2)],{{type:'application/json'}});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meu-dinheiro-backup-{('beta' if beta else 'oficial')}-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}};}}
read();
</script></body></html>'''


if not STABLE.exists():
    raise SystemExit("Checkout da branch stable ausente")
if not (STABLE / "index.html").exists():
    raise SystemExit("Versão Oficial congelada inválida")
if not (ROOT / "index.html").exists():
    raise SystemExit("Build de desenvolvimento ausente")

if SITE.exists():
    shutil.rmtree(SITE)
SITE.mkdir(parents=True)

# OFICIAL — sempre vem da branch stable congelada.
copy_runtime(STABLE, SITE)
(SITE / "sw.js").write_text(service_worker(f"meu-dinheiro-oficial-{STABLE_RELEASE}", beta=False), encoding="utf-8")
official_index = (SITE / "index.html").read_text(encoding="utf-8")
if 'name="app-environment"' not in official_index:
    official_index = official_index.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="app-environment" content="official" />', 1)
(SITE / "index.html").write_text(official_index, encoding="utf-8")
(SITE / "launch.html").write_text(launcher_html(STABLE_RELEASE, beta=False), encoding="utf-8")
(SITE / "recover.html").write_text(recover_html(STABLE_RELEASE, beta=False), encoding="utf-8")
(SITE / "safe.html").write_text(safe_html(STABLE_RELEASE, beta=False), encoding="utf-8")
(SITE / "environment.json").write_text(json.dumps({
    "environment": "production",
    "release": STABLE_RELEASE,
    "branch": "stable",
    "database": "meu-dinheiro-inteligente",
    "fallback": "meu-dinheiro-inteligente-state",
    "stable": True,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# BETA — vem da main, mas banco/cache/PWA são próprios.
beta = SITE / "beta"
copy_runtime(ROOT, beta)
for js_path in (beta / "assets").glob("*.js"):
    text = js_path.read_text(encoding="utf-8")
    text = text.replace("meu-dinheiro-inteligente", "meu-dinheiro-inteligente-beta")
    js_path.write_text(text, encoding="utf-8")

(beta / "sw.js").write_text(service_worker(f"meu-dinheiro-beta-{BETA_LABEL}", beta=True), encoding="utf-8")
(beta / "launch.html").write_text(launcher_html(BETA_LABEL, beta=True), encoding="utf-8")
(beta / "recover.html").write_text(recover_html(BETA_LABEL, beta=True), encoding="utf-8")
(beta / "safe.html").write_text(safe_html(BETA_LABEL, beta=True), encoding="utf-8")

beta_tools = (ROOT / "beta-tools.js").read_text(encoding="utf-8").replace("__BETA_RELEASE__", BETA_LABEL)
(beta / "beta-tools.js").write_text(beta_tools, encoding="utf-8")

beta_index_path = beta / "index.html"
beta_index = beta_index_path.read_text(encoding="utf-8")
beta_index = beta_index.replace('<title>Meu Dinheiro Inteligente</title>', '<title>Meu Dinheiro Beta</title>')
beta_index = beta_index.replace('content="Meu Dinheiro"', 'content="Meu Dinheiro Beta"')
if 'name="robots"' not in beta_index:
    beta_index = beta_index.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex,nofollow" />\n    <meta name="app-environment" content="beta" />', 1)
if 'beta-tools.js' not in beta_index:
    beta_index = beta_index.replace('</body>', f'    <script src="./beta-tools.js?v={BETA_LABEL}" defer></script>\n  </body>', 1)
beta_index_path.write_text(beta_index, encoding="utf-8")

manifest_path = beta / "manifest.webmanifest"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["name"] = "Meu Dinheiro Beta"
manifest["short_name"] = "Dinheiro Beta"
manifest["id"] = "./"
manifest["scope"] = "./"
manifest["start_url"] = f"./launch.html?v={BETA_LABEL}"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

(beta / "environment.json").write_text(json.dumps({
    "environment": "beta",
    "release": BETA_LABEL,
    "branch": "main",
    "database": "meu-dinheiro-inteligente-beta",
    "fallback": "meu-dinheiro-inteligente-beta-state",
    "writes_to_production": False,
    "copy_direction": "production-to-beta-only",
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# CENTRAL DE DIAGNÓSTICO — independente do motor principal.
diag = SITE / "diagnostico"
diag.mkdir(exist_ok=True)
diag_html = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f6f7f4"><title>Diagnóstico · Meu Dinheiro</title><style>html,body{{margin:0;min-height:100%;background:#f6f7f4;color:#111;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}main{{max-width:430px;margin:auto;padding:calc(28px + env(safe-area-inset-top)) 18px 40px}}h1{{font-size:28px;margin:0 0 7px}}.lead{{margin:0 0 22px;color:#69706b;line-height:1.45;font-size:14px}}h2{{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:#8a918c;margin:22px 4px 8px}}.card{{display:block;text-decoration:none;color:inherit;background:#fff;border-radius:17px;padding:15px 16px;margin:9px 0;box-shadow:0 4px 18px rgba(0,0,0,.04)}}.card strong{{display:block;font-size:15px;margin-bottom:4px}}.card span{{display:block;color:#69706b;font-size:12px;line-height:1.4}}.tag{{display:inline-block!important;width:auto;margin-top:7px;padding:4px 7px;border-radius:999px;background:#e7f2eb;color:#0b4a34!important;font-weight:800;font-size:10px!important}}.beta .tag{{background:#fff1dc;color:#c66a00!important}}.warn .tag{{background:#fde9e5;color:#b43b23!important}}</style></head><body><main><h1>Diagnóstico</h1><p class="lead">Links independentes para abrir, verificar ou recuperar o Meu Dinheiro sem apagar seus registros financeiros.</p><h2>Oficial · {STABLE_RELEASE}</h2><a class="card" href="../"><strong>Abrir app Oficial</strong><span>Versão estável usada no dia a dia. Vem da branch stable congelada.</span><span class="tag">OFICIAL · ESTÁVEL</span></a><a class="card" href="../launch.html"><strong>Inicializador seguro</strong><span>Remove somente runtime/cache antigo antes de abrir a interface Oficial.</span></a><a class="card warn" href="../recover.html"><strong>Recuperar interface Oficial</strong><span>Limpa service worker e cache. Não apaga seus lançamentos, contas ou configurações.</span><span class="tag">PRESERVA DADOS</span></a><a class="card" href="../safe.html"><strong>Modo seguro Oficial</strong><span>Lê diretamente o armazenamento local e permite backup de emergência.</span></a><h2>Beta · {BETA_LABEL}</h2><a class="card beta" href="../beta/"><strong>Abrir Beta</strong><span>Ambiente para todas as próximas mudanças. Usa banco, fallback, cache e PWA separados do Oficial.</span><span class="tag">BETA · DADOS ISOLADOS</span></a><a class="card beta" href="../beta/launch.html"><strong>Inicializador da Beta</strong><span>Abre somente a Beta em modo limpo.</span></a><a class="card beta" href="../beta/recover.html"><strong>Recuperar Beta</strong><span>Limpa somente runtime/cache da Beta.</span><span class="tag">NÃO TOCA NO OFICIAL</span></a><a class="card beta" href="../beta/safe.html"><strong>Modo seguro da Beta</strong><span>Lê somente o banco de testes.</span></a></main></body></html>'''
(diag / "index.html").write_text(diag_html, encoding="utf-8")

(SITE / "ambientes.json").write_text(json.dumps({
    "official": {"path": "./", "release": STABLE_RELEASE, "branch": "stable", "database": "meu-dinheiro-inteligente"},
    "beta": {"path": "./beta/", "release": BETA_LABEL, "branch": "main", "database": "meu-dinheiro-inteligente-beta"},
    "diagnostic": {"path": "./diagnostico/"},
    "data_flow": "official-to-beta-only",
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

checks = {
    "oficial presente": (SITE / "index.html").exists(),
    "oficial veio da stable": (STABLE / "index.html").read_bytes() == (SITE / "index.html").read_bytes() or 'app-environment' in (SITE / "index.html").read_text(encoding="utf-8"),
    "beta presente": (beta / "index.html").exists(),
    "beta tem identificação": "beta-tools.js" in (beta / "index.html").read_text(encoding="utf-8"),
    "beta usa banco isolado": any("meu-dinheiro-inteligente-beta" in p.read_text(encoding="utf-8") for p in (beta / "assets").glob("*.js")),
    "beta não usa chave oficial exata": all('"meu-dinheiro-inteligente-state"' not in p.read_text(encoding="utf-8") for p in (beta / "assets").glob("*.js")),
    "diagnóstico presente": (diag / "index.html").exists(),
    "modo seguro oficial presente": (SITE / "safe.html").exists(),
    "modo seguro beta presente": (beta / "safe.html").exists(),
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FALHA'}] {name}")
if failed:
    raise SystemExit("Publicação bloqueada: " + ", ".join(failed))

print(f"Oficial congelado: {STABLE_RELEASE} / stable / meu-dinheiro-inteligente")
print(f"Beta isolada: {BETA_LABEL} / main / meu-dinheiro-inteligente-beta")
print("Fluxo permitido de dados: Oficial -> Beta. Nunca Beta -> Oficial.")
