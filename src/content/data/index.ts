import type { GameContent } from "../../domain/models";
import { assets } from "./assets";
import { encounters } from "./encounters";
import { equipment } from "./equipment";
import { ninjas } from "./ninjas";
import { rewardTables } from "./rewards";
import { skills } from "./skills";
import { statuses } from "./statuses";

export const rawDemoContent = {
  version: "0.2.0",
  assets,
  statuses,
  skills,
  ninjas,
  equipment,
  rewardTables,
  encounters,
} satisfies GameContent;
