#!/usr/bin/env node

// allow: SIZE_OK — the task contract requires one standalone browser-QA file.
import { execFileSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

const ROUTE_DEFAULT = "/{locale}/archipelago-preview";
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 320, height: 700 },
];
const PROJECTS = [
  { id: "displaylab", ko: "디스플레이랩", en: "DisplayLab" },
  { id: "booksalon", ko: "북살롱", en: "BookSalon" },
  { id: "nbbang", ko: "엔빵 계산기", en: "N-Bang" },
];
const COPY = {
  ko: {
    disclosure: "미리보기 · 표시 상태는 제품 운영 상태를 변경하지 않습니다.",
    motion: "움직임",
    reduced: "줄임",
    off: "끔",
    noCrew: "공개된 Wayfarer 활동 없음",
    symbolic: "공개된 활동 기록이 없어 상징적 안내 상태로 표시합니다.",
    overview: "전체 군도로 돌아가기",
  },
  en: {
    disclosure: "Preview · display controls do not change product operations.",
    motion: "Motion",
    reduced: "Reduced",
    off: "Off",
    noCrew: "No published Wayfarer activity is available",
    symbolic: "No published activity is available; symbolic guide states are shown.",
    overview: "Return to all islands",
  },
};
const DESKTOP_V3 = "/images/archipelago/archipelago-scene-v3-projects.png";
const SPECIAL_LANES = [
  "action-frame",
  "save-data",
  "image-abort-semantics",
  "no-js-ssr",
  "forced-colors",
  "zoom-200",
  "breakpoint-focus",
  "js-delayed-ssr",
  "accessibility-metrics",
  "project-compositions",
];
const SYSTEM_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const HELP = `Usage:
  node scripts/archipelago/browser-qa.mjs --base-url <url> --output-dir <dir> [options]

Options:
  --base-url <url>     Externally managed production server (http or https).
  --route <template>   Root-relative route containing {locale} (default: ${ROUTE_DEFAULT}).
  --output-dir <dir>   Directory for screenshots and report.json.
  --dry-run            Validate and print the 12-scenario matrix without I/O.
  -h, --help           Show this help.
`;

function cliError(message) {
  const error = new Error(message);
  error.name = "CliError";
  return error;
}

function parseCli(argv) {
  const { values } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      "base-url": { type: "string" },
      route: { type: "string", default: ROUTE_DEFAULT },
      "output-dir": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return { help: true };
  if (!values["base-url"]) throw cliError("--base-url is required");
  if (!values["output-dir"]) throw cliError("--output-dir is required");

  let base;
  try {
    base = new URL(values["base-url"]);
  } catch {
    throw cliError("--base-url must be a valid URL");
  }
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
    throw cliError("--base-url must be an http(s) URL without credentials");
  }
  if (base.search || base.hash) throw cliError("--base-url must not contain a query or hash");

  const route = values.route;
  if (!route.startsWith("/") || route.startsWith("//") || route.includes("\\")
    || route.includes("?") || route.includes("#")) {
    throw cliError("--route must be a root-relative path without query or hash");
  }
  if ((route.match(/\{locale\}/g) ?? []).length !== 1) {
    throw cliError("--route must contain {locale} exactly once");
  }
  for (const locale of ["ko", "en"]) {
    const target = new URL(route.replace("{locale}", locale), base);
    if (target.origin !== base.origin) throw cliError("--route must stay on the --base-url origin");
  }
  const outputDir = path.resolve(values["output-dir"]);
  if (outputDir === path.parse(outputDir).root) throw cliError("--output-dir cannot be a filesystem root");

  return {
    help: false,
    dryRun: values["dry-run"],
    baseUrl: base.href.replace(/\/$/, ""),
    route,
    outputDir,
  };
}

function matrix(config) {
  return ["ko", "en"].flatMap((locale) => VIEWPORTS.map((viewport) => ({
    locale,
    viewport,
    url: new URL(config.route.replace("{locale}", locale), config.baseUrl).href,
  })));
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  let resolved;
  try {
    resolved = require.resolve("playwright");
  } catch {
    let globalRoot = "";
    try {
      globalRoot = execFileSync("npm", ["root", "-g"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 5000,
      }).trim();
    } catch {
      // The actionable prerequisite error below covers missing npm and Playwright.
    }
    if (globalRoot) {
      try {
        resolved = require.resolve("playwright", {
          paths: [path.join(globalRoot, "@playwright", "cli"), globalRoot],
        });
      } catch {
        // The actionable prerequisite error below covers an unbundled CLI.
      }
    }
  }
  if (!resolved) {
    throw new Error("PLAYWRIGHT_UNAVAILABLE: install playwright-cli on PATH or provide a resolvable playwright package");
  }
  const playwright = require(resolved);
  if (typeof playwright.chromium?.launch !== "function") {
    throw new Error("PLAYWRIGHT_UNAVAILABLE: resolved module does not export chromium.launch");
  }
  return { playwright, resolved };
}

