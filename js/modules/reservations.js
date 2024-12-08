// Data structure for reservations
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

export const initializeReservations = () => {
    const reservationForm = document.getElementById('reservation-form');
    const reservationsContainer = document.getElementById('reservations-container');

    reservationForm.addEventListener('submit', handleNewReservation);
    renderReservations();

    // Update reservation count for dashboard
    updateReservationCount();
};

const handleNewReservation = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newReservation = {
        id: Date.now(),
        name: formData.get('name'),
        guests: parseInt(formData.get('guests')),
        datetime: formData.get('datetime'),
        phone: formData.get('phone'),
        requests: formData.get('requests'),
        status: 'pending'
    };

    reservations.push(newReservation);
    saveReservations();
    renderReservations();
    updateReservationCount();
    
    // Close modal and reset form
    e.target.reset();
    document.getElementById('reservation-modal').classList.remove('active');
};

const renderReservations = () => {
    const container = document.getElementById('reservations-container');
    container.innerHTML = '';

    const sortedReservations = [...reservations].sort((a, b) => 
        new Date(a.datetime) - new Date(b.datetime)
    );

    sortedReservations.forEach(reservation => {
        const card = createReservationCard(reservation);
        container.appendChild(card);
    });
};

const createReservationCard = (reservation) => {
    const card = document.createElement('div');
    card.className = 'reservation-card';
    
    const datetime = new Date(reservation.datetime);
    const formattedDate = datetime.toLocaleDateString();
    const formattedTime = datetime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    card.innerHTML = `
        <div>
            <h3>${reservation.name}</h3>
            <p>Date: ${formattedDate} at ${formattedTime}</p>
            <p>Guests: ${reservation.guests}</p>
            <p>Phone: ${reservation.phone}</p>
            ${reservation.requests ? `<p>Special Requests: ${reservation.requests}</p>` : ''}
            <span class="reservation-status ${reservation.status}">${reservation.status}</span>
        </div>
        <div>
            <button class="btn-secondary" onclick="handleReservationStatus(${reservation.id}, 'confirmed')">
                Confirm
            </button>
            <button class="btn-secondary" onclick="handleReservationStatus(${reservation.id}, 'cancelled')">
                Cancel
            </button>
        </div>
    `;

    return card;
};

export const updateReservationCount = () => {
    const todayReservations = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.datetime);
        const today = new Date();
        return reservationDate.toDateString() === today.toDateString();
    });

    const countElement = document.getElementById('reservation-count');
    if (countElement) {
        countElement.textContent = todayReservations.length;
    }
};

const saveReservations = () => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
};

// Add to window for onclick handlers
window.handleReservationStatus = (id, status) => {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
        reservation.status = status;
        saveReservations();
        renderReservations();
    }
};