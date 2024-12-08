// Data structure for menu items
let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];

export const initializeMenu = () => {
    const menuForm = document.getElementById('menu-item-form');
    menuForm.addEventListener('submit', handleNewMenuItem);
    
    renderMenu();
    updateMenuCount();
};

const handleNewMenuItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newItem = {
        id: Date.now(),
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description'),
        available: true
    };

    menuItems.push(newItem);
    saveMenu();
    renderMenu();
    updateMenuCount();
    
    // Close modal and reset form
    e.target.reset();
    document.getElementById('menu-item-modal').classList.remove('active');
};

const renderMenu = () => {
    const menuGrid = document.getElementById('menu-grid');
    menuGrid.innerHTML = '';

    // Group items by category
    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    // Render items by category
    Object.entries(groupedItems).forEach(([category, items]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'menu-category';
        categorySection.innerHTML = `<h3 class="category-title">${capitalize(category)}</h3>`;

        items.forEach(item => {
            const card = createMenuItemCard(item);
            categorySection.appendChild(card);
        });

        menuGrid.appendChild(categorySection);
    });
};

const createMenuItemCard = (item) => {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.dataset.itemId = item.id;

    card.innerHTML = `
        <div class="menu-item-content">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                <span class="menu-item-category">${item.category}</span>
            </div>
            <div class="menu-item-actions">
                <button class="btn-secondary" onclick="toggleItemAvailability(${item.id})">
                    ${item.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button class="btn-secondary" onclick="editMenuItem(${item.id})">
                    Edit
                </button>
                <button class="btn-secondary" onclick="deleteMenuItem(${item.id})">
                    Delete
                </button>
            </div>
        </div>
    `;

    return card;
};

export const updateMenuCount = () => {
    const availableItems = menuItems.filter(item => item.available).length;
    const countElement = document.getElementById('menu-count');
    if (countElement) {
        countElement.textContent = availableItems;
    }
};

const saveMenu = () => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
};

// Helper function to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Add to window for onclick handlers
window.toggleItemAvailability = (id) => {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        item.available = !item.available;
        saveMenu();
        renderMenu();
        updateMenuCount();
    }
};

window.editMenuItem = (id) => {
    const item = menuItems.find(i => i.id === id);
    if (item) {
        // Populate form with item data
        const form = document.getElementById('menu-item-form');
        form.elements['name'].value = item.name;
        form.elements['price'].value = item.price;
        form.elements['category'].value = item.category;
        form.elements['description'].value = item.description;
        
        // Show modal
        document.getElementById('menu-item-modal').classList.add('active');
        
        // Update form submission handler to update instead of create
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            item.name = formData.get('name');
            item.price = parseFloat(formData.get('price'));
            item.category = formData.get('category');
            item.description = formData.get('description');
            
            saveMenu();
            renderMenu();
            
            // Reset form and close modal
            form.reset();
            form.onsubmit = handleNewMenuItem;
            document.getElementById('menu-item-modal').classList.remove('active');
        };
    }
};

window.deleteMenuItem = (id) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
        menuItems = menuItems.filter(i => i.id !== id);
        saveMenu();
        renderMenu();
        updateMenuCount();
    }
};