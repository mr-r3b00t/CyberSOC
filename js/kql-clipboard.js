/**
 * CyberSOC Playbook — KQL Copy-to-Clipboard
 * Injects copy buttons into KQL blocks and handles clipboard operations
 */
(function () {
    'use strict';

    var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    function createCopyButton() {
        var btn = document.createElement('button');
        btn.className = 'btn-copy';
        btn.setAttribute('aria-label', 'Copy KQL query to clipboard');
        btn.innerHTML = COPY_ICON + '<span>COPY</span>';
        return btn;
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for older browsers
        return new Promise(function (resolve, reject) {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    }

    function handleCopy(btn, codeBlock) {
        var code = codeBlock.textContent;

        copyToClipboard(code).then(function () {
            btn.innerHTML = CHECK_ICON + '<span>COPIED!</span>';
            btn.classList.add('copied');

            setTimeout(function () {
                btn.innerHTML = COPY_ICON + '<span>COPY</span>';
                btn.classList.remove('copied');
            }, 2000);
        }).catch(function () {
            btn.innerHTML = '<span>FAILED</span>';
            setTimeout(function () {
                btn.innerHTML = COPY_ICON + '<span>COPY</span>';
            }, 2000);
        });
    }

    function init() {
        var kqlBlocks = document.querySelectorAll('.kql-block');

        kqlBlocks.forEach(function (block) {
            var header = block.querySelector('.kql-header');
            var codeEl = block.querySelector('pre code');

            if (!header || !codeEl) return;

            // Don't add duplicate buttons
            if (header.querySelector('.btn-copy')) return;

            var btn = createCopyButton();
            header.appendChild(btn);

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                handleCopy(btn, codeEl);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.initClipboard = init;
})();
