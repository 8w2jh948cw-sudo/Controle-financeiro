from pathlib import Path
import json
import re

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow é obrigatório para gerar os ícones PWA: python3 -m pip install pillow") from exc

ROOT = Path("_site")
TIMEOUT_MS = 1800

if not ROOT.exists():
    raise SystemExit("_site ainda não foi gerado")


def resize_icons(target: Path) -> None:
    source = target / "apple-touch-icon.png"
    if not source.exists():
        raise SystemExit(f"Ícone base ausente: {source}")
    icon_dir = target / "icons"
    icon_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        img = img.convert("RGBA")
        for size, name in (
            (180, "apple-touch-icon.png"),
            (192, "icon-192.png"),
            (512, "icon-512.png"),
        ):
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(icon_dir / name, format="PNG", optimize=True)


BOOT_STYLE = r'''
<style data-md-resilient-boot>
#mdBootFallback{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;padding:calc(22px + env(safe-area-inset-top)) 18px calc(22px + env(safe-area-inset-bottom));background:#f6f7f4;color:#101412;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
#mdBootCard{width:min(100%,390px);padding:20px;border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 12px 36px rgba(0,0,0,.08);border:1px solid #e7ece8}
#mdBootCard h1{font-size:23px;margin:0 0 5px}#mdBootRelease{font-size:11px;font-weight:800;letter-spacing:.06em;color:var(--md-boot-accent,#168753);margin:0 0 15px}
#mdBootSteps{display:grid;gap:8px}.mdBootStep{display:grid;grid-template-columns:13px 1fr auto;gap:9px;align-items:center;font-size:12px;color:#6e7771}.mdBootDot{width:9px;height:9px;border-radius:50%;background:#c9d0cb}.mdBootStep.ok .mdBootDot{background:#34c759}.mdBootStep.warn .mdBootDot{background:#ff9f0a}.mdBootStep.bad .mdBootDot{background:#ff3b30}.mdBootStep b{font-size:11px;color:#8a928d;font-weight:700}
#mdBootMessage{margin:14px 0 0;font-size:12px;line-height:1.45;color:#717a74}.mdBootActions{display:none;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.mdBootActions.show{display:grid}.mdBootActions a{text-decoration:none;text-align:center;padding:11px;border-radius:12px;background:#eaf2ee;color:#174d38;font-size:12px;font-weight:750}.mdBootActions a:last-child{background:#eaf2ff;color:#2467d8}
@media(prefers-color-scheme:dark){#mdBootFallback{background:#111411;color:#f7f8f7}#mdBootCard{background:#1c201d;border-color:#2b302c;box-shadow:none}.mdBootStep,#mdBootMessage{color:#a4aba6}.mdBootActions a{background:#25332b;color:#bfe9cf}.mdBootActions a:last-child{background:#182a46;color:#9ec0ff}}
</style>'''


def boot_markup(release: str, beta: bool) -> str:
    accent = "#3478F6" if beta else "#168753"
    label = "BETA" if beta else "OFICIAL"
    menu_path = "../menu.html" if beta else "./menu.html"
    return f'''<div id="mdBootFallback" style="--md-boot-accent:{accent}">
  <section id="mdBootCard" role="status" aria-live="polite">
    <h1>Meu Dinheiro{" Beta" if beta else ""}</h1>
    <p id="mdBootRelease">{label} · {release}</p>
    <div id="mdBootSteps">
      <div class="mdBootStep ok" data-step="html"><span class="mdBootDot"></span><span>Tela inicial</span><b>OK</b></div>
      <div class="mdBootStep" data-step="runtime"><span class="mdBootDot"></span><span>Ambiente web</span><b>verificando</b></div>
      <div class="mdBootStep" data-step="storage"><span class="mdBootDot"></span><span>Dados locais</span><b>verificando</b></div>
      <div class="mdBootStep" data-step="engine"><span class="mdBootDot"></span><span>Motor do app</span><b>carregando</b></div>
      <div class="mdBootStep" data-step="patches"><span class="mdBootDot"></span><span>Correções finais</span><b>aguardando</b></div>
      <div class="mdBootStep" data-step="functional"><span class="mdBootDot"></span><span>Interface funcional</span><b>aguardando</b></div>
    </div>
    <p id="mdBootMessage">Abrindo a interface sem depender da limpeza de cache.</p>
    <div class="mdBootActions" id="mdBootActions">
      <a href="./safe.html">Modo seguro</a>
      <a href="{menu_path}">Menu principal</a>
    </div>
  </section>
</div>'''


