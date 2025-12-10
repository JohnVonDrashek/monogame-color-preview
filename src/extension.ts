import * as vscode from 'vscode';

// Regex patterns for MonoGame/XNA color constructors
const COLOR_PATTERNS = [
  // new Color(r, g, b) or new Color(r, g, b, a)
  /new\s+Color\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+))?\s*\)/g,
  // Color.FromNonPremultiplied(r, g, b, a)
  /Color\.FromNonPremultiplied\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
];

// Pattern specifically for new Color() constructor (for code actions)
const NEW_COLOR_PATTERN = /new\s+Color\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+))?\s*\)/g;

// Named MonoGame colors with their RGB values
const NAMED_COLORS: Record<string, [number, number, number]> = {
  'TransparentBlack': [0, 0, 0],
  'Transparent': [0, 0, 0],
  'AliceBlue': [240, 248, 255],
  'AntiqueWhite': [250, 235, 215],
  'Aqua': [0, 255, 255],
  'Aquamarine': [127, 255, 212],
  'Azure': [240, 255, 255],
  'Beige': [245, 245, 220],
  'Bisque': [255, 228, 196],
  'Black': [0, 0, 0],
  'BlanchedAlmond': [255, 235, 205],
  'Blue': [0, 0, 255],
  'BlueViolet': [138, 43, 226],
  'Brown': [165, 42, 42],
  'BurlyWood': [222, 184, 135],
  'CadetBlue': [95, 158, 160],
  'Chartreuse': [127, 255, 0],
  'Chocolate': [210, 105, 30],
  'Coral': [255, 127, 80],
  'CornflowerBlue': [100, 149, 237],
  'Cornsilk': [255, 248, 220],
  'Crimson': [220, 20, 60],
  'Cyan': [0, 255, 255],
  'DarkBlue': [0, 0, 139],
  'DarkCyan': [0, 139, 139],
  'DarkGoldenrod': [184, 134, 11],
  'DarkGray': [169, 169, 169],
  'DarkGreen': [0, 100, 0],
  'DarkKhaki': [189, 183, 107],
  'DarkMagenta': [139, 0, 139],
  'DarkOliveGreen': [85, 107, 47],
  'DarkOrange': [255, 140, 0],
  'DarkOrchid': [153, 50, 204],
  'DarkRed': [139, 0, 0],
  'DarkSalmon': [233, 150, 122],
  'DarkSeaGreen': [143, 188, 139],
  'DarkSlateBlue': [72, 61, 139],
  'DarkSlateGray': [47, 79, 79],
  'DarkTurquoise': [0, 206, 209],
  'DarkViolet': [148, 0, 211],
  'DeepPink': [255, 20, 147],
  'DeepSkyBlue': [0, 191, 255],
  'DimGray': [105, 105, 105],
  'DodgerBlue': [30, 144, 255],
  'Firebrick': [178, 34, 34],
  'FloralWhite': [255, 250, 240],
  'ForestGreen': [34, 139, 34],
  'Fuchsia': [255, 0, 255],
  'Gainsboro': [220, 220, 220],
  'GhostWhite': [248, 248, 255],
  'Gold': [255, 215, 0],
  'Goldenrod': [218, 165, 32],
  'Gray': [128, 128, 128],
  'Green': [0, 128, 0],
  'GreenYellow': [173, 255, 47],
  'Honeydew': [240, 255, 240],
  'HotPink': [255, 105, 180],
  'IndianRed': [205, 92, 92],
  'Indigo': [75, 0, 130],
  'Ivory': [255, 255, 240],
  'Khaki': [240, 230, 140],
  'Lavender': [230, 230, 250],
  'LavenderBlush': [255, 240, 245],
  'LawnGreen': [124, 252, 0],
  'LemonChiffon': [255, 250, 205],
  'LightBlue': [173, 216, 230],
  'LightCoral': [240, 128, 128],
  'LightCyan': [224, 255, 255],
  'LightGoldenrodYellow': [250, 250, 210],
  'LightGray': [211, 211, 211],
  'LightGreen': [144, 238, 144],
  'LightPink': [255, 182, 193],
  'LightSalmon': [255, 160, 122],
  'LightSeaGreen': [32, 178, 170],
  'LightSkyBlue': [135, 206, 250],
  'LightSlateGray': [119, 136, 153],
  'LightSteelBlue': [176, 196, 222],
  'LightYellow': [255, 255, 224],
  'Lime': [0, 255, 0],
  'LimeGreen': [50, 205, 50],
  'Linen': [250, 240, 230],
  'Magenta': [255, 0, 255],
  'Maroon': [128, 0, 0],
  'MediumAquamarine': [102, 205, 170],
  'MediumBlue': [0, 0, 205],
  'MediumOrchid': [186, 85, 211],
  'MediumPurple': [147, 112, 219],
  'MediumSeaGreen': [60, 179, 113],
  'MediumSlateBlue': [123, 104, 238],
  'MediumSpringGreen': [0, 250, 154],
  'MediumTurquoise': [72, 209, 204],
  'MediumVioletRed': [199, 21, 133],
  'MidnightBlue': [25, 25, 112],
  'MintCream': [245, 255, 250],
  'MistyRose': [255, 228, 225],
  'Moccasin': [255, 228, 181],
  'NavajoWhite': [255, 222, 173],
  'Navy': [0, 0, 128],
  'OldLace': [253, 245, 230],
  'Olive': [128, 128, 0],
  'OliveDrab': [107, 142, 35],
  'Orange': [255, 165, 0],
  'OrangeRed': [255, 69, 0],
  'Orchid': [218, 112, 214],
  'PaleGoldenrod': [238, 232, 170],
  'PaleGreen': [152, 251, 152],
  'PaleTurquoise': [175, 238, 238],
  'PaleVioletRed': [219, 112, 147],
  'PapayaWhip': [255, 239, 213],
  'PeachPuff': [255, 218, 185],
  'Peru': [205, 133, 63],
  'Pink': [255, 192, 203],
  'Plum': [221, 160, 221],
  'PowderBlue': [176, 224, 230],
  'Purple': [128, 0, 128],
  'Red': [255, 0, 0],
  'RosyBrown': [188, 143, 143],
  'RoyalBlue': [65, 105, 225],
  'SaddleBrown': [139, 69, 19],
  'Salmon': [250, 128, 114],
  'SandyBrown': [244, 164, 96],
  'SeaGreen': [46, 139, 87],
  'SeaShell': [255, 245, 238],
  'Sienna': [160, 82, 45],
  'Silver': [192, 192, 192],
  'SkyBlue': [135, 206, 235],
  'SlateBlue': [106, 90, 205],
  'SlateGray': [112, 128, 144],
  'Snow': [255, 250, 250],
  'SpringGreen': [0, 255, 127],
  'SteelBlue': [70, 130, 180],
  'Tan': [210, 180, 140],
  'Teal': [0, 128, 128],
  'Thistle': [216, 191, 216],
  'Tomato': [255, 99, 71],
  'Turquoise': [64, 224, 208],
  'Violet': [238, 130, 238],
  'Wheat': [245, 222, 179],
  'White': [255, 255, 255],
  'WhiteSmoke': [245, 245, 245],
  'Yellow': [255, 255, 0],
  'YellowGreen': [154, 205, 50],
};

