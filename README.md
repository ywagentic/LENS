# LENS

Library of Experienceable Landscape Spaces — a VR database for contemporary landscape architecture projects, aimed at educators and students.

Live: https://ywagentic.github.io/LENS/

Draft in progress.

## Project visibility

In the Projects sheet, column AD (`visible`) controls publication: `1` shows a
project; `0` or blank hides it. Hidden rows remain in the sheet. The homepage,
collection, search, filters and Atlas all use this setting. Google may take a
short time to refresh published CSV data; reload the site after changing it.
The browser fetches fresh data on page load and never restores sample projects
when loading fails. This is a display control; the published sheet remains public.

Current selection: Yongqing Fang Renewal (9) and Huacheng Square (20). Neither
entry currently has a recording. Add a real YouTube video ID to `vrId` when ready;
until then, the detail page shows “360° recording coming soon”. `year` remains the
capture year, not the project's opening year.

Checks: `node tests/visibility.cjs` (or pass a downloaded CSV path to check live data).
