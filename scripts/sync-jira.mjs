import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appRoot = resolve(import.meta.dirname, "..");
const envPath = resolve(appRoot, ".env.local");
const planPath = resolve(appRoot, "docs/weldoo-epics-task-plan-en.md");

function loadEnvFile(path) {
  const raw = readFileSync(path, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/jira\/.*$/, "").replace(/\/$/, "");
}

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const issueArg = process.argv.find((arg) => arg.startsWith("--issue="));

  return {
    check: args.has("--check"),
    offline: args.has("--offline"),
    sprint: args.has("--sprint"),
    issue: issueArg?.split("=")[1] ?? null,
    push: args.has("--push"),
    dryRun: !args.has("--push"),
    limit: limitArg ? Number(limitArg.split("=")[1]) : null,
  };
}

function slugLabel(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

function parsePlan(markdown) {
  const epicMatches = [...markdown.matchAll(/^## Epic (\d+) - (.+)$/gm)];
  const epics = [];

  for (let i = 0; i < epicMatches.length; i += 1) {
    const match = epicMatches[i];
    const next = epicMatches[i + 1];
    const start = match.index + match[0].length;
    const end = next?.index ?? markdown.length;
    const block = markdown.slice(start, end);
    const objective = block.match(/Objective:\s*(.+)/)?.[1]?.trim() ?? "";
    const taskMatches = [...block.matchAll(/^### Task ([\d.]+) - (.+)$/gm)];
    const tasks = [];

    for (let taskIndex = 0; taskIndex < taskMatches.length; taskIndex += 1) {
      const taskMatch = taskMatches[taskIndex];
      const nextTask = taskMatches[taskIndex + 1];
      const taskStart = taskMatch.index + taskMatch[0].length;
      const taskEnd = nextTask?.index ?? block.length;
      const taskBlock = block.slice(taskStart, taskEnd);
      const status = taskBlock.match(/Status:\s*`([^`]+)`/)?.[1] ?? "Planned";
      const prompt = taskBlock.match(/```text\n([\s\S]*?)\n```/)?.[1]?.trim() ?? "";
      const notesBlock = taskBlock.match(/Notes:\s*([\s\S]*)/)?.[1] ?? "";
      const notes = [...notesBlock.matchAll(/^- (.+)$/gm)].map((note) =>
        note[1].trim(),
      );

      tasks.push({
        number: taskMatch[1],
        title: taskMatch[2].trim(),
        status,
        prompt,
        notes,
      });
    }

    epics.push({
      number: Number(match[1]),
      title: match[2].trim(),
      objective,
      tasks,
    });
  }

  return epics;
}

const epicPrefixes = {
  0: "FND",
  1: "AUTH",
  2: "NAV",
  3: "FEED",
  4: "PROF",
  5: "NET",
  6: "MSG",
  7: "NOTIF",
  8: "JOB",
  9: "ACAD",
  10: "EVT",
  11: "SET",
  12: "ACT",
  13: "ADMIN",
  14: "AI",
  15: "INFRA",
};

function sourceId(epic, taskIndex = null) {
  const prefix = epicPrefixes[epic.number] ?? `EPIC${epic.number}`;

  if (taskIndex === null) {
    return `${prefix}-EPIC`;
  }

  return `${prefix}-${String(taskIndex + 1).padStart(3, "0")}`;
}

function inferIssueType(task, issueTypeNames) {
  const text = `${task.title} ${task.prompt}`.toLowerCase();

  if (
    issueTypeNames.has("Technical Story") &&
    /(architecture|infrastructure|baseline|security|rls|schema|monitoring|load testing|migration|database|cdn)/.test(
      text,
    )
  ) {
    return "Technical Story";
  }

  if (
    issueTypeNames.has("Story") &&
    !/(visual|polish|shell|review)/.test(text)
  ) {
    return "Story";
  }

  if (issueTypeNames.has("Task")) {
    return "Task";
  }

  return [...issueTypeNames].find((name) => name !== "Epic") ?? "Task";
}

function inferPriority(task, priorityNames) {
  const text = `${task.title} ${task.status} ${task.prompt}`.toLowerCase();
  let wanted = "Medium";

  if (/(critical|auth|session|security|abuse|rls|deployment)/.test(text)) {
    wanted = "High";
  }

  if (/delete account/.test(text)) {
    wanted = "Highest";
  }

  return priorityNames.has(wanted)
    ? wanted
    : priorityNames.has("High")
      ? "High"
      : [...priorityNames][0];
}

function inferStoryPoints(task) {
  const text = `${task.title} ${task.prompt}`.toLowerCase();

  if (task.status === "Done") return 1;
  if (task.status.toLowerCase().includes("needs")) return 2;
  if (/(course player|live webinar|full messages|notification infrastructure|100k)/.test(text)) {
    return 8;
  }
  if (/(architecture|infrastructure|oauth|linkedin|advanced|management|migration|delete account)/.test(text)) {
    return 5;
  }
  if (/(shell|visual|polish|review)/.test(text)) {
    return 2;
  }

  return 3;
}

function paragraph(text) {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : [],
  };
}

function bulletList(items) {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

function descriptionDoc({ source, status, phase, prompt, notes }) {
  const content = [
    paragraph(`Source ID: ${source}`),
    paragraph(`Current status: ${status}`),
    paragraph(`Phase: ${phase}`),
  ];

  if (prompt) {
    content.push(paragraph("Codex prompt"));
    content.push(paragraph(prompt));
  }

  if (notes.length > 0) {
    content.push(paragraph("Notes"));
    content.push(bulletList(notes));
  }

  return {
    type: "doc",
    version: 1,
    content,
  };
}

function adfToPlainText(node, depth = 0) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) {
    return node.map((child) => adfToPlainText(child, depth)).filter(Boolean).join("");
  }

  const content = adfToPlainText(node.content ?? [], depth + 1);

  switch (node.type) {
    case "text":
      return node.text ?? "";
    case "paragraph":
      return `${content}\n`;
    case "heading":
      return `${content}\n`;
    case "bulletList":
    case "orderedList":
      return `${content}\n`;
    case "listItem":
      return `- ${content.trim()}\n`;
    case "hardBreak":
      return "\n";
    case "doc":
      return content.trim();
    default:
      return content;
  }
}

class JiraClient {
  constructor({ baseUrl, email, token }) {
    this.baseUrl = baseUrl;
    this.auth = Buffer.from(`${email}:${token}`).toString("base64");
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${this.auth}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Jira API returned non-JSON response for ${path}: ${response.status} ${response.statusText}. Body: ${text.slice(0, 500)}`,
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        `Jira API ${response.status} ${response.statusText}: ${JSON.stringify(data)}`,
      );
    }

    return data;
  }

  getCurrentUser() {
    return this.request("/rest/api/3/myself");
  }

  getProject(projectKey) {
    return this.request(`/rest/api/3/project/${encodeURIComponent(projectKey)}`);
  }

  getIssueTypes(projectKey) {
    return this.request(
      `/rest/api/3/issuetype/project?projectId=${encodeURIComponent(projectKey)}`,
    );
  }

  getPriorities() {
    return this.request("/rest/api/3/priority");
  }

  getActiveSprints(boardId) {
    return this.request(
      `/rest/agile/1.0/board/${encodeURIComponent(boardId)}/sprint?state=active`,
    );
  }

  getSprintIssues(sprintId) {
    return this.request(
      `/rest/agile/1.0/sprint/${encodeURIComponent(sprintId)}/issue?maxResults=100&fields=summary,status,issuetype,priority,assignee`,
    );
  }

  getIssue(issueKey) {
    return this.request(
      `/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description,status,issuetype,priority,assignee,labels,parent,subtasks`,
    );
  }

  async searchBySourceLabel(projectKey, label) {
    const jql = `project = ${projectKey} AND labels = "${label}" ORDER BY created DESC`;

    return this.request("/rest/api/3/search/jql", {
      method: "POST",
      body: JSON.stringify({
        jql,
        maxResults: 1,
        fields: ["summary", "labels"],
      }),
    });
  }

  createIssue(fields) {
    return this.request("/rest/api/3/issue", {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
  }
}

async function main() {
  loadEnvFile(envPath);

  const args = parseArgs();
  const baseUrl = normalizeBaseUrl(requiredEnv("JIRA_BASE_URL"));
  const email = requiredEnv("JIRA_EMAIL");
  const token = requiredEnv("JIRA_API_TOKEN");
  const projectKey = requiredEnv("JIRA_PROJECT_KEY");
  const boardUrl = process.env.JIRA_BOARD_URL;
  const boardId =
    process.env.JIRA_BOARD_ID ??
    boardUrl?.match(/\/boards\/(\d+)/)?.[1] ??
    "67";
  const jira = new JiraClient({ baseUrl, email, token });
  const plan = parsePlan(readFileSync(planPath, "utf8"));

  console.log(`Jira base URL: ${baseUrl}`);
  console.log(`Jira project key: ${projectKey}`);
  if (boardUrl) console.log(`Jira board URL: ${boardUrl}`);

  if (args.sprint) {
    const currentUser = await jira.getCurrentUser();
    console.log(`Authenticated as: ${currentUser.displayName} (${currentUser.emailAddress ?? "email hidden"})`);

    const sprints = await jira.getActiveSprints(boardId);
    const activeSprints = sprints.values ?? [];

    if (activeSprints.length === 0) {
      console.log(`No active sprint found for board ${boardId}.`);
      return;
    }

    for (const sprint of activeSprints) {
      console.log(`Active sprint: ${sprint.name} (${sprint.id})`);
      console.log(`Start: ${sprint.startDate ?? "n/a"}`);
      console.log(`End: ${sprint.endDate ?? "n/a"}`);

      const issues = await jira.getSprintIssues(sprint.id);
      const rows = (issues.issues ?? []).map((issue) => ({
        key: issue.key,
        type: issue.fields?.issuetype?.name ?? "",
        status: issue.fields?.status?.name ?? "",
        priority: issue.fields?.priority?.name ?? "",
        assignee: issue.fields?.assignee?.displayName ?? "Unassigned",
        summary: issue.fields?.summary ?? "",
      }));

      console.table(rows);
    }

    return;
  }

  if (args.issue) {
    const currentUser = await jira.getCurrentUser();
    console.log(`Authenticated as: ${currentUser.displayName} (${currentUser.emailAddress ?? "email hidden"})`);

    const issue = await jira.getIssue(args.issue);
    console.log(`Issue: ${issue.key}`);
    console.log(`Summary: ${issue.fields?.summary ?? ""}`);
    console.log(`Type: ${issue.fields?.issuetype?.name ?? ""}`);
    console.log(`Status: ${issue.fields?.status?.name ?? ""}`);
    console.log(`Priority: ${issue.fields?.priority?.name ?? ""}`);
    console.log(`Assignee: ${issue.fields?.assignee?.displayName ?? "Unassigned"}`);
    console.log(`Labels: ${(issue.fields?.labels ?? []).join(", ")}`);
    if (issue.fields?.parent) {
      console.log(`Parent: ${issue.fields.parent.key} - ${issue.fields.parent.fields?.summary ?? ""}`);
    }
    console.log("Description:");
    console.log(adfToPlainText(issue.fields?.description));
    return;
  }

  let issueTypeNames = new Set(["Epic", "Story", "Task", "Technical Story"]);
  let priorityNames = new Set(["Highest", "High", "Medium", "Low"]);

  if (args.offline) {
    console.log("Offline mode: skipping Jira API metadata checks.");
  } else {
    const project = await jira.getProject(projectKey);
    console.log(`Connected to Jira project: ${project.key} - ${project.name}`);

    const issueTypes = await jira.getIssueTypes(project.id);
    issueTypeNames = new Set(issueTypes.map((type) => type.name));
    console.log(`Available issue types: ${[...issueTypeNames].join(", ")}`);

    const priorities = await jira.getPriorities();
    priorityNames = new Set(priorities.map((priority) => priority.name));
    console.log(`Available priorities: ${[...priorityNames].join(", ")}`);
  }

  if (args.check) {
    return;
  }

  const epicIssueType = issueTypeNames.has("Epic")
    ? "Epic"
    : issueTypeNames.has("Task")
      ? "Task"
      : [...issueTypeNames][0];
  const createdEpics = new Map();
  let plannedIssueCount = 0;

  for (const epic of plan) {
    const source = sourceId(epic);
    const label = `weldoo-${slugLabel(source)}`;
    const summary = `[${source}] ${epic.title}`;
    const fields = {
      project: { key: projectKey },
      issuetype: { name: epicIssueType },
      summary,
      description: descriptionDoc({
        source,
        status: "Epic",
        phase: "Planning",
        prompt: epic.objective,
        notes: ["Generated from Weldoo epics task plan."],
      }),
      labels: ["weldoo-import", label, "weldoo-epic"],
    };

    if (args.dryRun) {
      console.log(`[dry-run] Epic ${summary}`);
    } else {
      const existing = await jira.searchBySourceLabel(projectKey, label);
      if (existing.issues?.[0]) {
        createdEpics.set(epic.number, existing.issues[0].key);
        console.log(`[skip] Existing epic ${existing.issues[0].key} ${summary}`);
      } else {
        const created = await jira.createIssue(fields);
        createdEpics.set(epic.number, created.key);
        console.log(`[create] Epic ${created.key} ${summary}`);
      }
    }

    for (let index = 0; index < epic.tasks.length; index += 1) {
      const task = epic.tasks[index];
      const taskSource = sourceId(epic, index);
      const taskLabel = `weldoo-${slugLabel(taskSource)}`;
      const phase = task.status.includes("Phase 2") ? "Phase 2" : "Phase 1 / MVP";
      const issueType = inferIssueType(task, issueTypeNames);
      const taskFields = {
        project: { key: projectKey },
        issuetype: { name: issueType },
        summary: `[${taskSource}] ${task.title}`,
        description: descriptionDoc({
          source: taskSource,
          status: task.status,
          phase,
          prompt: task.prompt,
          notes: task.notes,
        }),
        labels: [
          "weldoo-import",
          taskLabel,
          `weldoo-${slugLabel(epic.title)}`,
          task.status.includes("Phase 2") ? "phase-2" : "phase-1",
        ],
      };
      const priority = inferPriority(task, priorityNames);
      if (priority) taskFields.priority = { name: priority };

      const parentKey = createdEpics.get(epic.number);
      if (!args.dryRun && parentKey && issueType !== "Epic") {
        taskFields.parent = { key: parentKey };
      }

      plannedIssueCount += 1;
      if (args.limit && plannedIssueCount > args.limit) {
        console.log(`Limit reached: ${args.limit}`);
        return;
      }

      if (args.dryRun) {
        console.log(
          `[dry-run] ${issueType} [${taskSource}] ${task.title} (${task.status}, ${inferStoryPoints(task)} pts)`,
        );
      } else {
        const existing = await jira.searchBySourceLabel(projectKey, taskLabel);
        if (existing.issues?.[0]) {
          console.log(`[skip] Existing issue ${existing.issues[0].key} [${taskSource}] ${task.title}`);
        } else {
          const created = await jira.createIssue(taskFields);
          console.log(`[create] Issue ${created.key} [${taskSource}] ${task.title}`);
        }
      }
    }
  }

  console.log(`Finished. Mode: ${args.dryRun ? "dry-run" : "push"}.`);
}

main().catch((error) => {
  console.error(error.message);
  if (error.cause) {
    console.error(`Cause: ${error.cause.code ?? error.cause.name ?? "unknown"} ${error.cause.message ?? ""}`.trim());
  }
  process.exit(1);
});
