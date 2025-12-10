# MonoGame Color Preview

A VS Code extension that displays inline color previews for MonoGame/XNA `Color` constructors in C# files.

## Features

- **RGB Constructor Detection**: Recognizes `new Color(r, g, b)` and `new Color(r, g, b, a)` patterns
- **Named Color Support**: Highlights all 140+ standard XNA/MonoGame named colors (e.g., `Color.CornflowerBlue`)
- **FromNonPremultiplied Support**: Detects `Color.FromNonPremultiplied(r, g, b, a)` calls
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




