from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path('_site')


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


def gradient(size: int):
    img = Image.new('RGBA', (size, size), (248, 251, 249, 255))
    px = img.load()
    for y in range(size):
        for x in range(size):
            left = 1 - x / max(1, size - 1)
            right = x / max(1, size - 1)
            top = 1 - y / max(1, size - 1)
            r = int(246 + 4 * top + 1 * right)
            g = int(248 + 5 * left + 2 * top)
            b = int(247 + 4 * right + 2 * top)
            px[x, y] = (min(r,255), min(g,255), min(b,255), 255)
    return img


def make_icon(beta: bool) -> Image.Image:
    size = 512
    base = gradient(size)

    # Sombra suave da placa principal.
    shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((43, 50, 469, 476), radius=105, fill=(23, 62, 48, 38))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(shadow)

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((38, 38, 474, 474), radius=108, fill=(255, 255, 255, 235), outline=(221, 230, 225, 255), width=3)

    # Reflexo/glassmorphism discreto.
    glass = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glass)
    gd.ellipse((-40, -180, 520, 260), fill=(255, 255, 255, 92))
    glass = glass.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(glass)
    draw = ImageDraw.Draw(base)

    green = (47, 190, 112, 255)
    green_dark = (23, 143, 83, 255)
    red = (255, 104, 114, 255)
    red_dark = (224, 72, 87, 255)
    blue = (52, 120, 246, 255)
    divider = (218, 226, 221, 255)

    # Separador central.
    draw.rounded_rectangle((253, 116, 259, 360), radius=3, fill=divider)

    # Barras de entrada (verde) e saída (vermelho), equilibradas.
    for box, color in (
        ((105, 247, 151, 345), green),
        ((163, 195, 209, 345), green_dark),
        ((303, 195, 349, 345), red_dark),
        ((361, 247, 407, 345), red),
    ):
        draw.rounded_rectangle(box, radius=20, fill=color)

    # Setas com o mesmo peso visual para positivo e negativo.
    draw.line((128, 194, 128, 137), fill=green_dark, width=18)
    draw.polygon([(128, 112), (96, 151), (160, 151)], fill=green_dark)
    draw.line((384, 138, 384, 195), fill=red_dark, width=18)
    draw.polygon([(384, 220), (352, 181), (416, 181)], fill=red_dark)

    # Medalhão central neutro para unir os dois lados.
    coin_shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(coin_shadow)
    cd.ellipse((185, 302, 327, 444), fill=(22, 65, 49, 38))
    coin_shadow = coin_shadow.filter(ImageFilter.GaussianBlur(13))
    base.alpha_composite(coin_shadow)
    draw = ImageDraw.Draw(base)
    draw.ellipse((181, 294, 331, 444), fill=(255, 255, 255, 245), outline=(218, 228, 222, 255), width=3)

    # Símbolo financeiro simples e legível em tamanhos pequenos.
    f = font(62)
    label = '$'
    bbox = draw.textbbox((0, 0), label, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((256 - tw / 2, 369 - th / 2 - 5), label, font=f, fill=green_dark)

    # Selo da Beta; a versão Oficial fica sem selo.
    if beta:
        badge_shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        bd = ImageDraw.Draw(badge_shadow)
        bd.rounded_rectangle((319, 392, 469, 459), radius=28, fill=(30, 65, 150, 70))
        badge_shadow = badge_shadow.filter(ImageFilter.GaussianBlur(10))
        base.alpha_composite(badge_shadow)
        draw = ImageDraw.Draw(base)
        draw.rounded_rectangle((313, 384, 467, 451), radius=28, fill=blue)
        bf = font(31)
        text = 'BETA'
        bb = draw.textbbox((0, 0), text, font=bf)
        bw, bh = bb[2] - bb[0], bb[3] - bb[1]
        draw.text((390 - bw / 2, 418 - bh / 2 - 2), text, font=bf, fill=(255, 255, 255, 255))

    return base.convert('RGBA')


def write(target: Path, beta: bool):
    target.mkdir(parents=True, exist_ok=True)
    image = make_icon(beta)
    image.save(target / 'apple-touch-icon.png', format='PNG', optimize=True)


if not ROOT.exists():
    raise SystemExit('_site ainda não foi gerado')

write(ROOT, beta=False)
write(ROOT / 'beta', beta=True)
print('[OK] Ícones PWA válidos gerados: Oficial e Beta visualmente distintos.')
