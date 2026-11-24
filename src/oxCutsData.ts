export interface OxCut {
  id: number;
  amharicName: string;
  phoneticEn: string;
  englishMeaning: string;
  traditionalDish: string;
  cookingStyle: string;
  description: string;
  // Position of the label box on the original image (in percentage)
  labelPosition: {
    x: number; // percentage from left (center of badge)
    y: number; // percentage from top (center of badge)
    width?: number;
    height?: number;
  };
  // Target position on the ox body where the cut is located
  targetPoint: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  hint: string;
  funFact: string;
}

export const OX_CUTS: OxCut[] = [
  {
    id: 1,
    amharicName: "ሻኛ",
    phoneticEn: "Shagna",
    englishMeaning: "Bull's Hump",
    traditionalDish: "ለብለብ ጥብስ / ጥሬ ሥጋ (Lebleb Tibs / Raw Kurt)",
    cookingStyle: "በፍጥነት የሚጠበስ ወይም በጥሬው የሚበላ",
    description: "የበሬው ጉብታ (Hump) ሲሆን በስቡና ልስላሴው እጅግ ተወዳጅ ነው። በኢትዮጵያ ባህል ለክብር እንግዶች የሚቀርብ የላቀ የሥጋ ክፍል ነው።",
    hint: "በሬው አንገትና ጀርባ መገናኛ ላይ የሚገኘው ትልቁ ጉብታ ነው።",
    funFact: "ሻኛ በስቡ ጣፋጭ በመሆኑ ጥሬውን በቆረጠ ወይም ለብለብ ተደርጎ በአዋዜና በሚጥሚጣ ይበላል።",
    labelPosition: {
      x: 61.2,
      y: 13.8,
      width: 11,
      height: 4.8,
    },
    targetPoint: {
      x: 58.0,
      y: 28.0,
    },
  },
  {
    id: 2,
    amharicName: "ሳልገኝ",
    phoneticEn: "Salgegn",
    englishMeaning: "Prime Rib / Back Loin behind Hump",
    traditionalDish: "ልዩ የሸክላ ጥብስ (Special Shekla Tibs)",
    cookingStyle: "የሚጠበስና ለስላሳ",
    description: "ከሻኛ በስተጀርባ በጎድን አጥንቶች አናት ላይ የሚገኝ እጅግ ለስላሳና ቅባት ያለው የተመረጠ የሥጋ ክፍል ነው።",
    hint: "ከጉብታው (ሻኛ) በስተጀርባ በጀርባው አናት ላይ የሚገኝ ክፍል ነው።",
    funFact: "ሳልገኝ ለጥብስ ከሚመረጡ ምርጥ የሥጋ ክፍሎች አንዱ ሲሆን አጥንት አልባ ልስላሴ አለው።",
    labelPosition: {
      x: 42.0,
      y: 3.2,
      width: 14,
      height: 4.8,
    },
    targetPoint: {
      x: 52.0,
      y: 42.0,
    },
  },
  {
    id: 3,
    amharicName: "ሽንጥ",
    phoneticEn: "Shint",
    englishMeaning: "Tenderloin / Top Sirloin / Back Loin",
    traditionalDish: "ክትፎ እና ጎረድ ጎረድ (Kitfo & Gored Gored)",
    cookingStyle: "ጥሬ ወይም በቅቤ የተለወሰ",
    description: "በጀርባው የላይኛው ክፍል ላይ የሚገኝ ስብ የሌለው ንጹህና በጣም ለስላሳ ቀይ ሥጋ ነው። ለክትፎ አንደኛ ተመራጭ ነው።",
    hint: "በበሬው የላይኛው የጀርባ መስመር መሃል ላይ የሚገኝ ለስላሳ ክፍል ነው።",
    funFact: "ክትፎ ሲዘጋጅ ሽንጥ ሥጋ በጩቤ ደቆ በቅቤና በሚጥሚጣ ተለውሶ ይቀርባል።",
    labelPosition: {
      x: 30.6,
      y: 18.5,
      width: 11,
      height: 4.8,
    },
    targetPoint: {
      x: 35.5,
      y: 35.5,
    },
  },
  {
    id: 4,
    amharicName: "ታናሽ",
    phoneticEn: "Tanash",
    englishMeaning: "Rump / Upper Flank",
    traditionalDish: "የበሬ ጥብስ እና ወጥ (Beef Tibs & Wat)",
    cookingStyle: "ጥብስ ወይም ወጥ",
    description: "በበሬው ዳሌና የላይኛው የጭን ክፍል አጠገብ የሚገኝ ጣፋጭ ቀይ ሥጋ ነው።",
    hint: "ከታላቅ በላይ በበሬው የኋላ ዳሌ አካባቢ የሚገኝ ክፍል ነው።",
    funFact: "ታናሽ እና ታላቅ የኋላ እግር ክፍሎች ሆነው አንዱ ከሌላው በመጠኑና በቦታው ይለያያሉ።",
    labelPosition: {
      x: 12.8,
      y: 16.5,
      width: 12,
      height: 4.8,
    },
    targetPoint: {
      x: 19.5,
      y: 41.0,
    },
  },
  {
    id: 5,
    amharicName: "ታላቅ",
    phoneticEn: "Talaq",
    englishMeaning: "Round / Outer Thigh",
    traditionalDish: "የበሬ ሥጋ ወጥ / ቋንጣ (Wat / Quanta Dry Meat)",
    cookingStyle: "ለቀይ ወጥ ወይም ለቋንጣ",
    description: "የበሬው የኋላ ጭን ትልቁ የሥጋ ክፍል ነው። ጠንካራና የጡንቻ ሥጋ በመሆኑ ለቀይ ወጥ እና ለቋንጣ መስሪያነት ያገለግላል።",
    hint: "የበሬው የኋላ ጭን የውጨኛው ሰፊ የሥጋ ክፍል ነው።",
    funFact: "በገጠር ታላቅ ሥጋ በቀጫጭኑ ተተልትሎ በጨውና በኮረሪማ ተነክሮ ቋንጣ ይዘጋጅበታል።",
    labelPosition: {
      x: 5.8,
      y: 29.8,
      width: 11,
      height: 4.8,
    },
    targetPoint: {
      x: 17.0,
      y: 55.5,
    },
  },
  {
    id: 6,
    amharicName: "ነብሮ",
    phoneticEn: "Nebro",
    englishMeaning: "Lower Shank / Heel / Marrow Bone Cut",
    traditionalDish: "የበሬ ቅቅል (Beef Kekel Soup)",
    cookingStyle: "በውሃ የተቀቀለ መረቅ",
    description: "የበሬው የታችኛው የኋላ እግር ከሰኮናው በላይ ያለው ክፍል ነው። በጅማትና በኮላጅን የበለጸገ በመሆኑ ለመረቅና ለቅቅል ተመራጭ ነው።",
    hint: "የበሬው የኋላ እግር ታችኛው ሰኮና አጠገብ ያለ ክፍል ነው።",
    funFact: "ስያሜው ነብሮ የተባለው የሥጋው መዋቅር የተነመረ እና በጅማት የተሸፈነ ስለሆነ ነው።",
    labelPosition: {
      x: 8.4,
      y: 90.8,
      width: 11,
      height: 4.8,
    },
    targetPoint: {
      x: 15.0,
      y: 76.5,
    },
  },
  {
    id: 7,
    amharicName: "መሃል አገዳ",
    phoneticEn: "Mehal Ageda",
    englishMeaning: "Hind Leg Mid-Joint / Hock Cut",
    traditionalDish: "የበሬ ቅቅል እና አልጫ ወጥ (Kekel & Alicha Wat)",
    cookingStyle: "የሚቀቀል ወይም አልጫ ወጥ",
    description: "የበሬው የኋላ እግር ጉልበትና መገጣጠሚያ አካባቢ የሚገኝ ጅማታም የሥጋ ክፍል ነው።",
    hint: "በበሬው የኋላ እግር መገጣጠሚያ መሃል ላይ የሚገኝ ክፍል ነው።",
    funFact: "በውስጡ የሚገኘው ቅልጥም (Marrow) ሲፈላ ልዩ ጣዕም ይሰጣል!",
    labelPosition: {
      x: 26.5,
      y: 95.0,
      width: 16,
      height: 4.8,
    },
    targetPoint: {
      x: 26.2,
      y: 65.0,
    },
  },
  {
    id: 8,
    amharicName: "ዳቢት",
    phoneticEn: "Dabit",
    englishMeaning: "Flank / Belly Plate",
    traditionalDish: "የሰንጋ ጥብስ / አልጫ ጥብስ (Senga Tibs / Fried Flank)",
    cookingStyle: "የሚጠበስ ከሽንኩርትና ቃሪያ ጋር",
    description: "የሆድ ዕቃው የታችኛው ክፍል ሥጋ ሲሆን ቀጭን ቅባትና ሥጋ ተደራርቦ የሚገኝበት ጭማቂ የበዛበት ክፍል ነው።",
    hint: "በሬው ሆድ ስር የሚገኝ የስብና የቀይ ሥጋ ድብልቅ ነው።",
    funFact: "ዳቢት በሸክላ ምጣድ ሲጠበስ ስቡ ቀልጦ በራሱ ዘይት ስለሚጠበስ እጅግ ይጣፍጣል።",
    labelPosition: {
      x: 35.8,
      y: 82.2,
      width: 11,
      height: 4.8,
    },
    targetPoint: {
      x: 35.8,
      y: 48.5,
    },
  },
  {
    id: 9,
    amharicName: "ፍሪምባ",
    phoneticEn: "Firimba",
    englishMeaning: "Brisket / Sternum & Chest",
    traditionalDish: "ቅቅል እና ዝልዝል ጥብስ (Kekel & Zilzil Tibs)",
    cookingStyle: "መረቅ ወይም ጥብስ",
    description: "የደረት አጥንትና የደረቱ የፊት ክፍል ሥጋ ነው። ቅባታማና አጥንት ያለው በመሆኑ ለደስ የሚል መረቅና ለዝልዝል ጥብስ ይጠቅማል።",
    hint: "በበሬው ደረትና የፊት እግሮች መካከል የሚገኝ የደረት ሥጋ ነው።",
    funFact: "በበዓላት ቀን ፍሪምባ ተቀቅሎ መረቁ ከነጭ ሽንኩርትና ዝንጅብል ጋር መጠጣት የተለመደ ነው።",
    labelPosition: {
      x: 50.8,
      y: 93.5,
      width: 12,
      height: 4.8,
    },
    targetPoint: {
      x: 45.8,
      y: 60.5,
    },
  },
  {
    id: 10,
    amharicName: "ንቃይ (ወርች)",
    phoneticEn: "Nkay (Worch)",
    englishMeaning: "Shoulder / Chuck / Blade",
    traditionalDish: "የበሬ ቀይ ወጥ እና ምንቸት (Key Wat & Minchet Abish)",
    cookingStyle: "ለቀይ ወጥ እና ለተፈጨ ሥጋ",
    description: "የበሬው የፊት ትከሻ (Shoulder) ክፍል ሥጋ ነው። ጥሩ ፋይበር ያለው ጠንካራ ሥጋ ስለሆነ ለቀይ ወጥና ለተፈጨ ሚንቸት አቢሽ ምርጥ ነው።",
    hint: "የበሬው የፊት ትከሻ እና ክንድ አካባቢ የሚገኝ ክፍል ነው።",
    funFact: "ወርች ተብሎም የሚጠራው ይህ ክፍል በባህላዊ ድግስ ላይ ለቅርጫ ሲከፋፈል ትልቅ ድርሻ አለው።",
    labelPosition: {
      x: 75.5,
      y: 81.5,
      width: 20,
      height: 4.8,
    },
    targetPoint: {
      x: 64.0,
      y: 52.0,
    },
  },
];

