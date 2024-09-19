// takes as input URL and returns a score
export async function netScore(url: string): Promise<string> {
  let data;

  // fetch data from GitHub and npm APIs
  if (url.includes("github.com")) {
    // console.log("Fetching GitHub data...");
    try {
      data = await fetchGitHubData(url);
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching GitHub data");
    }
  } else if (url.includes("npmjs.com")) {
    try {
      // console.log("Fetching NPM data...");
      data = await fetchNpmData(url);
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching npm data");
    }
  } else {
    console.error("Invalid URL");
    throw new Error("Invalid URL");
  }
  // console.log(data)


  // store intermediate scores
  let m_b: number = busFactorScore();
  let m_c: number = correctnessScore();
  let m_r: number = await rampUpScore(url);
  let m_rm: number = responsivenessScore();
  let m_l: number = licenseScore(data);

  // store weights
  let w_b: number = 0.2;
  let w_c: number = 0.25;
  let w_r: number = 0.15;
  let w_rm: number = 0.3;
  let w_l: number = 0.1;

  // calculate score
  let mainScore: number =  w_b * m_b + w_c * m_c + w_r * m_r + w_rm * m_rm + w_l * m_l;
  
  // construct result object, JSONify, then return
  const result = {
    mainScore: mainScore,
    scores: {
      busFactor: { score: m_b, weight: w_b },
      correctness: { score: m_c, weight: w_c },
      rampUp: { score: m_r, weight: w_r },
      responsiveness: { score: m_rm, weight: w_rm },
      license: { score: m_l, weight: w_l }
    }
  };

  return JSON.stringify(result, null, 2);
}

// analyzes bus factor and returns M_b(r) as specified
// in project plan
function busFactorScore(): number {
  return -1;
}

// analyzes reliability/quality of codebase
// and returns M_c,normalized(r) as specified in project plan
function correctnessScore(): number {
  return -1;
}

// Analyzes presence and completeness of relevant documentation
// for new developers and return M_r(r) as specified in project plan
async function rampUpScore(repoUrl: string): Promise<number> {
    
// Skip npm stuff
  if (!repoUrl.includes("github.com")) {
    console.log("Skipping: Not a GitHub URL");
    return 0;
  }

  let documentationScore = 0;
  let organizationScore = 0;
  let setupScore = 0;
  let testScore = 0;
  let ciCdScore = 0;

  try {
    const files: File[] = await fetchRepoContents(repoUrl); // Changed `any` to `File[]`

    // Here check for the presence of common files and directories, we can expand on this...

    // Check for README.md
    const readmeExists = files.some((file: File) => file.name.toLowerCase() === 'readme.md'); // Changed `any` to `File`
    if (readmeExists) {
      documentationScore += 1;
    }

    // Check for CONTRIBUTING.md
    const contributingExists = files.some((file: File) => file.name.toLowerCase() === 'contributing.md'); // Changed `any` to `File`
    if (contributingExists) {
      documentationScore += 1;
    }

    // Check for src/ and test/ directories
    const srcExists = files.some((file: File) => file.type === 'dir' && file.name.toLowerCase() === 'src'); // Changed `any` to `File`
    const testExists = files.some((file: File) => file.type === 'dir' && file.name.toLowerCase() === 'test'); // Changed `any` to `File`
    if (srcExists) organizationScore += 1;
    if (testExists) organizationScore += 1;

    // Check for package.json, requirements.txt, or similar
    const setupFiles = ['package.json', 'requirements.txt', 'build.gradle', 'pom.xml'];
    const setupFileExists = files.some((file: File) => setupFiles.includes(file.name.toLowerCase())); // Changed `any` to `File`
    if (setupFileExists) {
      setupScore += 1;
    }

    // Check for CI/CD config files like .travis.yml, .github/workflows/ci.yml, etc.
    const ciCdFiles = ['.travis.yml', '.circleci/config.yml', '.github/workflows/ci.yml'];
    const ciCdFileExists = files.some((file: File) => ciCdFiles.includes(file.name.toLowerCase())); // Changed `any` to `File`
    if (ciCdFileExists) {
      ciCdScore += 1;
    }

    // Total score calculation
    const totalScore = documentationScore + organizationScore + setupScore + testScore + ciCdScore;
    const maxPossibleScore = 8; 
    const normalizedScore = totalScore / maxPossibleScore; // normalize

    return normalizedScore;

  } catch (error) {
    console.error("Error fetching repository contents for ramp-up score:", error);
    return 0;  // Default to 0 if there's an error
  }
}

// Measures issue activity and frequency of closing issues
// and returns M_rm,normalized(r) as specified in project plan
function responsivenessScore(): number {
  return -1;
}

function licenseScore(data: any): number {
  // returns 1 if license is present, 0 otherwise
  return data.license ? 1 : 0;
}

// Define a function to fetch data from the GitHub API
async function fetchGitHubData(url: string) {
    // Extract the repository owner and name from the URL
    const repoPath = url.split("github.com/")[1];
    if (!repoPath) {
      throw new Error("Invalid GitHub URL");
    }
  
    // Ensure the repository path is in the format 'owner/repo'
    const [owner, repo] = repoPath.split("/").map(part => part.trim());
    if (!owner || !repo) {
      throw new Error("Invalid GitHub repository path");
    }
  
    // Construct the GitHub API URL
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    try {
      const response = await fetch(apiUrl);
  
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
  
      // Parse the JSON response
      const data = await response.json();
  
      // Optionally, you can log or process the data here
      // console.log("Fetched GitHub Data:", data);
  
      // Extract relevant information if needed
      const result = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        issues: data.open_issues_count,
        license: data.license ? data.license.name : 'No license',
        updated_at: data.updated_at
      };
  
      return result;
  
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
}

// Define a function to fetch data from the npm API
async function fetchNpmData(url: string) {
  // Extract the package name from the URL
  const packagePath = url.split("npmjs.com/package/")[1];
  if (!packagePath) {
    throw new Error("Invalid npm URL");
  }

  const apiUrl = `https://registry.npmjs.org/${packagePath}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`npm API error: ${response.statusText}`);
  }
  const data = await response.json();
  // console.log("Response: ", response);
  // console.log("Data: ", data);
  return data;
}

// Interface for the file structure 
interface File { 
  name: string;
  path: string;
  type: 'file' | 'dir';
}

// Fetch repo contents
async function fetchRepoContents(url: string): Promise<File[]> { 
  const repoPath = url.split("github.com/")[1];
  if (!repoPath) throw new Error("Invalid GitHub URL");

  const [owner, repo] = repoPath.split("/");
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const files: File[] = await response.json(); 
    return files;  
  } catch (error) {
    console.error("Error fetching repository contents:", error);
    throw error;
  }
}