async function launchChromium(chromium) {
  const failures = [];
  const bundledPath = chromium.executablePath();
  try {
    return {
      browser: await chromium.launch({ headless: true }),
      runtime: { launchMode: "bundled", executablePath: bundledPath, failures },
    };
  } catch (error) {
    failures.push({ launchMode: "bundled", executablePath: bundledPath, error: errorText(error) });
  }

  let systemChromePath = null;
  for (const candidate of SYSTEM_CHROME_PATHS) {
    try {
      await access(candidate, fsConstants.X_OK);
      systemChromePath = candidate;
      break;
    } catch {
      // Continue to the next known system installation path.
    }
  }
  try {
    return {
      browser: await chromium.launch({ headless: true, channel: "chrome" }),
      runtime: {
        launchMode: "chrome-channel",
        executablePath: systemChromePath ?? "channel:chrome",
        failures,
      },
    };
  } catch (error) {
    failures.push({
      launchMode: "chrome-channel",
      executablePath: systemChromePath ?? "channel:chrome",
      error: errorText(error),
    });
  }

  if (systemChromePath) {
    try {
      return {
        browser: await chromium.launch({ headless: true, executablePath: systemChromePath }),
        runtime: { launchMode: "system-executable", executablePath: systemChromePath, failures },
      };
    } catch (error) {
      failures.push({ launchMode: "system-executable", executablePath: systemChromePath, error: errorText(error) });
    }
  }
  throw new Error(`BROWSER_LAUNCH_FAILED: ${JSON.stringify(failures)}`);
}

function errorText(error) {
  const raw = error instanceof Error ? error.stack ?? error.message : String(error);
  return redactDiagnosticText(raw);
}

function redactDiagnosticText(value) {
  const home = process.env.HOME;
  return value
    .replaceAll(home ?? "\0", "<home>")
    .replace(/\bBearer\s+[A-Z0-9._~-]+/gi, "Bearer <redacted>")
    .replace(/([?&](?:token|key|secret|signature)=)[^&#\s]+/gi, "$1<redacted>");
}

function diagnosticUrl(value) {
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return "<invalid-url>";
  }
}

async function step(run, id, action) {
  try {
    const actual = await action();
    run.checks.push({ id, status: "PASS", actual: actual ?? null });
  } catch (error) {
    run.checks.push({ id, status: "FAIL", error: errorText(error) });
    throw error;
  }
}

function effectiveImagePath(rawUrl) {
  const url = new URL(rawUrl);
  const optimized = url.pathname === "/_next/image" ? url.searchParams.get("url") : null;
  return new URL(optimized ?? url.href, url.origin).pathname;
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    document: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
    body: [document.body.scrollWidth, document.body.clientWidth],
  }));
  if (dimensions.document[0] > dimensions.document[1] + 1 || dimensions.body[0] > dimensions.body[1] + 1) {
    throw new Error(`horizontal overflow: ${JSON.stringify(dimensions)}`);
  }
  return dimensions;
}

async function waitForVisibleArtwork(page) {
  await page.waitForFunction(() => {
    const images = [...document.querySelectorAll('section[data-camera-phase] img, [class*="mobileOverview"] img')]
      .filter((image) => {
        const rectangle = image.getBoundingClientRect();
        const style = getComputedStyle(image);
        return rectangle.width > 0 && rectangle.height > 0 && style.display !== 'none'
          && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      });
    return images.length > 0 && images.every((image) => image.complete && image.naturalWidth > 0);
  }, undefined, { timeout: 15000 });
  await page.locator('section[data-camera-phase] img:visible, [class*="mobileOverview"] img:visible')
    .evaluateAll(async (images) => Promise.all(images.map((image) => image.decode())));
}

async function resetScrollForCapture(page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => window.scrollY === 0);
}

async function selectProjects(page, locale, run) {
  await step(run, "projects:count", async () => {
    const counts = await Promise.all(PROJECTS.map((project) => (
      page.locator("button:visible").filter({ hasText: project[locale] }).count()
    )));
    if (counts.some((count) => count !== 1)) throw new Error(`expected one selector per project: ${counts.join(",")}`);
    return { count: counts.length };
  });
  for (const project of PROJECTS) {
    await step(run, `project:${project.id}`, async () => {
      const button = page.locator("button:visible").filter({ hasText: project[locale] }).first();
      await button.waitFor({ state: "visible" });
      await button.click();
      await page.locator(`[data-project="${project.id}"]:visible`).first().waitFor({ state: "visible" });
      if (await button.getAttribute("aria-pressed") !== "true") throw new Error("project button is not pressed");
      return assertNoOverflow(page);
    });
  }
}

