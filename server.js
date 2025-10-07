const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Guard to prevent missing graphics from aborting compilation
const GRAPHICS_GUARD = `
% Automatically injected guard to prevent missing graphics from aborting compilation
\\makeatletter
\\let\\OriginalIncludeGraphics\\includegraphics
\\renewcommand{\\includegraphics}[2][]{%
    \\IfFileExists{#2}{%
        \\OriginalIncludeGraphics[#1]{#2}%
    }{%
        \\GenericWarning{}{Graphic file '#2' not found. Placeholder inserted.}%
        \\fbox{Missing image}%
    }%
}
\\makeatother
`;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Temporary directory for compilation
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating temp directory:', error);
    }
}

ensureTempDir();

// Clean up old files (older than 1 hour)
async function cleanupOldFiles() {
    try {
        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtimeMs > maxAge) {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Error cleaning up old files:', error);
    }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

// Compile LaTeX to PDF
app.post('/compile', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'No LaTeX code provided' });
    }

    const jobId = uuidv4();
    const jobDir = path.join(TEMP_DIR, jobId);
    const texFile = path.join(jobDir, 'document.tex');
    const pdfFile = path.join(jobDir, 'document.pdf');

    try {
        // Create job directory
        await fs.mkdir(jobDir, { recursive: true });

        // Inject guard for missing graphics when needed
        const guardedCode = injectGraphicsGuard(code);

        // Write LaTeX code to file
        await fs.writeFile(texFile, guardedCode, 'utf8');

        // Compile LaTeX to PDF using pdflatex
        // Run twice to resolve references
        // Note: We ignore errors here because some non-fatal errors (like missing images) 
        // still produce valid PDFs. We check for PDF existence instead.
        try {
            await execPromise(`pdflatex -interaction=nonstopmode -output-directory="${jobDir}" "${texFile}"`, { timeout: 30000 });
        } catch (error) {
            // First pass may fail, but we still try second pass
            console.log('First pdflatex pass had warnings/errors, continuing...');
        }
        try {
            await execPromise(`pdflatex -interaction=nonstopmode -output-directory="${jobDir}" "${texFile}"`, { timeout: 30000 });
        } catch (error) {
            // Second pass may also fail, but we check for PDF below
            console.log('Second pdflatex pass had warnings/errors, checking for PDF...');
        }

        // Check if PDF was created
        try {
            await fs.access(pdfFile);
        } catch (error) {
            // Try to read log file for error details
            const logFile = path.join(jobDir, 'document.log');
            let errorMessage = 'Compilation failed.';
            let fullLog = '';

            try {
                const logContent = await fs.readFile(logFile, 'utf8');
                fullLog = logContent;
                const errorLines = extractErrorFromLog(logContent);
                if (errorLines) {
                    errorMessage = errorLines;
                } else {
                    // If no specific error found, check for missing packages
                    if (logContent.includes('! LaTeX Error: File') && logContent.includes('.sty\' not found')) {
                        const styMatch = logContent.match(/File `([^']+\.sty)' not found/);
                        if (styMatch) {
                            errorMessage = `Missing LaTeX package: ${styMatch[1]}\n\nThis package is not installed on the server. Please simplify your LaTeX or use only basic packages.`;
                        }
                    } else {
                        errorMessage = 'Compilation failed. Please check your LaTeX syntax.';
                    }
                }
            } catch (logError) {
                // Log file not available
                errorMessage = 'Compilation failed and no log file was generated.';
            }

            // Log the full error for debugging
            console.error('LaTeX compilation failed. Full log:\n', fullLog.slice(-1000)); // Last 1000 chars

            return res.json({ success: false, error: errorMessage });
        }

        // Read PDF file and convert to base64
        const pdfBuffer = await fs.readFile(pdfFile);
        const pdfBase64 = pdfBuffer.toString('base64');

        // Clean up job directory
        await cleanupJobDir(jobDir);

        res.json({ success: true, pdf: pdfBase64 });

    } catch (error) {
        console.error('Compilation error:', error);

        // Try to clean up
        try {
            await cleanupJobDir(jobDir);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }

        let errorMessage = 'Compilation failed: ';
        if (error.killed) {
            errorMessage += 'Compilation timeout (took too long)';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Unknown error';
        }

        res.json({ success: false, error: errorMessage });
    }
});

// Convert LaTeX to DOCX using Pandoc
app.post('/convert-to-docx', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'No LaTeX code provided' });
    }

    const jobId = uuidv4();
    const jobDir = path.join(TEMP_DIR, jobId);
    const texFile = path.join(jobDir, 'document.tex');
    const docxFile = path.join(jobDir, 'document.docx');

    try {
        // Create job directory
        await fs.mkdir(jobDir, { recursive: true });

        // Write LaTeX code to file
        await fs.writeFile(texFile, code, 'utf8');

        // Convert to DOCX using Pandoc
        await execPromise(`pandoc "${texFile}" -o "${docxFile}" --from latex --to docx`, { timeout: 30000 });

        // Check if DOCX was created
        try {
            await fs.access(docxFile);
        } catch (error) {
            return res.json({
                success: false,
                error: 'Conversion failed. Make sure Pandoc is installed (brew install pandoc)'
            });
        }

        // Read DOCX file and convert to base64
        const docxBuffer = await fs.readFile(docxFile);
        const docxBase64 = docxBuffer.toString('base64');

        // Clean up job directory
        await cleanupJobDir(jobDir);

        res.json({ success: true, docx: docxBase64 });

    } catch (error) {
        console.error('Conversion error:', error);

        // Try to clean up
        try {
            await cleanupJobDir(jobDir);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }

        let errorMessage = 'Conversion failed: ';
        if (error.killed) {
            errorMessage += 'Conversion timeout';
        } else if (error.message.includes('pandoc')) {
            errorMessage += 'Pandoc not found. Install with: brew install pandoc';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Unknown error';
        }

        res.json({ success: false, error: errorMessage });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LaTeX Editor Backend is running' });
});

// Helper function to execute commands with Promise
function execPromise(command, options = {}) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                error.stdout = stdout;
                error.stderr = stderr;
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

// Helper function to extract error information from LaTeX log
function extractErrorFromLog(logContent) {
    const lines = logContent.split('\n');
    const errorLines = [];
    let inError = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes('!') || line.includes('Error:')) {
            inError = true;
            errorLines.push(line);
        } else if (inError) {
            errorLines.push(line);
            if (line.trim() === '' || errorLines.length > 10) {
                break;
            }
        }
    }

    return errorLines.length > 0 ? errorLines.join('\n') : null;
}

// Helper function to clean up job directory
async function cleanupJobDir(jobDir) {
    try {
        const files = await fs.readdir(jobDir);
        for (const file of files) {
            await fs.unlink(path.join(jobDir, file));
        }
        await fs.rmdir(jobDir);
    } catch (error) {
        console.error('Error cleaning up job directory:', error);
    }
}

// Helper to insert missing-graphic guard after \documentclass when needed
function injectGraphicsGuard(code) {
    if (!code || !code.includes('\\includegraphics')) {
        return code;
    }

    const docclassRegex = /\\documentclass[^\n]*\n/;
    const match = docclassRegex.exec(code);

    if (match) {
        const insertPosition = match.index + match[0].length;
        return code.slice(0, insertPosition) + GRAPHICS_GUARD + '\n' + code.slice(insertPosition);
    }

    return `${GRAPHICS_GUARD}\n${code}`;
}


// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`LaTeX Editor Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server ready to accept connections`);
    
    if (process.env.RENDER) {
        console.log('Running on Render.com');
    } else {
        console.log('\nMake sure you have the following installed:');
        console.log('1. LaTeX distribution (MacTeX, TeX Live, or MiKTeX)');
        console.log('   Install on macOS: brew install --cask mactex');
        console.log('2. Pandoc (for Word export)');
        console.log('   Install on macOS: brew install pandoc');
        console.log('\nPress Ctrl+C to stop the server\n');
    }
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await cleanupOldFiles();
    process.exit(0);
});
