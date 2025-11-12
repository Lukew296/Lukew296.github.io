// Video page behavior: responsive iframes, lazy-load YouTube iframes, mobile menu toggle

(function () {
    'use strict';

    // Utilities
    const qs = (s, el = document) => el.querySelector(s);
    const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
    const debounce = (fn, wait = 100) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    };

    // Make iframes responsive by setting height based on width (16:9)
    function updateIframeSizes() {
        qsa('.video-card iframe').forEach(iframe => {
            const width = iframe.clientWidth || iframe.getBoundingClientRect().width || 560;
            iframe.style.width = '100%';
            iframe.style.height = Math.round(width * 9 / 16) + 'px';
        });
    }

    // Lazy-load YouTube iframes using IntersectionObserver (falls back to eager load)
    function setupLazyLoad() {
        const iframes = qsa('.video-card iframe').filter(f => {
            return f.dataset || f.src;
        });

        // Move existing src to data-src so we can lazy-load
        iframes.forEach(iframe => {
            const src = iframe.getAttribute('src') || '';
            if (!iframe.dataset.src && src) {
                iframe.dataset.src = src;
                iframe.setAttribute('src', 'about:blank');
            }
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer');
        });

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const f = entry.target;
                        const src = f.dataset && f.dataset.src;
                        if (src && f.getAttribute('src') !== src) {
                            f.setAttribute('src', src);
                            // once loaded, update height (some embeds may change)
                            f.addEventListener('load', () => updateIframeSizes(), { once: true });
                        }
                        observer.unobserve(f);
                    }
                });
            }, { root: null, rootMargin: '200px', threshold: 0.01 });

            iframes.forEach(f => obs.observe(f));
        } else {
            // Fallback: load immediately
            iframes.forEach(f => {
                const src = f.dataset && f.dataset.src;
                if (src) f.setAttribute('src', src);
            });
        }
    }

    // Mobile menu toggle with accessibility attributes
    function setupMobileMenu() {
        const toggle = qs('.mobile-menu');
        const navList = qs('nav ul');
        if (!toggle || !navList) return;

        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-controls', 'main-navigation');
        navList.id = navList.id || 'main-navigation';
        toggle.addEventListener('click', () => {
            const open = navList.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        toggle.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                toggle.click();
            }
        });

        // Close mobile menu when a nav link is clicked or when clicking outside
        navList.addEventListener('click', (ev) => {
            if (ev.target.tagName === 'A') {
                navList.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (ev) => {
            if (!navList.classList.contains('open')) return;
            if (!navList.contains(ev.target) && !toggle.contains(ev.target)) {
                navList.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Ensure external links open in new tab and are safe
    function secureExternalLinks() {
        const anchors = qsa('a[href]');
        anchors.forEach(a => {
            try {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:')) return;
                // mark external links to open in new tab
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            } catch (e) { /* ignore */ }
        });
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        setupLazyLoad();
        updateIframeSizes();
        secureExternalLinks();

        // update iframe sizes on resize
        window.addEventListener('resize', debounce(updateIframeSizes, 120));
    });
})();