import os
from PIL import Image
import numpy as np

# Ensure target directories exist
os.makedirs(r"d:\Employee Management System\public\images", exist_ok=True)
os.makedirs(r"d:\Employee Management System\public\icons", exist_ok=True)
os.makedirs(r"d:\Employee Management System\app", exist_ok=True)

# 1. Favicon SVG (Vector X Emblem)
# Uses the exact colors from the brand logo:
# Deep Navy Blue: #252175
# Vibrant Orange: #F37021
# Pure White Star Spark: #FFFFFF
favicon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336 336" width="100%" height="100%">
  <defs>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>
  <g id="selorax-x-emblem" filter="url(#glow)">
    <!-- Blue top-left wing -->
    <path d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z" fill="#252175" />
    <!-- Orange X body and legs -->
    <path d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z" fill="#F37021" />
    <!-- 4-pointed Star Sparkle at intersection -->
    <path d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z" fill="#FFFFFF" />
  </g>
</svg>'''

with open(r"d:\Employee Management System\public\favicon.svg", "w", encoding="utf-8") as f:
    f.write(favicon_svg)
print("public/favicon.svg created")

# 2. Master Full Logo SVG (Light mode)
logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" width="100%" height="100%">
  <!-- Selora Wordmark in Deep Navy Blue -->
  <text x="10" y="88" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="94" letter-spacing="-3" fill="#252175">Selora</text>
  <!-- Iconic X Emblem -->
  <g transform="translate(315, 6) scale(0.36)">
    <!-- Blue top-left wing -->
    <path d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z" fill="#252175" />
    <!-- Orange body -->
    <path d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z" fill="#F37021" />
    <!-- Star Spark -->
    <path d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z" fill="#FFFFFF" />
  </g>
</svg>'''

with open(r"d:\Employee Management System\public\images\logo.svg", "w", encoding="utf-8") as f:
    f.write(logo_svg)
print("public/images/logo.svg created")

# 3. Master Full Logo SVG (Dark mode)
logo_white_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" width="100%" height="100%">
  <!-- Selora Wordmark in Crisp White -->
  <text x="10" y="88" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="94" letter-spacing="-3" fill="#FFFFFF">Selora</text>
  <!-- Iconic X Emblem -->
  <g transform="translate(315, 6) scale(0.36)">
    <!-- Light Royal Blue top-left wing for dark backgrounds -->
    <path d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z" fill="#818cf8" />
    <!-- Orange body -->
    <path d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z" fill="#F37021" />
    <!-- Star Spark -->
    <path d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z" fill="#FFFFFF" />
  </g>
</svg>'''

with open(r"d:\Employee Management System\public\images\logo-white.svg", "w", encoding="utf-8") as f:
    f.write(logo_white_svg)
print("public/images/logo-white.svg created")
