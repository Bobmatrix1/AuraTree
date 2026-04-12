// API Base URL
const getApiUrl = () => {
  const origin = window.location.origin;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  return origin + '/api/v1';
};

const API_URL = getApiUrl();

// Production scroll management
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Toast System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast animate-in slide-in-from-right duration-300`;
  
  const colors = {
    success: { bg: 'rgba(45, 212, 168, 0.15)', border: 'rgba(45, 212, 168, 0.3)', icon: 'fa-check-circle', iconColor: '#2DD4A8' },
    error: { bg: 'rgba(255, 97, 97, 0.15)', border: 'rgba(255, 97, 97, 0.3)', icon: 'fa-exclamation-circle', iconColor: '#FF6161' },
    info: { bg: 'rgba(123, 97, 255, 0.15)', border: 'rgba(123, 97, 255, 0.3)', icon: 'fa-info-circle', iconColor: '#7B61FF' }
  };

  const config = colors[type] || colors.success;

  toast.style.cssText = `
    min-width: 280px;
    padding: 16px 20px;
    background: ${config.bg};
    border: 1px solid ${config.border};
    border-radius: 16px;
    backdrop-filter: blur(20px);
    color: var(--aura-text);
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    pointer-events: auto;
    font-size: 14px;
    font-weight: 500;
  `;

  toast.innerHTML = `
    <i class="fas ${config.icon}" style="color: ${config.iconColor}; font-size: 18px;"></i>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showConfirm(message, title = 'Confirm Action', icon = 'fa-question-circle', color = 'var(--aura-violet)') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmModalMessage').textContent = message;
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalIcon').innerHTML = `<i class="fas ${icon}"></i>`;
    document.getElementById('confirmModalIcon').style.color = color;
    
    modal.classList.add('active');
    
    const cleanup = (result) => {
      modal.classList.remove('active');
      document.getElementById('confirmModalProceed').onclick = null;
      document.getElementById('confirmModalCancel').onclick = null;
      document.getElementById('closeConfirmModal').onclick = null;
      resolve(result);
    };
    
    document.getElementById('confirmModalProceed').onclick = () => cleanup(true);
    document.getElementById('confirmModalCancel').onclick = () => cleanup(false);
    document.getElementById('closeConfirmModal').onclick = () => cleanup(false);
  });
}

function forceScrollTop() {
  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0), 10);
}

// Initial scroll reset
forceScrollTop();

// Global State
let stats = null;
let currentPage = 'dashboard';

// Pagination State
const paginationState = {
  users: { page: 1, totalPages: 1 },
  auratrees: { page: 1, totalPages: 1 },
  links: { page: 1, totalPages: 1 },
  testimonials: { page: 1, totalPages: 1 },
  subscribers: { page: 1, totalPages: 1 },
  payments: { page: 1, totalPages: 1 },
  subs: { page: 1, totalPages: 1 },
  logs: { page: 1, totalPages: 1 }
};

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('adminTheme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    updateThemeUI('light');
  }
}

function updateThemeUI(theme) {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector('i');
  const text = themeToggleBtn.querySelector('span');
  if (theme === 'light') {
    icon.className = 'fas fa-sun';
    text.textContent = 'Light Mode';
  } else {
    icon.className = 'fas fa-moon';
    text.textContent = 'Dark Mode';
  }
}

themeToggleBtn?.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('adminTheme', isLight ? 'light' : 'dark');
  updateThemeUI(isLight ? 'light' : 'dark');
});

initTheme();

// Mobile Sidebar Logic
function toggleSidebar() {
  const sidebarEl = document.getElementById('sidebar');
  const overlayEl = document.getElementById('sidebarOverlay');
  if (sidebarEl) sidebarEl.classList.toggle('active');
  if (overlayEl) overlayEl.classList.toggle('active');
  document.body.style.overflow = sidebarEl?.classList.contains('active') ? 'hidden' : '';
}

if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

// Navigation Logic
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const page = item.dataset.page;
    
    // If the link has a real URL (not just #), let the browser handle it
    if (item.getAttribute('href') && item.getAttribute('href') !== '#') {
      return;
    }

    e.preventDefault();
    if (!page) return;
    
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) targetPage.classList.remove('hidden');
    
    forceScrollTop();
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) toggleSidebar();
    loadPageData(page);
  });
});

async function loadPageData(page) {
  switch(page) {
    case 'dashboard': await loadDashboardData(); break;
    case 'users': await fetchUsers(1); break;
    case 'auratrees': await fetchAuraTrees(1); break;
    case 'links': await fetchUsersForLinks(1); break;
    case 'testimonials': await fetchTestimonials(1); break;
    case 'subscribers': await fetchSubscribers(1); break;
    case 'affiliates': await fetchAffiliates(); break;
    case 'withdrawals': await fetchWithdrawals(); break;
    case 'payments': await fetchPayments(1); break;
    case 'subscriptions': await fetchSubscriptions(1); break;
    case 'analytics': await fetchAnalytics(); break;
    case 'logs': await fetchLogs(1); break;
    case 'settings': await fetchSettings(); break;
  }
}

// --- PAGE: AFFILIATES ---
async function fetchAffiliates() {
  try {
    const affiliates = await apiFetch('/admin/affiliates');
    updateAffiliatesTable(affiliates);
  } catch (e) { showToast(e.message, 'error'); }
}

