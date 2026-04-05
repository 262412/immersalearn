# NPC Dialogue Skill

A drop-in **interactive NPC conversation** module powered by Claude.

Designed for educational games targeting **primary school children (ages 5–11)**:
- NPC responds in the child's language (auto-detects English / Chinese / etc.)
- Strict **anti-hallucination**: NPC only cites facts you provide
- Built-in **quick-reply suggestions** so young children who can't type can still engage
- Fully typed TypeScript, zero ImmersaLearn dependency

---

## File structure

```
packages/npc-dialogue/
  types.ts          — shared TypeScript types
  agent.ts          — server-side Anthropic logic (Node.js, framework-agnostic)
  route.ts          — ready-to-use Next.js App Router handler
  useNPCDialogue.ts — React hook (manages state + API calls)
  DialoguePanel.tsx — drop-in React component (panel + quick replies)
  index.ts          — barrel export
```

---

## Prerequisites

```bash
npm install @anthropic-ai/sdk lucide-react   # peer deps
```

Add to your `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Usage — 3 minutes to working NPC

### Step 1 — Copy the package

Copy the entire `packages/npc-dialogue/` directory into your project, e.g. `src/lib/npc-dialogue/`.

### Step 2 — Mount the API route

Copy `route.ts` to your Next.js API directory:

```
src/app/api/npc-chat/route.ts   ← paste route.ts here (no changes needed)
```

> **Other frameworks (Express, Fastify, etc.):** use `agent.ts` directly — it's just a function that returns a string.

### Step 3 — Use the drop-in component

```tsx
"use client";
import { useState } from "react";
import { NPCDialogue } from "@/lib/npc-dialogue/DialoguePanel";

const MY_NPC = {
  id: "guide_01",
  name: "Luna",
  role: "Friendly space guide",
  personality: "Curious, enthusiastic, loves asking questions",
  speech_style: "Simple sentences, lots of exclamation marks, uses space metaphors",
  knowledge_fact_ids: ["f1", "f2", "f3"],
};

const MY_FACTS = [
  { id: "f1", statement: "The Sun is a star, not a planet." },
  { id: "f2", statement: "Earth takes 365 days to orbit the Sun." },
  { id: "f3", statement: "Mars is called the Red Planet because of iron oxide in its soil." },
];

const MY_SCENE = {
  description: "Inside a space station overlooking Earth",
  objective: "Learn about the Solar System",
};

export default function GameScene() {
  const [showDialogue, setShowDialogue] = useState(false);

  return (
    <div className="relative w-screen h-screen">
      {/* your 3D scene / canvas here */}

      <button onClick={() => setShowDialogue(true)}>
        Talk to Luna
      </button>

      {showDialogue && (
        <NPCDialogue
          character={MY_NPC}
          facts={MY_FACTS}
          scene={MY_SCENE}
          onClose={() => setShowDialogue(false)}
        />
      )}
    </div>
  );
}
```

That's it. The component auto-greets the child when it mounts.

---

## Advanced — custom hook

If you need more control (custom UI, event callbacks, etc.):

```tsx
import { useNPCDialogue } from "@/lib/npc-dialogue/useNPCDialogue";
import { DialoguePanel } from "@/lib/npc-dialogue/DialoguePanel";

const { messages, isLoading, sendMessage, reset } = useNPCDialogue({
  apiEndpoint: "/api/npc-chat",
  character: MY_NPC,
  facts: MY_FACTS,
  scene: MY_SCENE,
  autoGreet: true,                  // NPC speaks first (default: true)
  fallbackGreeting: "Hello there!", // shown if API call fails
});

// Then render DialoguePanel with your own state:
<DialoguePanel
  npcName="Luna"
  npcRole="Space guide"
  messages={messages}
  isLoading={isLoading}
  onSendMessage={sendMessage}
  onClose={() => {}}
  quickReplies={["Tell me more! 🚀", "What is that? 🤔", "Cool! ⭐"]}
/>
```

---

## Advanced — server-side only (Express / API handler)

```typescript
import { generateNPCResponse } from "./agent";

const reply = await generateNPCResponse({
  character: MY_NPC,
  facts: MY_FACTS,
  scene: MY_SCENE,
  message: "What is a planet?",
  conversationHistory: [],
  targetAge: "7-9",      // optional, default "5-11"
  model: "claude-haiku-4-5-20251001",  // optional
  maxResponseTokens: 300,              // optional
});

console.log(reply); // → "A planet is a huge ball of rock or gas that travels around a star! ..."
```

---

## API Reference

### `NPCCharacter`
| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | ✓ | Unique ID |
| `name` | string | ✓ | Display name shown in UI |
| `role` | string | ✓ | Short description, e.g. `"art teacher"` |
| `personality` | string | ✓ | Drives NPC tone |
| `speech_style` | string | ✓ | How the NPC talks |
| `appearance` | string | | Optional — adds flavour to persona |
| `knowledge_fact_ids` | string[] | | IDs of facts this NPC knows. Omit → NPC gets all facts. |

### `KnowledgeFact`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID, referenced by `knowledge_fact_ids` |
| `statement` | string | The actual fact, e.g. `"Red + Blue = Purple"` |

### `SceneContext`
| Field | Type | Description |
|---|---|---|
| `description` | string | Where the scene takes place |
| `objective` | string | What the child should learn in this scene |

### `useNPCDialogue` options
| Option | Type | Default | Description |
|---|---|---|---|
| `apiEndpoint` | string | `/api/npc-chat` | Your mounted route path |
| `autoGreet` | boolean | `true` | NPC speaks first on mount |
| `fallbackGreeting` | string | `"Hi there! I'm ..."` | Shown if API fails |
| `targetAge` | string | `"5-11"` | Used in system prompt |

---

## Customising quick replies

```tsx
<NPCDialogue
  quickReplies={[
    "Explain again 🔄",
    "Give me a hint 💡",
    "Show me an example 📚",
    "I understand! ✅",
  ]}
  ...
/>
```

Pass `quickReplies={[]}` to hide them entirely.

---

## Model & cost

Default model: `claude-haiku-4-5-20251001`  
Max response: 300 tokens  
~$0.0004 per conversation turn at current Haiku pricing.
