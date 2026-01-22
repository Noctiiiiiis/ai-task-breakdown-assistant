import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const SYSTEM_PROMPT = `You are a productivity coach.\n\nBreak the user's goal into a concise, actionable plan with 5–7 steps.\nEach step must include a short title and a short description.\nBe practical and avoid overengineering.\nIf the goal is ambiguous, include a short assumptions array.\nIf dependencies or risks exist, include a short risks array.\n\nReturn JSON only.\nJSON shape:\n{\n  "goal": string,\n  "assumptions": string[],\n  "steps": [{ "step": number, "title": string, "description": string }],\n  "risks": string[]\n}\nReturn ONLY valid JSON with double quotes.\n`;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate-plan", async (req, res) => {
  try {
    const goal = String(req.body?.goal || "").trim();
    if (!goal || goal.length < 3) {
      return res.status(400).json({ error: "Please provide a clearer goal." });
    }

    const plan = await generatePlan(goal);
    return res.json({ plan });
  } catch (error) {
    console.error("Plan generation failed:", error);
    return res.status(500).json({ error: "Failed to generate plan. Try again." });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "..", "..", "client", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function generatePlan(goal) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return fallbackPlan(goal);
  }

  const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: goal }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  const content = result?.response?.text?.().trim();
  if (!content) {
    throw new Error("Empty AI response.");
  }

  return normalizePlan(JSON.parse(content), goal);
}

function fallbackPlan(goal) {
  return {
    goal,
    assumptions: ["This plan is a placeholder because AI_API_KEY is not set."],
    steps: [
      {
        step: 1,
        title: "Clarify the goal and success criteria",
        description: "Define what success looks like in one sentence.",
      },
      {
        step: 2,
        title: "Identify the minimum viable steps",
        description: "List the smallest set of actions that create value.",
      },
      {
        step: 3,
        title: "Validate inputs and constraints",
        description: "Confirm resources, timelines, and dependencies.",
      },
      {
        step: 4,
        title: "Execute and verify progress",
        description: "Deliver each step and check results quickly.",
      },
      {
        step: 5,
        title: "Review and iterate",
        description: "Capture learnings and refine the plan for next time.",
      },
    ],
    risks: [],
  };
}

function normalizePlan(plan, fallbackGoal) {
  if (!plan || typeof plan !== "object") {
    throw new Error("Invalid plan format.");
  }

  const goal = typeof plan.goal === "string" && plan.goal.trim() ? plan.goal : fallbackGoal;
  const assumptions = Array.isArray(plan.assumptions)
    ? plan.assumptions.filter((item) => typeof item === "string" && item.trim())
    : [];
  const risks = Array.isArray(plan.risks)
    ? plan.risks.filter((item) => typeof item === "string" && item.trim())
    : [];
  const steps = Array.isArray(plan.steps) ? plan.steps : [];

  const normalizedSteps = steps
    .filter((step) => step && typeof step === "object")
    .map((step, index) => {
      const title = typeof step.title === "string" ? step.title.trim() : "";
      const description =
        typeof step.description === "string" ? step.description.trim() : "";
      return {
        step: index + 1,
        title: title || `Step ${index + 1}`,
        description: description || "Add a short, actionable description.",
      };
    });

  if (normalizedSteps.length < 5) {
    throw new Error("Plan must include 5–7 steps.");
  }

  const trimmedSteps = normalizedSteps.slice(0, 7);

  return {
    goal,
    assumptions,
    steps: trimmedSteps,
    risks,
  };
}
