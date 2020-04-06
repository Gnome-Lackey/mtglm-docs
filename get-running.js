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

const githubNamespace = "git@github.com:Gnome-Lackey";

const authServiceLink = `${githubNamespace}/${authServiceRepo}.git`;
const infraLink = `${githubNamespace}/${infraRepo}.git`;
const matchServiceLink = `${githubNamespace}/${matchServiceRepo}.git`;
const playerServiceLink = `${githubNamespace}/${playerServiceRepo}.git`;
const scryfallServiceLink = `${githubNamespace}/${scryfallServiceRepo}.git`;
const seasonServiceLink = `${githubNamespace}/${seasonServiceRepo}.git`;
const webLink = `${githubNamespace}/${webRepo}.git`;

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
    .map((repo) => `cd ${repo} && yarn && yarn deploy && cd ..`)
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
