document.addEventListener('DOMContentLoaded', function() {
    // Get project name and tool name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('project') || 'Project Name';
    const toolName = urlParams.get('name');

    // Get tool data from localStorage
    const toolData = JSON.parse(localStorage.getItem('currentToolData') || '{}');

    // Determine if we're editing an existing tool or creating a new one
    const isEditing = !!toolName;

    // Update button text and title if editing
    if (isEditing) {
        document.getElementById('createBtn').textContent = 'Save';
        if (toolData.name) {
            document.getElementById('toolTitle').textContent = `Edit ${toolData.name}`;
        }
    }

    // Populate form with tool data
    if (toolData.name) {
        document.getElementById('name').value = toolData.name;
    }

    if (toolData.description) {
        document.getElementById('description').value = toolData.description;
    }

    if (toolData.knowledgeBase) {
        document.getElementById('knowledgeBase').value = toolData.knowledgeBase;
    }

    // Word count functionality
    const knowledgeBaseTextarea = document.getElementById('knowledgeBase');
    const wordCountDisplay = document.getElementById('wordCount');

    function updateWordCount() {
        const text = knowledgeBaseTextarea.value.trim();
        const words = text === '' ? 0 : text.split(/\s+/).length;
        wordCountDisplay.textContent = `${words}/5000 words`;
    }

    knowledgeBaseTextarea.addEventListener('input', updateWordCount);
    updateWordCount(); // Initial count

    // Track unsaved changes
    const unsavedChangesIndicator = document.getElementById('unsavedChanges');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    let hasUnsavedChanges = false;

    // Store initial values
    const initialValues = {
        name: nameInput.value,
        description: descriptionInput.value,
        knowledgeBase: knowledgeBaseTextarea.value
    };

    function checkForChanges() {
        const currentValues = {
            name: nameInput.value,
            description: descriptionInput.value,
            knowledgeBase: knowledgeBaseTextarea.value
        };

        hasUnsavedChanges =
            currentValues.name !== initialValues.name ||
            currentValues.description !== initialValues.description ||
            currentValues.knowledgeBase !== initialValues.knowledgeBase;

        if (hasUnsavedChanges) {
            unsavedChangesIndicator.style.display = 'block';
        } else {
            unsavedChangesIndicator.style.display = 'none';
        }
    }

    // Add change listeners
    nameInput.addEventListener('input', checkForChanges);
    descriptionInput.addEventListener('input', checkForChanges);
    knowledgeBaseTextarea.addEventListener('input', checkForChanges);

    // Back button functionality
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
            localStorage.removeItem('currentToolData');
            window.location.href = `project.html?name=${encodeURIComponent(projectName)}`;
        }
    });

    // Cancel button functionality
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            localStorage.removeItem('currentToolData');
            window.location.href = `project.html?name=${encodeURIComponent(projectName)}`;
        }
    });

    // Create button functionality
    const createBtn = document.getElementById('createBtn');
    const toolForm = document.getElementById('toolForm');

    createBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value;
        const knowledgeBase = document.getElementById('knowledgeBase').value.trim();

        // Validate required fields
        if (!name) {
            alert('Please enter a tool name');
            return;
        }

        if (!knowledgeBase) {
            alert('Please enter knowledge base content');
            return;
        }

        // Get existing tools from localStorage
        let tools = JSON.parse(localStorage.getItem('tools') || '[]');

        if (isEditing) {
            // Update existing tool
            const toolIndex = tools.findIndex(t => t.name === toolData.name && t.project === projectName);
            if (toolIndex !== -1) {
                tools[toolIndex] = {
                    ...tools[toolIndex],
                    name: name,
                    description: description,
                    knowledgeBase: knowledgeBase,
                    updatedBy: 'Sam Gillis',
                    updatedOn: new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    })
                };
            }
        } else {
            // Create new tool
            const tool = {
                name: name,
                type: 'Text Knowledge Base',
                description: description,
                knowledgeBase: knowledgeBase,
                category: 'Self-managed',
                project: projectName,
                updatedBy: 'Sam Gillis',
                updatedOn: new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
            };
            tools.push(tool);
        }

        // Save to localStorage
        localStorage.setItem('tools', JSON.stringify(tools));

        // Clear temporary tool data
        localStorage.removeItem('currentToolData');

        // Redirect back to project page with tools tab active
        window.location.href = `project.html?name=${encodeURIComponent(projectName)}&tab=tools`;
    });
});
