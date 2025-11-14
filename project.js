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

        const agentsTableBody = document.querySelector('#agentsTableContainer .agents-table tbody');
        const agentsEmptyState = document.getElementById('agentsEmptyState');
        const agentsTableContainer = document.getElementById('agentsTableContainer');

        if (projectAgents.length === 0) {
            // Show empty state
            agentsEmptyState.style.display = 'block';
            agentsTableContainer.style.display = 'none';
        } else {
            // Show table with data
            agentsEmptyState.style.display = 'none';
            agentsTableContainer.style.display = 'block';

            if (agentsTableBody) {
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
    }

    // Load and display tools from localStorage
    function loadTools() {
        const tools = JSON.parse(localStorage.getItem('tools') || '[]');
        const projectTools = tools.filter(tool => tool.project === projectName);

        const toolsTableBody = document.querySelector('#toolsTableContainer .agents-table tbody');
        const toolsEmptyState = document.getElementById('toolsEmptyState');
        const toolsTableContainer = document.getElementById('toolsTableContainer');

        if (projectTools.length === 0) {
            // Show empty state
            toolsEmptyState.style.display = 'block';
            toolsTableContainer.style.display = 'none';
        } else {
            // Show table with data
            toolsEmptyState.style.display = 'none';
            toolsTableContainer.style.display = 'block';

            if (toolsTableBody) {
                toolsTableBody.innerHTML = '';

                projectTools.forEach(tool => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-tool-name', tool.name);
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
                attachToolContextMenuListeners();
            }
        }
    }

    // Load and display interfaces from localStorage
    function loadInterfaces() {
        const interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');
        const projectInterfaces = interfaces.filter(iface => iface.project === projectName);

        const interfacesTableBody = document.querySelector('#interfacesTableContainer .agents-table tbody');
        const interfacesEmptyState = document.getElementById('interfacesEmptyState');
        const interfacesTableContainer = document.getElementById('interfacesTableContainer');

        if (projectInterfaces.length === 0) {
            // Show empty state
            interfacesEmptyState.style.display = 'block';
            interfacesTableContainer.style.display = 'none';
        } else {
            // Show table with data
            interfacesEmptyState.style.display = 'none';
            interfacesTableContainer.style.display = 'block';

            if (interfacesTableBody) {
                interfacesTableBody.innerHTML = '';

                projectInterfaces.forEach(iface => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-interface-name', iface.name);
                    row.innerHTML = `
                        <td><a href="#" class="interface-name text-primary">${iface.name}</a></td>
                        <td class="text">${iface.type}</td>
                        <td class="text">${iface.updatedBy}</td>
                        <td class="text">${iface.updatedOn}</td>
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
                    interfacesTableBody.appendChild(row);
                });

                // Re-attach event listeners for new interface links
                attachInterfaceLinkListeners();
                attachInterfaceContextMenuListeners();
            }
        }
    }

    // Load agents, tools and interfaces on page load
    loadAgents();
    loadTools();
    loadInterfaces();

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
                    const createInterfaceModal = document.getElementById('createInterfaceModal');
                    createInterfaceModal.classList.add('active');
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
        const toolNameInput = document.getElementById('toolName');
        const toolNameError = document.getElementById('toolNameError');

        // Clear error on input
        toolNameInput.addEventListener('input', function() {
            toolNameInput.classList.remove('error');
            toolNameError.classList.remove('show');
            toolNameError.textContent = '';
        });

        createToolForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const toolName = toolNameInput.value.trim();
            const toolType = toolTypeInput.value;
            const toolDescription = document.getElementById('toolDescription').value;

            // Clear previous errors
            toolNameInput.classList.remove('error');
            toolNameError.classList.remove('show');
            toolNameError.textContent = '';

            // Validate tool name
            if (!toolName) {
                toolNameInput.classList.add('error');
                toolNameError.textContent = 'Name is required.';
                toolNameError.classList.add('show');
                return;
            }

            // Check for duplicate tool name
            const tools = JSON.parse(localStorage.getItem('tools') || '[]');
            const duplicateTool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase() && t.project === projectName);

            if (duplicateTool) {
                toolNameInput.classList.add('error');
                toolNameError.textContent = 'A tool with this name already exists.';
                toolNameError.classList.add('show');
                return;
            }

            // Validate type
            if (!toolType) {
                alert('Please select a tool type');
                return;
            }

            // Store tool data temporarily in localStorage
            const toolData = {
                name: toolName,
                type: toolType,
                description: toolDescription,
                project: projectName
            };
            localStorage.setItem('currentToolData', JSON.stringify(toolData));

            // Redirect to the appropriate tool page based on type
            window.location.href = `tool-${toolType}.html?project=${encodeURIComponent(projectName)}`;
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

                // Find the tool in localStorage to get its type
                const tools = JSON.parse(localStorage.getItem('tools') || '[]');
                const tool = tools.find(t => t.name === toolName && t.project === projectName);

                if (tool) {
                    // Store tool data for editing
                    localStorage.setItem('currentToolData', JSON.stringify(tool));

                    // Determine which page to redirect to based on tool type
                    let toolPage = 'tool-text-knowledge-base.html'; // default

                    if (tool.type === 'Text Knowledge Base') {
                        toolPage = 'tool-text-knowledge-base.html';
                    } else if (tool.type === 'Database Knowledge Base') {
                        toolPage = 'tool-database-knowledge-base.html';
                    } else if (tool.type === 'Multi-media Knowledge Base') {
                        toolPage = 'tool-multimedia-knowledge-base.html';
                    } else if (tool.type === 'Image Generator') {
                        toolPage = 'tool-image-generator.html';
                    }

                    window.location.href = `${toolPage}?name=${encodeURIComponent(toolName)}&project=${encodeURIComponent(projectName)}`;
                }
            });
        });
    }

    // Tool context menu functionality
    function attachToolContextMenuListeners() {
        const toolRows = document.querySelectorAll('#toolsTableContainer tbody tr');
        const toolContextMenu = document.getElementById('toolContextMenu');

        console.log('Tool rows found:', toolRows.length);
        console.log('Tool context menu element:', toolContextMenu);

        if (!toolContextMenu) {
            console.error('Tool context menu not found');
            return;
        }

        toolRows.forEach(row => {
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const toolName = this.getAttribute('data-tool-name');

                console.log('Right-clicked tool:', toolName);

                // Position and show context menu
                toolContextMenu.style.left = `${e.pageX}px`;
                toolContextMenu.style.top = `${e.pageY}px`;
                toolContextMenu.classList.add('active');
                toolContextMenu.setAttribute('data-context-tool-name', toolName);
            });
        });

        // Handle context menu actions
        const contextMenuItems = toolContextMenu.querySelectorAll('.context-menu-item');
        contextMenuItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const toolName = toolContextMenu.getAttribute('data-context-tool-name');

                if (action === 'edit') {
                    // Find the tool and edit it
                    const tools = JSON.parse(localStorage.getItem('tools') || '[]');
                    const tool = tools.find(t => t.name === toolName && t.project === projectName);

                    if (tool) {
                        localStorage.setItem('currentToolData', JSON.stringify(tool));

                        let toolPage = 'tool-text-knowledge-base.html';
                        if (tool.type === 'Text Knowledge Base') {
                            toolPage = 'tool-text-knowledge-base.html';
                        } else if (tool.type === 'Database Knowledge Base') {
                            toolPage = 'tool-database-knowledge-base.html';
                        } else if (tool.type === 'Multi-media Knowledge Base') {
                            toolPage = 'tool-multimedia-knowledge-base.html';
                        } else if (tool.type === 'Image Generator') {
                            toolPage = 'tool-image-generator.html';
                        }

                        window.location.href = `${toolPage}?name=${encodeURIComponent(toolName)}&project=${encodeURIComponent(projectName)}`;
                    }
                } else if (action === 'delete') {
                    // Delete the tool
                    if (confirm(`Are you sure you want to delete "${toolName}"?`)) {
                        let tools = JSON.parse(localStorage.getItem('tools') || '[]');
                        tools = tools.filter(t => !(t.name === toolName && t.project === projectName));
                        localStorage.setItem('tools', JSON.stringify(tools));
                        loadTools(); // Reload the tools table
                    }
                }

                toolContextMenu.classList.remove('active');
            });
        });

        // Close context menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toolContextMenu.contains(e.target)) {
                toolContextMenu.classList.remove('active');
            }
        });
    }

    // Interface name links functionality
    function attachInterfaceLinkListeners() {
        const interfaceLinks = document.querySelectorAll('.interface-name');
        interfaceLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const interfaceName = this.textContent;

                // Find the interface in localStorage to get its type
                const interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');
                const iface = interfaces.find(i => i.name === interfaceName && i.project === projectName);

                if (iface) {
                    // Store interface data for editing
                    localStorage.setItem('currentInterfaceData', JSON.stringify(iface));

                    // Determine which page to redirect to based on interface type
                    let interfacePage = 'interface-form.html'; // default
                    let interfaceType = 'form'; // default

                    if (iface.type === 'Form') {
                        interfacePage = 'interface-form.html';
                        interfaceType = 'form';
                    } else if (iface.type === 'Chat') {
                        interfacePage = 'interface-chat.html';
                        interfaceType = 'chat';
                    } else if (iface.type === 'Chat + Form') {
                        interfacePage = 'interface-chat-form.html';
                        interfaceType = 'chat-form';
                    }

                    window.location.href = `${interfacePage}?name=${encodeURIComponent(interfaceName)}&project=${encodeURIComponent(projectName)}`;
                }
            });
        });
    }

    // Interface context menu functionality
    function attachInterfaceContextMenuListeners() {
        const interfaceRows = document.querySelectorAll('#interfacesTableContainer tbody tr');
        const interfaceContextMenu = document.getElementById('interfaceContextMenu');

        if (!interfaceContextMenu) {
            console.error('Interface context menu not found');
            return;
        }

        interfaceRows.forEach(row => {
            row.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const interfaceName = this.getAttribute('data-interface-name');

                // Position and show context menu
                interfaceContextMenu.style.left = `${e.pageX}px`;
                interfaceContextMenu.style.top = `${e.pageY}px`;
                interfaceContextMenu.classList.add('active');
                interfaceContextMenu.setAttribute('data-context-interface-name', interfaceName);
            });
        });

        // Handle context menu actions
        const contextMenuItems = interfaceContextMenu.querySelectorAll('.context-menu-item');
        contextMenuItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const interfaceName = interfaceContextMenu.getAttribute('data-context-interface-name');

                if (action === 'edit') {
                    // Find the interface and edit it
                    const interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');
                    const iface = interfaces.find(i => i.name === interfaceName && i.project === projectName);

                    if (iface) {
                        localStorage.setItem('currentInterfaceData', JSON.stringify(iface));

                        let interfacePage = 'interface-form.html';
                        if (iface.type === 'Form') {
                            interfacePage = 'interface-form.html';
                        } else if (iface.type === 'Chat') {
                            interfacePage = 'interface-chat.html';
                        } else if (iface.type === 'Chat + Form') {
                            interfacePage = 'interface-chat-form.html';
                        }

                        window.location.href = `${interfacePage}?name=${encodeURIComponent(interfaceName)}&project=${encodeURIComponent(projectName)}`;
                    }
                } else if (action === 'delete') {
                    // Delete the interface
                    if (confirm(`Are you sure you want to delete "${interfaceName}"?`)) {
                        let interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');
                        interfaces = interfaces.filter(i => !(i.name === interfaceName && i.project === projectName));
                        localStorage.setItem('interfaces', JSON.stringify(interfaces));
                        loadInterfaces(); // Reload the interfaces table
                    }
                }

                interfaceContextMenu.classList.remove('active');
            });
        });

        // Close context menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!interfaceContextMenu.contains(e.target)) {
                interfaceContextMenu.classList.remove('active');
            }
        });
    }

    // Initial attach for existing agents, tools and interfaces
    attachAgentLinkListeners();
    attachToolLinkListeners();
    attachToolContextMenuListeners();
    attachInterfaceLinkListeners();
    attachInterfaceContextMenuListeners();

    // Close banner functionality
    const closeElementsBanner = document.getElementById('closeElementsBanner');
    const elementsSection = document.querySelector('.elements-section');

    if (closeElementsBanner && elementsSection) {
        closeElementsBanner.addEventListener('click', function() {
            elementsSection.style.display = 'none';
        });
    }

    // Empty state create buttons
    const createAgentFromEmpty = document.getElementById('createAgentFromEmpty');
    const createToolFromEmpty = document.getElementById('createToolFromEmpty');
    const createIntegrationFromEmpty = document.getElementById('createIntegrationFromEmpty');
    const createInterfaceFromEmpty = document.getElementById('createInterfaceFromEmpty');

    if (createAgentFromEmpty) {
        createAgentFromEmpty.addEventListener('click', function() {
            window.location.href = `agent.html?project=${encodeURIComponent(projectName)}`;
        });
    }

    if (createToolFromEmpty) {
        createToolFromEmpty.addEventListener('click', function() {
            const createToolModal = document.getElementById('createToolModal');
            createToolModal.classList.add('active');
        });
    }

    if (createIntegrationFromEmpty) {
        createIntegrationFromEmpty.addEventListener('click', function() {
            alert('Create integration functionality - to be implemented');
        });
    }

    // Create Interface Modal
    const createInterfaceModal = document.getElementById('createInterfaceModal');
    const createInterfaceForm = document.getElementById('createInterfaceForm');
    const closeInterfaceModalBtn = document.getElementById('closeInterfaceModalBtn');
    const cancelInterfaceBtn = document.getElementById('cancelInterfaceBtn');

    if (createInterfaceFromEmpty) {
        createInterfaceFromEmpty.addEventListener('click', function() {
            createInterfaceModal.classList.add('active');
        });
    }

    if (closeInterfaceModalBtn) {
        closeInterfaceModalBtn.addEventListener('click', function() {
            createInterfaceModal.classList.remove('active');
        });
    }

    if (cancelInterfaceBtn) {
        cancelInterfaceBtn.addEventListener('click', function() {
            createInterfaceModal.classList.remove('active');
        });
    }

    // Interface Type Dropdown
    const interfaceTypeSelect = document.getElementById('interfaceTypeSelect');
    const interfaceTypeDropdown = document.getElementById('interfaceTypeDropdown');
    const interfaceTypeInput = document.getElementById('interfaceType');

    if (interfaceTypeSelect) {
        const interfaceTypeValueDisplay = interfaceTypeSelect.querySelector('.custom-select-value');

        interfaceTypeSelect.addEventListener('click', function(e) {
            e.preventDefault();
            interfaceTypeDropdown.classList.toggle('open');
            interfaceTypeSelect.classList.toggle('open');
        });

        const interfaceTypeOptions = interfaceTypeDropdown.querySelectorAll('.tool-type-option');
        interfaceTypeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-type');
                const title = this.getAttribute('data-title');

                interfaceTypeValueDisplay.textContent = title;
                interfaceTypeValueDisplay.classList.add('selected');
                interfaceTypeInput.value = value;

                interfaceTypeDropdown.classList.remove('open');
                interfaceTypeSelect.classList.remove('open');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!interfaceTypeSelect.contains(e.target) && !interfaceTypeDropdown.contains(e.target)) {
                interfaceTypeDropdown.classList.remove('open');
                interfaceTypeSelect.classList.remove('open');
            }
        });
    }

    // Handle interface form submission
    if (createInterfaceForm) {
        const interfaceNameInput = document.getElementById('interfaceName');
        const interfaceNameError = document.getElementById('interfaceNameError');

        // Clear error on input
        interfaceNameInput.addEventListener('input', function() {
            interfaceNameInput.classList.remove('error');
            interfaceNameError.classList.remove('show');
            interfaceNameError.textContent = '';
        });

        createInterfaceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const interfaceName = interfaceNameInput.value.trim();
            const interfaceType = interfaceTypeInput.value;
            const interfaceDescription = document.getElementById('interfaceDescription').value;

            // Clear previous errors
            interfaceNameInput.classList.remove('error');
            interfaceNameError.classList.remove('show');
            interfaceNameError.textContent = '';

            // Validate interface name
            if (!interfaceName) {
                interfaceNameInput.classList.add('error');
                interfaceNameError.textContent = 'Name is required.';
                interfaceNameError.classList.add('show');
                return;
            }

            // Check for duplicate interface name
            const interfaces = JSON.parse(localStorage.getItem('interfaces') || '[]');
            const duplicateInterface = interfaces.find(i => i.name.toLowerCase() === interfaceName.toLowerCase() && i.project === projectName);

            if (duplicateInterface) {
                interfaceNameInput.classList.add('error');
                interfaceNameError.textContent = 'An interface with this name already exists.';
                interfaceNameError.classList.add('show');
                return;
            }

            // Validate type
            if (!interfaceType) {
                alert('Please select an interface type');
                return;
            }

            // Get type title for display
            const typeOptionElement = document.querySelector(`#interfaceTypeDropdown .tool-type-option[data-type="${interfaceType}"]`);
            const typeTitle = typeOptionElement ? typeOptionElement.getAttribute('data-title') : interfaceType;

            // Create interface data with timestamp
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' +
                                 currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            const interfaceData = {
                name: interfaceName,
                type: typeTitle,
                description: interfaceDescription,
                project: projectName,
                updatedBy: 'Admin',
                updatedOn: formattedDate
            };

            // Save interface to localStorage
            interfaces.push(interfaceData);
            localStorage.setItem('interfaces', JSON.stringify(interfaces));

            // Store interface data temporarily for editing
            localStorage.setItem('currentInterfaceData', JSON.stringify(interfaceData));

            // Redirect to the appropriate interface page based on type
            window.location.href = `interface-${interfaceType}.html?name=${encodeURIComponent(interfaceName)}&project=${encodeURIComponent(projectName)}`;
        });
    }

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
