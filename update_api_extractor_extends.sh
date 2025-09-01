#!/bin/bash

# Script to update "extends" key in all api-extractor.json files to point to root config

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Target file at monorepo root
TARGET_CONFIG="api-extractor.ae-missing-release-tag.json"

echo -e "${BLUE}Finding all api-extractor.json files in subfolders...${NC}"

# Find all api-extractor.json files, excluding the root one
api_extractor_files=$(find . -name "api-extractor.json" -not -path "./api-extractor.json" | sort)

if [ -z "$api_extractor_files" ]; then
    echo -e "${YELLOW}No api-extractor.json files found in subfolders!${NC}"
    exit 1
fi

# Check if target config exists at root
if [ ! -f "$TARGET_CONFIG" ]; then
    echo -e "${RED}Warning: Target config file '$TARGET_CONFIG' not found at monorepo root!${NC}"
    echo -e "${YELLOW}The script will still update the extends paths, but you'll need to create this file.${NC}"
    echo
fi

echo -e "${GREEN}Found the following api-extractor.json files:${NC}"
echo "$api_extractor_files"
echo

# Function to calculate relative path
calculate_relative_path() {
    local file_path="$1"
    local file_dir=$(dirname "$file_path")
    local depth=$(echo "$file_dir" | tr -cd '/' | wc -c)
    
    if [ "$depth" -eq 1 ]; then
        echo "../$TARGET_CONFIG"
    else
        local relative_path=""
        for ((i=1; i<depth; i++)); do
            relative_path="../$relative_path"
        done
        echo "$relative_path../$TARGET_CONFIG"
    fi
}

# Counter for modified files
modified_count=0

# Process each api-extractor.json file
while IFS= read -r config_file; do
    echo -e "${BLUE}Processing: $config_file${NC}"
    
    # Check if the file exists and is readable
    if [ ! -r "$config_file" ]; then
        echo -e "${YELLOW}Warning: Cannot read $config_file, skipping...${NC}"
        continue
    fi
    
    # Calculate the relative path to the root config
    relative_path=$(calculate_relative_path "$config_file")
    echo -e "  ${BLUE}Calculated relative path: $relative_path${NC}"
    
    # Create a backup
    cp "$config_file" "$config_file.backup"
    
    # Use Node.js to safely modify the JSON
    node -e "
        const fs = require('fs');
        const path = '$config_file';
        const relativePath = '$relative_path';
        
        try {
            const content = fs.readFileSync(path, 'utf8');
            let config;
            
            try {
                config = JSON.parse(content);
            } catch (parseError) {
                console.error('✗ Invalid JSON in', path, ':', parseError.message);
                process.exit(1);
            }
            
            // Check if extends key exists
            if (!config.extends) {
                console.log('  ℹ No \"extends\" key found in', path, '- adding it');
                config.extends = relativePath;
            } else {
                console.log('  ℹ Current extends value:', config.extends);
                config.extends = relativePath;
            }
            
            // Write back with proper formatting
            fs.writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
            console.log('  ✓ Updated extends to:', relativePath);
        } catch (error) {
            console.error('  ✗ Error processing', path, ':', error.message);
            process.exit(1);
        }
    "
    
    if [ $? -eq 0 ]; then
        modified_count=$((modified_count + 1))
        # Remove backup on success
        rm "$config_file.backup"
        echo -e "  ${GREEN}Successfully updated $config_file${NC}"
    else
        # Restore backup on error
        echo -e "  ${RED}Restoring backup for $config_file${NC}"
        mv "$config_file.backup" "$config_file"
    fi
    
    echo
done <<< "$api_extractor_files"

echo -e "${GREEN}Summary:${NC}"
echo -e "${GREEN}Successfully modified $modified_count api-extractor.json files${NC}"

if [ $modified_count -gt 0 ]; then
    echo
    echo -e "${BLUE}All api-extractor.json files now extend from:${NC}"
    echo -e "${GREEN}$TARGET_CONFIG${NC}"
    echo
    if [ ! -f "$TARGET_CONFIG" ]; then
        echo -e "${YELLOW}Don't forget to create the base configuration file at:${NC}"
        echo -e "${YELLOW}$(pwd)/$TARGET_CONFIG${NC}"
    fi
fi