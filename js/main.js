import { initializeNavigation } from './modules/navigation.js';
import { initializeReservations } from './modules/reservations.js';
import { initializeOrders } from './modules/orders.js';
import { initializeMenu } from './modules/menu.js';
import { initializeModals } from './modules/modals.js';
import { updateDashboardStats } from './modules/dashboard.js';

// Initialize all modules when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeReservations();
    initializeOrders();
    initializeMenu();
    initializeModals();
    updateDashboardStats();
});