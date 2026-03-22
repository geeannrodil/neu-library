# 🏛️ NEU Library Visitor System

A modern, secure, and fully responsive web application designed for New Era University to manage library visitor logs, track daily statistics, and enforce access control.

![UI Theme](https://img.shields.io/badge/UI_Theme-Glassmorphism-bb86fc?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-2ecc71?style=flat-square)

## 🔗 Links
* **Live Application:** [https://neu-library.onrender.com](https://neu-library.onrender.com)
* **GitHub Repository:** [https://github.com/geeannrodil/neu-library](https://github.com/geeannrodil/neu-library)

## ✨ Key Features

### 🔒 Secure Authentication & Access Control
* **Google Identity Services:** Seamless one-tap login using Google accounts.
* **Domain Restriction:** Strictly limits access to official `@neu.edu.ph` email addresses. Personal accounts are automatically rejected.
* **Role-Based Routing:** The system automatically identifies Admin accounts and routes them to the Dashboard, while standard users are routed to the Visitor Check-in.

### 💻 Visitor Check-In Experience
* **Modern UI/UX:** Features a sleek, dark-mode "Glassmorphism" aesthetic with a live, real-time digital clock.
* **Interactive Feedback:** Replaced standard browser alerts with beautiful, animated **SweetAlert2** popups.
* **Categorized Logging:** Captures visitor name, email, user type (Student/Faculty), program/course, and purpose of visit.

### 📊 Admin Dashboard & Analytics
* **Live Statistics:** Tracks daily, weekly, monthly, and total visitor counts.
* **Real-Time Global Search:** Instantly filter the visitor logs by name, course, user type, or reason without refreshing the page.
* **User Management:** Admins can actively "Block" or "Unblock" users. Blocked users are restricted from checking in and are moved to a dedicated management table.
* **PDF Export:** One-click generation of beautifully formatted PDF reports using `jsPDF`, complete with the university's color theme.

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Authentication:** Google Identity Services (OAuth 2.0)
* **Libraries:** * [SweetAlert2](https://sweetalert2.github.io/) (Animated Modals)
  * [jsPDF](https://parall.ax/products/jspdf) (PDF Generation)
  * [FontAwesome](https://fontawesome.com/) (UI Icons)
* **Deployment:** Render

## 🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/geeannrodil/neu-library.git](https://github.com/geeannrodil/neu-library.git)
