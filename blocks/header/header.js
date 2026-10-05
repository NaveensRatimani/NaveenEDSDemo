// media query match that indicates desktop width (inline nav instead of the drawer)
const isDesktop = window.matchMedia('(width >= 1200px)');

const SEARCH_MIN_CHARS = 3;
const SEARCH_MAX_RESULTS = 10;
const SEARCH_INDEXES = ['/query-index.json', '/content/query-index.json'];

/**
 * Fetches the nav fragment. Tries the local preview location first, then the
 * site root (DA/EDS). Relative image paths are resolved against the fragment URL
 * so they work on every page depth.
 * @returns {Promise<Element|null>} body of the parsed fragment
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const base = new URL(resp.url, window.location.href);
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  return doc.body;
}

/**
 * Normalizes a path for comparison: drops the local /content prefix,
 * a trailing .html and a trailing slash.
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  const p = path.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '');
  return p || '/';
}

function currentPath() {
  return normalizePath(window.location.pathname);
}

function linkPath(a) {
  try {
    return normalizePath(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return '';
  }
}

function isWithin(path, base) {
  return path === base || path.startsWith(`${base}/`);
}

/**
 * Text of an element without the text of its nested lists.
 * @param {Element} el
 * @returns {string}
 */
function ownText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/**
 * Keeps track of open popups so one outside-click / Escape handler can close them.
 */
const popups = new Set();

function registerPopup(container, close) {
  popups.add({ container, close });
}

function closePopups(except) {
  popups.forEach(({ container, close }) => {
    if (container !== except) close();
  });
}

document.addEventListener('click', (e) => {
  popups.forEach(({ container, close }) => {
    if (!container.contains(e.target)) close();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopups();
});

/**
 * Builds the locale switcher from a nested list:
 * li (toggle label + flag) > ul > li (country link, language list, flag).
 * @param {Element} list
 * @returns {Element}
 */
function buildLocale(list) {
  const toggleItem = list.querySelector(':scope > li');
  const groups = toggleItem ? [...toggleItem.querySelectorAll(':scope > ul > li')] : [];
  const locale = document.createElement('div');
  locale.className = 'nav-locale';

  // find the language that matches the current page (longest path prefix)
  const path = currentPath();
  let current = null;
  groups.forEach((group) => {
    group.querySelectorAll(':scope > ul a').forEach((a) => {
      const p = linkPath(a);
      if (isWithin(path, p) && (!current || p.length > linkPath(current.link).length)) {
        current = { link: a, group };
      }
    });
  });

  // inline link styled like the source; behaves as a button that toggles the panel
  const button = document.createElement('a');
  button.href = '#nav-locale-panel';
  button.className = 'nav-locale-toggle';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav-locale-panel');
  const flag = (current?.group || toggleItem)?.querySelector(':scope > img');
  if (flag) {
    const icon = flag.cloneNode();
    icon.alt = '';
    icon.className = 'nav-locale-flag';
    button.append(icon);
  }
  const label = document.createElement('span');
  label.className = 'nav-locale-label';
  label.textContent = current ? current.link.textContent.trim() : ownText(toggleItem || list);
  button.append(label);
  button.setAttribute('aria-label', `Change language, current ${label.textContent}`);

  const panel = document.createElement('ul');
  panel.className = 'nav-locale-panel';
  panel.id = 'nav-locale-panel';
  panel.hidden = true;
  groups.forEach((group) => {
    const li = document.createElement('li');
    const img = group.querySelector(':scope > img');
    if (img) {
      img.className = 'nav-locale-flag';
      li.append(img);
    }
    const country = document.createElement('span');
    country.className = 'nav-locale-country';
    const countryLink = group.querySelector(':scope > a');
    country.textContent = countryLink ? countryLink.textContent.trim() : ownText(group);
    li.append(country);
    const languages = group.querySelector(':scope > ul');
    if (languages) {
      languages.className = 'nav-locale-languages';
      languages.querySelectorAll('a').forEach((a) => {
        if (current && a === current.link) a.setAttribute('aria-current', 'true');
        a.lang = a.textContent.trim();
      });
      li.append(languages);
    }
    panel.append(li);
  });

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const open = panel.hidden;
    closePopups(locale);
    setOpen(open);
  });
  button.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });
  registerPopup(locale, () => setOpen(false));

  locale.append(button, panel);
  return locale;
}

/**
 * Builds the sign-in dialog from its content section
 * (heading, sub heading, field labels list, forgot link, submit label).
 * @param {Element} section
 * @returns {Element}
 */
