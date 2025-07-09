import { FlashcardData } from '@/components/FlashcardSet';

interface Story {
  id?: string;
  Organisation: string;
  Theme: string;
  Framing: string;
  Situation: string;
  Task: string;
  Action: string;
  Result: string;
  Lesson: string;
}

export const generateFlashcards = (stories: Story[]): FlashcardData[] => {
  const flashcards: FlashcardData[] = [];

  stories.forEach(story => {
    const storyId = story.id || Math.random().toString(36);

    // STAR Method flashcards
    flashcards.push(
      {
        id: `${storyId}-situation`,
        front: `Describe the SITUATION for your ${story.Theme} experience at ${story.Organisation}`,
        back: story.Situation,
        storyId,
        category: 'situation'
      },
      {
        id: `${storyId}-task`,
        front: `What was your TASK in the ${story.Theme} scenario at ${story.Organisation}?`,
        back: story.Task,
        storyId,
        category: 'task'
      },
      {
        id: `${storyId}-action`,
        front: `What ACTIONS did you take for ${story.Theme} at ${story.Organisation}?`,
        back: story.Action,
        storyId,
        category: 'action'
      },
      {
        id: `${storyId}-result`,
        front: `What were the RESULTS of your ${story.Theme} experience at ${story.Organisation}?`,
        back: story.Result,
        storyId,
        category: 'result'
      },
      {
        id: `${storyId}-lesson`,
        front: `What did you LEARN from your ${story.Theme} experience at ${story.Organisation}?`,
        back: story.Lesson,
        storyId,
        category: 'lesson'
      }
    );

    // Full story flashcard
    flashcards.push({
      id: `${storyId}-full`,
      front: `Tell me about a time when you demonstrated ${story.Theme}`,
      back: `**Situation:** ${story.Situation}\n\n**Task:** ${story.Task}\n\n**Action:** ${story.Action}\n\n**Result:** ${story.Result}\n\n**Lesson:** ${story.Lesson}`,
      storyId,
      category: 'full-story'
    });
  });

  // Shuffle the flashcards for better study experience
  return flashcards.sort(() => Math.random() - 0.5);
};

export const getRandomFlashcards = (flashcards: FlashcardData[], count: number = 10): FlashcardData[] => {
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getFlashcardsByCategory = (flashcards: FlashcardData[], category: FlashcardData['category']): FlashcardData[] => {
  return flashcards.filter(card => card.category === category);
};