import { execFileSync, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const OWNER = "daylight55";
const TARGET_REPOSITORY = "daylight55/research";
const QUEUE_REPOSITORY_NAME = "research-queue";
const PORT = 37651;
const HOST = "127.0.0.1";
const manifestPath = new URL("../research-queue-github-app-manifest.json", import.meta.url);

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.redirect_url = `http://${HOST}:${PORT}/github-app-manifest/callback`;

const state = randomBytes(24).toString("hex");
const action = `https://github.com/settings/apps/new?state=${state}`;

function gh(args, input) {
  const result = spawnSync("gh", args, {
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `gh ${args.join(" ")} failed`);
  }

  return result.stdout;
}

function html(body) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Research Queue GitHub App Registration</title>
<body>${body}</body>
</html>`;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);

  if (url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html(`
      <p>Registering GitHub App manifest...</p>
      <form id="app-manifest" action="${action}" method="post">
        <input type="hidden" name="manifest" value="${JSON.stringify(manifest).replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">
      </form>
      <script>document.getElementById("app-manifest").submit()</script>
    `));
    return;
  }

  if (url.pathname !== "/github-app-manifest/callback") {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (!code || returnedState !== state) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Invalid GitHub App manifest callback.");
    return;
  }

  try {
    const converted = JSON.parse(
      gh([
        "api",
        "--method",
        "POST",
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "X-GitHub-Api-Version: 2026-03-10",
        `/app-manifests/${code}/conversions`,
      ]),
    );

    gh(["secret", "set", "RESEARCH_QUEUE_APP_ID", "--repo", TARGET_REPOSITORY, "--body", String(converted.id)]);
    gh(["secret", "set", "RESEARCH_QUEUE_APP_PRIVATE_KEY", "--repo", TARGET_REPOSITORY], converted.pem);

    const installUrl = `https://github.com/apps/${converted.slug}/installations/new`;
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html(`
      <h1>GitHub App created</h1>
      <p>App: <a href="${converted.html_url}">${converted.html_url}</a></p>
      <p>Actions secrets were set on <code>${TARGET_REPOSITORY}</code>.</p>
      <p>Next: install the app on <code>${OWNER}/${QUEUE_REPOSITORY_NAME}</code> only.</p>
      <p><a href="${installUrl}">Install GitHub App</a></p>
    `));

    console.log(`created_app_id=${converted.id}`);
    console.log(`created_app_slug=${converted.slug}`);
    console.log(`created_app_url=${converted.html_url}`);
    console.log(`install_url=${installUrl}`);
    console.log(`secrets_repo=${TARGET_REPOSITORY}`);
    server.close();
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : String(error));
    console.error(error instanceof Error ? error.message : error);
  }
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log(`Open this URL to register the GitHub App: ${url}`);
  execFileSync("open", [url]);
});
