/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-magazine-landing.js
  var import_magazine_landing_exports = {};
  __export(import_magazine_landing_exports, {
    default: () => import_magazine_landing_default
  });

  // tools/importer/parsers/columns-featured.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const textCell = [];
    const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, a.button, [class*="action"] a'));
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);
    if (!image && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse2(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll("li.cmp-image-list__item"));
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".cmp-image-list__item-content, article"));
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const contentCell = [];
      const titleLink = card.querySelector('.cmp-image-list__item-title-link, a[class*="title"]');
      const title = card.querySelector(".cmp-image-list__item-title, h2, h3, h4");
      const description = card.querySelector('.cmp-image-list__item-description, [class*="description"], p');
      if (titleLink) contentCell.push(titleLink);
      else if (title) contentCell.push(title);
      if (description) contentCell.push(description);
      if (image || contentCell.length) {
        cells.push([image || "", contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-members.js
  function parse3(element, { document: document2 }) {
    const teasers = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(".teaser.cmp-teaser--secure")) {
      teasers.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    teasers.forEach((teaser) => {
      const image = teaser.querySelector(".cmp-teaser__image img, img");
      const contentCell = [];
      const title = teaser.querySelector(".cmp-teaser__title, h2, h3");
      const description = teaser.querySelector(".cmp-teaser__description");
      const cta = teaser.querySelector(".cmp-teaser__action-container");
      if (title) {
        const heading = document2.createElement("h3");
        heading.textContent = title.textContent.trim();
        contentCell.push(heading);
      }
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        contentCell.push(p);
      }
      if (cta && cta.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = cta.textContent.trim();
        contentCell.push(p);
      }
      if (image || contentCell.length) {
        cells.push([image || "", contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-members", cells });
    teasers.slice(1).forEach((teaser) => teaser.remove());
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SITE_HOSTS = ["wknd.site", "www.wknd.site"];
  function flattenListFilterTabs(element) {
    element.querySelectorAll(".tabs.panelcontainer").forEach((tabs) => {
      const allList = tabs.querySelector(".cmp-tabs__tabpanel .image-list");
      if (allList) tabs.replaceWith(allList);
    });
  }
  function rewriteInternalLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
      let url;
      try {
        url = new URL(href, "https://wknd.site");
      } catch (e) {
        return;
      }
      if (!SITE_HOSTS.includes(url.hostname) || !/\.html$/i.test(url.pathname)) return;
      const path = url.pathname.replace(/\.html$/i, "");
      a.setAttribute("href", `${path}${url.search}${url.hash}`);
    });
  }
  function boldStandaloneButtons(element, document2) {
    element.querySelectorAll(".button:not(.cmp-button--icononly) a.cmp-button").forEach((a) => {
      const label = (a.querySelector(".cmp-button__text") || a).textContent.trim();
      if (!label || a.closest("strong")) return;
      a.textContent = label;
      const strong = document2.createElement("strong");
      a.replaceWith(strong);
      strong.append(a);
    });
  }
  function markUnderlinedPageTitles(element, document2) {
    element.querySelectorAll(".title.cmp-title--underline").forEach((title) => {
      if (!title.querySelector("h1")) return;
      const metadata = WebImporter.Blocks.createBlock(document2, {
        name: "Section Metadata",
        cells: { style: "title-underline" }
      });
      title.after(metadata);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      flattenListFilterTabs(element);
      boldStandaloneButtons(element, payload.document);
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "#toggleNav",
        "#mobileNav",
        // content fragment titles repeat the page title and are always hidden on the source
        ".cmp-contentfragment__title"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      markUnderlinedPageTitles(element, payload.document);
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "iframe",
        "meta",
        "link",
        "noscript"
      ]);
      rewriteInternalLinks(element);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-magazine-landing.js
  var parsers = {
    "columns-featured": parse,
    "cards-article": parse2,
    "cards-members": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "magazine-landing",
    "description": "WKND magazine landing: featured article, article grid, members-only teasers",
    "urls": [
      "https://wknd.site/us/en/magazine.html"
    ],
    "blocks": [
      {
        "name": "columns-featured",
        "instances": [
          ".teaser.cmp-teaser--featured"
        ]
      },
      {
        "name": "cards-article",
        "instances": [
          ".image-list.list"
        ]
      },
      {
        "name": "cards-members",
        "instances": [
          ".teaser.cmp-teaser--secure"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Page title",
        "selector": [
          ".title"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".title"
        ]
      },
      {
        "id": "s2",
        "name": "Featured Article",
        "selector": [
          ".teaser.cmp-teaser--featured"
        ],
        "style": "grey",
        "blocks": [
          "columns-featured"
        ],
        "defaultContent": []
      },
      {
        "id": "s3",
        "name": "All Articles",
        "selector": [
          ".title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [
          ".title.cmp-title--underline"
        ]
      },
      {
        "id": "s4",
        "name": "Members Only",
        "selector": [
          ".image-list.list + .title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-members"
        ],
        "defaultContent": [
          ".title.cmp-title--underline",
          ".text"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_magazine_landing_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_magazine_landing_exports);
})();
