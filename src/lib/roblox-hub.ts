export type RobloxGame = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  category: string;
  playStyles: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  spending: "Low" | "Medium" | "High";
  multiplayer: "Solo friendly" | "Better with friends" | "Multiplayer first";
  hasCodes: boolean;
  hasTrading: boolean;
  updateSignal: string;
  bestFor: string;
  imageUrl: string;
  tools: string[];
  guideIdeas: string[];
  starterTips: string[];
  faq: { question: string; answer: string }[];
};

export type RobloxToolIdea = {
  slug: string;
  name: string;
  summary: string;
  status: "Live" | "Planned";
  href: string;
  game?: string;
};

const robloxGameImage = (slug: string) => `/roblox/games/${slug}.png`;

export const robloxGames: RobloxGame[] = [
  {
    slug: "grow-a-garden",
    name: "Grow a Garden",
    tagline: "Cozy farming with trading, pets, weather, and mutation value hunting.",
    summary:
      "A high-demand farming and collection game where players care about crop value, mutations, pets, seeds, events, and return on time.",
    category: "Farming Simulator",
    playStyles: ["Cozy", "Trading", "Collection", "Event grinding"],
    difficulty: "Easy",
    spending: "Medium",
    multiplayer: "Solo friendly",
    hasCodes: true,
    hasTrading: true,
    updateSignal: "Strong event and value-list demand",
    bestFor: "Players who like collecting, optimizing harvests, and checking item value before trading.",
    imageUrl: robloxGameImage("grow-a-garden"),
    tools: [
      "Crop value calculator",
      "Mutation multiplier table",
      "Pet bonus checklist",
      "Seed and event tracker",
    ],
    guideIdeas: [
      "Best crops for beginners",
      "Mutation value explained",
      "Pet bonuses ranked by usefulness",
      "Event shop priority list",
    ],
    starterTips: [
      "Start with crops that are easy to replant and compare profit per harvest, not just sale price.",
      "Track mutation bonuses separately because one boosted crop can outperform several normal harvests.",
      "Keep event items documented because limited shops often drive search demand after updates.",
    ],
    faq: [
      {
        question: "Is Grow a Garden good for a UsefulKit game hub page?",
        answer:
          "Yes. It has repeat searches around crop value, mutations, pets, seeds, and event items, which fits calculators and guide tables well.",
      },
      {
        question: "What should the first tool be?",
        answer:
          "Start with a crop value calculator, then expand into mutation multipliers and pet bonuses once the base dataset is stable.",
      },
    ],
  },
  {
    slug: "steal-a-brainrot",
    name: "Steal a Brainrot",
    tagline: "Chaotic idle income, stealing, rare units, and value comparison.",
    summary:
      "A viral Roblox experience built around buying, stealing, defending, and upgrading income-producing characters.",
    category: "Idle / Tycoon",
    playStyles: ["PvP", "Trading", "Idle income", "Collection"],
    difficulty: "Medium",
    spending: "High",
    multiplayer: "Multiplayer first",
    hasCodes: true,
    hasTrading: true,
    updateSignal: "Very strong value-list and tier-list demand",
    bestFor: "Players who want quick progression, risky steals, and clear value rankings.",
    imageUrl: robloxGameImage("steal-a-brainrot"),
    tools: [
      "Brainrot value list",
      "Income-per-minute calculator",
      "Fuse cost estimator",
      "Rarity and mutation filters",
    ],
    guideIdeas: [
      "Best early-game Brainrots",
      "How to protect high-value units",
      "Fuse Machine guide",
      "Rarity and income explained",
    ],
    starterTips: [
      "Compare income rate against acquisition cost before chasing a rare unit.",
      "Separate casual recommendations from PvP recommendations because risk changes value.",
      "Use version dates on value pages so players know when rankings were last reviewed.",
    ],
    faq: [
      {
        question: "Why is this game useful for SEO?",
        answer:
          "Players search for value lists, rarity, fuse costs, income rates, and update-specific unit names. Those are strong long-tail pages.",
      },
      {
        question: "Is it risky to cover?",
        answer:
          "Cover normal guides, values, and calculators only. Avoid exploit scripts, automation, account selling, or free Robux claims.",
      },
    ],
  },
  {
    slug: "fisch",
    name: "Fisch",
    tagline: "Fishing discovery built around locations, weather, bait, rods, and rare catches.",
    summary:
      "A discovery-heavy fishing game where players repeatedly search for fish locations, weather conditions, bait choices, and rod upgrades.",
    category: "Fishing / Exploration",
    playStyles: ["Exploration", "Collection", "Completionist", "Cozy"],
    difficulty: "Medium",
    spending: "Low",
    multiplayer: "Solo friendly",
    hasCodes: true,
    hasTrading: false,
    updateSignal: "Strong fish finder and location guide demand",
    bestFor: "Players who like checklist progress, rare catches, and route planning.",
    imageUrl: robloxGameImage("fisch"),
    tools: [
      "Fish location finder",
      "Rod progression guide",
      "Bait recommendation table",
      "Weather and time checklist",
    ],
    guideIdeas: [
      "All fish by location",
      "Best rods by stage",
      "Weather-only fish checklist",
      "Beginner route for fast progress",
    ],
    starterTips: [
      "Structure pages by location first because that matches how players search while playing.",
      "Keep weather, time, bait, and rod requirements as separate columns for easy scanning.",
      "Add filters before adding more prose because this game benefits from fast lookup.",
    ],
    faq: [
      {
        question: "What is the best Fisch tool idea?",
        answer:
          "A fish finder where users select location, weather, time, and bait to see matching catches.",
      },
      {
        question: "Should Fisch be grouped with codes?",
        answer:
          "Yes, but codes should be secondary. The stronger evergreen pages are fish locations, rods, bait, and rare catch conditions.",
      },
    ],
  },
  {
    slug: "blox-fruits",
    name: "Blox Fruits",
    tagline: "A long-running combat and trading game with fruits, stock, builds, and materials.",
    summary:
      "One of Roblox's most durable large games, with ongoing searches for fruit stock, fruit value, leveling, fighting styles, and materials.",
    category: "Adventure / Fighting",
    playStyles: ["Combat", "Trading", "Grinding", "Builds"],
    difficulty: "Hard",
    spending: "Medium",
    multiplayer: "Better with friends",
    hasCodes: true,
    hasTrading: true,
    updateSignal: "Evergreen traffic with stock and value searches",
    bestFor: "Players who want long-term progression, combat builds, and trading decisions.",
    imageUrl: robloxGameImage("blox-fruits"),
    tools: [
      "Fruit stock page",
      "Fruit value comparison",
      "Material checklist",
      "Leveling route guide",
    ],
    guideIdeas: [
      "Best fruits for beginners",
      "Fruit stock explained",
      "Materials by island",
      "PvE vs PvP fruit picks",
    ],
    starterTips: [
      "Treat stock and value as separate workflows because players search them with different intent.",
      "Use clear update dates because Blox Fruits pages can become outdated quickly after patches.",
      "Build internal links from fruit guides to materials, islands, and fighting styles.",
    ],
    faq: [
      {
        question: "Is Blox Fruits too competitive?",
        answer:
          "The broad keywords are competitive, but long-tail pages around fruits, materials, and routes can still be useful.",
      },
      {
        question: "What should UsefulKit avoid here?",
        answer:
          "Avoid claiming live stock unless the data is actually updated. A manual 'last checked' model is safer for MVP.",
      },
    ],
  },
  {
    slug: "99-nights-in-the-forest",
    name: "99 Nights in the Forest",
    tagline: "Co-op survival with campfire defense, classes, resources, and night threats.",
    summary:
      "A survival-focused Roblox game where guides can help players plan classes, defend camp, manage resources, and survive escalating nights.",
    category: "Survival / Horror",
    playStyles: ["Co-op", "Survival", "Base defense", "Resource management"],
    difficulty: "Hard",
    spending: "Low",
    multiplayer: "Better with friends",
    hasCodes: true,
    hasTrading: false,
    updateSignal: "Strong guide demand around survival routes and class choices",
    bestFor: "Players who want co-op planning, survival checklists, and threat counters.",
    imageUrl: robloxGameImage("99-nights-in-the-forest"),
    tools: [
      "Night survival checklist",
      "Class tier list",
      "Resource planner",
      "Threat counter guide",
    ],
    guideIdeas: [
      "Best classes for beginners",
      "How to survive early nights",
      "Base defense checklist",
      "Resource priority guide",
    ],
    starterTips: [
      "Organize guides by night ranges so players can act while in a run.",
      "Separate solo and co-op advice because class value changes with team composition.",
      "Use checklist-style content because survival players need fast decisions.",
    ],
    faq: [
      {
        question: "Does this fit UsefulKit even without trading?",
        answer:
          "Yes. It is less about value lists and more about checklists, survival routes, class comparison, and co-op planning.",
      },
      {
        question: "What is the first page to build?",
        answer:
          "Start with a beginner survival checklist, then add class rankings and resource planning pages.",
      },
    ],
  },
];

