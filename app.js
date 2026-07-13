const state = {
  apps: [],
  category: "全部应用",
  query: "",
  sort: "newest",
};

const elements = {
  appDialog: document.querySelector("#appDialog"),
  appGrid: document.querySelector("#appGrid"),
  categoryList: document.querySelector("#categoryList"),
  clearHistory: document.querySelector("#clearHistory"),
  clearSearch: document.querySelector("#clearSearch"),
  dialogClose: document.querySelector("#dialogClose"),
  dialogContent: document.querySelector("#dialogContent"),
  downloadsView: document.querySelector("#downloadsView"),
  emptyState: document.querySelector("#emptyState"),
  featuredBand: document.querySelector("#featuredBand"),
  historyCount: document.querySelector("#historyCount"),
  historyTable: document.querySelector("#historyTable"),
  resultCount: document.querySelector("#resultCount"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  storeView: document.querySelector("#storeView"),
  themeToggle: document.querySelector("#themeToggle"),
  toast: document.querySelector("#toast"),
};

const categoryIcons = {
  "全部应用": "layout-grid",
  "图像处理": "images",
  "办公效率": "briefcase-business",
  "系统工具": "wrench",
  "教育学习": "graduation-cap",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("uos-store-downloads") || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem("uos-store-downloads", JSON.stringify(history.slice(0, 30)));
  renderHistory();
}

function recordDownload(app) {
  const history = getHistory().filter((item) => item.id !== app.id);
  history.unshift({
    id: app.id,
    name: app.name,
    version: app.version,
    packageName: app.packageName,
    icon: app.icon,
    downloadUrl: app.downloadUrl,
    downloadedAt: new Date().toISOString(),
  });
  saveHistory(history);
  showToast(`${app.name} ${app.version} 开始下载`);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function filteredApps() {
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  const filtered = state.apps.filter((app) => {
    const categoryMatch = state.category === "全部应用" || app.category === state.category;
    const searchable = [app.name, app.category, app.summary, app.developer]
      .join(" ")
      .toLocaleLowerCase("zh-CN");
    return categoryMatch && (!query || searchable.includes(query));
  });

  return filtered.sort((left, right) => {
    if (state.sort === "name") {
      return left.name.localeCompare(right.name, "zh-CN");
    }
    if (state.sort === "size") {
      return right.sizeBytes - left.sizeBytes;
    }
    return new Date(right.releaseDate) - new Date(left.releaseDate);
  });
}

function renderCategories() {
  const categories = ["全部应用", ...new Set(state.apps.map((app) => app.category))];
  elements.categoryList.innerHTML = categories.map((category) => {
    const count = category === "全部应用"
      ? state.apps.length
      : state.apps.filter((app) => app.category === category).length;
    const active = state.category === category ? " is-active" : "";
    return `
      <button class="category-button${active}" type="button" data-category="${escapeHtml(category)}">
        <span>${icon(categoryIcons[category] || "package")} ${escapeHtml(category)}</span>
        <b>${count}</b>
      </button>
    `;
  }).join("");

  elements.categoryList.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderCategories();
      renderApps();
    });
  });
  refreshIcons();
}

function renderFeatured() {
  const app = state.apps.find((item) => item.featured) || state.apps[0];
  if (!app) {
    elements.featuredBand.hidden = true;
    return;
  }

  elements.featuredBand.innerHTML = `
    <div class="featured-copy">
      <p class="featured-label">${icon("sparkles")} 本期推荐</p>
      <h2>${escapeHtml(app.name)}</h2>
      <p>${escapeHtml(app.description)}</p>
      <div class="featured-meta">
        <span>版本 ${escapeHtml(app.version)}</span>
        <span>${escapeHtml(app.architecture)}</span>
        <span>${escapeHtml(app.size)}</span>
      </div>
      <div class="featured-actions">
        <a class="primary-button" href="${escapeHtml(app.downloadUrl)}" data-download-id="${escapeHtml(app.id)}">
          ${icon("download")} 下载 ${escapeHtml(app.packageType)}
        </a>
        <button class="ghost-button" type="button" data-detail-id="${escapeHtml(app.id)}">
          ${icon("panel-right-open")} 查看详情
        </button>
      </div>
    </div>
    <div class="featured-media">
      <img src="${escapeHtml(app.screenshots[0])}" alt="${escapeHtml(app.name)} 应用界面">
    </div>
  `;
  bindAppActions(elements.featuredBand);
}

