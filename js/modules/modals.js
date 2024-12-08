export const initializeModals = () => {
    // Initialize all modal triggers
    const modalTriggers = document.querySelectorAll('[id$="-btn"]');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.id.replace('-btn', '-modal');
            openModal(modalId);
        });
    });

    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });

    // Prevent event propagation from modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Initialize form validation
    initializeFormValidation();
};

const initializeFormValidation = () => {
    const forms = document.querySelectorAll('.modal form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                showFormErrors(form);
            }
        });

        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                validateField(input);
            });

            input.addEventListener('blur', () => {
                validateField(input);
            });
        });
    });
};

const validateField = (field) => {
    const errorElement = field.nextElementSibling?.classList.contains('error-message') 
        ? field.nextElementSibling 
        : document.createElement('div');
    
    if (!errorElement.classList.contains('error-message')) {
        errorElement.classList.add('error-message');
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = field.validationMessage;
    errorElement.style.display = field.validationMessage ? 'block' : 'none';

    // Add/remove error class
    field.classList.toggle('error', !field.validity.valid);
};

const showFormErrors = (form) => {
    form.querySelectorAll('input, select, textarea').forEach(field => {
        validateField(field);
    });
};

export const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Close any other open modals
        document.querySelectorAll('.modal.active').forEach(m => {
            if (m.id !== modalId) {
                closeModal(m.id);
            }
        });

        modal.classList.add('active');
        
        // Reset form if modal contains a form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Clear any existing error messages
            form.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });
            form.querySelectorAll('.error').forEach(field => {
                field.classList.remove('error');
            });
        }

        // Focus first input if present
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }

        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }
};

export const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        // Re-enable body scroll if no other modals are open
        if (!document.querySelector('.modal.active')) {
            document.body.style.overflow = '';
        }

        // Clear form data and errors
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            form.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });
            form.querySelectorAll('.error').forEach(field => {
                field.classList.remove('error');
            });
        }

        // Trigger custom event for cleanup
        modal.dispatchEvent(new CustomEvent('modalClose'));
    }
};

// Export utility functions for dynamic modal creation
export const createDynamicModal = (options) => {
    const { id, title, content, onConfirm, onCancel } = options;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;

    modal.innerHTML = `
        <div class="modal-content">
            ${title ? `<h3>${title}</h3>` : ''}
            <div class="modal-body">${content}</div>
            <div class="modal-footer">
                ${onConfirm ? '<button class="btn-primary confirm-btn">Confirm</button>' : ''}
                ${onCancel ? '<button class="btn-secondary cancel-btn">Cancel</button>' : ''}
            </div>
        </div>
    `;

    // Add event listeners
    if (onConfirm) {
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            onConfirm();
            closeModal(id);
        });
    }

    if (onCancel) {
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            onCancel();
            closeModal(id);
        });
    }

    document.body.appendChild(modal);
    return modal;
};