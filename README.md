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

In the Projects sheet, column AD (`visible`) controls publication: `1` shows a
project; `0` or blank hides it. Hidden rows remain in the public sheet; this is a
publication control, not a privacy control. The build includes only visible rows
in project pages, embedded data and the sitemap. Each deployment replaces the full
artifact, removing previously generated pages for hidden projects.

After editing the sheet, wait for Google's published CSV to refresh, then run
[Publish LENS](https://github.com/ywagentic/LENS/actions/workflows/pages.yml) →
**Run workflow** on main. This updates static content used by search engines and
link previews. Browsers also refresh the catalogue on load; that alone does not
update the static HTML. On network failure they retain the last published snapshot.
Search engine caches can take longer to reflect a removed page.

Current projects: Yongqing Fang Renewal (9), completed 2017, and Huacheng Square
(20), completed 2010. See `docs/project-years.md` for sources. `year` means project
completion year; `dateCollected` records documentation date. The former has one
YouTube viewpoint and the latter two. Videos open externally on YouTube.
Project URLs use stable slugs for these two projects and `project-ID` for future
rows, so editing a title does not break a URL.

See `docs/search-optimization.md` for indexing setup and maintenance.
