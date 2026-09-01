/* Meu Dinheiro — ferramentas exclusivas do ambiente Beta */
(() => {
  'use strict';

  const BETA_RELEASE = '__BETA_RELEASE__';
  const PROD_DB = 'meu-dinheiro-inteligente';
  const BETA_DB = 'meu-dinheiro-inteligente-beta';
  const PROD_FALLBACK = 'meu-dinheiro-inteligente-state';
  const BETA_FALLBACK = 'meu-dinheiro-inteligente-beta-state';
  const STORE = 'app';
  const STATE_KEY = 'current-state';

  function requestPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha no armazenamento'));
    });
  }

  function openExistingDatabase(name) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      let created = false;
      request.onupgradeneeded = () => {
        created = true;
        try { request.transaction?.abort(); } catch (_) {}
      };
      request.onsuccess = () => {
        if (created) {
          try { request.result.close(); } catch (_) {}
          reject(new Error('Banco Oficial ainda não existe'));
          return;
        }
        resolve(request.result);
      };
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o banco Oficial'));
      request.onblocked = () => reject(new Error('Banco Oficial ocupado'));
    });
  }

  function openBetaDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BETA_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o banco Beta'));
    });
  }

  async function readOfficialState() {
    try {
      const db = await openExistingDatabase(PROD_DB);
      try {
        if (db.objectStoreNames.contains(STORE)) {
          const state = await requestPromise(db.transaction(STORE, 'readonly').objectStore(STORE).get(STATE_KEY));
          if (state) return state;
        }
      } finally {
        db.close();
      }
    } catch (_) {}

    try {
      const raw = localStorage.getItem(PROD_FALLBACK);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  async function writeBetaState(state) {
    const db = await openBetaDatabase();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(state, STATE_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('Falha ao gravar na Beta'));
        tx.onabort = () => reject(tx.error || new Error('Gravação da Beta cancelada'));
      });
    } finally {
      db.close();
    }
    try { localStorage.setItem(BETA_FALLBACK, JSON.stringify(state)); } catch (_) {}
  }

  async function copyOfficialToBeta() {
    const state = await readOfficialState();
    if (!state) throw new Error('Nenhum dado salvo foi encontrado no app Oficial neste navegador.');
    await writeBetaState(state);
    try { localStorage.setItem('meu-dinheiro-beta-copied-at', new Date().toISOString()); } catch (_) {}
    return {
      transactions: Array.isArray(state.transactions) ? state.transactions.length : 0,
      accounts: Array.isArray(state.accounts) ? state.accounts.length : 0,
      categories: Array.isArray(state.categories) ? state.categories.length : 0,
    };
  }

  async function clearBetaOnly() {
    try { localStorage.removeItem(BETA_FALLBACK); } catch (_) {}
    try { localStorage.removeItem('meu-dinheiro-beta-copied-at'); } catch (_) {}
    try {
      const db = await openBetaDatabase();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(STATE_KEY);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('Falha ao limpar a Beta'));
      });
      db.close();
    } catch (_) {}
  }

  function installStyle() {
    if (document.getElementById('mdBetaStyle')) return;
    const style = document.createElement('style');
    style.id = 'mdBetaStyle';
    style.textContent = `
      #mdBetaBadge{position:fixed;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147483000;border:0;border-radius:999px;padding:6px 11px;background:#ff9500;color:#fff;font:800 10px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;letter-spacing:.09em;box-shadow:0 4px 16px rgba(0,0,0,.16)}
      #mdBetaSheetBackdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.28);display:none;align-items:flex-end;justify-content:center;padding:14px;box-sizing:border-box}
      #mdBetaSheetBackdrop.open{display:flex}
      #mdBetaSheet{width:min(100%,430px);border-radius:24px;background:#f6f7f4;color:#111;padding:18px;box-sizing:border-box;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif}
      #mdBetaSheet h2{font-size:20px;margin:0 0 5px}#mdBetaSheet p{font-size:13px;line-height:1.45;color:#676d69;margin:0 0 15px}
      .md-beta-safe{padding:11px 12px;border-radius:14px;background:rgba(255,149,0,.10);border:1px solid rgba(255,149,0,.24);font-size:12px;line-height:1.4;margin-bottom:14px}
      .md-beta-actions{display:grid;gap:8px}.md-beta-actions button{appearance:none;border:0;border-radius:14px;padding:12px;font:700 13px/1.1 inherit;background:#0b4a34;color:#fff}.md-beta-actions button.secondary{background:#e8ebe8;color:#1d241f}.md-beta-actions button.close{background:transparent;color:#676d69;padding:8px}
      @media(prefers-color-scheme:dark){#mdBetaSheet{background:#171917;color:#f6f7f4}#mdBetaSheet p{color:#a6aaa7}.md-beta-safe{background:rgba(255,159,10,.13)}.md-beta-actions button.secondary{background:#2a2d2a;color:#f1f3f1}}
    `;
    document.head.appendChild(style);
  }

  function installUi() {
    installStyle();
    if (document.getElementById('mdBetaBadge')) return;

    const badge = document.createElement('button');
    badge.id = 'mdBetaBadge';
    badge.type = 'button';
    badge.textContent = 'BETA';
    badge.setAttribute('aria-label', 'Abrir informações da versão Beta');

    const backdrop = document.createElement('div');
    backdrop.id = 'mdBetaSheetBackdrop';
    backdrop.innerHTML = `
      <section id="mdBetaSheet" role="dialog" aria-modal="true" aria-label="Ambiente Beta">
        <h2>Meu Dinheiro · Beta</h2>
        <p>Versão ${BETA_RELEASE} para testar mudanças antes de levá-las ao app Oficial.</p>
        <div class="md-beta-safe"><strong>Dados isolados.</strong> Registrar, editar ou apagar algo aqui não altera seus lançamentos do app Oficial. A cópia permitida é somente <strong>Oficial → Beta</strong>.</div>
        <div class="md-beta-actions">
          <button type="button" id="mdBetaCopy">Copiar dados do Oficial</button>
          <button type="button" class="secondary" id="mdBetaClear">Limpar somente a Beta</button>
          <button type="button" class="close" id="mdBetaClose">Fechar</button>
        </div>
      </section>`;

    document.body.append(badge, backdrop);
    badge.onclick = () => backdrop.classList.add('open');
    document.getElementById('mdBetaClose').onclick = () => backdrop.classList.remove('open');
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) backdrop.classList.remove('open'); });

    document.getElementById('mdBetaCopy').onclick = async (event) => {
      if (!confirm('Substituir os dados atuais da Beta por uma cópia do app Oficial? O app Oficial NÃO será alterado.')) return;
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Copiando…';
      try {
        const result = await copyOfficialToBeta();
        alert(`Cópia concluída: ${result.transactions} movimentações, ${result.accounts} contas e ${result.categories} categorias. O app Oficial permaneceu intacto.`);
        location.reload();
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Copiar dados do Oficial';
        alert(error?.message || 'Não foi possível copiar os dados. Nenhum dado do Oficial foi alterado.');
      }
    };

    document.getElementById('mdBetaClear').onclick = async (event) => {
      if (!confirm('Apagar somente os dados da Beta? Seus dados do app Oficial permanecerão intactos.')) return;
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Limpando…';
      await clearBetaOnly();
      location.reload();
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installUi, { once: true });
  else installUi();
})();
