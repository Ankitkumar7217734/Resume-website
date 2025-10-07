#!/bin/bash

# System Check Script for LaTeX Editor
# This script verifies all prerequisites are installed

echo "================================================"
echo "  LaTeX Editor - System Requirements Check"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

all_good=true

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        version=$($1 $2 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $3: ${GREEN}INSTALLED${NC}"
        echo -e "  Version: $version"
        return 0
    else
        echo -e "${RED}✗${NC} $3: ${RED}NOT FOUND${NC}"
        echo -e "  ${YELLOW}Install: $4${NC}"
        all_good=false
        return 1
    fi
}

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
check_command "node" "--version" "Node.js" "https://nodejs.org/"
echo ""

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
check_command "npm" "--version" "npm" "comes with Node.js"
echo ""

# Check LaTeX
echo -e "${BLUE}Checking LaTeX...${NC}"
if check_command "pdflatex" "--version" "pdflatex (LaTeX)" "brew install --cask basictex"; then
    echo -e "  ${GREEN}LaTeX compilation: ENABLED${NC}"
else
    echo -e "  ${RED}LaTeX compilation: DISABLED${NC}"
    echo -e "  ${YELLOW}The editor will not be able to compile documents!${NC}"
fi
echo ""

# Check Pandoc (optional)
echo -e "${BLUE}Checking Pandoc (optional)...${NC}"
if check_command "pandoc" "--version" "Pandoc" "brew install pandoc"; then
    echo -e "  ${GREEN}Word export: ENABLED${NC}"
else
    echo -e "  ${YELLOW}Word export: DISABLED${NC}"
    echo -e "  ${YELLOW}You won't be able to download .docx files${NC}"
fi
echo ""

# Check node_modules
echo -e "${BLUE}Checking Node.js dependencies...${NC}"
if [ -d "node_modules" ]; then
    package_count=$(ls -1 node_modules | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${NC} Dependencies: ${GREEN}INSTALLED${NC}"
    echo -e "  Packages: $package_count"
else
    echo -e "${RED}✗${NC} Dependencies: ${RED}NOT INSTALLED${NC}"
    echo -e "  ${YELLOW}Run: npm install${NC}"
    all_good=false
fi
echo ""

# Check port 3000
echo -e "${BLUE}Checking port 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 3000: ${YELLOW}IN USE${NC}"
    echo -e "  ${YELLOW}Stop the process or use a different port${NC}"
else
    echo -e "${GREEN}✓${NC} Port 3000: ${GREEN}AVAILABLE${NC}"
fi
echo ""

# Summary
echo "================================================"
if [ "$all_good" = true ]; then
    echo -e "${GREEN}✓ ALL REQUIRED COMPONENTS READY!${NC}"
    echo ""
    echo "You can start the editor now:"
    echo "  1. Run: npm start"
    echo "  2. Open index.html in your browser"
    echo ""
else
    echo -e "${YELLOW}⚠ SOME COMPONENTS MISSING${NC}"
    echo ""
    echo "Please install the missing components listed above."
    echo ""
fi
echo "================================================"
echo ""

# Additional info
echo "For more information:"
echo "  • Quick Start: QUICKSTART.md"
echo "  • Full Docs: README.md"
echo "  • User Guide: Open user-guide.html in browser"
echo ""
