// ============================================
// Repair truncated/malformed JSON from AI output
// AI often returns JSON that gets cut off by
// max_tokens, leaving unclosed brackets/braces
// ============================================

export function fixJSON(input: string): string {
  // First try parsing as-is
  try {
    JSON.parse(input);
    return input;
  } catch {
    // Continue to repair
  }

  let s = input.trim();

  // Remove trailing comma before closing brackets
  s = s.replace(/,\s*$/, "");

  // Remove any trailing partial key-value like `"key": ` or `"key"`
  s = s.replace(/,?\s*"[^"]*"\s*:\s*"?[^"}\]]*$/, "");

  // Count open/close braces and brackets
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") braces++;
    if (c === "}") braces--;
    if (c === "[") brackets++;
    if (c === "]") brackets--;
  }

  // If we're still inside a string, close it
  if (inString) {
    s += '"';
  }

  // Remove trailing comma again after string close
  s = s.replace(/,\s*$/, "");

  // Close any unclosed brackets/braces
  while (brackets > 0) {
    s += "]";
    brackets--;
  }
  while (braces > 0) {
    s += "}";
    braces--;
  }

  // Validate
  try {
    JSON.parse(s);
    return s;
  } catch {
    // More aggressive: try to find the last valid JSON object
    return tryExtractPartialJSON(input);
  }
}

function tryExtractPartialJSON(input: string): string {
  // Find the first { and try progressively shorter substrings
  const start = input.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in AI response");

  let s = input.slice(start);

  // Try closing from the end
  for (let cutoff = s.length; cutoff > 50; cutoff -= 10) {
    let attempt = s.slice(0, cutoff).trim();
    attempt = attempt.replace(/,\s*$/, "");

    // Count and close
    let braces = 0;
    let brackets = 0;
    let inStr = false;
    let esc = false;
    for (let i = 0; i < attempt.length; i++) {
      const c = attempt[i];
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "{") braces++;
      if (c === "}") braces--;
      if (c === "[") brackets++;
      if (c === "]") brackets--;
    }

    if (inStr) attempt += '"';
    attempt = attempt.replace(/,\s*$/, "");
    while (brackets > 0) { attempt += "]"; brackets--; }
    while (braces > 0) { attempt += "}"; braces--; }

    try {
      JSON.parse(attempt);
      return attempt;
    } catch {
      continue;
    }
  }

  throw new Error("Could not repair truncated JSON from AI response");
}
