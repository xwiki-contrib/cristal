#!/bin/bash

# Script to move all subkeys from "exports" to root level in package.json files

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Finding all package.json files with exports key...${NC}"

# Find all package.json files, excluding node_modules
package_files=$(find . -name "package.json" -not -path "*/node_modules/*" | sort)

if [ -z "$package_files" ]; then
    echo -e "${YELLOW}No package.json files found!${NC}"
    exit 1
fi

# Counter for modified files
modified_count=0
files_with_exports=0

# Process each package.json file
while IFS= read -r package_file; do
    # Check if the file exists and is readable
    if [ ! -r "$package_file" ]; then
        echo -e "${YELLOW}Warning: Cannot read $package_file, skipping...${NC}"
        continue
    fi
    
    # Check if file has exports key using Node.js
    has_exports=$(node -e "
        const fs = require('fs');
        try {
            const pkg = JSON.parse(fs.readFileSync('$package_file', 'utf8'));
            console.log(pkg.exports ? 'true' : 'false');
        } catch (error) {
            console.log('false');
        }
    ")
    
    if [ "$has_exports" = "false" ]; then
        continue
    fi
    
    files_with_exports=$((files_with_exports + 1))
    echo -e "${BLUE}Processing: $package_file${NC}"
    
    # Create a backup
    cp "$package_file" "$package_file.backup"
    
    # Use Node.js to safely modify the JSON
    node -e "
        const fs = require('fs');
        const path = '$package_file';
        
        try {
            const content = fs.readFileSync(path, 'utf8');
            let pkg;
            
            try {
                pkg = JSON.parse(content);
            } catch (parseError) {
                console.error('✗ Invalid JSON in', path, ':', parseError.message);
                process.exit(1);
            }
            
            if (!pkg.exports) {
                console.log('  ℹ No exports key found, skipping');
                process.exit(0);
            }
            
            if (typeof pkg.exports !== 'object' || pkg.exports === null) {
                console.log('  ℹ Exports is not an object, skipping');
                process.exit(0);
            }
            
            // Log what we're about to do
            const exportKeys = Object.keys(pkg.exports);
            console.log('  ℹ Found exports keys:', exportKeys.join(', '));
            
            let changesMode = false;
            const overwrittenKeys = [];
            
            // Move each key from exports to root level
            for (const key of exportKeys) {
                if (pkg.hasOwnProperty(key) && pkg[key] !== pkg.exports[key]) {
                    overwrittenKeys.push(key);
                }
                pkg[key] = pkg.exports[key];
                changesMode = true;
            }
            
            if (overwrittenKeys.length > 0) {
                console.log('  ⚠ Overwritten existing keys:', overwrittenKeys.join(', '));
            }
            
            // Remove the exports key
            delete pkg.exports;
            console.log('  ✓ Moved', exportKeys.length, 'keys from exports to root level');
            console.log('  ✓ Removed exports key');
            
            // Write back with proper formatting
            fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\\n');
            
        } catch (error) {
            console.error('  ✗ Error processing', path, ':', error.message);
            process.exit(1);
        }
    "
    
    if [ $? -eq 0 ]; then
        modified_count=$((modified_count + 1))
        # Remove backup on success
        rm "$package_file.backup"
        echo -e "  ${GREEN}Successfully updated $package_file${NC}"
    else
        # Restore backup on error
        echo -e "  ${RED}Restoring backup for $package_file${NC}"
        mv "$package_file.backup" "$package_file"
    fi
    
    echo
done <<< "$package_files"

echo -e "${GREEN}Summary:${NC}"
echo -e "${GREEN}Found $files_with_exports files with exports key${NC}"
echo -e "${GREEN}Successfully modified $modified_count package.json files${NC}"

if [ $modified_count -gt 0 ]; then
    echo
    echo -e "${BLUE}All subkeys from 'exports' have been moved to the root level${NC}"
    echo -e "${BLUE}The 'exports' key has been removed from all processed files${NC}"
    echo
    echo -e "${YELLOW}Note: If any existing root-level keys were overwritten, warnings were shown above${NC}"
fi