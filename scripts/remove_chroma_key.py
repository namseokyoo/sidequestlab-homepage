#!/usr/bin/env python3
"""Chroma-key #00FF00 backgrounds out of AI-generated sprite PNGs.

Usage:
    python3 remove_chroma_key.py --soft-matte --transparent-threshold 14 \
        --opaque-threshold 90 --edge-contract 1 --despill --force \
        input.png output.png
"""
import argparse
import sys

import numpy as np
from PIL import Image


def chroma_key(
    img: Image.Image,
    transparent_threshold: int = 14,
    opaque_threshold: int = 90,
    edge_contract: int = 1,
    despill: bool = True,
) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.array(rgba, dtype=np.int32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

    # Greenness: how much G exceeds the stronger of R/B
    greenness = g - np.maximum(r, b)

    # Soft matte: fully transparent above opaque_threshold,
    # fully opaque below transparent_threshold, gradient between
    span = max(opaque_threshold - transparent_threshold, 1)
    alpha = np.clip(
        (opaque_threshold - greenness) / span, 0.0, 1.0
    ) * 255.0
    alpha = alpha.astype(np.uint8)

    # Combine with any existing alpha
    alpha = np.minimum(alpha, a.astype(np.uint8))

    # Edge contraction: erode alpha to strip green fringe halos
    for _ in range(edge_contract):
        padded = np.pad(alpha, 1, mode="constant", constant_values=0)
        alpha = np.minimum.reduce(
            [
                padded[:-2, 1:-1],
                padded[2:, 1:-1],
                padded[1:-1, :-2],
                padded[1:-1, 2:],
                padded[1:-1, 1:-1],
            ]
        )

    # Despill: pull the G channel of semi-transparent pixels toward
    # the average of R and B so no green tint bleeds into the scene
    if despill:
        semi = (alpha > 0) & (alpha < 255)
        avg_rb = ((r + b) / 2).astype(np.int32)
        g_fixed = np.where(semi & (g > avg_rb), avg_rb, g)
        # Also lightly despill fully opaque pixels that are still greenish
        opaque_green = (alpha == 255) & (greenness > transparent_threshold)
        g_fixed = np.where(opaque_green, np.minimum(g, avg_rb + transparent_threshold), g_fixed)
        g = g_fixed.astype(np.uint8)

    out = np.stack(
        [r.astype(np.uint8), g.astype(np.uint8), b.astype(np.uint8), alpha],
        axis=-1,
    )
    return Image.fromarray(out)


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove #00FF00 chroma key background")
    parser.add_argument("input", help="Input PNG path")
    parser.add_argument("output", help="Output PNG path")
    parser.add_argument("--soft-matte", action="store_true", help="Soft alpha gradient")
    parser.add_argument("--transparent-threshold", type=int, default=14)
    parser.add_argument("--opaque-threshold", type=int, default=90)
    parser.add_argument("--edge-contract", type=int, default=1)
    parser.add_argument("--despill", action="store_true")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output")
    args = parser.parse_args()

    import os
    if os.path.exists(args.output) and not args.force:
        print(f"Output exists, use --force to overwrite: {args.output}", file=sys.stderr)
        sys.exit(1)

    img = Image.open(args.input)
    result = chroma_key(
        img,
        transparent_threshold=args.transparent_threshold,
        opaque_threshold=args.opaque_threshold,
        edge_contract=args.edge_contract,
        despill=args.despill,
    )
    result.save(args.output)

    # Report stats
    arr = np.array(result)
    total = arr.shape[0] * arr.shape[1]
    transparent = int((arr[..., 3] == 0).sum())
    semi = int(((arr[..., 3] > 0) & (arr[..., 3] < 255)).sum())
    print(
        f"{args.output}: {result.size[0]}x{result.size[1]} "
        f"transparent={transparent / total:.1%} semi={semi / total:.1%}"
    )


if __name__ == "__main__":
    main()
