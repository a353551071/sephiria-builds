#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract-miracle-icons.py — 从 Steam 指南卡截图精裁游戏物品槽图标(112×112)

2026-09-03 首跑产出 17 组(src/assets/icons/,34 文件)。图源:FireBrother
"Basic Guide to Sephiria"(id 3474238982)Miracles (Root) 节 18 张卡截图
(0.7.x 旧版,JPG,原生 ~1000px 宽)。

管线(纯 numpy+PIL,无 scipy):
  1. 下载/读入卡图 → 亮度>90 或 饱和度>55 掩码 → 膨胀+腐蚀合并图标内部孔隙;
  2. 4 邻接连通域标记 → 尺寸 18-175px、纵横比 0.55-1.8、填充率>0.25 的近方形块
     = 图标候选(文字行为宽扁,自然被纵横比过滤);
  3. 112±8 精筛(游戏物品槽原生统一尺寸;行内小图标 ~23-35px、头像框 ~74px
     自动分层到各自尺寸档);
  4. 调色板量化 32 色关抖动(拍平 JPEG 压缩噪)→ 输出 native 112 + 56(整数二分)
     两档 PNG。

用途口径(仓纪律):内容性配图(Miracles 页表格/build 页徽章)可用;
站体 UI 骨架(按钮/边框/导航)一律 CSS/SVG 重绘,不搬游戏原图。

用法(在站仓根):
  python scripts/extract-miracle-icons.py --src <卡图目录> --out src/assets/icons
  # 卡图可用 gallery-fetch(见脚本末 URL 清单)或 Linux /tmp/sephiria-img 池
"""
from __future__ import annotations

import argparse
import os
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# Miracles (Root) 节 18 张卡 CDN URL(key=ugc 路径前段,下载带 UA+Referer,代理 7890)
CARD_URLS = [
    "12311017309270813472/522E1A80D4FE18BA2C431E9FD46AFC7F9B53F602",
    "10054070813218432133/071166C5A78409E8F4ECE0BA73C19126B3D6454C",
    "12650706621029988012/42743ED6D4FE59DA0582E64CDDC9C0F502208E22",
    "12625823409104976786/A78C1EFFC3365979713F052479024A9BC300F044",
    "15853825943762331436/81A74BBF5E0558A8A127222D67FB23BD2CFCA465",
    "12241470664728595936/ADDAEEF6B1142139608FF834297A4B6DEC01437B",
    "12451685535337062653/574E0A24194B1A63B531441EEA18234286312593",
    "17098599474633035475/8B9F26EBFFEA00D74D340406E29D3D8CC4643FAD",
    "17028532138146994326/183AA17841AA3191797479A49359418B7125A76A",
    "14462582012169587938/5BD33AAB7A24471E69993B038609B0A002751B11",
    "13339276109233407481/ECE1B62F020D291E6DB453BBF1DECC7E02D8300B",
    "12753696551556162630/F01D235FD285C65E084A9656FD415DDFDCEBAACC",
    "17723440421606863524/AC3FB979E39AEB863112162526B8A317A948B315",
    "16702945279982650720/460EC49D3EF8A30A8E7C3D7C1E803C2475BC5EE9",
    "14747835108175565268/4B145298F7565060B2B41DC97F2BDB5860DE597B",
    "11948355020750138157/BFB5BC61363EDBE7F4696E4BD761BBD7AE08650B",
    "10865507965860758916/F42AAE07ACEB90E6B41D0848CD7B6B527BD13CD8",
    "13045144935575617905/54CA6374340E61553B7E3C020F507015D167508D",
]

# 检测参数(2026-09-03 实测标定:卡01 自检命中率 ~7:3,112 精筛后误检≈0)
BRIGHT_T, SAT_T = 90, 55
MIN_PX, MAX_PX = 18, 175
AR_LO, AR_HI = 0.55, 1.8
FILL_T = 0.25
TARGET_LO, TARGET_HI = 104, 120  # 112±8 = 物品槽原生档


def label_components(mask: np.ndarray) -> tuple[np.ndarray, int]:
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    cur = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and labels[y, x] == 0:
                cur += 1
                q = deque([(y, x)])
                labels[y, x] = cur
                while q:
                    cy, cx = q.popleft()
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and labels[ny, nx] == 0:
                            labels[ny, nx] = cur
                            q.append((ny, nx))
    return labels, cur


def detect_boxes(im: Image.Image) -> list[tuple[int, int, int, int]]:
    a = np.asarray(im.convert("RGB")).astype(int)
    mx, mn = a.max(axis=2), a.min(axis=2)
    mask = (mx > BRIGHT_T) | ((mx - mn) > SAT_T)
    m = Image.fromarray((mask * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    labels, n = label_components(np.asarray(m) > 127)
    boxes = []
    for lab in range(1, n + 1):
        ys, xs = np.where(labels == lab)
        if len(xs) < 100:
            continue
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if not (MIN_PX <= bw <= MAX_PX and MIN_PX <= bh <= MAX_PX):
            continue
        if not (AR_LO <= bw / bh <= AR_HI):
            continue
        if len(xs) / (bw * bh) < FILL_T:
            continue
        boxes.append((int(xs.min()), int(ys.min()), int(bw), int(bh)))
    return boxes


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="卡图目录(18 张 <key>.jpg)")
    ap.add_argument("--out", default="src/assets/icons", help="输出目录")
    args = ap.parse_args()
    src, out = Path(args.src), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    total = 0
    for idx, key in enumerate(CARD_URLS, 1):
        p = src / f"{key.split('/')[0]}.jpg"
        if not p.exists():
            print(f"[skip] 卡{idx:02d} 缺 {p.name}")
            continue
        im = Image.open(p).convert("RGB")
        hits = []
        for i, (x0, y0, bw, bh) in enumerate(detect_boxes(im), 1):
            if not (TARGET_LO <= bw <= TARGET_HI and TARGET_LO <= bh <= TARGET_HI):
                continue
            c = im.crop((max(0, x0 - 1), max(0, y0 - 1),
                         min(im.width, x0 + bw + 1), min(im.height, y0 + bh + 1)))
            c = c.resize((c.width * 2, c.height * 2), Image.NEAREST)
            q = c.convert("RGB").quantize(colors=32, dither=Image.Dither.NONE).convert("RGB")
            stem = f"mir{idx:02d}-icon{i:02d}"
            q.save(out / f"{stem}-112.png")
            q.resize((q.width // 2, q.height // 2), Image.NEAREST).save(out / f"{stem}-56.png")
            hits.append(stem)
            total += 1
        print(f"卡{idx:02d}: {len(hits)} 个 {hits}")
    print(f"合计 {total} 组(native112+56)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
