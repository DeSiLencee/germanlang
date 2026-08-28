import type { Dialogue, Exercise, Level } from "@/types";
import { allITVocabulary, itCategories, itSentences } from "./catalog";
const formal = new Set([
  "Help Desk",
  "Users & Accounts",
  "Technical Support",
  "Job Interviews",
]);
const roles: Record<string, [string, string]> = {
  "Job Interviews": ["Interviewer", "Bewerber"],
  "IT Meetings": ["Teamleiter", "Techniker"],
  "Emails & Messages": ["Kollegin", "Administrator"],
  "Tickets & Incidents": ["Dispatcher", "Techniker"],
  "Help Desk": ["Benutzer", "Support"],
  "Technical Support": ["Benutzerin", "Support"],
  "Network Troubleshooting": ["Netzwerktechniker", "Administrator"],
  "Firewalls & Security": ["Administrator", "Network Engineer"],
};
const titles: Record<string, string[]> = Object.fromEntries(
  itCategories.map((c) => [
    c,
    [
      `${c}: Erste Prüfung`,
      `${c}: Rückfrage`,
      `${c}: Lösung`,
      `${c}: Statusupdate`,
    ],
  ]),
);
export const itDialogues: Dialogue[] = itCategories.flatMap((category, ci) =>
  itSentences
    .filter((s) => s.category === category)
    .slice(0, 4)
    .map((sentence, i) => {
      const [first, second] = roles[category] || ["Kollege", "Techniker"];
      const isFormal = formal.has(category);
      const lines =
        category === "Job Interviews"
          ? [
              {
                speaker: first,
                text: sentence.german,
                englishTranslation: sentence.english,
              },
              {
                speaker: second,
                text:
                  i === 0
                    ? "Gern. Ich arbeite im IT-Support und löse täglich technische Probleme."
                    : i === 1
                      ? "Ich habe praktische Erfahrung mit Routern, Switches und Firewalls."
                      : i === 2
                        ? "Zuerst sammle ich Informationen, dann prüfe ich die Konfiguration Schritt für Schritt."
                        : "Ich dokumentiere die Lösung und informiere anschließend das Team.",
                englishTranslation:
                  i === 0
                    ? "Certainly. I work in IT support and solve technical problems every day."
                    : i === 1
                      ? "I have practical experience with routers, switches, and firewalls."
                      : i === 2
                        ? "First I gather information, then I check the configuration step by step."
                        : "I document the solution and then inform the team.",
              },
              {
                speaker: first,
                text: "Können Sie dafür ein kurzes Beispiel nennen?",
                englishTranslation: "Can you give a short example of that?",
              },
              {
                speaker: second,
                text: "Ja. Bei einer Störung prüfe ich zuerst die wichtigsten Ursachen und teste danach die Lösung.",
                englishTranslation:
                  "Yes. During an incident, I first check the most important causes and then test the solution.",
              },
            ]
          : isFormal
            ? [
                {
                  speaker: first,
                  text: `Guten Tag. ${sentence.german}`,
                  englishTranslation: `Hello. ${sentence.english}`,
                },
                {
                  speaker: second,
                  text: "Danke für die Information. Seit wann besteht das Problem?",
                  englishTranslation:
                    "Thank you for the information. How long has the problem existed?",
                },
                {
                  speaker: first,
                  text: "Seit heute Morgen. Gestern hat noch alles funktioniert.",
                  englishTranslation:
                    "Since this morning. Everything was still working yesterday.",
                },
                {
                  speaker: second,
                  text: "Ich prüfe das jetzt und melde mich gleich wieder.",
                  englishTranslation:
                    "I will check it now and get back to you shortly.",
                },
              ]
            : [
                {
                  speaker: first,
                  text: "Hast du kurz Zeit?",
                  englishTranslation: "Do you have a moment?",
                },
                {
                  speaker: second,
                  text: "Ja, klar. Worum geht es?",
                  englishTranslation: "Yes, of course. What is it about?",
                },
                {
                  speaker: first,
                  text: sentence.german,
                  englishTranslation: sentence.english,
                },
                {
                  speaker: second,
                  text: "Okay. Ich prüfe das und gebe dir danach Bescheid.",
                  englishTranslation:
                    "Okay. I will check it and let you know afterwards.",
                },
              ];
      const vocab = allITVocabulary
        .filter((v) => v.category === category)
        .slice(0, 3)
        .map((v) => v.id);
      return {
        id: `it-dialogue-${ci + 1}-${i + 1}`,
        title: titles[category][i],
        level: sentence.level,
        category,
        technical: true,
        participants: [first, second],
        vocabularyIds: vocab,
        relatedExerciseIds: [`it-dialogue-ex-${ci + 1}-${i + 1}`],
        questions: [
          {
            prompt: "Worum geht es in diesem Gespräch?",
            answer: sentence.english,
            options: [
              sentence.english,
              "A lunch order",
              "A vacation request",
              "A train delay",
            ],
          },
        ],
        lines,
      };
    }),
);
export const itDialogueExercises: Exercise[] = itDialogues.map((d, i) => {
  const target = d.lines[2];
  const correct = target.text;
  const distractors = [
    "Ich bestelle heute eine Pizza.",
    "Der Zug kommt um acht Uhr.",
    "Das Wetter ist am Wochenende schön.",
  ];
  return {
    id: `it-dialogue-ex-${Math.floor(i / 4) + 1}-${(i % 4) + 1}`,
    type: "dialogue_completion",
    level: d.level as Level,
    category: d.category,
    prompt: `${d.lines[0].speaker}: ${d.lines[0].text}\n${d.lines[1].speaker}: ${d.lines[1].text}\n${target.speaker}: ___`,
    englishHelp: target.englishTranslation,
    answer: correct,
    answerEnglish: target.englishTranslation,
    options: [correct, ...distractors],
    explanation:
      "This response fits the technical context of the conversation.",
    technical: true,
  };
});
