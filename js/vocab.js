// Vocabulary definitions - kid-friendly versions
// Keys match the lowercase word; trigger via data-vocab="word" in the HTML.
const VOCAB = {
  hypnagogia: {
    word: "hypnagogia",
    pron: "hip-nuh-GO-jee-uh",
    def: "That dreamy, drifty feeling just before you fall asleep, when your thoughts start to turn into little pictures and strange little stories, and you aren't quite awake anymore but you aren't quite asleep either.",
    source: "https://en.wiktionary.org/wiki/hypnagogia"
  },
  resplendent: {
    word: "resplendent",
    pron: "ri-SPLEN-dent",
    def: "Shining and splendid and very beautiful to look at, like a peacock's tail or a sunset that makes you stop walking.",
    source: "https://en.wiktionary.org/wiki/resplendent"
  },
  aeons: {
    word: "aeons",
    pron: "EE-onz",
    def: "Huge, enormous amounts of time. Much, much longer than a year. Longer than a hundred years. Long enough for mountains to get a little shorter.",
    source: "https://en.wiktionary.org/wiki/eon"
  },
  picturesque: {
    word: "picturesque",
    pron: "pik-cher-ESK",
    def: "So pretty that it looks exactly like a picture someone would want to paint or take a photo of.",
    source: "https://en.wiktionary.org/wiki/picturesque"
  },
  abode: {
    word: "abode",
    pron: "uh-BODE",
    def: "A place where someone lives. A fancier word for house or home.",
    source: "https://en.wiktionary.org/wiki/abode"
  },
  voraciously: {
    word: "voraciously",
    pron: "vuh-RAY-shus-lee",
    def: "Eating very, very hungrily and fast, as if you haven't had a proper meal in a week.",
    source: "https://en.wiktionary.org/wiki/voracious"
  },
  circuitous: {
    word: "circuitous",
    pron: "sir-KYOO-it-us",
    def: "Going round and round in a twisty, long, roundabout way instead of in a straight line.",
    source: "https://en.wiktionary.org/wiki/circuitous"
  },
  contraptions: {
    word: "contraptions",
    pron: "kon-TRAP-shunz",
    def: "Odd-looking machines or gadgets, usually a bit rickety, usually built by someone who was very clever and maybe a little eccentric.",
    source: "https://en.wiktionary.org/wiki/contraption"
  },
  anemometer: {
    word: "anemometer",
    pron: "an-uh-MOM-it-er",
    def: "A little device that measures how strong the wind is blowing. It usually has cups or a spinner on top, and the harder the wind blows, the faster it spins.",
    source: "https://en.wiktionary.org/wiki/anemometer"
  },
  monocle: {
    word: "monocle",
    pron: "MON-uh-kul",
    def: "A single eyeglass that you hold or wedge into one eye, often worn by old professors and detectives in storybooks.",
    source: "https://en.wiktionary.org/wiki/monocle"
  },
  hypnagogia_alt: {
    word: "hypnagogia",
    pron: "hip-nuh-GO-jee-uh",
    def: "That sleepy, half-dreaming feeling right before you fall asleep."
  },
  // The crepe entry is special: it has a nested "click if not French" button
  crepe: {
    word: "crêpe",
    pron: "krep",
    def: "A very thin pancake, usually folded up and filled with something tasty like jam, cheese, or chocolate. Some people will tell you that crêpes and <em>nalesniki</em> are not the same thing. I ask those people — what's the difference between a coast, a cottage and a quote?",
    nested: {
      trigger: "click if not French",
      title: "A very short history of the crêpe",
      body: "We all know that it wouldn't have been, without the ingenuity of slavic dietary innovators, that the development of the crêpe would arrive in France in its current form. The blin, the nalesnik, both use milk, eggs and flour as the common ingredients. They trace their common origin back to Radogost, where at the dawn of the 10th century, human sacrifice was replaced with chicken offerings. Cultural transformations aside, the pagans did pretty well back then, and apart from a few skirmishes with the monarchs and crusaders — the witches, zhrets' and wajdelotas did pretty well until the invention of vodka.\n\nIt was not until the 13th century, when <em>chef de palais</em> at the court of Wenceslaus II of Bohemia, Dobroslav Hranolek, was sent on a mission to study under the guide of the best French chefs, to master the art of making the perfect French fry. One day he arrived at the kitchen early, and made nalesniki for breakfast, as he used to back home. The chef who mentored him tried it himself and it made his moustache twitch. Enough said — the recipe was a great success, although it took the aid of a wordsmith to trim down the number of syllables, and change the name to make it easier for the local population to pronounce."
    }
  }
};
