// All chapters of the book.
// Each chapter has:
//   id: string, used for navigation
//   title: display title
//   number: roman numeral or label
//   html: prose with <span class="vocab" data-vocab="..."> markers
//   games: optional array of game slot objects {type, id, before/after}
//
// Game slots are inserted at specific <!--GAME:name--> comments in HTML.

const CHAPTERS = [

  // ---------- COVER ----------
  {
    id: "cover",
    title: "Pat Panackelty",
    isCover: true,
    html: `
      <div class="cover">
        <h1 class="cover-title">Pat Panackelty</h1>
        <p class="cover-subtitle">a dream in seven parts</p>
        <button class="cover-start" id="cover-start">open the book</button>
      </div>
    `
  },

  // ---------- CHAPTER 1: Dream intro ----------
  {
    id: "dream",
    title: "",
    number: "i",
    titleOverride: "—",
    html: `
      <div class="chapter-ornament">· · ·</div>

      <p class="dropcap no-indent">As you descend from <span class="vocab" data-vocab="hypnagogia">hypnagogia</span> into blissful slumber — a more chiselled and defined version of the dream-like world appears in front of you. One that is, so to speak, more real and more true to the inherent quality of fantasy worlds: limited only by the boundaries of imagination.</p>

      <p>At first, you fly high in the sky, only occasionally seeing the cloudy curtain reveal worlds of intriguing beauty, <span class="vocab" data-vocab="resplendent">resplendent</span> colours, fantastical beings and nature with monumental wonders of oddly-shaped architecture.</p>

      <p>You let them come and go as easily as they appear, but only after you've breathed their essence, and the sequence of their appearance seems to make sense to you on some level, even though they are so much different from one another, and it feels like it's not really you who controls what and when is being revealed.</p>

      <p>You bathe in the pleasant visions for what feels like <span class="vocab" data-vocab="aeons">aeons</span>, almost dissolving in the end.</p>

      <p class="centered" style="text-indent: 0; font-style: italic; font-family: var(--display); font-size: 1.3rem; color: var(--lavender); margin: 2rem 0;">Who are you? You forgot!</p>

      <!--GAME:scramble-->
    `
  },

  // ---------- CHAPTER 2: Time Travelling Salesman ----------
  {
    id: "salesman",
    title: "The Time Travelling Salesman",
    number: "ii",
    html: `
      <p class="dropcap no-indent">You descend onto a desert, and thump gently onto the ground. A few moments pass, and only a tumbleweed clutters the never-ending vastness of the landscape. You are starting to get a little bored when suddenly — what appears to be a portal — expands vertically. Once it's about human size a man jumps out of it holding a sewing machine under his arm.</p>

      <p style="font-style: italic; color: var(--ink-faded); text-indent: 0; padding-left: 1rem; border-left: 2px solid var(--rule);">A sewing machine is a device for linking pieces of fabric together. But you already knew that, right?</p>

      <p>He brushes off some dust of his beautiful, but a little flashy suit, then looks down at his watch, and before you can utter a word, jumps quickly into another portal appearing right in front of him.</p>

      <p>You feel mildly disappointed. However, not a second has passed when a portal behind you has opened up, you turn around and see the very same man, this time dropping his machine as he falls on his hands and knees. You notice an arrow pierced through his fleece, he appears unharmed though. He stands up vigorously dusting the suit off, visibly angry.</p>

      <p class="dialogue">"Hello" — you say.</p>
      <p>He turns his eyes up towards you briefly, then continues to groom himself.</p>
      <p class="dialogue">"Hello!" — you say a little louder.</p>
      <p class="dialogue">"I'm quite busy here..."</p>
      <p class="dialogue">"What are you doing?"</p>
      <p class="dialogue">"See these?" He points at one of the portals that constantly reappear in various places at random intervals. "These are portals to other worlds."</p>
      <p class="dialogue">"You mean fantasy worlds?"</p>
      <p class="dialogue">"No, no." He seems to have calmed down now that he's grabbed your attention. "These head to different time periods of this planet."</p>
      <p class="dialogue">"And what is this?" You pretend you didn't know.</p>
      <p class="dialogue">"Oh, it's a sewing machine. I've been trying to sell it."</p>
      <p>He turns his glance toward the arrow angrily, but not as much as last time, and removes it.</p>
      <p class="dialogue">"It hasn't been going very well, has it?" You pause. "You do this everyday?"</p>
      <p class="dialogue">"Yeah, that's what I do."</p>
      <p class="dialogue">"I must say, it's very impressive."</p>
      <p class="dialogue">"Oh yeah?"</p>
      <p class="dialogue">"What happened?"</p>
      <p class="dialogue">"I was trying to get a few trinkets for it from a brute who tried to apply it on leather. I tried to tell him to stop, but he was a little overenthusiastic to try it out."</p>
      <p class="dialogue">"Good thing you're OK."</p>
      <p>The salesman straightens out with a slight expression of worry on his face, but very quickly smiles.</p>
      <p class="dialogue">"I was in the wrong time period."</p>
      <p>A portal opens up, horizontally this time, and a blue car pops out. The salesman opens the trunk, throws the machine in it, and says: "I always wanted to start a fashion couture business." Shuts the trunk, jumps in. "Later kiddo!" he waves as he drives off.</p>
      <p>You look at the car and the large trail of dust behind it as it drives away toward the horizon.</p>
      <p>Before you can decide whether you're disappointed or inspired, a portal opens up above you.</p>
      <p>This one is a little different, you can see through it a beautiful blue sea, some tiny seagulls drifting in the sky. Their movement gave the sea a new dimension, a sliding parallax that made the height and depth more apparent. You jump up without hesitation, and as soon as you cross the portal your weight sheds.</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 3: The Alchemist ----------
  {
    id: "alchemist",
    title: "The Alchemist",
    number: "iii",
    html: `
      <p class="dropcap no-indent">You fly further over a blue sea. It's very sunny, and the birds-eye view is nice with a certain warmth about it, not to mention the sunny breeze.</p>

      <p>You can see a little port town sliding into the view. It's very <span class="vocab" data-vocab="picturesque">picturesque</span> with pastel colours of cute houses playfully complimenting the blue waters. You land and wander in the port filled with quaint little boats, vibrant chatter, and a stray cat or two.</p>

      <p>You approach a red cat and it makes the loveliest of purrs. You pet her affectionately and her fur feels nice and soft. She brushes against your leg, and runs away a little bit, turns her head back, obviously wanting for you to follow.</p>

      <p>As you do, she disappears around the corner of an alley. Once you arrive at the turn you realise you may have lost track of her for a little bit.</p>

      <p>She re-emerges from a cardboard box looking at you from a distance and meowing twice. As you approach, you notice two tiny kittens sleeping and huddling in a nest put together from an old hat and some rags.</p>

      <p>She starts breast-feeding them, and you watch for a while, as the little ones are making 'cookie dough' with their paws. The kittens now fully fed, fall back calmly into sleep.</p>

      <p>The mature cat, on the other hand, seems only to have started as your tour guide. You stroll into the dark end of the alley only to see an opening with a path leading toward a house nestled within the trees.</p>

      <p>The cat runs in through an open door. You're a little hesitant to go in at first, but the pleasant cool draft coming from the shady <span class="vocab" data-vocab="abode">abode</span> lures you in.</p>

      <p>You can see 'Red' — as you've now called her — mowing down on some food <span class="vocab" data-vocab="voraciously">voraciously</span> in the corner of the room. The room is filled with flasks, old tomes, and <span class="vocab" data-vocab="circuitous">circuitous</span> glass <span class="vocab" data-vocab="contraptions">contraptions</span> of some sorts. You pan the room, and in the opposite corner, almost barely visible, an old man is hidden behind a rack of vials and a stack of books.</p>

      <p>He mumbles something briefly, and rather angrily, giving you only the shortest side-glance of acknowledgement.</p>

      <p class="dialogue">"I'm conducting an experiment. See this little stone?" he points at a rough piece of grey rock. You nod. "I've been trying for years now to transform it into gold."</p>
      <p class="dialogue">"Why doesn't it work?"</p>
      <p class="dialogue">"That's a good question! I thought I had all the steps worked out down to the tee."</p>

      <p>You wander around curiously, exploring the room, occasionally shyly standing on your toes to better see what's on the shelves. As you see a flask of an unusual colour, the alchemist interrupts your exploration.</p>

      <p class="dialogue">"Not sure if that's the right colour."</p>

      <p>You peer over your shoulder, only to realise he's speaking to himself as he studies the rock.</p>

      <p>As you turn back you lose balance on the stool you've been standing on, and trying to grab the shelf for stability, you pull the beautiful flask and it breaks with its contents next to you on the floor.</p>

      <p class="dialogue">"Oh, you careless child! Look what you did!" He stands up and walks toward you. "Are you alright?"</p>
      <p class="dialogue">"Yes, I think so." You reply rubbing your knee and looking for cuts.</p>

      <p>He helps you stand up, and notices a red gem right beside the broken glass. He picks it up, takes out his <span class="vocab" data-vocab="monocle">monocle</span>, and observes the stone with an intense look.</p>

      <p class="dialogue">"Ah, it's a memoir of a trip my parents took me for when I was about your age. We went to the beach and were collecting sea glass."</p>

      <p>He pauses pensively.</p>

      <p class="dialogue">"This particular one, though, attracted me by the shape." Says, as if to himself.</p>

      <p>You look at the red stone and it has a distinct heart-shaped look.</p>

      <p class="dialogue">"The stone?"</p>
      <p class="dialogue">"No, no. There was a girl there. She had big blue eyes, jet-black hair, a spark of wit about her presence, and a cute little nose." He nods approvingly. "She was with her parents too." He continues. "Our families had lunch together later, and we built an <span class="vocab" data-vocab="anemometer">anemometer</span> from the debris found on the beach. It was a lot of fun!"</p>
      <p class="dialogue">"What's an anemometer?"</p>
      <p class="dialogue">"It's a device for measuring wind strength. I took this piece of sea glass we found, and formed it into this shape. A year later I met her again on that very same beach, and gave it to her. She was very surprised, but took it and smiled."</p>
      <p class="dialogue">"What happened to her?"</p>
      <p class="dialogue">"I never saw her again on that beach. We met one more time — at the university." He sighs. "Unfortunately for me, she was already married."</p>
      <p class="dialogue">"Sorry to hear that."</p>
      <p class="dialogue">"She visited me a few months ago, gave me the flask — it was cat medicine she'd been researching. She thanked me for inspiring her to do research. The gem must have been hidden inside the bottle, strange. I never noticed it when I helped this old wounded cat the other day."</p>

      <p>He pauses. "She must have kept it all those years..."</p>

      <p>A trace of a tear appears in the corner of his eye, and his face seems to have gained a child-like joy.</p>

      <p class="dialogue">"A-ha!" he exclaims. "It must be about the shape!"</p>

      <p>He pockets the eyeglass and the stone, goes back to his desk and starts shaping the stone he left there. After a few minutes he arrives at a round shape, and drops it into a funnel on one side of the machine. A series of clunks and hisses, and a golden orb comes out on the other end.</p>

      <p class="dialogue">"Here you go, my child," he says as he gives it to you.</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 4: Jeannie (contains forest walk + tinder) ----------
  {
    id: "jeannie",
    title: "Jeannie and a Bottle",
    number: "iv",
    html: `
      <p class="dropcap no-indent">You say goodbye and walk down the forest path enjoying the sun filtered by the gentle rustle of leaves.</p>

      <p>The path ends, and the animals swarm out and scatter. You're alone now, thirsty, but you get an eerie feeling like you're being observed. You don't think you can make it back through the path before the sun goes down so you decide to follow the animals to where you think they went to. They should at least know where water is, right?</p>

      <p>You can smell smoke, that reminds you of the time when you put marshmallow-filled biscuits in the oven and forgot — except more pleasant.</p>

      <p>You follow, and eventually can see a lake, and a bus parked near it. You approach.</p>

      <!--GAME:forest-->

      <p class="no-indent">As you advance you realise the bus has been long out of function. At least its original one. It's painted in green, orange, and purple. You think that someone very creative must have painted it. There are some bushes with berries on the sides of it, and trees with fruit growing on them.</p>

      <p>You decide to take a gander inside the bus, as the door is wide open. There is some old and fanciful furniture inside with comfy pillows of different shapes and colours. Some plants are potted inside, which is a nice touch, and it feels like the bus was claimed by nature in a way. Nobody's home.</p>

      <p>You turn toward the lake, and you see the same swarm of animals you think you saw before, racing toward a faint glow in the distance. You come closer and can now see someone with their back turned to you, sitting in a little chair next to a campfire by the lake shore. The animals seem to be flocking around, attracted not only by the warmth, but an air of generosity of the person feeding them out of her hand. This must be where the smoky smell of food is coming from.</p>

      <p>You approach and are greeted by a bright smile of a lady with pink hair. One of her eyes is red, and the other is blue.</p>

      <p class="dialogue">"I'm Jeannie. What's your name, little imp?"</p>
      <p class="dialogue">"I'm Pat."</p>
      <p class="dialogue">"Nice to meet you, Pat. Come, sit down."</p>

      <p>You sit down next to her and you have a snack and something to drink. Jeannie gives you a blanket to keep you warm, and you watch the sun set over the trees at the other end of the lake.</p>

      <p class="dialogue">"What do you do here, Jeannie?" She takes a sip out of a bottle.</p>
      <p class="dialogue">"I take care of the animals here, and they care for me. I give them food, and shelter. I pick up the trash people leave, and sometimes turn it into furniture."</p>

      <p>You can see that a little table beside is made of different kinds of materials.</p>

      <p>You notice an expression of sadness in Jeannie's face as she tends to the fire. You are impressed by the skill she handles the fire though.</p>

      <p class="dialogue">"How did you make this fire?"</p>
      <p class="dialogue">"I collected some dry grass, small sticks and firewood from the forest. I then used a mirror, to reflect the sunlight onto the dry grass."</p>
      <p class="dialogue">"Why are you sad?"</p>

      <p>She thinks for a minute without revealing any emotion, then a smile comes back.</p>

      <p class="dialogue">"There was this one guy... Let's call him Jack of Clubs. He could always make me laugh, and he used to come here often. He had these great ideas and plans, but never finished any of them. Never left me a note or anything. Then there was this other one that I hoped would hang out a little longer. He told me everything I needed to hear to feel loved and cared for. Maybe a little more than I should have believed in. We did great things together. Then one day I turned in my bed and there was a diamond on my pillow. No note either."</p>
      <p class="dialogue">"Jack of Diamonds?"</p>
      <p class="dialogue">"Bingo."</p>

      <p>You hear a little rustle in the darkness, you turn toward it, but can't see anything.</p>

      <p class="dialogue">"What's your story?"</p>
      <p class="dialogue">"I was flying in the sky, and then I landed on a desert with all those portals that led into different time periods. There was a man who had a great business idea... He just didn't know it at the time."</p>

      <p>Jeannie giggles.</p>

      <p class="dialogue">"Then I arrived at the port on this island here, a cat led me to a home at the edge of the forest. A wise old man lived there. I came in, fell down, broke a bottle, but I was okay. And it was okay. He gave me a present."</p>
      <p class="dialogue">"Is that so?"</p>

      <p>You nod, and take out the golden orb and put it on the table with a little thud. You could swear you could hear a rustle again, from the direction of nothing but pitch black.</p>

      <p class="dialogue">"Okay, I think it's bed time for me, Pat."</p>

      <p>You feel tired too, and can't remember where your bed was.</p>

      <p class="dialogue">"There's a very comfortable seat for you to sleep on in the bus." Says Jeannie.</p>

      <p>You wake up, and see Jeannie fast asleep. You feel restless though, and wish to continue your adventure.</p>

      <!--GAME:tinder-->

      <p class="no-indent">You take a piece of paper out of a stack, and a pen and go back to the campfire. Where there was fire yesterday you can now see embers. A brisk wind is coming from the lake. You wrap yourself in a blanket, sit down, and write:</p>

      <div style="font-style: italic; text-align: center; margin: 2rem 0; color: var(--ink-soft); line-height: 1.8;">
        <p style="text-indent: 0;">Dear Jeannie,</p>
        <p style="text-indent: 0;">Thank you — the seat was comfortable. We forgot to put out the fire, but at least you don't need sparks for the cattail fluff. I hope the animals return once you bring the fire back to life.</p>
        <p style="text-indent: 0;">Your friend,<br>Pat</p>
      </div>

      <p>You put the letter under the orb, so that the wind doesn't blow it away, and leave through a path you never noticed yesterday.</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 5: Jack of Spades ----------
  {
    id: "spades",
    title: "Jack of Spades",
    number: "v",
    html: `
      <p class="dropcap no-indent">It's a beautiful morning, and the forest feels comforting again. The birds are singing, there's a parrot squawk, and the butterflies seem to have decided to accompany you for a while. A silhouette of something resembling a palace or a castle emerges through the clearing in the distance.</p>

      <p>The serenity is suddenly broken by the good old rustling behind you.</p>

      <p style="font-style: italic;">'That's it!' You think, angrily.</p>

      <p class="dialogue">"Show yourself!" You scream as you turn around toward the rascal with your teeth and fists clenched.</p>

      <p>The rustling stops, and you were about to walk away, but it resumes, and you can see a dark hooded figure stepping out of the brush. He seems mildly embarrassed.</p>

      <p class="dialogue">"What do you want?!"</p>

      <p>The rogue approaches gingerly, scaling you up as his feet find his way down the narrow path. He stops at a safe distance, you can now see his young and slightly concerned face. Then takes something out of his pocket and tosses it toward you on the path looking at you expectantly.</p>

      <p>It's the orb you left at Jeannie's!</p>

      <p class="dialogue">"You forgot something," he says — to your surprise.</p>

      <p>You pick the orb up, and look back at the young man, curious. He smirks, and as he turns away his cape flutters. You're puzzled. He glances through the shoulder and shouts:</p>

      <p class="dialogue">"By the way, Jeannie says thanks."</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 6: Chef de Palais ----------
  {
    id: "chef",
    title: "Chef de Palais",
    number: "vi",
    html: `
      <p class="dropcap no-indent">You venture forth deeper into the forest, enjoying the weather, the views and the air cooled off by the shade cast by the trees above you.</p>

      <p>Finally, you arrive at a bridge that leads to the palace courtyard. There's a line of soldiers along the walkway to the palace entrance.</p>

      <p>Their serious expressions make you hesitate for a moment, and you can hear a growl in your stomach. You're hungry. As you look around you notice a house with a "Cuisine" sign on top of the door. You're not sure what it means but you're hoping it has something to do with the smell of food coming from that direction.</p>

      <p>You come in, to a large room, a chef is immersed in a task, jumping around a pot, mumbling something. Disapproval. Pinch of salt. Taste. Approval. He has a tall white hat pleated at the top.</p>

      <p>He turns around to you as you approach. He's a rotund man with a thin and long pointy moustache. He extends his arm with his eyes closed and a cheerful smile. You shake his hand.</p>

      <p class="dialogue">"Ah, you must be ze new chef the partie."</p>

      <p>You're not sure, and you don't feel like having a party right now, but you accept the invitation.</p>

      <p class="dialogue">"Yes." He browses a wardrobe for a moment, and says: "Yes, zis one will be exquisite."</p>

      <p>He hands you over a hat, not a party hat — it's similar to his, except smaller. You wear the hat.</p>

      <p class="dialogue">"Today we'll be making <span class="vocab" data-vocab="crepe">crêpes</span>! Have you made crêpes before?"</p>
      <p class="dialogue">"No."</p>
      <p class="dialogue">"Not to worry, I'll teach you."</p>

      <p>He puts a recipe in front of you. As you read the ingredient list, he gathers the required items in front of you.</p>

      <p class="dialogue">"Get a large bowl ready." He puts a bowl in front of you and one in front of him. "Crack sree eggz into ze bowl. Add two ceups and two tablespoons of flour into ze bowl, pour in a ceup of meelk and a ceup of water, add four tablespoons of oil and a pinch of salt." You're asked to measure the correct amounts. Luckily, you are given a tablespoon, a cup, and your fingers can do the pinching.</p>

      <p class="dialogue">"Meex for a few minutes until ze meexteure iz smooz." He gives you a wooden spoon.</p>

      <p class="dialogue">"Melt between a fifs or a quarter of butter on very low eet, at ze sem time eet eup a non-steek pan to medium eet." You can see the pans already on the stove. He helps you set the heat correctly.</p>

      <p class="dialogue">"Lift ze 'ot pan and brush a leetehl melted butter onto it."</p>

      <p class="dialogue">"Drip between ahf or two-serds of a ladle onto ze pan making cheur ze leequid distreeboots evenlee."</p>

      <p class="dialogue">"Don't put too little or too much. Just ze right amount. So when cooked on ze under side, it doesn't splash ze uncooked dough as you flip it over."</p>

      <p>He pours the dough onto the pan tilting it to make sure the surface is covered.</p>

      <p class="dialogue">"Put ze pan back and wait for under a meenute until ze crêpe iz soleed and steam comes out from ze bottom of it."</p>

      <p>After about a minute, he lifts the pan, and shakes it horizontally, and you can see the pancake slide back and forth.</p>

      <p class="dialogue">"Pick eup ze pan and flip ze crêpe in ze air to ze ozer side. Like zis." He tosses the pancake into the air, and lands it perfectly as if was a piece of cake. Got it?</p>

      <p>You did, and... Your turn!</p>

      <p>The pancake flips, with little force applied. <em>Pat.</em> It lands half-folded on the pan.</p>

      <p class="dialogue">"Don't worry. Next time try to cook it a few seconds longer."</p>

      <p>You throw zis... ekhm, this one away, not at all discouraged. Quite the opposite! You close your eyes, and swing the pan full blast. <em>Splat!</em> You hear. You look up to see the crêpe stuck to the ceiling. Not for long, as it falls right onto the cook's face.</p>

      <p class="dialogue">"Tout ce qui monte doit redescendre..." He mumbles in French. "What goes up must come down."</p>

      <p>You tilt your head forward with an intense squint of concentration, and try again. <em>Zing!</em> It lands perfectly. You curtsy with your pan still in your hand.</p>

      <p class="dialogue">"Bravo!" he claps with a smug expression. "Lay ze pan back on ze stove and cook for about ahf ze time you cooked on ze ozer side until you can see some steam again, flip ze pan over a plate to remove ze ready crêpe."</p>

      <p>You finish the rest of the crêpes with more ease.</p>

      <p class="dialogue">"Go through zis door to discuss your compensation." He points at a door in the other side of the kitchen.</p>

      <p>You go through, and follow a path that leads to the palace through an olive grove.</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 7: Queen of Hearts + Maze ----------
  {
    id: "queen",
    title: "Queen of Hearts",
    number: "vii",
    html: `
      <p class="dropcap no-indent">You march in through the large door that opened itself in front of you. On the throne sits a beautiful lady. She seems to be enjoying the conversation with the courtiers, but immediately turns her face towards you as soon as you enter, and all the lively chatter stops at once.</p>

      <p class="dialogue">"You there!" She says softly, and treats you with the most kind of smiles you've ever seen. As if she were still a child deep down in her heart. "It's very brave of you to have come here all by yourself."</p>
      <p class="dialogue">"It wasn't all that scary." It kind of was, but you are feeling encouraged.</p>
      <p class="dialogue">"I've been waiting for you for a long time."</p>
      <p class="dialogue">"How so?"</p>
      <p class="dialogue">"Let's just say you've made an impact without even knowing it."</p>
      <p class="dialogue">"This is a really pretty palace."</p>

      <p>The crowd seem to approve with cheerful giggles here and there. They offer you some of the most delicious food you've ever eaten.</p>

      <p class="dialogue">"A little bird told me you'll be coming."</p>

      <p>A little bird lands on her shoulder indeed. That must be him.</p>

      <p class="dialogue">"I have a gift for you."</p>

      <p>The courtiers pass a box from one to another from the back of the hall, all the way to the dame. She opens the box, and there's a pair of keys linked together in it. She gestures at you to come closer, and you do with hesitation.</p>

      <p class="dialogue">"You can come here whenever you want. All you have to do is close your eyes and think of this palace here."</p>
      <p class="dialogue">"Thank you." You take the keys.</p>

      <p>You strut out of the palace proudly, and as you gather your thoughts before another take off, you decide to stroll into the garden. You sit down for a bit, enjoying the weather, and finding comfort in the ambience of the lush surroundings. You are trying to make sense out of all of what happened today.</p>

      <p>Some time passes. A crow lands down on the side of the bench and asks.</p>

      <p class="dialogue">"What's the matter, child?" He has a distinct rolling 'r' as if trying to contain a tongue longer than his disproportionally large beak.</p>
      <p class="dialogue">"I just received keys to the palace, and I don't know why." You look at the floor tiles in front of you.</p>
      <p class="dialogue">"Perhaps a little <em>reminder</em>, I shall bestow upon you, shan't I?"</p>
      <p class="dialogue">"What?" You turn quickly toward the crow, but he doesn't seem to have any intention of answering.</p>

      <p>Instead, he starts turning his head in circles in your general direction, as if casting a spell on you. <em>Poof</em>, you turn into a frog.</p>

      <p>Right at this second, a cook appears between you and the path back to the palace.</p>

      <p class="dialogue">"Ah, mon petite grenouille, zere you are!" exclaims the cook, and starts pacing toward you with a cleaver raised.</p>
      <p class="dialogue">"You may want to start <em>rrrunning</em>." Suggests the crow, and while you couldn't agree more, you realise your legs are not particularly well suited for the task. That being said, you decide you'd still like to keep them.</p>

      <p>You start hopping as fast as you can, but he who was once an affable teacher, and whom you now perceive as a savage monster, is unfailingly closing the gap behind you. You leap into a hedge maze, as you try to cling onto your dear life.</p>

      <!--GAME:maze-->

      <p class="no-indent">You see Red jumping out of the bushes, meowing at you with worry but happy that she can see you. She's on the other side of the river. You think of anything that could help you defeat your predator, and you wished the game gave you more items to interact with than just a set of keys and a golden orb. In an act of desperation you throw the golden orb in front of the chef, the monster has finally caught on, and you know you're it. There's only that little orb between you and him. As there's no protection any more. You hope, remembering what the final words spoken to you at the castle were, and close your eyes. You're scared out of your mind as you wait for the inevitable.</p>

      <p>You suddenly hear the beast roar, but not in anger — it's fear! You hear a loud thud, and a thunderous impact propagates through the ground, followed by a loud meow, and a splash of water.</p>

      <p>Somehow you feel safe to open your eyes...</p>

      <div class="chapter-end">· · ·</div>
    `
  },

  // ---------- CHAPTER 8: Wake up ----------
  {
    id: "wake",
    title: "Wake Up!",
    number: "viii",
    html: `
      <p class="dropcap no-indent">You open your eyes slowly, and you realise you're in bed. You were asleep! You can smell a familiar fragrance. It's unmistakeably blueberry muffins. Your head hurts.</p>

      <p>You lift your gaze, blurry, still half-trapped between sleep and waking, and you can see your mum and dad. Your mum has a coloured shawl on her neck, with a sequence of small circles of various colours, all jumbled up and embedded in it.</p>

      <p>This place looks familiar. It's your bedroom!</p>

      <p>Your parents are very happy to see you, as if they haven't seen you for ages. You try to speak and it's so exerting that you raise in the bed only slightly but fall back to the comfort of your bed with a tired moan.</p>

      <p class="dialogue">"That's okay sweetie. It takes time to recover." Says your mum soothingly.</p>
      <p class="dialogue">"My job is done here. She needs plenty of rest, and she'll be good as new in a matter of days!" Said a man in a suit with a large leather bag, and a stethoscope.</p>

      <p>As he's packing his things, you notice a boy with red hair juggling a small golden football farther into the room.</p>

      <p class="dialogue">"This is Red." Your mum points at him. "He found you and your bike next to the road."</p>

      <p>He seems unmoved by the entire kerfuffle, enthusiastically juggling a small golden football. He stops as your gazes meet, puts the ball under his arm, and brings a plate of muffins over to you.</p>

      <p class="dialogue">"Here, my mum made these." He smiles.</p>

      <div class="chapter-ornament" style="margin-top: 4rem;">~ fin ~</div>

      <p class="centered" style="text-indent: 0; font-family: var(--display); font-style: italic; color: var(--ink-faded); margin-top: 2rem;">
        Thank you for reading.
      </p>
    `
  }

];
