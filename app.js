/* ============================================
   TRINITY CADENCE — Shared JavaScript
   Run Your Business on Rhythm.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ===== PAGE LOAD FADE-IN =====
  window.addEventListener('load', function () {
    document.body.classList.add('loaded');
  });
  // Fallback if load already fired
  if (document.readyState === 'complete') {
    document.body.classList.add('loaded');
  }

  // ===== MOBILE NAV =====
  var mobileToggle = document.querySelector('.mobile-toggle');
  var navLinks = document.querySelector('.nav-links');
  var mobileOverlay = document.querySelector('.mobile-overlay');

  function openMobileNav() {
    mobileToggle.classList.add('open');
    navLinks.classList.add('show');
    if (mobileOverlay) mobileOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileToggle.classList.remove('open');
    navLinks.classList.remove('show');
    if (mobileOverlay) mobileOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      if (navLinks.classList.contains('show')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  // Close on overlay tap
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileNav);
  }

  // Close on nav link click
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // ===== HEADER SCROLL EFFECT =====
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ===== ACTIVE NAV LINK =====
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html') || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ===== SCROLL ANIMATIONS (IntersectionObserver) =====
  var animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');
  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    animatedElements.forEach(function (el) {
      // Skip hero elements — CSS animation handles them
      if (el.closest('.hero')) return;
      // Elements already in viewport on load should be visible immediately
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });
  } else {
    // Fallback: make everything visible if no IntersectionObserver
    animatedElements.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== ANIMATED NUMBER COUNTERS =====
  var statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = prefix + current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // ===== AUDIENCE TAB SWITCHER =====
  function switchAudience(audience) {
    // Update tabs
    document.querySelectorAll('.audience-tab').forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.getAttribute('data-audience') === audience) {
        tab.classList.add('active');
      }
    });

    // Update content
    document.querySelectorAll('.audience-content').forEach(function (content) {
      content.classList.remove('active');
      if (content.getAttribute('data-audience') === audience) {
        content.classList.add('active');
      }
    });
  }

  // Bind audience tab clicks
  document.querySelectorAll('.audience-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var audience = this.getAttribute('data-audience');
      if (audience) {
        switchAudience(audience);
      }
    });
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = this.nextElementSibling;
      var isOpen = this.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-question').forEach(function (q) {
        q.classList.remove('open');
        q.nextElementSibling.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        this.classList.add('open');
        answer.classList.add('open');
      }
    });
  });

  // ===== CONTACT FORM SUBMISSION =====
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      var btn = form.querySelector('button[type="submit"]');
      var statusEl = document.getElementById('contactFormStatus');
      var originalText = btn.innerHTML;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      if (statusEl) statusEl.style.display = 'none';

      var formData = {
        name: form.querySelector('input[name="name"]') ? form.querySelector('input[name="name"]').value : '',
        email: form.querySelector('input[name="email"]') ? form.querySelector('input[name="email"]').value : '',
        phone: form.querySelector('input[name="phone"]') ? form.querySelector('input[name="phone"]').value : '',
        company: form.querySelector('input[name="company"]') ? form.querySelector('input[name="company"]').value : '',
        service: form.querySelector('select[name="service"]') ? form.querySelector('select[name="service"]').value : '',
        message: form.querySelector('textarea[name="message"]') ? form.querySelector('textarea[name="message"]').value : '',
        source_page: 'Trinity Cadence'
      };

      fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = '#34D399';
            statusEl.textContent = data.message || 'Thank you! We\'ll be in touch within 24 hours.';
          }
          btn.innerHTML = '\u2713 Message Sent!';
          form.reset();
          setTimeout(function () {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error(data.error || 'Something went wrong');
        }
      })
      .catch(function (err) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#F87171';
          statusEl.textContent = err.message || 'Something went wrong. Please try again or email us directly.';
        }
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
    });
  }

  // ===== FLOATING PARTICLES CANVAS =====
  var canvas = document.getElementById('particles-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 40;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 4 + 1.5,
        speedY: -(Math.random() * 0.8 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.3,
        hue: Math.random() > 0.5 ? '124,58,237' : '167,139,250' // violet or light violet
      };
    }

    for (var p = 0; p < particleCount; p++) {
      var particle = createParticle();
      particle.y = Math.random() * canvas.height;
      particles.push(particle);
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p, i) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= 0.0005;

        if (p.y < -10 || p.opacity <= 0) {
          particles[i] = createParticle();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.hue + ',' + p.opacity + ')';
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

});
