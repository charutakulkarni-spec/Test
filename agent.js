document.addEventListener('DOMContentLoaded', function() {
    // Get agent name and project name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const agentName = urlParams.get('name') || 'New Agent';
    const projectName = urlParams.get('project') || 'Project 1';

    // Update page title
    document.getElementById('agentName').textContent = agentName;
    document.title = `${agentName} - AI Agent Foundry`;

    // Back button functionality - go back to project page
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', function() {
        window.location.href = `project.html?name=${encodeURIComponent(projectName)}`;
    });

    // Stepper functionality
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContents = document.querySelectorAll('.step-content');
    let currentStepIndex = 0;

    function showStep(index) {
        // Remove active from all items
        stepperItems.forEach(step => step.classList.remove('active'));

        // Add active to current item
        if (stepperItems[index]) {
            stepperItems[index].classList.add('active');
        }

        // Hide all step contents
        stepContents.forEach(content => {
            content.style.display = 'none';
        });

        // Show the corresponding step content
        const stepId = `step-${index + 1}`;
        const currentStep = document.getElementById(stepId);
        if (currentStep) {
            currentStep.style.display = 'block';
        }

        currentStepIndex = index;
    }

    stepperItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            showStep(index);
        });
    });

    // Footer button functionality
    const backStepBtn = document.getElementById('backStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const createAgentBtn = document.getElementById('createAgentBtn');

    if (backStepBtn) {
        backStepBtn.addEventListener('click', function() {
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            }
        });
    }

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            if (currentStepIndex < stepperItems.length - 1) {
                showStep(currentStepIndex + 1);
            }
        });
    }

    if (createAgentBtn) {
        createAgentBtn.addEventListener('click', function() {
            // Get form values
            const agentNameInput = document.getElementById('agentNameInput').value;
            const modelName = document.getElementById('modelName').value;
            const temperature = document.getElementById('temperature').value;
            const systemPrompt = document.getElementById('systemPrompt').value;

            // Validate required fields
            if (!agentNameInput || !modelName) {
                alert('Please fill in all required fields (Agent name and Model name)');
                return;
            }

            // Create agent object
            const agent = {
                name: agentNameInput,
                model: modelName,
                temperature: temperature,
                systemPrompt: systemPrompt,
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

            // Get existing agents from localStorage
            let agents = JSON.parse(localStorage.getItem('agents') || '[]');

            // Add new agent
            agents.push(agent);

            // Save to localStorage
            localStorage.setItem('agents', JSON.stringify(agents));

            console.log('Agent created:', agent);

            // Redirect back to project page
            window.location.href = `project.html?name=${encodeURIComponent(projectName)}`;
        });
    }
});
