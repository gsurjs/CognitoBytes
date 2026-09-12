// Shared share helper for all games.
// Desktop browsers (mouse-driven: hover + fine pointer) get an explicit
// copy-to-clipboard modal instead of the OS share sheet, which on desktop is
// clunky and easy to dismiss with nothing happening. Phones and tablets keep
// the native share sheet via navigator.share.
(function () {
    function isDesktop() {
        try {
            return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        } catch (error) {
            return false;
        }
    }

    function showModal(text) {
        var overlay = document.createElement('div');
        overlay.className = 'cb-share-overlay';

        var panel = document.createElement('div');
        panel.className = 'cb-share-panel';
        panel.innerHTML =
            '<h3 class="cb-share-title">Share your result</h3>' +
            '<textarea class="cb-share-text" readonly></textarea>' +
            '<div class="cb-share-row">' +
            '<button type="button" class="cb-share-copy">📋 COPY</button>' +
            '<button type="button" class="cb-share-close">CLOSE</button>' +
            '</div>';

        var textarea = panel.querySelector('.cb-share-text');
        textarea.value = text;

        var close = function () {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
        };
        var onKey = function (e) {
            if (e.key === 'Escape') close();
        };

        panel.querySelector('.cb-share-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
        document.addEventListener('keydown', onKey);

        var copyButton = panel.querySelector('.cb-share-copy');
        copyButton.addEventListener('click', function () {
            var done = function () {
                copyButton.textContent = '✓ COPIED!';
                copyButton.classList.add('copied');
                setTimeout(function () {
                    copyButton.textContent = '📋 COPY';
                    copyButton.classList.remove('copied');
                }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(function () {
                    textarea.select();
                    document.execCommand('copy');
                    done();
                });
            } else {
                textarea.select();
                document.execCommand('copy');
                done();
            }
        });

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        copyButton.focus();
    }

    var style = document.createElement('style');
    style.textContent =
        '.cb-share-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);' +
        'display:flex;align-items:center;justify-content:center;z-index:3000;}' +
        '.cb-share-panel{background:#2c2c2e;color:#fff;border-radius:14px;padding:20px;width:90%;max-width:420px;' +
        'text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.5);font-family:system-ui,Arial,sans-serif;}' +
        '.cb-share-title{margin:0 0 12px;font-size:17px;}' +
        '.cb-share-text{width:100%;height:130px;background:#1e1e1e;color:#fff;border:1px solid #444;border-radius:8px;' +
        'padding:10px;box-sizing:border-box;resize:none;font-size:14px;line-height:1.4;}' +
        '.cb-share-row{display:flex;gap:10px;margin-top:14px;}' +
        '.cb-share-copy,.cb-share-close{flex:1;border:none;border-radius:999px;padding:11px 10px;font-size:12px;' +
        'font-weight:700;letter-spacing:0.5px;cursor:pointer;}' +
        '.cb-share-copy{background:linear-gradient(90deg,#ffb700,#ffd700);color:#241a3d;}' +
        '.cb-share-copy.copied{background:linear-gradient(45deg,#27ae60,#2ecc71);color:#fff;}' +
        '.cb-share-close{background:rgba(255,255,255,0.14);color:#fff;border:1px solid rgba(255,255,255,0.3);}' +
        '.cb-share-copy:focus-visible,.cb-share-close:focus-visible{outline:2px solid #ffd700;outline-offset:2px;}';
    document.head.appendChild(style);

    window.cbShare = { isDesktop: isDesktop, showModal: showModal };
})();
