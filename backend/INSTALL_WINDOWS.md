# Installing Dependencies on Windows

## Problem
The `web3` package requires `lru-dict`, which needs C++ build tools on Windows.

## Solution Options

### Option 1: Install Microsoft C++ Build Tools (Recommended)

1. Download and install **Microsoft C++ Build Tools**:
   - Visit: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Download "Build Tools for Visual Studio"
   - During installation, select "C++ build tools" workload
   - This is a large download (~3-6 GB) but ensures all packages can compile

2. After installation, restart your terminal and try again:
   ```bash
   pip install -r requirements.txt
   ```

### Option 2: Use Pre-built Wheels (Quick Fix)

Try installing from a wheel repository that has pre-built Windows wheels:

```bash
# First, upgrade pip, setuptools, and wheel
python -m pip install --upgrade pip setuptools wheel

# Try installing web3 directly (it may have pre-built wheels)
pip install web3

# Then install other requirements
pip install -r requirements.txt
```

### Option 3: Use Alternative Installation Method

If the above doesn't work, try installing packages individually:

```bash
# Install base packages first
pip install fastapi uvicorn pydantic python-multipart python-dotenv

# Try installing web3 with no cache
pip install --no-cache-dir web3

# If that fails, try installing from a different source
pip install web3 --prefer-binary
```

### Option 4: Use Conda (Alternative)

If you have Anaconda/Miniconda installed:

```bash
conda install -c conda-forge web3
pip install -r requirements.txt
```

### Option 5: Simplified Blockchain Service (Development Only)

If you're just testing and don't need full blockchain functionality yet, you can temporarily modify the blockchain service to work without web3:

1. Comment out the web3 import in `blockchain_service.py`
2. Use a mock/stub implementation for development
3. Full blockchain features will work once web3 is installed

## Recommended Approach

For a **research project**, I recommend **Option 1** (Install Build Tools) because:
- It's a one-time setup
- Ensures all Python packages can install
- Needed for many scientific Python packages
- Takes 30-60 minutes but solves the problem permanently

## Quick Test After Installation

Once dependencies are installed, test the blockchain service:

```bash
cd backend
python -c "from app.services.blockchain_service import BlockchainService; print('Import successful!')"
```

If you see "Import successful!", the installation worked!

## Troubleshooting

If you still get errors:

1. **Check Python version**: Should be 3.8+
   ```bash
   python --version
   ```

2. **Try virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Clear pip cache**:
   ```bash
   pip cache purge
   pip install -r requirements.txt
   ```


