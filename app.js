const STORAGE_KEY = "book-club-hq";

const sampleData = {
  books: [
    {
      id: crypto.randomUUID(),
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      genre: "Literary fiction",
      status: "current",
    },
    {
      id: crypto.randomUUID(),
      title: "Kindred",
      author: "Octavia E. Butler",
      genre: "Speculative fiction",
      status: "up-next",
      amazonUrl: "https://www.amazon.com/s?k=Kindred+Octavia+Butler",
    },
  ],
  members: [
    {
      id: crypto.randomUUID(),
      name: "Avery",
      email: "avery@example.com",
      progress: 80,
    },
    {
      id: crypto.randomUUID(),
      name: "Micah",
      email: "micah@example.com",
      progress: 55,
    },
    {
      id: crypto.randomUUID(),
      name: "Nora",
      email: "nora@example.com",
      progress: 95,
    },
  ],
  meetings: [
    {
      id: crypto.randomUUID(),
      date: "2026-04-02",
      time: "19:00",
      host: "Rosa",
      location: "123 Atlantic Ave, Brooklyn, NY",
      confirmed: true,
    },
  ],
  notes: [
    {
      id: crypto.randomUUID(),
      text: "Did the nonlinear timeline deepen the emotional payoff or make it feel more distant?",
    },
    {
      id: crypto.randomUUID(),
      text: "Bring two adaptation dream-casts for next meeting.",
    },
  ],
};

const appState = loadState();

const els = {
  bookForm: document.querySelector("#book-form"),
  memberForm: document.querySelector("#member-form"),
  meetingForm: document.querySelector("#meeting-form"),
  noteForm: document.querySelector("#note-form"),
  bookList: document.querySelector("#book-list"),
  memberList: document.querySelector("#member-list"),
  meetingList: document.querySelector("#meeting-list"),
  noteList: document.querySelector("#note-list"),
  spotlightTitle: document.querySelector("#spotlight-title"),
  spotlightMeta: document.querySelector("#spotlight-meta"),
  statMembers: document.querySelector("#stat-members"),
  statBooks: document.querySelector("#stat-books"),
  statProgress: document.querySelector("#stat-progress"),
  currentBookTitle: document.querySelector("#current-book-title"),
  currentBookMeta: document.querySelector("#current-book-meta"),
  attendanceSummary: document.querySelector("#attendance-summary"),
  attendanceMeta: document.querySelector("#attendance-meta"),
  upNextTitle: document.querySelector("#up-next-title"),
  upNextList: document.querySelector("#up-next-list"),
  resetDemo: document.querySelector("#reset-demo"),
  bookTemplate: document.querySelector("#book-template"),
  memberTemplate: document.querySelector("#member-template"),
  meetingTemplate: document.querySelector("#meeting-template"),
  noteTemplate: document.querySelector("#note-template"),
};

document.addEventListener("click", handleGlobalClick);
els.bookForm.addEventListener("submit", handleBookSubmit);
els.memberForm.addEventListener("submit", handleMemberSubmit);
els.meetingForm.addEventListener("submit", handleMeetingSubmit);
els.noteForm.addEventListener("submit", handleNoteSubmit);
els.resetDemo.addEventListener("click", restoreSampleData);

render();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    persist(sampleData);
    return structuredClone(sampleData);
  }

  try {
    return JSON.parse(saved);
  } catch {
    persist(sampleData);
    return structuredClone(sampleData);
  }
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  persist(appState);
  renderBooks();
  renderMembers();
  renderMeetings();
  renderNotes();
  renderSummary();
}

function renderBooks() {
  const sortedBooks = [...appState.books].sort(sortByStatusThenTitle);
  renderCollection({
    items: sortedBooks,
    container: els.bookList,
    template: els.bookTemplate,
    emptyMessage: "Add the next title on your club's radar.",
    decorate(item, clone) {
      clone.querySelector(".list-card").dataset.id = item.id;
      clone.querySelector(".list-card__eyebrow").textContent = item.status.replace("-", " ");
      const titleEl = clone.querySelector("h3");
      appendBookTitle(titleEl, item);

      clone.querySelector(".list-card__meta").textContent =
        `${item.author} • ${item.genre || "Genre TBD"}`;
    },
  });
}

function renderMembers() {
  const sortedMembers = [...appState.members].sort((a, b) => a.name.localeCompare(b.name));
  renderCollection({
    items: sortedMembers,
    container: els.memberList,
    template: els.memberTemplate,
    emptyMessage: "Build your roster and keep track of everyone's pace.",
    decorate(item, clone) {
      clone.querySelector(".list-card").dataset.id = item.id;
      clone.querySelector(".list-card__eyebrow").textContent = `${item.progress}% complete`;
      clone.querySelector("h3").textContent = item.name;
      clone.querySelector(".list-card__meta").textContent = item.email || "No email saved";
    },
  });
}

