# LENS

Library of Experienceable Landscape Spaces — a landscape architecture collection for educators and students.

Live: https://lens-vr.com/

## Build and publish

Use Node 22 or later. `npm ci`, `npm run build`, then `npm test`.
The build reads the public Projects sheet and creates production HTML and bundled
JavaScript in `dist/`. Preview with `python3 -m http.server 8766 --directory dist`.
GitHub Actions publishes only `dist/` on pushes to main or a manual **Publish LENS** run.
The source `index.html` remains editable; production does not use browser Babel.

## Project visibility and updates

In the Projects sheet, column AD (`visible`) has three publication states:

| Value | Result |
| --- | --- |
| `0` or blank | Hidden from the website |
| `1` | Published: normal cards, detail page, Atlas and sitemap |
| `upcoming` (or `2`) | Preview in the homepage and Browse Upcoming sections |

Upcoming covers are grayscale at 50% opacity; labels remain readable. Previews
are searchable and filterable in Browse, but have no playback, detail link,
upvotes, or Atlas entry. Any recording IDs entered ahead of release are suppressed
until the state is changed to `1`. Old `TRUE`/`FALSE` values remain supported.

Optional column AF (`expectedRelease`) accepts a date formatted as `YYYY-MM-DD`.
It displays an estimated number of weeks and the target date. Leave it blank for
“Recording coming soon”. If the date passes, the label asks for a date update;
the project never publishes automatically. Update AD to `1` when ready.

Hidden rows remain in the public sheet; this is a publication control, not a
privacy control. Only published projects get independent pages and sitemap
entries. Upcoming metadata is included in the homepage/Browse previews. Each
build replaces the artifact and removes pages whose state is no longer `1`.

After editing the sheet, wait for Google's published CSV to refresh, then run
[Publish LENS](https://github.com/ywagentic/LENS/actions/workflows/pages.yml) →
**Run workflow** on main. This updates static content used by search engines and
link previews. Browsers also refresh the catalogue on load; that alone does not
update the static HTML. On network failure they retain the last published snapshot.
Search engine caches can take longer to reflect a removed page.

Published projects: Yongqing Fang Renewal (9), completed 2017, and Huacheng Square
(20), completed 2010. See `docs/project-years.md` for sources. `year` means project
completion year; `dateCollected` records documentation date. The former has one
YouTube viewpoint and the latter two. Videos open externally on YouTube.
Project URLs use stable slugs for these two projects and `project-ID` for future
rows, so editing a title does not break a URL.

See `docs/search-optimization.md` for indexing setup and maintenance.

First upcoming project: Shenzhen Talent Park Phase II — Children’s Play Area (21).
Completion year 2024; designer AUBE Conception. The release date is not yet set.
Sources: https://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_11970344.html and
https://www.archiposition.com/items/20250617102853 (text provided by the designer).
This record covers the play area; no area or precise coordinates are guessed.