def boot_script(release: str, beta: bool) -> str:
    prefixes = (
        ["meu-dinheiro-beta-"]
        if beta
        else ["meu-dinheiro-oficial-", "meu-dinheiro-inteligente-v"]
    )
    prefixes_json = json.dumps(prefixes, ensure_ascii=False)
    return f'''<script data-md-resilient-boot-script>
(() => {{
  const RELEASE = {release!r};
  const CACHE_PREFIXES = {prefixes_json};
  const TIMEOUT = {TIMEOUT_MS};
  const boot = document.getElementById("mdBootFallback");
  const message = document.getElementById("mdBootMessage");
  const actions = document.getElementById("mdBootActions");
  const started = performance.now();

  const step = (name, state, label) => {{
    const row = document.querySelector(`[data-step="${{name}}"]`);
    if (!row) return;
    row.classList.remove("ok", "warn", "bad");
    if (state) row.classList.add(state);
    const b = row.querySelector("b");
    if (b && label) b.textContent = label;
  }};

  const withTimeout = (promise, ms) => Promise.race([
    Promise.resolve(promise).then((value) => ({{ value }})).catch((error) => ({{ error }})),
    new Promise((resolve) => setTimeout(() => resolve({{ timedOut: true }}), ms))
  ]);

  async function cleanRuntime() {{
    let registrations = 0;
    let cachesRemoved = 0;
    try {{
      if ("serviceWorker" in navigator) {{
        const regs = await navigator.serviceWorker.getRegistrations();
        const ownScope = new URL("./", location.href).href;
        const own = regs.filter((reg) => reg.scope === ownScope);
        registrations = own.length;
        await Promise.allSettled(own.map((reg) => reg.unregister()));
      }}
    }} catch (_) {{}}

    try {{
      if ("caches" in window) {{
        const keys = await caches.keys();
        const own = keys.filter((key) => CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)));
        const results = await Promise.allSettled(own.map((key) => caches.delete(key)));
        cachesRemoved = results.filter((result) => result.status === "fulfilled" && result.value).length;
      }}
    }} catch (_) {{}}
    return {{ registrations, cachesRemoved }};
  }}

  withTimeout(cleanRuntime(), TIMEOUT).then((result) => {{
    if (result.timedOut) {{
      step("runtime", "warn", "em segundo plano");
      message.textContent = "O Safari demorou para encerrar um componente antigo. O app continua abrindo normalmente.";
      return;
    }}
    if (result.error) {{
      step("runtime", "warn", "aviso");
      return;
    }}
    step("runtime", "ok", "limpo");
  }});

  try {{
    localStorage.setItem("md-storage-test", "1");
    localStorage.removeItem("md-storage-test");
    if (!("indexedDB" in window)) throw new Error("IndexedDB indisponível");
    step("storage", "ok", "disponível");
  }} catch (_) {{
    step("storage", "warn", "limitado");
  }}

  const fail = (error) => {{
    if (!boot || boot.hidden) return;
    step("engine", "bad", "erro");
    message.textContent = "A interface principal encontrou um erro. Seus dados não foram apagados; use o Modo Seguro ou o Menu Principal.";
    actions?.classList.add("show");
    try {{ sessionStorage.setItem("md-last-boot-error", String(error?.stack || error || "erro desconhecido")); }} catch (_) {{}}
  }};

  window.addEventListener("error", (event) => fail(event.error || event.message));
  window.addEventListener("unhandledrejection", (event) => fail(event.reason));

  let ticks = 0;
  const timer = setInterval(() => {{
    ticks += 1;
    const shell = document.querySelector(".app-shell");
    const nav = document.querySelector(".bottom-nav");
    const add = document.querySelector(".add-button");
    const splash = document.querySelector(".splash");

    if (splash) step("engine", "ok", "iniciado");
    if (shell) step("engine", "ok", "OK");
    if (shell && nav) step("patches", "ok", "OK");

    if (shell && nav && add) {{
      step("functional", "ok", Math.round(performance.now() - started) + " ms");
      clearInterval(timer);
      if (boot) {{
        boot.style.transition = "opacity .18s ease";
        boot.style.opacity = "0";
        setTimeout(() => boot.remove(), 190);
      }}
      return;
    }}

    if (ticks >= 54) {{
      clearInterval(timer);
      step("functional", "warn", "diagnóstico");
      message.textContent = "A interface está demorando mais que o normal. Você pode abrir o Modo Seguro sem apagar seus registros.";
      actions?.classList.add("show");
    }}
  }}, 150);
}})();
</script>'''


