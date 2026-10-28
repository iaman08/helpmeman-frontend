export type HeroPreviewPhase = 0 | 1 | 2;

export const HERO_PHASES = [
  { label: "Ask", description: "Start with your question", hold: 1100 },
  { label: "Match", description: "Find relevant experience", hold: 1000 },
  { label: "Connect", description: "Talk it through, one to one", hold: 3200 },
] as const;

export const HERO_EXAMPLES = [
  {
    word: "career move.",
    query: "I want to feel ready for my next tech interview.",
    name: "Anwesh Das",
    role: "Software Engineer · Rubrik",
    skill: "System design & interviews",
    shortSkill: "Tech interviews",
    avatar: "/mentor3.jpg",
  },
  {
    word: "big idea.",
    query: "I have a startup idea. Where do I begin?",
    name: "Prakhar Shrivastava",
    role: "Co-founder · TrenchersAI",
    skill: "Startups & product strategy",
    shortSkill: "Startups & product",
    avatar: "/mentor5.jpeg",
  },
  {
    word: "next chapter.",
    query: "How do I get started with open source?",
    name: "Vineet",
    role: "GSoC Mentor · IIT Roorkee",
    skill: "Open source & GSoC",
    shortSkill: "Open source",
    avatar: "/mentor1.png",
  },
] as const;
