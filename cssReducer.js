function parseCss(cssText) {
  // Usuwamy ewentualne komentarze typu /* ... */
  let cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, "").trim();

  // Rozbijamy na bloki @media
  // Zakładamy, że każda sekcja @media kończy się znakiem "}" na odpowiednim poziomie
  let mediaRegex = /@media[^{]+\{([\s\S]*?)\}\s*}/g;
  let mediaBlocks = [];
  let match;

  while ((match = mediaRegex.exec(cleanCss)) !== null) {
    // Cały napis @media (max-width: 600px) { ... }
    // match[0] = zawartość z @media włącznie
    // match[1] = wszystko między klamrami {} wewnątrz @media
    let fullMedia = match[0];
    let content = match[1];

    // Znajdź definicję, np. @media (max-width: 600px)
    let mediaDefinition = fullMedia.match(/@media[^{]+/)[0].trim();

    // Parsowanie reguł w danym media:
    let rules = parseRules(content);

    mediaBlocks.push({
      media: mediaDefinition,
      rules: rules,
    });
  }

  return mediaBlocks;
}

// Funkcja do parsowania reguł CSS wewnątrz bloku
function parseRules(blockContent) {
  // Rozbijamy na definicje selektorów np. ".classA {...}"
  // Bardzo uproszczony rozdział:
  let ruleRegex = /([^{}]+)\{([^}]*)\}/g;
  let rulesObj = {};
  let match;

  while ((match = ruleRegex.exec(blockContent)) !== null) {
    let selector = match[1].trim(); // np. ".classA"
    let declarations = match[2].trim(); // np. "display: flex; color: red;"
    let declObj = {};

    // Rozbijamy deklaracje na pary klucz: wartość
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

// Funkcja główna analizująca i wyciągająca wspólne właściwości
function extractGlobalStyles(mediaBlocks) {
  // Wyszukujemy unikalną listę wszystkich selektorów
  let allSelectors = new Set();
  for (let block of mediaBlocks) {
    Object.keys(block.rules).forEach((sel) => allSelectors.add(sel));
  }

  let globalRules = {}; // będzie przechowywać wspólne właściwości

  // Dla każdego selektora sprawdzamy, czy występuje w każdym media
  for (let sel of allSelectors) {
    // Sprawdzamy wystąpienie selektora w każdym bloku
    let allHaveSelector = mediaBlocks.every((b) => b.rules[sel]);
    if (!allHaveSelector) continue; // jeżeli nie występuje wszędzie, pomijamy globalne przenoszenie

    // Pobieramy wszystkie właściwości z pierwszego media
    let firstDecls = mediaBlocks[0].rules[sel];
    for (let property in firstDecls) {
      let value = firstDecls[property];

      // Sprawdzamy, czy w każdym media jest to samo value
      let hasSameValueInAll = mediaBlocks.every((b) => {
        return b.rules[sel][property] === value;
      });

      if (hasSameValueInAll) {
        // Dodajemy do global
        if (!globalRules[sel]) {
          globalRules[sel] = {};
        }
        globalRules[sel][property] = value;
      }
    }
  }

  // Usuwamy te globalne właściwości z poszczególnych @media
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

// Funkcja do generowania finalnego CSS z global + media blocks
function generateCss(globalRules, mediaBlocks) {
  let lines = [];

  // Najpierw style globalne:
  for (let sel in globalRules) {
    lines.push(`${sel} {`);
    for (let prop in globalRules[sel]) {
      lines.push(`  ${prop}: ${globalRules[sel][prop]};`);
    }
    lines.push(`}\n`);
  }

  // Potem każdy blok @media
  for (let mb of mediaBlocks) {
    lines.push(`${mb.media} {`);
    for (let sel in mb.rules) {
      // Jeżeli reguła pusta, pomijamy
      let props = mb.rules[sel];
      let propKeys = Object.keys(props);
      if (!propKeys.length) continue;

      lines.push(`  ${sel} {`);
      for (let prop of propKeys) {
        lines.push(`    ${prop}: ${props[prop]};`);
      }
      lines.push(`  }`);
    }
    lines.push(`}\n`);
  }

  return lines.join("\n");
}

// ======= paste media here =======
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

// console.log("===== GLOBAL =====");
// console.log(globalRules);
console.log("===== NOWY CSS =====");
console.log(newCss);
