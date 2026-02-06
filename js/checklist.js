/**
 * CyberSOC Playbook — Interactive Checklists
 * Checkbox persistence with localStorage and progress tracking
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'cybersoc_check_';

    function getPageId() {
        var path = window.location.pathname;
        return path.split('/').pop().replace('.html', '') || 'index';
    }

    function getStorageKey(sectionId, itemIndex) {
        return STORAGE_PREFIX + getPageId() + '_' + sectionId + '_' + itemIndex;
    }

    function saveCheckState(sectionId, itemIndex, checked) {
        try {
            localStorage.setItem(getStorageKey(sectionId, itemIndex), checked ? '1' : '0');
        } catch (e) { /* localStorage not available */ }
    }

    function loadCheckState(sectionId, itemIndex) {
        try {
            return localStorage.getItem(getStorageKey(sectionId, itemIndex));
        } catch (e) {
            return null;
        }
    }

    function clearSectionState(sectionId, count) {
        try {
            for (var i = 0; i < count; i++) {
                localStorage.removeItem(getStorageKey(sectionId, i));
            }
        } catch (e) { /* localStorage not available */ }
    }

    function updateProgress(section) {
        var items = section.querySelectorAll('.checklist-item input[type="checkbox"]');
        var checked = section.querySelectorAll('.checklist-item input[type="checkbox"]:checked');

        var total = items.length;
        var completed = checked.length;
        var percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        var progressBar = section.querySelector('.checklist-progress-fill');
        var progressText = section.querySelector('.checklist-progress-text');

        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }

        if (progressText) {
            progressText.textContent = completed + '/' + total + ' (' + percentage + '%)';
        }
    }

    function initSection(section, sectionIndex) {
        var sectionId = section.getAttribute('data-checklist-id') || 'checklist-' + sectionIndex;
        var items = section.querySelectorAll('.checklist-item');

        // Create progress bar if not present
        if (!section.querySelector('.checklist-progress')) {
            var progressDiv = document.createElement('div');
            progressDiv.className = 'checklist-progress';
            progressDiv.innerHTML =
                '<div class="checklist-progress-bar">' +
                '  <div class="checklist-progress-fill" style="width: 0%"></div>' +
                '</div>' +
                '<span class="checklist-progress-text">0/' + items.length + ' (0%)</span>';

            var firstItem = section.querySelector('.checklist-item');
            if (firstItem) {
                section.insertBefore(progressDiv, firstItem);
            } else {
                section.appendChild(progressDiv);
            }
        }

        items.forEach(function (item, itemIndex) {
            var checkbox = item.querySelector('input[type="checkbox"]');
            if (!checkbox) return;

            // Restore state
            var savedState = loadCheckState(sectionId, itemIndex);
            if (savedState === '1') {
                checkbox.checked = true;
                item.classList.add('completed');
            }

            // Change handler
            checkbox.addEventListener('change', function () {
                if (checkbox.checked) {
                    item.classList.add('completed');
                } else {
                    item.classList.remove('completed');
                }
                saveCheckState(sectionId, itemIndex, checkbox.checked);
                updateProgress(section);
            });
        });

        // Reset button
        var resetBtn = section.querySelector('.btn-reset-checklist');
        if (!resetBtn) {
            resetBtn = document.createElement('button');
            resetBtn.className = 'btn-reset-checklist';
            resetBtn.textContent = 'Reset Checklist';
            section.appendChild(resetBtn);
        }

        resetBtn.addEventListener('click', function () {
            clearSectionState(sectionId, items.length);
            items.forEach(function (item) {
                var cb = item.querySelector('input[type="checkbox"]');
                if (cb) {
                    cb.checked = false;
                    item.classList.remove('completed');
                }
            });
            updateProgress(section);
        });

        // Initial progress calculation
        updateProgress(section);
    }

    function init() {
        var sections = document.querySelectorAll('.checklist-section');
        sections.forEach(function (section, index) {
            initSection(section, index);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.initChecklists = init;
})();