function renderMeetings() {
  const sortedMeetings = [...appState.meetings].sort((a, b) => a.date.localeCompare(b.date));
  renderCollection({
    items: sortedMeetings,
    container: els.meetingList,
    template: els.meetingTemplate,
    emptyMessage: "Schedule a discussion night to anchor the month.",
    decorate(item, clone) {
      clone.querySelector(".list-card").dataset.id = item.id;
      clone.querySelector(".list-card__eyebrow").textContent = item.confirmed
        ? "RSVPs open"
        : "Draft";
      clone.querySelector("h3").textContent = `${formatDate(item.date)} at ${formatTime(item.time)}`;
      const metaEl = clone.querySelector(".list-card__meta");
      metaEl.innerHTML = "";
      metaEl.append(document.createTextNode(`Host: ${item.host || "TBD"} • `));

      const locationLink = document.createElement("a");
      locationLink.className = "map-link";
      locationLink.href = createAppleMapsUrl(item.location);
      locationLink.target = "_blank";
      locationLink.rel = "noreferrer noopener";
      locationLink.textContent = item.location;
      metaEl.append(locationLink);
    },
  });
}

function renderNotes() {
  renderCollection({
    items: appState.notes,
    container: els.noteList,
    template: els.noteTemplate,
    emptyMessage: "Capture a question, quote, or hosting reminder.",
    decorate(item, clone) {
      clone.querySelector(".note-card").dataset.id = item.id;
      clone.querySelector("p").textContent = item.text;
    },
  });
}

function renderCollection({ items, container, template, emptyMessage, decorate }) {
  container.innerHTML = "";

  if (!items.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = emptyMessage;
    container.append(emptyState);
    return;
  }

  items.forEach((item) => {
    const clone = template.content.cloneNode(true);
    decorate(item, clone);
    container.append(clone);
  });
}

function renderSummary() {
  const currentBook = appState.books.find((book) => book.status === "current");
  const upNextBooks = appState.books.filter((book) => book.status === "up-next");
  const nextMeeting = [...appState.meetings].sort((a, b) => a.date.localeCompare(b.date))[0];
  const memberCount = appState.members.length;
  const bookCount = appState.books.length;
  const averageProgress = memberCount
    ? Math.round(appState.members.reduce((sum, member) => sum + member.progress, 0) / memberCount)
    : 0;
  const confirmedCount = appState.meetings.filter((meeting) => meeting.confirmed).length;

  els.statMembers.textContent = String(memberCount);
  els.statBooks.textContent = String(bookCount);
  els.statProgress.textContent = `${averageProgress}%`;

  if (nextMeeting) {
    els.spotlightTitle.textContent = `${formatDate(nextMeeting.date)} at ${formatTime(nextMeeting.time)}`;
    els.spotlightMeta.innerHTML = "";
    els.spotlightMeta.append(document.createTextNode(`Host: ${nextMeeting.host || "TBD"} • `));

    const locationLink = document.createElement("a");
    locationLink.className = "map-link";
    locationLink.href = createAppleMapsUrl(nextMeeting.location);
    locationLink.target = "_blank";
    locationLink.rel = "noreferrer noopener";
    locationLink.textContent = nextMeeting.location;
    els.spotlightMeta.append(locationLink);
  } else {
    els.spotlightTitle.textContent = "No meeting scheduled yet";
    els.spotlightMeta.textContent = "Add a meeting to get your club calendar moving.";
  }

  if (currentBook) {
    els.currentBookTitle.innerHTML = "";
    appendBookTitle(els.currentBookTitle, currentBook);
    els.currentBookMeta.textContent = `${currentBook.author} • ${currentBook.genre || "Genre TBD"}`;
  } else {
    els.currentBookTitle.textContent = "Choose a book to get started";
    els.currentBookMeta.textContent = "No active read selected.";
  }

  els.attendanceSummary.textContent = `${confirmedCount} confirmed`;
  els.attendanceMeta.textContent =
    confirmedCount > 0
      ? "Meetings with RSVPs enabled are ready to roll."
      : "Flip RSVP on for a meeting to track attendance.";

  if (upNextBooks.length) {
    const featuredUpNext = upNextBooks[0];
    els.upNextTitle.innerHTML = "";

    if (featuredUpNext.amazonUrl) {
      const link = document.createElement("a");
      link.className = "book-link";
      link.href = featuredUpNext.amazonUrl;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = featuredUpNext.title;
      els.upNextTitle.append(link);
    } else {
      els.upNextTitle.textContent = featuredUpNext.title;
    }

    els.upNextList.innerHTML = "";

    upNextBooks.slice(1, 3).forEach((book) => {
      const item = document.createElement("p");

      if (book.amazonUrl) {
        const link = document.createElement("a");
        link.className = "book-link";
        link.href = book.amazonUrl;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.textContent = book.title;
        item.append(link);
      } else {
        item.textContent = book.title;
      }

      els.upNextList.append(item);
    });

    if (upNextBooks.length === 1) {
      els.upNextList.textContent = featuredUpNext.author;
    }
  } else {
    els.upNextTitle.textContent = "Nothing queued yet";
    els.upNextList.textContent = "Add a few books with status set to Up next.";
  }
}

function handleBookSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const status = formData.get("status");

  if (status === "current") {
    appState.books.forEach((book) => {
      if (book.status === "current") {
        book.status = "finished";
      }
    });
  }

  appState.books.unshift({
    id: crypto.randomUUID(),
    title: String(formData.get("title")).trim(),
    author: String(formData.get("author")).trim(),
    genre: String(formData.get("genre")).trim(),
    status: String(status),
    amazonUrl: normalizeUrl(String(formData.get("amazonUrl")).trim()),
  });

  event.currentTarget.reset();
  render();
}

function handleMemberSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  appState.members.unshift({
    id: crypto.randomUUID(),
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    progress: clampProgress(Number(formData.get("progress"))),
  });

  event.currentTarget.reset();
  event.currentTarget.querySelector("#member-progress").value = "0";
  render();
}

function handleMeetingSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  appState.meetings.unshift({
    id: crypto.randomUUID(),
    date: String(formData.get("date")),
    time: String(formData.get("time")),
    host: String(formData.get("host")).trim(),
    location: String(formData.get("location")).trim(),
    confirmed: false,
  });

  event.currentTarget.reset();
  render();
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  appState.notes.unshift({
    id: crypto.randomUUID(),
    text: String(formData.get("text")).trim(),
  });

  event.currentTarget.reset();
  render();
}

function handleGlobalClick(event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const scrollTarget = button.dataset.scrollTarget;

  if (scrollTarget) {
    document.querySelector(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const itemId = button.closest("[data-id]")?.dataset.id;

  if (!itemId) {
    return;
  }

  if (button.dataset.action === "delete-book") {
    appState.books = appState.books.filter((book) => book.id !== itemId);
  }

  if (button.dataset.action === "delete-member") {
    appState.members = appState.members.filter((member) => member.id !== itemId);
  }

  if (button.dataset.action === "bump-progress") {
    appState.members = appState.members.map((member) =>
      member.id === itemId
        ? { ...member, progress: clampProgress(member.progress + 10) }
        : member,
    );
  }

  if (button.dataset.action === "toggle-rsvp") {
    appState.meetings = appState.meetings.map((meeting) =>
      meeting.id === itemId ? { ...meeting, confirmed: !meeting.confirmed } : meeting,
    );
  }

  if (button.dataset.action === "delete-meeting") {
    appState.meetings = appState.meetings.filter((meeting) => meeting.id !== itemId);
  }

  if (button.dataset.action === "delete-note") {
    appState.notes = appState.notes.filter((note) => note.id !== itemId);
  }

  render();
}

function restoreSampleData() {
  appState.books = structuredClone(sampleData.books);
  appState.members = structuredClone(sampleData.members);
  appState.meetings = structuredClone(sampleData.meetings);
  appState.notes = structuredClone(sampleData.notes);
  render();
}

function sortByStatusThenTitle(a, b) {
  const order = {
    current: 0,
    "up-next": 1,
    finished: 2,
  };

  return order[a.status] - order[b.status] || a.title.localeCompare(b.title);
}

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function normalizeUrl(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function appendBookTitle(container, book) {
  if (book.amazonUrl) {
    const link = document.createElement("a");
    link.className = "book-link";
    link.href = book.amazonUrl;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = book.title;
    container.append(link);
    return;
  }

  container.textContent = book.title;
}

function createAppleMapsUrl(location) {
  return `https://maps.apple.com/?q=${encodeURIComponent(location)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value) {
  if (!value) {
    return "Time TBD";
  }

  const [hours, minutes] = value.split(":");

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`2000-01-01T${hours}:${minutes}:00`));
}
