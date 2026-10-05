/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsUpnextParser from './parsers/cards-upnext.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-upnext': cardsUpnextParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine',
  description: 'WKND magazine article pages',
  urls: [
    'https://wknd.site/us/en/magazine/arctic-surfing.html',
  ],
  blocks: [
    {
      name: 'cards-upnext',
      instances: ['.list.cmp-list--upnext'],
    },
  ],
  sections: [
    {
      id: 's1',
      name: 'Lead image',
      selector: ['main.cmp-layout-container--fixed .image:first-of-type', '.image'],
      style: null,
      blocks: [],
      defaultContent: ['.image'],
    },
    {
      id: 's2',
      name: 'Breadcrumb',
      selector: ['.breadcrumb.cmp-breadcrumb--fixed', '.breadcrumb'],
      style: null,
      blocks: [],
      defaultContent: ['.breadcrumb'],
    },
    {
      id: 's3',
      name: 'Article body',
      selector: ['.text.cmp-text', '.title.cmp-title--article'],
      style: null,
      blocks: [],
      defaultContent: ['.text', '.title', '.image'],
    },
    {
      id: 's3b',
      name: 'Author byline',
      selector: ['.experiencefragment:has(.cmp-byline)'],
      style: 'byline',
      blocks: [],
      defaultContent: ['.experiencefragment'],
    },
    {
      id: 's4',
      name: 'Sidebar (Share this story / Up next)',
      selector: ['.cmp-layoutcontainer--sidebar', '.sharing', '.list.cmp-list--upnext'],
      style: 'sidebar',
      blocks: ['cards-upnext'],
      defaultContent: ['.sharing'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections after (sections only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks inserted here)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by a prior parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root/homepage to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
