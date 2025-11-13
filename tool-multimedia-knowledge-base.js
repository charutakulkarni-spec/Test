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

    // Track unsaved changes
    const unsavedChangesIndicator = document.getElementById('unsavedChanges');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    let hasUnsavedChanges = false;

    let uploadedPDFs = toolData.pdfs || [];
    let addedLinks = toolData.links || [];

    // Store initial values
    const initialValues = {
        name: nameInput.value,
        description: descriptionInput.value,
        pdfs: JSON.stringify(uploadedPDFs),
        links: JSON.stringify(addedLinks)
    };

    function checkForChanges() {
        const currentValues = {
            name: nameInput.value,
            description: descriptionInput.value,
            pdfs: JSON.stringify(uploadedPDFs),
            links: JSON.stringify(addedLinks)
        };

        hasUnsavedChanges =
            currentValues.name !== initialValues.name ||
            currentValues.description !== initialValues.description ||
            currentValues.pdfs !== initialValues.pdfs ||
            currentValues.links !== initialValues.links;

        if (hasUnsavedChanges) {
            unsavedChangesIndicator.style.display = 'block';
        } else {
            unsavedChangesIndicator.style.display = 'none';
        }
    }

    // Add change listeners
    nameInput.addEventListener('input', checkForChanges);
    descriptionInput.addEventListener('input', checkForChanges);

    // Input type switching
    const pdfInputBtn = document.getElementById('pdfInputBtn');
    const linkInputBtn = document.getElementById('linkInputBtn');
    const pdfInputContainer = document.getElementById('pdfInputContainer');
    const linkInputContainer = document.getElementById('linkInputContainer');

    pdfInputBtn.addEventListener('click', function() {
        pdfInputBtn.classList.add('active');
        linkInputBtn.classList.remove('active');
        pdfInputContainer.style.display = 'block';
        linkInputContainer.style.display = 'none';
    });

    linkInputBtn.addEventListener('click', function() {
        pdfInputBtn.classList.remove('active');
        linkInputBtn.classList.add('active');
        pdfInputContainer.style.display = 'none';
        linkInputContainer.style.display = 'block';
    });

    // PDF Upload functionality
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfFileList = document.getElementById('pdfFileList');

    pdfUploadArea.addEventListener('click', function() {
        pdfFileInput.click();
    });

    pdfUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        pdfUploadArea.style.borderColor = 'var(--color-primary)';
        pdfUploadArea.style.background = '#f0f4ff';
    });

    pdfUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        pdfUploadArea.style.borderColor = 'var(--color-gray-4)';
        pdfUploadArea.style.background = '#f9fafb';
    });

    pdfUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        pdfUploadArea.style.borderColor = 'var(--color-gray-4)';
        pdfUploadArea.style.background = '#f9fafb';

        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        files.forEach(addPDFFile);
    });

    pdfFileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(addPDFFile);
        pdfFileInput.value = '';
    });

    function addPDFFile(file) {
        const fileData = {
            name: file.name,
            size: formatFileSize(file.size)
        };

        uploadedPDFs.push(fileData);
        renderPDFList();
        checkForChanges();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function renderPDFList() {
        pdfFileList.innerHTML = '';
        uploadedPDFs.forEach((fileData, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <div>
                        <div class="file-item-name text">${fileData.name}</div>
                        <div class="file-item-size">${fileData.size}</div>
                    </div>
                </div>
                <button type="button" class="file-item-remove" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            `;
            pdfFileList.appendChild(fileItem);
        });

        // Attach remove listeners
        document.querySelectorAll('.file-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                uploadedPDFs.splice(index, 1);
                renderPDFList();
                checkForChanges();
            });
        });
    }

    // Link functionality
    const linkInput = document.getElementById('linkInput');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkList = document.getElementById('linkList');

    addLinkBtn.addEventListener('click', function() {
        const url = linkInput.value.trim();
        if (url && isValidURL(url)) {
            addedLinks.push(url);
            linkInput.value = '';
            renderLinkList();
            checkForChanges();
        }
    });

    linkInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLinkBtn.click();
        }
    });

    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function renderLinkList() {
        linkList.innerHTML = '';
        addedLinks.forEach((url, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <a href="${url}" target="_blank" class="link-item-url">${url}</a>
                <button type="button" class="link-item-remove" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            `;
            linkList.appendChild(linkItem);
        });

        // Attach remove listeners
        document.querySelectorAll('.link-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                addedLinks.splice(index, 1);
                renderLinkList();
                checkForChanges();
            });
        });
    }

    // Load existing data
    if (toolData.pdfs) {
        renderPDFList();
    }
    if (toolData.links) {
        renderLinkList();
    }

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

    createBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value;

        // Validate required fields
        if (!name) {
            alert('Please enter a tool name');
            return;
        }

        if (uploadedPDFs.length === 0 && addedLinks.length === 0) {
            alert('Please add at least one PDF or link');
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
                    pdfs: uploadedPDFs,
                    links: addedLinks,
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
                type: 'Multi-media Knowledge Base',
                description: description,
                pdfs: uploadedPDFs,
                links: addedLinks,
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
