// takes as input URL and returns a score
export async function netScore(url: string): Promise<string> {
  let data, openIssues, closedIssues;

  // convert npm URL to GitHub URL
  if (url.includes("npmjs.com")) {
    try {
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
      const repoURL = await response.json();

      const repo: string = repoURL ? repoURL.repository.url : null;

      if (!repo) {
        console.error("No repository URL found in npm data");
        return JSON.stringify({ mainScore: -1 });
      }

      // Update to Github URL
      url = repo.replace("git+", "").replace(".git", "");
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching npm data");
    }
  }

  try {
    data = await fetchGitHubData(url);
    [openIssues, closedIssues] = await fetchIssues(url);
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching GitHub data");
  }

  // structure for getting count (for bus factor) below
  let count; // how many people are contributing to the repo (for bus factor)
  if (data.contributors_count || data.maintainers) {
    // contributors for github and maintainers for npm
    try {
      if (data.contributors_count) {
        const contributors = await fetchCollaboratorsCount(
          data.contributors_count
        ); // have to process the contributors url for GitHub
        count = contributors.length;
      } else {
        count = data.maintainers;
      }
      // console.log("contributors/maintainers: ", count);
    } catch (err) {
      console.error("Error fetching contributors/maintainers:", err);
      throw new Error("Error fetching contributors/maintainers");
    }
  } else {
    console.error("No contributor or maintainer data available");
    throw new Error("No contributor or maintainer data available");
  }

  // Calculate all metrics in parallel
  const [m_b, m_c, m_r, m_rm, m_l] = await Promise.all([
    busFactorScore(count), // Bus Factor Score
    correctnessScore(data.issues), // Correctness Score
    rampUpScore(url), // Ramp Up Score
    responsivenessScore(openIssues, closedIssues), // Responsiveness Score
    licenseScore(data), // License Score
  ]);

  // store weights
  let w_b: number = 0.2;
  let w_c: number = 0.25;
  let w_r: number = 0.15;
  let w_rm: number = 0.3;
  let w_l: number = 0.1;

  // calculate score
  let mainScore: number =
    w_b * m_b + w_c * m_c + w_r * m_r + w_rm * m_rm + w_l * m_l;
  mainScore = parseFloat(mainScore.toFixed(2));

  // construct result object, JSONify, then return
  const result = {
    mainScore: mainScore,
    scores: {
      busFactor: m_b,
      correctness: m_c,
      rampUp: m_r,
      responsiveness: m_rm,
      license: m_l,
    },
  };

  return JSON.stringify(result, null, 2);
}

// analyzes bus factor and returns M_b(r) as specified
// in project plan
function busFactorScore(contributorsCount: number): number {
  let busFactorScore;

  // each comparison is to a number of contributors that has ranges of safe,moderate, low, and very low
  if (contributorsCount >= 10) {
    busFactorScore = 10;
  } else if (contributorsCount >= 5) {
    busFactorScore = 7;
  } else if (contributorsCount >= 2) {
    busFactorScore = 4;
  } else {
    busFactorScore = 1;
  }

  // return normalized score
  return busFactorScore / 10;
}

// analyzes reliability/quality of codebase
// and returns M_c,normalized(r) as specified in project plan
function correctnessScore(IssueCount: number): number {
  if (IssueCount === undefined || IssueCount === null) {
    console.warn("Issue count is missing, returning correctness score of 0");
    return 0; // No issue count present, return 0
  }

  // If there are 0 issues, return a perfect score of 1
  if (IssueCount === 0) {
    return 1;
  }

  const correctness = 1 / (1 + Math.log(1 + IssueCount));

  return parseFloat(correctness.toFixed(2));
}

// analyzes presence and completness of relevant documentation
// for new developers and return M_r(r) as specified in project plan
async function rampUpScore(repoUrl: string): Promise<number> {
  let documentationScore = 0;
  let organizationScore = 0;
  let setupScore = 0;
  let testScore = 0;
  let ciCdScore = 0;

  try {
    const files: File[] = await fetchRepoContents(repoUrl); // Changed `any` to `File[]`

    // Here check for the presence of common files and directories, we can expand on this...
    // Check for README.md
    const readmeExists = files.some(
      (file: File) => file.name.toLowerCase() === "readme.md"
    ); // Changed `any` to `File`
    if (readmeExists) {
      documentationScore += 1;
    }

    // Check for CONTRIBUTING.md
    const contributingExists = files.some(
      (file: File) => file.name.toLowerCase() === "contributing.md"
    ); // Changed `any` to `File`
    if (contributingExists) {
      documentationScore += 1;
    }

    // Check for src/ and test/ directories
    const srcExists = files.some(
      (file: File) => file.type === "dir" && file.name.toLowerCase() === "src"
    ); // Changed `any` to `File`
    const testExists = files.some(
      (file: File) => file.type === "dir" && file.name.toLowerCase() === "test"
    ); // Changed `any` to `File`
    if (srcExists) organizationScore += 1;
    if (testExists) organizationScore += 1;

    // Check for package.json, requirements.txt, or similar
    const setupFiles = [
      "package.json",
      "requirements.txt",
      "build.gradle",
      "pom.xml",
    ];
    const setupFileExists = files.some((file: File) =>
      setupFiles.includes(file.name.toLowerCase())
    ); // Changed `any` to `File`
    if (setupFileExists) {
      setupScore += 1;
    }

    // Check for CI/CD config files like .travis.yml, .github/workflows/ci.yml, etc.
    const ciCdFiles = [
      ".travis.yml",
      ".circleci/config.yml",
      ".github/workflows/ci.yml",
    ];
    const ciCdFileExists = files.some((file: File) =>
      ciCdFiles.includes(file.name.toLowerCase())
    ); // Changed `any` to `File`
    if (ciCdFileExists) {
      ciCdScore += 1;
    }

    // Total score calculation
    const totalScore =
      documentationScore +
      organizationScore +
      setupScore +
      testScore +
      ciCdScore;
    const maxPossibleScore = 8;
    const normalizedScore = totalScore / maxPossibleScore; // normalize

    return normalizedScore;
  } catch (error) {
    console.error(
      "Error fetching repository contents for ramp-up score:",
      error
    );
    return 0; // Default to 0 if there's an error
  }
}

