import { useState } from "react";

export default function App() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setPlan(null);

    if (goal.trim().length < 3) {
      setError("Please enter a clearer goal.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed.");
      }

      setPlan(data.plan || null);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <main className="container">
        <header className="header">
          <p className="eyebrow">AI Task Breakdown Assistant</p>
          <h1>Turn a rough idea into an actionable plan.</h1>
          <p className="subtext">
            Describe your goal in plain language. You’ll get a focused, step-by-step
            execution plan.
          </p>
        </header>

        <form className="card input-card" onSubmit={submit}>
          <label className="label" htmlFor="goal">
            Your goal
          </label>
          <textarea
            id="goal"
            name="goal"
            rows={5}
            placeholder="Example: Plan and build a lightweight onboarding flow for a SaaS app."
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
          <div className="actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Creating plan..." : "Generate plan"}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>

        <section className="card output" aria-live="polite">
          <div className="output-header">
            <h2>Execution Plan</h2>
            <span className={plan ? "status ready" : "status"}>
              {plan ? "Ready" : "Waiting"}
            </span>
          </div>
          {loading && <p className="status-text">Thinking through the steps...</p>}
          {!loading && !plan && !error && (
            <p className="empty-state">Start with a clear goal to see your plan.</p>
          )}
          {plan && (
            <div className="plan-content">
              <p className="plan-goal">{plan.goal}</p>

              {Array.isArray(plan.assumptions) && plan.assumptions.length > 0 && (
                <div className="plan-section">
                  <h3>Assumptions</h3>
                  <ul>
                    {plan.assumptions.map((item, index) => (
                      <li key={`assumption-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="plan-section">
                <h3>Steps</h3>
                <div className="steps">
                  {plan.steps?.map((step) => (
                    <article className="step-card" key={step.step}>
                      <div className="step-header">
                        <span className="step-number">{step.step}</span>
                        <h4>{step.title}</h4>
                      </div>
                      <p className="step-description">{step.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              {Array.isArray(plan.risks) && plan.risks.length > 0 && (
                <div className="plan-section">
                  <h3>Risks</h3>
                  <ul>
                    {plan.risks.map((item, index) => (
                      <li key={`risk-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
