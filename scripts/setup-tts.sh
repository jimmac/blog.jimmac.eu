#!/bin/bash
# Setup script for Chatterbox TTS
# Works on macOS and Linux

set -e  # Exit on error

echo "=== Chatterbox TTS Setup ==="
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM="GNOME OS";;
    Darwin*)    PLATFORM="macOS";;
    *)          PLATFORM="UNKNOWN:${OS}"
esac

echo "Platform: $PLATFORM"
echo ""

# Check Python 3.10
echo "Checking for Python 3.10..."
if ! command -v python3.10 &> /dev/null; then
    echo "ERROR: Python 3.10 not found"
    echo ""
    echo "Please install Python 3.10 via Homebrew:"
    echo "  brew install python@3.10"
    exit 1
fi

PYTHON_VERSION=$(python3.10 --version)
echo "Found: $PYTHON_VERSION"
echo ""

# Check ffmpeg
echo "Checking for ffmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: ffmpeg not found"
    echo ""
    echo "Please install ffmpeg via Homebrew:"
    echo "  brew install ffmpeg"
    exit 1
fi

FFMPEG_VERSION=$(ffmpeg -version | head -1)
echo "Found: $FFMPEG_VERSION"
echo ""

# Create virtual environment
VENV_DIR="venv-py310"
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment already exists at $VENV_DIR"
    read -p "Remove and recreate? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing old environment..."
        rm -rf "$VENV_DIR"
    else
        echo "Using existing environment"
    fi
fi

if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python 3.10 virtual environment..."
    python3.10 -m venv "$VENV_DIR"
    echo "Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null
echo ""

# Install dependencies
echo "Installing dependencies (this may take a few minutes)..."
if [ -f "requirements-tts.txt" ]; then
    echo "Installing from requirements-tts.txt..."
    pip install -r requirements-tts.txt
else
    echo "Installing packages manually..."
    pip install chatterbox-tts torch torchaudio scipy
fi
echo ""

# Downgrade setuptools for pkg_resources
echo "Downgrading setuptools for compatibility..."
pip install 'setuptools<72' > /dev/null
echo ""

# Verify installation
echo "Verifying installation..."
python -c "from chatterbox.tts_turbo import ChatterboxTurboTTS; print('✓ Chatterbox import successful')"
python -c "import torch; print(f'✓ PyTorch {torch.__version__}')"
python -c "import scipy; print(f'✓ SciPy {scipy.__version__}')"
echo ""

# Check for voice reference
VOICE_REF="scripts/voice_reference_10s.wav"
if [ ! -f "$VOICE_REF" ]; then
    echo "⚠ WARNING: Voice reference not found at $VOICE_REF"
    echo ""
    echo "You need a 10-second audio clip of the voice to clone."
    echo "To create it from your audio file:"
    echo ""
    echo "  ffmpeg -i ~/path/to/your-recording.m4a \\"
    echo "    -t 10 -ar 24000 -ac 1 \\"
    echo "    $VOICE_REF"
    echo ""
else
    echo "✓ Voice reference found: $VOICE_REF"
    DURATION=$(ffprobe -v quiet -show_format "$VOICE_REF" | grep duration= | cut -d= -f2)
    echo "  Duration: ${DURATION}s"
    echo ""
fi

# Make scripts executable
chmod +x scripts/generate-tts.py 2>/dev/null || true
chmod +x scripts/test-chatterbox.py 2>/dev/null || true

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo ""
echo "1. Activate the environment:"
echo "   source $VENV_DIR/bin/activate"
echo ""
if [ ! -f "$VOICE_REF" ]; then
    echo "2. Create voice reference (see warning above)"
    echo ""
    echo "3. Test generation:"
else
    echo "2. Test generation:"
fi
echo "   ./scripts/generate-tts.py content/posts/POST-NAME"
echo ""
echo "4. Generate all posts:"
echo "   ./scripts/generate-tts.py --all"
echo ""
echo "See TTS.md for full documentation."
