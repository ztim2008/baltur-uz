/* Baltur Uzbekistan — landing scripts (vanilla, no dependencies) */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  html.classList.add('js');

  /* ---------------------------------------------------------------------
     Header: shadow on scroll
     --------------------------------------------------------------------- */
  var header = doc.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  var burger = doc.getElementById('burger');
  var mobileNav = doc.getElementById('mobileNav');

  function closeMenu() {
    if (!burger || !mobileNav) return;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    mobileNav.hidden = true;
    doc.body.classList.remove('is-locked');
  }

  function openMenu() {
    if (!burger || !mobileNav) return;
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    mobileNav.hidden = false;
    doc.body.classList.add('is-locked');
  }

  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });

    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        burger.focus();
      }
    });

    var mq = window.matchMedia('(min-width: 881px)');
    var onDesktop = function (event) { if (event.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onDesktop);
    else if (mq.addListener) mq.addListener(onDesktop);
  }

  /* ---------------------------------------------------------------------
     Catalog: filters + search
     --------------------------------------------------------------------- */
  var grid = doc.getElementById('catalogGrid');
  var empty = doc.getElementById('catalogEmpty');
  var count = doc.getElementById('catalogCount');
  var tabs = doc.getElementById('catalogTabs');
  var search = doc.getElementById('headerSearch');
  var searchForm = doc.getElementById('headerSearchForm');
  var catalogSection = doc.getElementById('catalog');

  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.card')) : [];
  var activeFilter = 'all';

  function normalize(value) {
    return (value || '').toLowerCase().replace(/ё/g, 'е').trim();
  }

  function applyFilter() {
    if (!cards.length) return;
    var query = normalize(search ? search.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var hay = normalize(
        (card.getAttribute('data-title') || '') + ' ' +
        card.textContent
      );
      var matchesFilter = activeFilter === 'all' || card.getAttribute('data-cat') === activeFilter;
      var matchesQuery = !query || hay.indexOf(query) !== -1;
      var show = matchesFilter && matchesQuery;
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    if (count) {
      count.textContent = query
        ? 'Найдено: ' + visible
        : 'Показано ' + visible + ' из ' + cards.length;
    }
    if (empty) empty.hidden = visible !== 0;
  }

  function setFilter(filter, updateTabs) {
    activeFilter = filter;
    if (updateTabs && tabs) {
      Array.prototype.forEach.call(tabs.querySelectorAll('.tab'), function (tab) {
        var isActive = tab.getAttribute('data-filter') === filter;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });
    }
    applyFilter();
  }

  if (tabs) {
    tabs.addEventListener('click', function (event) {
      var tab = event.target.closest('.tab');
      if (!tab) return;
      setFilter(tab.getAttribute('data-filter'), true);
    });
  }

  Array.prototype.forEach.call(doc.querySelectorAll('[data-filter-link]'), function (link) {
    link.addEventListener('click', function () {
      setFilter(link.getAttribute('data-filter-link'), true);
    });
  });

  if (search) {
    search.addEventListener('input', function () {
      if (search.value) setFilter('all', true);
      applyFilter();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
      if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (search) search.blur();
    });
  }

  applyFilter();

  /* ---------------------------------------------------------------------
     "Запросить цену" → prefill the request form
     --------------------------------------------------------------------- */
  var form = doc.getElementById('leadForm');
  var productSelect = doc.getElementById('leadProduct');
  var comment = doc.getElementById('leadComment');
  var nameInput = doc.getElementById('leadName');

  var productMap = [
    [/подбор|проект/i, 'Подбор оборудования под проект'],
    [/каталог/i, 'Запрос полного каталога'],
    [/сервис|запчаст/i, 'Сервис и запчасти'],
    [/крышн/i, 'Котёл для крышной котельной'],
    [/котл/i, 'Промышленный котёл'],
    [/дизел|btl|tbl/i, 'Дизельная горелка'],
    [/газов|btg|tbg|bpm|премикс/i, 'Газовая горелка']
  ];

  function selectProduct(text) {
    if (!productSelect || !text) return;
    var preset = '';
    for (var i = 0; i < productMap.length; i += 1) {
      if (productMap[i][0].test(text)) { preset = productMap[i][1]; break; }
    }
    if (preset) {
      Array.prototype.forEach.call(productSelect.options, function (option) {
        if (option.text === preset) productSelect.value = option.value || option.text;
      });
      if (!productSelect.value) productSelect.value = preset;
    }
    if (comment) {
      comment.value = 'Интересует: ' + text;
    }
  }

  Array.prototype.forEach.call(doc.querySelectorAll('[data-product]'), function (trigger) {
    trigger.addEventListener('click', function () {
      var text = trigger.getAttribute('data-product');
      selectProduct(text);

      var contacts = doc.getElementById('contacts');
      if (contacts) {
        if (trigger.tagName !== 'A') {
          contacts.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.setTimeout(function () {
          if (nameInput) nameInput.focus({ preventScroll: true });
        }, 650);
      }
    });
  });

  /* ---------------------------------------------------------------------
     Lead form
     --------------------------------------------------------------------- */
  var phoneInput = doc.getElementById('leadPhone');
  var phoneField = phoneInput ? phoneInput.closest('.field') : null;
  var phoneError = doc.getElementById('phoneError');
  var consent = doc.getElementById('leadConsent');
  var submit = doc.getElementById('leadSubmit');
  var status = doc.getElementById('formStatus');

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message || '';
    status.className = 'form__status' + (type ? ' is-' + type : '');
  }

  function validPhone(value) {
    var digits = (value || '').replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      phoneInput.value = phoneInput.value.replace(/[^\d+()\-\s]/g, '');
      if (validPhone(phoneInput.value)) {
        if (phoneField) phoneField.classList.remove('has-error');
        phoneInput.removeAttribute('aria-invalid');
        if (phoneError) phoneError.hidden = true;
      }
    });
  }

  function collectLead() {
    return {
      name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      product: productSelect ? productSelect.value : '',
      comment: comment ? comment.value.trim() : '',
      page: window.location.href,
      sentAt: new Date().toISOString()
    };
  }

  function showFallback() {
    setStatus(
      'Не удалось отправить заявку автоматически. Позвоните: +998 98 210 03 03 или напишите в Telegram: @httpsmasterkotlovuz.',
      'error'
    );
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus('');

      var ok = true;

      if (!validPhone(phoneInput ? phoneInput.value : '')) {
        ok = false;
        if (phoneField) phoneField.classList.add('has-error');
        if (phoneInput) {
          phoneInput.setAttribute('aria-invalid', 'true');
          phoneInput.focus();
        }
        if (phoneError) phoneError.hidden = false;
      }

      if (consent && !consent.checked) {
        ok = false;
        consent.closest('.checkbox').classList.add('has-error');
      } else if (consent) {
        consent.closest('.checkbox').classList.remove('has-error');
      }

      if (!ok) {
        setStatus('Проверьте, пожалуйста, телефон и согласие на обработку данных.', 'error');
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Отправляем…';
      }

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectLead())
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (data) {
          if (!data || data.ok !== true) throw new Error('Bad response');
          form.reset();
          setStatus('Спасибо! Заявка отправлена — свяжемся с вами в течение 15 минут.', 'success');
          if (window.gtag) window.gtag('event', 'generate_lead', { form: 'baltur_uz' });
        })
        .catch(function () {
          showFallback();
        })
        .then(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = 'Отправить заявку';
          }
        });
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealTargets = doc.querySelectorAll(
    '.section-head, .card, .feature, .about__media, .about__content, .band__left, .band__right, .contacts__info, .contacts__form-wrap'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealTargets, function (el) {
      el.setAttribute('data-reveal', '');
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Active navigation link
     --------------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.header-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return doc.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------------------------------------------------------------------
     Footer year + smooth anchor offset
     --------------------------------------------------------------------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
})();
