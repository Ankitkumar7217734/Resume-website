# LaTeX Editor - Quick Start Guide

## Installation Steps

### 1. Install Prerequisites

#### Install Node.js

If you don't have Node.js installed:

- Download from: https://nodejs.org/
- Or use Homebrew (macOS): `brew install node`

#### Install LaTeX (Required for compilation)

**macOS:**

```bash
# Full distribution (large download ~4GB)
brew install --cask mactex

# OR BasicTeX (smaller ~100MB, recommended)
brew install --cask basictex
```

After installing BasicTeX, you may need to install additional packages:

```bash
sudo tlmgr update --self
sudo tlmgr install collection-fontsrecommended
sudo tlmgr install collection-latexrecommended
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install texlive texlive-latex-extra
```

**Windows:**

- Download MiKTeX: https://miktex.org/download
- Run the installer and follow the prompts

#### Install Pandoc (Optional - for Word export)

**macOS:**

```bash
brew install pandoc
```

**Linux:**

```bash
sudo apt-get install pandoc
```

**Windows:**

- Download from: https://pandoc.org/installing.html

### 2. Set Up the Project

```bash
# Navigate to the project directory
cd /path/to/latex-editor

# Install Node.js dependencies
npm install
```

### 3. Start the Backend Server

```bash
npm start
```

You should see:

```
LaTeX Editor Backend running on http://localhost:3000

Make sure you have the following installed:
1. LaTeX distribution (MacTeX, TeX Live, or MiKTeX)
2. Pandoc (for Word export)
```

### 4. Open the Frontend

**Option A: Direct File Open**

- Simply open `index.html` in your web browser
- File → Open → Select index.html

**Option B: Using a Local Web Server (Recommended)**

Using Python:

```bash
python3 -m http.server 8080
```

Using Node.js http-server:

```bash
# Install if you haven't
npm install -g http-server

# Run server
http-server -p 8080
```

Then open: http://localhost:8080

## First Steps

### 1. Test the Editor

- The editor opens with a sample document
- Click the **"Compile"** button (or press Ctrl/Cmd + B)
- Your PDF should appear in the right pane

### 2. Try a Template

- Click the **"Templates"** button
- Select "Article" or "Resume"
- Click **"Compile"** to see the result

### 3. Download Your Work

- After compiling, click **"PDF"** to download as PDF
- Click **"DOCX"** to download as Word document

## Quick Tips

### Keyboard Shortcuts

- **Ctrl/Cmd + B**: Compile
- **Ctrl/Cmd + S**: Save
- **Ctrl/Cmd + F**: Find
- **Ctrl/Cmd + H**: Replace

### Settings

Click the gear icon (⚙️) to:

- Enable auto-compile
- Adjust compile delay
- Toggle auto-save

### Themes

- Click the moon/sun icon to toggle dark/light theme

## Common Issues & Solutions

### Issue: "Failed to connect to server"

**Solution:**

```bash
# Make sure the backend is running
npm start

# Check if port 3000 is available
lsof -i :3000  # macOS/Linux
```

### Issue: "Compilation failed"

**Solution:**

- Check that LaTeX is installed:
  ```bash
  pdflatex --version
  ```
- If not found, add to PATH:

  ```bash
  # For MacTeX on macOS
  export PATH="/Library/TeX/texbin:$PATH"

  # Add to ~/.zshrc or ~/.bash_profile to make permanent
  echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zshrc
  ```

### Issue: "Pandoc not found" (Word export)

**Solution:**

- Install Pandoc: `brew install pandoc`
- Verify: `pandoc --version`
- Restart the server: `npm start`

### Issue: Blank page after opening index.html

**Solution:**

- Use a local web server instead of opening file directly
- OR check browser console for errors (F12 → Console tab)

## Testing Your Installation

### 1. Check Backend

Open a browser and visit: http://localhost:3000/health

You should see:

```json
{ "status": "ok", "message": "LaTeX Editor Backend is running" }
```

### 2. Test LaTeX Compilation

```bash
# Create a test file
echo "\documentclass{article}\begin{document}Hello\end{document}" > test.tex

# Compile it
pdflatex test.tex

# Should create test.pdf
```

### 3. Test Pandoc (Optional)

```bash
# Create test LaTeX file
echo "\documentclass{article}\begin{document}Test\end{document}" > test.tex

# Convert to Word
pandoc test.tex -o test.docx

# Should create test.docx
```

## Next Steps

### Learn LaTeX Basics

- Great tutorial: https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes
- LaTeX Wikibook: https://en.wikibooks.org/wiki/LaTeX

### Customize Templates

- Edit `templates.js` to add your own templates
- Each template is a JavaScript object with LaTeX code

### Explore Features

1. Try different document classes (article, report, book)
2. Add mathematical equations
3. Include images and tables
4. Create bibliographies
5. Experiment with different themes

## Project Structure

```
latex-editor/
├── index.html       ← Main page (open this)
├── styles.css       ← Styling
├── app.js          ← Frontend logic
├── templates.js    ← Document templates
├── server.js       ← Backend server
├── package.json    ← Node dependencies
└── README.md       ← Full documentation
```

## Development Mode

To run with auto-restart on changes:

```bash
# Install nodemon
npm install -g nodemon

# Run in dev mode
npm run dev
```

## Resources

### LaTeX Help

- [Overleaf Documentation](https://www.overleaf.com/learn)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)
- [CTAN Package Repository](https://ctan.org/)

### Editor Features

- [Monaco Editor Docs](https://microsoft.github.io/monaco-editor/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

### Getting Help

- Check the README.md for detailed documentation
- Look at example templates in templates.js
- View browser console for errors (F12 key)

---

**Ready to start? Open `index.html` and click Compile!** 🚀
