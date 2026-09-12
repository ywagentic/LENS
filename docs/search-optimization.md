# Search and AI discovery

Production origin: https://lens-vr.com/

## Implemented

- Static HTML from the same React components used in the browser.
- Independent routes for seven main pages and each visible project.
- Native links from navigation and project titles, page-specific titles and
  descriptions, canonical URLs and social sharing previews.
- Conservative WebSite, CollectionPage/WebPage and Place structured data.
  External YouTube links are not represented as locally hosted video files.
- `/robots.txt`, `/sitemap.xml`, and a noindex 404 page.
- Only published rows are included; failed catalogue fetches stop deployment.
- Production React bundle replaces browser Babel and development CDN scripts.

## Search Console (account setup)

1. Open https://search.google.com/search-console/ and add URL-prefix property
   `https://lens-vr.com/` (or use Domain property if DNS access is available).
2. For HTML-file verification, add Google's exact verification file to `public/`
   in this repo, deploy, and click Verify. The build copies public files to dist.
3. Submit `sitemap.xml` in Sitemaps.
4. Inspect the homepage and two project URLs; request indexing after verification.
5. Monitor indexing failures and search queries. Submission does not guarantee
   indexing or placement in search or AI answers.

Bing Webmaster Tools can import a verified Search Console site, then accept the
same sitemap. These account-level steps are separate from deploying site code.

## Editorial maintenance

After Sheet edits, manually run the Publish LENS workflow (or push a source
change). A new build is required to refresh search-visible HTML and remove hidden
project pages. Do not assume a client-side refresh removes a cached search result.

Keep project names, completion years, designers and factual sources consistent.
Do not turn the display fallback “Multiple” into an asserted designer credit in
structured data. Add observation descriptions for actual recorded viewpoints as
available: position, standing/seated viewpoint, enclosure, surfaces and use.
Do not invent observations from the generated covers; covers are illustrations.

For AI discoverability, clear source-backed text, stable URLs and accessible
HTML are the foundation. There is no promised ranking from special AI files or
keyword repetition. No training-license change is made by this work.

References:
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
