// Data structure for orders
let orders = JSON.parse(localStorage.getItem('orders')) || [];

export const initializeOrders = () => {
    renderOrders();
    updateOrderCount();

    // Set up event delegation for order actions
    document.getElementById('active-orders').addEventListener('click', handleOrderAction);
};

const handleOrderAction = (e) => {
    if (e.target.matches('[data-action]')) {
        const orderId = parseInt(e.target.closest('.order-card').dataset.orderId);
        const action = e.target.dataset.action;
        
        switch(action) {
            case 'complete':
                completeOrder(orderId);
                break;
            case 'cancel':
                cancelOrder(orderId);
                break;
        }
    }
};

export const createOrder = (menuItems, tableNumber) => {
    const newOrder = {
        id: Date.now(),
        items: menuItems,
        tableNumber,
        status: 'pending',
        timestamp: new Date().toISOString(),
        total: calculateTotal(menuItems)
    };

    orders.push(newOrder);
    saveOrders();
    renderOrders();
    updateOrderCount();
};

const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const completeOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        saveOrders();
        renderOrders();
        updateOrderCount();
    }
};

const cancelOrder = (orderId) => {
    orders = orders.filter(o => o.id !== orderId);
    saveOrders();
    renderOrders();
    updateOrderCount();
};

const renderOrders = () => {
    const activeOrders = document.getElementById('active-orders');
    const completedOrders = document.getElementById('completed-orders');
    
    // Clear existing orders
    activeOrders.innerHTML = '<h3>Active Orders</h3>';
    completedOrders.innerHTML = '<h3>Completed Orders</h3>';

    orders.forEach(order => {
        const card = createOrderCard(order);
        if (order.status === 'completed') {
            completedOrders.appendChild(card);
        } else {
            activeOrders.appendChild(card);
        }
    });
};

const createOrderCard = (order) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.orderId = order.id;

    const timestamp = new Date(order.timestamp);
    const timeString = timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    card.innerHTML = `
        <div class="order-header">
            <h4>Table ${order.tableNumber}</h4>
            <span class="order-time">${timeString}</span>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        <div class="order-footer">
            <span class="order-total">Total: $${order.total.toFixed(2)}</span>
            <span class="order-status status-${order.status}">${order.status}</span>
            ${order.status === 'pending' ? `
                <button class="btn-primary" data-action="complete">Complete</button>
                <button class="btn-secondary" data-action="cancel">Cancel</button>
            ` : ''}
        </div>
    `;

    return card;
};

export const updateOrderCount = () => {
    const activeOrdersCount = orders.filter(order => order.status === 'pending').length;
    const countElement = document.getElementById('order-count');
    if (countElement) {
        countElement.textContent = activeOrdersCount;
    }
};

const saveOrders = () => {
    localStorage.setItem('orders', JSON.stringify(orders));
};