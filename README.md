# EquipManager - Equipment Management System

Web system for equipment and maintenance management, developed with HTML, CSS and vanilla JavaScript.

The API will be available at https://equipment-api-ffgzb7gxfxh9cpaj.brazilsouth-01.azurewebsites.net/api-docs/

The Front-End Page will be available at https://ferreira-luc4s.github.io/equip-manager/

## 📋 Features

- **Dashboard**: Overview of equipment and maintenance
- **Equipment Management**: Complete CRUD for equipment
- **Maintenance Management**: Control of preventive and corrective maintenance
- **Authentication**: Secure login system
- **Responsive Interface**: Compatible with mobile devices

## 🚀 Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Feather Icons
- REST API

## 🛠️ Installation and Configuration

### Prerequisites

- Web server (Apache, Nginx, or local server)
- Modern browser with ES6+ support

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend-trabalho
   ```

2. **Configure the API**

   Edit the `assets/js/config.js` file with your API URL:

   ```javascript
   const CONFIG = {
     API_BASE_URL: "https://your-api.com",
     LOGIN_REDIRECT: "login.html",
   };
   ```

3. **Start a local server**

   **Option 1 - Python:**

   ```bash
   python -m http.server 8000
   ```

   **Option 2 - Node.js:**

   ```bash
   npx serve .
   ```

   **Option 3 - PHP:**

   ```bash
   php -S localhost:8000
   ```

4. **Access the application**

   Open your browser and go to: `http://localhost:8000`

## 📁 Project Structure

```
frontend-trabalho/
├── assets/
│   ├── css/
│   │   ├── auth.css          # Authentication styles
│   │   └── style.css         # Main styles
│   └── js/
│       ├── auth-utils.js     # Authentication utilities
│       ├── auth.js           # Login logic
│       ├── config.js         # Application configuration
│       ├── dashboard.js      # Dashboard logic
│       ├── equipments.js     # Equipment management
│       └── maintenances.js   # Maintenance management
├── .github/
│   └── workflows/
│       └── cd.yml           # CI/CD pipeline
├── equipments.html          # Equipment page
├── index.html              # Main dashboard
├── login.html              # Login page
├── maintenances.html       # Maintenance page
└── README.md              # This file
```

## 🔧 Detailed Features

### Dashboard

- Real-time equipment statistics
- Maintenance counters by status
- Quick actions for navigation
- Intuitive and responsive interface

### Equipment

- **Listing**: View all equipment
- **Registration**: Form for new equipment
- **Editing**: Update existing data
- **Deletion**: Removal with confirmation
- **Filters**: Search by name, type or status

### Maintenance

- **Scheduling**: Create new maintenance
- **Tracking**: Status of ongoing maintenance
- **History**: Complete maintenance record
- **Types**: Preventive and corrective

## 🔐 Authentication

The system uses JWT (JSON Web Token) based authentication:

1. **Login**: Credentials are sent to the API
2. **Token**: API returns access token
3. **Storage**: Token saved in localStorage
4. **Validation**: Automatic verification on each request
5. **Logout**: Token cleanup and redirection

## 🚀 Deploy

### GitHub Actions

The project includes a CI/CD pipeline configured in `.github/workflows/cd.yml`:

```yaml
# Automated deployment pipeline
name: Deploy Frontend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # Add deployment steps
```

### Suggested Hosting

- **Netlify**: Automatic deployment via Git
- **Vercel**: GitHub integration
- **GitHub Pages**: Free hosting
- **Azure Static Web Apps**: Azure integration

## 🔧 API Configuration

### Used Endpoints

```javascript
// Authentication
POST /auth/login
POST /auth/logout

// Equipment
GET    /equipments
POST   /equipments
PUT    /equipments/:id
DELETE /equipments/:id

// Maintenance
GET    /maintenances
POST   /maintenances
PUT    /maintenances/:id
DELETE /maintenances/:id
```

### Required Headers

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

## 🧪 Testing

### Manual Tests

1. **Authentication**

   - Login with valid credentials
   - Login with invalid credentials
   - Logout and redirection

2. **Equipment CRUD**

   - Create new equipment
   - List equipment
   - Edit existing equipment
   - Delete equipment

3. **Maintenance CRUD**
   - Schedule maintenance
   - Update status
   - View history

## 🔍 Monitoring and Analytics

## 📞 Support and Contribution

### How to Contribute

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Report Bugs

- Use GitHub Issues
- Include screenshots and logs
- Describe steps to reproduce

## 📄 License

## This project is under the MIT license. See the `LICENSE` file for more details.

**Version**: 1.0.0  
**Last Update**: [Date]  
**Status**: ✅ Production
