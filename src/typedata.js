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
    cardset: "?!locations",
    markets: "!markets array"
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
    items: "!items number dict",
    specificItems: "specificItem array"
  },
  specificItem: {
    item: "!items",
    traits: "string string dict",
    count: "number"
  },
  req: {
    min: "number",
    max: "?number",
    traitMatch: "traitMatch array"
  },
  traitMatch: {
    trait: "string",
    comparer: "string",
    value: "string"
  },
  items: {
    name: "string",
    pluralOverride: "?string",
    skill_coeffs: "!skills number dict",
    value: "?number",
    category: "?string",
    decay: "?decay",
    is: "!items array",
    hidden: "?bool",
    immobile: "?bool",
    baseVarietyType: "?!items",
    baseTraits: "string string dict",
    baseDefaultStates: "state array",
    minq: "display"
  },
  state: {
    name: "string",
    defaultValues: "string array"
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
