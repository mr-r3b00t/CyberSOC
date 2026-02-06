/**
 * CyberSOC Playbook — Collapsible Sections
 * Expand/collapse with animation and localStorage persistence
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'cybersoc_collapse_';

    function getPageId() {
        var path = window.location.pathname;
        var filename = path.split('/').pop().replace('.html', '') || 'index';
        return filename;
    }

    function getStorageKey(sectionId) {
        return STORAGE_PREFIX + getPageId() + '_' + sectionId;
    }

    function saveState(sectionId, expanded) {
        try {
            localStorage.setItem(getStorageKey(sectionId), expanded ? '1' : '0');
        } catch (e) { /* localStorage not available */ }
    }

    function loadState(sectionId) {
        try {
            return localStorage.getItem(getStorageKey(sectionId));
        } catch (e) {
            return null;
        }
    }

    function toggleSection(collapsible, forceState) {
        var content = collapsible.querySelector('.collapsible-content');
        if (!content) return;

        var shouldExpand = forceState !== undefined ? forceState : !collapsible.classList.contains('expanded');

        if (shouldExpand) {
            collapsible.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            // After transition, remove max-height to allow dynamic content
            setTimeout(function () {
                if (collapsible.classList.contains('expanded')) {
                    content.style.maxHeight = 'none';
                }
            }, 400);
        } else {
            // Set explicit height first for transition
            content.style.maxHeight = content.scrollHeight + 'px';
            // Force reflow
            content.offsetHeight;
            content.style.maxHeight = '0';
            collapsible.classList.remove('expanded');
        }

        var id = collapsible.id || collapsible.getAttribute('data-section-id');
        if (id) {
            saveState(id, shouldExpand);
        }
    }

    function initExpandAllButtons() {
        var buttons = document.querySelectorAll('.btn-expand-all');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetGroup = btn.getAttribute('data-target');
                var container = targetGroup
                    ? document.querySelector(targetGroup)
                    : btn.closest('.section') || document.body;

                var collapsibles = container.querySelectorAll('.collapsible');
                var allExpanded = Array.from(collapsibles).every(function (c) {
                    return c.classList.contains('expanded');
                });

                collapsibles.forEach(function (c) {
                    toggleSection(c, !allExpanded);
                });

                btn.textContent = allExpanded ? 'Expand All' : 'Collapse All';
            });
        });
    }

    function init() {
        var collapsibles = document.querySelectorAll('.collapsible');

        collapsibles.forEach(function (collapsible, index) {
            // Ensure each collapsible has an ID for persistence
            if (!collapsible.id && !collapsible.getAttribute('data-section-id')) {
                collapsible.setAttribute('data-section-id', 'section-' + index);
            }

            var header = collapsible.querySelector('.collapsible-header');
            var content = collapsible.querySelector('.collapsible-content');

            if (!header || !content) return;

            // Set ARIA attributes
            var contentId = 'collapsible-content-' + index;
            content.id = contentId;
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', contentId);

            // Restore state from localStorage
            var sectionId = collapsible.id || collapsible.getAttribute('data-section-id');
            var savedState = loadState(sectionId);

            if (savedState === '1') {
                collapsible.classList.add('expanded');
                content.style.maxHeight = 'none';
                header.setAttribute('aria-expanded', 'true');
            } else if (savedState === null && collapsible.classList.contains('expanded')) {
                // Default expanded state from HTML
                content.style.maxHeight = 'none';
                header.setAttribute('aria-expanded', 'true');
            } else {
                content.style.maxHeight = '0';
                collapsible.classList.remove('expanded');
            }

            // Click handler
            header.addEventListener('click', function () {
                toggleSection(collapsible);
                var isExpanded = collapsible.classList.contains('expanded');
                header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            });

            // Keyboard handler
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSection(collapsible);
                    var isExpanded = collapsible.classList.contains('expanded');
                    header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                }
            });
        });

        initExpandAllButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.toggleSection = toggleSection;
    window.CyberSOC.initCollapsible = init;
})();
