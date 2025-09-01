#!/bin/bash

# Script to add "api-extractor:local" script to all package.json files in a pnpm monorepo

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Finding all package.json files in the monorepo...${NC}"

# Find all package.json files, excluding node_modules
package_files=$(find . -name "package.json" -not -path "*/node_modules/*" | sort)

if [ -z "$package_files" ]; then
    echo -e "${YELLOW}No package.json files found!${NC}"
    exit 1
fi

echo -e "${GREEN}Found the following package.json files:${NC}"
echo "$package_files"
echo

# Counter for modified files
modified_count=0

# Process each package.json file
while IFS= read -r package_file; do
    echo -e "${BLUE}Processing: $package_file${NC}"
    
    # Check if the file exists and is readable
    if [ ! -r "$package_file" ]; then
        echo -e "${YELLOW}Warning: Cannot read $package_file, skipping...${NC}"
        continue
    fi
    
    # Check if the script already exists
    if grep -q '"api-extractor:local"' "$package_file"; then
        echo -e "${YELLOW}Script 'api-extractor:local' already exists in $package_file, skipping...${NC}"
        continue
    fi
    
    # Create a backup
    cp "$package_file" "$package_file.backup"
    
    # Use Node.js to safely modify the JSON
    node -e "
        const fs = require('fs');
        const path = '$package_file';
        
        try {
            const content = fs.readFileSync(path, 'utf8');
            const pkg = JSON.parse(content);
            
            // Initialize scripts object if it doesn't exist
            if (!pkg.scripts) {
                pkg.scripts = {};
            }
            
            // Add the new script
            pkg.scripts['api-extractor:local'] = 'api-extractor run --local';
            
            // Write back with proper formatting
            fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
            console.log('✓ Successfully added script to $package_file');
        } catch (error) {
            console.error('✗ Error processing $package_file:', error.message);
            process.exit(1);
        }
    "
    
    if [ $? -eq 0 ]; then
        modified_count=$((modified_count + 1))
        # Remove backup on success
        rm "$package_file.backup"
    else
        # Restore backup on error
        echo -e "${YELLOW}Restoring backup for $package_file${NC}"
        mv "$package_file.backup" "$package_file"
    fi
    
    echo
done <<< "$package_files"

echo -e "${GREEN}Summary:${NC}"
echo -e "${GREEN}Successfully modified $modified_count package.json files${NC}"

if [ $modified_count -gt 0 ]; then
    echo
    echo -e "${BLUE}The following script has been added to all applicable package.json files:${NC}"
    echo -e "${GREEN}\"api-extractor:local\": \"api-extractor run --local\"${NC}"
    echo
    echo -e "${YELLOW}Note: You can now run the script in any package using:${NC}"
    echo -e "${YELLOW}  pnpm run api-extractor:local${NC}"
    echo -e "${YELLOW}Or run it across all packages from the root:${NC}"
    echo -e "${YELLOW}  pnpm -r run api-extractor:local${NC}"
fi