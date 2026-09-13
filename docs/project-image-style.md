# LENS 项目配图规则

## 已确认的方向

采用现代建筑插画的简化色块：白底、灰白建筑、低饱和自然绿色，保留项目本身有辨识度的色彩。参考真实照片，保留空间布局、视角、尺度、路径和人物比例。图像是项目识别插画，不作为测绘或现状记录。

## 裁切的核心逻辑

用少量大矩形组织整体，避免碎小缺口。裁切遇到有意义的实体边界时，沿它原有的连续轮廓展开：例如树冠、墙与步道交界、步道临水边缘。矩形不得覆盖或打断这些轮廓。不要另造曲线、圆角或几何台阶。用户标出的红线是具体裁切路径，应逐段遵循其与真实空间的关系；不是装饰性风格提示。

墙体可以截断，接到步道后沿已有曲线继续。保留主要空间的连续性和可辨识度。自然轮廓只在局部使用，避免整张图都抠成轮廓。

不使用手撕纸、毛边、纸纤维、复古版画、水彩、胶带、装饰阴影。画面不加入文字或水印。

## 网站文件

- assets/projects/yongqing-fang.jpg：永庆坊，项目 ID 9。
- assets/projects/huacheng-square.jpg：花城广场，项目 ID 20。
- 图像用内置 image_gen 生成，JPEG 质量 85 导出。保留整张轮廓，网站使用 contain，避免 cover 二次裁切。
- 原始生成 PNG 保留在本机生成目录；网站只加载压缩版。
- 当前代码按项目 ID 指定图片；以后可修改 normalizeProjects 中的映射。Sheet visible 开关继续独立控制是否显示。

## 参考来源

参考照片仅用于生成过程，不随网站上传原照片。来源记录不代表原照片许可声明。