// Build regex for named colors
const NAMED_COLOR_REGEX = new RegExp(
  `Color\\.(${Object.keys(NAMED_COLORS).join('|')})\\b`,
  'g'
);

interface ColorMatch {
  range: vscode.Range;
  color: string;
  r: number;
  g: number;
  b: number;
  isNamedColor?: boolean;
  originalText?: string;
}

interface NearestColorResult {
  name: string;
  rgb: [number, number, number];
  distance: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getContrastColor(r: number, g: number, b: number): string {
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Calculate Euclidean distance between two colors in RGB space
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

// Find the nearest named colors to the given RGB values
function findNearestColors(r: number, g: number, b: number, count: number = 3): NearestColorResult[] {
  const results: NearestColorResult[] = [];

  for (const [name, rgb] of Object.entries(NAMED_COLORS)) {
    // Skip Transparent variants as they're functionally the same as Black
    if (name === 'TransparentBlack' || name === 'Transparent') {
      continue;
    }

    const distance = colorDistance(r, g, b, rgb[0], rgb[1], rgb[2]);
    results.push({ name, rgb, distance });
  }

  // Sort by distance and return top N
  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, count);
}

function findColorMatches(document: vscode.TextDocument): ColorMatch[] {
  const text = document.getText();
  const matches: ColorMatch[] = [];

  // Find constructor-style colors
  for (const pattern of COLOR_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const r = Math.min(255, Math.max(0, parseInt(match[1], 10)));
      const g = Math.min(255, Math.max(0, parseInt(match[2], 10)));
      const b = Math.min(255, Math.max(0, parseInt(match[3], 10)));

      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);

      matches.push({
        range: new vscode.Range(startPos, endPos),
        color: rgbToHex(r, g, b),
        r,
        g,
        b,
        isNamedColor: false,
        originalText: match[0],
      });
    }
  }

  // Find named colors
  NAMED_COLOR_REGEX.lastIndex = 0;
  let namedMatch;
  while ((namedMatch = NAMED_COLOR_REGEX.exec(text)) !== null) {
    const colorName = namedMatch[1];
    const rgb = NAMED_COLORS[colorName];
    if (rgb) {
      const [r, g, b] = rgb;
      const startPos = document.positionAt(namedMatch.index);
      const endPos = document.positionAt(namedMatch.index + namedMatch[0].length);

      matches.push({
        range: new vscode.Range(startPos, endPos),
        color: rgbToHex(r, g, b),
        r,
        g,
        b,
        isNamedColor: true,
        originalText: namedMatch[0],
      });
    }
  }

  return matches;
}

