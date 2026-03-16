# 🦉 ebvg-hoot | Interactive Educational Platform / Plataforma Educativa Interactiva

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28.svg)](https://firebase.google.com/)

*(English version below)*

---

## 🇪🇸 Español

**ebvg-hoot** es una plataforma de aprendizaje interactivo en tiempo real (estilo Kahoot), desarrollada exclusivamente para transformar la educación informática en la Escuela Berta Von Glumer.

Esta aplicación fue construida y refactorizada bajo principios de **Clean Architecture** por Marcus Escalona, Front-End Engineer.

### Arquitectura y Refactorización
El proyecto fue migrado de un prototipo monolítico a una estructura modular profesional orientada a la escalabilidad, utilizando **Vite**:
- **Separación de Responsabilidades (SoC):** La interfaz de usuario (UI), la lógica de negocio y los servicios de backend están estrictamente separados.
- **Custom Hooks:** Toda la lógica compleja de Firebase (WebSockets, Auth, Storage) y el estado del juego se extrajo en hooks reutilizables (`useAuth`, `useKahoots`, `useGameLogic`).
- **Componentes Modulares:** La UI fue dividida en componentes presentacionales limpios organizados por dominio (`common`, `teacher`, `student`, `game`).
- **Optimización de Assets:** Implementación del ecosistema de `three.js` vía NPM para animaciones de fondo de alto rendimiento y Tailwind CSS para un estilizado utility-first.

###  Tecnologías
* **Frontend:** React.js, Tailwind CSS, Three.js (Background Animations), Lucide React (Íconos).
* **Backend as a Service (BaaS):** Firebase (Auth Anónimo, Firestore Database en tiempo real, Cloud Storage).
* **Build Tool:** Vite.

### Instalación Local
1. Clona el repositorio.
2. Ejecuta `npm install` para instalar las dependencias.
3. Configura tus variables de entorno de Firebase en un archivo `.env` (ej. `VITE_FIREBASE_CONFIG`).
4. Ejecuta `npm run dev` para levantar el servidor local.

---

## 🇺🇸 English

**ebvg-hoot** is a real-time interactive learning platform (Kahoot clone), developed exclusively to transform computer science education at the Berta Von Glumer School.

This application was built and refactored following **Clean Architecture** principles by Marcus Escalona, Front-End Engineer.

### Architecture and Refactoring
The project was migrated from a monolithic prototype to a professional, scalable modular structure using **Vite**:
- **Separation of Concerns (SoC):** The user interface (UI), business logic, and backend services are strictly separated.
- **Custom Hooks:** All complex Firebase logic (WebSockets, Auth, Storage) and game state management were extracted into reusable hooks (`useAuth`, `useKahoots`, `useGameLogic`).
- **Modular Components:** The UI was broken down into clean presentational components organized by domain (`common`, `teacher`, `student`, `game`).
- **Asset Optimization:** Implementation of the `three.js` ecosystem via NPM for high-performance background animations and Tailwind CSS for utility-first styling.

### Tech Stack
* **Frontend:** React.js, Tailwind CSS, Three.js (Background Animations), Lucide React (Icons).
* **Backend as a Service (BaaS):** Firebase (Anonymous Auth, Real-time Firestore Database, Cloud Storage).
* **Build Tool:** Vite.

### Local Installation
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your Firebase environment variables in a `.env` file (e.g., `VITE_FIREBASE_CONFIG`).
4. Run `npm run dev` to start the local development server.

---
*Desarrollado con ❤️ para la educación / Developed with ❤️ for education*