# LENS submission receiver

Status: user-provided deployment connected in local index.html. The deployed
service returns the expected health JSON, rejects invalid submissions, and returns
Access-Control-Allow-Origin: * on its redirect and JSON response. A local browser also successfully read the invalid-submission JSON response.
Authorised browser test 4da9d18a-78ba-4d4e-b3e4-44ec156a4710 returned ok:true
using the website's sendSubmission function. Email delivery needs owner confirmation.
Same-ID retry returned id_conflict. Local Code.gs now handles Sheets date/boolean
coercion when comparing saved consent/version values; regression check passes.
Redeploy the updated Code.gs and repeat the same ID before marking deduplication
verified in production. Website not published.

## Deploy

1. Create a private Google Sheet for submissions. Do not publish it as CSV.
2. Create an Apps Script project and paste Code.gs into it.
3. In Project Settings → Script properties, add LENS_SUBMISSIONS_SHEET_ID
   (the private sheet ID), and LENS_SUBMISSIONS_EMAIL_TO (wang@unl.edu).
4. Deploy as Web App, executing as the owner, accessible to Anyone. Authorise
   Sheets and email access. Copy the /exec URL into SUBMIT_ENDPOINT in index.html.
5. Test from the site's browser origin with an explicitly authorised test entry.
   Check the saved row, consent version, notification, and matching JSON receipt.
   Also verify retrying the same submissionId does not create another row.
6. Publish the website only after the browser can read the JSON response. A
   curl result alone does not verify browser CORS. Never restore no-cors with an
   automatic success message. If the deployment cannot return readable responses,
   keep online submission unavailable until a suitable receiver is configured.

The server saves before returning ok; email errors are recorded separately.
The frontend retains entered data on failure and reuses its ID for retries.
No source video is downloaded by this receiver: a curator must copy accepted
files into LENS storage before confirming transfer to the contributor.

Terms version 2026-09-12 refers to the SUBMISSION_TERMS text in index.html.
Archive the deployed wording with each release; change the version in both files
when changing the authorisation. Review third-party permissions before publication.

Checks: node submissions/check.cjs (local mocked services; sends no email).
