from pathlib import Path

beta_index = Path('_site/beta/index.html')
if not beta_index.exists():
    raise SystemExit('Beta index ausente')

text = beta_index.read_text(encoding='utf-8')
text = text.replace('href="./menu.html">Menu principal</a>', 'href="../menu.html">Menu principal</a>')
beta_index.write_text(text, encoding='utf-8')

if 'href="../menu.html">Menu principal</a>' not in text:
    raise SystemExit('Link do Menu Principal na tela de contingência da Beta não foi corrigido')

print('[OK] Links relativos finais da Beta corrigidos.')