async function verifyWayfarers(page, locale, run) {
  const displayLab = page.locator("button:visible").filter({ hasText: PROJECTS[0][locale] }).first();
  await displayLab.click();
  await page.locator('[data-project="displaylab"]:visible').first().waitFor({ state: "visible" });
  const wayfarers = page.locator("button[data-role]:visible");
  await step(run, "wayfarers:count", async () => {
    const count = await wayfarers.count();
    if (count !== 2) throw new Error(`expected 2 visible Wayfarers, received ${count}`);
    return { count };
  });
  for (const role of ["CODE_ENGINEER", "QA_NAVIGATOR"]) {
    await step(run, `dialog:${role}`, async () => {
      const trigger = page.locator(`button[data-role="${role}"]:visible`);
      await trigger.focus();
      await page.keyboard.press(role === "CODE_ENGINEER" ? "Enter" : "Space");
      const dialog = page.locator("dialog:visible");
      await dialog.waitFor({ state: "visible" });
      const native = await dialog.evaluate((element) => element instanceof HTMLDialogElement && element.open);
      const focusedInside = await dialog.evaluate((element) => element.contains(document.activeElement));
      const context = await dialog.textContent();
      if (!native || !focusedInside || !context?.includes(PROJECTS[0][locale])) {
        throw new Error("native dialog context or focus is invalid");
      }
      await assertNoOverflow(page);
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      if (!(await trigger.evaluate((element) => element === document.activeElement))) {
        throw new Error("dialog trigger focus was not restored");
      }
      return { native, focusedInside };
    });
  }
}

async function verifySymbolicTruth(page, locale, run) {
  const project = PROJECTS[1];
  await page.locator("button:visible").filter({ hasText: project[locale] }).first().click();
  await page.locator('[data-project="booksalon"]:visible').first().waitFor({ state: "visible" });
  await step(run, "wayfarers:symbolic-truth", async () => {
    const disclosure = page.locator("p").filter({ hasText: COPY[locale].noCrew });
    if (await disclosure.count() !== 1) throw new Error("symbolic activity needs one explicit disclosure paragraph");
    await disclosure.waitFor({ state: "visible" });
    const triggers = page.locator("button[data-role]:visible");
    if (await triggers.count() !== 2) throw new Error("symbolic project must retain exactly two guides");
    const labels = await triggers.evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label") ?? ""));
    if (labels.some((label) => !label.includes(COPY[locale].noCrew) || /\b(?:working|testing)\b/i.test(label))) {
      throw new Error(`symbolic guide accessible labels imply live work: ${JSON.stringify(labels)}`);
    }
    await triggers.first().click();
    const dialog = page.locator("dialog:visible");
    await dialog.waitFor({ state: "visible" });
    const context = await dialog.textContent();
    if (!context?.includes(COPY[locale].noCrew) || !context.includes(COPY[locale].symbolic)
      || /\b(?:working|testing)\b/i.test(context)) {
      throw new Error(`symbolic guide dialog implies live work: ${context ?? ""}`);
    }
    await page.keyboard.press("Escape");
    return { labels, dialogTruthful: true };
  });
}

async function verifyMotion(page, locale, run) {
  const root = page.locator("section[data-motion]");
  const group = page.getByRole("group", { name: COPY[locale].motion });
  for (const [label, mode] of [[COPY[locale].reduced, "REDUCED"], [COPY[locale].off, "OFF"]]) {
    await step(run, `motion:${mode}`, async () => {
      const button = group.getByRole("button", { name: label, exact: true });
      await button.click();
      await root.waitFor({ state: "visible" });
      if (await root.getAttribute("data-motion") !== mode || await button.getAttribute("aria-pressed") !== "true") {
        throw new Error(`${mode} preview control did not settle`);
      }
      const playing = await page.locator('[data-motion-state="playing"]:visible').count();
      if (playing !== 0) throw new Error(`${playing} Wayfarer animations remain active`);
      return assertNoOverflow(page);
    });
  }
}