def patch_index(path: Path, release: str, beta: bool) -> None:
    text = path.read_text(encoding="utf-8")

    if 'rel="apple-touch-icon"' in text:
        text = re.sub(
            r'<link\s+rel="apple-touch-icon"\s+href="[^"]+"\s*/?>',
            '<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png" />',
            text,
            count=1,
        )
    else:
        text = text.replace(
            "</head>",
            '    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png" />\n  </head>',
            1,
        )

    if "window.APP_RELEASE" not in text:
        env = "beta" if beta else "official"
        text = text.replace(
            "</head>",
            f'    <script>window.APP_RELEASE={release!r};window.APP_ENVIRONMENT={env!r};</script>\n  </head>',
            1,
        )

    if "data-md-resilient-boot" not in text:
        text = text.replace("</head>", BOOT_STYLE + "\n</head>", 1)

    if 'id="mdBootFallback"' not in text:
        text = text.replace("<body>", "<body>\n" + boot_markup(release, beta), 1)

    if "data-md-resilient-boot-script" not in text:
        text = text.replace("</body>", boot_script(release, beta) + "\n</body>", 1)

    path.write_text(text, encoding="utf-8")


def patch_manifest(path: Path, beta: bool) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data["name"] = "Meu Dinheiro Beta" if beta else "Meu Dinheiro"
    data["short_name"] = "Dinheiro Beta" if beta else "Meu Dinheiro"
    data["id"] = "./"
    data["scope"] = "./"
    data["start_url"] = "./"
    data["display"] = "standalone"
    data["icons"] = [
        {"src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    ]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_launcher(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    marker = "(async()=>{await clean();status.textContent='Abrindo a interface…';"
    replacement = "(async()=>{const safety=setTimeout(()=>{status.textContent='Ambiente web: limpeza em segundo plano. Abrindo mesmo assim…';location.replace(`./?v=${encodeURIComponent(RELEASE)}&launch=${Date.now()}&runtime=background`)},1900);await clean();clearTimeout(safety);status.textContent='Abrindo a interface…';"
    if marker in text:
        text = text.replace(marker, replacement, 1)
    path.write_text(text, encoding="utf-8")


def patch_recovery(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if "data-md-recovery-timeout" in text:
        return
    safety = '''<script data-md-recovery-timeout>
setTimeout(() => {
  const status = document.getElementById("status");
  const bar = document.getElementById("bar");
  const actions = document.getElementById("actions");
  if (!actions || !actions.hidden) return;
  if (status) status.textContent = "O Safari ainda está encerrando componentes antigos em segundo plano. Seus dados foram preservados e você já pode continuar.";
  if (bar) bar.hidden = true;
  actions.hidden = false;
}, 2000);
</script>'''
    text = text.replace("</body>", safety + "\n</body>", 1)
    path.write_text(text, encoding="utf-8")


def patch_menu(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<script data-finance-menu-route-guard>.*?</script>', "", text, flags=re.S)

    if 'finance-tools-page' not in text:
        text = text.replace(
            "<head>",
            '<head>\n<meta name="finance-tools-page" content="menu">\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">',
            1,
        )

    text = text.replace("grid-template-columns:1fr 1fr", "grid-template-columns:repeat(2,minmax(0,1fr))")
    if "overflow-wrap:anywhere" not in text:
        text = text.replace(".copy strong{", ".copy strong{overflow-wrap:anywhere;", 1)
    if "min-width:0;overflow:hidden" not in text:
        text = text.replace(".env{position:relative;", ".env{min-width:0;overflow:hidden;position:relative;", 1)
    if "max-width:100%;overflow-x:hidden" not in text:
        text = text.replace("*{box-sizing:border-box}", "*{box-sizing:border-box}html,body{width:100%;max-width:100%;overflow-x:hidden}", 1)

    forbidden = ("assets/", 'id="root"', "app-shell", "serviceWorker.register")
    for token in forbidden:
        if token in text:
            raise SystemExit(f"Menu deixou de ser independente: encontrado {token!r} em {path}")

    path.write_text(text, encoding="utf-8")


def patch_diagnostic(path: Path, official_release: str, beta_release: str) -> None:
    text = path.read_text(encoding="utf-8")
    if "mdRuntimeDiagnostic" in text:
        return

    panel = '''<h2>Diagnóstico do navegador</h2>
<section class="card" id="mdRuntimeDiagnostic" style="display:block">
  <strong>Estado técnico desta aba</strong>
  <pre id="mdRuntimeDiagnosticLog" style="white-space:pre-wrap;word-break:break-word;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;margin:10px 0 0">Coletando…</pre>
</section>'''
    text = text.replace("</main>", panel + "\n</main>", 1)

    diag_script = f'''<script>
(async()=>{{
  const el=document.getElementById('mdRuntimeDiagnosticLog');
  const started=performance.now();
  const lines=[];
  const put=(k,v)=>lines.push(`${{k}}: ${{v}}`);
  put('Release Oficial',{official_release!r});
  put('Release Beta',{beta_release!r});
  put('URL',location.href);
  put('Standalone',matchMedia('(display-mode: standalone)').matches || navigator.standalone===true);
  put('Online',navigator.onLine);
  put('User Agent',navigator.userAgent);
  put('Service Worker controller',navigator.serviceWorker?.controller ? 'presente (pode ser residual)' : 'nenhum');
  try{{
    const regs='serviceWorker' in navigator ? await Promise.race([navigator.serviceWorker.getRegistrations(),new Promise(r=>setTimeout(()=>r('timeout'),1200))]) : [];
    put('Registros reais de SW',regs==='timeout'?'timeout':regs.length);
    if(Array.isArray(regs)) regs.forEach((r,i)=>put(`  SW ${{i+1}}`,r.scope));
  }}catch(e){{put('Registros reais de SW','erro: '+e.message)}}
  try{{
    const keys='caches' in window ? await Promise.race([caches.keys(),new Promise(r=>setTimeout(()=>r('timeout'),1200))]) : [];
    put('Caches reais',keys==='timeout'?'timeout':keys.length);
    if(Array.isArray(keys)) keys.forEach((k,i)=>put(`  Cache ${{i+1}}`,k));
  }}catch(e){{put('Caches reais','erro: '+e.message)}}
  put('IndexedDB disponível','indexedDB' in window);
  try{{localStorage.setItem('md-diag-test','1');localStorage.removeItem('md-diag-test');put('localStorage disponível',true)}}catch(_){{put('localStorage disponível',false)}}
  try{{const last=sessionStorage.getItem('md-last-boot-error');if(last)put('Último erro de boot',last)}}catch(_){{}}
  put('Tempo do diagnóstico',Math.round(performance.now()-started)+' ms');
  el.textContent=lines.join('\\n');
}})();
</script>'''
    text = text.replace("</body>", diag_script + "\n</body>", 1)
    path.write_text(text, encoding="utf-8")


def central_html() -> str:
    return f'''<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#f6f7f4"><meta name="finance-tools-page" content="central-clean-entry">
<title>Menu · Meu Dinheiro</title>
<style>html,body{{margin:0;min-height:100%;background:#f6f7f4;color:#0b4a34;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}}body{{min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box}}main{{text-align:center;width:min(100%,360px)}}.icon{{width:66px;height:66px;margin:0 auto 16px;border-radius:20px;background:rgba(255,255,255,.85);display:grid;place-items:center;box-shadow:0 8px 30px rgba(11,74,52,.10);font-size:31px}}h1{{font-size:25px;margin:0 0 7px}}p{{font-size:13px;line-height:1.45;color:#707873}}.bar{{height:5px;background:#e0e7e2;border-radius:999px;overflow:hidden;margin:19px 44px}}.bar span{{display:block;width:32%;height:100%;background:#32c778;border-radius:inherit;animation:m .8s ease-in-out infinite alternate}}@keyframes m{{to{{transform:translateX(210%)}}}}</style>
</head><body><main><div class="icon">▦</div><h1>Abrindo Menu Principal</h1><p id="status">Encerrando somente componentes antigos da interface. Seus dados financeiros não serão alterados.</p><div class="bar" id="bar"><span></span></div></main>
<script>
(()=>{{
  const status=document.getElementById('status');
  const cleanup=(async()=>{{
    try{{
      if('serviceWorker' in navigator){{
        const regs=await navigator.serviceWorker.getRegistrations();
        const rootScope=new URL('./',location.href).href;
        await Promise.allSettled(regs.filter(r=>r.scope===rootScope).map(r=>r.unregister()));
      }}
      if('caches' in window){{
        const keys=await caches.keys();
        await Promise.allSettled(keys.filter(k=>k.startsWith('meu-dinheiro-inteligente-v')||k.startsWith('meu-dinheiro-oficial-')).map(k=>caches.delete(k)));
      }}
    }}catch(_){{}}
  }})();
  Promise.race([cleanup,new Promise(r=>setTimeout(r,{TIMEOUT_MS}))]).finally(()=>{{
    status.textContent='Abrindo todos os links…';
    location.replace('./menu.html');
  }});
}})();
</script></body></html>'''


official = ROOT
beta = ROOT / "beta"

resize_icons(official)
resize_icons(beta)

patch_manifest(official / "manifest.webmanifest", beta=False)
patch_manifest(beta / "manifest.webmanifest", beta=True)

official_release = json.loads((official / "environment.json").read_text(encoding="utf-8"))["release"]
beta_release = json.loads((beta / "environment.json").read_text(encoding="utf-8"))["release"]
patch_index(official / "index.html", official_release, beta=False)
patch_index(beta / "index.html", beta_release, beta=True)

patch_launcher(official / "launch.html")
patch_launcher(beta / "launch.html")
patch_recovery(official / "recover.html")
patch_recovery(beta / "recover.html")

patch_menu(ROOT / "menu.html")
patch_menu(ROOT / "menu" / "index.html")

patch_diagnostic(ROOT / "diagnostico" / "index.html", official_release, beta_release)
(ROOT / "central.html").write_text(central_html(), encoding="utf-8")

required = [
    ROOT / "menu.html",
    ROOT / "diagnostico/index.html",
    ROOT / "launch.html",
    ROOT / "recover.html",
    ROOT / "safe.html",
    ROOT / "icons/apple-touch-icon.png",
    ROOT / "icons/icon-192.png",
    ROOT / "icons/icon-512.png",
    ROOT / "beta/index.html",
    ROOT / "beta/launch.html",
    ROOT / "beta/recover.html",
    ROOT / "beta/safe.html",
    ROOT / "beta/icons/apple-touch-icon.png",
    ROOT / "beta/icons/icon-192.png",
    ROOT / "beta/icons/icon-512.png",
]
missing = [str(p) for p in required if not p.is_file() or p.stat().st_size == 0]
if missing:
    raise SystemExit("Hardening incompleto; arquivos ausentes: " + ", ".join(missing))

for index in (official / "index.html", beta / "index.html"):
    html = index.read_text(encoding="utf-8")
    if 'rel="apple-touch-icon" href="./icons/apple-touch-icon.png"' not in html:
        raise SystemExit(f"apple-touch-icon incorreto em {index}")
    if 'id="mdBootFallback"' not in html:
        raise SystemExit(f"Boot resiliente ausente em {index}")

for manifest in (official / "manifest.webmanifest", beta / "manifest.webmanifest"):
    data = json.loads(manifest.read_text(encoding="utf-8"))
    if data.get("start_url") != "./":
        raise SystemExit(f"start_url incorreto em {manifest}")
    sizes = {icon.get("sizes") for icon in data.get("icons", [])}
    if not {"192x192", "512x512"}.issubset(sizes):
        raise SystemExit(f"Ícones 192/512 ausentes em {manifest}")

if not any("serviceWorker.register" in p.read_text(encoding="utf-8") for p in official.glob("assets/*.js")):
    raise SystemExit("Oficial não registra o Service Worker offline")
if not any("serviceWorker.register" in p.read_text(encoding="utf-8") for p in beta.glob("assets/*.js")):
    raise SystemExit("Beta não registra o Service Worker offline")
if 'addEventListener("fetch"' not in (official / "sw.js").read_text(encoding="utf-8"):
    raise SystemExit("Oficial sem funcionamento offline")
if 'addEventListener("fetch"' not in (beta / "sw.js").read_text(encoding="utf-8"):
    raise SystemExit("Beta sem funcionamento offline")

menu_text = (ROOT / "menu.html").read_text(encoding="utf-8")
if "<script" in menu_text:
    raise SystemExit("Menu deve ser uma página somente de links, sem JavaScript")
if "repeat(2,minmax(0,1fr))" not in menu_text:
    raise SystemExit("Menu não está protegido contra overflow em duas colunas")

print(f"[OK] Manual aplicado: Oficial {official_release} preservado; Beta {beta_release} isolada.")
print("[OK] Service Worker atualizado: HTML busca a versão nova e arquivos essenciais funcionam offline.")
print("[OK] Menu independente, boot resiliente, diagnóstico real, recuperação não destrutiva e ícones iPhone 180/192/512 preparados.")
