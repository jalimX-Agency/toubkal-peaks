"""Generates the topographic contour texture used behind the home hero (frontend/public/textures/topo.svg).

Irregular rings around a summit, like contour lines on a hiking map: every fifth line is an index
contour (thicker). Rings never cross because each one is the previous radius plus a positive step.
Usage: python tools/topo_lines.py frontend/public/textures/topo.svg
"""

import math
import random
import sys

W, H = 1600, 1000
POINTS = 140
random.seed(4167)  # Toubkal's altitude, so the texture is reproducible


def harmonics(n=5):
    return [(j, random.uniform(0.02, 0.09) / j ** 0.6, random.uniform(0, 2 * math.pi)) for j in range(2, 2 + n)]


def rings(cx, cy, count, step, start, drift):
    base = harmonics()
    phase = base[0][2]
    radii = [start * (1 + sum(a * math.sin(j * (i / POINTS) * 2 * math.pi + p) for j, a, p in base)) for i in range(POINTS)]
    out = []
    for k in range(count):
        out.append([(cx + r * math.cos(i / POINTS * 2 * math.pi), cy + r * math.sin(i / POINTS * 2 * math.pi) * 0.82) for i, r in enumerate(radii)])
        # next ring: positive step everywhere, shape drifts slowly so lines bunch and spread like real slopes
        radii = [r + step * (0.55 + 0.9 * (0.5 + 0.5 * math.sin(i / POINTS * 2 * math.pi * 2 + k * drift + phase))) for i, r in enumerate(radii)]
    return out


def path(points):
    d = f"M{points[0][0]:.0f} {points[0][1]:.0f}" + "".join(f"L{x:.0f} {y:.0f}" for x, y in points[1:])
    return d + "Z"


def main(target):
    layers = rings(1180, 360, 34, 26, 18, 0.35) + rings(-160, 1080, 16, 30, 120, 0.5)
    parts = []
    for n, pts in enumerate(layers):
        index = n % 5 == 4
        parts.append(f'<path d="{path(pts)}" stroke-width="{1.4 if index else 0.7}" opacity="{0.9 if index else 0.55}"/>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
        f'fill="none" stroke="#d9a04f" stroke-linejoin="round">{"".join(parts)}</svg>\n'
    )
    with open(target, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"{target}: {len(layers)} contours, {len(svg) // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1])
