# EduTrack Pro - Full-Stack Student Management System

A complete, modern, responsive full-stack **Student Management System** built with **HTML5, CSS3, Vanilla JavaScript** on the frontend, and **Spring Boot, Spring Data JPA, and MySQL** on the backend.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                       │
│  - Port 5500 (Live Server) or direct file opening           │
│  - Responsive UI, Dashboard metrics, Modals, Light/Dark mode│
│  - Vanilla JavaScript async fetch() API calls               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (CORS Enabled)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Spring Boot Backend (Port 8080)               │
│                                                             │
│  [StudentController]  --> REST endpoints (/api/students)    │
│           │                                                 │
│  [StudentService]     --> Validation & ID generation logic  │
│           │                                                 │
│  [StudentRepository]  --> Spring Data JPA                   │
│           │                                                 │
│  [Student Entity]     --> JPA ORM Mapping                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               MySQL Database (Port 3306)                    │
│  Database: student_management                               │
│  Table: students (Auto-created & updated by Hibernate)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Directory Structure

```
student-management-system/
│
├── frontend/                     # Modern responsive frontend client
│   ├── index.html                # Semantic HTML5 layout with Dashboard & Modals
│   ├── style.css                 # Responsive design system with Light/Dark mode
│   └── script.js                 # Vanilla JS REST client with async fetch()
│
├── backend/                      # Spring Boot REST API backend
│   ├── pom.xml                   # Maven dependencies (Web, JPA, MySQL, Validation)
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/studentmanagement/sms/
│           │       ├── StudentManagementApplication.java  # App entry & sample seeder
│           │       ├── controller/
│           │       │   └── StudentController.java         # CRUD REST Endpoints & CORS
│           │       ├── model/
│           │       │   └── Student.java                   # JPA Student Entity
│           │       ├── repository/
│           │       │   └── StudentRepository.java         # Spring Data JPA Repository
│           │       ├── service/
│           │       │   └── StudentService.java            # Business logic & auto-ID
│           │       └── exception/
│           │           ├── ResourceNotFoundException.java # 404 Exception
│           │           └── GlobalExceptionHandler.java    # JSON error formatting
│           │
│           └── resources/
│               └── application.properties                 # MySQL connection settings
│
├── database.sql                  # Optional manual MySQL creation & sample data script
└── README.md                     # Comprehensive setup, run, and API documentation
```

---

## 📋 1. Prerequisites

Before running the application, make sure you have the following installed:

1. **Java Development Kit (JDK 17 or higher)**
   - Check version in terminal:
     ```bash
     java -version
     ```
2. **Apache Maven (3.8+)**
   - Check version:
     ```bash
     mvn -version
     ```
     *(If Maven is not installed globally, you can install it or use VS Code / IntelliJ / Eclipse Maven tooling).*
3. **MySQL Server (8.0 or higher)**
   - Ensure MySQL service is running on port `3306`.
4. **Web Browser** (Chrome, Edge, Firefox, Brave, etc.)
5. **Code Editor** (VS Code with *Live Server* extension, or IntelliJ IDEA / Eclipse)

---

## 🗄️ 2. Database Setup

You have two easy ways to set up the MySQL database:

### Option A: Automatic Creation (Recommended)
Spring Boot is configured with `createDatabaseIfNotExist=true`. If your MySQL root user has database creation privileges, Spring Boot will automatically create the `student_management` database and the `students` table when it boots up!

### Option B: Manual Creation using `database.sql`
If you prefer creating the database manually, open MySQL Command Line Client or MySQL Workbench and run:
```sql
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;
```
Or execute the included [database.sql](database.sql) file directly.

---

## ⚙️ 3. Configure MySQL Password

Open the file [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties).

Locate the line:
```properties
# >>> IMPORTANT: ENTER YOUR MYSQL ROOT PASSWORD HERE <<<
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL `root` password. For example:
```properties
spring.datasource.password=root123
```
*(If your MySQL user is not `root`, update `spring.datasource.username` accordingly).*

---

## 🚀 4. Run the Spring Boot Backend

1. Open your terminal or Command Prompt.
2. Navigate to the `backend` folder:
   ```bash
   cd "backend"
   ```
3. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *(Or in IntelliJ / Eclipse, right-click `StudentManagementApplication.java` and select **Run**).*

4. When started, you will see Spring Boot logs ending with:
   ```
   Tomcat started on port 8080 (http) with context path '/'
   >>> Sample students seeded successfully into MySQL database.
   Started StudentManagementApplication in ... seconds
   ```
   The backend is now live at **`http://localhost:8080`**!

