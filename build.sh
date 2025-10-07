#!/bin/bash
set -e  # Exit on error

# Render.com Build Script for LaTeX Editor
echo "Starting build process..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install || { echo "npm install failed"; exit 1; }

# Install TeX Live - optimized for faster builds
echo "Installing TeX Live (this may take 2-3 minutes)..."
apt-get update -qq
apt-get install -y -qq \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    pandoc

echo "Build completed successfully!"
echo "LaTeX packages installed. Ready to compile documents."