export const BEER_BRANDS = [
  { name: "ቀዝቃዛው ሐበሻ ቢራ", brandEn: "Cold Habesha Beer", color: "from-amber-400 via-amber-500 to-yellow-600", tag: "ቀዝቃዛው ሐበሻ! የሚያረካ! 🍻" },
  { name: "ሐበሻ ረቂቅ ቢራ", brandEn: "Habesha Draft Beer", color: "from-yellow-400 via-amber-500 to-amber-700", tag: "የተመረጠ የገብስ ብቅል ልዩ ጣዕም! ✨" },
  { name: "ልዩ ሐበሻ ቢራ", brandEn: "Habesha Special Reserve", color: "from-amber-500 via-yellow-500 to-amber-600", tag: "ለበሬ ሥጋ ግብዣ ወደር የሌለው ምርጫ! 🥩" },
  { name: "የሚያረካ ሐበሻ ቢራ", brandEn: "Habesha Cold Satisfaction", color: "from-yellow-500 via-amber-600 to-amber-800", tag: "የሚያረካ ቅዝቃዜ! ❄️" },
  { name: "ሐበሻ ወርቃማ ቢራ", brandEn: "Habesha Golden Brew", color: "from-amber-400 via-amber-500 to-yellow-500", tag: "የኩራት መገለጫ! 👑" },
];

export const BUTCHER_RANKS = [
  { minBeers: 0, titleAm: "ጀማሪ ተመጋቢ", titleEn: "Novice Diner", badge: "🥩" },
  { minBeers: 3, titleAm: "የጥብስ ወዳጅ", titleEn: "Tibs Enthusiast", badge: "🔥" },
  { minBeers: 6, titleAm: "የክትፎ አዋቂ", titleEn: "Kitfo Connoisseur", badge: "🧈" },
  { minBeers: 8, titleAm: "የሐበሻ ቢራ ባለሙያ", titleEn: "Habesha Connoisseur", badge: "🍻" },
  { minBeers: 10, titleAm: "ዋና የሥጋ ሊቅ እና የሐበሻ ጀግና", titleEn: "Grand Master & Habesha Hero", badge: "👑" },
];
