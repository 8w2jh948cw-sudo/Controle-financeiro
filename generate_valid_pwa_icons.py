from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path('_site')
SIZE = 512


def font(size: int):
    for candidate in (
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    ):
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            pass
    return ImageFont.load_default()


def soft_background():
    img = Image.new('RGBA', (SIZE, SIZE), (249, 251, 250, 255))
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            # Fundo claro contínuo, sem moldura branca externa.
            left = 1 - x / (SIZE - 1)
            right = x / (SIZE - 1)
            bottom = y / (SIZE - 1)
            r = int(249 + 3 * right)
            g = int(250 + 3 * left)
            b = int(250 + 3 * right + 1 * bottom)
            px[x, y] = (min(r,255), min(g,255), min(b,255), 255)
    return img


def arrow_layer(up: bool, color, glow_color):
    layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if up:
        # seta verde equilibrada
        d.rounded_rectangle((194, 162, 254, 386), radius=30, fill=color)
        d.polygon([(224, 105), (158, 184), (190, 184), (190, 202), (258, 202), (258, 184), (290, 184)], fill=color)
    else:
        # seta vermelha equilibrada
        d.rounded_rectangle((310, 140, 370, 364), radius=30, fill=color)
        d.polygon([(340, 421), (274, 342), (306, 342), (306, 324), (374, 324), (374, 342), (406, 342)], fill=color)

    glow = layer.copy().filter(ImageFilter.GaussianBlur(16))
    # reduz opacidade do brilho mantendo somente halo local das setas
    alpha = glow.getchannel('A').point(lambda a: int(a * 0.28))
    glow.putalpha(alpha)
    tinted = Image.new('RGBA', (SIZE, SIZE), glow_color)
    tinted.putalpha(alpha)
    return tinted, layer


def make_icon(beta: bool) -> Image.Image:
    base = soft_background()
    draw = ImageDraw.Draw(base)

    # Faixa lateral sutil inspirada no ícone escolhido, sem contorno externo.
    draw.rectangle((0, 0, 105, SIZE), fill=(242, 246, 247, 185))

    # Três marcadores laterais neutros.
    for y in (130, 256, 382):
        draw.rounded_rectangle((38, y - 18, 115, y + 18), radius=18, fill=(223, 229, 231, 220))

    green = (43, 198, 116, 235)
    red = (255, 88, 98, 235)
    gglow, garrow = arrow_layer(True, green, (48, 203, 120, 255))
    rglow, rarrow = arrow_layer(False, red, (255, 86, 99, 255))
    base.alpha_composite(gglow)
    base.alpha_composite(rglow)
    base.alpha_composite(garrow)
    base.alpha_composite(rarrow)

    # Somente a Beta recebe o selo. Sem sombra, borda ou reflexo adicional.
    if beta:
        draw = ImageDraw.Draw(base)
        badge = (340, 438, 501, 502)
        draw.rounded_rectangle(badge, radius=27, fill=(52, 120, 246, 255))
        f = font(30)
        text = 'BETA'
        bb = draw.textbbox((0, 0), text, font=f)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        cx = (badge[0] + badge[2]) / 2
        cy = (badge[1] + badge[3]) / 2
        draw.text((cx - tw / 2, cy - th / 2 - 2), text, font=f, fill=(255, 255, 255, 255))

    return base


def write(target: Path, beta: bool):
    target.mkdir(parents=True, exist_ok=True)
    make_icon(beta).save(target / 'apple-touch-icon.png', format='PNG', optimize=True)


if not ROOT.exists():
    raise SystemExit('_site ainda não foi gerado')

write(ROOT, beta=False)
write(ROOT / 'beta', beta=True)
print('[OK] Ícones corrigidos: sem moldura branca externa e sem reflexo curvo; Beta apenas com selo.')
