// PDF.js Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Global Variables
let editor;
let currentPdfData = null;
let currentZoom = 0.85;
let editorFontSize = 14;
let autoSaveTimer = null;
let autoCompileTimer = null;
let isRendering = false;
let renderTask = null;
let currentFileName = null;
let savedFiles = {};
let settings = {
    autoCompile: false,
    autoSave: true,
    compileDelay: 2000
};
let latexGenerator = null;
let isEngineReady = true; // LaTeX.js doesn't need initialization

// Load saved files from localStorage
function loadSavedFiles() {
    const files = localStorage.getItem('latexFiles');
    if (files) {
        savedFiles = JSON.parse(files);
    }
}

// Save files to localStorage
function saveSavedFiles() {
    localStorage.setItem('latexFiles', JSON.stringify(savedFiles));
}

// Show homepage
function showHomepage() {
    document.getElementById('homepage').classList.remove('hidden');
    document.querySelector('.main-container').classList.add('hidden');
    // Hide header and status bar
    document.querySelectorAll('.editor-only').forEach(el => {
        el.classList.add('hidden');
    });
    updateHomepage();
}

// Show editor
function showEditor() {
    document.getElementById('homepage').classList.add('hidden');
    document.querySelector('.main-container').classList.remove('hidden');
    // Show header and status bar
    document.querySelectorAll('.editor-only').forEach(el => {
        el.classList.remove('hidden');
    });
}

