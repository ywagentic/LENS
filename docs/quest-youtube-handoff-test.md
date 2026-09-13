# Quest YouTube VR handoff test

Test page: https://lens-vr.com/quest-test/

The user confirmed the opening blur happens in the web player but not when playing directly in YouTube VR on their headset. The remaining question is whether a user-clicked browser link can both launch YouTube VR and select the recording.

A: HTTPS watch URL, explicitly addressed to com.google.android.apps.youtube.vr.oculus.
B: vnd.youtube video ID, explicitly addressed to the same package.
C: vnd.youtube video ID without a package, allowing the system to resolve a handler.

All three are unverified candidates on Quest. They use native anchor clicks, no automatic navigation or timer, with a same-page fallback that identifies the failed attempt. The production project buttons are unchanged. No automatic launch success claim, results upload, or analytics. Page is noindex and absent from navigation and sitemap.

Record headset model, Horizon OS / Browser / YouTube VR versions, attempt letter, whether the app launches, whether the correct selected video starts in 360 mode, and opening clarity. Opening the app home screen alone is not sufficient. Test all three recordings before promoting any candidate to production.

Sources:
- Chrome intent syntax and browsable activity requirement: https://developer.chrome.com/docs/android/intents
- Meta Web Task app-intent support (does not establish support in a regular Browser tab): https://developers.meta.com/horizon/documentation/web/web-tasks/
- Showtime VR native-app handoff and Quest YouTube package identifier (does not establish browser handoff): https://pro.showtimevr.jp/?p=2945
