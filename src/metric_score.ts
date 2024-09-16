// takes as input URL and returns a score
export async function netScore(url: string): Promise<number> {
  let data;

  // fetch data from GitHub and npm APIs
  if (url.includes("github.com")) {
    console.log("Fetching GitHub data...");
    try {
      data = await fetchGitHubData(url);
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching GitHub data");
    }
  } else if (url.includes("npmjs.com")) {
    try {
      data = await fetchNpmData(url);
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching npm data");
    }
  } else {
    console.log("Invalid URL");
    throw new Error("Invalid URL");
  }

  // store intermediate scores
  let m_b: number = busFactorScore();
  let m_c: number = correctnessScore();
  let m_r: number = rampUpScore();
  let m_rm: number = responsivenessScore();
  let m_l: number = licenseScore();

  // store weights
  let w_b: number = 0.2;
  let w_c: number = 0.25;
  let w_r: number = 0.15;
  let w_rm: number = 0.3;
  let w_l: number = 0.1;

  // calculate score and return
  return w_b * m_b + w_c * m_c + w_r * m_r + w_rm * m_rm + w_l * m_l;
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

// analyzes presence and completness of relevant documentation
// for new developers and return M_r(r) as specified in project plan
function rampUpScore(): number {
  return -1;
}

// Measures issue activity and frequency of closing issues
// and returns M_rm,normalized(r) as specified in project plan
function responsivenessScore(): number {
  return -1;
}

function licenseScore(): number {
  return -1;
}

// Define a function to fetch data from the GitHub API
async function fetchGitHubData(url: string) {
  // Extract the repository owner and name from the URL
  const repoPath = url.split("github.com/")[1];
  if (!repoPath) {
    throw new Error("Invalid GitHub URL");
  }
  const [owner, repo] = repoPath.split("/").map(part => part.trim());

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
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
  console.log("Response: ", response);
  console.log("Data: ", data);
  return data;
}