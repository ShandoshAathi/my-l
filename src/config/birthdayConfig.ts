import { BirthdayConfig } from '../types';

export const birthdayConfig: BirthdayConfig = {
  recipientName: "My Princess",
  birthdayHeading: "For You, My Love ♡",
  subtitle: "A magical little world crafted just for you...",
  
  introHeading: "Hey, My Princess ♡",
  introMessage: 
    "Today is the most special day because the most beautiful, wonderful person in my world was born. I created this magical little anime universe just for you, filled with every ounce of my love.",

  loveLetterHeading: "A Little Letter From My Heart",
  loveLetter: [
    "To the love of my life,",
    "Thank you for making my life brighter, my days happier, and my heart so much fuller.",
    "You are my favorite person, my sweetest memory, and my most beautiful tomorrow.",
    "I hope each day brings you all the gentle joy, soft laughter, and endless dreams you deserve.",
    "I love you today, tomorrow, and forever.",
    "Forever yours. ♡"
  ],

  cakeHeading: "A Cake Just For You 🎂",
  cakeSubtitle: "Close your eyes, make a secret wish, and blow out the candles...",
  cakeWishMessage: "May all your beautiful wishes come true, now and forever. ♡",

  finalHeading: "You Make My World Special ♡",
  finalMessage: 
    "Thank you for being the brightest light and the sweetest melody in my life. May every step you take this year be filled with wonder, blooming cherry blossoms, and endless smiles.\n\nI love you more than words could ever say. Forever and always. ♡",

  music: {
    title: "Romantic Anime Melody",
    artist: "Acoustic Piano & Chimes",
    src: "/audio/romantic-piano.mp3",
    fallbackProcedural: true
  },

  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com"
};