async function runScenario(browser, scenario, outputDir) {
  const run = { ...scenario, status: "FAIL", checks: [], diagnostics: {
    console: [], pageErrors: [], requestFailures: [], imageRequests: [], pageCrashes: [],
  }, artifacts: [], errors: [] };
  const context = await browser.newContext({ viewport: scenario.viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("console", (message) => run.diagnostics.console.push({
    type: message.type(),
    text: redactDiagnosticText(message.text()),
    location: {
      ...message.location(),
      url: diagnosticUrl(message.location().url),
    },
  }));
  page.on("pageerror", (error) => run.diagnostics.pageErrors.push(errorText(error)));
  page.on("requestfailed", (request) => run.diagnostics.requestFailures.push({
    url: diagnosticUrl(request.url()),
    error: redactDiagnosticText(request.failure()?.errorText ?? "unknown"),
  }));
  page.on("request", (request) => {
    if (request.resourceType() === "image") run.diagnostics.imageRequests.push(diagnosticUrl(request.url()));
  });
  page.on("crash", () => run.diagnostics.pageCrashes.push("page crashed"));

  const screenshot = path.join("screenshots", scenario.locale, `${scenario.viewport.width}x${scenario.viewport.height}.png`);
  try {
    await step(run, "navigation", async () => {
      const response = await page.goto(scenario.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!response?.ok()) throw new Error(`navigation returned ${response?.status() ?? "no response"}`);
      await page.getByText(COPY[scenario.locale].disclosure, { exact: true }).waitFor({ state: "visible" });
      await page.locator("section[data-motion]").waitFor({ state: "visible" });
      const initialCamera = scenario.viewport.width >= 1024
        ? await page.locator("section[data-camera-phase]").getAttribute("data-camera-phase")
        : "COMPACT";
      if (scenario.viewport.width >= 1024 && initialCamera !== "OVERVIEW") {
        throw new Error(`desktop must open on the three-island overview, received ${initialCamera}`);
      }
      return { status: response.status(), initialCamera };
    });
    await selectProjects(page, scenario.locale, run);
    await verifySymbolicTruth(page, scenario.locale, run);
    await verifyWayfarers(page, scenario.locale, run);
    await verifyMotion(page, scenario.locale, run);
    await step(run, "overflow", () => assertNoOverflow(page));
    if (scenario.viewport.width < 1024) {
      await step(run, "mobile:no-desktop-v3", async () => {
        const offending = run.diagnostics.imageRequests.filter((url) => effectiveImagePath(url) === DESKTOP_V3);
        if (offending.length) throw new Error(`desktop v3 requested on mobile: ${offending.join(", ")}`);
        return { imageRequests: run.diagnostics.imageRequests.length };
      });
    }
    await step(run, "diagnostics", async () => {
      const consoleErrors = run.diagnostics.console.filter((entry) => {
        if (entry.type !== "error") return false;
        try {
          const source = new URL(entry.location?.url ?? "");
          const tested = new URL(scenario.url);
          const isExpectedLocalAnalytics404 =
            source.origin === tested.origin &&
            source.pathname === "/_vercel/insights/script.js" &&
            entry.text === "Failed to load resource: the server responded with a status of 404 (Not Found)";
          return !isExpectedLocalAnalytics404;
        } catch {
          return true;
        }
      });
      const requestFailures = run.diagnostics.requestFailures.filter((entry) => !entry.error.includes("ERR_ABORTED"));
      if (consoleErrors.length || run.diagnostics.pageErrors.length || requestFailures.length || run.diagnostics.pageCrashes.length) {
        throw new Error("fatal browser diagnostics were collected");
      }
      return { consoleMessages: run.diagnostics.console.length };
    });
    run.status = "PASS";
  } catch (error) {
    run.errors.push(errorText(error));
  } finally {
    try {
      if (scenario.viewport.width >= 1024) {
        const overview = page.getByRole("button", { name: COPY[scenario.locale].overview, exact: true });
        if (await overview.count()) {
          await overview.click();
          await page.locator('section[data-camera-phase="OVERVIEW"]').waitFor({ state: "visible" });
        }
      }
      await waitForVisibleArtwork(page);
      await resetScrollForCapture(page);
      await page.waitForTimeout(100);
      const destination = path.join(outputDir, screenshot);
      await mkdir(path.dirname(destination), { recursive: true });
      await page.screenshot({ path: destination, fullPage: true });
      run.artifacts.push({ type: "screenshot", path: screenshot });
    } catch (error) {
      run.status = "FAIL";
      run.errors.push(`screenshot: ${errorText(error)}`);
    }
    await context.close();
  }
  return run;
}

async function openPreview(page, config, locale = "ko") {
  const url = new URL(config.route.replace("{locale}", locale), config.baseUrl).href;
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!response?.ok()) throw new Error(`navigation returned ${response?.status() ?? "no response"}`);
  return url;
}

async function assertProjectCards(page, locale) {
  const articles = page.locator("article");
  if (await articles.count() !== 3) throw new Error("expected exactly three semantic project cards");
  for (const project of PROJECTS) {
    const card = articles.filter({ hasText: project[locale] }).first();
    if (await card.count() !== 1) throw new Error(`missing semantic card for ${project.id}`);
    const links = card.locator(`a[href="/${locale}/projects/${project.id}"]`);
    if (await links.count() < 1) throw new Error(`missing direct detail action for ${project.id}`);
    const semanticParts = {
      name: await card.locator("button strong").first().textContent(),
      purpose: await card.locator("button small").first().textContent(),
      state: await card.locator("button em").first().textContent(),
      outcome: await card.locator("p").first().textContent(),
      freshness: await card.locator("time").first().textContent(),
    };
    if (Object.values(semanticParts).some((value) => !value?.trim())) {
      throw new Error(`incomplete semantic public story for ${project.id}: ${JSON.stringify(semanticParts)}`);
    }
  }
  return {
    cards: 3,
    directActions: 3,
    requiredFieldsPerCard: ["name", "purpose", "state", "outcome", "freshness"],
  };
}

async function specialLane(browser, config, id, options, action, initScript = null) {
  const lane = { id, status: "FAIL", checks: [], artifacts: [], errors: [] };
  let context;
  try {
    context = await browser.newContext(options);
    if (initScript) await context.addInitScript(initScript);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await action(page, context, lane);
    lane.status = "PASS";
  } catch (error) {
    lane.errors.push(errorText(error));
  } finally {
    await context?.close();
  }
  return lane;
}

async function runSpecialLanes(browser, config) {
  const lanes = [];
  lanes.push(await specialLane(browser, config, "action-frame", {
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    // Freeze the one-shot strip before selection so screenshot I/O cannot race
    // the 840ms runtime clip; each audited frame advances it explicitly below.
    const frameAuditStyle = await page.addStyleTag({
      content: '[class*="motionStrip"] { animation-play-state: paused !important; }',
    });
    const scene = page.locator("section[data-camera-phase]");
    await scene.waitFor({ state: "visible" });
    await scene.scrollIntoViewIfNeeded();
    const returnButton = scene.getByRole("button", { name: COPY.ko.overview, exact: true });
    if (await returnButton.count()) await returnButton.click();
    await page.locator('section[data-camera-phase="OVERVIEW"]').waitFor({ state: "visible" });
    await page.locator('button[data-island="displaylab-island"]').click();
    await page.locator('section[data-camera-phase][data-selected="displaylab"]').waitFor({ state: "visible" });
    const playing = page.locator('[data-motion-state="playing"]:visible');
    await playing.first().waitFor({ state: "visible", timeout: 2000 });
    const count = await playing.count();
    if (count < 1) throw new Error("DisplayLab reselection produced no action frame");
    const hiddenPosters = await playing.locator("img[class*='poseSheet']").evaluateAll((images) => (
      images.every((image) => getComputedStyle(image).visibility === "hidden")
    ));
    if (!hiddenPosters) throw new Error("Static Wayfarer pose remains visible behind the motion strip");
    const motionFrame = playing.first().locator("img[class*='motionStrip']");
    await motionFrame.evaluate((image) => image.getAnimations()[0]?.pause());
    const samples = [];
    for (const [index, currentTime] of [0, 140, 280, 420, 560, 700].entries()) {
      const transform = await motionFrame.evaluate((image, sampleTime) => {
        const animation = image.getAnimations()[0];
        if (!animation) throw new Error("motion strip has no runtime animation");
        animation.currentTime = sampleTime;
        return getComputedStyle(image).transform;
      }, currentTime);
      const relative = path.join(
        "screenshots",
        "special",
        `action-frame-${String(index + 1).padStart(2, "0")}-ko-1440x900.png`,
      );
      const destination = path.join(config.outputDir, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await page.screenshot({ path: destination });
      samples.push({ index, currentTime, transform, path: relative });
      lane.artifacts.push({ type: "action-frame-sample", path: relative });
    }
    const uniqueTransforms = new Set(samples.map((sample) => sample.transform)).size;
    if (uniqueTransforms < 6) {
      throw new Error(`expected six distinct motion samples, received ${uniqueTransforms}`);
    }
    await page.locator('img[class*="motionStrip"]').evaluateAll((images) => {
      for (const image of images) image.getAnimations()[0]?.finish();
    });
    await playing.first().waitFor({ state: "hidden", timeout: 1500 });
    await frameAuditStyle.evaluate((style) => style.remove());
    lane.checks.push({
      id: "playing-observed",
      status: "PASS",
      actual: { count, sampleCount: samples.length, uniqueTransforms, hiddenPosters, settled: true },
    });

    // Re-open the page so the offscreen policy is proven on an untouched
    // runtime, independent of the paused frame-audit animation objects.
    await openPreview(page, config);
    await page.locator('section[data-camera-phase="OVERVIEW"]').waitFor({ state: "visible" });
    await page.locator('button[data-island="displaylab-island"]').click();
    await playing.first().waitFor({ state: "visible", timeout: 2000 });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await playing.first().waitFor({ state: "hidden", timeout: 1000 });
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const replayed = await playing.count();
    if (replayed !== 0) throw new Error("Offscreen-suppressed Wayfarer animation replayed on return");
    lane.checks.push({
      id: "offscreen-cancels-without-replay",
      status: "PASS",
      actual: { replayed },
    });
  }));

  lanes.push(await specialLane(browser, config, "save-data", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    await page.locator("button:visible").filter({ hasText: PROJECTS[1].ko }).first().click();
    await page.locator('[data-project="booksalon"]:visible').first().waitFor({ state: "visible" });
    await page.locator("button:visible").filter({ hasText: PROJECTS[0].ko }).first().click();
    await page.locator('[data-project="displaylab"]:visible').first().waitFor({ state: "visible" });
    const saveData = await page.evaluate(() => navigator.connection?.saveData === true);
    const playing = await page.locator('[data-motion-state="playing"]:visible').count();
    if (!saveData || playing !== 0) throw new Error(`Save-Data motion gate failed: ${playing} playing`);
    lane.checks.push({ id: "save-data-settled", status: "PASS", actual: { saveData, playing } });
  }, () => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    });
  }));

  lanes.push(await specialLane(browser, config, "image-abort-semantics", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  }, async (page, context, lane) => {
    await context.route("**/*", async (route) => {
      if (route.request().resourceType() === "image") await route.abort("failed");
      else await route.continue();
    });
    await openPreview(page, config);
    const actual = await assertProjectCards(page, "ko");
    lane.checks.push({ id: "semantic-fallback", status: "PASS", actual });
  }));

  lanes.push(await specialLane(browser, config, "no-js-ssr", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, javaScriptEnabled: false,
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    const actual = await assertProjectCards(page, "ko");
    lane.checks.push({ id: "ssr-project-parity", status: "PASS", actual });
  }));

  lanes.push(await specialLane(browser, config, "forced-colors", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, forcedColors: "active",
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    await page.locator("button:visible").filter({ hasText: PROJECTS[1].ko }).first().click();
    await page.locator('[data-project="booksalon"]:visible').first().waitFor({ state: "visible" });
    await page.locator("button:visible").filter({ hasText: PROJECTS[0].ko }).first().click();
    await page.locator('[data-project="displaylab"]:visible').first().waitFor({ state: "visible" });
    const trigger = page.locator('button[data-role="CODE_ENGINEER"]:visible');
    await trigger.click();
    const dialog = page.locator("dialog:visible");
    await dialog.waitFor({ state: "visible" });
    if (!(await dialog.evaluate((element) => element instanceof HTMLDialogElement && element.open))) {
      throw new Error("forced-colors native dialog did not open");
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    if (!(await trigger.evaluate((element) => element === document.activeElement))) {
      throw new Error("forced-colors focus restoration failed");
    }
    lane.checks.push({ id: "forced-colors-operable", status: "PASS", actual: { dialog: true } });
  }));

  lanes.push(await specialLane(browser, config, "zoom-200", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  }, async (page, context, lane) => {
    await openPreview(page, config);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 195,
      height: 422,
      deviceScaleFactor: 2,
      mobile: false,
      screenWidth: 390,
      screenHeight: 844,
    });
    const zoom = await page.evaluate(() => ({
      cssViewport: [window.innerWidth, window.innerHeight],
      visualViewport: [window.visualViewport?.width ?? 0, window.visualViewport?.height ?? 0],
      devicePixelRatio: window.devicePixelRatio,
    }));
    if (zoom.cssViewport[0] > 196 || zoom.devicePixelRatio < 1.9) {
      throw new Error(`expected a 195px/DPR2 reflow viewport, received ${JSON.stringify(zoom)}`);
    }
    const dimensions = await assertNoOverflow(page);
    lane.checks.push({ id: "zoom-overflow", status: "PASS", actual: { zoom, dimensions } });
  }));

  lanes.push(await specialLane(browser, config, "breakpoint-focus", {
    viewport: { width: 1023, height: 768 }, deviceScaleFactor: 1,
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    const mobile = page.locator('button[data-project-selector="booksalon"]:visible');
    await mobile.click();
    await mobile.focus();
    await page.setViewportSize({ width: 1024, height: 768 });
    const desktop = page.locator('button[data-project-selector="booksalon"]:visible');
    await desktop.waitFor({ state: "visible" });
    await page.waitForFunction(() => (
      document.activeElement instanceof HTMLElement
      && document.activeElement.dataset.projectSelector === "booksalon"
    ));
    if (await desktop.getAttribute("aria-pressed") !== "true") {
      throw new Error("Selection was not preserved across the 1023→1024 breakpoint");
    }
    await page.setViewportSize({ width: 1023, height: 768 });
    const mobileAgain = page.locator('button[data-project-selector="booksalon"]:visible');
    await mobileAgain.waitFor({ state: "visible" });
    await page.waitForFunction(() => (
      document.activeElement instanceof HTMLElement
      && document.activeElement.dataset.projectSelector === "booksalon"
    ));
    lane.checks.push({
      id: "selection-and-focus-preserved",
      status: "PASS",
      actual: { projectId: "booksalon", transitions: ["1023→1024", "1024→1023"] },
    });
  }));

  lanes.push(await specialLane(browser, config, "js-delayed-ssr", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  }, async (page, context, lane) => {
    let releaseScripts;
    const scriptGate = new Promise((resolve) => { releaseScripts = resolve; });
    const fallbackRelease = setTimeout(() => releaseScripts(), 5000);
    await context.route("**/*.js", async (route) => {
      await scriptGate;
      await route.continue();
    });
    const url = new URL(config.route.replace("{locale}", "ko"), config.baseUrl).href;
    const response = await page.goto(url, { waitUntil: "commit", timeout: 30000 });
    if (!response?.ok()) throw new Error(`navigation returned ${response?.status() ?? "no response"}`);
    await page.locator("article").first().waitFor({ state: "attached", timeout: 4000 });
    const beforeHydration = await assertProjectCards(page, "ko");
    releaseScripts();
    clearTimeout(fallbackRelease);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(300);
    const selector = page.locator('button[data-project-selector="booksalon"]:visible');
    await selector.click();
    await page.waitForFunction(() => (
      document.querySelector('button[data-project-selector="booksalon"]')?.getAttribute("aria-pressed") === "true"
    ));
    lane.checks.push({
      id: "semantic-content-before-hydration",
      status: "PASS",
      actual: { delayGateMs: 5000, beforeHydration, hydratedInteraction: true },
    });
  }));

  lanes.push(await specialLane(browser, config, "accessibility-metrics", {
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
  }, async (page, context, lane) => {
    await openPreview(page, config);
    const displayLab = page.locator('button[data-project-selector="displaylab"]:visible');
    await displayLab.click();
    const root = page.locator("section[data-motion]");
    const targetSizes = await root.locator("button:visible, a[href]:visible").evaluateAll((elements) => (
      elements.map((element) => {
        const rectangle = element.getBoundingClientRect();
        return {
          name: element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 80) ?? "",
          width: Number(rectangle.width.toFixed(2)),
          height: Number(rectangle.height.toFixed(2)),
        };
      })
    ));
    const undersized = targetSizes.filter((target) => target.width < 44 || target.height < 44);
    if (undersized.length) throw new Error(`interactive targets below 44px: ${JSON.stringify(undersized)}`);

    const contrast = await page.evaluate(() => {
      function parseColor(value) {
        const match = value.match(/rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d+(?:\.\d+)?))?\s*\)/);
        if (!match) throw new Error(`unsupported computed color: ${value}`);
        return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === "" || match[4] === undefined ? 1 : Number(match[4])];
      }
      function composite(front, back) {
        const alpha = front[3] + back[3] * (1 - front[3]);
        if (alpha === 0) return [0, 0, 0, 0];
        return [0, 1, 2].map((index) => (
          (front[index] * front[3] + back[index] * back[3] * (1 - front[3])) / alpha
        )).concat(alpha);
      }
      function luminance(color) {
        const channels = color.slice(0, 3).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      }
      function backgroundFor(element) {
        const chain = [];
        for (let current = element; current instanceof Element; current = current.parentElement) chain.unshift(current);
        return chain.reduce(
          (background, current) => composite(parseColor(getComputedStyle(current).backgroundColor), background),
          [255, 255, 255, 1],
        );
      }
      const selectors = [
        "article strong",
        "article small",
        "article time",
        '[class*="projectDetail"] h2',
        '[class*="actionRow"] a',
      ];
      return selectors.flatMap((selector) => (
        [...document.querySelectorAll(selector)].filter((element) => {
          const rectangle = element.getBoundingClientRect();
          return rectangle.width > 0 && rectangle.height > 0;
        }).map((element) => {
          const background = backgroundFor(element);
          const foreground = composite(parseColor(getComputedStyle(element).color), background);
          const light = Math.max(luminance(foreground), luminance(background));
          const dark = Math.min(luminance(foreground), luminance(background));
          return {
            selector,
            text: element.textContent?.trim().slice(0, 80) ?? "",
            ratio: Number(((light + 0.05) / (dark + 0.05)).toFixed(2)),
          };
        })
      ));
    });
    const contrastFailures = contrast.filter((sample) => sample.ratio < 4.5);
    if (!contrast.length || contrastFailures.length) {
      throw new Error(`WCAG AA text contrast failed: ${JSON.stringify(contrastFailures)}`);
    }

    const announcements = await page.evaluate(() => {
      const region = document.querySelector('[aria-live="polite"]');
      if (!(region instanceof HTMLElement)) throw new Error("missing polite live region");
      window.__archipelagoAnnouncements = [];
      const observer = new MutationObserver(() => {
        const message = region.textContent?.trim() ?? "";
        if (message && window.__archipelagoAnnouncements.at(-1) !== message) {
          window.__archipelagoAnnouncements.push(message);
        }
      });
      observer.observe(region, { childList: true, characterData: true, subtree: true });
      window.__archipelagoAnnouncementObserver = observer;
      return { regions: 1, initial: region.textContent?.trim() ?? "" };
    });
    for (const id of ["booksalon", "nbbang"]) {
      await page.locator(`button[data-project-selector="${id}"]:visible`).click();
      await page.waitForTimeout(450);
    }
    const announcementMessages = await page.evaluate(() => {
      window.__archipelagoAnnouncementObserver?.disconnect();
      return window.__archipelagoAnnouncements ?? [];
    });
    if (announcementMessages.length !== 2) {
      throw new Error(`expected exactly two distinct selection announcements, received ${JSON.stringify(announcementMessages)}`);
    }

    const cdp = await context.newCDPSession(page);
    const axTree = await cdp.send("Accessibility.getFullAXTree");
    const axSummary = axTree.nodes.reduce((summary, node) => {
      const role = node.role?.value ?? "unknown";
      summary.roles[role] = (summary.roles[role] ?? 0) + 1;
      if (node.name?.value) summary.namedNodes += 1;
      return summary;
    }, { nodeCount: axTree.nodes.length, namedNodes: 0, roles: {} });
    const actual = {
      targetCount: targetSizes.length,
      minimumTarget: {
        width: Math.min(...targetSizes.map((target) => target.width)),
        height: Math.min(...targetSizes.map((target) => target.height)),
      },
      contrastSampleCount: contrast.length,
      minimumContrast: Math.min(...contrast.map((sample) => sample.ratio)),
      announcements: { ...announcements, selections: 2, messages: announcementMessages },
      axSummary,
    };
    const relative = path.join("accessibility", "metrics.json");
    const destination = path.join(config.outputDir, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, `${JSON.stringify({ ...actual, targetSizes, contrast }, null, 2)}\n`);
    lane.checks.push({ id: "wcag-and-ax-evidence", status: "PASS", actual });
    lane.artifacts.push({ type: "accessibility-metrics", path: relative });
  }));

  lanes.push(await specialLane(browser, config, "project-compositions", {
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  }, async (page, _context, lane) => {
    await openPreview(page, config);
    const capture = async (relative) => {
      await waitForVisibleArtwork(page);
      await resetScrollForCapture(page);
      await page.waitForTimeout(100);
      const destination = path.join(config.outputDir, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      const viewport = page.viewportSize();
      await page.screenshot({ path: destination, fullPage: (viewport?.width ?? 0) < 1024 });
      lane.artifacts.push({ type: "project-composition", path: relative });
    };
    await page.locator('section[data-camera-phase="OVERVIEW"]').waitFor({ state: "visible" });
    await capture(path.join("screenshots", "projects", "desktop-overview-ko-1440x900.png"));
    for (const project of PROJECTS) {
      await page.locator(`button[data-project-selector="${project.id}"]:visible`).click();
      await page.locator(`section[data-camera-phase="FOCUSED"][data-selected="${project.id}"]`).waitFor({ state: "visible" });
      await capture(path.join("screenshots", "projects", `desktop-${project.id}-ko-1440x900.png`));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const project of PROJECTS) {
      const selector = page.locator(`button[data-project-selector="${project.id}"]:visible`);
      await selector.waitFor({ state: "visible" });
      await selector.click();
      if (await selector.getAttribute("aria-pressed") !== "true") {
        throw new Error(`mobile selection did not settle for ${project.id}`);
      }
      await capture(path.join("screenshots", "projects", `mobile-${project.id}-ko-390x844.png`));
    }
    lane.checks.push({
      id: "overview-and-project-compositions",
      status: "PASS",
      actual: { desktopOverview: 1, desktopSelections: 3, mobileSelections: 3 },
    });
  }));
  return lanes;
}

