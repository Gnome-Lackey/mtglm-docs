const { exec } = require("child_process");

const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID } = process.env;

if (!AWS_SECRET_ACCESS_KEY || !AWS_ACCESS_KEY_ID) {
  console.log(
    "Error: Missing AWS credentials from environment.",
    "\tPlease populate the variables: AWS_SECRET_ACCESS_KEY and AWS_ACCESS_KEY_ID."
  );
  return -1;
}

const authServiceRepo = "mtglm-service-auth";
const infraRepo = "mtglm-infrastructure.git";
const matchServiceRepo = "mtglm-service-match";
const playerServiceRepo = "mtglm-service-player";
const scryfallServiceRepo = "mtglm-service-scryfall";
const seasonServiceRepo = "mtglm-service-season";
const webRepo = "mtglm-web";

const myArgs = process.argv.slice(2);
const githubNamespace = myArgs[0];

if (!githubNamespace) {
  console.log("Error: Missing value for forked github namespace.");
  console.log("\nExample:");
  console.log("\t-> node get-started.js [forked namespace]\n");
  return -1;
}

const authServiceLink = `${githubNamespace}/${authServiceRepo}`;
const infraLink = `${githubNamespace}/${infraRepo}`;
const matchServiceLink = `${githubNamespace}/${matchServiceRepo}`;
const playerServiceLink = `${githubNamespace}/${playerServiceRepo}`;
const scryfallServiceLink = `${githubNamespace}/${scryfallServiceRepo}`;
const seasonServiceLink = `${githubNamespace}/${seasonServiceRepo}`;
const webLink = `${githubNamespace}/${webRepo}`;

function handleError(error, stderr) {
  if (error) {
    console.log(`error: ${error.message}`);
    return -1;
  }

  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return -1;
  }
}

function buildInfrastructure() {
  const buildInfraCommand = `cd ./${infraRepo} && yarn && yarn build`;

  exec(buildInfraCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      return handleError(error, stderr);
    }

    console.log(`stdout: ${stdout}`);
  });
}

function buildResources() {
  const buildRepoList = [
    webRepo,
    seasonServiceRepo,
    scryfallServiceRepo,
    matchServiceRepo,
    authServiceRepo,
    playerServiceRepo,
  ];

  const buildCommand = buildRepoList
    .map((repo) => `cd ${repo} && yarn && git checkout -b develop && git push origin develop && cd ..`)
    .join(" && ");

  exec(buildCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      return handleError(error, stderr);
    }

    console.log(`stdout: ${stdout}`);
  });
}

const cloneRepoList = [
  infraLink,
  webLink,
  seasonServiceLink,
  scryfallServiceLink,
  matchServiceLink,
  authServiceLink,
  playerServiceLink,
];

const cloneCommand = cloneRepoList.map((link) => `git clone ${link}`).join(" && ");

exec(cloneCommand, (error, stdout, stderr) => {
  if (error || stderr) {
    return handleError(error, stderr);
  }

  console.log(`stdout: ${stdout}`);

  buildInfrastructure();
  buildResources();
});
