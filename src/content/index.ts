import { rawDemoContent } from "./data";
import { loadGameContent } from "./loader";

export const demoContent = loadGameContent(rawDemoContent);

export { rawDemoContent } from "./data";
export { ContentValidationError, loadGameContent, validateGameContent } from "./loader";
