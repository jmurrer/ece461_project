// packageService.js

export interface Package {
    name: string;
    version: string;
    readme: string;
  }
  
  // Sample package data (this can be replaced with actual URL-based queries or from a database)
  const packageRegistry: Package[] = [
    { name: 'Underscore', version: '1.2.3', readme: 'A utility library.' },
    { name: 'Lodash', version: '4.17.21', readme: 'Modular utilities.' },
    { name: 'React', version: '17.0.2', readme: 'A JavaScript library for building user interfaces.' },
  ];
  
  // Function to search packages using a regular expression
  export async function searchPackagesByRegex(RegEx: string): Promise<Package[]> {
    const regex = new RegExp(RegEx, 'i'); // Create a case-insensitive RegEx
    return packageRegistry.filter(pkg => regex.test(pkg.name) || regex.test(pkg.readme));
  }
  