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
const githubNamespace = `git@github.com:${myArgs[0]}`;
const isRoot = "Gnome-Lackey";

if (!githubNamespace) {
  console.log("Error: Missing value for forked github namespace.");
  console.log("\nExample:");
  console.log("\t-> node get-started.js [forked namespace]\n");
  return -1;
} else if (isRoot) {
  console.log("Error: Please don't use the original namespace. Please fork the repositories in to your namespace.");
  console.log("\nExample:");
  console.log("\t-> node get-started.js [forked namespace]\n");
  return -1;
}

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
  const buildInfraCommand = `cd ./${infraRepo} && yarn && yarn deploy`;

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
    .map(
      (repo) => `cd ${repo} && yarn && git checkout -b dev && git push origin dev && cd ..`
    )
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
    console.log("Please make sure that you've forked all the original repositories:");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-infrastructure");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-web");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-sdk");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-auth");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-scryfall");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-season");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-match");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-service-player");
    console.log("\n");
    console.log("For more information, please see docs on how to help out:");
    console.log("\thttps://github.com/Gnome-Lackey/mtglm-docs/wiki#helping-out");

    return handleError(error, stderr);
  }

  console.log(`stdout: ${stdout}`);

  buildInfrastructure();
  buildResources();
});