---

## 🌐 5. Run the Frontend

You can run the frontend in two ways:

### Option A: VS Code Live Server (Recommended)
1. Open the project in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
3. Right-click on [frontend/index.html](frontend/index.html) and select **"Open with Live Server"**.
4. The application will open automatically at:
   ```
   http://localhost:5500/frontend/index.html
   ```

### Option B: Direct Browser Opening
Simply double-click on [frontend/index.html](frontend/index.html) (or [index.html](index.html)) to open it in your web browser.

---

## 📡 6. REST API Endpoints

The Spring Boot backend exposes clean REST endpoints under `/api/students`:

| Method | Endpoint | Description | Request Body | Response Status |
|---|---|---|---|---|
| `GET` | `/api/students` | Get all students from MySQL | None | `200 OK` (Array) |
| `GET` | `/api/students/{id}` | Get student by database ID | None | `200 OK` (Student object) |
| `GET` | `/api/students/next-id` | Get next auto-generated Student ID | None | `200 OK` (`{"nextId": "STU-1004"}`) |
| `POST` | `/api/students` | Register and persist new student | JSON Student object | `201 Created` |
| `PUT` | `/api/students/{id}` | Update existing student in-place | JSON Student object | `200 OK` |
| `DELETE` | `/api/students/{id}` | Delete student from MySQL | None | `200 OK` (`{"message": "..."}`) |

### Sample JSON Payloads

#### Add Student (`POST /api/students`):
```json
{
  "name": "Rahul Kumar",
  "department": "CSE",
  "year": "1st Year",
  "email": "rahul@gmail.com",
  "phone": "9876543210"
}
```
*Note: The backend automatically computes and assigns the next unique `studentId` (e.g. `STU-1004`).*

#### Update Student (`PUT /api/students/1`):
```json
{
  "name": "Rahul Kumar",
  "department": "IT",
  "year": "2nd Year",
  "email": "rahul.kumar@gmail.com",
  "phone": "9876543210"
}
```
*Note: The existing `studentId` (`STU-1001`) is strictly preserved and cannot be altered.*

---

## 🛠️ 7. Troubleshooting Guide

### 1. MySQL Connection Error (`Access denied for user 'root'@'localhost'`)
- **Cause**: The password specified in `application.properties` does not match your MySQL root password.
- **Fix**: Open `backend/src/main/resources/application.properties` and verify `spring.datasource.password`. Test logging into MySQL from terminal using:
  ```bash
  mysql -u root -p
  ```

### 2. Connection Refused (`Communications link failure / Connection refused: connect`)
- **Cause**: MySQL server is not running on port `3306`.
- **Fix**: Open Windows Services (`services.msc`), find **MySQL80** (or **MySQL**), and ensure its Status is **Running**.

### 3. Port 8080 already in use
- **Cause**: Another application is using port `8080`.
- **Fix**: Change the port in `backend/src/main/resources/application.properties`:
  ```properties
  server.port=8081
  ```
  Then in `frontend/script.js`, change:
  ```javascript
  const API_BASE_URL = 'http://localhost:8081/api/students';
  ```

### 4. CORS Errors in Browser Console
- **Cause**: Frontend origin was blocked by backend security.
- **Fix**: The backend controller is already pre-configured with:
  ```java
  @CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000", "*"})
  ```
  If you run your frontend on a custom host or port, add your origin to the `@CrossOrigin` annotation in `StudentController.java`.

### 5. "Unable to connect to the server" Toast in Frontend
- **Cause**: The Spring Boot backend is not running yet.
- **Fix**: Make sure you have executed `mvn spring-boot:run` in the `backend` folder and it is actively listening on port 8080.

---

## 🎓 8. Key Features Overview

- **Real-Time Dashboard**: Automatically computes Total Students, Total Programs, and Year counts from MySQL records.
- **Auto-Generated Student IDs**: Predictable, sequential IDs (`STU-1001`, `STU-1002`...).
- **Dual Validation**: Client-side feedback (instant) + Server-side Bean Validation (`@NotBlank`, `@Email`, regex checks).
- **In-Place Editing**: Loads student into the form without altering ID; updates record in MySQL.
- **Safe Deletion**: Interactive modal confirmation before removing records.
- **Search & Filters**: Instant client-side search across all fields combined with Department & Year filters.
- **Theme Toggle**: Light / Dark mode switcher persisted in `localStorage`.
- **CSV Export**: One-click download of the active student table.
