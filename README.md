# LaTeX Editor - Online LaTeX Compiler

A powerful, web-based LaTeX editor with real-time preview, PDF export, and Word document conversion. Similar to Overleaf but runs locally on your machine.

![LaTeX Editor Screenshot](screenshot.png)

## Features

### Core Features

- **Split-Pane Interface**: Write LaTeX code on the left, see preview on the right
- **Real-Time Compilation**: Compile LaTeX to PDF with one click
- **Monaco Editor Integration**: Professional code editor with:
  - Syntax highlighting for LaTeX
  - Line numbers
  - Auto-indentation
  - Bracket matching
  - Search and replace
  - Undo/redo
- **PDF Preview**: View compiled documents directly in the browser
- **Export Options**:
  - Download as PDF
  - Download as Microsoft Word (.docx)

### User Interface

- **Template Library**: Quick-start templates for:
  - Article
  - Report
  - Letter
  - Resume/CV
  - Beamer Presentations
  - Mathematical Documents
- **Theme Support**: Toggle between light and dark themes
- **Resizable Panes**: Adjust editor and preview pane sizes
- **Zoom Controls**: Zoom in/out on PDF preview
- **Font Size Adjustment**: Customize editor font size
- **Auto-Save**: Automatically saves your work to browser storage
- **Auto-Compile**: Optional automatic compilation on code changes

### Additional Features

- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + B`: Compile document
  - `Ctrl/Cmd + S`: Save document
- **Error Reporting**: Clear error messages with helpful details
- **Status Bar**: Shows compilation status and cursor position
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend

- **HTML5, CSS3, JavaScript**: Core web technologies
- **Monaco Editor**: VS Code's editor (used in VS Code itself)
- **PDF.js**: Mozilla's PDF rendering library
- **Font Awesome**: Icons

### Backend

- **Node.js**: Runtime environment
- **Express**: Web server framework
- **pdflatex**: LaTeX compilation
- **Pandoc**: LaTeX to Word conversion

## Installation

### Prerequisites

1. **Node.js** (v14 or higher)

   ```bash
   # Check if installed
   node --version
   npm --version
   ```

2. **LaTeX Distribution** (for PDF compilation)

   **macOS:**

   ```bash
   brew install --cask mactex
   # Or BasicTeX for smaller download:
   brew install --cask basictex
   ```

   **Linux (Ubuntu/Debian):**

   ```bash
   sudo apt-get update
   sudo apt-get install texlive-full
   ```

   **Windows:**

   - Download and install [MiKTeX](https://miktex.org/download)
   - Or [TeX Live](https://www.tug.org/texlive/windows.html)

3. **Pandoc** (for Word export - optional)

   **macOS:**

   ```bash
   brew install pandoc
   ```

   **Linux (Ubuntu/Debian):**

   ```bash
   sudo apt-get install pandoc
   ```

   **Windows:**

   - Download installer from [pandoc.org](https://pandoc.org/installing.html)

### Setup

1. **Clone or Download** this project

2. **Install Dependencies**

   ```bash
   cd latex-editor
   npm install
   ```

3. **Start the Backend Server**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`

4. **Open the Frontend**
   - Open `index.html` in your web browser
   - Or use a local server:

     ```bash
     # Using Python 3
     python3 -m http.server 8080

     # Using Node.js http-server (install first: npm install -g http-server)
     http-server -p 8080
     ```

   - Then open `http://localhost:8080` in your browser

## Usage

### Getting Started

1. **Write LaTeX Code**: Type or paste your LaTeX code in the left editor pane
2. **Compile**: Click the "Compile" button or press `Ctrl/Cmd + B`
3. **View Preview**: See your compiled PDF in the right preview pane
4. **Download**: Export as PDF or Word document using the toolbar buttons

### Using Templates

1. Click the "Templates" button in the toolbar
2. Choose a template (Article, Report, Letter, Resume, Presentation, Math)
3. The editor will load the template code
4. Customize it for your needs

### Keyboard Shortcuts