function buildSignIn(section) {
  const dialog = document.createElement('div');
  dialog.className = 'nav-signin';
  dialog.setAttribute('role', 'dialog');
  dialog.hidden = true;

  const card = document.createElement('div');
  card.className = 'nav-signin-card';
  const heading = section.querySelector('h1, h2');
  if (heading) {
    heading.id = 'nav-signin-title';
    dialog.setAttribute('aria-labelledby', heading.id);
    card.append(heading);
  }
  const subheading = section.querySelector('h3, h4');
  if (subheading) card.append(subheading);

  const form = document.createElement('form');
  form.className = 'nav-signin-form';
  const fields = [...section.querySelectorAll('ul > li')].map((li) => li.textContent.trim());
  fields.forEach((name, i) => {
    const input = document.createElement('input');
    input.type = /password/i.test(name) ? 'password' : 'text';
    input.name = input.type === 'password' ? 'password' : 'username';
    input.autocomplete = input.type === 'password' ? 'current-password' : 'username';
    input.placeholder = name;
    input.setAttribute('aria-label', name);
    input.id = `nav-signin-field-${i}`;
    form.append(input);
  });
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const forgot = paragraphs.find((p) => p.querySelector('a'));
  if (forgot) {
    forgot.className = 'nav-signin-forgot';
    form.append(forgot);
  }
  const submitLabel = paragraphs.find((p) => !p.querySelector('a'));
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-signin-submit';
  submit.textContent = submitLabel ? submitLabel.textContent.trim() : 'Sign In';
  form.append(submit);
  // there is no authentication backend; keep the visitor on the page
  form.addEventListener('submit', (e) => e.preventDefault());
  card.append(form);
  dialog.append(card);
  return dialog;
}

/**
 * Builds the utility bar (sign-in trigger + locale switcher).
 * @param {Element} section
 * @param {Element|null} signIn the sign-in dialog
 * @returns {Element}
 */
function buildUtility(section, signIn) {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  const inner = document.createElement('div');
  inner.className = 'nav-utility-inner';

  const trigger = section.querySelector(':scope > p a');
  if (trigger) {
    // inline link styled like the source; behaves as a button that opens the dialog
    const button = trigger;
    button.className = 'nav-signin-toggle';
    button.setAttribute('role', 'button');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    inner.append(button);
    if (signIn) {
      const container = document.createElement('div');
      container.className = 'nav-signin-container';
      button.replaceWith(container);
      container.append(button, signIn);
      const setOpen = (open) => {
        signIn.hidden = !open;
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) signIn.querySelector('input')?.focus();
      };
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const open = signIn.hidden;
        closePopups(container);
        setOpen(open);
      });
      button.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
      registerPopup(container, () => setOpen(false));
    }
  }

  const list = section.querySelector(':scope > ul');
  if (list) inner.append(buildLocale(list));
  utility.append(inner);
  return utility;
}

/**
 * Builds the brand (logo) area.
 * @param {Element} section
 * @returns {Element}
 */
function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const link = section.querySelector('a');
  if (link) {
    link.className = '';
    const img = link.querySelector('img');
    if (img) {
      img.loading = 'eager';
      link.setAttribute('aria-label', img.alt || 'Home');
    }
    brand.append(link);
  } else {
    brand.append(...section.childNodes);
  }
  return brand;
}

/**
 * Builds the primary navigation list and marks the current section.
 * A link to the home page (same target as the logo) is flagged so it can be
 * shown in the mobile menu only, and is only current on the home page itself.
 * @param {Element} section
 * @param {string} homePath path the logo links to
 * @returns {Element}
 */
function buildSections(section, homePath) {
  const sections = document.createElement('nav');
  sections.className = 'nav-sections';
  sections.setAttribute('aria-label', 'Main');
  const list = section.querySelector('ul');
  if (list) {
    const path = currentPath();
    list.querySelectorAll('li > a').forEach((a) => {
      const target = linkPath(a);
      const isHome = target === homePath;
      if (isHome) a.classList.add('nav-home');
      if (isHome ? path === target : isWithin(path, target)) {
        a.setAttribute('aria-current', 'page');
        a.parentElement.classList.add('active');
      }
    });
    sections.append(list);
  }
  return sections;
}

let searchIndex;

/**
 * Loads the site query index once (first index that responds wins).
 * @returns {Promise<Array>}
 */
async function loadSearchIndex() {
  if (!searchIndex) {
    searchIndex = (async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of SEARCH_INDEXES) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const resp = await fetch(url);
          if (resp.ok) {
            // eslint-disable-next-line no-await-in-loop
            const json = await resp.json();
            return (json.data || []).filter((row) => row.title && row.path);
          }
        } catch (e) {
          // try the next index
        }
      }
      return [];
    })();
  }
  return searchIndex;
}

/**
 * Appends text to a parent, wrapping case-insensitive matches of term in <mark>.
 */
