// Add click event listeners to create project buttons
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('createProjectModal');
    const createProjectButtons = document.querySelectorAll('.create-project-btn, .create-project-btn-main');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const form = document.getElementById('createProjectForm');

    // Load projects from localStorage on page load
    loadProjects();
    loadBookmarkedProjects();

    // Open modal
    createProjectButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.classList.add('active');
        });
    });

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        form.reset();
        clearProjectNameError();
    }

    // Function to show error for project name
    function showProjectNameError(message) {
        const input = document.getElementById('projectName');
        const errorDiv = document.getElementById('projectNameError');
        input.classList.add('error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    // Function to clear error for project name
    function clearProjectNameError() {
        const input = document.getElementById('projectName');
        const errorDiv = document.getElementById('projectNameError');
        input.classList.remove('error');
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }

    // Clear error when user starts typing
    document.getElementById('projectName').addEventListener('input', clearProjectNameError);

    // Close modal on close button
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal on cancel button
    cancelBtn.addEventListener('click', closeModal);

    // Close modal on overlay click
    modalOverlay.addEventListener('click', closeModal);

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const projectName = document.getElementById('projectName').value;
        const projectDescription = document.getElementById('projectDescription').value;
        const useRuntimeResource = document.getElementById('useRuntimeResource').checked;
        const useWorkflowExecutor = document.getElementById('useWorkflowExecutor').checked;

        // Get current date and time
        const now = new Date();
        const lastUpdated = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        // Create project object
        const project = {
            id: Date.now(), // Unique ID
            name: projectName,
            description: projectDescription,
            type: 'Self-defined',
            useRuntimeResource: useRuntimeResource,
            useWorkflowExecutor: useWorkflowExecutor,
            agents: 0,
            tools: 0,
            integrations: 0,
            interfaces: 0,
            lastUpdated: lastUpdated,
            updatedBy: 'Sam Gillis'
        };

        // Save to localStorage
        saveProject(project);

        // Add project to table
        addProjectToTable(project);

        // Hide empty state and show table
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('projectsTableContainer').style.display = 'block';

        closeModal();
    });

    // Function to save project to localStorage
    function saveProject(project) {
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects.push(project);
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // Function to update project in localStorage
    function updateProject(updatedProject) {
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const index = projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
            projects[index] = updatedProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }

    // Function to delete project from localStorage
    function deleteProject(projectId) {
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('projects', JSON.stringify(projects));

        // Also delete associated agents and tools
        let agents = JSON.parse(localStorage.getItem('agents') || '[]');
        agents = agents.filter(a => a.projectId !== projectId);
        localStorage.setItem('agents', JSON.stringify(agents));

        let tools = JSON.parse(localStorage.getItem('tools') || '[]');
        tools = tools.filter(t => t.projectId !== projectId);
        localStorage.setItem('tools', JSON.stringify(tools));
    }

    // Function to load projects from localStorage
    function loadProjects() {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');

        if (projects.length > 0) {
            // Hide empty state and show table
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('projectsTableContainer').style.display = 'block';

            // Update project counts based on agents and tools
            const agents = JSON.parse(localStorage.getItem('agents') || '[]');
            const tools = JSON.parse(localStorage.getItem('tools') || '[]');

            projects.forEach(project => {
                // Count agents and tools for this project
                project.agents = agents.filter(a => a.project === project.name).length;
                project.tools = tools.filter(t => t.project === project.name).length;

                addProjectToTable(project);
            });

            // Update localStorage with new counts
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }

    // Function to add project to table
    function addProjectToTable(project) {
        const tableBody = document.getElementById('projectsTableBody');
        const row = document.createElement('tr');
        row.dataset.projectId = project.id;

        row.innerHTML = `
            <td><a href="project.html?name=${encodeURIComponent(project.name)}" class="project-name">${project.name}</a></td>
            <td class="text">${project.type}</td>
            <td class="text">${project.agents}</td>
            <td class="text">${project.tools}</td>
            <td class="text">${project.integrations}</td>
            <td class="text">${project.interfaces}</td>
            <td class="text">${project.lastUpdated}</td>
            <td class="text">${project.updatedBy}</td>
        `;

        tableBody.appendChild(row);
    }

    // Add hover effects to nav items
    const navItems = document.querySelectorAll('.secondary-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Context menu functionality
    const contextMenu = document.getElementById('contextMenu');
    const projectsTableBody = document.getElementById('projectsTableBody');
    let selectedRow = null;
    let selectedProject = null;

    // Show context menu on right click
    if (projectsTableBody) {
        projectsTableBody.addEventListener('contextmenu', function(e) {
            e.preventDefault();

            // Find the closest tr element
            const row = e.target.closest('tr');
            if (!row) return;

            selectedRow = row;
            const projectId = parseInt(row.dataset.projectId);
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            selectedProject = projects.find(p => p.id === projectId);

            // Position the context menu
            const x = e.clientX;
            const y = e.clientY;

            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
            contextMenu.classList.add('active');
        });
    }

    // Hide context menu on click outside
    document.addEventListener('click', function(e) {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.classList.remove('active');
        }
    });

    // Handle context menu actions
    const contextMenuItems = document.querySelectorAll('.context-menu-item');
    contextMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;

            if (!selectedProject) return;

            switch(action) {
                case 'edit':
                    editProject(selectedProject);
                    break;
                case 'duplicate':
                    duplicateProject(selectedProject);
                    break;
                case 'bookmark':
                    toggleBookmark(selectedProject);
                    break;
                case 'delete':
                    if(confirm(`Are you sure you want to delete "${selectedProject.name}"? This will also delete all associated agents and tools.`)) {
                        deleteProject(selectedProject.id);
                        selectedRow.remove();

                        // Check if table is empty
                        const remainingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                        if (remainingProjects.length === 0) {
                            document.getElementById('emptyState').style.display = 'flex';
                            document.getElementById('projectsTableContainer').style.display = 'none';
                        }
                    }
                    break;
            }

            contextMenu.classList.remove('active');
        });
    });

    // Function to toggle bookmark
    function toggleBookmark(project) {
        let projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex(p => p.id === project.id);

        if (projectIndex !== -1) {
            projects[projectIndex].bookmarked = !projects[projectIndex].bookmarked;
            localStorage.setItem('projects', JSON.stringify(projects));

            // Reload bookmarked projects
            loadBookmarkedProjects();

            // Update context menu text
            updateContextMenuBookmarkText(projects[projectIndex].bookmarked);
        }
    }

    // Function to update bookmark text in context menu
    function updateContextMenuBookmarkText(isBookmarked) {
        const bookmarkText = contextMenu.querySelector('.bookmark-text');
        if (bookmarkText) {
            bookmarkText.textContent = isBookmarked ? 'Remove Bookmark' : 'Bookmark';
        }
    }

    // Update context menu bookmark text when opening menu
    const originalContextMenuShow = projectsTableBody.addEventListener;
    if (projectsTableBody) {
        projectsTableBody.addEventListener('contextmenu', function(e) {
            // Existing code runs first, then update bookmark text
            setTimeout(() => {
                if (selectedProject) {
                    updateContextMenuBookmarkText(selectedProject.bookmarked || false);
                }
            }, 0);
        });
    }

    // Function to load bookmarked projects
    function loadBookmarkedProjects() {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const bookmarkedProjects = projects.filter(p => p.bookmarked === true);

        const bookmarkedSection = document.getElementById('bookmarkedSection');
        const bookmarkedContainer = document.getElementById('bookmarkedProjects');

        if (bookmarkedProjects.length > 0) {
            bookmarkedSection.style.display = 'block';
            bookmarkedContainer.innerHTML = '';

            bookmarkedProjects.forEach(project => {
                const item = document.createElement('a');
                item.href = `project.html?name=${encodeURIComponent(project.name)}`;
                item.className = 'secondary-nav-item';
                item.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"/>
                    </svg>
                    <span class="subtext">${project.name}</span>
                `;
                bookmarkedContainer.appendChild(item);
            });
        } else {
            bookmarkedSection.style.display = 'none';
        }
    }

    // Bookmarked section expand/collapse functionality
    const bookmarkedToggle = document.getElementById('bookmarkedToggle');
    const bookmarkedSection = document.getElementById('bookmarkedSection');

    if (bookmarkedToggle) {
        bookmarkedToggle.addEventListener('click', function() {
            bookmarkedSection.classList.toggle('expanded');
        });
    }

    // Edit project function
    function editProject(project) {
        // Populate modal with existing project data
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('useRuntimeResource').checked = project.useRuntimeResource || false;
        document.getElementById('useWorkflowExecutor').checked = project.useWorkflowExecutor || false;

        // Change modal title and button text
        const modalTitle = modal.querySelector('.modal-header h2');
        const submitButton = modal.querySelector('button[type="submit"]');
        modalTitle.textContent = 'Edit Project';
        submitButton.textContent = 'Update';

        // Store the project being edited
        form.dataset.editingProjectId = project.id;

        // Open modal
        modal.classList.add('active');
    }

    // Modify form submission to handle both create and edit
    form.removeEventListener('submit', form.onsubmit);
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const projectName = document.getElementById('projectName').value.trim();
        const projectDescription = document.getElementById('projectDescription').value;
        const useRuntimeResource = document.getElementById('useRuntimeResource').checked;
        const useWorkflowExecutor = document.getElementById('useWorkflowExecutor').checked;

        // Clear any previous errors
        clearProjectNameError();

        // Validation 1: Check if project name is empty
        if (!projectName) {
            showProjectNameError('Name is required');
            return;
        }

        // Check if we're editing or creating
        const editingId = form.dataset.editingProjectId;

        // Validation 2: Check if project name already exists (only for create or when name is changed)
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const existingProject = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());

        if (!editingId && existingProject) {
            // Creating new project with duplicate name
            showProjectNameError('A project with this name already exists');
            return;
        } else if (editingId) {
            // Editing project - check if new name conflicts with another project
            const currentProject = projects.find(p => p.id === parseInt(editingId));
            if (currentProject && currentProject.name.toLowerCase() !== projectName.toLowerCase() && existingProject) {
                showProjectNameError('A project with this name already exists');
                return;
            }
        }

        if (editingId) {
            // Update existing project
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const project = projects.find(p => p.id === parseInt(editingId));

            if (project) {
                const oldName = project.name;
                project.name = projectName;
                project.description = projectDescription;
                project.useRuntimeResource = useRuntimeResource;
                project.useWorkflowExecutor = useWorkflowExecutor;
                project.lastUpdated = new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                updateProject(project);

                // Update agents and tools project name if project name changed
                if (oldName !== projectName) {
                    let agents = JSON.parse(localStorage.getItem('agents') || '[]');
                    agents.forEach(agent => {
                        if (agent.project === oldName) agent.project = projectName;
                    });
                    localStorage.setItem('agents', JSON.stringify(agents));

                    let tools = JSON.parse(localStorage.getItem('tools') || '[]');
                    tools.forEach(tool => {
                        if (tool.project === oldName) tool.project = projectName;
                    });
                    localStorage.setItem('tools', JSON.stringify(tools));
                }

                // Update the row in the table
                const row = document.querySelector(`tr[data-project-id="${editingId}"]`);
                if (row) {
                    row.querySelector('.project-name').textContent = project.name;
                    row.querySelector('.project-name').href = `project.html?name=${encodeURIComponent(project.name)}`;
                    row.cells[6].textContent = project.lastUpdated;
                }
            }

            // Reset modal
            delete form.dataset.editingProjectId;
            modal.querySelector('.modal-header h2').textContent = 'Create Project';
            modal.querySelector('button[type="submit"]').textContent = 'Create';
        } else {
            // Create new project
            const now = new Date();
            const lastUpdated = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });

            const project = {
                id: Date.now(),
                name: projectName,
                description: projectDescription,
                type: 'Self-defined',
                useRuntimeResource: useRuntimeResource,
                useWorkflowExecutor: useWorkflowExecutor,
                agents: 0,
                tools: 0,
                integrations: 0,
                interfaces: 0,
                lastUpdated: lastUpdated,
                updatedBy: 'Sam Gillis'
            };

            saveProject(project);
            addProjectToTable(project);

            // Hide empty state and show table
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('projectsTableContainer').style.display = 'block';
        }

        closeModal();
    });

    // Duplicate project modal functionality
    const duplicateModal = document.getElementById('duplicateProjectModal');
    const duplicateForm = document.getElementById('duplicateProjectForm');
    const closeDuplicateModalBtn = document.getElementById('closeDuplicateModalBtn');
    const cancelDuplicateBtn = document.getElementById('cancelDuplicateBtn');
    const duplicateModalOverlay = duplicateModal.querySelector('.modal-overlay');
    let projectToDuplicate = null;

    // Close duplicate modal function
    function closeDuplicateModal() {
        duplicateModal.classList.remove('active');
        duplicateForm.reset();
        projectToDuplicate = null;
        clearDuplicateProjectNameError();
    }

    // Function to show error for duplicate project name
    function showDuplicateProjectNameError(message) {
        const input = document.getElementById('duplicateProjectName');
        const errorDiv = document.getElementById('duplicateProjectNameError');
        input.classList.add('error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    // Function to clear error for duplicate project name
    function clearDuplicateProjectNameError() {
        const input = document.getElementById('duplicateProjectName');
        const errorDiv = document.getElementById('duplicateProjectNameError');
        input.classList.remove('error');
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }

    // Clear error when user starts typing
    document.getElementById('duplicateProjectName').addEventListener('input', clearDuplicateProjectNameError);

    // Close duplicate modal on close button
    closeDuplicateModalBtn.addEventListener('click', closeDuplicateModal);

    // Close duplicate modal on cancel button
    cancelDuplicateBtn.addEventListener('click', closeDuplicateModal);

    // Close duplicate modal on overlay click
    duplicateModalOverlay.addEventListener('click', closeDuplicateModal);

    // Duplicate project function - opens modal
    function duplicateProject(project) {
        projectToDuplicate = project;

        // Set default values
        document.getElementById('duplicateProjectName').value = `${project.name} (Copy)`;
        document.getElementById('duplicateProjectDescription').value = project.description || '';

        // Open modal
        duplicateModal.classList.add('active');
    }

    // Handle duplicate form submission
    duplicateForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!projectToDuplicate) return;

        const newName = document.getElementById('duplicateProjectName').value.trim();
        const newDescription = document.getElementById('duplicateProjectDescription').value;

        // Clear any previous errors
        clearDuplicateProjectNameError();

        // Validation 1: Check if project name is empty
        if (!newName) {
            showDuplicateProjectNameError('Name is required');
            return;
        }

        // Validation 2: Check if project name already exists
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const existingProject = projects.find(p => p.name.toLowerCase() === newName.toLowerCase());

        if (existingProject) {
            showDuplicateProjectNameError('A project with this name already exists');
            return;
        }

        const now = new Date();
        const lastUpdated = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        // Create duplicated project
        const duplicatedProject = {
            id: Date.now(),
            name: newName,
            description: newDescription,
            type: projectToDuplicate.type,
            useRuntimeResource: projectToDuplicate.useRuntimeResource,
            useWorkflowExecutor: projectToDuplicate.useWorkflowExecutor,
            agents: 0,
            tools: 0,
            integrations: 0,
            interfaces: 0,
            lastUpdated: lastUpdated,
            updatedBy: 'Sam Gillis'
        };

        // Duplicate agents
        const agents = JSON.parse(localStorage.getItem('agents') || '[]');
        const projectAgents = agents.filter(a => a.project === projectToDuplicate.name);
        projectAgents.forEach(agent => {
            const duplicatedAgent = {
                ...agent,
                project: newName,
                updatedOn: lastUpdated
            };
            agents.push(duplicatedAgent);
        });
        localStorage.setItem('agents', JSON.stringify(agents));
        duplicatedProject.agents = projectAgents.length;

        // Duplicate tools
        const tools = JSON.parse(localStorage.getItem('tools') || '[]');
        const projectTools = tools.filter(t => t.project === projectToDuplicate.name);
        projectTools.forEach(tool => {
            const duplicatedTool = {
                ...tool,
                project: newName,
                updatedOn: lastUpdated
            };
            tools.push(duplicatedTool);
        });
        localStorage.setItem('tools', JSON.stringify(tools));
        duplicatedProject.tools = projectTools.length;

        // Save duplicated project
        saveProject(duplicatedProject);
        addProjectToTable(duplicatedProject);

        closeDuplicateModal();
    });
});
