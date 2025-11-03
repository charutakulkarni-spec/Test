document.addEventListener('DOMContentLoaded', function() {
    // Get project name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('name') || 'Project Name';

    // Update page title
    document.getElementById('projectName').textContent = projectName;
    document.title = `${projectName} - AI Agent Foundry`;

    // Back button functionality
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Load and display agents from localStorage
    function loadAgents() {
        const agents = JSON.parse(localStorage.getItem('agents') || '[]');
        const projectAgents = agents.filter(agent => agent.project === projectName);

        const agentsTableBody = document.querySelector('#agents-tab .agents-table tbody');
        if (agentsTableBody && projectAgents.length > 0) {
            agentsTableBody.innerHTML = '';

            projectAgents.forEach(agent => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="#" class="agent-name text-primary">${agent.name}</a></td>
                    <td class="text">--</td>
                    <td class="text">${agent.model}</td>
                    <td><span class="tool-badge">Tool 1</span></td>
                    <td class="text">${agent.updatedOn}</td>
                    <td class="text">${agent.updatedBy}</td>
                    <td>
                        <button class="menu-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                            </svg>
                        </button>
                    </td>
                `;
                agentsTableBody.appendChild(row);
            });

            // Re-attach event listeners for new agent links
            attachAgentLinkListeners();
        }
    }

    // Load and display tools from localStorage
    function loadTools() {
        const tools = JSON.parse(localStorage.getItem('tools') || '[]');
        const projectTools = tools.filter(tool => tool.project === projectName);

        const toolsTableBody = document.querySelector('#tools-tab .agents-table tbody');
        if (toolsTableBody && projectTools.length > 0) {
            toolsTableBody.innerHTML = '';

            projectTools.forEach(tool => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><a href="#" class="tool-name text-primary">${tool.name}</a></td>
                    <td class="text">${tool.category || 'Self-managed'}</td>
                    <td class="text">${tool.type}</td>
                    <td class="text">${tool.updatedBy}</td>
                    <td class="text">${tool.updatedOn}</td>
                    <td>
                        <button class="menu-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                                <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                            </svg>
                        </button>
                    </td>
                `;
                toolsTableBody.appendChild(row);
            });

            // Re-attach event listeners for new tool links
            attachToolLinkListeners();
        }
    }

    // Load agents and tools on page load
    loadAgents();
    loadTools();

    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const createBtn = document.getElementById('createBtn');
    const createBtnText = document.getElementById('createBtnText');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // Remove active from all tabs
            tabBtns.forEach(tab => tab.classList.remove('active'));

            // Add active to clicked tab
            this.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            // Show the corresponding tab content
            const currentTab = document.getElementById(`${tabName}-tab`);
            if (currentTab) {
                currentTab.style.display = 'block';
            }

            // Update create button text
            switch(tabName) {
                case 'agents':
                    createBtnText.textContent = 'Create agent';
                    break;
                case 'tools':
                    createBtnText.textContent = 'Create tool';
                    break;
                case 'integrations':
                    createBtnText.textContent = 'Create integration';
                    break;
                case 'interfaces':
                    createBtnText.textContent = 'Create interface';
                    break;
            }
        });
    });

    // Create button functionality
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;

            switch(activeTab) {
                case 'agents':
                    window.location.href = `agent.html?project=${encodeURIComponent(projectName)}`;
                    break;
                case 'tools':
                    const createToolModal = document.getElementById('createToolModal');
                    createToolModal.classList.add('active');
                    break;
                case 'integrations':
                    alert('Create integration functionality - to be implemented');
                    break;
                case 'interfaces':
                    alert('Create interface functionality - to be implemented');
                    break;
            }
        });
    }

    // Create Tool Modal functionality
    const createToolModal = document.getElementById('createToolModal');
    const createToolForm = document.getElementById('createToolForm');
    const closeToolModalBtn = document.getElementById('closeToolModalBtn');
    const cancelToolBtn = document.getElementById('cancelToolBtn');
    const toolTypeSelect = document.getElementById('toolTypeSelect');
    const toolTypeDropdown = document.getElementById('toolTypeDropdown');
    const toolTypeOptions = document.querySelectorAll('.tool-type-option');
    const toolTypeInput = document.getElementById('toolType');
    const toolTypeValueDisplay = toolTypeSelect.querySelector('.custom-select-value');

    // Toggle dropdown
    if (toolTypeSelect) {
        toolTypeSelect.addEventListener('click', function(e) {
            e.stopPropagation();
            toolTypeDropdown.classList.toggle('open');
            toolTypeSelect.classList.toggle('open');
        });
    }

    // Handle tool type selection
    toolTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected from all options
            toolTypeOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected to clicked option
            this.classList.add('selected');

            // Set hidden input value
            toolTypeInput.value = this.dataset.type;

            // Update display value
            toolTypeValueDisplay.textContent = this.dataset.title;
            toolTypeValueDisplay.classList.add('selected');

            // Close dropdown
            toolTypeDropdown.classList.remove('open');
            toolTypeSelect.classList.remove('open');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (toolTypeDropdown && !toolTypeSelect.contains(e.target) && !toolTypeDropdown.contains(e.target)) {
            toolTypeDropdown.classList.remove('open');
            toolTypeSelect.classList.remove('open');
        }
    });

    // Close modal handlers
    if (closeToolModalBtn) {
        closeToolModalBtn.addEventListener('click', function() {
            createToolModal.classList.remove('active');
            createToolForm.reset();
            toolTypeOptions.forEach(opt => opt.classList.remove('selected'));
            toolTypeInput.value = '';
            toolTypeValueDisplay.textContent = 'Select';
            toolTypeValueDisplay.classList.remove('selected');
            toolTypeDropdown.classList.remove('open');
            toolTypeSelect.classList.remove('open');
        });
    }

    if (cancelToolBtn) {
        cancelToolBtn.addEventListener('click', function() {
            createToolModal.classList.remove('active');
            createToolForm.reset();
            toolTypeOptions.forEach(opt => opt.classList.remove('selected'));
            toolTypeInput.value = '';
            toolTypeValueDisplay.textContent = 'Select';
            toolTypeValueDisplay.classList.remove('selected');
            toolTypeDropdown.classList.remove('open');
            toolTypeSelect.classList.remove('open');
        });
    }

    // Close modal when clicking outside
    createToolModal.addEventListener('click', function(e) {
        if (e.target === createToolModal) {
            createToolModal.classList.remove('active');
            createToolForm.reset();
            toolTypeOptions.forEach(opt => opt.classList.remove('selected'));
            toolTypeInput.value = '';
            toolTypeValueDisplay.textContent = 'Select';
            toolTypeValueDisplay.classList.remove('selected');
            toolTypeDropdown.classList.remove('open');
            toolTypeSelect.classList.remove('open');
        }
    });

    // Handle form submission
    if (createToolForm) {
        createToolForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const toolName = document.getElementById('toolName').value;
            const toolType = toolTypeInput.value;
            const toolDescription = document.getElementById('toolDescription').value;

            // Validate required fields
            if (!toolName || !toolType) {
                alert('Please fill in all required fields (Tool name and Type)');
                return;
            }

            // Get the selected tool type title
            const selectedOption = document.querySelector(`.tool-type-option[data-type="${toolType}"]`);
            const toolTypeTitle = selectedOption ? selectedOption.dataset.title : toolType;

            // Create tool object
            const tool = {
                name: toolName,
                type: toolTypeTitle,
                description: toolDescription,
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

            // Get existing tools from localStorage
            let tools = JSON.parse(localStorage.getItem('tools') || '[]');

            // Add new tool
            tools.push(tool);

            // Save to localStorage
            localStorage.setItem('tools', JSON.stringify(tools));

            // Close modal and reset form
            createToolModal.classList.remove('active');
            createToolForm.reset();
            toolTypeOptions.forEach(opt => opt.classList.remove('selected'));
            toolTypeInput.value = '';
            toolTypeValueDisplay.textContent = 'Select';
            toolTypeValueDisplay.classList.remove('selected');

            // Reload tools table
            loadTools();

            console.log('Tool created:', tool);
        });
    }

    // Agent name links functionality
    function attachAgentLinkListeners() {
        const agentLinks = document.querySelectorAll('.agent-name');
        agentLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const agentName = this.textContent;
                window.location.href = `agent.html?name=${encodeURIComponent(agentName)}&project=${encodeURIComponent(projectName)}`;
            });
        });
    }

    // Tool name links functionality
    function attachToolLinkListeners() {
        const toolLinks = document.querySelectorAll('.tool-name');
        toolLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const toolName = this.textContent;
                window.location.href = `tool.html?name=${encodeURIComponent(toolName)}&project=${encodeURIComponent(projectName)}`;
            });
        });
    }

    // Initial attach for existing agents and tools
    attachAgentLinkListeners();
    attachToolLinkListeners();

    // Context menu functionality
    const contextMenu = document.getElementById('contextMenu');
    const agentsTable = document.querySelector('.agents-table tbody');
    let selectedRow = null;

    // Show context menu on right click
    agentsTable.addEventListener('contextmenu', function(e) {
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

    // Hide context menu on click outside
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('active');
        }
    });

    // Handle context menu actions
    const contextMenuItems = contextMenu.querySelectorAll('.context-menu-item');
    contextMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;

            if (!selectedRow) return;

            const agentName = selectedRow.querySelector('.agent-name').textContent;

            switch(action) {
                case 'edit':
                    console.log('Edit:', agentName);
                    alert(`Edit agent: ${agentName}`);
                    break;
                case 'duplicate':
                    console.log('Duplicate:', agentName);
                    alert(`Duplicate agent: ${agentName}`);
                    break;
                case 'delete':
                    console.log('Delete:', agentName);
                    if(confirm(`Are you sure you want to delete "${agentName}"?`)) {
                        selectedRow.remove();
                    }
                    break;
            }

            contextMenu.classList.remove('active');
        });
    });
});