function appCard(app) {
  return `
    <article class="app-card">
      <div class="app-card-head">
        <div class="app-icon"><img src="${escapeHtml(app.icon)}" alt=""></div>
        <div class="app-title">
          <h3>${escapeHtml(app.name)}</h3>
          <p>${escapeHtml(app.category)} · ${escapeHtml(app.developer)}</p>
        </div>
        <span class="verified-badge" title="已适配 UOS">${icon("badge-check")}</span>
      </div>
      <p class="app-summary">${escapeHtml(app.summary)}</p>
      <div class="app-card-footer">
        <span class="app-card-meta">v${escapeHtml(app.version)} · ${escapeHtml(app.size)}</span>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-detail-id="${escapeHtml(app.id)}">详情</button>
          <a class="download-button" href="${escapeHtml(app.downloadUrl)}" data-download-id="${escapeHtml(app.id)}" title="下载 ${escapeHtml(app.name)}">
            ${icon("download")}
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderApps() {
  const apps = filteredApps();
  elements.resultCount.textContent = `${apps.length} 个应用`;
  elements.appGrid.innerHTML = apps.map(appCard).join("");
  elements.emptyState.hidden = apps.length > 0;
  bindAppActions(elements.appGrid);
}

function appDialogContent(app) {
  const features = app.features.map((feature) => `
    <li>${icon("circle-check")}<span>${escapeHtml(feature)}</span></li>
  `).join("");
  const guideLink = app.guideUrl ? `
    <a class="secondary-button" href="${escapeHtml(app.guideUrl)}">
      ${icon("file-text")} 安装说明
    </a>
  ` : "";

  return `
    <section class="dialog-hero">
      <div class="dialog-copy">
        <div class="dialog-app-head">
          <div class="app-icon"><img src="${escapeHtml(app.icon)}" alt=""></div>
          <div>
            <h2>${escapeHtml(app.name)}</h2>
            <p>${escapeHtml(app.developer)} · ${escapeHtml(app.category)}</p>
          </div>
        </div>
        <p class="dialog-summary">${escapeHtml(app.description)}</p>
        <div class="dialog-actions">
          <a class="primary-button" href="${escapeHtml(app.downloadUrl)}" data-download-id="${escapeHtml(app.id)}">
            ${icon("download")} 下载 ${escapeHtml(app.packageType)}
          </a>
          ${guideLink}
        </div>
      </div>
      <div class="dialog-media">
        <img src="${escapeHtml(app.screenshots[0])}" alt="${escapeHtml(app.name)} 应用界面">
      </div>
    </section>
    <section class="dialog-details">
      <div>
        <h3>应用信息</h3>
        <dl class="info-list">
          <div class="info-row"><dt>当前版本</dt><dd>${escapeHtml(app.version)}</dd></div>
          <div class="info-row"><dt>更新时间</dt><dd>${formatDate(app.releaseDate)}</dd></div>
          <div class="info-row"><dt>安装包</dt><dd>${escapeHtml(app.packageName)}</dd></div>
          <div class="info-row"><dt>架构</dt><dd>${escapeHtml(app.architecture)}</dd></div>
          <div class="info-row"><dt>文件大小</dt><dd>${escapeHtml(app.size)}</dd></div>
          <div class="info-row"><dt>适用系统</dt><dd>${escapeHtml(app.compatibility)}</dd></div>
        </dl>
      </div>
      <div>
        <h3>版本亮点</h3>
        <ul class="feature-list">${features}</ul>
        <code class="checksum">SHA256: ${escapeHtml(app.sha256)}</code>
      </div>
    </section>
  `;
}

function openAppDialog(appId) {
  const app = state.apps.find((item) => item.id === appId);
  if (!app) return;
  elements.dialogContent.innerHTML = appDialogContent(app);
  bindAppActions(elements.dialogContent);
  elements.appDialog.showModal();
  refreshIcons();
}

function bindAppActions(container) {
  container.querySelectorAll("[data-detail-id]").forEach((button) => {
    button.addEventListener("click", () => openAppDialog(button.dataset.detailId));
  });
  container.querySelectorAll("[data-download-id]").forEach((link) => {
    link.addEventListener("click", () => {
      const app = state.apps.find((item) => item.id === link.dataset.downloadId);
      if (app) recordDownload(app);
    });
  });
  refreshIcons();
}

function renderHistory() {
  const history = getHistory();
  elements.historyCount.textContent = history.length;
  elements.clearHistory.disabled = history.length === 0;

  if (!history.length) {
    elements.historyTable.innerHTML = `
      <div class="history-empty">
        <div>${icon("package-open")}<p>还没有下载记录</p></div>
      </div>
    `;
    refreshIcons();
    return;
  }

  elements.historyTable.innerHTML = history.map((item) => `
    <div class="history-row">
      <div class="history-app">
        <div class="app-icon"><img src="${escapeHtml(item.icon)}" alt=""></div>
        <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.packageName)}</small></div>
      </div>
      <span class="history-cell">v${escapeHtml(item.version)}</span>
      <span class="history-cell">${formatDate(item.downloadedAt)}</span>
      <a class="secondary-button" href="${escapeHtml(item.downloadUrl)}">${icon("download")} 再次下载</a>
    </div>
  `).join("");
  refreshIcons();
}

function setView(view) {
  const isStore = view === "store";
  elements.storeView.hidden = !isStore;
  elements.downloadsView.hidden = isStore;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  if (!isStore) renderHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderApps();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderApps();
  });

  elements.clearSearch.addEventListener("click", () => {
    state.query = "";
    state.category = "全部应用";
    elements.searchInput.value = "";
    renderCategories();
    renderApps();
  });

  elements.dialogClose.addEventListener("click", () => elements.appDialog.close());
  elements.appDialog.addEventListener("click", (event) => {
    if (event.target === elements.appDialog) elements.appDialog.close();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  elements.clearHistory.addEventListener("click", () => {
    localStorage.removeItem("uos-store-downloads");
    renderHistory();
    showToast("下载记录已清空");
  });

  elements.themeToggle.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("is-dark");
    localStorage.setItem("uos-store-theme", enabled ? "dark" : "light");
    elements.themeToggle.innerHTML = icon(enabled ? "sun" : "moon");
    refreshIcons();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setView("store");
      elements.searchInput.focus();
    }
  });
}

async function loadApps() {
  try {
    const response = await fetch("apps.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.apps = data.apps || [];
    renderCategories();
    renderFeatured();
    renderApps();
    renderHistory();
  } catch (error) {
    elements.featuredBand.hidden = true;
    elements.appGrid.innerHTML = `
      <div class="empty-state">
        ${icon("cloud-off")}
        <h3>应用目录加载失败</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
    refreshIcons();
  }
}

function boot() {
  if (localStorage.getItem("uos-store-theme") === "dark") {
    document.body.classList.add("is-dark");
    elements.themeToggle.innerHTML = icon("sun");
  }
  setupEvents();
  refreshIcons();
  loadApps();
}

boot();
