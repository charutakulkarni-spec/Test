// Form Interface Builder JavaScript

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
    const createBtn = document.getElementById('createBtn');
    const interfaceNameInput = document.getElementById('interfaceName');
    const selectAgentInput = document.getElementById('selectAgent');
    const promptTemplateTextarea = document.getElementById('promptTemplate');

    let currentStep = 1;

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
            createBtn.style.display = 'inline-flex';
        } else if (currentStep === 2) {
            backStepBtn.style.display = 'inline-flex';
            nextBtn.style.display = 'none';
            createBtn.style.display = 'inline-flex';
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
            const selectedAgent = selectAgentInput.value;
            const promptTemplate = promptTemplateTextarea.value.trim();

            if (!interfaceName) {
                alert('Please enter an interface name');
                interfaceNameInput.focus();
                return;
            }

            if (!selectedAgent) {
                alert('Please select an agent');
                selectAgentInput.focus();
                return;
            }

            if (!promptTemplate) {
                alert('Please enter a prompt template');
                promptTemplateTextarea.focus();
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

    // Create button
    createBtn.addEventListener('click', function() {
        // Clear any previous errors
        clearFieldErrors();

        // Collect form data
        const formData = {
            interfaceName: interfaceNameInput.value.trim(),
            selectedAgent: selectAgentInput.value,
            promptTemplate: promptTemplateTextarea.value.trim()
        };

        let hasErrors = false;

        // Validate Step 1
        if (!formData.interfaceName) {
            showFieldError(interfaceNameInput, 'This is a required field');
            hasErrors = true;
        }

        if (!formData.selectedAgent) {
            showFieldError(selectAgentInput, 'This is a required field');
            hasErrors = true;
        }

        if (!formData.promptTemplate) {
            showFieldError(promptTemplateTextarea, 'This is a required field');
            hasErrors = true;
        }

        if (hasErrors) {
            goToStep(1);
            return;
        }

        // Get project name from URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectName = urlParams.get('project') || 'Project 1';

        // Get or create interface entry in localStorage
        let interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');

        // Check if this interface already exists (from modal creation)
        let interfaceIndex = interfaces.findIndex(i =>
            i.name === formData.interfaceName && i.project === projectName
        );

        // Collect form fields data
        const formFields = [];
        const fieldItems = formFieldsContainer.querySelectorAll('.form-field-item, .form-section-item');
        fieldItems.forEach(item => {
            const fieldId = item.dataset.fieldId;
            const fieldType = item.dataset.fieldType;
            const config = fieldConfigCache[fieldId] || {};

            formFields.push({
                id: fieldId,
                type: fieldType,
                label: config.label || getFieldLabel(fieldType),
                placeholder: config.placeholder || '',
                help: config.help || '',
                required: config.required || false
            });
        });

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' +
                             currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const interfaceData = {
            name: formData.interfaceName,
            type: 'Form',
            description: '',
            project: projectName,
            updatedBy: 'Admin',
            updatedOn: formattedDate,
            agent: formData.selectedAgent,
            promptTemplate: formData.promptTemplate,
            formFields: formFields
        };

        if (interfaceIndex >= 0) {
            // Update existing interface
            interfaces[interfaceIndex] = interfaceData;
        } else {
            // Add new interface
            interfaces.push(interfaceData);
        }

        // Save to localStorage
        localStorage.setItem('interfaces', JSON.stringify(interfaces));

        // Log form data
        console.log('Creating form interface:', interfaceData);

        // Show success message
        showNotification('Form interface created successfully!', 'success');

        // Redirect to project page after a short delay
        setTimeout(() => {
            const projectParam = projectName ? `?name=${encodeURIComponent(projectName)}` : '';
            window.location.href = `project.html${projectParam}`;
        }, 1500);
    });

    // Show field error
    function showFieldError(fieldElement, message) {
        // Add error class to field
        fieldElement.classList.add('field-error');

        // Find or create error message element
        const fieldWrapper = fieldElement.closest('.form-field-input');
        if (fieldWrapper) {
            // Remove existing error message if any
            const existingError = fieldWrapper.querySelector('.field-error-message');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'field-error-message';
            errorMessage.textContent = message;
            fieldWrapper.appendChild(errorMessage);
        }
    }

    // Clear all field errors
    function clearFieldErrors() {
        // Remove error classes
        const errorFields = document.querySelectorAll('.field-error');
        errorFields.forEach(field => {
            field.classList.remove('field-error');
        });

        // Remove error messages
        const errorMessages = document.querySelectorAll('.field-error-message');
        errorMessages.forEach(msg => {
            msg.remove();
        });
    }

    // Clear error on input for Step 1 fields
    function clearErrorOnInput(fieldElement) {
        fieldElement.addEventListener('input', function() {
            this.classList.remove('field-error');
            const fieldWrapper = this.closest('.form-field-input');
            if (fieldWrapper) {
                const errorMessage = fieldWrapper.querySelector('.field-error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    }

    // Add clear error listeners to Step 1 fields
    clearErrorOnInput(interfaceNameInput);
    clearErrorOnInput(selectAgentInput);
    clearErrorOnInput(promptTemplateTextarea);

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

    // Form Builder - Drag and Drop
    const formFieldsContainer = document.getElementById('formFieldsContainer');
    const formPreviewArea = document.getElementById('formPreviewArea');
    const fieldConfigPanel = document.getElementById('fieldConfigPanel');
    const configPanelTitle = document.getElementById('configPanelTitle');
    const configPanelBody = document.getElementById('configPanelBody');
    const closeConfigBtn = document.getElementById('closeConfigBtn');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const cancelConfigBtn = document.getElementById('cancelConfigBtn');
    const testModeToggle = document.getElementById('testModeToggle');
    const previewTitle = document.getElementById('previewTitle');
    const testModeBanner = document.getElementById('testModeBanner');

    let fieldCounter = 0;
    let selectedFieldId = null;
    let fieldConfigCache = {}; // Store original field configurations
    let isTestMode = false;

    // Show warning when trying to drag in test mode
    function showTestModeWarning() {
        const warning = document.createElement('div');
        warning.className = 'test-mode-warning';
        warning.textContent = 'Editing is not allowed in test mode. Please disable test mode to edit.';
        document.body.appendChild(warning);

        setTimeout(() => {
            warning.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => {
                warning.remove();
            }, 300);
        }, 3000);
    }

    // Drag start from field type cards
    const fieldTypeCards = document.querySelectorAll('.field-type-card');
    fieldTypeCards.forEach(card => {
        card.addEventListener('dragstart', function(e) {
            if (isTestMode) {
                e.preventDefault();
                showTestModeWarning();
                return;
            }
            const fieldType = this.dataset.fieldType;
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('fieldType', fieldType);
            this.classList.add('dragging');
        });

        card.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
        });
    });

    // Drag over preview area
    formPreviewArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.classList.add('drag-over');
    });

    formPreviewArea.addEventListener('dragleave', function(e) {
        if (e.target === this) {
            this.classList.remove('drag-over');
        }
    });

    // Drop on preview area
    formPreviewArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (isTestMode) {
            showTestModeWarning();
            return;
        }

        const fieldType = e.dataTransfer.getData('fieldType');
        const draggingItem = document.querySelector('.form-field-item.dragging');

        // If dragging an existing field, move it to main area
        if (draggingItem) {
            formFieldsContainer.appendChild(draggingItem);
        }
        // If dragging a new field type from palette
        else if (fieldType) {
            addFormField(fieldType);
        }
    });

    // Add form field to preview
    function addFormField(fieldType) {
        fieldCounter++;
        const fieldId = `field-${fieldCounter}`;

        const fieldItem = document.createElement('div');
        fieldItem.dataset.fieldId = fieldId;
        fieldItem.dataset.fieldType = fieldType;

        const fieldLabel = getFieldLabel(fieldType);

        // Check if it's a section
        if (fieldType === 'section') {
            fieldItem.className = 'form-section-item';
            fieldItem.innerHTML = `
                <div class="section-header">
                    <svg class="field-drag-handle" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="5" r="1" fill="currentColor"/>
                        <circle cx="9" cy="12" r="1" fill="currentColor"/>
                        <circle cx="9" cy="19" r="1" fill="currentColor"/>
                        <circle cx="15" cy="5" r="1" fill="currentColor"/>
                        <circle cx="15" cy="12" r="1" fill="currentColor"/>
                        <circle cx="15" cy="19" r="1" fill="currentColor"/>
                    </svg>
                    <svg class="field-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="field-item-label">${fieldLabel}</span>
                    <button class="field-delete-btn" type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                <div class="section-fields-container"></div>
            `;
        } else {
            fieldItem.className = 'form-field-item';
            fieldItem.innerHTML = `
                <button class="field-delete-btn" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                ${getFieldVisualPreview(fieldType, fieldLabel)}
            `;
        }

        formFieldsContainer.appendChild(fieldItem);

        // If it's a section, enable dropping into it
        if (fieldType === 'section') {
            const sectionFieldsContainer = fieldItem.querySelector('.section-fields-container');

            sectionFieldsContainer.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.background = '#F8F5FF';
            });

            sectionFieldsContainer.addEventListener('dragleave', function(e) {
                if (e.target === this) {
                    this.style.background = '#FFFFFF';
                }
            });

            sectionFieldsContainer.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.style.background = '#FFFFFF';

                if (isTestMode) {
                    showTestModeWarning();
                    return;
                }

                const droppedFieldType = e.dataTransfer.getData('fieldType');
                const draggingItem = document.querySelector('.form-field-item.dragging');

                // If dragging an existing field, move it into this section
                if (draggingItem) {
                    sectionFieldsContainer.appendChild(draggingItem);
                }
                // If dragging a new field type from the palette
                else if (droppedFieldType && droppedFieldType !== 'section') {
                    addFormFieldToSection(droppedFieldType, sectionFieldsContainer);
                }
            });
        }

        // Add click to configure
        fieldItem.addEventListener('click', function(e) {
            if (!e.target.closest('.field-delete-btn') && !e.target.closest('.section-fields-container')) {
                if (!isTestMode) {
                    selectField(fieldId);
                }
            }
        });

        // Add delete functionality
        const deleteBtn = fieldItem.querySelector('.field-delete-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this field?')) {
                fieldItem.remove();
                if (selectedFieldId === fieldId) {
                    closeConfigPanel();
                }
            }
        });

        // Add drag and drop for reordering
        const dragHandle = fieldItem.querySelector('.field-visual-preview .field-drag-handle');
        let isDragging = false;

        if (dragHandle) {
            dragHandle.addEventListener('mousedown', function(e) {
                if (isTestMode) {
                    e.preventDefault();
                    showTestModeWarning();
                    return;
                }
                isDragging = true;
                fieldItem.setAttribute('draggable', 'true');
            });

            document.addEventListener('mouseup', function() {
                isDragging = false;
                fieldItem.setAttribute('draggable', 'false');
            });
        }

        fieldItem.addEventListener('dragstart', function(e) {
            if (!isDragging) {
                e.preventDefault();
                return;
            }
            fieldItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('fieldId', fieldId);

            // Create invisible drag image to remove ghost effect
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(img, 0, 0);
        });

        fieldItem.addEventListener('dragend', function(e) {
            fieldItem.classList.remove('dragging');
            fieldItem.setAttribute('draggable', 'false');

            // Remove all drag-over classes everywhere when drag ends
            document.querySelectorAll('.form-field-item').forEach(item => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });

        fieldItem.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingItem = document.querySelector('.form-field-item.dragging');
            if (draggingItem && draggingItem !== fieldItem) {
                // Remove all drag-over classes everywhere
                document.querySelectorAll('.form-field-item').forEach(item => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                const rect = fieldItem.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    fieldItem.classList.add('drag-over-top');
                    // Move item above
                    if (fieldItem.previousElementSibling !== draggingItem) {
                        formFieldsContainer.insertBefore(draggingItem, fieldItem);
                    }
                } else {
                    fieldItem.classList.add('drag-over-bottom');
                    // Move item below
                    if (fieldItem.nextElementSibling !== draggingItem) {
                        formFieldsContainer.insertBefore(draggingItem, fieldItem.nextElementSibling);
                    }
                }
            }
        });

        fieldItem.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        fieldItem.addEventListener('drop', function(e) {
            e.preventDefault();
            // Remove all drag-over classes everywhere
            document.querySelectorAll('.form-field-item').forEach(item => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            // Reordering already happened in dragover, just cleanup here
        });

        // Auto-select the newly added field
        selectField(fieldId);
    }

    // Add form field to a section
    function addFormFieldToSection(fieldType, sectionContainer) {
        fieldCounter++;
        const fieldId = `field-${fieldCounter}`;

        const fieldItem = document.createElement('div');
        fieldItem.className = 'form-field-item';
        fieldItem.dataset.fieldId = fieldId;
        fieldItem.dataset.fieldType = fieldType;

        const fieldLabel = getFieldLabel(fieldType);

        fieldItem.innerHTML = `
            <button class="field-delete-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
            ${getFieldVisualPreview(fieldType, fieldLabel)}
        `;

        sectionContainer.appendChild(fieldItem);

        // Add click to configure
        fieldItem.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!e.target.closest('.field-delete-btn')) {
                if (!isTestMode) {
                    selectField(fieldId);
                }
            }
        });

        // Add delete functionality
        const deleteBtn = fieldItem.querySelector('.field-delete-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this field?')) {
                fieldItem.remove();
                if (selectedFieldId === fieldId) {
                    closeConfigPanel();
                }
            }
        });

        // Add drag and drop for reordering within section
        const dragHandle = fieldItem.querySelector('.field-visual-preview .field-drag-handle');
        let isDragging = false;

        if (dragHandle) {
            dragHandle.addEventListener('mousedown', function(e) {
                if (isTestMode) {
                    e.preventDefault();
                    showTestModeWarning();
                    return;
                }
                isDragging = true;
                fieldItem.setAttribute('draggable', 'true');
            });

            document.addEventListener('mouseup', function() {
                isDragging = false;
                fieldItem.setAttribute('draggable', 'false');
            });
        }

        fieldItem.addEventListener('dragstart', function(e) {
            if (!isDragging) {
                e.preventDefault();
                return;
            }
            fieldItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('fieldId', fieldId);

            // Create invisible drag image to remove ghost effect
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(img, 0, 0);
        });

        fieldItem.addEventListener('dragend', function(e) {
            fieldItem.classList.remove('dragging');
            fieldItem.setAttribute('draggable', 'false');

            // Remove all drag-over classes everywhere when drag ends
            document.querySelectorAll('.form-field-item').forEach(item => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });

        fieldItem.addEventListener('dragover', function(e) {
            e.preventDefault();
            const draggingItem = document.querySelector('.form-field-item.dragging');
            if (draggingItem && draggingItem !== fieldItem) {
                // Remove all drag-over classes everywhere
                document.querySelectorAll('.form-field-item').forEach(item => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                const rect = fieldItem.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    fieldItem.classList.add('drag-over-top');
                    // Move item above
                    if (fieldItem.previousElementSibling !== draggingItem) {
                        sectionContainer.insertBefore(draggingItem, fieldItem);
                    }
                } else {
                    fieldItem.classList.add('drag-over-bottom');
                    // Move item below
                    if (fieldItem.nextElementSibling !== draggingItem) {
                        sectionContainer.insertBefore(draggingItem, fieldItem.nextElementSibling);
                    }
                }
            }
        });

        fieldItem.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        fieldItem.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Remove all drag-over classes everywhere
            document.querySelectorAll('.form-field-item').forEach(item => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            // Reordering already happened in dragover, just cleanup here
        });

        // Auto-select the newly added field
        selectField(fieldId);
    }

    // Get field label based on type
    function getFieldLabel(fieldType) {
        const labels = {
            'section': 'Section',
            'text': 'Basic text',
            'textarea': 'Text area',
            'password': 'Password',
            'date': 'Date',
            'datetime': 'Date and time',
            'number': 'Number input',
            'number-range': 'Number range',
            'number-slider': 'Number slider',
            'checkbox': 'Checkbox',
            'radio': 'Radio button',
            'select-dropdown-bool': 'Select dropdown',
            'select-dropdown': 'Select dropdown',
            'radio-selection': 'Radio button',
            'multi-select': 'Multi-select',
            'checkbox-selection': 'Checkbox'
        };
        return labels[fieldType] || 'Field';
    }

    // Get visual preview HTML for field type
    function getFieldVisualPreview(fieldType, fieldLabel, isRequired) {
        const previewLabel = fieldLabel || getFieldLabel(fieldType);
        const requiredMark = isRequired ? '<span class="required">*</span>' : '';
        const dragHandleSVG = `<svg class="field-drag-handle" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="5" r="1" fill="currentColor"/>
            <circle cx="9" cy="12" r="1" fill="currentColor"/>
            <circle cx="9" cy="19" r="1" fill="currentColor"/>
            <circle cx="15" cy="5" r="1" fill="currentColor"/>
            <circle cx="15" cy="12" r="1" fill="currentColor"/>
            <circle cx="15" cy="19" r="1" fill="currentColor"/>
        </svg>`;
        const deleteButtonSVG = `<button class="field-delete-btn" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>`;

        switch(fieldType) {
            case 'text':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="text" placeholder="Enter text">
                        </div>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <textarea placeholder="Enter text"></textarea>
                        </div>
                    </div>
                `;
            case 'password':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="password" placeholder="Enter password">
                        </div>
                    </div>
                `;
            case 'date':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="date">
                        </div>
                    </div>
                `;
            case 'datetime':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="datetime-local">
                        </div>
                    </div>
                `;
            case 'number':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="number" placeholder="Enter number">
                        </div>
                    </div>
                `;
            case 'number-range':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="number" placeholder="Min" style="width: 48%; display: inline-block; margin-right: 4%;">
                            <input type="number" placeholder="Max" style="width: 48%; display: inline-block;">
                        </div>
                    </div>
                `;
            case 'number-slider':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="range" min="0" max="100">
                        </div>
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="checkbox">
                        </div>
                    </div>
                `;
            case 'radio':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <input type="radio">
                        </div>
                    </div>
                `;
            case 'select-dropdown':
            case 'select-dropdown-bool':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <select>
                                <option>Select option</option>
                            </select>
                        </div>
                    </div>
                `;
            case 'multi-select':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <select multiple style="height: 80px;">
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>
                    </div>
                `;
            case 'radio-selection':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <div><input type="radio" name="radio-${Date.now()}"> Option 1</div>
                            <div><input type="radio" name="radio-${Date.now()}"> Option 2</div>
                        </div>
                    </div>
                `;
            case 'checkbox-selection':
                return `
                    <div class="field-visual-preview">
                        ${dragHandleSVG}
                        <div class="field-visual-label">${previewLabel}${requiredMark}</div>
                        <div class="field-visual-input">
                            <div><input type="checkbox"> Option 1</div>
                            <div><input type="checkbox"> Option 2</div>
                        </div>
                    </div>
                `;
            default:
                return `<div class="field-item-preview">Click to configure</div>`;
        }
    }

    // Select field for configuration
    function selectField(fieldId) {
        selectedFieldId = fieldId;

        // Update visual selection
        const allFields = formFieldsContainer.querySelectorAll('.form-field-item');
        allFields.forEach(item => {
            if (item.dataset.fieldId === fieldId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Show config panel
        const fieldItem = formFieldsContainer.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldItem) {
            const fieldType = fieldItem.dataset.fieldType;
            const fieldLabel = getFieldLabel(fieldType);
            showConfigPanel(fieldId, fieldType, fieldLabel);
        }
    }

    // Show configuration panel
    function showConfigPanel(fieldId, fieldType, fieldLabel) {
        configPanelTitle.textContent = `Configure ${fieldLabel}`;

        // Get or initialize field config
        if (!fieldConfigCache[fieldId]) {
            fieldConfigCache[fieldId] = {
                label: fieldLabel,
                placeholder: '',
                help: '',
                required: false
            };
        }

        const config = fieldConfigCache[fieldId];

        // Build configuration form based on field type
        configPanelBody.innerHTML = `
            <div class="config-form-group">
                <label class="config-label">Field label</label>
                <input type="text" class="config-input" id="config-label" value="${config.label}">
            </div>
            <div class="config-form-group">
                <label class="config-label">Placeholder text</label>
                <input type="text" class="config-input" id="config-placeholder" value="${config.placeholder}">
            </div>
            <div class="config-form-group">
                <label class="config-label">Help text</label>
                <textarea class="config-textarea" id="config-help" rows="3">${config.help}</textarea>
            </div>
            <div class="config-form-group">
                <label class="config-checkbox-label">
                    <input type="checkbox" class="config-checkbox" id="config-required" ${config.required ? 'checked' : ''}>
                    <span>Required field</span>
                </label>
            </div>
        `;

        // Show panel
        fieldConfigPanel.style.display = 'flex';

        // Update layout to show config panel
        document.querySelector('.form-builder-layout').classList.remove('no-config');

        // Add event listeners for live preview (but not saving)
        const configInputs = configPanelBody.querySelectorAll('input, textarea');
        configInputs.forEach(input => {
            input.addEventListener('input', function() {
                updateFieldPreviewOnly(fieldId);
            });
        });
    }

    // Update field preview only (for live preview without saving)
    function updateFieldPreviewOnly(fieldId) {
        const fieldItem = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldItem) return;

        const labelInput = document.getElementById('config-label');
        const placeholderInput = document.getElementById('config-placeholder');
        const helpInput = document.getElementById('config-help');
        const requiredInput = document.getElementById('config-required');

        const fieldItemLabel = fieldItem.querySelector('.field-item-label');
        const currentLabel = labelInput ? labelInput.value : getFieldLabel(fieldItem.dataset.fieldType);
        const isRequired = requiredInput ? requiredInput.checked : false;

        // Update header label
        if (labelInput && fieldItemLabel) {
            fieldItemLabel.textContent = currentLabel || getFieldLabel(fieldItem.dataset.fieldType);
        }

        // Update visual preview with new label
        const visualPreview = fieldItem.querySelector('.field-visual-preview');
        if (visualPreview) {
            const fieldType = fieldItem.dataset.fieldType;
            const newVisualPreview = getFieldVisualPreview(fieldType, currentLabel, isRequired);

            // Replace the old visual preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newVisualPreview;
            const newPreviewElement = tempDiv.firstElementChild;

            if (newPreviewElement) {
                visualPreview.replaceWith(newPreviewElement);

                // Update placeholder if configured
                if (placeholderInput && placeholderInput.value) {
                    const inputs = newPreviewElement.querySelectorAll('input[placeholder], textarea[placeholder]');
                    inputs.forEach(input => {
                        input.placeholder = placeholderInput.value;
                    });
                }
            }
        }
    }

    // Save field configuration
    function saveFieldConfiguration(fieldId) {
        const labelInput = document.getElementById('config-label');
        const placeholderInput = document.getElementById('config-placeholder');
        const helpInput = document.getElementById('config-help');
        const requiredInput = document.getElementById('config-required');

        if (!labelInput) return;

        // Save to cache
        fieldConfigCache[fieldId] = {
            label: labelInput.value.trim(),
            placeholder: placeholderInput ? placeholderInput.value.trim() : '',
            help: helpInput ? helpInput.value.trim() : '',
            required: requiredInput ? requiredInput.checked : false
        };

        // Apply the saved configuration to the field
        updateFieldPreviewOnly(fieldId);
    }

    // Restore field configuration (when canceling or closing without saving)
    function restoreFieldConfiguration(fieldId) {
        const fieldItem = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldItem || !fieldConfigCache[fieldId]) return;

        const config = fieldConfigCache[fieldId];
        const fieldType = fieldItem.dataset.fieldType;

        // Restore the visual preview with saved configuration
        const visualPreview = fieldItem.querySelector('.field-visual-preview');
        if (visualPreview) {
            const newVisualPreview = getFieldVisualPreview(fieldType, config.label, config.required);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newVisualPreview;
            const newPreviewElement = tempDiv.firstElementChild;

            if (newPreviewElement) {
                visualPreview.replaceWith(newPreviewElement);

                // Restore placeholder if configured
                if (config.placeholder) {
                    const inputs = newPreviewElement.querySelectorAll('input[placeholder], textarea[placeholder]');
                    inputs.forEach(input => {
                        input.placeholder = config.placeholder;
                    });
                }
            }
        }

        // Restore section header label if it exists
        const fieldItemLabel = fieldItem.querySelector('.field-item-label');
        if (fieldItemLabel) {
            fieldItemLabel.textContent = config.label || getFieldLabel(fieldType);
        }
    }

    // Close config panel
    function closeConfigPanel() {
        fieldConfigPanel.style.display = 'none';
        selectedFieldId = null;

        // Remove selection
        const allFields = formFieldsContainer.querySelectorAll('.form-field-item');
        allFields.forEach(item => {
            item.classList.remove('selected');
        });

        // Update layout
        document.querySelector('.form-builder-layout').classList.add('no-config');
    }

    // Save button
    saveConfigBtn.addEventListener('click', function() {
        if (selectedFieldId) {
            saveFieldConfiguration(selectedFieldId);
            showNotification('Field configuration saved!', 'success');
            closeConfigPanel();
        }
    });

    // Close button
    closeConfigBtn.addEventListener('click', function() {
        if (selectedFieldId) {
            // Restore saved configuration when closing without saving
            restoreFieldConfiguration(selectedFieldId);
        }
        closeConfigPanel();
    });

    // Cancel button
    cancelConfigBtn.addEventListener('click', function() {
        if (selectedFieldId) {
            // Restore saved configuration when canceling
            restoreFieldConfiguration(selectedFieldId);
        }
        closeConfigPanel();
    });

    // Test Mode Toggle
    testModeToggle.addEventListener('change', function() {
        isTestMode = this.checked;

        if (isTestMode) {
            // Change title to "Test"
            previewTitle.textContent = 'Test';

            // Show test mode banner
            testModeBanner.style.display = 'flex';

            formPreviewArea.classList.add('test-mode');

            // Close config panel when entering test mode
            if (selectedFieldId) {
                restoreFieldConfiguration(selectedFieldId);
                closeConfigPanel();
            }
        } else {
            // Change title back to "Builder"
            previewTitle.textContent = 'Builder';

            // Hide test mode banner
            testModeBanner.style.display = 'none';

            formPreviewArea.classList.remove('test-mode');

            // Reset all form fields to default state
            resetFormFields();
        }
    });

    // Reset all form fields to their default state
    function resetFormFields() {
        const allInputs = formFieldsContainer.querySelectorAll('input[type="text"], input[type="number"], input[type="password"], input[type="date"], input[type="datetime-local"], textarea, select');
        allInputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });

        const allCheckboxes = formFieldsContainer.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        const allRadios = formFieldsContainer.querySelectorAll('input[type="radio"]');
        allRadios.forEach(radio => {
            radio.checked = false;
        });

        const allRanges = formFieldsContainer.querySelectorAll('input[type="range"]');
        allRanges.forEach(range => {
            range.value = range.min || 0;
        });
    }

    // Check for URL parameters and pre-fill interface name
    function prefillFromURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const interfaceName = urlParams.get('name');

        if (interfaceName) {
            interfaceNameInput.value = decodeURIComponent(interfaceName);
        }
    }

    // Initialize
    prefillFromURLParams();
    updateFooterButtons();
    console.log('Form Interface Builder initialized');
});
