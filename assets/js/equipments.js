class Equipments {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = AuthUtils.checkAuth();
    this.init();
  }

  init() {
    this.allEquipments = [];
    this.setupEventListeners();
    this.loadEquipments();
  }

  setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => AuthUtils.logout());
    document.getElementById('addEquipmentBtn').addEventListener('click', () => this.showModal());
    document.getElementById('equipmentForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.querySelector('.close').addEventListener('click', () => this.closeModal());
    document.getElementById('searchInput').addEventListener('input', () => this.filterEquipments());
    document.getElementById('statusFilter').addEventListener('change', () => this.filterEquipments());
    document.getElementById('typeFilter').addEventListener('change', () => this.filterEquipments());
    window.addEventListener('click', (e) => {
      if (e.target.id === 'equipmentModal') this.closeModal();
    });
  }

  async loadEquipments() {
    try {
      const response = await fetch(`${this.baseURL}/equipments`, {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const equipments = await response.json();
        this.allEquipments = equipments;
        this.renderEquipments(equipments);
        this.populateTypeFilter(equipments);
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível carregar os equipamentos.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  renderEquipments(equipments) {
    const container = document.getElementById('equipmentsList');
    
    if (equipments.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum equipamento encontrado</h3>
          <p>Clique em "Adicionar Equipamento" para criar o primeiro equipamento.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = equipments.map(equipment => {
      const statusClass = equipment.status.toLowerCase().replace('ção', 'maintenance');
      return `
        <article class="equipment-card" role="listitem">
          <div class="equipment-header">
            <h3 class="equipment-title">${equipment.name}</h3>
            <div class="equipment-status">
              <span class="status-badge ${statusClass}">${equipment.status}</span>
            </div>
          </div>
          
          <div class="equipment-info">
            <div class="info-item">
              <span class="info-label">Tipo</span>
              <span class="info-value">${equipment.type}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Localização</span>
              <span class="info-value">${equipment.location}</span>
            </div>
          </div>
          
          ${equipment.description ? `
          <div class="equipment-description">
            ${equipment.description}
          </div>` : ''}
          
          <div class="equipment-actions">
            <button class="btn-edit" onclick="equipments.edit(${equipment.id})" aria-label="Editar equipamento ${equipment.name}">Editar</button>
            <button class="btn-delete" onclick="equipments.delete(${equipment.id})" aria-label="Excluir equipamento ${equipment.name}">Excluir</button>
          </div>
        </article>
      `;
    }).join('');
  }

  async handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('equipmentId').value;
    const equipment = {
      name: document.getElementById('equipmentName').value,
      type: document.getElementById('equipmentType').value,
      description: document.getElementById('equipmentDescription').value,
      location: document.getElementById('equipmentLocation').value,
      status: document.getElementById('equipmentStatus').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${this.baseURL}/equipments/${id}` : `${this.baseURL}/equipments`;

    try {
      const response = await fetch(url, {
        method,
        headers: { ...AuthUtils.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(equipment)
      });

      if (response.ok) {
        this.closeModal();
        this.loadEquipments();
        this.showNotification('success', 'Sucesso', id ? 'Equipamento atualizado com sucesso!' : 'Equipamento criado com sucesso!');
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível salvar o equipamento.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  async edit(id) {
    try {
      const response = await fetch(`${this.baseURL}/equipments/${id}`, {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const equipment = await response.json();
        document.getElementById('equipmentId').value = equipment.id;
        document.getElementById('equipmentName').value = equipment.name;
        document.getElementById('equipmentType').value = equipment.type;
        document.getElementById('equipmentDescription').value = equipment.description || '';
        document.getElementById('equipmentLocation').value = equipment.location;
        document.getElementById('equipmentStatus').value = equipment.status;
        document.getElementById('equipmentModalTitle').textContent = 'Editar Equipamento';
        document.getElementById('equipmentModal').style.display = 'flex';
      }
    } catch (error) {
      this.showNotification('error', 'Erro', 'Não foi possível carregar os dados do equipamento.');
    }
  }

  async delete(id) {
    this.showConfirmation(
      'Excluir Equipamento',
      'Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.',
      async () => {
        await this.performDelete(id);
      }
    );
  }

  async performDelete(id) {
    try {
      const response = await fetch(`${this.baseURL}/equipments/${id}`, {
        method: 'DELETE',
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        this.loadEquipments();
        this.showNotification('success', 'Sucesso', 'Equipamento excluído com sucesso!');
      } else {
        this.showNotification('error', 'Erro', 'Não foi possível excluir o equipamento.');
      }
    } catch (error) {
      this.showNotification('error', 'Erro de Conexão', 'Verifique sua conexão com a internet.');
    }
  }

  showModal() {
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipmentId').value = '';
    document.getElementById('equipmentModalTitle').textContent = 'Adicionar Equipamento';
    document.getElementById('equipmentModal').style.display = 'flex';
  }

  closeModal() {
    document.getElementById('equipmentModal').style.display = 'none';
  }



  populateTypeFilter(equipments) {
    const types = [...new Set(equipments.map(eq => eq.type))].sort();
    const filter = document.getElementById('typeFilter');
    filter.innerHTML = '<option value="">Todos os tipos</option>' +
      types.map(type => `<option value="${type}">${type}</option>`).join('');
  }

  filterEquipments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    let filtered = this.allEquipments.filter(equipment => {
      const matchesSearch = !searchTerm || 
        equipment.name.toLowerCase().includes(searchTerm) ||
        equipment.type.toLowerCase().includes(searchTerm) ||
        equipment.location.toLowerCase().includes(searchTerm) ||
        (equipment.description || '').toLowerCase().includes(searchTerm);
      
      const matchesStatus = !statusFilter || equipment.status === statusFilter;
      const matchesType = !typeFilter || equipment.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    this.renderEquipments(filtered);
  }

  showNotification(type, title, message) {
    const modal = document.getElementById('notificationModal');
    const icon = document.getElementById('notificationIcon');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    const okBtn = document.getElementById('notificationOk');

    icon.className = `notification-icon ${type}`;
    if (type === 'success') {
      icon.innerHTML = '<i data-feather="check-circle"></i>';
    } else if (type === 'error') {
      icon.innerHTML = '<i data-feather="x-circle"></i>';
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('show');
    feather.replace();

    okBtn.onclick = () => modal.classList.remove('show');
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

const equipments = new Equipments();