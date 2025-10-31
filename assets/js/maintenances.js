class Maintenances {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = AuthUtils.checkAuth();
    this.init();
  }

  init() {
    this.allMaintenances = [];
    this.allEquipments = [];
    this.setupEventListeners();
    this.loadMaintenances();
    this.loadEquipments();
  }

  setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => AuthUtils.logout());
    document.getElementById('addMaintenanceBtn').addEventListener('click', () => this.showModal());
    document.getElementById('maintenanceForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.querySelector('.close').addEventListener('click', () => this.closeModal());
    document.getElementById('searchInput').addEventListener('input', () => this.filterMaintenances());
    document.getElementById('statusFilter').addEventListener('change', () => this.filterMaintenances());
    document.getElementById('equipmentFilter').addEventListener('change', () => this.filterMaintenances());
    window.addEventListener('click', (e) => {
      if (e.target.id === 'maintenanceModal') this.closeModal();
    });
  }

  async loadMaintenances() {
    try {
      const response = await fetch(`${this.baseURL}/maintenances`, {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const maintenances = await response.json();
        this.allMaintenances = maintenances;
        this.renderMaintenances(maintenances);
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível carregar as manutenções.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  async loadEquipments() {
    try {
      const response = await fetch(`${this.baseURL}/equipaments`, {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const equipments = await response.json();
        this.allEquipments = equipments;
        this.populateEquipmentSelect(equipments);
        this.populateEquipmentFilter(equipments);
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos');
    }
  }

  renderMaintenances(maintenances) {
    const statusMap = {
      'pending': 'Pendente',
      'in-progress': 'Em Andamento',
      'completed': 'Concluída',
      'cancelled': 'Cancelada'
    };
    
    const container = document.getElementById('maintenancesList');
    
    if (maintenances.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Nenhuma manutenção encontrada</h3>
          <p>Clique em "Adicionar Manutenção" para criar a primeira manutenção.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = maintenances.map(maintenance => `
      <article class="maintenance-card" role="listitem">
        <div class="maintenance-header">
          <h3 class="maintenance-title">${maintenance.equipment?.name || 'Equipamento não identificado'}</h3>
          <div class="maintenance-status">
            <span class="status-badge ${maintenance.status}">${statusMap[maintenance.status] || maintenance.status}</span>
          </div>
        </div>
        
        <div class="maintenance-info">
          <div class="info-item">
            <span class="info-label">Data</span>
            <span class="info-value">${new Date(maintenance.date).toLocaleDateString('pt-BR')}</span>
          </div>
          ${maintenance.performedBy ? `
          <div class="info-item">
            <span class="info-label">Técnico</span>
            <span class="info-value">${maintenance.performedBy.name}</span>
          </div>` : ''}
          <div class="info-item">
            <span class="info-label">Tipo</span>
            <span class="info-value">${maintenance.equipment?.type || 'N/A'}</span>
          </div>
        </div>
        
        <div class="maintenance-description">
          ${maintenance.description}
        </div>
        
        <div class="maintenance-actions">
          <button class="btn-edit" onclick="maintenances.edit(${maintenance.id})" aria-label="Editar manutenção de ${maintenance.equipment?.name || 'equipamento'}">Editar</button>
          <button class="btn-delete" onclick="maintenances.delete(${maintenance.id})" aria-label="Excluir manutenção de ${maintenance.equipment?.name || 'equipamento'}">Excluir</button>
        </div>
      </article>
    `).join('');
  }

  async handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('maintenanceId').value;
    const maintenance = {
      equipmentId: document.getElementById('maintenanceEquipmentId').value,
      description: document.getElementById('maintenanceDescription').value,
      date: document.getElementById('maintenanceDate').value,
      status: document.getElementById('maintenanceStatus').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${this.baseURL}/maintenances/${id}` : `${this.baseURL}/maintenances`;

    try {
      const response = await fetch(url, {
        method,
        headers: { ...AuthUtils.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenance)
      });

      if (response.ok) {
        this.closeModal();
        this.loadMaintenances();
        this.showNotification('success', 'Sucesso', id ? 'Manutenção atualizada com sucesso!' : 'Manutenção criada com sucesso!');
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível salvar a manutenção.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  async edit(id) {
    try {
      const response = await fetch(`${this.baseURL}/maintenances/${id}`, {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const maintenance = await response.json();
        document.getElementById('maintenanceId').value = maintenance.id;
        document.getElementById('maintenanceEquipmentId').value = maintenance.equipment.id;
        
        document.getElementById('maintenanceDescription').value = maintenance.description;
        document.getElementById('maintenanceDate').value = maintenance.date.split('T')[0];
        document.getElementById('maintenanceStatus').value = maintenance.status;
        document.getElementById('maintenanceModalTitle').textContent = 'Editar Manutenção';
        document.getElementById('maintenanceModal').style.display = 'flex';
      }
    } catch (error) {
      this.showNotification('error', 'Erro', 'Não foi possível carregar os dados da manutenção.');
    }
  }

  async delete(id) {
    this.showConfirmation(
      'Excluir Manutenção',
      'Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.',
      async () => {
        await this.performDelete(id);
      }
    );
  }

  async performDelete(id) {
    try {
      const response = await fetch(`${this.baseURL}/maintenances/${id}`, {
        method: 'DELETE',
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        this.loadMaintenances();
        this.showNotification('success', 'Sucesso', 'Manutenção excluída com sucesso!');
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível excluir a manutenção.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  showModal() {
    document.getElementById('maintenanceForm').reset();
    document.getElementById('maintenanceId').value = '';
    document.getElementById('maintenanceModalTitle').textContent = 'Adicionar Manutenção';
    document.getElementById('maintenanceModal').style.display = 'flex';
  }

  closeModal() {
    document.getElementById('maintenanceModal').style.display = 'none';
  }

  populateEquipmentSelect(equipments, selected) {
    const select = document.getElementById('maintenanceEquipmentId');
    select.innerHTML = '<option value="">Selecione um equipamento</option>' +
      equipments.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
  }

  populateEquipmentFilter(equipments) {
    const filter = document.getElementById('equipmentFilter');
    filter.innerHTML = '<option value="">Todos os equipamentos</option>' +
      equipments.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
  }

  filterMaintenances() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const equipmentFilter = document.getElementById('equipmentFilter').value;

    let filtered = this.allMaintenances.filter(maintenance => {
      const matchesSearch = !searchTerm || 
        (maintenance.equipment?.name || '').toLowerCase().includes(searchTerm) ||
        maintenance.description.toLowerCase().includes(searchTerm) ||
        (maintenance.performedBy.name || '').toLowerCase().includes(searchTerm);
      
      const matchesStatus = !statusFilter || maintenance.status === statusFilter;
      const matchesEquipment = !equipmentFilter || maintenance.equipment?.id == equipmentFilter;
      
      return matchesSearch && matchesStatus && matchesEquipment;
    });

    this.renderMaintenances(filtered);
  }



  showNotification(type, title, message) {
    const modal = document.getElementById('notificationModal');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    const okBtn = document.getElementById('notificationOk');

    // Set icon based on type
    icon.className = `notification-icon ${type}`;
    if (type === 'success') {
      icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
    } else if (type === 'error') {
      icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('show');

    okBtn.onclick = () => {
      modal.classList.remove('show');
    };
  }

  showConfirmation(title, message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const titleEl = document.getElementById('confirmationTitle');
    const messageEl = document.getElementById('confirmationMessage');
    const cancelBtn = document.getElementById('confirmationCancel');
    const confirmBtn = document.getElementById('confirmationConfirm');

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('show');

    cancelBtn.onclick = () => modal.classList.remove('show');
    confirmBtn.onclick = () => {
      modal.classList.remove('show');
      onConfirm();
    };
  }
}

const maintenances = new Maintenances();