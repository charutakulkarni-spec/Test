// Add click event listeners to create project buttons
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('createProjectModal');
    const createProjectButtons = document.querySelectorAll('.create-project-btn, .create-project-btn-main');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalOverlay = document.querySelector('.modal-overlay');
    const form = document.getElementById('createProjectForm');

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
    }

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
        const lastUpdated = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Add project to table
        addProjectToTable({
            name: projectName,
            type: 'Self-defined',
            agents: 0,
            tools: 0,
            integrations: 0,
            interfaces: 0,
            lastUpdated: lastUpdated,
            updatedBy: 'Current User'
        });

        // Hide empty state and show table
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('projectsTableContainer').style.display = 'block';

        closeModal();
    });

    // Function to add project to table
    function addProjectToTable(project) {
        const tableBody = document.getElementById('projectsTableBody');
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><a href="project.html?name=${encodeURIComponent(project.name)}" class="project-name">${project.name}</a></td>
            <td>${project.type}</td>
            <td>${project.agents}</td>
            <td>${project.tools}</td>
            <td>${project.integrations}</td>
            <td>${project.interfaces}</td>
            <td>${project.lastUpdated}</td>
            <td>${project.updatedBy}</td>
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

    // Show context menu on right click
    if (projectsTableBody) {
        projectsTableBody.addEventListener('contextmenu', function(e) {
            e.preventDefault();

            // Find the closest tr element
            const row = e.target.closest('tr');
            if (!row) return;

            selectedRow = row;

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

            if (!selectedRow) return;

            const projectNameLink = selectedRow.querySelector('.project-name');
            const projectName = projectNameLink ? projectNameLink.textContent : '';

            switch(action) {
                case 'edit':
                    console.log('Edit:', projectName);
                    alert(`Edit project: ${projectName}`);
                    break;
                case 'duplicate':
                    console.log('Duplicate:', projectName);
                    alert(`Duplicate project: ${projectName}`);
                    break;
                case 'delete':
                    console.log('Delete:', projectName);
                    if(confirm(`Are you sure you want to delete "${projectName}"?`)) {
                        selectedRow.remove();
                    }
                    break;
            }

            contextMenu.classList.remove('active');
        });
    });
});
