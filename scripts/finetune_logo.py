import os
from PIL import Image, ImageDraw, ImageFont
import subprocess

# Let's check text width of 'Selora' at font-size 96 using PIL
# We can use Arial-Bold or Segoe UI Bold or Inter
font_paths = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\calibrib.ttf",
]
font_path = None
for p in font_paths:
    if os.path.exists(p):
        font_path = p
        break

print("Using font:", font_path)
font = ImageFont.truetype(font_path, 92) if font_path else ImageFont.load_default()
bbox = font.getbbox("Selora")
print("Selora text bbox at 92px:", bbox)
selora_width = bbox[2] - bbox[0]
selora_height = bbox[3] - bbox[1]
print(f"Selora width: {selora_width}, height: {selora_height}")

# Target dimensions:
# 'S' starts at x=15, baseline at y=90.
# Top of 'S' is around y=20. Height = 70px.
# We want X to span from y=20 to y=90 (height = 70px).
# Original X traced has height = 285 - 68 = 217px.
# Scale factor for X: 70 / 217 = 0.3225.
# X start: right after 'Selora', with a small overlap/tight gap of -4px.
x_offset = 15 + selora_width - 8
y_offset = 20 - (68 * (70 / 217))
scale = 70 / 217
print(f"X placement: x={x_offset:.1f}, y={y_offset:.1f}, scale={scale:.4f}")

# Master SVG Light
logo_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(x_offset + 215*scale + 25)} 110" width="100%" height="100%">
  <!-- Wordmark Selora -->
  <text x="15" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="92" letter-spacing="-2" fill="#252175">Selora</text>
  <!-- Stylized X Mark matching cap height -->
  <g transform="translate({x_offset:.1f}, {y_offset:.1f}) scale({scale:.4f})">
    <!-- Blue wing -->
    <path d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z" fill="#252175" />
    <!-- Orange body -->
    <path d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z" fill="#F37021" />
    <!-- Center Star -->
    <path d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z" fill="#FFFFFF" />
  </g>
</svg>'''

total_w = int(x_offset + 215*scale + 25)

# Master SVG Dark
logo_white_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} 110" width="100%" height="100%">
  <!-- Wordmark Selora in White -->
  <text x="15" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="92" letter-spacing="-2" fill="#FFFFFF">Selora</text>
  <!-- Stylized X Mark -->
  <g transform="translate({x_offset:.1f}, {y_offset:.1f}) scale({scale:.4f})">
    <!-- Blue wing (vibrant royal blue on dark) -->
    <path d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z" fill="#818cf8" />
    <!-- Orange body -->
    <path d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z" fill="#F37021" />
    <!-- Center Star -->
    <path d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z" fill="#FFFFFF" />
  </g>
</svg>'''

with open(r"d:\Employee Management System\public\images\logo.svg", "w", encoding="utf-8") as f:
    f.write(logo_svg)

with open(r"d:\Employee Management System\public\images\logo-white.svg", "w", encoding="utf-8") as f:
    f.write(logo_white_svg)

print("SVGs rewritten with precise kerning and cap height alignment!")
