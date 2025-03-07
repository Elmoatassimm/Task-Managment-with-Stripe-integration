
# Task Management Web Application with Payment Integration

This project is a **full-stack task web app** built with **Laravel (backend)** and **React.js (frontend)**, featuring user authentication, task CRUD operations, and **Stripe payment integration** for premium features like task prioritization. Key highlights include:

- **CI/CD Pipeline with GitHub Actions**: Automated testing and deployment workflows  
- **JWT Authentication**: Secure token-based user authentication  
- **Clean API Design**: Well-structured RESTful API  
- **Feature Tests with PEST**: Robust test coverage  
- **Laravel Queues**: Asynchronous email processing  
- **Stripe Integration**: Premium feature unlocking  

---

## Setup Instructions

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Elmoatassimm/Task-Managment-with-Stripe-integration.git
   cd Task-Managment-with-Stripe-integration
  

2. **Backend Setup**:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret

   

3. **Configure Database**:
   - Update `.env` with your credentials:
     ```env
     DB_DATABASE=your_db_name
     DB_USERNAME=your_db_user
     DB_PASSWORD=your_db_password
     ```

4. **Database Setup**:
   ```bash
   php artisan migrate
   ```

5. **Configure Queues**:
   - Set queue driver in `.env`:
     ```env
     QUEUE_CONNECTION=database
     ```
   - Create jobs table:
     ```bash
     php artisan queue:table
     php artisan migrate
     ```

6. **Mail Configuration**:
   - Update `.env` with your mail settings (example for SMTP):
     ```env
     MAIL_MAILER=smtp
     MAIL_HOST=mailpit
     MAIL_PORT=1025
     MAIL_USERNAME=null
     MAIL_PASSWORD=null
     MAIL_ENCRYPTION=null
     MAIL_FROM_ADDRESS="hello@example.com"
     MAIL_FROM_NAME="${APP_NAME}"
     ```
   


7. **Frontend Setup**:
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   ```

8. **Configure Stripe Keys**:
   - Backend `.env`:
     ```env
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_PUBLIC_KEY=your_stripe_public_key
     ```
   - Frontend `.env.local`:
     ```env
     VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
     ```

9. **Start Queue Worker** (in a new terminal):
   ```bash
   php artisan queue:work
   ```


10. **Run Servers**:
    - Backend (from `/backend`):
      ```bash
      php artisan serve
      ```
    - Frontend (from `/frontend`):
      ```bash
      npm run dev
      ```

11. **Access Application**:
    - Frontend: `http://localhost:5173`
    - API: `http://localhost:8000/api`

---

## API Endpoints

| Endpoint                 | Method | Auth Required | Description                               |
|--------------------------|--------|---------------|-------------------------------------------|
| **Authentication**       |        |               |                                           |
| `/auth/register`         | POST   | No            | User registration                         |
| `/auth/login`            | POST   | No            | User login                                |
| `/auth/me`               | GET    | Yes           | Get authenticated user details            |
| `/auth/logout`           | POST   | Yes           | Logout user                               |
| `/auth/refresh`          | POST   | Yes           | Refresh JWT token                         |
| **Task Management**      |        |               |                                           |
| `/tasks`                 | GET    | Yes           | List all tasks                            |
| `/tasks`                 | POST   | Yes           | Create task (priority requires payment)   |
| `/tasks/{task}`          | PUT    | Yes           | Update task                               |
| `/tasks/{task}`          | DELETE | Yes           | Delete task                               |
| **Payments**             |        |               |                                           |
| `/create-payment-intent` | GET    | Yes           | Initiate Stripe payment                   |
| `/stripe/webhook`        | POST   | No            | Handle Stripe events                      |

---
