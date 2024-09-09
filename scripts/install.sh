#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Node.js
install_node() {
    if command_exists node; then
        echo "Node.js is already installed."
    else
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
}

# Install RPM
install_rpm() {
    if command_exists rpm; then
        echo "RPM is already installed."
    else
        echo "Installing RPM..."
        sudo apt-get install -y rpm
    fi
}

# Main script execution
echo "Starting the install process..."

install_node
install_rpm
install_typescript

echo "Installation complete!"
