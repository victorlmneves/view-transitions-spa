const routes = {
  "/": { path: "/pages/home.html", theme: "fade" },
  "/photo": { path: "/pages/photo.html", theme: "slide" },
  "/about": { path: "/pages/about.html", theme: "zoom" },
};

const app = document.querySelector("#app");
const progressBar = document.querySelector("#progress-bar");
const prefetchCache = new Map();

let lastPath = location.pathname;

/* 🧠 Helper: Show Progress Bar */
function showProgress() {
  progressBar.classList.remove("complete");
  progressBar.classList.add("active");
}

/* 🧠 Helper: Complete Progress Bar */
function completeProgress() {
  progressBar.classList.remove("active");
  progressBar.classList.add("complete");
  setTimeout(() => {
    progressBar.style.width = "0%";
    progressBar.classList.remove("complete");
  }, 500);
}

/* 🧠 Load Page Content (with prefetch support) */
async function loadPage(path) {
  const route = routes[path] || routes["/"];
  let html;

  if (prefetchCache.has(path)) {
    html = prefetchCache.get(path);
  } else {
    const res = await fetch(route.path);
    html = await res.text();
    prefetchCache.set(path, html);
  }

  app.innerHTML = html;
  document.documentElement.className = `transition-${route.theme}`;
}

/* 🧠 SPA Navigation (with View Transitions) */
async function navigate(path) {
  if (!routes[path]) return;

  showProgress();

  if (!document.startViewTransition) {
    await loadPage(path);
    history.pushState({}, "", path);
    completeProgress();
    return;
  }

  document.documentElement.className = `transition-${routes[path].theme}`;

  const transition = document.startViewTransition(async () => {
    await loadPage(path);
    history.pushState({}, "", path);
  });

  await transition.finished;
  completeProgress();
}

/* 🧠 Link Click Handling */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-link]");
  if (link) {
    e.preventDefault();
    const newPath = link.getAttribute("href");
    lastPath = newPath;
    navigate(newPath);
  }
});

/* 🧠 Browser Back/Forward */
window.addEventListener("popstate", () => navigate(location.pathname));

/* 🧠 Prefetch on Hover */
document.addEventListener("mouseover", (e) => {
  const link = e.target.closest("a[data-link]");
  if (!link) return;
  const path = link.getAttribute("href");
  if (routes[path] && !prefetchCache.has(path)) {
    fetch(routes[path].path)
      .then((res) => res.text())
      .then((html) => prefetchCache.set(path, html));
  }
});

/* 🧠 Initial Page Load */
loadPage(location.pathname);
