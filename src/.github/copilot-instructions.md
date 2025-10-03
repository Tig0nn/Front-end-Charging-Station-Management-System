<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# EV Charging Station Management System

This is a ReactJS web application for electric vehicle charging station management. The project uses:

- **React** 19.1.1 with modern hooks and components
- **React-Bootstrap** for UI components
- **Tailwind CSS v4** for styling and responsive design
- **React Router** (latest version) for navigation
- **Axios** for API communication
- **Vite** as build tool

## Project Features

### 1. EV Driver Features

- **Registration & Account Management**
  - User registration/login via email
  - Profile management: personal info, vehicle details, transaction history
- **Booking & Charging Session**
  - Map view of charging stations with location, power capacity, status (available/occupied)
  - Connector types (CCS, CHAdeMO, AC), charging speed, pricing
  - QR code scanning to start charging
  - Real-time charging status (SOC %, remaining time, cost)
  - Notifications when charging complete
- **Payment & E-wallet**
  - Payment by kWh, time-based, or subscription plans
  - Online payment (e-wallet, banking)
  - Electronic invoices
- **History & Personal Analytics**
  - Monthly charging cost reports
  - Charging habit analysis: location patterns, time preferences, power usage

### 2. Charging Station Staff Features

- **On-site Payment Management**
  - Control charging session start/stop
  - Process on-site payment transactions
- **Monitoring & Reporting**
  - Monitor charging point status (online/offline, power capacity)
  - Report station incidents and issues

### 3. Admin Features

- **Station & Charging Point Management**
  - Monitor all charging stations and points status
  - Remote control: start/stop operations
- **User & Service Package Management**
  - Manage individual/corporate customers
  - Create subscription packages: pay-now, post-paid
  - Staff permission management
- **Reports & Analytics**
  - Revenue tracking by station, region, time period
  - Usage frequency reports, peak hour analysis

## Development Guidelines

When working on this project:

- Use React-Bootstrap components for consistent UI elements
- Apply Tailwind CSS classes for custom styling and responsive design
- Implement proper React Router navigation between pages
- Follow RESTful API patterns with Axios
- Maintain responsive design for mobile and desktop
- Use modern React patterns (hooks, functional components)
- Implement proper error handling and loading states
- Follow accessibility best practices

## File Structure

- `/src/components/` - Reusable UI components
- `/src/pages/` - Main application pages
- `/src/libs/` - API services and utilities
- `/src/utils/` - Helper functions
- `/src/assets/` - Static assets (images, icons)

Focus on creating scalable, maintainable code that handles the complex requirements of EV charging station management while providing excellent user experience for drivers, staff, and administrators.
