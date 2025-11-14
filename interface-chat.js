// Chat Interface Builder JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const step1Btn = document.getElementById('step1Btn');
    const step2Btn = document.getElementById('step2Btn');
    const stepPanel1 = document.getElementById('stepPanel1');
    const stepPanel2 = document.getElementById('stepPanel2');
    const backBtn = document.getElementById('backBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const backStepBtn = document.getElementById('backStepBtn');
    const nextBtn = document.getElementById('nextBtn');
    const saveBtn = document.getElementById('saveBtn');
    const interfaceNameInput = document.getElementById('interfaceName');
    const starterMessageTextarea = document.getElementById('starterMessage');
    const addButtonLink = document.getElementById('addButtonLink');
    const buttonsContainer = document.getElementById('buttonsContainer');
    const textInputEnabled = document.getElementById('textInputEnabled');
    const toggleStatus = document.querySelector('.toggle-status');

    let currentStep = 1;
    let buttonCounter = 0;

    // Step navigation
    function goToStep(stepNumber) {
        // Update stepper buttons
        const stepperItems = document.querySelectorAll('.stepper-item');
        stepperItems.forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.step) === stepNumber) {
                item.classList.add('active');
            }
        });

        // Update step panels
        const stepPanels = document.querySelectorAll('.step-panel');
        stepPanels.forEach((panel, index) => {
            panel.classList.remove('active');
            if (index + 1 === stepNumber) {
                panel.classList.add('active');
            }
        });

        currentStep = stepNumber;

        // Update footer buttons
        updateFooterButtons();
    }

    function updateFooterButtons() {
        if (currentStep === 1) {
            backStepBtn.style.display = 'none';
            nextBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
        } else if (currentStep === 2) {
            backStepBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'none';
            saveBtn.style.display = 'inline-flex';
        }
    }

    // Stepper button clicks
    step1Btn.addEventListener('click', function() {
        goToStep(1);
    });

    step2Btn.addEventListener('click', function() {
        goToStep(2);
    });

    // Next button
    nextBtn.addEventListener('click', function() {
        // Validate current step
        if (currentStep === 1) {
            const interfaceName = interfaceNameInput.value.trim();
            if (!interfaceName) {
                alert('Please enter an interface name');
                interfaceNameInput.focus();
                return;
            }
        }

        // Go to next step
        if (currentStep < 2) {
            goToStep(currentStep + 1);
        }
    });

    // Back step button
    backStepBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    // Back button (go to previous page)
    backBtn.addEventListener('click', function() {
        // Navigate back to project page
        if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
            window.location.href = 'project.html';
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            window.location.href = 'project.html';
        }
    });

    // Save button
    saveBtn.addEventListener('click', function() {
        // Collect form data
        const buttons = [];
        const buttonItems = buttonsContainer.querySelectorAll('.button-form-item');

        buttonItems.forEach(item => {
            const labelInput = item.querySelector('.button-label-input');
            const agentSelect = item.querySelector('.button-agent-select');
            const promptTextarea = item.querySelector('.button-prompt-textarea');

            if (labelInput && agentSelect && promptTextarea) {
                buttons.push({
                    label: labelInput.value.trim(),
                    agent: agentSelect.value,
                    prompt: promptTextarea.value.trim()
                });
            }
        });

        const formData = {
            interfaceName: interfaceNameInput.value.trim(),
            starterMessage: starterMessageTextarea.value.trim(),
            textInputEnabled: textInputEnabled.checked,
            selectedAgent: document.getElementById('selectAgentConfig').value,
            quickActionButtons: buttons
        };

        // Validate Step 1
        if (!formData.interfaceName) {
            alert('Please enter an interface name');
            goToStep(1);
            interfaceNameInput.focus();
            return;
        }

        // Validate Step 2
        if (!formData.selectedAgent) {
            alert('Please select an agent');
            document.getElementById('selectAgentConfig').focus();
            return;
        }

        // Validate buttons
        for (let i = 0; i < buttons.length; i++) {
            if (!buttons[i].label || !buttons[i].agent || !buttons[i].prompt) {
                alert(`Please complete all fields for Button ${i + 1}`);
                return;
            }
        }

        // Log form data (in production, this would be sent to a server)
        console.log('Saving chat interface:', formData);

        // Show success message
        showNotification('Chat interface saved successfully!', 'success');

        // Redirect to project page after a short delay
        setTimeout(() => {
            window.location.href = 'project.html';
        }, 1500);
    });

    // Toggle text input enabled/disabled
    textInputEnabled.addEventListener('change', function() {
        toggleStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
    });

    // Add button functionality
    addButtonLink.addEventListener('click', function() {
        const currentButtonCount = buttonsContainer.querySelectorAll('.button-form-item').length;

        if (currentButtonCount >= 5) {
            showNotification('Maximum of 5 buttons allowed', 'error');
            return;
        }

        buttonCounter++;
        addButtonForm();

        // Move add button container below the buttons after first button is added
        if (currentButtonCount === 0) {
            const addButtonContainer = document.getElementById('addButtonContainer');
            addButtonContainer.classList.add('has-buttons');
            buttonsContainer.parentNode.appendChild(addButtonContainer);
        }

        // Check if we've reached the limit
        updateAddButtonState();
    });

    function addButtonForm() {
        const buttonItem = document.createElement('div');
        buttonItem.className = 'button-form-item';
        buttonItem.dataset.buttonId = buttonCounter;

        buttonItem.innerHTML = `
            <div class="button-form-header">
                <div class="button-form-header-left">
                    <svg class="drag-handle" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="5" r="1" fill="currentColor"/>
                        <circle cx="9" cy="12" r="1" fill="currentColor"/>
                        <circle cx="9" cy="19" r="1" fill="currentColor"/>
                        <circle cx="15" cy="5" r="1" fill="currentColor"/>
                        <circle cx="15" cy="12" r="1" fill="currentColor"/>
                        <circle cx="15" cy="19" r="1" fill="currentColor"/>
                    </svg>
                    <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="button-form-title">Button ${buttonCounter}</span>
                </div>
                <button type="button" class="delete-button-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            <div class="button-form-body">
                <div class="form-row">
                    <label class="form-field-label">
                        Button label<span class="required">*</span>
                    </label>
                    <div class="form-field-input">
                        <input type="text" class="text-input button-label-input" placeholder="">
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-field-label">
                        Select agent<span class="required">*</span>
                    </label>
                    <div class="form-field-input">
                        <select class="text-input button-agent-select">
                            <option value="">Select...</option>
                            <option value="agent1">Customer Support Agent</option>
                            <option value="agent2">Analytics Agent</option>
                            <option value="agent3">Sales Agent</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-field-label">
                        Prompt template<span class="required">*</span>
                    </label>
                    <div class="form-field-input">
                        <textarea class="text-area button-prompt-textarea" rows="4"></textarea>
                    </div>
                </div>
            </div>
        `;

        buttonsContainer.appendChild(buttonItem);

        // Update button title when label changes
        const labelInput = buttonItem.querySelector('.button-label-input');
        const titleSpan = buttonItem.querySelector('.button-form-title');
        const buttonNumber = buttonCounter;

        labelInput.addEventListener('input', function() {
            const labelValue = this.value.trim();
            if (labelValue) {
                titleSpan.textContent = `Button ${buttonNumber}: ${labelValue}`;
            } else {
                titleSpan.textContent = `Button ${buttonNumber}`;
            }
        });

        // Add toggle functionality
        const header = buttonItem.querySelector('.button-form-header');
        header.addEventListener('click', function(e) {
            // Don't toggle if clicking delete button or drag handle
            if (e.target.closest('.delete-button-btn') || e.target.closest('.drag-handle')) return;

            buttonItem.classList.toggle('collapsed');
        });

        // Add delete functionality
        const deleteBtn = buttonItem.querySelector('.delete-button-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this button?')) {
                buttonItem.remove();
                renumberButtons();
                updateAddButtonState();
            }
        });

        // Add drag and drop functionality
        const dragHandle = buttonItem.querySelector('.drag-handle');

        // Make the entire item draggable when dragging from the handle
        let isDragging = false;

        dragHandle.addEventListener('mousedown', function(e) {
            isDragging = true;
            buttonItem.setAttribute('draggable', 'true');
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            buttonItem.setAttribute('draggable', 'false');
        });

        buttonItem.addEventListener('dragstart', function(e) {
            if (!isDragging) {
                e.preventDefault();
                return;
            }
            buttonItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', buttonItem.innerHTML);
        });

        buttonItem.addEventListener('dragend', function(e) {
            buttonItem.classList.remove('dragging');
            buttonItem.setAttribute('draggable', 'false');
        });

        buttonItem.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingItem = buttonsContainer.querySelector('.dragging');
            if (draggingItem && draggingItem !== buttonItem) {
                const rect = buttonItem.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (e.clientY < midpoint) {
                    buttonsContainer.insertBefore(draggingItem, buttonItem);
                } else {
                    buttonsContainer.insertBefore(draggingItem, buttonItem.nextSibling);
                }
                renumberButtons();
            }
        });

        buttonItem.addEventListener('drop', function(e) {
            e.preventDefault();
        });
    }

    // Renumber buttons after reordering or deletion
    function renumberButtons() {
        const buttonItems = buttonsContainer.querySelectorAll('.button-form-item');
        buttonItems.forEach((item, index) => {
            const title = item.querySelector('.button-form-title');
            const labelInput = item.querySelector('.button-label-input');
            if (title) {
                const labelValue = labelInput ? labelInput.value.trim() : '';
                if (labelValue) {
                    title.textContent = `Button ${index + 1}: ${labelValue}`;
                } else {
                    title.textContent = `Button ${index + 1}`;
                }
            }
        });
    }

    // Update Add Button state (disable if limit reached)
    function updateAddButtonState() {
        const currentButtonCount = buttonsContainer.querySelectorAll('.button-form-item').length;
        if (currentButtonCount >= 5) {
            addButtonLink.disabled = true;
            addButtonLink.style.opacity = '0.5';
            addButtonLink.style.cursor = 'not-allowed';
        } else {
            addButtonLink.disabled = false;
            addButtonLink.style.opacity = '1';
            addButtonLink.style.cursor = 'pointer';
        }
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const bgColor = type === 'success' ? '#10b981' :
                       type === 'error' ? '#ef4444' :
                       '#3b82f6';

        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 24px;
            padding: 16px 24px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: 'Figtree', sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    updateFooterButtons();
    console.log('Chat Interface Builder initialized');
});
