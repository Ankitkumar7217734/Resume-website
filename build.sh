#!/bin/bash

# Render.com Build Script for LaTeX Editor
echo "Starting build process..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install TeX Live (minimal LaTeX distribution)
echo "Installing TeX Live..."
apt-get update
apt-get install -y texlive-latex-base texlive-latex-extra texlive-fonts-recommended

# Install Pandoc for DOCX conversion
echo "Installing Pandoc..."
apt-get install -y pandoc

echo "Build completed successfully!"
