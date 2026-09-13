# Smale Riverfront Park publication record

Existing Sheet project **17**, recording project code **0501**. Published scope: Swing Pergola (0501-01), Sculpture Area (0501-02), Water Features (0501-04). The user withheld the children's recording; 0501-03 stays reserved and must not appear as an upcoming placeholder.

`smale-riverfront-park.json` retains a local preview snapshot with `visible: 0`. The live catalogue is maintained in Google Sheets; it has `visible: 1`. Do not use the snapshot to overwrite future Sheet changes.

To review the snapshot, run `npm run build`, then `node scripts/preview-project.mjs drafts/smale-riverfront-park.json` and serve `.preview`. Open `/projects/smale-riverfront-park/`. Never deploy `.preview`; normal builds publish `dist` only.

Captures now accept an optional fifth field: `label::vrId::description::height::code`, separated by `|`. This preserves 01, 02, 04 when a recording is withheld. Older four-field entries remain supported.

Upload copy: `docs/smale-riverfront-park-youtube.md`. Cover and generation prompt: `assets/projects/smale-riverfront-park*`.