// Update homepage with current files
function updateHomepage() {
    loadSavedFiles();
    const filesList = document.getElementById('filesList');
    const totalFiles = document.getElementById('totalFiles');
    const lastEdited = document.getElementById('lastEdited');

    const fileKeys = Object.keys(savedFiles);
    totalFiles.textContent = fileKeys.length;

    if (fileKeys.length === 0) {
        filesList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No documents yet. Start creating!</p></div>';
        lastEdited.textContent = 'Never';
        return;
    }

    // Sort files by last modified
    const sortedFiles = fileKeys.sort((a, b) => {
        return (savedFiles[b].lastModified || 0) - (savedFiles[a].lastModified || 0);
    });

    // Update last edited
    const latestFile = savedFiles[sortedFiles[0]];
    if (latestFile.lastModified) {
        lastEdited.textContent = new Date(latestFile.lastModified).toLocaleDateString();
    }

    // Create file list
    filesList.innerHTML = sortedFiles.map(fileName => {
        const file = savedFiles[fileName];
        const date = file.lastModified ? new Date(file.lastModified).toLocaleString() : 'Unknown';
        return `
            <div class="file-item" data-filename="${fileName}">
                <div class="file-info">
                    <i class="fas fa-file-alt"></i>
                    <div class="file-details">
                        <div class="file-name">${fileName}</div>
                        <div class="file-date">Last modified: ${date}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-secondary open-file-btn">
                        <i class="fas fa-folder-open"></i> Open
                    </button>
                    <button class="btn btn-sm btn-info rename-file-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-file-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners to file items
    document.querySelectorAll('.open-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = e.target.closest('.file-item').dataset.filename;
            openFile(fileName);
        });
    });

    document.querySelectorAll('.rename-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = e.target.closest('.file-item').dataset.filename;
            showRenameModal(fileName);
        });
    });

    document.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = e.target.closest('.file-item').dataset.filename;
            deleteFile(fileName);
        });
    });

    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            openFile(item.dataset.filename);
        });
    });
}

// Open file
function openFile(fileName) {
    const file = savedFiles[fileName];
    if (file) {
        currentFileName = fileName;
        editor.setValue(file.content);
        showEditor();
        showStatus(`Opened: ${fileName}`, 'success');
    }
}

// Rename file
let fileToRename = null;

function showRenameModal(fileName) {
    fileToRename = fileName;
    const modal = document.getElementById('renameModal');
    const input = document.getElementById('newFileName');
    input.value = fileName;
    modal.classList.remove('hidden');
    input.focus();
    input.select();
}

function hideRenameModal() {
    const modal = document.getElementById('renameModal');
    modal.classList.add('hidden');
    fileToRename = null;
}

function renameFile(oldName, newName) {
    // Validate new name
    if (!newName || newName.trim() === '') {
        alert('Please enter a valid file name.');
        return;
    }

    newName = newName.trim();

    // Check if name hasn't changed
    if (oldName === newName) {
        hideRenameModal();
        return;
    }

    // Check if file with new name already exists
    if (savedFiles[newName]) {
        alert(`A file named "${newName}" already exists. Please choose a different name.`);
        return;
    }

    // Rename the file
    savedFiles[newName] = savedFiles[oldName];
    savedFiles[newName].lastModified = Date.now();
    delete savedFiles[oldName];

    // Update current file name if it's the one being renamed
    if (currentFileName === oldName) {
        currentFileName = newName;
    }

    saveSavedFiles();
    updateHomepage();
    hideRenameModal();
    showStatus(`Renamed to: ${newName}`, 'success');
}

// Delete file
function deleteFile(fileName) {
    if (confirm(`Delete "${fileName}"? This cannot be undone.`)) {
        delete savedFiles[fileName];
        saveSavedFiles();
        updateHomepage();
        showStatus(`Deleted: ${fileName}`, 'success');
    }
}

// Clear all files
function clearAllFiles() {
    if (confirm('Delete all documents? This cannot be undone.')) {
        savedFiles = {};
        saveSavedFiles();
        updateHomepage();
        showStatus('All files cleared', 'success');
    }
}

// Create new file
function createNewFile(content = null, name = null) {
    const fileName = name || `Document_${Date.now()}`;
    const fileContent = content || getDefaultContent();

    savedFiles[fileName] = {
        content: fileContent,
        lastModified: Date.now()
    };

    saveSavedFiles();
    currentFileName = fileName;
    editor.setValue(fileContent);
    showEditor();
    showStatus(`Created: ${fileName}`, 'success');
}

// Initialize Monaco Editor
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    // Register LaTeX language
    monaco.languages.register({ id: 'latex' });

    monaco.languages.setMonarchTokensProvider('latex', {
        tokenizer: {
            root: [
                [/\\[a-zA-Z@]+/, 'keyword'],
                [/\\[^a-zA-Z@]/, 'keyword'],
                [/%.*$/, 'comment'],
                [/\{/, 'delimiter.curly'],
                [/\}/, 'delimiter.curly'],
                [/\[/, 'delimiter.square'],
                [/\]/, 'delimiter.square'],
                [/\$\$/, 'string'],
                [/\$/, 'string'],
            ]
        }
    });

    // Create editor
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: getDefaultContent(),
        language: 'latex',
        theme: 'vs',
        fontSize: editorFontSize,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        tabSize: 2,
        insertSpaces: true
    });

    // Load saved content
    loadFromLocalStorage();

    // Editor change handler
    editor.onDidChangeModelContent(() => {
        updateStatusBar();

        // Auto-save
        if (settings.autoSave) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveToLocalStorage();
                showStatus('Saved', 'success');
            }, 1000);
        }

        // Auto-compile
        if (settings.autoCompile) {
            clearTimeout(autoCompileTimer);
            autoCompileTimer = setTimeout(() => {
                compileLatex();
            }, settings.compileDelay);
        }
    });

    // Cursor position change handler
    editor.onDidChangeCursorPosition(() => {
        updateStatusBar();
    });

    // Initialize
    initializeEventListeners();
    loadSettings();
});

function getDefaultContent() {
    return `\\documentclass{article}

\\title{Welcome to LaTeX Editor}
\\author{Your Name}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome! Start writing your LaTeX document here.

You can include mathematical equations like $E = mc^2$ inline.

\\section{Getting Started}
\\begin{itemize}
    \\item Click "Compile" to see the preview
    \\item Choose templates from the Templates button
    \\item Download as PDF
\\end{itemize}

\\textbf{Note:} Browser-based LaTeX works best with simple documents. Avoid complex packages.

Happy writing!

\\end{document}`;
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Compile button
    document.getElementById('compileBtn').addEventListener('click', compileLatex);

    // Download buttons
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);

    // Template button
    document.getElementById('templateBtn').addEventListener('click', () => {
        document.getElementById('templateModal').classList.remove('hidden');
    });

    // New document button
    document.getElementById('newDocBtn').addEventListener('click', newDocument);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
    });

    // Font size controls
    document.getElementById('fontSizeIncrease').addEventListener('click', () => {
        editorFontSize = Math.min(editorFontSize + 2, 30);
        editor.updateOptions({ fontSize: editorFontSize });
        document.getElementById('fontSizeDisplay').textContent = editorFontSize + 'px';
    });

    document.getElementById('fontSizeDecrease').addEventListener('click', () => {
        editorFontSize = Math.max(editorFontSize - 2, 10);
        editor.updateOptions({ fontSize: editorFontSize });
        document.getElementById('fontSizeDisplay').textContent = editorFontSize + 'px';
    });

    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.1, 2.0);
        renderPdf();
        document.getElementById('zoomDisplay').textContent = Math.round(currentZoom * 100) + '%';
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.1, 0.5);
        renderPdf();
        document.getElementById('zoomDisplay').textContent = Math.round(currentZoom * 100) + '%';
    });

    // Mouse wheel zoom for preview with debouncing
    let zoomTimeout = null;
    const previewContainer = document.querySelector('.preview-container');
    previewContainer.addEventListener('wheel', (e) => {
        // Only zoom if Ctrl/Cmd key is held
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();

            // Slower zoom speed for better control (0.05 instead of 0.1)
            const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05;
            const newZoom = Math.max(0.5, Math.min(2.0, currentZoom + zoomDelta));

            if (newZoom !== currentZoom) {
                currentZoom = newZoom;
                document.getElementById('zoomDisplay').textContent = Math.round(currentZoom * 100) + '%';

                // Debounce the render to avoid too many rapid calls (increased to 100ms for smoother experience)
                clearTimeout(zoomTimeout);
                zoomTimeout = setTimeout(() => {
                    renderPdf();
                }, 100);
            }
        }
    }, { passive: false });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Template selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            loadTemplate(template);
            document.getElementById('templateModal').classList.add('hidden');
        });
    });

    // Rename modal
    document.getElementById('confirmRename').addEventListener('click', () => {
        if (fileToRename) {
            const newName = document.getElementById('newFileName').value;
            renameFile(fileToRename, newName);
        }
    });

    document.getElementById('cancelRename').addEventListener('click', () => {
        hideRenameModal();
    });

    document.getElementById('newFileName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && fileToRename) {
            const newName = document.getElementById('newFileName').value;
            renameFile(fileToRename, newName);
        } else if (e.key === 'Escape') {
            hideRenameModal();
        }
    });

    // Settings
    document.getElementById('autoCompile').addEventListener('change', (e) => {
        settings.autoCompile = e.target.checked;
        saveSettings();
    });

    document.getElementById('autoSave').addEventListener('change', (e) => {
        settings.autoSave = e.target.checked;
        saveSettings();
    });

    document.getElementById('compileDelay').addEventListener('change', (e) => {
        settings.compileDelay = parseInt(e.target.value);
        saveSettings();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + B to compile
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            compileLatex();
        }
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveToLocalStorage();
            showStatus('Saved', 'success');
        }
    });

    // Resizer
    initializeResizer();

    // Homepage event listeners
    initializeHomepageListeners();
}

// Initialize Homepage Event Listeners
function initializeHomepageListeners() {
    // Home button
    document.getElementById('homeBtn').addEventListener('click', () => {
        if (currentFileName && settings.autoSave) {
            saveCurrentFile();
        }
        showHomepage();
    });

    // Template cards on homepage
    document.querySelectorAll('.template-card-home').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            const templateContent = TEMPLATES[template];
            const templateName = card.querySelector('h3').textContent;
            createNewFile(templateContent, `${templateName}_${Date.now()}`);
        });
    });

    // Start blank document
    document.getElementById('startBlank').addEventListener('click', () => {
        createNewFile();
    });

    // Open settings from homepage
    document.getElementById('openSettings').addEventListener('click', () => {
        showEditor();
        document.getElementById('settingsModal').classList.remove('hidden');
    });

    // Clear all files
    document.getElementById('clearAllFiles').addEventListener('click', clearAllFiles);

    // Theme toggle on homepage
    document.getElementById('homeThemeToggle').addEventListener('click', toggleTheme);
}

// Save current file
function saveCurrentFile() {
    if (currentFileName) {
        savedFiles[currentFileName] = {
            content: editor.getValue(),
            lastModified: Date.now()
        };
        saveSavedFiles();
        showStatus(`Saved: ${currentFileName}`, 'success');
    }
}

// Initialize LaTeX.js (no async init needed)
function initLaTeXJS() {
    if (typeof latexjs === 'undefined') {
        console.error('LaTeX.js not loaded');
        return false;
    }
    latexGenerator = latexjs;
    isEngineReady = true;
    return true;
}

// Compile LaTeX - with backend fallback
async function compileLatex() {
    const code = editor.getValue();

    showStatus('Compiling...', 'compiling');
    showLoading(true);
    hideError();
    hideWelcome();

    // Try backend server first (if running), then fallback to client-side
    // Use relative URL for production (same domain) or localhost for dev
    const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/compile'
        : '/compile';

    // Retry logic for sleeping server on free tier
    const maxRetries = 3;
    const retryDelays = [5000, 10000, 15000]; // 5s, 10s, 15s

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                showStatus(`Retrying... (attempt ${attempt + 1}/${maxRetries}) - Server waking up, please wait`, 'compiling');
                await new Promise(resolve => setTimeout(resolve, retryDelays[attempt - 1]));
            } else {
                showStatus('Compiling... (if this is your first request, server may take 30-60s to wake)', 'compiling');
            }

            // 90 second timeout for first request (cold start), 30s for retries
            const timeout = attempt === 0 ? 90000 : 30000;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    currentPdfData = data.pdf;
                    await renderPdf();
                    showStatus('Compilation successful', 'success');
                    showLoading(false);
                    return;
                } else {
                    // This is a real LaTeX compilation error, not a server issue
                    showError(`LaTeX Compilation Error:\n\n${data.error}\n\nPlease check your LaTeX syntax.`);
                    showStatus('Compilation failed', 'error');
                    showLoading(false);
                    return;
                }
            } else if (response.status === 502 || response.status === 503 || response.status === 504) {
                // Server is starting up, retry
                if (attempt === maxRetries - 1) {
                    throw new Error('Server still starting up after retries');
                }
                console.log(`Server starting (${response.status}), will retry...`);
                continue;
            } else {
                throw new Error('Server error: ' + response.status);
            }
        } catch (backendError) {
            console.log('Backend error:', backendError);

            if (backendError.name === 'AbortError') {
                // Timeout - retry if we have attempts left
                if (attempt < maxRetries - 1) {
                    console.log('Request timed out, will retry...');
                    continue;
                } else {
                    showError('⏱️ Server is taking longer than expected to wake up.\n\n🔄 Please wait 30 seconds and click "Compile" again.\n\nNote: Free tier servers sleep after 15 minutes of inactivity and can take up to 60 seconds to wake up on first request.');
                    showStatus('Timeout - Please retry in 30s', 'error');
                    showLoading(false);
                    return;
                }
            }

            // Network error or other error - retry if we have attempts left
            if (attempt < maxRetries - 1) {
                console.log('Network error, will retry...');
                continue;
            }
        }
    }

    // All retry attempts failed - show helpful error message
    showError('❌ Unable to connect to LaTeX server after multiple attempts.\n\n💡 This usually means:\n• Free tier server is waking up (takes 30-60 seconds)\n• Or temporary network issue\n\n✅ Solution: Wait 30 seconds and click "Compile" again\n\nNote: LaTeX.js browser fallback has limited package support. For full LaTeX features, the backend server is required.');
    showStatus('Server unavailable - Please retry', 'error');
    showLoading(false);
    return;

    // Backend failed or not available, try LaTeX.js (disabled - limited support)
    /* try {
        if (typeof latexjs === 'undefined') {
            throw new Error('Backend server unavailable. If this persists, the server may be restarting. Please wait 30-60 seconds and try again.');
        }

        // Parse and compile LaTeX to HTML
        const generator = latexjs.parse(code, { generator: new latexjs.HtmlGenerator() });
        const htmlDoc = generator.htmlDocument();

        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.background = 'white';
        tempContainer.style.padding = '40px';
        tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
        document.body.appendChild(tempContainer);
        tempContainer.appendChild(htmlDoc.body);

        // Convert HTML to PDF using jsPDF and html2canvas
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });

        document.body.removeChild(tempContainer);

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Convert PDF to base64
        const pdfBase64 = pdf.output('datauristring').split(',')[1];

        currentPdfData = pdfBase64;
        await renderPdf();
        showStatus('Compilation successful (client-side)', 'success');
    } catch (error) {
        console.error('Compilation error:', error);
        const errorMsg = error.message || String(error);

        let helpText = '\n\n💡 Solutions:';
        helpText += '\n1. Start backend server: node server.js (for full LaTeX support)';
        helpText += '\n2. Or simplify your LaTeX for browser compilation:';
        helpText += '\n   • Remove packages (amsmath, geometry, etc.)';
        helpText += '\n   • Use \\documentclass{article} without options';
        helpText += '\n   • Keep formatting basic';

        showError('Compilation failed: ' + errorMsg + helpText);
        showStatus('Compilation error', 'error');
    } finally {
        showLoading(false);
    }
    */
}

// Render PDF
async function renderPdf() {
    if (!currentPdfData) return;

    // Wait for any ongoing render to complete, then cancel it
    if (isRendering && renderTask) {
        try {
            renderTask.cancel();
        } catch (e) {
            // Ignore cancellation errors
        }
        // Wait a bit for the cancellation to take effect
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    isRendering = true;
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');

    try {
        const pdfData = atob(currentPdfData);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Get device pixel ratio for high-DPI displays
        const pixelRatio = window.devicePixelRatio || 1;

        // Render at higher resolution for crisp display
        const scale = currentZoom * pixelRatio * 1.5;
        const viewport = page.getViewport({ scale: scale });

        // Set canvas size to match viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Scale down canvas display size for proper zoom
        canvas.style.width = Math.floor(viewport.width / pixelRatio / 1.5) + 'px';
        canvas.style.height = Math.floor(viewport.height / pixelRatio / 1.5) + 'px';

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        // Store render task so we can cancel it if needed
        renderTask = page.render(renderContext);
        await renderTask.promise;

        canvas.classList.add('active');
    } catch (error) {
        // Ignore cancelled render operations
        if (error.name === 'RenderingCancelledException') {
            console.log('Render cancelled, will retry with new zoom');
            return;
        }

        console.error('Error rendering PDF:', error);
        showError('Error rendering PDF: ' + error.message);
    } finally {
        isRendering = false;
        renderTask = null;
    }
}

// Download PDF
function downloadPdf() {
    if (!currentPdfData) {
        alert('Please compile the document first!');
        return;
    }

    const blob = base64ToBlob(currentPdfData, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    a.click();
    URL.revokeObjectURL(url);
    showStatus('PDF downloaded', 'success');
}

// Note: DOCX conversion removed - requires server-side processing

// Utility Functions
function base64ToBlob(base64, type) {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type });
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('pdfCanvas').classList.remove('active');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function hideWelcome() {
    document.getElementById('welcomeMessage').classList.add('hidden');
}

function showStatus(text, type = 'ready') {
    const statusText = document.getElementById('statusText');
    const iconClass = type === 'success' ? 'status-ready' :
        type === 'error' ? 'status-error' :
            type === 'compiling' ? 'status-compiling' : 'status-ready';

    statusText.innerHTML = `<i class="fas fa-circle ${iconClass}"></i> ${text}`;
}

function updateStatusBar() {
    const position = editor.getPosition();
    document.getElementById('lineCol').textContent = `Line ${position.lineNumber}, Col ${position.column}`;
}

function loadTemplate(templateName) {
    if (TEMPLATES[templateName]) {
        editor.setValue(TEMPLATES[templateName]);
        showStatus('Template loaded', 'success');
    }
}

function newDocument() {
    if (confirm('Create a new document? Current changes will be saved.')) {
        if (currentFileName && settings.autoSave) {
            saveCurrentFile();
        }
        createNewFile();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');

    if (editor) {
        editor.updateOptions({
            theme: isDark ? 'vs-dark' : 'vs'
        });
    }

    // Update both theme toggle buttons
    const editorIcon = document.querySelector('#themeToggle i');
    const homeIcon = document.querySelector('#homeThemeToggle i');

    if (editorIcon) {
        editorIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (homeIcon) {
        homeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function saveToLocalStorage() {
    // Save current file if it exists
    if (currentFileName && settings.autoSave) {
        saveCurrentFile();
    } else {
        // Legacy: still save to latexCode for backward compatibility
        localStorage.setItem('latexCode', editor.getValue());
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('latexCode');
    if (saved) {
        editor.setValue(saved);
    }

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        editor.updateOptions({ theme: 'vs-dark' });
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('autoCompile').checked = settings.autoCompile;
        document.getElementById('autoSave').checked = settings.autoSave;
        document.getElementById('compileDelay').value = settings.compileDelay;
    }
}

function initializeResizer() {
    const resizer = document.querySelector('.resizer');
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');

    let isResizing = false;
    let lastX = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        lastX = e.clientX;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const container = document.querySelector('.main-container');
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        const minWidth = 200;
        const maxWidth = containerRect.width - minWidth - 5;

        if (newLeftWidth > minWidth && newLeftWidth < maxWidth) {
            editorPane.style.flex = `0 0 ${newLeftWidth}px`;
            previewPane.style.flex = `1`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Initialize on load
window.addEventListener('load', () => {
    console.log('LaTeX Editor initialized');
    loadSavedFiles();
    showHomepage();

    // Check if LaTeX.js is loaded
    setTimeout(() => {
        if (typeof latexjs !== 'undefined') {
            initLaTeXJS();
            showStatus('LaTeX engine ready', 'success');
        } else {
            console.warn('LaTeX.js library not loaded. Will try on first compile.');
        }
    }, 500);
});