| Shortcut               | Action                |
| ---------------------- | --------------------- |
| `Ctrl/Cmd + B`         | Compile document      |
| `Ctrl/Cmd + S`         | Save to local storage |
| `Ctrl/Cmd + F`         | Find in editor        |
| `Ctrl/Cmd + H`         | Find and replace      |
| `Ctrl/Cmd + Z`         | Undo                  |
| `Ctrl/Cmd + Shift + Z` | Redo                  |

### Settings

Access settings by clicking the gear icon:

- **Auto-compile**: Automatically compile after typing (with delay)
- **Auto-save**: Automatically save to browser storage
- **Compile delay**: Set delay for auto-compilation (in milliseconds)

## Project Structure

```
latex-editor/
├── index.html          # Main HTML file
├── styles.css          # Styling and themes
├── app.js             # Frontend JavaScript logic
├── templates.js       # LaTeX template definitions
├── server.js          # Backend Node.js server
├── package.json       # Node.js dependencies
├── temp/              # Temporary compilation files (auto-created)
└── README.md          # This file
```

## API Endpoints

### POST /compile

Compile LaTeX code to PDF

**Request:**

```json
{
  "code": "\\documentclass{article}..."
}
```

**Response:**

```json
{
  "success": true,
  "pdf": "base64_encoded_pdf_data"
}
```

### POST /convert-to-docx

Convert LaTeX to Word document

**Request:**

```json
{
  "code": "\\documentclass{article}..."
}
```

**Response:**

```json
{
  "success": true,
  "docx": "base64_encoded_docx_data"
}
```

### GET /health

Health check endpoint

**Response:**

```json
{
  "status": "ok",
  "message": "LaTeX Editor Backend is running"
}
```

## Troubleshooting

### "Failed to connect to server"

- Make sure the backend server is running: `npm start`
- Check that the server is on port 3000
- Verify no firewall is blocking the connection

### "Compilation failed"

- Check LaTeX syntax for errors
- Ensure all required packages are included
- View error details in the error panel
- Make sure LaTeX is installed: `pdflatex --version`

### "Pandoc not found"

- Install Pandoc: `brew install pandoc` (macOS)
- Verify installation: `pandoc --version`
- Restart the backend server after installing

### PDF not rendering

- Check browser console for errors
- Try compiling again
- Clear browser cache
- Ensure PDF.js is loading correctly

## Security Considerations

⚠️ **Important**: This is designed for local use. If deploying publicly:

1. **Sandboxing**: LaTeX compilation should be sandboxed to prevent malicious code execution
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **File Size Limits**: Already implemented (50MB limit)
4. **Input Validation**: Validate and sanitize user inputs
5. **Timeout Handling**: Already implemented (30 second timeout)
6. **User Authentication**: Add authentication for multi-user environments

## Performance Tips

1. **Auto-Compile**: Disable for large documents to save resources
2. **Compile Delay**: Increase delay for auto-compile to reduce server load
3. **Cleanup**: Server automatically cleans up old temporary files
4. **Browser Storage**: Auto-save uses localStorage (limited to ~5-10MB per domain)

## Contributing

Contributions are welcome! Areas for improvement:

- Multi-page PDF support
- Real-time collaborative editing
- Cloud storage integration
- User authentication
- Bibliography management (BibTeX)
- Spell checker
- More templates
- Mobile app versions
- Docker containerization

## Known Limitations

1. Only the first page of PDF is shown in preview (can be extended)
2. Local storage has size limits (5-10MB typically)
3. Large documents may take longer to compile
4. Some LaTeX packages might not be available (depends on TeX distribution)
5. Word conversion may not preserve all LaTeX formatting

## License

MIT License - Feel free to use, modify, and distribute.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Pandoc](https://pandoc.org/) - Document conversion
- [LaTeX Project](https://www.latex-project.org/) - The LaTeX typesetting system
- [Font Awesome](https://fontawesome.com/) - Icons

## Support

For issues, questions, or suggestions:

- Check existing issues
- Read the troubleshooting section
- Create a new issue with details

---

**Happy LaTeX Writing! 📝✨**
# Resume-website
