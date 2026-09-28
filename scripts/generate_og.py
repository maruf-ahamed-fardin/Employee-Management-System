from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Create 1200x630 OG image
w, h = 1200, 630
og = Image.new('RGBA', (w, h), (8, 12, 22, 255))
draw = ImageDraw.Draw(og)

# Add subtle dark-mode radial gradients (Deep Royal Indigo in top-left, Orange glow in bottom-right)
# Render using numpy for smooth gradients
x = np.linspace(-1, 1, w)
y = np.linspace(-1, 1, h)
xx, yy = np.meshgrid(x, y)

# Indigo glow top-left (center at -0.6, -0.6)
dist_indigo = np.sqrt((xx + 0.6)**2 + (yy + 0.6)**2)
glow_indigo = np.clip(1.0 - dist_indigo / 1.1, 0, 1)

# Orange glow bottom-right (center at 0.7, 0.7)
dist_orange = np.sqrt((xx - 0.7)**2 + (yy - 0.7)**2)
glow_orange = np.clip(1.0 - dist_orange / 0.9, 0, 1)

base_arr = np.zeros((h, w, 4), dtype=np.float32)
base_arr[:, :, 0] = 8 + glow_indigo * 25 + glow_orange * 180
base_arr[:, :, 1] = 12 + glow_indigo * 22 + glow_orange * 70
base_arr[:, :, 2] = 22 + glow_indigo * 90 + glow_orange * 15
base_arr[:, :, 3] = 255

base_img = Image.fromarray(np.clip(base_arr, 0, 255).astype(np.uint8))

# Paste Logo (White variant for dark background)
logo_dark = Image.open(r"d:\Employee Management System\public\images\logo-dark.png").convert('RGBA')
# Resize logo for OG card
lw, lh = logo_dark.size
target_lh = 110
target_lw = int(lw * (target_lh / lh))
logo_resized = logo_dark.resize((target_lw, target_lh), Image.LANCZOS)

# Paste centered at x=100, y=190
base_img.paste(logo_resized, (100, 190), logo_resized)

# Draw typography
draw_final = ImageDraw.Draw(base_img)
font_paths = [r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\segoeuib.ttf"]
font_bold = None
font_sub = None
for p in font_paths:
    try:
        font_bold = ImageFont.truetype(p, 42)
        font_sub = ImageFont.truetype(p, 24)
        break
    except:
        pass

if font_bold and font_sub:
    draw_final.text((105, 330), "Enterprise Workforce & Human Capital Suite", fill=(248, 250, 252), font=font_bold)
    draw_final.text((105, 395), "Staff Directory • Attendance Tracking • Leave Management • Payroll • Smart NFC Cards", fill=(148, 163, 184), font=font_sub)

# Draw decorative brand tag
draw_final.rounded_rectangle([100, 100, 265, 140], radius=10, fill=(243, 112, 33, 40), outline=(243, 112, 33, 160), width=1)
if font_sub:
    font_tag = ImageFont.truetype(font_paths[0], 15)
    draw_final.text((118, 112), "SELORAX ENTERPRISE", fill=(251, 146, 60), font=font_tag)

base_img.save(r"d:\Employee Management System\public\images\og.png")
print("OG image generated successfully!")