async function writeReport(outputDir, report) {
  const destination = path.join(outputDir, "report.json");
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`);
  await rename(temporary, destination);
  return destination;
}

async function runQa(config) {
  await mkdir(config.outputDir, { recursive: true });
  const started = Date.now();
  const report = { schemaVersion: "1.0", status: "FAIL", startedAt: new Date(started).toISOString(), config: {
    baseUrl: config.baseUrl,
    route: config.route,
    outputDir: path.relative(process.cwd(), config.outputDir),
    locales: ["ko", "en"],
    viewports: VIEWPORTS,
  }, runtime: { node: process.version }, summary: {}, runs: [], specialLanes: [], errors: [] };
  let browser;
  try {
    const loaded = loadPlaywright();
    report.runtime.playwrightModule = path.basename(loaded.resolved);
    const launched = await launchChromium(loaded.playwright.chromium);
    browser = launched.browser;
    report.runtime.browserLaunchMode = launched.runtime.launchMode;
    report.runtime.browserExecutablePath = path.basename(launched.runtime.executablePath);
    report.runtime.browserLaunchFailures = launched.runtime.failures.map((failure) => ({
      ...failure,
      executablePath: path.basename(failure.executablePath),
      error: redactDiagnosticText(failure.error),
    }));
    for (const scenario of matrix(config)) report.runs.push(await runScenario(browser, scenario, config.outputDir));
    report.specialLanes = await runSpecialLanes(browser, config);
  } catch (error) {
    report.errors.push(errorText(error));
  } finally {
    if (browser) {
      await Promise.race([
        browser.close(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    }
  }
  const checks = report.runs.flatMap((run) => run.checks);
  report.status = report.runs.length === 12
    && report.runs.every((run) => run.status === "PASS")
    && report.specialLanes.length === SPECIAL_LANES.length
    && report.specialLanes.every((lane) => lane.status === "PASS") ? "PASS" : "FAIL";
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - started;
  report.summary = {
    runs: report.runs.length,
    passedRuns: report.runs.filter((run) => run.status === "PASS").length,
    failedRuns: report.runs.filter((run) => run.status === "FAIL").length,
    passedChecks: checks.filter((check) => check.status === "PASS").length,
    failedChecks: checks.filter((check) => check.status === "FAIL").length,
    screenshots: report.runs.reduce((sum, run) => sum + run.artifacts.length, 0)
      + report.specialLanes.reduce((sum, lane) => sum + lane.artifacts.length, 0),
    specialLanes: report.specialLanes.length,
    passedSpecialLanes: report.specialLanes.filter((lane) => lane.status === "PASS").length,
  };
  const reportPath = await writeReport(config.outputDir, report);
  process.stdout.write(`${report.status} ${reportPath}\n`);
  process.exitCode = report.status === "PASS" ? 0 : 1;
}

async function main() {
  let config;
  try {
    config = parseCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`ERROR: ${error instanceof Error ? error.message : String(error)}\n\n${HELP}`);
    process.exitCode = 2;
    return;
  }
  if (config.help) {
    process.stdout.write(HELP);
    return;
  }
  if (config.dryRun) {
    process.stdout.write(`${JSON.stringify({ status: "DRY_RUN", config, scenarios: matrix(config), specialLanes: SPECIAL_LANES }, null, 2)}\n`);
    return;
  }
  try {
    await runQa(config);
  } catch (error) {
    process.stderr.write(`FAIL: ${errorText(error)}\n`);
    process.exitCode = 1;
  }
}

await main();
