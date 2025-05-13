function parseCss(cssText) {
  // Remove any /* ... */ style comments
  let cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, "").trim();

  // Split into @media blocks
  // We assume each @media section ends with a matching '}' at the appropriate nesting level
  let mediaRegex = /@media[^\{]+\{([\s\S]*?)\}\s*\}/g;
  let mediaBlocks = [];
  let match;

  while ((match = mediaRegex.exec(cleanCss)) !== null) {
    // match[0] = full '@media ... { ... }' string
    // match[1] = content inside the braces {}
    let fullMedia = match[0];
    let content = match[1];

    // Find the media definition, e.g., '@media (max-width: 600px)'
    let mediaDefinition = fullMedia.match(/@media[^\{]+/)[0].trim();

    // Parse rules within this media block:
    let rules = parseRules(content);

    mediaBlocks.push({
      media: mediaDefinition,
      rules: rules,
    });
  }

  return mediaBlocks;
}

// Function to parse CSS rules inside a block
function parseRules(blockContent) {
  // Split into selector definitions, e.g., '.classA { ... }'
  // A very simplified split:
  let ruleRegex = /([^{}]+)\{([^}]*)\}/g;
  let rulesObj = {};
  let match;

  while ((match = ruleRegex.exec(blockContent)) !== null) {
    let selector = match[1].trim(); // e.g., '.classA'
    let declarations = match[2].trim(); // e.g., 'display: flex; color: red;'
    let declObj = {};

    // Split declarations into property:value pairs
    let declPairs = declarations.split(";").filter(Boolean);
    for (let pair of declPairs) {
      let [prop, val] = pair.split(":");
      if (prop && val) {
        let property = prop.trim();
        let value = val.trim();
        declObj[property] = value;
      }
    }

    rulesObj[selector] = declObj;
  }

  return rulesObj;
}

// Main function to analyze and extract common properties across media blocks
function extractGlobalStyles(mediaBlocks) {
  // Build a unique list of all selectors
  let allSelectors = new Set();
  for (let block of mediaBlocks) {
    Object.keys(block.rules).forEach((sel) => allSelectors.add(sel));
  }

  let globalRules = {};

  // For each selector, check if it appears in every media block
  for (let sel of allSelectors) {
    let allHaveSelector = mediaBlocks.every((b) => b.rules[sel]);
    if (!allHaveSelector) continue;

    // Get all properties from the first media block
    let firstDecls = mediaBlocks[0].rules[sel];
    for (let property in firstDecls) {
      let value = firstDecls[property];

      // Check if every media block has the same value
      let hasSameValueInAll = mediaBlocks.every(
        (b) => b.rules[sel][property] === value
      );

      if (hasSameValueInAll) {
        // Add to global rules
        if (!globalRules[sel]) globalRules[sel] = {};
        globalRules[sel][property] = value;
      }
    }
  }

  // Remove these global properties from each @media block
  for (let sel in globalRules) {
    for (let property in globalRules[sel]) {
      for (let block of mediaBlocks) {
        if (block.rules[sel]) {
          delete block.rules[sel][property];
        }
      }
    }
  }

  return globalRules;
}

// Function to generate final CSS from global rules and media blocks
function generateCss(globalRules, mediaBlocks) {
  let lines = [];

  // First, global styles:
  for (let sel in globalRules) {
    lines.push(`${sel} {`);
    for (let prop in globalRules[sel]) {
      lines.push(`  ${prop}: ${globalRules[sel][prop]};`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  // Then each @media block
  for (let mb of mediaBlocks) {
    lines.push(`${mb.media} {`);
    for (let sel in mb.rules) {
      let props = mb.rules[sel];
      let propKeys = Object.keys(props);
      if (!propKeys.length) continue;

      lines.push(`  ${sel} {`);
      for (let prop of propKeys) {
        lines.push(`    ${prop}: ${props[prop]};`);
      }
      lines.push(`  }`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join("\n");
}

// ======= Paste media here =======
let cssText = `
  @media (max-width: 600px) {
    .container-home {
      display: flex;
      color: red;
    }
    .box {
      margin: 10px;
    }
  }
  
  @media (min-width: 601px) {
    .container-home {
      display: flex;
      color: red;
      justify-content: center;
    }
    .box {
      margin: 20px;
    }
  }
  `;

let mediaBlocks = parseCss(cssText);
let globalRules = extractGlobalStyles(mediaBlocks);
let newCss = generateCss(globalRules, mediaBlocks);

console.log("===== NEW CSS =====");
console.log(newCss);