function updateAffiliatesTable(affiliates) {
  const tbody = document.getElementById('affiliatesTable');
  if (!tbody) return;
  
  if (!affiliates || affiliates.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No affiliates found</td></tr>';
    return;
  }

  tbody.innerHTML = affiliates.map(aff => `
    <tr>
      <td>
        <div class="user-info">
          <div style="font-weight: 600;">${aff.fullName}</div>
          <div style="font-size: 11px;">${aff.email}</div>
        </div>
      </td>
      <td><code>${aff.referralCode}</code></td>
      <td>₦${(aff.totalEarnings || 0).toLocaleString()}</td>
      <td style="color: var(--aura-mint); font-weight: 600;">₦${(aff.withdrawableBalance || 0).toLocaleString()}</td>
      <td>${aff.stats?.signups || 0}</td>
      <td>
        <button class="action-btn view-referrals-btn" data-id="${aff.id}" title="View Referrals">
          <i class="fas fa-users"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (!tbody.dataset.listenerAttached) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-referrals-btn');
      if (btn) openAffiliateReferrals(btn.dataset.id);
    });
    tbody.dataset.listenerAttached = 'true';
  }
}

async function openAffiliateReferrals(affiliateId) {
  const modal = document.getElementById('affiliateReferralsModal');
  const list = document.getElementById('referralsList');
  
  list.innerHTML = '<div class="text-center" style="padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
  modal.classList.add('active');

  try {
    const referrals = await apiFetch(`/admin/affiliates/${affiliateId}/referrals`);
    
    if (!referrals || referrals.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed var(--glass-border);">
          <i class="fas fa-users" style="font-size: 32px; color: var(--aura-text-secondary); margin-bottom: 12px; opacity: 0.5;"></i>
          <p style="color: var(--aura-text-secondary);">This affiliate has no referrals yet.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = referrals.map(ref => `
      <div style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
        <div class="user-cell">
          <div class="user-avatar" style="background: ${getAvatarGradient(ref.user?.displayName)}">
            ${(ref.user?.displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div class="user-info" style="margin-left: 12px;">
            <div style="font-weight: 600; color: var(--aura-text);">${ref.user?.displayName || 'Unknown'}</div>
            <div style="font-size: 11px; color: var(--aura-text-secondary);">${ref.user?.email || 'N/A'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="badge badge-${ref.user?.subscription?.plan || 'free'}">${(ref.user?.subscription?.plan || 'free').toUpperCase()}</div>
          <div style="font-size: 10px; color: var(--aura-text-secondary); margin-top: 4px;">Joined: ${new Date(ref.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    `).join('');
  } catch (e) { 
    showToast(e.message, 'error'); 
    modal.classList.remove('active');
  }
}

// --- PAGE: WITHDRAWALS ---
async function fetchWithdrawals() {
  try {
    const withdrawals = await apiFetch('/admin/withdrawals');
    updateWithdrawalsTable(withdrawals);
  } catch (e) { showToast(e.message, 'error'); }
}

function updateWithdrawalsTable(withdrawals) {
  const tbody = document.getElementById('withdrawalsTable');
  if (!tbody) return;

  if (!withdrawals || withdrawals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No withdrawal requests</td></tr>';
    return;
  }

  tbody.innerHTML = withdrawals.map(w => `
    <tr>
      <td>
        <div class="user-info">
          <div style="font-weight: 600;">${w.accountName}</div>
          <div style="font-size: 11px;">${w.affiliateId}</div>
        </div>
      </td>
      <td>₦${(w.amount || 0).toLocaleString()}</td>
      <td>
        <div style="font-weight: 600; color: var(--aura-mint);">₦${(w.netAmount || 0).toLocaleString()}</div>
        <div style="font-size: 10px; color: #FF6161;">Fee: ₦${(w.fee || 0).toLocaleString()}</div>
      </td>
      <td>
        <div style="font-size: 12px; font-weight: 500;">${w.bankName}</div>
        <div style="font-size: 11px; font-family: monospace;">${w.accountNumber}</div>
      </td>
      <td><span class="badge badge-${w.status}">${w.status.toUpperCase()}</span></td>
      <td>
        ${w.status === 'pending' ? `
          <div style="display: flex; gap: 4px;">
            <button class="action-btn approve-withdrawal-btn" data-id="${w.id}" title="Mark as Paid" style="color: var(--aura-mint);">
              <i class="fas fa-check-circle"></i>
            </button>
            <button class="action-btn reject-withdrawal-btn" data-id="${w.id}" title="Reject" style="color: #FF6161;">
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        ` : '---'}
      </td>
    </tr>
  `).join('');

  if (!tbody.dataset.listenerAttached) {
    tbody.addEventListener('click', (e) => {
      const approveBtn = e.target.closest('.approve-withdrawal-btn');
      const rejectBtn = e.target.closest('.reject-withdrawal-btn');
      if (approveBtn) handleWithdrawalStatus(approveBtn.dataset.id, 'paid');
      if (rejectBtn) handleWithdrawalStatus(rejectBtn.dataset.id, 'rejected');
    });
    tbody.dataset.listenerAttached = 'true';
  }
}

async function handleWithdrawalStatus(id, status) {
  const action = status === 'paid' ? 'approve and mark as paid' : 'reject';
  if (!(await showConfirm(`Are you sure you want to ${action} this withdrawal request?`, 'Withdrawal Status'))) return;

  try {
    await apiFetch(`/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Withdrawal ${status}`);
    fetchWithdrawals();
  } catch (e) { showToast(e.message, 'error'); }
}

// Data Fetching Wrapper
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_URL}${endpoint}${separator}_t=${Date.now()}`;
  
  const fetchOptions = {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };

  const response = await fetch(url, fetchOptions);
  
  if (response.status === 401) { 
    logout(); 
    throw new Error('Session expired'); 
  }
  
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'API request failed');
  
  // Return the data block if it exists, otherwise return the whole object
  return data.data !== undefined ? data.data : data;
}

// --- SHARED UTILS ---
function updatePaginationUI(prefix, pagination) {
  const container = document.getElementById(`${prefix}Pagination`);
  const currentEl = document.getElementById(`${prefix}CurrentPage`);
  const totalEl = document.getElementById(`${prefix}TotalPages`);
  const prevBtn = document.getElementById(`prev${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Btn`);
  const nextBtn = document.getElementById(`next${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Btn`);
  if (!container || !currentEl || !totalEl) return;
  if (pagination.totalPages <= 1 && pagination.total <= 20) { container.style.display = 'none'; } 
  else {
    container.style.display = 'flex';
    currentEl.textContent = pagination.page;
    totalEl.textContent = pagination.totalPages;
    if (prevBtn) prevBtn.disabled = pagination.page <= 1;
    if (nextBtn) nextBtn.disabled = pagination.page >= pagination.totalPages;
  }
}

function getAvatarGradient(name) {
  const gradients = ['linear-gradient(135deg, #7B61FF, #00D9FF)', 'linear-gradient(135deg, #FF61DC, #7B61FF)', 'linear-gradient(135deg, #2DD4A8, #00D9FF)', 'linear-gradient(135deg, #FFD166, #FF61DC)'];
  const index = (name || 'A').charCodeAt(0) % gradients.length;
  return gradients[index];
}

// --- PAGE: DASHBOARD ---
async function loadDashboardData() {
  try {
    const stats = await apiFetch('/admin/stats');
    updateStatsDisplay(stats);
    const users = await apiFetch('/admin/users?limit=5');
    updateUsersTable('recentUsersTable', users.users, false);
  } catch (e) { console.error('Dashboard error:', e); }
}

function updateStatsDisplay(apiResponse) {
  try {
    const data = apiResponse.data || apiResponse; 
    if (!data) return;
    
    const setVal = (id, val) => { 
      const el = document.getElementById(id); 
      if (el) el.textContent = val; 
    };
    
    const setGrowth = (id, growth) => { 
      const el = document.getElementById(id); 
      if (!el) return; 
      const numGrowth = parseFloat(growth) || 0;
      const isPositive = numGrowth >= 0; 
      el.textContent = `${isPositive ? '+' : ''}${numGrowth}%`; 
      el.className = `stat-change ${isPositive ? 'positive' : 'negative'}`; 
    };

    // Basic Stats
    setVal('totalUsers', (data.users?.total || 0).toLocaleString());
    setVal('onlineUsers', (data.users?.online || 0).toLocaleString());
    setGrowth('userGrowth', data.users?.growth || 0);
    
    setVal('totalAuraTrees', (data.auraTrees?.total || 0).toLocaleString());
    setGrowth('treeGrowth', data.auraTrees?.growth || 0);
    
    setVal('totalLinks', (data.links?.total || 0).toLocaleString());
    setGrowth('linkGrowth', data.links?.growth || 0);
    
    // Revenue Stats
    const revenueTotal = data.revenue?.total || 0;
    setVal('totalRevenue', '₦' + revenueTotal.toLocaleString());
    
    // Force set revenue growth specifically
    const revGrowthEl = document.getElementById('revenueGrowth');
    if (revGrowthEl) {
      const rGrowth = parseFloat(data.revenue?.growth) || 0;
      const isPos = rGrowth >= 0;
      revGrowthEl.textContent = `${isPos ? '+' : ''}${rGrowth}%`;
      revGrowthEl.className = `stat-change ${isPos ? 'positive' : 'negative'}`;
    }

    // Subscription Breakdown
    const subStats = document.getElementById('subscriptionStats');
    if (subStats && data.users?.total > 0) {
      const total = data.users.total;
      subStats.innerHTML = `
        ${renderSubStat('Free', data.subscriptions?.free || 0, total, 'var(--aura-text-secondary)')}
        ${renderSubStat('Pro', data.subscriptions?.pro || 0, total, 'var(--aura-violet)')}
        ${renderSubStat('Teams', data.subscriptions?.teams || 0, total, 'var(--aura-cyan)')}
      `;
    }
  } catch (error) {
    console.error('Error in updateStatsDisplay:', error);
  }
}

function renderSubStat(label, count, total, color) {
  const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
  return `<div style="margin-bottom: 16px;"><div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;"><span>${label}</span><span>${count} (${percent}%)</span></div><div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;"><div style="width: ${percent}%; height: 100%; background: ${color}; border-radius: 3px;"></div></div></div>`;
}

// --- PAGE: USERS ---
async function fetchUsers(page = 1) {
  const search = document.getElementById('userSearchInput')?.value || '';
  const plan = document.getElementById('planFilter')?.value || 'all';
  const status = document.getElementById('statusFilter')?.value || 'all';
  try {
    const data = await apiFetch(`/admin/users?search=${search}&plan=${plan}&status=${status}&page=${page}&limit=20`);
    paginationState.users.page = data.pagination.page; paginationState.users.totalPages = data.pagination.totalPages;
    updateUsersTable('usersTable', data.users, true); updatePaginationUI('user', data.pagination);
  } catch (e) { console.error(e); }
}

function updateUsersTable(tableId, users, showUsername = false) {
  const tbody = document.getElementById(tableId); if (!tbody) return;
  if (!users || users.length === 0) { tbody.innerHTML = `<tr><td colspan="${showUsername ? 6 : 5}" class="text-center" style="padding: 40px;">No users found</td></tr>`; return; }
  tbody.innerHTML = users.map(user => {
    const isPremium = user.subscription?.plan && user.subscription.plan !== 'free';
    const isCancelled = user.subscription?.status === 'cancelled';
    
    // Check if user has an avatarUrl
    const hasAvatar = user.avatarUrl && user.avatarUrl !== '';
    const avatarContent = hasAvatar 
      ? `<img src="${user.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`
      : (user.displayName || user.email || 'U').charAt(0).toUpperCase();

    return `<tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar" style="background: ${hasAvatar ? 'transparent' : getAvatarGradient(user.displayName || user.email)}; overflow: hidden;">
            ${avatarContent}
          </div>
          <div class="user-info">
            <span class="user-name">${user.displayName || 'No Name'}</span>
            <span class="user-email">${user.email}</span>
          </div>
        </div>
      </td>
      ${showUsername ? `<td>@${user.username || '---'}</td>` : ''}
      <td>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span class="badge badge-${user.subscription?.plan || 'free'}">${user.subscription?.plan || 'Free'}</span>
          ${isCancelled ? '<span style="font-size: 9px; color: #FF6161; font-weight: bold; text-transform: uppercase;">Cancelled</span>' : ''}
        </div>
      </td>
      <td><span class="badge badge-${user.isActive !== false ? 'active' : 'inactive'}">${user.isActive !== false ? 'Active' : 'Inactive'}</span></td>
      <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="action-btn edit-user-btn" data-id="${user.id}" title="Edit"><i class="fas fa-edit"></i></button>
          ${isPremium && !isCancelled ? `<button class="action-btn cancel-sub-btn" data-id="${user.id}" title="Cancel Subscription" style="color: #FFB020;"><i class="fas fa-ban"></i></button>` : ''}
          <button class="action-btn delete-user-btn" data-id="${user.id}" title="Delete" style="color: #FF6161;"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  if (!tbody.dataset.listenerAttached) { 
    tbody.addEventListener('click', (e) => { 
      const editBtn = e.target.closest('.edit-user-btn'); 
      const deleteBtn = e.target.closest('.delete-user-btn'); 
      const cancelBtn = e.target.closest('.cancel-sub-btn');
      if (editBtn) handleEditUser(editBtn.dataset.id); 
      if (deleteBtn) handleDeleteUser(deleteBtn.dataset.id); 
      if (cancelBtn) handleAdminCancelSubscription(cancelBtn.dataset.id);
    }); 
    tbody.dataset.listenerAttached = 'true'; 
  }
}

async function handleAdminCancelSubscription(userId) {
  if (!(await showConfirm('Are you sure you want to cancel this users subscription? This will stop future billing on Paystack.', 'Cancel Subscription', 'fa-ban', '#FFB020'))) return;
  try {
    const res = await apiFetch(`/admin/users/${userId}/cancel-subscription`, { method: 'POST' });
    showToast(res.message || 'Subscription cancelled');
    fetchUsers(paginationState.users.page);
  } catch (e) {
    showToast(e.message || 'Error cancelling subscription', 'error');
  }
}

async function handleEditUser(userId) {
  try {
    const user = await apiFetch(`/admin/users/${userId}`);
    const u = user.user;
    document.getElementById('editUserId').value = u.id;
    document.getElementById('editDisplayName').value = u.displayName || '';
    document.getElementById('editIsActive').value = String(u.isActive !== false);
    document.getElementById('editUserModal').classList.add('active');
  } catch (e) { showToast('Error fetching user', 'error'); }
}

async function handleDeleteUser(userId) {
  try {
    const user = await apiFetch(`/admin/users/${userId}`);
    const u = user.user;
    document.getElementById('deleteUserTargetName').textContent = `Target: ${u.displayName || u.email}`;
    document.getElementById('confirmDeleteUser').onclick = async () => {
      try {
        await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
        showToast('User Deleted');
        document.getElementById('deleteUserModal').classList.remove('active');
        fetchUsers(paginationState.users.page);
      } catch (e) { showToast(e.message, 'error'); }
    };
    document.getElementById('deleteUserModal').classList.add('active');
  } catch (e) { showToast('Error', 'error'); }
}

document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editUserId').value;
  const body = {
    displayName: document.getElementById('editDisplayName').value,
    isActive: document.getElementById('editIsActive').value === 'true'
  };
  try {
    await apiFetch(`/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    showToast('User Updated');
    document.getElementById('editUserModal').classList.remove('active');
    fetchUsers(paginationState.users.page);
  } catch (e) { showToast(e.message, 'error'); }
});

// --- PAGE: AURA TREES ---
async function fetchAuraTrees(page = 1) {
  const search = document.getElementById('treeSearchInput')?.value || '';
  const isActive = document.getElementById('treeStatusFilter')?.value || 'all';
  try {
    let url = `/admin/auratrees?search=${search}&page=${page}&limit=20`;
    if (isActive !== 'all') url += `&isActive=${isActive}`;
    const data = await apiFetch(url);
    paginationState.auratrees.page = data.pagination.page; paginationState.auratrees.totalPages = data.pagination.totalPages;
    updateAuraTreesTable(data.auraTrees); updatePaginationUI('tree', data.pagination);
  } catch (e) { console.error(e); }
}

function updateAuraTreesTable(trees) {
  const tbody = document.getElementById('auraTreesTable'); if (!tbody) return;
  if (!trees || trees.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px;">No trees found</td></tr>'; return; }
  tbody.innerHTML = trees.map(tree => `<tr><td><div class="user-cell"><div class="user-avatar" style="background: var(--aura-violet)"><i class="fas fa-tree"></i></div><div class="user-info"><span class="user-name">${tree.displayName || 'Untitled'}</span><span class="user-email">${tree.bio ? tree.bio.substring(0, 30) + '...' : 'No bio'}</span></div></div></td><td><code style="color: var(--aura-cyan)">/${tree.slug}</code></td><td><small style="color: var(--aura-text-secondary)">${tree.userId}</small></td><td><span class="badge badge-${tree.isActive !== false ? 'active' : 'inactive'}">${tree.isActive !== false ? 'Active' : 'Inactive'}</span></td><td>${tree.createdAt ? new Date(tree.createdAt).toLocaleDateString() : 'N/A'}</td><td><div style="display: flex; gap: 4px;"><button class="action-btn view-tree-btn" data-slug="${tree.slug}" title="View"><i class="fas fa-external-link-alt"></i></button></div></td></tr>`).join('');
  if (!tbody.dataset.listenerAttached) { tbody.addEventListener('click', (e) => { const viewBtn = e.target.closest('.view-tree-btn'); if (viewBtn) window.open(`http://localhost:5175/${viewBtn.dataset.slug}`, '_blank'); }); tbody.dataset.listenerAttached = 'true'; }
}

// --- PAGE: LINKS (USER CENTRIC) ---
async function fetchUsersForLinks(page = 1) {
  const search = document.getElementById('linkUserSearchInput')?.value || '';
  try {
    const data = await apiFetch(`/admin/users?search=${search}&page=${page}&limit=20`);
    paginationState.links.page = data.pagination.page; paginationState.links.totalPages = data.pagination.totalPages;
    updateLinkUsersTable(data.users); updatePaginationUI('links', data.pagination);
  } catch (e) { console.error(e); }
}

function updateLinkUsersTable(users) {
  const tbody = document.getElementById('linkUsersTable'); if (!tbody) return;
  if (!users || users.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px;">No users found</td></tr>'; return; }
  tbody.innerHTML = users.map(user => `<tr><td><div class="user-cell"><div class="user-avatar" style="background: ${getAvatarGradient(user.displayName)}">${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</div><div class="user-info"><span class="user-name">${user.displayName || 'No Name'}</span><span class="user-email">${user.email}</span></div></div></td><td><small style="color: var(--aura-text-secondary)">${user.id}</small></td><td><span class="badge badge-${user.subscription?.plan || 'free'}">${user.subscription?.plan || 'Free'}</span></td><td><span class="badge badge-${user.isActive !== false ? 'active' : 'inactive'}">${user.isActive !== false ? 'Active' : 'Inactive'}</span></td><td><button class="btn btn-secondary open-user-links-btn" data-id="${user.id}" data-name="${user.displayName || user.email}">View Links</button></td></tr>`).join('');
  if (!tbody.dataset.listenerAttached) { tbody.addEventListener('click', (e) => { const btn = e.target.closest('.open-user-links-btn'); if (btn) openUserLinks(btn.dataset.id, btn.dataset.name); }); tbody.dataset.listenerAttached = 'true'; }
}

async function openUserLinks(userId, userName) {
  const modal = document.getElementById('userLinksModal'); const linksGrid = document.getElementById('modalLinksGrid');
  document.getElementById('modalUserName').textContent = userName;
  document.getElementById('modalAuraTreeInfo').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  linksGrid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
  modal.classList.add('active');
  try {
    const data = await apiFetch(`/admin/users/${userId}`); const { auraTree, links } = data;
    if (auraTree) { document.getElementById('modalAuraTreeInfo').innerHTML = `<div style="display: flex; justify-content: space-between;"><div><div style="font-weight: 700; font-size: 18px;">${auraTree.displayName || 'Untitled'}</div><div style="color: var(--aura-cyan);">aura.tree/${auraTree.slug}</div></div><button class="btn btn-secondary preview-tree-btn" data-slug="${auraTree.slug}">Preview</button></div>`; const pBtn = document.querySelector('.preview-tree-btn'); if (pBtn) pBtn.onclick = () => window.open(`http://localhost:5175/${pBtn.dataset.slug}`, '_blank'); } else { document.getElementById('modalAuraTreeInfo').innerHTML = 'No tree found.'; }
    if (!links || links.length === 0) { linksGrid.innerHTML = 'No links found.'; } else { linksGrid.innerHTML = links.map(l => `<div class="link-card"><div class="link-card-header"><span class="link-platform-tag">${l.platform || 'web'}</span><button class="action-btn modal-delete-link-btn" data-id="${l.id}" data-tree="${auraTree.id}" style="color: #FF6161;"><i class="fas fa-trash-alt"></i></button></div><div class="link-card-title">${l.title || 'Untitled'}</div><a href="${l.url}" target="_blank" class="link-card-url">${l.url}</a><div class="link-card-stats"><div class="link-stat-item"><i class="fas fa-mouse-pointer"></i><span>${l.clickCount || 0} clicks</span></div></div></div>`).join(''); if (!linksGrid.dataset.listenerAttached) { linksGrid.addEventListener('click', (e) => { const delBtn = e.target.closest('.modal-delete-link-btn'); if (delBtn) handleDeleteLinkInModal(delBtn.dataset.id, delBtn.dataset.tree, userId, userName); }); linksGrid.dataset.listenerAttached = 'true'; } }
  } catch (e) { console.error(e); }
}

async function handleDeleteLinkInModal(linkId, treeId, userId, userName) { 
  const result = await showConfirm('Are you sure you want to delete this link? This action cannot be undone.', 'Delete Link', 'fa-trash-alt', '#FF6161');
  if (!result) return;
  
  try { 
    const token = localStorage.getItem('adminToken'); 
    await fetch(`${API_URL}/admin/links/${treeId}/${linkId}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${token}` } 
    }); 
    showToast('Link deleted');
    openUserLinks(userId, userName); 
  } catch (e) { 
    showToast('Failed to delete link', 'error'); 
  } 
}

// ... rest of withdrawal logic already correctly using showConfirm ...

// --- PAGE: TESTIMONIALS ---
async function fetchTestimonials(page = 1) {
  try {
    const data = await apiFetch(`/admin/testimonials?page=${page}&limit=20`);
    const testimonials = data.testimonials || [];
    const pagination = data.pagination || { page: 1, totalPages: 1 };
    
    paginationState.testimonials.page = pagination.page;
    paginationState.testimonials.totalPages = pagination.totalPages;
    
    updateTestimonialsTable(testimonials);
    updatePaginationUI('testimonial', pagination);
  } catch (e) { console.error(e); }
}

function updateTestimonialsTable(testimonials) {
  const tbody = document.getElementById('testimonialsTable');
  if (!tbody) return;
  
  if (!testimonials || testimonials.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px;">No testimonials found</td></tr>';
    return;
  }

  // Store data globally for the modal
  window.currentTestimonials = testimonials;

  tbody.innerHTML = testimonials.map((t, index) => `
    <tr class="testimonial-row" data-id="${t.id}" data-index="${index}" style="cursor: pointer;">
      <td>
        <div class="user-cell">
          <div class="user-avatar" style="overflow: hidden; background: transparent;">
            <img src="${t.avatar}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="user-info">
            <span class="user-name">${t.name}</span>
            <span class="user-email">${t.role}</span>
            <div class="mobile-quote-preview" style="display: none; font-size: 11px; color: var(--aura-text-secondary); margin-top: 4px; font-style: italic;">
              "${t.quote.substring(0, 40)}${t.quote.length > 40 ? '...' : ''}"
            </div>
          </div>
        </div>
      </td>
      <td>
        <div style="max-width: 300px; font-size: 13px; line-height: 1.4; color: var(--aura-text-secondary);">
          "${t.quote.substring(0, 100)}${t.quote.length > 100 ? '...' : ''}"
        </div>
      </td>
      <td><span class="badge badge-active">${t.status || 'approved'}</span></td>
      <td>${new Date(t.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="action-btn delete-testimonial-btn" data-id="${t.id}" title="Delete" style="color: #FF6161;">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (!tbody.dataset.listenerAttached) {
    tbody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-testimonial-btn');
      if (deleteBtn) {
        e.stopPropagation();
        handleDeleteTestimonial(deleteBtn.dataset.id);
        return;
      }
      
      const row = e.target.closest('.testimonial-row');
      if (row) {
        const index = row.dataset.index;
        openTestimonialDetail(window.currentTestimonials[index]);
      }
    });
    tbody.dataset.listenerAttached = 'true';
  }
}

function openTestimonialDetail(t) {
  const modal = document.getElementById('testimonialDetailModal');
  document.getElementById('detailAvatar').querySelector('img').src = t.avatar;
  document.getElementById('detailName').textContent = t.name;
  document.getElementById('detailRole').textContent = t.role;
  document.getElementById('detailQuote').textContent = t.quote;
  document.getElementById('detailDate').textContent = new Date(t.createdAt).toLocaleDateString();
  
  const deleteBtn = document.getElementById('deleteDetailBtn');
  deleteBtn.onclick = () => {
    closeModal();
    handleDeleteTestimonial(t.id);
  };
  
  modal.classList.add('active');
}

async function handleDeleteTestimonial(id) {
  if (!(await showConfirm('Are you sure you want to delete this testimonial?', 'Delete Testimonial', 'fa-trash', '#FF6161'))) return;
  
  try {
    await apiFetch(`/admin/testimonials/${id}`, { method: 'DELETE' });
    showToast('Testimonial deleted');
    fetchTestimonials(paginationState.testimonials.page);
  } catch (e) { showToast(e.message, 'error'); }
}

// --- PAGE: SUBSCRIBERS ---
async function fetchSubscribers(page = 1) {
  try {
    const data = await apiFetch(`/admin/subscribers?page=${page}&limit=20`);
    const subscribers = data.subscribers || [];
    const pagination = data.pagination || { page: 1, totalPages: 1 };
    
    paginationState.subscribers.page = pagination.page;
    paginationState.subscribers.totalPages = pagination.totalPages;
    
    updateSubscribersTable(subscribers);
    updatePaginationUI('subscribers', pagination);
  } catch (e) { console.error(e); }
}

function updateSubscribersTable(subscribers) {
  const tbody = document.getElementById('subscribersTable');
  if (!tbody) return;
  
  if (!subscribers || subscribers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px;">No subscribers found</td></tr>';
    return;
  }

  tbody.innerHTML = subscribers.map(s => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--aura-text);">${s.email}</div>
      </td>
      <td><span class="badge badge-free">${s.source || 'newsletter'}</span></td>
      <td>${new Date(s.subscribedAt).toLocaleDateString()}</td>
      <td><span class="badge badge-active">Subscribed</span></td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="action-btn send-email-btn" data-id="${s.id}" data-email="${s.email}" title="Send Email" style="color: var(--aura-violet);">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button class="action-btn delete-subscriber-btn" data-id="${s.id}" title="Remove" style="color: #FF6161;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (!tbody.dataset.listenerAttached) {
    tbody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-subscriber-btn');
      if (deleteBtn) handleDeleteSubscriber(deleteBtn.dataset.id);
      
      const emailBtn = e.target.closest('.send-email-btn');
      if (emailBtn) openEmailModal(emailBtn.dataset.id, emailBtn.dataset.email);
    });
    tbody.dataset.listenerAttached = 'true';
  }
}

async function handleDeleteSubscriber(id) {
  if (!(await showConfirm('Remove this subscriber from the list?', 'Delete Subscriber', 'fa-trash', '#FF6161'))) return;
  try {
    await apiFetch(`/admin/subscribers/${id}`, { method: 'DELETE' });
    showToast('Subscriber removed');
    fetchSubscribers(paginationState.subscribers.page);
  } catch (e) { showToast(e.message, 'error'); }
}

// --- EMAIL SENDING ---
let currentRecipientId = null;

function openEmailModal(recipientId = null, email = null) {
  currentRecipientId = recipientId;
  const modal = document.getElementById('emailModal');
  const display = document.getElementById('recipientDisplay');
  const emailSpan = document.getElementById('recipientEmail');
  const title = document.getElementById('emailModalTitle');
  
  if (email) {
    display.style.display = 'block';
    emailSpan.textContent = email;
    title.textContent = 'Send Individual Email';
  } else {
    display.style.display = 'none';
    title.textContent = 'Send Bulk Newsletter';
  }
  
  document.getElementById('emailSubject').value = '';
  document.getElementById('emailContent').value = '';
  modal.classList.add('active');
}

document.getElementById('bulkEmailBtn')?.addEventListener('click', () => openEmailModal());

async function handleSendEmail() {
  const subject = document.getElementById('emailSubject').value;
  const content = document.getElementById('emailContent').value;
  const btn = document.getElementById('sendEmailSubmitBtn');

  if (!subject || !content) {
    showToast('Please provide subject and content', 'error');
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    await apiFetch('/admin/newsletter/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        content,
        recipientId: currentRecipientId
      })
    });
    
    showToast('Email sent successfully');
    closeModal();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Now';
  }
}

document.getElementById('sendEmailSubmitBtn')?.addEventListener('click', handleSendEmail);
document.getElementById('closeEmailModal')?.addEventListener('click', closeModal);
document.getElementById('cancelEmailBtn')?.addEventListener('click', closeModal);

// --- PAGE: PAYMENTS ---
async function fetchPayments(page = 1) {
  const status = document.getElementById('paymentStatusFilter')?.value || 'all';
  try {
    const data = await apiFetch(`/admin/payments?limit=20&page=${page}&status=${status}`);
    paginationState.payments.page = data.pagination.page; paginationState.payments.totalPages = data.pagination.totalPages;
    updatePaymentsTable(data.payments, data.pagination); updatePaginationUI('payments', data.pagination);
  } catch (e) { console.error(e); }
}

function updatePaymentsTable(payments, pagination) {
  const tbody = document.getElementById('paymentsTable'); if (!tbody) return;
  if (!payments || payments.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">No records found</td></tr>'; return; }
  tbody.innerHTML = payments.map(p => `<tr><td><small style="font-family: monospace;">${p.id}</small></td><td><div class="user-info"><div style="font-weight: 600;">${p.userName || 'N/A'}</div><div style="font-size: 11px;">${p.userEmail || 'N/A'}</div></div></td><td><span style="color: var(--aura-mint);">₦${(p.amount || 0).toLocaleString()}</span></td><td><span class="badge badge-${p.status}">${p.status}</span></td><td><small>${p.reference || '---'}</small></td><td>${new Date(p.createdAt).toLocaleDateString()}</td></tr>`).join('');
}

// --- PAGE: SUBSCRIPTIONS ---
async function fetchSubscriptions(page = 1) {
  const search = document.getElementById('subSearchInput')?.value || ''; const plan = document.getElementById('subPlanFilter')?.value || 'all'; const status = document.getElementById('subStatusFilter')?.value || 'all';
  try {
    const data = await apiFetch(`/admin/users?search=${search}&plan=${plan}&status=${status}&page=${page}&limit=20`);
    paginationState.subs.page = data.pagination.page; paginationState.subs.totalPages = data.pagination.totalPages;
    updateSubscriptionsTable(data.users, data.pagination); updatePaginationUI('subs', data.pagination);
  } catch (e) { console.error(e); }
}

function updateSubscriptionsTable(users, pagination) {
  const tbody = document.getElementById('subscriptionsTable'); if (!tbody) return;
  if (!users || users.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">No subscriptions found</td></tr>'; return; }
  tbody.innerHTML = users.map(user => {
    const sub = user.subscription || { plan: 'free', status: 'active' };
    return `<tr><td><div class="user-cell"><div class="user-avatar" style="background: ${getAvatarGradient(user.displayName)}">${(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</div><div class="user-info"><span class="user-name">${user.displayName || 'No Name'}</span><span class="user-email">${user.email}</span></div></div></td><td><span class="badge badge-${sub.plan}">${sub.plan.toUpperCase()}</span></td><td><span class="badge badge-${sub.status === 'active' ? 'active' : 'inactive'}">${sub.status.toUpperCase()}</span></td><td><small>${sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'Never'}</small></td><td><button class="btn btn-secondary change-plan-btn" data-id="${user.id}" data-current="${sub.plan}" data-status="${sub.status}" data-name="${user.displayName || user.email}">Change Plan</button></td></tr>`;
  }).join('');
  if (!tbody.dataset.listenerAttached) { tbody.addEventListener('click', (e) => { const btn = e.target.closest('.change-plan-btn'); if (btn) handleChangePlan(btn.dataset.id, btn.dataset.current, btn.dataset.status, btn.dataset.name); }); tbody.dataset.listenerAttached = 'true'; }
}

async function handleChangePlan(userId, currentPlan, currentStatus, userName) {
  document.getElementById('changePlanUserId').value = userId; document.getElementById('changePlanTargetUser').textContent = `Updating: ${userName}`;
  document.getElementById('newPlanSelect').value = currentPlan; document.getElementById('newStatusSelect').value = currentStatus || 'active';
  document.getElementById('changePlanModal').classList.add('active');
}

document.getElementById('changePlanForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = document.getElementById('changePlanUserId').value;
  const newPlan = document.getElementById('newPlanSelect').value;
  const newStatus = document.getElementById('newStatusSelect').value;
  const btn = document.getElementById('confirmPlanChange');

  try {
    btn.disabled = true; btn.innerHTML = 'Updating...';
    await apiFetch(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: {
          plan: newPlan,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      })
    });
    showToast('User plan updated successfully');
    document.getElementById('changePlanModal').classList.remove('active');
    fetchSubscriptions(paginationState.subs.page);
  } catch (e) {
    showToast(e.message || 'Error updating plan', 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = 'Update Plan';
  }
});

// --- PAGE: ANALYTICS ---
let charts = {};
async function fetchAnalytics() {
  try { 
    const period = document.getElementById('analyticsPeriod')?.value || '30d';
    const data = await apiFetch(`/admin/analytics?period=${period}`); 
    renderAnalyticsCharts(data); 
  } catch (e) { 
    console.error('Analytics Fetch Error:', e); 
  }
}

function renderAnalyticsCharts(data) {
  if (!data) return;
  const { signups = {}, revenue = {}, analytics = {} } = data;
  Object.values(charts).forEach(c => c.destroy());

  // 1. Line Charts (Signups & Revenue)
  const sDates = Object.keys(signups).sort();
  const rDates = Object.keys(revenue).sort();
  
  if (sDates.length > 0) {
    charts.signups = new Chart(document.getElementById('signupsChart'), {
      type: 'bar',
      data: {
        labels: sDates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'New Signups',
          data: sDates.map(d => signups[d]),
          backgroundColor: '#7B61FF',
          borderRadius: 4
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  if (rDates.length > 0) {
    charts.revenue = new Chart(document.getElementById('revenueChart'), {
      type: 'bar',
      data: {
        labels: rDates,
        datasets: [{
          label: 'Revenue (NGN)',
          data: rDates.map(d => revenue[d]),
          backgroundColor: '#2DD4A8'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  // 2. Device Distribution (Doughnut)
  if (analytics && analytics.devices) {
    const canvas = document.getElementById('devicesChart');
    if (canvas) {
      charts.devices = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Mobile', 'Tablet', 'Desktop'],
          datasets: [{
            data: [analytics.devices.mobile || 0, analytics.devices.tablet || 0, analytics.devices.desktop || 0],
            backgroundColor: ['#FF61DC', '#00D9FF', '#7B61FF'],
            borderWidth: 0
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  // 3. Peak Usage Hours (Bar)
  if (analytics && analytics.peakHours) {
    const canvas = document.getElementById('peakHoursChart');
    if (canvas) {
      charts.peakHours = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: Array.from({length: 24}, (_, i) => {
            const hour = i % 12 || 12;
            const ampm = i < 12 ? 'AM' : 'PM';
            return `${hour}${ampm}`;
          }),
          datasets: [{
            label: 'Visits',
            data: analytics.peakHours,
            backgroundColor: 'rgba(0, 217, 255, 0.5)',
            borderColor: '#00D9FF',
            borderWidth: 1
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  // 4. Top Countries & Regions Tables
  const updateTable = (id, list) => {
    const tbody = document.getElementById(id);
    if (!tbody) return;
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" class="text-center">No data yet</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(item => `
      <tr>
        <td><i class="fas fa-map-pin mr-2 text-aura-violet"></i> ${item.name}</td>
        <td style="font-weight: 600;">${item.count.toLocaleString()}</td>
      </tr>
    `).join('');
  };

  if (analytics) {
    updateTable('topCountriesTable', analytics.countries || []);
    updateTable('topRegionsTable', analytics.regions || []);
  }
}

// --- PAGE: LOGS ---
async function fetchLogs(page = 1) {
  try { const data = await apiFetch(`/admin/logs?page=${page}&limit=50`); paginationState.logs.page = data.pagination.page; paginationState.logs.totalPages = data.pagination.totalPages; updateLogsTable(data.logs); updatePaginationUI('logs', data.pagination); } catch (e) { console.error(e); }
}

function updateLogsTable(logs) {
  const tbody = document.getElementById('logsTable'); if (!tbody) return;
  if (!logs || logs.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No logs found</td></tr>'; return; }
  tbody.innerHTML = logs.map(l => `<tr><td><span class="badge badge-free">${l.action}</span></td><td><small style="font-family: monospace;">${l.adminId || 'System'}</small></td><td><div style="font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${JSON.stringify(l.details || {})}</div></td><td>${new Date(l.createdAt).toLocaleString()}</td></tr>`).join('');
}

// --- PAGE: SETTINGS ---
async function fetchSettings() {
  try { 
    const d = await apiFetch('/admin/settings'); 
    document.getElementById('settingPlatformName').value = d.platformName; 
    document.getElementById('settingSupportEmail').value = d.supportEmail; 
    document.getElementById('settingMaintenance').value = String(d.maintenanceMode); 
    document.getElementById('settingRegistration').value = String(d.registrationEnabled); 
    document.getElementById('settingMinPassword').value = d.minPasswordLength || 6; 
    document.getElementById('settingMaxLinks').value = d.maxLinksPerFreeUser || 5; 
    if (document.getElementById('settingProPrice')) document.getElementById('settingProPrice').value = d.proPrice || 1000;
    if (document.getElementById('settingTeamsPrice')) document.getElementById('settingTeamsPrice').value = d.teamsPrice || 10000;
  } catch (e) { console.error(e); }
}

document.getElementById('systemSettingsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); const btn = document.getElementById('saveSettingsBtn');
  const body = { 
    platformName: document.getElementById('settingPlatformName').value, 
    supportEmail: document.getElementById('settingSupportEmail').value, 
    maintenanceMode: document.getElementById('settingMaintenance').value === 'true', 
    registrationEnabled: document.getElementById('settingRegistration').value === 'true', 
    minPasswordLength: parseInt(document.getElementById('settingMinPassword').value), 
    maxLinksPerFreeUser: parseInt(document.getElementById('settingMaxLinks').value),
    proPrice: parseInt(document.getElementById('settingProPrice')?.value || '1000'),
    teamsPrice: parseInt(document.getElementById('settingTeamsPrice')?.value || '10000')
  };
  try { 
    btn.disabled = true; 
    btn.innerHTML = 'Saving...'; 
    await fetch(`${API_URL}/admin/settings`, { 
      method: 'PUT', 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    }); 
    showToast('Settings saved successfully'); 
  } catch (e) { 
    showToast('Failed to save settings', 'error'); 
  } finally { 
    btn.disabled = false; 
    btn.innerHTML = 'Save All Settings'; 
  }
});

// --- AUTH & MISC ---
const setupFilter = (id, callback) => { const el = document.getElementById(id); if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => { if (el.tagName === 'INPUT') { clearTimeout(el.timeout); el.timeout = setTimeout(() => callback(1), 500); } else callback(1); }); };
setupFilter('userSearchInput', fetchUsers); setupFilter('planFilter', fetchUsers); setupFilter('statusFilter', fetchUsers); setupFilter('treeSearchInput', fetchAuraTrees); setupFilter('treeStatusFilter', fetchAuraTrees); setupFilter('linkUserSearchInput', fetchUsersForLinks); setupFilter('paymentStatusFilter', fetchPayments); setupFilter('subSearchInput', fetchSubscriptions); setupFilter('subPlanFilter', fetchSubscriptions); setupFilter('subStatusFilter', fetchSubscriptions); setupFilter('analyticsPeriod', fetchAnalytics);

const setupPagination = (prefix, state, cb) => { document.getElementById(`prev${prefix}Btn`)?.addEventListener('click', () => { if (state.page > 1) cb(state.page - 1); }); document.getElementById(`next${prefix}Btn`)?.addEventListener('click', () => { if (state.page < state.totalPages) cb(state.page + 1); }); };
setupPagination('Users', paginationState.users, fetchUsers); setupPagination('Trees', paginationState.auratrees, fetchAuraTrees); setupPagination('Links', paginationState.links, fetchUsersForLinks); setupPagination('Testimonial', paginationState.testimonials, fetchTestimonials); setupPagination('Payments', paginationState.payments, fetchPayments); setupPagination('Subs', paginationState.subs, fetchSubscriptions); setupPagination('Logs', paginationState.logs, fetchLogs);

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); const btn = e.target.querySelector('.login-btn');
  try { btn.disabled = true; btn.innerHTML = '...'; const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e.target.querySelector('input[type="email"]').value, password: e.target.querySelector('input[type="password"]').value }) }); const d = await res.json(); if (d.success && d.data.isAdmin) { localStorage.setItem('adminToken', d.data.token); localStorage.setItem('adminUser', JSON.stringify(d.data)); location.reload(); } else alert('Denied'); } catch (e) { alert('Error'); } finally { btn.disabled = false; btn.innerHTML = 'Sign In'; }
});

