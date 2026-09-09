const API_URL = '/api';

const state = {
  token: localStorage.getItem('verde_admin_token') || null,
  view: 'dashboard',
};

const $ = (sel) => document.querySelector(sel);

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(String(value).replace(/-/g, '/'));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '-';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro na requisição');
  }

  return res.json();
}

/* ---------- Login ---------- */
function showLogin() {
  state.token = null;
  localStorage.removeItem('verde_admin_token');
  $('#view-app').classList.add('hidden');
  $('#view-login').classList.remove('hidden');
}

function showApp() {
  $('#view-login').classList.add('hidden');
  $('#view-app').classList.remove('hidden');
  navigate('dashboard');
}

async function handleLogin(e) {
  e.preventDefault();
  const errorEl = $('#login-error');
  const btn = $('#login-btn');
  errorEl.classList.add('hidden');

  const email = $('#login-email').value.trim();
  const senha = $('#login-senha').value;

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    if (data.tipo !== 'admin') {
      errorEl.textContent = 'Acesso restrito: apenas administradores podem entrar.';
      errorEl.classList.remove('hidden');
      return;
    }

    state.token = data.token;
    localStorage.setItem('verde_admin_token', data.token);
    showApp();
  } catch (err) {
    errorEl.textContent = err.message || 'Não foi possível entrar.';
    errorEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

function logout() {
  showLogin();
}

/* ---------- Navegação ---------- */
function navigate(view) {
  state.view = view;

  document.querySelectorAll('.nav-link').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  document.querySelectorAll('.page').forEach((el) => {
    el.classList.toggle('active', el.id === `view-${view}`);
  });

  const titles = {
    dashboard: 'Dashboard',
    usuarios: 'Usuários',
    areas: 'Áreas',
    ongs: 'ONGs',
    denuncias: 'Denúncias',
  };
  $('#page-title').textContent = titles[view];

  if (view === 'dashboard') loadDashboard();
  if (view === 'usuarios') loadUsuarios();
  if (view === 'areas') loadAreas();
  if (view === 'ongs') loadOngs();
  if (view === 'denuncias') loadDenuncias();
}

/* ---------- Dashboard ---------- */
async function loadDashboard() {
  try {
    const { stats } = await api('/admin/dashboard');
    $('#stat-usuarios').textContent = stats.totalUsuarios;
    $('#stat-admins').textContent = stats.totalAdmins;
    $('#stat-comuns').textContent = stats.totalComuns;
    $('#stat-areas').textContent = stats.totalAreas;
    $('#stat-ongs').textContent = stats.totalONGs;
    $('#stat-projetos').textContent = stats.totalProjetos;
    $('#stat-denuncias').textContent = stats.totalDenuncias;
    $('#stat-denuncias-abertas').textContent = stats.denunciasAbertas;
  } catch (err) {
    console.error(err);
  }
}

/* ---------- Usuários ---------- */
function badgePerfil(admin, comum) {
  if (admin) return '<span class="badge badge-admin">Admin</span>';
  if (comum) return '<span class="badge badge-comum">Comum</span>';
  return '<span class="badge badge-outros">-</span>';
}

async function loadUsuarios() {
  const tbody = $('#usuarios-tbody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Carregando...</td></tr>';

  try {
    const { usuarios } = await api('/admin/usuarios');
    if (!usuarios.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Nenhum usuário encontrado.</td></tr>';
      return;
    }
    tbody.innerHTML = usuarios
      .map((u) => `
        <tr>
          <td>${u.idUsuario}</td>
          <td><div class="user-cell"><span class="avatar">${escapeHtml(initials(u.nome))}</span>${escapeHtml(u.nome)}</div></td>
          <td>${escapeHtml(u.email)}</td>
          <td>${badgePerfil(u.admin, u.comum)}</td>
        </tr>
      `)
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- Áreas ---------- */
function badgeStatus(status) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '-');
  if (key.includes('identific') || key.includes('em-tratamento')) {
    const cls = key.includes('tratamento') ? 'badge-tratamento' : 'badge-identificada';
    return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
  }
  return `<span class="badge badge-outros">${escapeHtml(status)}</span>`;
}

async function loadAreas() {
  const tbody = $('#areas-tbody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Carregando...</td></tr>';

  try {
    const { areas } = await api('/admin/areas');
    if (!areas.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma área encontrada.</td></tr>';
      return;
    }
    tbody.innerHTML = areas
      .map((a) => `
        <tr>
          <td>${a.idArea}</td>
          <td>${escapeHtml(a.cidade)}</td>
          <td>${escapeHtml(a.bairro)}</td>
          <td>${escapeHtml(a.rua)}</td>
          <td>${badgeStatus(a.statusArea)}</td>
        </tr>
      `)
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- ONGs ---------- */
async function loadOngs() {
  const tbody = $('#ongs-tbody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Carregando...</td></tr>';

  try {
    const { ongs } = await api('/admin/ongs');
    if (!ongs.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhuma ONG encontrada.</td></tr>';
      return;
    }
    tbody.innerHTML = ongs
      .map((o) => `
        <tr>
          <td>${o.idOngs}</td>
          <td>${escapeHtml(o.regiao)}</td>
          <td>${escapeHtml(o.cnpj)}</td>
          <td>${escapeHtml(o.telefone)}</td>
          <td>${escapeHtml(o.descricao)}</td>
          <td>${o.usuario ? escapeHtml(o.usuario.nome) : '-'}</td>
        </tr>
      `)
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- Denúncias ---------- */
function badgeDenuncia(status) {
  const key = (status || '').toLowerCase();
  const cls = key === 'aberta' ? 'badge-aberta' : key.includes('tratamento') ? 'badge-tratamento' : 'badge-outros';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

async function loadDenuncias() {
  const tbody = $('#denuncias-tbody');
  tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Carregando...</td></tr>';

  try {
    const { denuncias } = await api('/admin/denuncias');
    if (!denuncias.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhuma denúncia encontrada.</td></tr>';
      return;
    }
    const areaLabel = (a) =>
      a ? `${escapeHtml(a.cidade)}, ${escapeHtml(a.bairro)}` : '-';
    tbody.innerHTML = denuncias
      .map((d) => `
        <tr>
          <td>${d.idDenuncias}</td>
          <td>${escapeHtml(d.titulo)}</td>
          <td>${badgeDenuncia(d.statusDenuncia)}</td>
          <td>${d.area ? areaLabel(d.area) : '-'}</td>
          <td>${d.usuario ? escapeHtml(d.usuario.nome) : '-'}</td>
          <td>${formatDate(d.dataDenuncia)}</td>
          <td>${escapeHtml(d.descricao)}</td>
        </tr>
      `)
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#login-form').addEventListener('submit', handleLogin);
  $('#logout-btn').addEventListener('click', logout);
  document.querySelectorAll('.nav-link').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.view));
  });

  if (state.token) {
    showApp();
  } else {
    showLogin();
  }
});