# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Setup
```bash
# Install dependencies
npm install

# Start backend API server (port 5024)
npm start

# Start frontend development server (port 5020)
npm run start:frontend

# Alternative frontend servers using Python
npm run serve        # Python on port 5020
npm run serve:8000  # Python on port 8000
npm run serve:3000  # Python on port 3000
```

### Testing and Debugging
- Access the application at http://localhost:5020
- API endpoints available at http://localhost:5024/api
- Browser console debugging enabled with global instances: `window.fileManager`, `window.tabManager`
- Use F12 developer tools for debugging; major modules expose their instances globally

### Production
```bash
# No build process needed - static frontend
npm run build        # Shows no-build message
```

## Architecture Overview

This is a full-stack online programming education platform with dual deployment modes:

### Frontend Architecture
- **Pure JavaScript ES6+** - No frameworks, native DOM manipulation
- **CodeMirror 6** - Core code editor with syntax highlighting for HTML/CSS/JS
- **Modular ES6 imports** - Clean separation of concerns in `js/` directory
- **Real-time preview** - Live code compilation with 400ms debounce
- **VSCode-style UI** - Familiar interface with panels and file tree

### Backend Architecture
- **Express.js API server** (port 5024) with automatic fallback mode
- **MySQL database** (programming_platform) with seamless in-memory fallback
- **bcrypt authentication** - Secure password hashing for all user roles
- **RESTful APIs** - `/api/users/*`, `/api/courses/*`, `/api/assignments/*` endpoints
- **DatabaseManager.js** - Centralized API client for backend communication

### Key Module System

#### Core Application (`main.js`)
- **Entry point** that orchestrates all modules
- **Component initialization** - File manager, editors, console, preview
- **Assignment context detection** - Handles educational workflow

#### Code Editor System
- **Editor.js** - CodeMirror 6 wrapper with multiple language panels
- **Preview.js** - Real-time iframe compilation with console capture
- **FileManager.js** - Virtual file system with tree structure
- **TabManager.js** - Multi-file editing interface

#### Educational Features
- **UserAuth.js** - Role-based authentication with localStorage session management
- **CourseManager.js** - Course creation, enrollment, and management
- **AssignmentManager.js** - Assignment creation, submission, and grading workflow
- **Router.js** - Client-side routing with permission-based access control
- **PermissionManager.js** - Centralized role-based access control (RBAC)
- **CodeRepository.js** - Educational code examples and template sharing

#### Code Management
- **TemplateManager.js** - Reusable code templates
- **AIAssistant.js** - AI-powered code generation
- **ExportManager.js** - Project packaging and download

### Database and Storage Strategy

#### Dual Mode Operation
1. **Database Mode** - Full MySQL integration with persistent storage
2. **Fallback Mode** - In-memory operation for development/demo

#### Storage Layers
- **localStorage** - Frontend settings and temporary data
- **MySQL** - Production data persistence
- **In-memory fallback** - Development without database setup

### Role-Based Permission System

#### User Roles
- **Admin**: Full system access, user management
- **Teacher**: Course management, assignment creation, grading
- **Student**: Course enrollment, assignment submission

#### Permission Implementation
- **PermissionManager.js** - Centralized permission checking
- **Router.js** - Route-level authorization
- **UI element visibility** - Role-based interface adaptation

### Educational Workflow Architecture

#### Teacher Workflow
1. Create courses and manage enrollments
2. Design assignments with code templates
3. Review and grade student submissions
4. Share code examples and templates

#### Student Workflow
1. Browse and enroll in courses
2. Complete coding assignments with real-time feedback
3. Submit work through integrated editor
4. View grades and feedback

### Code Editor Integration

#### Multi-Panel Design
- **HTML Panel** - Structure and content
- **CSS Panel** - Styling and layout
- **JS Panel** - Functionality and interactivity

#### Compilation System
- **400ms debounce** - Prevent excessive compilation
- **Console capture** - Log output from iframe preview
- **Error handling** - Graceful failure with user feedback

## Important Implementation Details

### Frontend Module Dependencies
- All modules use ES6 import/export syntax
- Main.js imports and initializes all components
- Global instances exposed for debugging: `window.fileManager`, `window.tabManager`

### Backend Fallback Mode
- Automatic MySQL connection detection with graceful fallback
- Pre-configured test accounts: admin/123123, teacher1/123123, student1/123123
- In-memory user management for development without database setup
- Full feature availability in both database and fallback modes

### File System Structure
- Virtual file tree mimics real IDE structure
- Automatic file type detection and editor assignment
- Persistent storage in localStorage

### Educational Integration
- Assignment context detection from URL parameters
- Template system for educational code examples
- Student submission tracking and grading workflow

### API Endpoints Structure
- `/api/users/*` - Authentication and user management
- `/api/courses/*` - Course operations
- `/api/assignments/*` - Assignment management
- Fallback endpoints for database-less operation

### Development Considerations
- **No build process** - Direct file editing and browser refresh
- **Live reloading** - Changes visible immediately after refresh
- **Browser debugging** - All major instances exposed globally (`window.*`)
- **Cross-browser compatibility** - Modern browser support (Chrome, Firefox, Safari, Edge)
- **Windows development** - Project designed for Windows environments but cross-platform compatible

## Key Files for Quick Understanding

### Essential Entry Points
- **main.html** - Primary application interface with VSCode-style layout
- **api_server.js** - Express backend with database/fallback modes
- **js/main.js** - Frontend application orchestrator and component initialization

### Core Modules to Understand
- **js/database.js** - API communication layer for all backend operations
- **js/userAuth.js** - Authentication flow and session management
- **js/router.js** - Client-side routing with role-based access control
- **js/permissionManager.js** - RBAC implementation for UI element visibility

### Development Workflow
1. Backend automatically detects MySQL availability on startup
2. Frontend initializes modules through main.js import chain
3. Authentication state managed in localStorage with session persistence
4. All module interactions use ES6 import/export with shared global instances
5. Real-time preview updates use 400ms debounce to prevent excessive compilation