function logout() { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); location.reload(); }
document.getElementById('logoutBtn')?.addEventListener('click', logout);

function checkAuth() { const t = localStorage.getItem('adminToken'); if (t) { dashboardPage.classList.remove('hidden'); loginPage.classList.add('hidden'); const u = JSON.parse(localStorage.getItem('adminUser') || '{}'); document.querySelector('.admin-name').textContent = u.displayName || 'Admin'; loadDashboardData(); forceScrollTop(); } }

// Modal Management
function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// Global click-outside listener
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});

// Wire up all close buttons
function initModalClosers() {
  const closeSelectors = [
    '.close-modal', 
    '.btn-secondary', 
    '#cancelEditUser', 
    '#cancelDeleteUser', 
    '#closeReferralsBtn',
    '#closeUserLinksBtn',
    '#cancelAddUser'
  ];
  
  document.querySelectorAll(closeSelectors.join(',')).forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Don't close if it's a primary action button or specific ignore
      if (btn.classList.contains('btn-primary')) return;
      closeModal();
    });
  });
}

// Call init on load
setTimeout(initModalClosers, 500);

function checkAuth() { 
  const t = localStorage.getItem('adminToken'); 
  if (t) { 
    dashboardPage.classList.remove('hidden'); 
    loginPage.classList.add('hidden'); 
    const u = JSON.parse(localStorage.getItem('adminUser') || '{}'); 
    document.querySelector('.admin-name').textContent = u.displayName || 'Admin'; 
    loadDashboardData(); 
    forceScrollTop(); 
    initModalClosers(); // Re-init after page load
  } 
}

