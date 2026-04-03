// ============================================
// Pedagogy Methods Definition
// Evidence-based learning techniques
// ============================================

import type { PedagogyMethod } from "@/lib/types";

export interface PedagogyMethodInfo {
  id: PedagogyMethod;
  name: string;
  description: string;
  evidence_base: string;
  implementation_in_3d: string;
  icon: string;
  color: string;
}

export const PEDAGOGY_METHODS: Record<PedagogyMethod, PedagogyMethodInfo> = {
  worked_example: {
    id: "worked_example",
    name: "Worked Examples",
    description:
      "Students learn by studying solved examples before attempting problems independently.",
    evidence_base:
      "Sweller et al. (1998) - Reduces cognitive load by providing a model to follow.",
    implementation_in_3d:
      "NPC demonstrates a process → Student tries with guidance → Student does independently.",
    icon: "📋",
    color: "#4CAF50",
  },
  retrieval_practice: {
    id: "retrieval_practice",
    name: "Retrieval Practice",
    description:
      "Students actively recall information from memory, strengthening long-term retention.",
    evidence_base:
      "Roediger & Butler (2011) - Testing effect: retrieving information strengthens memory more than re-studying.",
    implementation_in_3d:
      "NPC asks recall questions about previously encountered information in new contexts.",
    icon: "🧠",
    color: "#2196F3",
  },
  dual_coding: {
    id: "dual_coding",
    name: "Dual Coding",
    description:
      "Information is presented through both visual and verbal channels simultaneously.",
    evidence_base:
      "Paivio (1986) - Two representational systems (verbal + visual) enhance learning.",
    implementation_in_3d:
      "3D visual elements (maps, objects, animations) paired with text/dialogue explanations.",
    icon: "👁️",
    color: "#FF9800",
  },
  scaffolding: {
    id: "scaffolding",
    name: "Scaffolding",
    description:
      "Temporary support is gradually removed as learners gain competence.",
    evidence_base:
      "Wood, Bruner & Ross (1976) - Zone of proximal development support.",
    implementation_in_3d:
      "Early scenes have more hints/guidance; later scenes require more independent action.",
    icon: "🏗️",
    color: "#9C27B0",
  },
  interleaving: {
    id: "interleaving",
    name: "Interleaving",
    description:
      "Different topics/skills are mixed during practice rather than blocked.",
    evidence_base:
      "Rohrer & Taylor (2007) - Interleaving improves discrimination and long-term retention.",
    implementation_in_3d:
      "Knowledge from earlier scenes resurfaces in new contexts in later scenes.",
    icon: "🔀",
    color: "#E91E63",
  },
  elaborative_interrogation: {
    id: "elaborative_interrogation",
    name: "Elaborative Interrogation",
    description:
      'Students are asked "why" and "how" questions to deepen understanding.',
    evidence_base:
      'Pressley et al. (1992) - Generating explanations for "why" facts are true enhances learning.',
    implementation_in_3d:
      'NPCs ask "why do you think...?" and "how would that affect...?" questions.',
    icon: "❓",
    color: "#00BCD4",
  },
  spaced_repetition: {
    id: "spaced_repetition",
    name: "Spaced Repetition",
    description:
      "Information is reviewed at increasing intervals to optimize retention.",
    evidence_base:
      "Ebbinghaus (1885), Cepeda et al. (2006) - Spacing effect improves long-term memory.",
    implementation_in_3d:
      "Key concepts reappear across different acts with increasing time gaps.",
    icon: "📅",
    color: "#795548",
  },
};

export function getPedagogyInfo(method: PedagogyMethod): PedagogyMethodInfo {
  return PEDAGOGY_METHODS[method];
}

export function getAllPedagogyMethods(): PedagogyMethodInfo[] {
  return Object.values(PEDAGOGY_METHODS);
}