- 永庆坊：[Revigorate 广州游记](https://www.revigorate.com/things-to-do-in-guangzhou-es.html)，图片 https://www.revigorate.com/images/Yongqing-Fang-Guangzhou.jpg
- 花城广场：[广州市会展业公共服务平台](https://www.mice-gz.org/english/a/61/20041.html)，图片 https://www.mice-gz.org/english/f/img/201909/1569738551839.jpg

## 本次生成提示词

### yongqing-fang

Create a project thumbnail for LENS, white minimalist landscape architecture website. Input 1 is the actual project PHOTO: preserve its actual site identity, viewpoint, spatial layout, buildings, paths, water edges and proportions. Input 2 is APPROVED STYLE reference ONLY (Cheonggyecheon): use its refined flat painted color planes, muted sage/gray with restrained natural accents and modern white collage silhouette. Do NOT copy its bridge or spatial features. Simplify incidental signage without readable text. Wide 16:9, pure white #FFFFFF outside scene. Compose most of scene as 2-3 generous rectangular extents with carefully proportioned margins, then selectively let actual tree canopy / existing path or architectural contour determine the boundary. Critical user rule: where a straight crop reaches a meaningful physical feature, follow that feature's ACTUAL existing continuous outline; no invented curves, no random square notches, no staircase masking pasted over a flowing path. Keep central spatial relationships intact. No paper grain overlay, torn paper, retro effects, watercolor, pencil, tape, shadows, UI, text, borders or logos. Maintain underlying site geometry and natural human scale. Yongqing Fang in Guangzhou. Retain white historic compound walls, red pedestrian bridge, canal, promenade and trees. Warm muted terracotta bridge, natural subdued greens and stone gray. Let upper left canopy escape rectangular extent following actual leaves; at lower edge select existing canal bank / railing edge as a continuous silhouette boundary. Preserve bridge location and canal alignment. Reduce foreground crowd clutter but retain a few actual-scale visitors; retain boat as simplified subordinate feature. Do not transpose Cheonggyecheon geometry.

### huacheng-square

Create a project thumbnail for LENS, white minimalist landscape architecture website. Input 1 is the actual project PHOTO: preserve its actual site identity, viewpoint, spatial layout, buildings, paths, water edges and proportions. Input 2 is APPROVED STYLE reference ONLY (Cheonggyecheon): use its refined flat painted color planes, muted sage/gray with restrained natural accents and modern white collage silhouette. Do NOT copy its bridge or spatial features. Simplify incidental signage without readable text. Wide 16:9, pure white #FFFFFF outside scene. Compose most of scene as 2-3 generous rectangular extents with carefully proportioned margins, then selectively let actual tree canopy / existing path or architectural contour determine the boundary. Critical user rule: where a straight crop reaches a meaningful physical feature, follow that feature's ACTUAL existing continuous outline; no invented curves, no random square notches, no staircase masking pasted over a flowing path. Keep central spatial relationships intact. No paper grain overlay, torn paper, retro effects, watercolor, pencil, tape, shadows, UI, text, borders or logos. Maintain underlying site geometry and natural human scale. Huacheng Square Guangzhou Zhujiang New Town central axis, aerial photo. Preserve distinctive pair of long curving red pedestrian promenades, lawns and planted central axis with surrounding high rises and sunken plazas. Muted terracotta paths, sage planting, gray/off-white buildings. Keep aerial perspective. Use broad simple crop for surrounding city, with only one selective edge tracing actual sinuous outer edge of an existing foreground red promenade and adjacent planting; another canopy may protrude slightly. Do not invent bridges, canals or towers. Keep longitudinal axial continuity clear. No artificial small square cutouts.


## Shenzhen Talent Park Phase II — Children’s Play Area (21)

- Website asset: `assets/projects/shenzhen-talent-park-phase-ii.jpg`.
- Reference: [AUBE project text on mooool](https://mooool.com/shenzhen-talent-park-phase-ii-by-aube-conception.html),
  photograph of the giant crab play structure: https://i.mooool.com/img/2025/06/01-18-eoi.jpg .
- Reference image is used locally for generation; original photography is not included in the website assets.
- Generated with the built-in image_gen tool, then exported to JPEG quality 85.
- Preserve full-color master; upcoming grayscale and 50% opacity are CSS, so publishing restores color.

### Generation prompt

Use case: illustration-story, project identification cover. Create a landscape-format 16:9 project thumbnail for LENS, a contemporary urban landscape VR database with restrained white editorial UI. FIRST input is the actual site photo of Shenzhen Talent Park Phase II CHILDREN'S PLAY AREA: the distinctive wooden polygonal giant crab play structure among trees, branching warm-beige paths, planted islands, families. Preserve its actual viewpoint, crab silhouette and scale, tree locations, relationship of pathways and planting, and human scale. SECOND input is ONLY the approved graphic STYLE and white cutout boundary reference; do not copy its skyscrapers, aerial view, red paths, or any project features. Translate the first photo into the same refined simplified flat color-plane illustration as the second: muted natural sage greens, warm pale tan wood and paving, light gray metal, small simply rendered people. Keep the crab structure as the main focus but visibly part of a landscape spatial scene, not a toy mascot. Simplify visual clutter, eliminate unreadable signage/branding and the blurry foreground person, retain a few correctly scaled families and children. Make a modern collage perimeter with 2 or 3 generous rectangular extents plus LOCAL boundaries that FOLLOW REAL CONTINUOUS TREE CANOPIES AND THE EXISTING WALKWAY/PLANTING EDGE. Particularly at the foreground left planted island, crop along its actual curving planted edge; do NOT invent new curves or square stepping notches. Upper left trees may extend beyond the straight top background crop along their actual canopy. Right side can terminate in one calm straight cut through background. Keep the scene spatially continuous. Pure opaque white canvas outside the scene. No paper tears, grain, vintage, watercolor, tape, shadows, dark background, text, logo, border or watermark. Illustration is in full natural muted color; website will apply upcoming desaturation separately. Artwork should occupy most of the wide canvas with modest white margins, similar framing scale to style reference.
