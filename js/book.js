// Main book controller

const BOOK = {
  currentIndex: 0,
  chapters: [],
  gameCompletion: {}, // track which games have been completed
  mazeWon: false,
  tinderWon: false,
  crepeWon: false,

  loadProgress() {
    try {
      this.mazeWon = localStorage.getItem('patbook.mazeWon') === '1';
      this.tinderWon = localStorage.getItem('patbook.tinderWon') === '1';
      this.crepeWon = localStorage.getItem('patbook.crepeWon') === '1';
    } catch (e) {
      // ignore — private mode, disabled storage, etc.
    }
  },

  saveProgress() {
    try {
      if (this.mazeWon) localStorage.setItem('patbook.mazeWon', '1');
      if (this.tinderWon) localStorage.setItem('patbook.tinderWon', '1');
      if (this.crepeWon) localStorage.setItem('patbook.crepeWon', '1');
    } catch (e) {
      // ignore
    }
  },

  init() {
    this.loadProgress();
    this.chapters = CHAPTERS;
    this.renderAll();
    this.bindEvents();
    this.applyRestoredProgress();
    this.goTo(0);
  },

  // If puzzles were already completed in a previous session, reveal their
  // unlocked content and wire their continue buttons so the reader doesn't
  // have to redo them on reload.
  applyRestoredProgress() {
    if (this.tinderWon) {
      const region = document.getElementById('jeannie-after-tinder');
      if (region) {
        region.setAttribute('aria-hidden', 'false');
        region.classList.add('revealed', 'instant');
      }
      const contBtn = document.getElementById('jeannie-continue-btn');
      if (contBtn && !contBtn.dataset.wired) {
        contBtn.dataset.wired = '1';
        contBtn.addEventListener('click', () => this.next());
      }
    }
    if (this.mazeWon) {
      const region = document.getElementById('queen-after-maze');
      if (region) {
        region.setAttribute('aria-hidden', 'false');
        region.classList.add('revealed', 'instant');
      }
      const contBtn = document.getElementById('queen-continue-btn');
      if (contBtn && !contBtn.dataset.wired) {
        contBtn.dataset.wired = '1';
        contBtn.addEventListener('click', () => this.next());
      }
    }
    if (this.crepeWon) {
      const region = document.getElementById('chef-after-crepe');
      if (region) {
        region.setAttribute('aria-hidden', 'false');
        region.classList.add('revealed', 'instant');
      }
    }
  },

  renderAll() {
    const book = document.getElementById('book');
    book.innerHTML = '';
    this.chapters.forEach((ch, idx) => {
      const el = document.createElement('article');
      el.className = 'chapter';
      el.id = `ch-${ch.id}`;
      el.dataset.index = idx;

      let html = '';
      if (!ch.isCover) {
        if (ch.title) {
          html += `<h1 class="chapter-title">${ch.title}</h1>`;
        }
        if (ch.number) {
          html += `<p class="chapter-number">chapter ${ch.number}</p>`;
        }
      }
      html += ch.html;
      el.innerHTML = html;

      // Replace game placeholders with actual game containers
      el.innerHTML = el.innerHTML
        .replace('<!--GAME:scramble-->', this.gameSlot('scramble', 'Who are you? Unscramble the letters to remember...'))
        .replace('<!--GAME:tinder-->', this.gameSlot('tinder', 'Gather tinder to wake the fire.'))
        .replace('<!--GAME:forest-->', this.gameSlot('forest', 'Find your way through the forest to the bus.'))
        .replace('<!--GAME:maze-->', this.gameSlot('maze', 'Hop through the hedge maze. Do not let the chef catch you.'))
        .replace('<!--GAME:crepe-->', this.gameSlot('crepe', 'Catch the crêpes in your pan. Arrow keys to move.'))
        .replace('<!--GAME:flight-->', this.flightSlot());

      book.appendChild(el);
    });

    // Now wire up game mounts after they're in the DOM
    this.mountGames();
    // Wire vocab clicks
    this.wireVocab();
    // Cover start button
    const coverBtn = document.getElementById('cover-start');
    if (coverBtn) {
      coverBtn.addEventListener('click', () => this.goTo(1));
    }
  },

  gameSlot(type, instruction) {
    const labels = {
      scramble: "Scramble puzzle",
      tinder: "Tinder collection game",
      forest: "Forest walk game",
      maze: "Hedge maze chase game",
      crepe: "Crêpe catching game",
    };
    return `
      <div class="game-container" id="game-${type}" role="region" aria-label="${labels[type] || type}">
        <p class="game-instruction">${instruction}</p>
        <div class="game-mount" data-game="${type}"></div>
      </div>
    `;
  },

  flightSlot() {
    // The flight scene is cinematic, not a puzzle, so it has no instruction
    // and no game-container chrome. Just a bare mount point.
    return `<div class="game-mount" data-game="flight" role="img" aria-label="Pat flying over a blue sea with seagulls and drifting clouds"></div>`;
  },

  mountGames() {
    document.querySelectorAll('.game-mount').forEach(el => {
      const type = el.dataset.game;
      if (type === 'scramble' && window.ScrambleGame) {
        ScrambleGame.mount(el);
      } else if (type === 'tinder' && window.TinderGame) {
        TinderGame.mount(el);
      } else if (type === 'forest' && window.ForestGame) {
        ForestGame.mount(el);
      } else if (type === 'maze' && window.MazeGame) {
        MazeGame.mount(el);
      } else if (type === 'flight' && window.FlightGame) {
        FlightGame.mount(el);
      } else if (type === 'crepe' && window.CrepeGame) {
        CrepeGame.mount(el);
      } else {
        el.innerHTML = `<div class="game-placeholder">[ ${type} game — coming in a later build ]</div>`;
      }
    });
  },

  wireVocab() {
    document.querySelectorAll('.vocab').forEach(el => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', (e) => this.openVocab(el.dataset.vocab, el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openVocab(el.dataset.vocab, el);
        }
      });
    });
  },

  openVocab(key, triggerEl) {
    const entry = VOCAB[key];
    if (!entry) return;

    document.querySelectorAll('.vocab.active').forEach(e => e.classList.remove('active'));
    if (triggerEl) triggerEl.classList.add('active');

    const panel = document.getElementById('panel');
    const content = document.getElementById('panel-content');

    let html = `
      <div class="panel-entry">
        <h2 class="panel-word">${entry.word}</h2>
        ${entry.pron ? `<p class="panel-pron">/ ${entry.pron} /</p>` : ''}
        <div class="panel-def">${entry.def}</div>
    `;
    if (entry.source) {
      html += `<p class="panel-source"><a href="${entry.source}" target="_blank" rel="noopener">look it up on Wiktionary →</a></p>`;
    }
    if (entry.nested) {
      html += `
        <div class="panel-nested">
          <span class="panel-nested-trigger" data-nested-key="${key}">${entry.nested.trigger}</span>
        </div>
      `;
    }
    html += `</div>`;
    content.innerHTML = html;

    // Wire nested trigger
    const nestedTrigger = content.querySelector('.panel-nested-trigger');
    if (nestedTrigger) {
      nestedTrigger.addEventListener('click', (e) => {
        if (nestedTrigger.classList.contains('disabled')) return;
        e.stopPropagation();
        this.openNested(key);
      });
    }

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  },

  openNested(key) {
    const entry = VOCAB[key];
    if (!entry || !entry.nested) return;
    const content = document.getElementById('panel-content');
    // If already shown, don't append again
    if (content.querySelector('.panel-nested-entry')) return;
    const paragraphs = entry.nested.body.split('\n\n').map(p => `<p>${p}</p>`).join('');
    const additional = document.createElement('div');
    additional.className = 'panel-entry panel-nested-entry';
    additional.innerHTML = `
      <h2 class="panel-word">${entry.nested.title}</h2>
      <div class="panel-def">${paragraphs}</div>
    `;
    content.appendChild(additional);
    // Disable further clicks on the trigger (visually and functionally)
    const triggers = content.querySelectorAll('.panel-nested-trigger');
    triggers.forEach(t => {
      t.classList.add('disabled');
      t.setAttribute('aria-disabled', 'true');
    });
    // Scroll the panel to reveal the new entry
    setTimeout(() => {
      additional.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  },

  closePanel() {
    const panel = document.getElementById('panel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.vocab.active').forEach(e => e.classList.remove('active'));
  },

  goTo(index) {
    if (index < 0 || index >= this.chapters.length) return;
    // Gating: block forward from queen chapter until maze win
    const current = this.chapters[this.currentIndex];
    if (current && current.id === 'queen' && !this.mazeWon && index > this.currentIndex) {
      this.flashGateMessage('escape the chef first');
      return;
    }
    // Gating: block forward from jeannie until tinder win
    if (current && current.id === 'jeannie' && !this.tinderWon && index > this.currentIndex) {
      this.flashGateMessage('finish the firewood first');
      return;
    }
    // Gating: block forward from chef until crêpes are plated
    if (current && current.id === 'chef' && !this.crepeWon && index > this.currentIndex) {
      this.flashGateMessage('finish plating the crêpes first');
      return;
    }
    this.currentIndex = index;
    document.querySelectorAll('.chapter').forEach(el => el.classList.remove('active'));
    const target = document.querySelector(`[data-index="${index}"]`);
    if (target) target.classList.add('active');
    this.updateNav();
    this.closePanel();
    // Scroll to top instantly AFTER the chapter has been swapped in.
    // A smooth scroll from a very long chapter's bottom can look like it's
    // landing on the end of the new chapter, so we jump instead.
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    // Notify games about chapter change so they can reset or init
    window.dispatchEvent(new CustomEvent('chapterChange', { detail: { index, chapter: this.chapters[index] } }));
  },

  flashGateMessage(msg) {
    const ind = document.getElementById('chapter-indicator');
    if (!ind) return;
    ind.textContent = msg;
    ind.style.color = 'var(--accent)';
    setTimeout(() => {
      ind.style.color = '';
      this.updateNav();
    }, 1400);
  },

  next() { this.goTo(this.currentIndex + 1); },
  prev() { this.goTo(this.currentIndex - 1); },

  updateNav() {
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    const ind = document.getElementById('chapter-indicator');
    prev.disabled = this.currentIndex === 0;
    next.disabled = this.currentIndex >= this.chapters.length - 1;
    const ch = this.chapters[this.currentIndex];
    // Queen chapter: disable next until maze is won
    if (ch && ch.id === 'queen' && !this.mazeWon) next.disabled = true;
    // Jeannie chapter: disable next until tinder is done
    if (ch && ch.id === 'jeannie' && !this.tinderWon) next.disabled = true;
    // Chef chapter: disable next until crêpes are plated
    if (ch && ch.id === 'chef' && !this.crepeWon) next.disabled = true;
    if (ch.isCover) {
      ind.textContent = '— cover —';
    } else {
      ind.textContent = ch.title ? `${ch.number || ''} · ${ch.title}` : ch.number || '';
    }
  },

  bindEvents() {
    document.getElementById('prev-btn').addEventListener('click', () => this.prev());
    document.getElementById('next-btn').addEventListener('click', () => this.next());
    document.querySelector('.panel-close').addEventListener('click', () => this.closePanel());

    // Listen for the maze-win event to unlock forward navigation
    window.addEventListener('mazeWon', () => {
      this.mazeWon = true;
      this.saveProgress();
      this.updateNav();
      // Wire up the "open your eyes →" button once revealed
      const contBtn = document.getElementById('queen-continue-btn');
      if (contBtn && !contBtn.dataset.wired) {
        contBtn.dataset.wired = '1';
        contBtn.addEventListener('click', () => this.next());
      }
    });

    // Tinder game win - unlock the Jeannie chapter's end
    window.addEventListener('tinderWon', () => {
      this.tinderWon = true;
      this.saveProgress();
      this.updateNav();
      const contBtn = document.getElementById('jeannie-continue-btn');
      if (contBtn && !contBtn.dataset.wired) {
        contBtn.dataset.wired = '1';
        contBtn.addEventListener('click', () => this.next());
      }
    });

    // Crêpe game win - unlock the chef chapter's post-game text
    window.addEventListener('crepeWon', () => {
      this.crepeWon = true;
      this.saveProgress();
      this.updateNav();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closePanel();
      // Arrow keys for navigation, unless a game is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (document.activeElement && document.activeElement.closest('.game-mount')) return;
      // Block arrow keys for chapter nav ONLY while the chapter's puzzle
      // is still unsolved. Once the puzzle is done (either this session or
      // a previous one), arrows should work normally so the reader can
      // flip through pages without being trapped.
      const currentCh = this.chapters[this.currentIndex];
      if (currentCh && currentCh.id === 'queen' && !this.mazeWon) return;
      if (currentCh && currentCh.id === 'jeannie' && !this.tinderWon) return;
      if (currentCh && currentCh.id === 'chef' && !this.crepeWon) return;
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });

    // Click outside panel to close (but not on vocab)
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('panel');
      if (!panel.classList.contains('open')) return;
      if (panel.contains(e.target)) return;
      if (e.target.classList.contains('vocab')) return;
      this.closePanel();
    });
  }
};

window.addEventListener('DOMContentLoaded', () => BOOK.init());