export const robloxToolIdeas: RobloxToolIdea[] = [
  {
    slug: "roblox-player-lookup",
    name: "Roblox Player Lookup",
    summary: "Look up public profile, avatar, and social signals for a Roblox user.",
    status: "Live",
    href: "/tools/roblox-player-lookup",
  },
  {
    slug: "roblox-game-lookup",
    name: "Roblox Experience Lookup",
    summary: "Check public experience details, stats, and icon data by place or universe ID.",
    status: "Live",
    href: "/tools/roblox-game-lookup",
  },
  {
    slug: "grow-a-garden-value-calculator",
    name: "Grow a Garden Value Calculator",
    summary: "Estimate crop value from base item, quantity, mutation, and pet bonuses.",
    status: "Planned",
    href: "/roblox/games/grow-a-garden",
    game: "Grow a Garden",
  },
  {
    slug: "steal-a-brainrot-value-list",
    name: "Steal a Brainrot Value List",
    summary: "Filter Brainrots by rarity, income, price, mutation, and update version.",
    status: "Planned",
    href: "/roblox/games/steal-a-brainrot",
    game: "Steal a Brainrot",
  },
  {
    slug: "fisch-fish-finder",
    name: "Fisch Fish Finder",
    summary: "Find fish by location, weather, time, bait, and rod requirements.",
    status: "Planned",
    href: "/roblox/games/fisch",
    game: "Fisch",
  },
  {
    slug: "blox-fruits-stock",
    name: "Blox Fruits Stock Tracker",
    summary: "A manually reviewed stock and fruit value page with clear update timestamps.",
    status: "Planned",
    href: "/roblox/games/blox-fruits",
    game: "Blox Fruits",
  },
];

export const robloxCategoryLinks = [
  "Beginner friendly",
  "Games with codes",
  "Trading and value lists",
  "Play with friends",
  "Cozy and collection",
  "Survival and horror",
];

export function getRobloxGameBySlug(slug: string): RobloxGame | undefined {
  return robloxGames.find((game) => game.slug === slug);
}

export function getRobloxGamesWithCodes(): RobloxGame[] {
  return robloxGames.filter((game) => game.hasCodes);
}

export function getRobloxGamesWithTrading(): RobloxGame[] {
  return robloxGames.filter((game) => game.hasTrading);
}
