export const templates = {
  skills: {
    name: "string",
    parents: "!skills array",
    itemLink: "?!items"
  },
  locations: {
    name: "string",
    text: "longstring",
    actions: "!actions array",
    cardset: "?!locations"
  },
  actions: {
    name: "string",
    text: "longstring",
    ooc: "?longstring",
    checkpoint: "?string",
    results: "result array",
    hidden: "?bool",
    requirements: "!items req dict",
    costs: "!items number dict",
    minutes: "?number",
    check: "?check",
    flags: "?flags",
    args: "string array"
  },
  flags: {
    nextSemester: "?bool",
    locationOverride: "?!locations",
    noResultScreen: "?bool"
  },
  check: {
    difficulty: "number",
    skill: "!skills"
  },
  result: {
    text: "longstring",
    location: "?!locations",
    skills: "!skills number dict",
    items: "!items number dict"
  },
  req: {
    min: "number",
    max: "?number"
  },
  items: {
    name: "string",
    skill_coeffs: "!skills number dict",
    value: "?number",
    category: "?string",
    decay: "?decay",
    is: "!items array",
    hidden: "?bool",
    baseVarietyType: "?!items",
    baseTraits: "string string dict",
    minq: "display"
  },
  decay: {
    minutes: "number",
    message: "?longstring"
  },
  markets: {
    name: "string",
    text: "longstring",
    items: "!items array"
  }
};
