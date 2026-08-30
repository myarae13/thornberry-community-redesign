/* ============================================================
   Thornberry Creek Community Association
   Fallback for email links that go nowhere

   A mailto link only works if the computer has a mail program set
   as its handler. Phones always do. A desktop where someone reads
   mail on the web, in a Gmail or Outlook tab, usually does not, and
   there the browser drops the click with no message of any kind.
   The link looks broken because nothing at all happens.

   So the link is left exactly as it is and allowed to fire. If the
   browser hands the click to a mail program, the page loses focus
   and this script stands down. If the page is still sitting there a
   moment later, nothing took the click, and a small panel opens
   with the address, a copy button, and webmail links.
   ============================================================ */
(function () {
  'use strict';

  // How long to wait before deciding nothing answered. Long enough for a
  // mail program to come up on a slow machine, short enough that the panel
  // does not feel disconnected from the click.
  var WAIT = 1200;

  var timer = null;
  var dialog = null;
  var lastFocused = null;

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  // A mail program taking the click moves focus off the page, hides it, or
  // unloads it. Any of those means the link worked and we keep quiet.
  window.addEventListener('blur', cancel);
  window.addEventListener('pagehide', cancel);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancel();
  });

  function build() {
    var back = document.createElement('div');
    back.className = 'mailto-back';
    back.hidden = true;
    back.innerHTML =
      '<div class="mailto-panel" role="dialog" aria-modal="true" aria-labelledby="mailto-h">' +
        '<h2 id="mailto-h">Email the association</h2>' +
        // Worded as an offer, not a diagnosis. The panel opens on a guess: the
        // page still had focus, so probably nothing answered the link. A slow
        // mail program is the other possibility, and someone whose mail is
        // opening behind this panel should not be told it does not exist.
        '<p class="mailto-note">If your mail program did not open, you can use the ' +
          'address here. Copy it, or start a message in webmail.</p>' +
        '<p class="mailto-addr"><span class="mailto-value"></span></p>' +
        '<div class="mailto-actions">' +
          '<button type="button" class="btn btn-pine mailto-copy">Copy address</button>' +
          '<a class="btn btn-outline mailto-gmail" target="_blank" rel="noopener">Open in Gmail</a>' +
          '<a class="btn btn-outline mailto-outlook" target="_blank" rel="noopener">Open in Outlook</a>' +
        '</div>' +
        '<button type="button" class="mailto-close" aria-label="Close">Close</button>' +
      '</div>';
    document.body.appendChild(back);

    back.addEventListener('click', function (e) {
      if (e.target === back) close();
    });
    back.querySelector('.mailto-close').addEventListener('click', close);
    back.querySelector('.mailto-copy').addEventListener('click', function () {
      copy(back.querySelector('.mailto-value').textContent, this);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !back.hidden) close();
      if (e.key === 'Tab' && !back.hidden) trap(e, back);
    });
    return back;
  }

  // Keep the keyboard inside the panel while it is open.
  function trap(e, back) {
    var items = back.querySelectorAll('button, a[href]');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function copy(address, button) {
    var done = function () {
      var had = button.textContent;
      button.textContent = 'Copied';
      setTimeout(function () { button.textContent = had; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(done, function () { legacy(address, done); });
    } else {
      legacy(address, done);
    }
  }

  // Older browsers, and any context where the clipboard API is refused.
  function legacy(address, done) {
    var box = document.createElement('textarea');
    box.value = address;
    box.setAttribute('readonly', '');
    box.style.position = 'fixed';
    box.style.top = '-1000px';
    document.body.appendChild(box);
    box.select();
    try { document.execCommand('copy'); done(); } catch (err) { /* leave the address on screen to copy by hand */ }
    document.body.removeChild(box);
  }

  function open(address) {
    if (!dialog) dialog = build();
    dialog.querySelector('.mailto-value').textContent = address;
    dialog.querySelector('.mailto-gmail').href =
      'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(address);
    dialog.querySelector('.mailto-outlook').href =
      'https://outlook.live.com/mail/0/deeplink/compose?to=' + encodeURIComponent(address);
    lastFocused = document.activeElement;
    dialog.hidden = false;
    dialog.querySelector('.mailto-copy').focus();
  }

  function close() {
    if (!dialog) return;
    dialog.hidden = true;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
    if (!link) return;
    // Let the browser try the link first. Nothing here prevents it.
    var address = link.getAttribute('href').replace(/^mailto:/i, '').split('?')[0];
    if (!address) return;
    cancel();
    timer = setTimeout(function () {
      timer = null;
      // Still here, still visible, still focused: nothing took the click.
      if (!document.hidden && document.hasFocus()) open(decodeURIComponent(address));
    }, WAIT);
  });
})();
