# MonoGame Color Preview

![MonoGame Color Preview logo](images/icon.png)

A VS Code extension that displays inline color previews for MonoGame/XNA `Color` constructors in C# files.

Get it from Open VSX: https://open-vsx.org/extension/csharp-forge/monogame-color-preview

## Features

- **RGB Constructor Detection**: Recognizes `new Color(r, g, b)` and `new Color(r, g, b, a)` patterns
- **Named Color Support**: Highlights all 140+ standard XNA/MonoGame named colors (e.g., `Color.CornflowerBlue`)
- **FromNonPremultiplied Support**: Detects `Color.FromNonPremultiplied(r, g, b, a)` calls
- **Quick Fix Suggestions**: Suggests nearest named colors for `new Color(...)` via the lightbulb/Quick Fix menu
- **Multiple Display Styles**: Choose between square swatch, underline, or background highlight

## Preview Styles

| Style | Description |
|-------|-------------|
| `square` (default) | Shows a small colored square before the color expression |
| `underline` | Underlines the color expression with the detected color |
| `background` | Highlights the entire color expression with contrasting text |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `monogameColorPreview.enabled` | `true` | Enable or disable color previews |
| `monogameColorPreview.markerStyle` | `"square"` | Style of the preview marker |
| `monogameColorPreview.suggestionCount` | `3` | Number of nearest named color suggestions to show |
| `monogameColorPreview.suggestionMaxDistance` | `100` | Maximum color distance allowed for suggestions |

## Commands

- **Toggle MonoGame Color Preview**: Quickly enable/disable the extension

## Supported Patterns

```csharp
// RGB constructor (0-255 values)
var color1 = new Color(255, 128, 64);
var color2 = new Color(20, 20, 30, 255);

// Named colors
GraphicsDevice.Clear(Color.CornflowerBlue);
var highlight = Color.Gold;

// FromNonPremultiplied
var premult = Color.FromNonPremultiplied(255, 0, 0, 128);
```

## Color Name Suggestions (Quick Fix)

- Place the cursor inside a `new Color(r, g, b[, a])` call and open Quick Fix (`Cmd/Ctrl+.` or click the lightbulb).
- The extension lists the nearest MonoGame named colors, limited by `suggestionCount` and `suggestionMaxDistance`.
- Picking a suggestion replaces the constructor with `Color.SomeName`.

**Example**

```csharp
// In your code
var accent = new Color(255, 215, 0);

// Quick Fix suggestions
// - Replace with Color.Gold (255, 215, 0) — distance: 0.0 (preferred)
// - Replace with Color.Yellow (255, 255, 0) — distance: 40.0
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd monogame-color-preview
npm install
```

### Build

```bash
npm run compile
```

### Test

Press `F5` in VS Code to launch the Extension Development Host with the extension loaded.

### Watch Mode

```bash
npm run watch
```

## Packaging

To create a `.vsix` package for distribution:

```bash
npm install -g @vscode/vsce
vsce package
```

## License

MIT