// Measures issue activity and frequency of closing issues
// and returns M_rm,normalized(r) as specified in project plan
function responsivenessScore(openIssues, closedIssues): number {
  let numOpenIssues = openIssues.length;
  let numClosedIssues = closedIssues.length;

  let score =
    numClosedIssues / numOpenIssues > 1 ? 1 : numClosedIssues / numOpenIssues;
  return score ? score : 0;
}

function licenseScore(data: any): number {
  // List of licenses that are compatible with LGPL 2.0
  const compatibleLicenses = [
    "GNU General Public License v2.0",
    "GNU General Public License v3.0",
    "GNU Lesser General Public License v2.1",
    "GNU Lesser General Public License v3.0",
    "MIT License",
    "ISC License",
  ];

  console.log("License:", data.license);
  // Check if the license exists and if it is compatible
  if (data.license && compatibleLicenses.includes(data.license)) {
    return 1; // License is present and compatible
  }

  return 0; // No compatible license found
}

// Define a function to fetch data from the GitHub API
async function fetchGitHubData(url: string) {
  // Extract the repository owner and name from the URL
  const repoPath = url.split("github.com/")[1];
  if (!repoPath) {
    throw new Error("Invalid GitHub URL");
  }

  // Ensure the repository path is in the format 'owner/repo'
  const [owner, repo] = repoPath.split("/").map((part) => part.trim());
  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository path");
  }

  // Get the GitHub token from the environment
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error("Error: GITHUB_TOKEN is not set in the environment");
    process.exit(1);
  }

  if (githubToken === "INVALIDTOKEN") {
    console.error("Error: Invalid GitHub token provided");
    process.exit(1);
  }

  // Construct the GitHub API URL
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
      },
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract relevant information if needed
    const result = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      issues: data.open_issues_count,
      license: data.license ? data.license.name : "No license",
      updated_at: data.updated_at,
      contributors_count: data.contributors_url,
    };

    return result;
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Define function to get issues data from GitHub URL (last 3 months)
async function fetchIssues(url: string) {
  const now = new Date();
  now.setMonth(now.getMonth() - 3); // Subtract three months
  const lastMonthDate = now.toISOString();

  // Build query URLs
  const repoPath = url.split("github.com/")[1];
  if (!repoPath) {
    throw new Error("Invalid GitHub URL");
  }

  // Ensure the repository path is in the format 'owner/repo'
  const [owner, repo] = repoPath.split("/").map((part) => part.trim());
  if (!owner || !repo) {
    throw new Error("Invalid GitHub repository path");
  }

  // Construct the GitHub API URLs for opened and close and still open issues
  const openIssuesURL = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&since=${lastMonthDate}`;
  const closedIssuesURL = `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&since=${lastMonthDate}`;

  try {
    const openResponse = await fetch(openIssuesURL, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    const closedResponse = await fetch(closedIssuesURL, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    const openIssues = await openResponse.json();
    const closedIssues = await closedResponse.json();

    return [openIssues, closedIssues];
  } catch (error) {
    console.error("Error fetching issue data:", error);
  }
}

// function for getting the number of contributors from a GitHub repo
async function fetchCollaboratorsCount(url: string): Promise<any[]> {
  if (!url || !url.startsWith("https://api.github.com/repos/")) {
    console.error("Invalid contributors count URL");
    throw new Error("Invalid contributors count URL");
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const contributors = await response.json();
    return contributors;
  } catch (error) {
    console.error("Error fetching collaborators data:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Fetch repo contents
async function fetchRepoContents(url: string): Promise<File[]> {
  const repoPath = url.split("github.com/")[1];
  if (!repoPath) throw new Error("Invalid GitHub URL");

  const [owner, repo] = repoPath.split("/");
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
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
