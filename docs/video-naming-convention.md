# YouTube recording titles

Format: `Project name — City | [Viewpoint description |] 360° VR | LENS-PPP-VV`

- Lead with recognizable project and city names for viewers finding the video directly on YouTube.
- Add a short descriptive viewpoint when useful (e.g. Sunken Plaza), rather than leading with technical IDs.
- Put the stable database identifier only at the end. PPP is the project ID padded to at least three digits; VV is a permanently assigned capture number padded to at least two digits.
- Assign capture numbers once; do not change them when reordering viewpoints. Do not reuse retired numbers.
- Keep titles within YouTube's 100-character limit; shorten the descriptive part first.
- Use the same project spelling in the website and YouTube. Language translations belong in translated metadata or the description.

Proposed replacements (not yet applied on YouTube):

| Video ID | Title |
| --- | --- |
| 0_J7l3HbcX0 | Huacheng Square — Guangzhou \| 360° VR \| LENS-020-01 |
| sFw9p5A91HY | Huacheng Square — Guangzhou \| Sunken Plaza \| 360° VR \| LENS-020-02 |
| BP5CdxPtXYo | Yongqing Fang — Guangzhou \| 360° VR \| LENS-009-01 |

Current titles were checked through YouTube oEmbed on 2026-09-13. The website's YOUTUBE_SEARCH_TITLES map uses those actual titles until YouTube metadata is updated. Update that map with the exact new titles after renaming each video, so the copy button always supplies searchable text.

Quest test result: all three experimental browser intents failed on the user's headset. Native YouTube VR playback is clear while the browser path starts blurry. Browse's temporary test entry has been removed; /quest-test/ remains unlisted for reference. Do not promote the failed intents to production playback links.
