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
    markets: "!markets array",
    image: "?string"
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
    noResultScreen: "?bool",
    multiItem: "?bool",
    skillLearnTime: "?number"
  },
  check: {
    difficulty: "number",
    difficultyCoeffs: "!items number dict",
    skill: "!skills"
  },
  result: {
    text: "longstring",
    isFailure: "?bool",
    isEither: "?bool",
    location: "?!locations",
    skills: "!skills number dict",
    items: "!items modnumber dict",
    specificItems: "specificItem array",
    actions: "!actions array",
    extraCopies: "number",
    actionLimit: "?number"
  },
  specificItem: {
    item: "!items",
    traits: "string string dict",
    count: "number"
  },
  req: {
    min: "number",
    max: "?number",
    traitMatch: "traitMatch array",
    invert: "?bool"
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
    isProgress: "?bool",
    baseVarietyType: "?!items",
    baseTraits: "string string dict",
    baseDefaultStates: "state array",
    timeToDouble: "?number",
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