// Remove the old manual array wiring at the bottom
// (I will replace the block from ['closeUserLinksModal'...)

const addUserModal = document.getElementById('addUserModal'); const addUserForm = document.getElementById('addUserForm');
const toggleAddModal = () => { addUserModal.classList.toggle('active'); if (addUserModal.classList.contains('active')) addUserForm.reset(); };
['closeAddUserModal', 'cancelAddUser', 'addUserDashboardBtn', 'addUserBtn'].forEach(id => document.getElementById(id)?.addEventListener('click', toggleAddModal));

if (addUserForm) { addUserForm.addEventListener('submit', async (e) => { e.preventDefault(); const fd = new FormData(addUserForm); const d = Object.fromEntries(fd.entries()); const btn = document.getElementById('confirmAddUser'); try { btn.disabled = true; btn.innerHTML = '...'; const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: d.email, password: d.password, displayName: d.displayName }) }); const resD = await res.json(); if (resD.success) { if (d.plan !== 'free') await fetch(`${API_URL}/admin/users/${resD.data.uid}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: { plan: d.plan, status: 'active' } }) }); showToast('Created'); toggleAddModal(); fetchUsers(1); } } catch (e) { showToast('Error', 'error'); } finally { btn.disabled = false; btn.innerHTML = 'Create User'; } }); }

checkAuth();
