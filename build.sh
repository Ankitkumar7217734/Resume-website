#!/bin/bash

# Render.com Build Script for LaTeX Editor
echo "Starting build process..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install TeX Live (comprehensive LaTeX distribution)
echo "Installing TeX Live with all necessary packages..."
apt-get update
apt-get install -y \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-xetex \
    texlive-luatex \
    texlive-latex-recommended \
    texlive-science \
    texlive-pictures

# Install Pandoc for DOCX conversion
echo "Installing Pandoc..."
apt-get install -y pandoc

echo "Build completed successfully!"