// Code Action Provider for suggesting named color replacements
class MonoGameColorCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
  ): vscode.CodeAction[] | undefined {
    const config = vscode.workspace.getConfiguration('monogameColorPreview');
    const maxDistance = config.get<number>('suggestionMaxDistance', 100);
    const suggestionCount = config.get<number>('suggestionCount', 3);

    // Find if there's a new Color() at the cursor position
    const text = document.getText();
    NEW_COLOR_PATTERN.lastIndex = 0;

    let match;
    while ((match = NEW_COLOR_PATTERN.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const matchRange = new vscode.Range(startPos, endPos);

      // Check if cursor/selection intersects with this color
      if (matchRange.contains(range.start) || range.intersection(matchRange)) {
        const r = Math.min(255, Math.max(0, parseInt(match[1], 10)));
        const g = Math.min(255, Math.max(0, parseInt(match[2], 10)));
        const b = Math.min(255, Math.max(0, parseInt(match[3], 10)));

        const nearestColors = findNearestColors(r, g, b, suggestionCount);
        const actions: vscode.CodeAction[] = [];

        for (const nearest of nearestColors) {
          // Skip if distance is too large
          if (nearest.distance > maxDistance) {
            continue;
          }

          // Skip if it's an exact match (distance 0)
          if (nearest.distance === 0) {
            const exactAction = new vscode.CodeAction(
              `Replace with Color.${nearest.name} (exact match!)`,
              vscode.CodeActionKind.QuickFix
            );
            exactAction.edit = new vscode.WorkspaceEdit();
            exactAction.edit.replace(document.uri, matchRange, `Color.${nearest.name}`);
            exactAction.isPreferred = true;
            actions.push(exactAction);
            continue;
          }

          const distanceStr = nearest.distance.toFixed(1);
          const [nr, ng, nb] = nearest.rgb;
          const action = new vscode.CodeAction(
            `Replace with Color.${nearest.name} (${nr}, ${ng}, ${nb}) — distance: ${distanceStr}`,
            vscode.CodeActionKind.QuickFix
          );
          action.edit = new vscode.WorkspaceEdit();
          action.edit.replace(document.uri, matchRange, `Color.${nearest.name}`);
          
          // Mark the closest one as preferred
          if (actions.length === 0) {
            action.isPreferred = true;
          }

          actions.push(action);
        }

        return actions;
      }
    }

    return undefined;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('MonoGame Color Preview is now active');

  let enabled = true;
  const decorationTypeMap = new Map<string, vscode.TextEditorDecorationType>();

  function getConfig() {
    return vscode.workspace.getConfiguration('monogameColorPreview');
  }

  function clearDecorations() {
    decorationTypeMap.forEach((decorationType) => decorationType.dispose());
    decorationTypeMap.clear();
  }

  function createDecorationType(color: string, r: number, g: number, b: number): vscode.TextEditorDecorationType {
    const config = getConfig();
    const style = config.get<string>('markerStyle', 'square');
    const contrastColor = getContrastColor(r, g, b);

    switch (style) {
      case 'underline':
        return vscode.window.createTextEditorDecorationType({
          borderWidth: '0 0 2px 0',
          borderStyle: 'solid',
          borderColor: color,
        });
      case 'background':
        return vscode.window.createTextEditorDecorationType({
          backgroundColor: color,
          color: contrastColor,
          borderRadius: '3px',
        });
      case 'square':
      default:
        return vscode.window.createTextEditorDecorationType({
          before: {
            contentText: '',
            backgroundColor: color,
            border: `1px solid ${contrastColor}`,
            width: '0.85em',
            height: '0.85em',
            margin: '0 4px 0 0',
          },
        });
    }
  }

  function updateDecorations(editor: vscode.TextEditor) {
    if (!enabled) {
      clearDecorations();
      return;
    }

    const config = getConfig();
    if (!config.get<boolean>('enabled', true)) {
      clearDecorations();
      return;
    }

    if (editor.document.languageId !== 'csharp') {
      return;
    }

    clearDecorations();

    const matches = findColorMatches(editor.document);

    // Group matches by color for efficiency
    const matchesByColor = new Map<string, { match: ColorMatch; ranges: vscode.Range[] }>();
    
    for (const match of matches) {
      const key = `${match.color}-${match.r}-${match.g}-${match.b}`;
      if (!matchesByColor.has(key)) {
        matchesByColor.set(key, { match, ranges: [] });
      }
      matchesByColor.get(key)!.ranges.push(match.range);
    }

    // Apply decorations
    for (const [key, { match, ranges }] of matchesByColor) {
      const decorationType = createDecorationType(match.color, match.r, match.g, match.b);
      decorationTypeMap.set(key, decorationType);
      editor.setDecorations(decorationType, ranges);
    }
  }

  // Register the code action provider
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    { language: 'csharp' },
    new MonoGameColorCodeActionProvider(),
    {
      providedCodeActionKinds: MonoGameColorCodeActionProvider.providedCodeActionKinds,
    }
  );

  // Update decorations when the active editor changes
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        updateDecorations(editor);
      }
    }
  );

  // Update decorations when document content changes
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor);
      }
    }
  );

  // Update when configuration changes
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration('monogameColorPreview')) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          updateDecorations(editor);
        }
      }
    }
  );

  // Toggle command
  const toggleCommand = vscode.commands.registerCommand(
    'monogameColorPreview.toggle',
    () => {
      enabled = !enabled;
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
      }
      vscode.window.showInformationMessage(
        `MonoGame Color Preview: ${enabled ? 'Enabled' : 'Disabled'}`
      );
    }
  );

  context.subscriptions.push(
    codeActionProvider,
    onDidChangeActiveTextEditor,
    onDidChangeTextDocument,
    onDidChangeConfiguration,
    toggleCommand
  );

  // Initial decoration update
  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {
  // Cleanup handled by subscriptions
}
