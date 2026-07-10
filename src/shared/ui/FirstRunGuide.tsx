import { Icon } from "./Icon";
import { usePlayerStore, type FirstRunStep } from "../../stores/playerStore";

const steps: Exclude<FirstRunStep, "complete">[] = ["squad", "battle", "rewards", "upgrade"];
const guidance: Record<Exclude<FirstRunStep, "complete">, { title: string; detail: string }> = {
  squad: {
    title: "Form your first squad",
    detail:
      "Choose four owned ninjas. Front slots favor guards and strikers; supports prefer the rear.",
  },
  battle: {
    title: "Enter the Underground Shrine",
    detail:
      "Launch the repeatable dungeon, then watch or skip the deterministic battle presentation.",
  },
  rewards: {
    title: "Claim your expedition rewards",
    detail:
      "Coins, squad experience, and equipment have already been applied exactly once to this save.",
  },
  upgrade: {
    title: "Improve one squad member",
    detail:
      "Spend earned experience on a ninja level or reinforce an equipped item, then replay stronger.",
  },
};

export function FirstRunGuide() {
  const step = usePlayerStore((state) => state.firstRunStep);
  const setStep = usePlayerStore((state) => state.setFirstRunStep);
  if (step === "complete") return null;
  const currentIndex = steps.indexOf(step);
  const copy = guidance[step];

  return (
    <section className="first-run-guide" aria-label="First expedition guide">
      <span className="first-run-seal">
        <Icon name="spark" />
      </span>
      <div>
        <small>
          First expedition · Step {currentIndex + 1} of {steps.length}
        </small>
        <strong>{copy.title}</strong>
        <p>{copy.detail}</p>
      </div>
      <ol aria-label="First expedition progress">
        {steps.map((item, index) => (
          <li
            key={item}
            className={index < currentIndex ? "complete" : index === currentIndex ? "current" : ""}
          >
            <span>{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => setStep("complete")}>
        Skip guide
      </button>
    </section>
  );
}
