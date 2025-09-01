// SPA behavior + overview interactions (accordion, search, expand/collapse)
document.addEventListener('DOMContentLoaded', () => {
  // SPA show/hide sections
  const links = document.querySelectorAll('.topnav a[data-target]');
  const sections = document.querySelectorAll('.unit-section');
  const nav = document.querySelector('.topnav');
  const header = document.querySelector('header');
  const brand = document.querySelector('.brand');

  function showSection(id, pushHash = true) {
    sections.forEach(sec => {
      sec.style.display = (sec.id === id) ? 'block' : 'none';
    });

    // Show nav/header only for overview
    if (id === 'overview') {
      nav.style.display = 'block';
      header.style.display = 'block';
    } else {
      nav.style.display = 'none';
      header.style.display = 'none';
      // ensure top of unit visible
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // update link active state
    links.forEach(a => a.classList.toggle('active', a.getAttribute('data-target') === id));

    // update URL hash
    if (pushHash) {
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      else location.hash = id;
    }
  }

  // attach nav handlers
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      showSection(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (brand) brand.addEventListener('click', (e) => { e.preventDefault(); showSection('overview'); window.scrollTo({ top:0, behavior:'smooth' }); });

  // back buttons inside units
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // On load: respect hash
  const hash = (location.hash || '').replace('#', '');
  const valid = Array.from(sections).map(s => s.id);
  if (hash && valid.includes(hash)) showSection(hash, false);
  else showSection('overview', false);

  /* ---------------------------
     Overview interactions
     --------------------------- */
  // native details/summary already gives keyboard + aria support.
  // provide expand/collapse all
  const expandAll = document.getElementById('expand-all');
  const collapseAll = document.getElementById('collapse-all');
  const detailEls = Array.from(document.querySelectorAll('.accordion-wrap details.acc'));

  expandAll.addEventListener('click', () => {
    detailEls.forEach(d => d.open = true);
    // small page jump to show animation
    detailEls[0] && detailEls[0].querySelector('.acc-body').scrollIntoView({ behavior: 'smooth' });
  });

  collapseAll.addEventListener('click', () => {
    detailEls.forEach(d => d.open = false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // search/filter: show only details or table rows matching query
  const searchInput = document.getElementById('overview-search');
  const tableRows = Array.from(document.querySelectorAll('.overview-table tbody tr')).filter(r => !r.classList.contains('total-row'));
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    // filter accordion entries by their summary + body text
    detailEls.forEach(d => {
      const text = (d.querySelector('summary').innerText + ' ' + d.querySelector('.acc-body').innerText).toLowerCase();
      d.style.display = text.includes(q) ? '' : 'none';
    });

    // filter table rows (topic cell)
    tableRows.forEach(tr => {
      const topic = tr.cells[1].innerText.toLowerCase();
      tr.style.display = topic.includes(q) ? '' : 'none';
    });
  });

  /* ---------------------------
     Reveal animations for elements entering viewport
     --------------------------- */
  const observers = document.querySelectorAll('.animate-fadeup');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    observers.forEach(el => io.observe(el));
  } else {
    observers.forEach(el => el.classList.add('in-view'));
  }
});
/* -------- Unit 2 interactive JS (append) -------- */
(function() {
  // tab switching
  const unit2 = document.querySelector('.interactive-unit');
  if (!unit2) return;

  const tabs = unit2.querySelectorAll('.tab');
  const panels = unit2.querySelectorAll('.tab-panel');

  tabs.forEach(t => t.addEventListener('click', () => {
    const key = t.getAttribute('data-tab');
    tabs.forEach(x => x.classList.toggle('active', x === t));
    panels.forEach(p => {
      const show = p.id === key;
      p.classList.toggle('active', show);
      p.style.display = show ? 'block' : 'none';
      p.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
    // scroll top of unit
    unit2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // ensure initial visibility for panels
  panels.forEach(p => {
    if (!p.classList.contains('active')) p.style.display = 'none';
  });

  // copy button behavior
  unit2.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-target');
      const codeEl = document.getElementById(id);
      if (!codeEl) return;
      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied ✓';
        setTimeout(() => btn.textContent = 'Copy', 1400);
      }).catch(() => {
        btn.textContent = 'Copy failed';
        setTimeout(() => btn.textContent = 'Copy', 1400);
      });
    });
  });

  // simulate filter table
  const simRun = unit2.querySelector('#sim-run');
  const simReset = unit2.querySelector('#sim-reset');
  const simTable = unit2.querySelector('#sim-table tbody');
  const simCol = unit2.querySelector('#sim-col');
  const simVal = unit2.querySelector('#sim-val');

  simRun && simRun.addEventListener('click', () => {
    const col = (simCol.value || '').trim().toLowerCase();
    const val = (simVal.value || '').trim().toLowerCase();
    if (!col || !val) {
      alert('Type a column (name or course) and a value to filter.');
      return;
    }
    const rows = Array.from(simTable.querySelectorAll('tr'));
    rows.forEach(r => {
      const cells = r.querySelectorAll('td');
      const mapping = { name: 0, course: 1 };
      const idx = mapping[col];
      if (idx === undefined) {
        alert('Allowed columns: name, course');
        return;
      }
      const cellText = cells[idx].innerText.toLowerCase();
      r.style.display = cellText.includes(val) ? '' : 'none';
    });
  });

  simReset && simReset.addEventListener('click', () => {
    simCol.value = '';
    simVal.value = '';
    Array.from(simTable.querySelectorAll('tr')).forEach(r => r.style.display = '');
  });

  // diagram highlights
  const svg = unit2.querySelector('#unit2-diagram');
  const central = svg.querySelector('#central');
  const distributed = svg.querySelector('#distributed');
  unit2.querySelector('#toggle-dist').addEventListener('click', () => {
    distributed.classList.toggle('highlight');
    central.classList.remove('highlight');
  });
  unit2.querySelector('#toggle-central').addEventListener('click', () => {
    central.classList.toggle('highlight');
    distributed.classList.remove('highlight');
  });

  // quiz handling
  const quizForm = unit2.querySelector('#unit2-quiz');
  const quizResult = unit2.querySelector('#quiz-result');
  const quizReset = unit2.querySelector('#quiz-reset');

  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const answers = {
        q1: '3NF',
        q2: 'a',
        q3: 'typedef'
      };
      let score = 0;
      const total = Object.keys(answers).length;
      for (const q in answers) {
        const val = (quizForm.querySelector(`[name="${q}"]:checked`) || {}).value;
        if (val === answers[q]) score++;
      }
      quizResult.textContent = `You scored ${score} / ${total}. ${score === total ? 'Perfect!' : score === 0 ? 'Keep practicing.' : 'Nice try.'}`;
    });

    quizReset && quizReset.addEventListener('click', () => {
      quizForm.reset();
      quizResult.textContent = '';
    });
  }

  // small improvement: animated details (native) already present; optionally add keyboard focus styles
})();
// QUIZ Logic
document.getElementById("submitQuiz").addEventListener("click", () => {
  let score = 0;
  document.querySelectorAll(".quiz-card").forEach(card => {
    let correct = card.dataset.answer;
    let chosen = card.querySelector("li.selected");
    if (chosen) {
      if (chosen.dataset.option === correct) {
        chosen.classList.add("correct");
        score++;
      } else {
        chosen.classList.add("wrong");
      }
    }
  });
  document.getElementById("quizResult").innerText = `✅ You scored ${score} / ${document.querySelectorAll(".quiz-card").length}`;
});

// select answer
document.querySelectorAll(".quiz-card li").forEach(opt => {
  opt.addEventListener("click", () => {
    opt.parentElement.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
    opt.classList.add("selected");
  });
});

// ESSAY toggle
document.querySelectorAll(".essay-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("active");
  });
});
