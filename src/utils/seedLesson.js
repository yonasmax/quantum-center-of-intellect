// src/utils/seedLesson.js
import { supabase } from '../supabaseClient';

export async function seedDecompositionLesson() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('You must be logged in.');

  const lesson = {
    title: "Types of Chemical Reactions: Decomposition (Analysis) Reactions",
    subject: "Chemistry",
    grade: "Grade 10",
    duration: 45,
    cover_image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    video_url: "https://www.youtube.com/watch?v=0kF6u32gT2c",
    is_published: true,
    teacher_id: session.user.id,
    content_blocks: [
      { type: "heading", content: "Understanding Decomposition Reactions", level: 2 },
      { type: "text", content: "Decomposition reactions involve breaking down a single complex compound into two or more simpler substances or elemental components. Because chemical bonds within the reactant must be broken, these reactions are endothermic." },
      { type: "formula", content: "2HgO(s) -> 2Hg(l) + O2(g)" },
      { type: "callout", content: "Key Takeaway: Energy inputs like heat, electricity, or light are necessary to break robust chemical bonds." },
      { type: "quiz", question: "What symbol is placed above a reaction arrow to indicate thermal decomposition?", options: ["Delta (heat)", "(aq)", "STP", "Hz"], correctAnswer: 0, explanation: "Delta means heat." },
      { type: "quiz", question: "What is the general chemical formula representing a decomposition reaction?", options: ["A + B -> AB", "AB -> A + B", "A + BC -> AC + B", "AB + CD -> AD + CB"], correctAnswer: 1, explanation: "AB -> A + B." }
    ]
  };

  // First, delete the broken one if it exists (to avoid duplicates)
  await supabase.from('lessons').delete().eq('title', lesson.title);

  // Insert fresh
  const { data, error } = await supabase.from('lessons').insert([lesson]).select();
  if (error) throw new Error(error.message);
  return data[0];
}
