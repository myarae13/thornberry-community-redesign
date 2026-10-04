/* ============================================================
   Thornberry Creek Community Association
   Google Analytics (GA4)

   Every page loads this one file, so the measurement ID lives in
   one place. Paste the ID from Google Analytics (Admin, Data
   streams, the web stream for this site) between the quotes below.

   Until a real ID is set, this script does nothing: no Google
   script loads and nothing is sent anywhere.

   The Content-Security-Policy in vercel.json allows the Google
   domains this needs. Remove them there if analytics is removed.
   ============================================================ */
(function () {
  var GA_MEASUREMENT_ID = "G-09GS19886E";

  if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);
})();
