document.addEventListener('DOMContentLoaded', function() {
    // Get project name and tool name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('project') || 'Project Name';
    const toolName = urlParams.get('name');

    // Get tool data from localStorage
    const toolData = JSON.parse(localStorage.getItem('currentToolData') || '{}');

    // Determine if we're editing an existing tool or creating a new one
    const isEditing = !!toolName;

    // Update button text if editing
    if (isEditing) {
        document.getElementById('createBtn').textContent = 'Save';
    }

    // Populate form with tool data
    if (toolData.name) {
        document.getElementById('toolTitle').textContent = isEditing ? toolData.name : 'Create Database Knowledge Base';
        document.getElementById('name').value = toolData.name;
    }

    if (toolData.description) {
        document.getElementById('description').value = toolData.description;
    }

    if (toolData.databaseName) {
        document.getElementById('databaseName').value = toolData.databaseName;
        document.querySelector('#databaseNameSelect .custom-select-value').textContent = toolData.databaseName;
        document.querySelector('#databaseNameSelect .custom-select-value').classList.add('selected');
    }

    // Initialize CodeMirror for SQL editor
    const queryTextarea = document.getElementById('query');
    const sqlEditor = CodeMirror.fromTextArea(queryTextarea, {
        mode: 'text/x-sql',
        theme: 'neo',
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        indentWithTabs: true,
        smartIndent: true,
        height: '300px',
        extraKeys: {
            'Ctrl-Space': 'autocomplete'
        },
        hintOptions: {
            tables: {
                'users': ['id', 'name', 'email', 'created_at'],
                'orders': ['id', 'user_id', 'total', 'status', 'created_at'],
                'products': ['id', 'name', 'price', 'stock', 'category'],
                'categories': ['id', 'name', 'description']
            }
        }
    });

    // Set initial value if editing
    if (toolData.query) {
        sqlEditor.setValue(toolData.query);
    }

    // Enhanced auto-trigger autocomplete
    sqlEditor.on('inputRead', function(cm, change) {
        // Don't show hints if we're in the middle of deleting
        if (change.origin === '+delete') return;

        const cursor = cm.getCursor();
        const token = cm.getTokenAt(cursor);
        const currentLine = cm.getLine(cursor.line);
        const textBeforeCursor = currentLine.substring(0, cursor.ch).toUpperCase();

        // Check if we just typed SELECT or FROM
        if (textBeforeCursor.match(/\b(SELECT|FROM)\s*$/)) {
            // Show hints immediately after SELECT or FROM
            setTimeout(() => {
                cm.showHint({
                    completeSingle: false,
                    alignWithWord: true,
                    closeCharacters: /[\s()\[\]{};:>,]/
                });
            }, 100);
        }
        // Show hints when typing after SELECT or FROM
        else if (textBeforeCursor.match(/\b(SELECT|FROM)\s+\w*$/)) {
            cm.showHint({
                completeSingle: false,
                alignWithWord: true,
                closeCharacters: /[\s()\[\]{};:>,]/
            });
        }
        // Show hints when user starts typing any letter
        else if (change.text[0].match(/[a-zA-Z]/)) {
            cm.showHint({
                completeSingle: false,
                alignWithWord: true
            });
        }
    });

    // Also trigger autocomplete when user types space after SELECT or FROM
    sqlEditor.on('keyup', function(cm, event) {
        if (event.key === ' ') {
            const cursor = cm.getCursor();
            const currentLine = cm.getLine(cursor.line);
            const textBeforeCursor = currentLine.substring(0, cursor.ch).toUpperCase();

            if (textBeforeCursor.match(/\b(SELECT|FROM)\s$/)) {
                cm.showHint({
                    completeSingle: false,
                    alignWithWord: true
                });
            }
        }
    });

    // Database Name Dropdown
    const databaseNameSelect = document.getElementById('databaseNameSelect');
    const databaseNameDropdown = document.getElementById('databaseNameDropdown');
    const databaseNameValue = document.querySelector('#databaseNameSelect .custom-select-value');
    const databaseNameInput = document.getElementById('databaseName');

    databaseNameSelect.addEventListener('click', function(e) {
        e.preventDefault();
        databaseNameDropdown.classList.toggle('open');
        databaseNameSelect.classList.toggle('open');
    });

    const databaseNameOptions = databaseNameDropdown.querySelectorAll('.select-option');
    databaseNameOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const displayText = this.textContent;

            databaseNameValue.textContent = displayText;
            databaseNameValue.classList.add('selected');
            databaseNameInput.value = value;

            databaseNameDropdown.classList.remove('open');
            databaseNameSelect.classList.remove('open');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!databaseNameSelect.contains(e.target) && !databaseNameDropdown.contains(e.target)) {
            databaseNameDropdown.classList.remove('open');
            databaseNameSelect.classList.remove('open');
        }
    });

    // Schema Sidebar functionality
    const viewSchemaBtn = document.getElementById('viewSchemaBtn');
    const schemaSidebar = document.getElementById('schemaSidebar');
    const closeSchemaBtn = document.getElementById('closeSchemaBtn');
    const schemaDatabaseNameEl = document.getElementById('schemaDatabaseName');

    viewSchemaBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Update database name in schema panel
        const selectedDatabase = databaseNameValue.textContent;
        if (selectedDatabase && selectedDatabase !== 'Select database') {
            schemaDatabaseNameEl.textContent = selectedDatabase;
        } else {
            schemaDatabaseNameEl.textContent = 'No database selected';
        }

        schemaSidebar.classList.toggle('open');
    });

    closeSchemaBtn.addEventListener('click', function() {
        schemaSidebar.classList.remove('open');
    });

    // Handle table collapse/expand
    const schemaTableHeaders = document.querySelectorAll('.schema-table-header');
    schemaTableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const schemaTable = this.closest('.schema-table');
            schemaTable.classList.toggle('expanded');
        });
    });

    // Enable drag-and-drop from schema to SQL editor
    function setupDragAndDrop() {
        const schemaColumns = document.querySelectorAll('.schema-column');
        const schemaTableNames = document.querySelectorAll('.schema-table-name');

        // Make columns draggable
        schemaColumns.forEach(column => {
            column.setAttribute('draggable', 'true');

            column.addEventListener('dragstart', function(e) {
                const columnName = this.textContent.split(' ')[0]; // Get column name without type
                e.dataTransfer.setData('text/plain', columnName);
                this.classList.add('dragging');
            });

            column.addEventListener('dragend', function(e) {
                this.classList.remove('dragging');
            });
        });

        // Make table names draggable
        schemaTableNames.forEach(tableName => {
            tableName.setAttribute('draggable', 'true');
            tableName.style.cursor = 'grab';

            tableName.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.textContent);
                e.stopPropagation(); // Prevent parent click event
            });

            tableName.addEventListener('dragend', function(e) {
                this.style.cursor = 'grab';
            });
        });
    }

    // Set up drop zone in CodeMirror
    const codeMirrorElement = sqlEditor.getWrapperElement();

    codeMirrorElement.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, true);

    codeMirrorElement.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const droppedText = e.dataTransfer.getData('text/plain');

        // Get the cursor position where the drop occurred
        const coords = {left: e.clientX, top: e.clientY};
        const pos = sqlEditor.coordsChar(coords);

        // Insert the text at the cursor position
        sqlEditor.replaceRange(droppedText, pos);

        // Focus the editor and position cursor after inserted text
        sqlEditor.focus();
        sqlEditor.setCursor({
            line: pos.line,
            ch: pos.ch + droppedText.length
        });

        return false;
    }, true);

    // Initialize drag and drop
    setupDragAndDrop();

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
        const databaseName = document.getElementById('databaseName').value;
        const query = sqlEditor.getValue().trim();

        // Validate required fields
        if (!name) {
            alert('Please enter a tool name');
            return;
        }

        if (!databaseName) {
            alert('Please select a database name');
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
                    databaseName: databaseName,
                    query: query,
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
                type: 'Database Knowledge Base',
                description: description,
                databaseName: databaseName,
                query: query,
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
