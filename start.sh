#!/bin/bash

# LaTeX Editor Startup Script
# This script helps you start the LaTeX Editor quickly

echo "=========================================="
echo "   LaTeX Editor - Startup Script"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm found:${NC} $(npm --version)"
fi

# Check if LaTeX is installed
if ! command -v pdflatex &> /dev/null; then
    echo -e "${YELLOW}⚠ pdflatex not found${NC}"
    echo "  LaTeX compilation will not work without it."
    echo "  Install on macOS: brew install --cask basictex"
    echo ""
else
    echo -e "${GREEN}✓ pdflatex found${NC}"
fi

# Check if Pandoc is installed (optional)
if ! command -v pandoc &> /dev/null; then
    echo -e "${YELLOW}⚠ pandoc not found (optional)${NC}"
    echo "  Word export (.docx) will not work without it."
    echo "  Install on macOS: brew install pandoc"
    echo ""
else
    echo -e "${GREEN}✓ pandoc found${NC}"
fi

echo ""
echo "=========================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo -e "${GREEN}Starting backend server...${NC}"
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Open index.html in your browser to use the editor"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo "=========================================="
echo ""

npm start