function appendHighlighted(parent, text, term) {
  const lower = text.toLowerCase();
  const needle = term.toLowerCase();
  let pos = 0;
  let idx = lower.indexOf(needle);
  while (idx !== -1) {
    if (idx > pos) parent.append(text.slice(pos, idx));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(idx, idx + needle.length);
    parent.append(mark);
    pos = idx + needle.length;
    idx = lower.indexOf(needle, pos);
  }
  if (pos < text.length) parent.append(text.slice(pos));
}

/**
 * Builds the search box with type-ahead results from the query index.
 * @param {Element} section
 * @returns {Element}
 */
function buildSearch(section) {
  const label = section.textContent.trim() || 'Search';
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = label;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', label);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', 'nav-search-results');
  input.setAttribute('aria-autocomplete', 'list');

  const icon = document.createElement('span');
  icon.className = 'nav-search-icon';
  icon.setAttribute('aria-hidden', 'true');

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'nav-search-clear';
  clear.setAttribute('aria-label', 'Clear');
  clear.hidden = true;

  const results = document.createElement('div');
  results.className = 'nav-search-results';
  results.id = 'nav-search-results';
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'Search results');
  results.hidden = true;

  const setOpen = (open) => {
    results.hidden = !open;
    input.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const render = async () => {
    const term = input.value.trim();
    clear.hidden = !input.value;
    if (term.length < SEARCH_MIN_CHARS) {
      setOpen(false);
      return;
    }
    const rows = await loadSearchIndex();
    if (input.value.trim() !== term) return;
    const needle = term.toLowerCase();
    const matches = rows
      .filter((row) => `${row.title} ${row.description || ''}`.toLowerCase().includes(needle))
      .slice(0, SEARCH_MAX_RESULTS);
    results.textContent = '';
    matches.forEach((row) => {
      const a = document.createElement('a');
      a.className = 'nav-search-item';
      a.href = row.path;
      a.setAttribute('role', 'option');
      appendHighlighted(a, row.title, term);
      results.append(a);
    });
    setOpen(matches.length > 0);
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', () => {
    loadSearchIndex();
    if (results.children.length && input.value.trim().length >= SEARCH_MIN_CHARS) setOpen(true);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && results.firstElementChild) {
      e.preventDefault();
      setOpen(true);
      results.firstElementChild.focus();
    }
  });
  results.addEventListener('keydown', (e) => {
    const item = document.activeElement;
    if (e.key === 'ArrowDown' && item.nextElementSibling) {
      e.preventDefault();
      item.nextElementSibling.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (item.previousElementSibling || input).focus();
    }
  });
  clear.addEventListener('click', () => {
    input.value = '';
    clear.hidden = true;
    setOpen(false);
    input.focus();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = results.querySelector('a');
    if (first && !results.hidden) window.location.href = first.href;
  });

  form.append(icon, input, clear, results);
  registerPopup(form, () => setOpen(false));
  return form;
}

/**
 * Shrinks the header once the page is scrolled.
 * @param {Element} wrapper
 */
function watchScroll(wrapper) {
  const update = () => wrapper.classList.toggle('scrolled', window.scrollY > 0);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/**
 * Toggles the mobile drawer. The open drawer pushes the header and the page
 * to the right (wrapper and body classes drive the transforms).
 * @param {Element} nav
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? forceExpanded : nav.getAttribute('aria-expanded') !== 'true';
  const open = expanded && !isDesktop.matches;
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  nav.closest('.nav-wrapper')?.classList.toggle('menu-open', open);
  document.body.classList.toggle('nav-open', open);
  if (button) {
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [utilitySection, brandSection, navSection, searchSection, signInSection] = [...fragment.querySelectorAll(':scope > div')];

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  const signIn = signInSection ? buildSignIn(signInSection) : null;
  if (utilitySection) wrapper.append(buildUtility(utilitySection, signIn));

  const nav = document.createElement('div');
  nav.id = 'nav';
  nav.className = 'nav-main';
  nav.setAttribute('aria-expanded', 'false');

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  const hamburgerButton = document.createElement('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  hamburgerButton.setAttribute('aria-expanded', 'false');
  hamburgerButton.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburgerButton.addEventListener('click', () => toggleMenu(nav));
  hamburger.append(hamburgerButton);
  // a tap anywhere outside the drawer (or Escape) closes it
  registerPopup(nav, () => {
    if (nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, false);
  });

  nav.append(hamburger);
  const brand = brandSection ? buildBrand(brandSection) : null;
  if (brand) nav.append(brand);
  const homeLink = brand?.querySelector('a');
  if (navSection) nav.append(buildSections(navSection, homeLink ? linkPath(homeLink) : '/'));
  if (searchSection) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    tools.append(buildSearch(searchSection));
    nav.append(tools);
  }

  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  bar.append(nav);
  wrapper.append(bar);
  block.append(wrapper);

  watchScroll(wrapper);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closePopups();
  });
}
