const adminKey = process.env.OPENAI_ADMIN_KEY;
const startTime = Number(process.env.OPENAI_USAGE_START_TIME);
const endTime = Number(process.env.OPENAI_USAGE_END_TIME || Math.floor(Date.now() / 1000));
const model = process.env.OPENAI_USAGE_MODEL || "gpt-5.4-mini";
const outputFile = process.env.OPENAI_USAGE_OUTPUT_FILE || "openai-usage-comment.md";

const pricesPerMillion = {
  "gpt-5.5": { input: 5.0, cachedInput: 0.5, output: 30.0 },
  "gpt-5.4": { input: 2.5, cachedInput: 0.25, output: 15.0 },
  "gpt-5.4-mini": { input: 0.75, cachedInput: 0.075, output: 4.5 },
};

if (!adminKey) {
  await BunWrite(outputFile, [
    "## OpenAI usage",
    "",
    "Usage cost was not collected because `OPENAI_ADMIN_KEY` is not configured.",
    "Add an organization admin key as a GitHub Actions secret to enable per-run estimates.",
    "",
  ].join("\n"));
  process.exit(0);
}

if (!Number.isFinite(startTime) || startTime <= 0) {
  throw new Error("OPENAI_USAGE_START_TIME must be a Unix timestamp.");
}

const usage = await fetchUsageWithRetry();
const totals = aggregateUsage(usage);
const estimate = estimateCost(totals, model);

const body = [
  "## OpenAI usage estimate",
  "",
  `- Window: ${formatTime(startTime)} - ${formatTime(endTime)}`,
  `- Model filter: \`${model}\``,
  `- Requests: ${totals.requests.toLocaleString("en-US")}`,
  `- Input tokens: ${totals.inputTokens.toLocaleString("en-US")}`,
  `- Cached input tokens: ${totals.cachedInputTokens.toLocaleString("en-US")}`,
  `- Output tokens: ${totals.outputTokens.toLocaleString("en-US")}`,
  `- Estimated cost: **$${estimate.toFixed(4)}**`,
  "",
  "This estimate is based on the OpenAI organization usage API and the workflow's configured model price. Usage reporting can be delayed, so a near-zero estimate may mean data has not landed yet.",
  "",
].join("\n");

await BunWrite(outputFile, body);

async function fetchUsageWithRetry() {
  const attempts = Number(process.env.OPENAI_USAGE_ATTEMPTS || 6);
  const delaySeconds = Number(process.env.OPENAI_USAGE_DELAY_SECONDS || 20);
  let lastData = [];

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastData = await fetchUsage();
    if (hasUsage(lastData) || attempt === attempts) {
      return lastData;
    }
    await sleep(delaySeconds * 1000);
  }

  return lastData;
}

async function fetchUsage() {
  const allData = [];
  let page;

  do {
    const url = new URL("https://api.openai.com/v1/organization/usage/completions");
    url.searchParams.set("start_time", String(startTime));
    url.searchParams.set("end_time", String(endTime));
    url.searchParams.set("bucket_width", "1m");
    url.searchParams.set("limit", "180");
    url.searchParams.append("models", model);
    url.searchParams.append("group_by", "model");
    if (page) {
      url.searchParams.set("page", page);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${adminKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Usage API request failed: ${response.status} ${text}`);
    }

    const json = await response.json();
    allData.push(...(json.data || []));
    page = json.next_page;
  } while (page);

  return allData;
}

function aggregateUsage(buckets) {
  const totals = {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    requests: 0,
  };

  for (const bucket of buckets) {
    for (const result of bucket.results || []) {
      totals.inputTokens += Number(result.input_tokens || 0);
      totals.cachedInputTokens += Number(result.input_cached_tokens || 0);
      totals.outputTokens += Number(result.output_tokens || 0);
      totals.requests += Number(result.num_model_requests || 0);
    }
  }

  return totals;
}

function estimateCost(totals, modelName) {
  const prices = pricesPerMillion[modelName];
  if (!prices) {
    return 0;
  }

  const uncachedInputTokens = Math.max(totals.inputTokens - totals.cachedInputTokens, 0);
  return (
    (uncachedInputTokens / 1_000_000) * prices.input +
    (totals.cachedInputTokens / 1_000_000) * prices.cachedInput +
    (totals.outputTokens / 1_000_000) * prices.output
  );
}

function hasUsage(buckets) {
  return buckets.some((bucket) =>
    (bucket.results || []).some((result) =>
      Number(result.input_tokens || 0) > 0 ||
      Number(result.output_tokens || 0) > 0 ||
      Number(result.num_model_requests || 0) > 0
    )
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

async function BunWrite(path, contents) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path, contents, "utf8");
}
