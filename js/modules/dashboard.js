import { updateReservationCount } from './reservations.js';
import { updateOrderCount } from './orders.js';
import { updateMenuCount } from './menu.js';

let dashboardRefreshInterval;

export const initializeDashboard = () => {
    // Initial update
    updateDashboardStats();
    setupDashboardRefresh();
    initializeCharts();
    initializeQuickActions();
};

export const updateDashboardStats = () => {
    updateReservationCount();
    updateOrderCount();
    updateMenuCount();
    updateRevenueStats();
    updatePopularItems();
};

const setupDashboardRefresh = () => {
    // Refresh dashboard every 5 minutes
    dashboardRefreshInterval = setInterval(updateDashboardStats, 300000);

    // Clear interval when leaving dashboard view
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(dashboardRefreshInterval);
        } else {
            updateDashboardStats();
            setupDashboardRefresh();
        }
    });
};

const updateRevenueStats = () => {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate today's revenue
    const todayRevenue = orders
        .filter(order => new Date(order.timestamp) >= today)
        .reduce((sum, order) => sum + order.total, 0);

    // Calculate this week's revenue
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekRevenue = orders
        .filter(order => new Date(order.timestamp) >= weekStart)
        .reduce((sum, order) => sum + order.total, 0);

    // Update revenue displays
    const todayRevenueElement = document.getElementById('today-revenue');
    const weekRevenueElement = document.getElementById('week-revenue');

    if (todayRevenueElement) {
        todayRevenueElement.textContent = `$${todayRevenue.toFixed(2)}`;
    }
    if (weekRevenueElement) {
        weekRevenueElement.textContent = `$${weekRevenue.toFixed(2)}`;
    }
};

const updatePopularItems = () => {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const itemCounts = {};

    // Count item occurrences
    orders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    // Sort items by popularity
    const popularItems = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Update popular items list
    const popularItemsList = document.getElementById('popular-items');
    if (popularItemsList) {
        popularItemsList.innerHTML = popularItems
            .map(([name, count]) => `
                <div class="popular-item">
                    <span>${name}</span>
                    <span class="item-count">${count} orders</span>
                </div>
            `)
            .join('');
    }
};

const initializeCharts = () => {
    createRevenueChart();
    createOrdersChart();
};

const createRevenueChart = () => {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
    }).reverse();

    const dailyRevenue = last7Days.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        return orders
            .filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate >= dayStart && orderDate <= dayEnd;
            })
            .reduce((sum, order) => sum + order.total, 0);
    });

    const ctx = document.getElementById('revenue-chart');
    if (ctx) {
        // Implement chart using preferred charting library
        // Example using a simple bar chart
        ctx.innerHTML = createSimpleBarChart(dailyRevenue, last7Days);
    }
};

const createOrdersChart = () => {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        return orders.filter(order => {
            const orderHour = new Date(order.timestamp).getHours();
            return orderHour === hour;
        }).length;
    });

    const ctx = document.getElementById('orders-chart');
    if (ctx) {
        // Implement chart using preferred charting library
        ctx.innerHTML = createSimpleBarChart(hourlyData, 
            Array.from({ length: 24 }, (_, i) => `${i}:00`));
    }
};

const createSimpleBarChart = (data, labels) => {
    const maxValue = Math.max(...data);
    const bars = data.map((value, i) => {
        const height = (value / maxValue) * 100;
        return `
            <div class="chart-bar" style="height: ${height}%;" 
                 title="${labels[i]}: ${value}"></div>
        `;
    }).join('');

    return `
        <div class="chart-container">
            <div class="chart-bars">${bars}</div>
            <div class="chart-labels">
                ${labels.map(label => `<div class="chart-label">${label}</div>`).join('')}
            </div>
        </div>
    `;
};

const initializeQuickActions = () => {
    const quickActionsContainer = document.getElementById('quick-actions');
    if (quickActionsContainer) {
        quickActionsContainer.innerHTML = `
            <button class="btn-primary" onclick="openModal('reservation-modal')">
                New Reservation
            </button>
            <button class="btn-primary" onclick="openModal('menu-item-modal')">
                Add Menu Item
            </button>
            <button class="btn-primary" id="export-data">
                Export Data
            </button>
        `;

        // Add export functionality
        document.getElementById('export-data')?.addEventListener('click', exportRestaurantData);
    }
};

const exportRestaurantData = () => {
    const data = {
        reservations: JSON.parse(localStorage.getItem('reservations')) || [],
        orders: JSON.parse(localStorage.getItem('orders')) || [],
        menuItems: JSON.parse(localStorage.getItem('menuItems')) || [],
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};