/**
 * CyberSOC Playbook — Navigation
 * Sidebar active state, mobile menu, in-page TOC, smooth scroll, scroll spy
 */
(function () {
    'use strict';

    function setActiveNav() {
        var path = window.location.pathname;
        var currentPage = path.split('/').pop() || 'index.html';

        var navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function initMobileMenu() {
        var menuBtn = document.querySelector('.btn-menu');
        var sidebar = document.querySelector('.sidebar');
        var overlay = document.querySelector('.sidebar-overlay');

        if (!menuBtn || !sidebar) return;

        // Create overlay if not present
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        menuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close menu on nav link click (mobile)
        sidebar.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
        });
    }

    function generateTOC() {
        var tocContainer = document.querySelector('.sidebar-toc-list');
        var mainContent = document.querySelector('.main-content');

        if (!tocContainer || !mainContent) return;

        var headings = mainContent.querySelectorAll('h2[id], h3[id]');
        if (headings.length === 0) return;

        var html = '';
        headings.forEach(function (heading) {
            var id = heading.id;
            var text = heading.textContent.replace(/^\d+\.\s*/, ''); // Remove number prefix
            var level = heading.tagName.toLowerCase();
            var cls = level === 'h3' ? 'toc-h3' : '';

            html += '<li><a href="#' + id + '" class="' + cls + '" data-toc-target="' + id + '">' + text + '</a></li>';
        });

        tocContainer.innerHTML = html;
    }

    function initScrollSpy() {
        var tocLinks = document.querySelectorAll('.sidebar-toc-list a');
        if (tocLinks.length === 0) return;

        var headings = [];
        tocLinks.forEach(function (link) {
            var targetId = link.getAttribute('data-toc-target');
            var heading = document.getElementById(targetId);
            if (heading) {
                headings.push({ element: heading, link: link });
            }
        });

        if (headings.length === 0) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    tocLinks.forEach(function (l) { l.classList.remove('toc-active'); });
                    var match = headings.find(function (h) { return h.element === entry.target; });
                    if (match) {
                        match.link.classList.add('toc-active');
                    }
                }
            });
        }, {
            rootMargin: '-80px 0px -60% 0px',
            threshold: 0
        });

        headings.forEach(function (h) {
            observer.observe(h.element);
        });
    }

    function initSmoothScroll() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var targetId = link.getAttribute('href').substring(1);
            var target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();

            var topbarHeight = 70; // topbar height + some padding
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - topbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL hash without jumping
            if (history.pushState) {
                history.pushState(null, null, '#' + targetId);
            }
        });
    }

    function initPrintButton() {
        var printBtn = document.querySelector('.btn-print');
        if (printBtn) {
            printBtn.addEventListener('click', function () {
                window.print();
            });
        }
    }

    function init() {
        setActiveNav();
        initMobileMenu();
        generateTOC();
        initScrollSpy();
        initSmoothScroll();
        initPrintButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CyberSOC = window.CyberSOC || {};
    window.CyberSOC.initNavigation = init;
})();
