class Dashboard {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = AuthUtils.checkAuth();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadCounts();
  }

  setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => AuthUtils.logout());
  }

  async loadCounts() {
    try {
      const [equipmentsRes, maintenancesRes] = await Promise.all([
        fetch(`${this.baseURL}/equipments`, { headers: AuthUtils.getAuthHeaders() }),
        fetch(`${this.baseURL}/maintenances`, { headers: AuthUtils.getAuthHeaders() })
      ]);

      if (equipmentsRes.ok) {
        const equipments = await equipmentsRes.json();
        this.updateEquipmentStats(equipments);
      }

      if (maintenancesRes.ok) {
        const maintenances = await maintenancesRes.json();
        this.updateMaintenanceStats(maintenances);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      this.showError();
    }
  }

  updateEquipmentStats(equipments) {
    const total = equipments.length;
    const active = equipments.filter(eq => eq.status === 'Ativo').length;
    const maintenance = equipments.filter(eq => eq.status === 'Manutenção').length;
    
    document.getElementById('equipmentCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('maintenanceEquipCount').textContent = maintenance;
  }

  updateMaintenanceStats(maintenances) {
    const total = maintenances.length;
    const pending = maintenances.filter(m => m.status === 'pending').length;
    const inProgress = maintenances.filter(m => m.status === 'in-progress').length;
    const completed = maintenances.filter(m => m.status === 'completed').length;
    
    document.getElementById('maintenanceCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('completedCount').textContent = completed;
  }

  showError() {
    document.getElementById('equipmentCount').textContent = '0';
    document.getElementById('maintenanceCount').textContent = '0';
    document.getElementById('activeCount').textContent = '0';
    document.getElementById('maintenanceEquipCount').textContent = '0';
    document.getElementById('pendingCount').textContent = '0';
    document.getElementById('inProgressCount').textContent = '0';
    document.getElementById('completedCount').textContent = '0';
  }


}

new Dashboard();