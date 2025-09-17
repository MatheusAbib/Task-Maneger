
let modalSteps = [];       
let newTaskSteps = [];
let currentTaskElement = null;
let taskToDelete = null;

// ----------------------------
// Funções de Tarefas
// ----------------------------
function addTask() {
    const input = document.getElementById("new-task");
    const description = document.getElementById("description");
    const dueDate = document.getElementById("due-date");
    const priority = document.getElementById("priority");
    const responsible = document.getElementById("responsible");
    const timeEstimated = document.getElementById("time-estimated");
    const recurrence = document.getElementById("recurrence");
    const category = document.getElementById("category");
    const tasksWrapper = document.getElementById("tasks-wrapper");
    const emptyState = document.getElementById("empty-state");

    const taskName = input.value.trim();
    const taskDescription = description.value.trim();
    const taskDueDate = dueDate.value;
    const taskPriority = priority.value;
    const taskResponsible = responsible.value.trim();
    const taskTimeEstimated = timeEstimated.value.trim();
    const taskRecurrence = recurrence.value;
    const taskCategory = category.value.trim();

    // Verificação de campos obrigatórios
    let invalid = false;
    if (taskName === "") { input.style.borderColor = "var(--error)"; invalid = true; }
    if (taskDescription === "") { description.style.borderColor = "var(--error)"; invalid = true; }
    if (!taskDueDate) { dueDate.style.borderColor = "var(--error)"; invalid = true; }
    if (taskResponsible === "") { responsible.style.borderColor = "var(--error)"; invalid = true; }

    if (invalid) {
        setTimeout(() => {
            input.style.borderColor = "var(--border)";
            description.style.borderColor = "var(--border)";
            dueDate.style.borderColor = "var(--border)";
            responsible.style.borderColor = "var(--border)";
        }, 1500);
        input.focus();
        showNotification("Preencha todos os campos obrigatórios!");
        return; // não cria a tarefa
    }

    if (emptyState) emptyState.style.display = "none";

    const taskElement = document.createElement("div");
    taskElement.className = "task";

    // Formatar data
    let formattedDate = "Sem data definida";
    if (taskDueDate) {
        const dateObj = new Date(taskDueDate);
        formattedDate = dateObj.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Definir prioridade
    let priorityClass = "priority-medium";
    let priorityText = "Média Prioridade";
    if (taskPriority === "high") {
        priorityClass = "priority-high";
        priorityText = "Alta Prioridade";
    } else if (taskPriority === "medium") {
        priorityClass = "priority-medium";
        priorityText = "Média Prioridade";
    } else if (taskPriority === "low") {
        priorityClass = "priority-low";
        priorityText = "Baixa Prioridade";
    }

    // Montar HTML dos passos
    let stepsListHTML = "";
    const effectiveNewSteps = newTaskSteps.filter(s => s.trim() !== "");
    if (effectiveNewSteps.length > 0) {
        stepsListHTML = `<div class="task-steps-wrapper"><ul class="task-steps">${effectiveNewSteps.map(s => `<li>${s}</li>`).join('')}</ul></div>`;
    }

    // Conteúdo da tarefa
    taskElement.innerHTML = `
        <div class="task-header">
            <input type="checkbox" class="task-item" onchange="toggleTaskComplete(this)">
            <div class="task-content">
                <span class="task-priority ${priorityClass}">${priorityText}</span>
                <h3 class="task-title">${taskName} ${taskCategory ? `<span class="task-category">• ${taskCategory}</span>` : ''}</h3>
                <p class="task-description">${taskDescription}</p>
                ${stepsListHTML}

                <div class="task-meta">
                    <span class="task-date">${formattedDate}</span>

                    <span class="task-responsible">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" 
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${taskResponsible}
                    </span>

                    ${taskTimeEstimated ? `
                    <span class="task-time">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${taskTimeEstimated}
                    </span>` : ''}

                    ${taskRecurrence && taskRecurrence !== "none" ? `
                    <span class="task-recurrence">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <polyline points="23 20 23 14 17 14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                            <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14"></path>
                        </svg>
                        ${taskRecurrence}
                    </span>` : ''}

                    <div class="task-actions">
                        <button class="task-btn steps-btn" onclick="openTaskStepsModal(this)" title="Ver passos">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap='round' stroke-linejoin='round'>
                                <path d="M12 6v6l4 2"></path>
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </button>
                        <button class="task-btn delete-btn" onclick="requestDeleteTask(this)" title="Excluir tarefa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap='round' stroke-linejoin='round'>
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="task-progress-container">
                    <input type="range" class="task-progress" min="0" max="100" value="0" oninput="updateProgress(this)">
                    <span class="task-progress-value">0%</span>
                </div>
            </div>
        </div>
    `;

    tasksWrapper.insertBefore(taskElement, tasksWrapper.firstChild);

    // Limpar campos
    input.value = "";
    description.value = "";
    dueDate.value = "";
    responsible.value = "";
    timeEstimated.value = "";
    category.value = "";

    // Notificação
    showNotification("Tarefa criada com sucesso!");

    // limpar buffer de passos
    newTaskSteps = [];
    modalSteps = [];
    renderSteps();

    input.focus();
    updateTasksCount();
    saveTasks();
}


function toggleTaskComplete(checkbox) {
    const task = checkbox.closest(".task");
    task.classList.toggle("completed", checkbox.checked);
    reorderTasks();
    saveTasks();
}

function reorderTasks() {
    const tasksWrapper = document.getElementById("tasks-wrapper");
    const tasks = Array.from(tasksWrapper.children).filter(el => el.classList.contains("task"));
    tasks.sort((a,b) => {
        const aCompleted = a.classList.contains("completed");
        const bCompleted = b.classList.contains("completed");
        if(aCompleted !== bCompleted) return aCompleted - bCompleted;
        const aPriority = getPriorityValue(a);
        const bPriority = getPriorityValue(b);
        return bPriority - aPriority;
    });
    tasks.forEach(task => tasksWrapper.appendChild(task));
}

function getPriorityValue(taskElement) {
    const priorityElement = taskElement.querySelector(".task-priority");
    if(!priorityElement) return 1;
    if(priorityElement.classList.contains("priority-high")) return 3;
    if(priorityElement.classList.contains("priority-medium")) return 2;
    return 1;
}

function requestDeleteTask(button) {
    taskToDelete = button.closest(".task");
    document.getElementById("delete-confirm-modal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("delete-confirm-modal").style.display = "none";
}

function confirmDelete() {
    if (taskToDelete) {
        taskToDelete.style.opacity = "0";
        taskToDelete.style.transform = "translateX(-20px)";
        setTimeout(() => {
            taskToDelete.remove();
            updateTasksCount();
            checkEmptyState();
            saveTasks();
            taskToDelete = null;
            closeDeleteModal();
        }, 200);
    }
}

function checkEmptyState() {
    const tasksWrapper = document.getElementById("tasks-wrapper");
    const emptyState = document.getElementById("empty-state");
    const hasTasks = tasksWrapper.querySelector(".task");
    if(!hasTasks && emptyState) emptyState.style.display = "flex";
}

function updateTasksCount() {
    const countElement = document.getElementById("tasks-count");
    const tasks = document.querySelectorAll(".task");
    const completedTasks = document.querySelectorAll(".task.completed").length;
    const totalTasks = tasks.length;
    countElement.textContent = `${totalTasks} ${totalTasks===1?'item':'itens'} (${completedTasks} concluídos)`;
}

function saveTasks() {
    const tasksWrapper = document.getElementById("tasks-wrapper");
    const tasks = tasksWrapper.querySelectorAll(".task");
    const tasksData = [];
    tasks.forEach(task => {
        tasksData.push({
            title: task.querySelector(".task-title").childNodes[0].textContent.trim(),
            description: task.querySelector(".task-description")?.textContent || "",
            date: task.querySelector(".task-date").textContent,
            priority: task.querySelector(".task-priority")?.textContent || "Média Prioridade",
            responsible: task.querySelector(".task-responsible")?.textContent.replace("Responsável: ","") || "",
            timeEstimated: task.querySelector(".task-time")?.textContent.replace("Tempo: ","") || "",
            recurrence: task.querySelector(".task-recurrence")?.textContent.replace("Recorrência: ","") || "",
            steps: Array.from(task.querySelectorAll(".task-steps li")).map(li => li.textContent),
            category: task.querySelector(".task-category")?.textContent.replace("• ","") || "",
            completed: task.classList.contains("completed"),
            progress: task.querySelector(".task-progress")?.value || 0
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasksData));
    updateTasksCount();
}

function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    const tasksWrapper = document.getElementById("tasks-wrapper");
    const emptyState = document.getElementById("empty-state");

    if(savedTasks){
        const tasksData = JSON.parse(savedTasks);
        if(tasksData.length>0){
            emptyState.style.display = "none";
            tasksData.forEach(taskData=>{
                const taskElement = document.createElement("div");
                taskElement.className = `task ${taskData.completed?'completed':''}`;
                let priorityClass="";
                if(taskData.priority.includes("Alta")) priorityClass="priority-high";
                else if(taskData.priority.includes("Média")) priorityClass="priority-medium";
                else priorityClass="priority-low";

                taskElement.innerHTML = `
<div class="task-header">
    <input type="checkbox" class="task-item" ${taskData.completed?'checked':''} onchange="toggleTaskComplete(this)">
    <div class="task-content">
        <span class="task-priority ${priorityClass}">${taskData.priority}</span>
<h3 class="task-title">
    ${taskData.title} ${taskData.category ? `<span class="task-category">• ${taskData.category}</span>` : ''}
</h3>
${taskData.description?`<p class="task-description">${taskData.description}</p>`:''}
${taskData.steps && taskData.steps.length > 0 ? `<div class="task-steps-wrapper"><ul class="task-steps">${taskData.steps.map(s=>`<li>${s}</li>`).join('')}</ul></div>` : ''}


        <div class="task-meta">
            <span class="task-date">${taskData.date}</span>

            ${taskData.responsible?`
                <span class="task-responsible">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" 
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    ${taskData.responsible}
                </span>`:''}

            ${taskData.timeEstimated?`
                <span class="task-time">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${taskData.timeEstimated}
                </span>`:''}

            ${taskData.recurrence && taskData.recurrence!=="none"?`
                <span class="task-recurrence">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <polyline points="23 20 23 14 17 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                        <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14"></path>
                    </svg>
                    ${taskData.recurrence}
                </span>`:''}

            <div class="task-actions">
                <button class="task-btn steps-btn" onclick="openTaskStepsModal(this)" title="Ver passos">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap='round' stroke-linejoin='round'>
                        <path d="M12 6v6l4 2"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </button>
                <button class="task-btn delete-btn" onclick="requestDeleteTask(this)" title="Excluir tarefa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap='round' stroke-linejoin='round'>
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        </div>

        <div class="task-progress-container">
            <input type="range" class="task-progress" min="0" max="100" value="${taskData.progress || 0}" oninput="updateProgress(this)">
            <span class="task-progress-value">${taskData.progress || 0}%</span>
        </div>
    </div>
</div>
`;

                tasksWrapper.appendChild(taskElement);
            });
            updateTasksCount();
        }
    }
}

// ----------------------------
// Modal de Passos
// ----------------------------

function openTaskStepsModal(button) {
    const task = button.closest(".task");
    if (!task) return;

    // editar passos de uma tarefa existente
    currentTaskElement = task;
    const taskStepsList = task.querySelectorAll(".task-steps li");
    modalSteps = Array.from(taskStepsList).map(li => li.textContent);
    // garante pelo menos 1 campo para editar
    if (modalSteps.length === 0) modalSteps = [""];
    renderSteps();
    document.getElementById("steps-modal").style.display = "flex";
}

function openNewTaskStepsModal() {
    // criar passos para nova tarefa
    currentTaskElement = null;
    modalSteps = (newTaskSteps && newTaskSteps.length > 0) ? newTaskSteps.slice() : [""];
    renderSteps();
    document.getElementById("steps-modal").style.display = "flex";
}

function closeStepsModal() {
    if (currentTaskElement) {
        // monta os passos
        let stepsListHTML = '';
        const effective = modalSteps.filter(s => s.trim() !== "");
        if (effective.length > 0) {
            stepsListHTML = `<ul class="task-steps">${effective.map(s => `<li>${s}</li>`).join('')}</ul>`;
        }

        const taskContent = currentTaskElement.querySelector(".task-content");
        let descriptionElement = taskContent.querySelector(".task-description");

        // se não tiver descrição, cria uma vazia para referência
        if (!descriptionElement) {
            descriptionElement = document.createElement("p");
            descriptionElement.className = "task-description";
            descriptionElement.innerHTML = "&nbsp;"; // para não ficar colapsada
            taskContent.insertBefore(descriptionElement, taskContent.firstChild);
        }

        const existingList = taskContent.querySelector(".task-steps");
        if (existingList) {
            if (stepsListHTML === '') existingList.remove(); // remove se vazio
            else existingList.outerHTML = stepsListHTML;      // atualiza se tiver conteúdo
        } else if (stepsListHTML !== '') {
            descriptionElement.insertAdjacentHTML('afterend', stepsListHTML); // insere logo abaixo da descrição
        }

        saveTasks();
    } else {
        // usuário estava criando nova tarefa: grava no buffer
        newTaskSteps = modalSteps.slice();
    }

    document.getElementById("steps-modal").style.display = "none";
    modalSteps = [];
    currentTaskElement = null;
    renderSteps(); // limpa o modal
}


function addStep() {
    modalSteps.push("");
    renderSteps();
}

function removeStep(index) {
    modalSteps.splice(index, 1);
    // se remover todos, deixa sempre um campo vazio pra UX (opcional)
    if (modalSteps.length === 0) modalSteps = [""];
    renderSteps();
}

function updateStep(index, value) {
    modalSteps[index] = value;
}

function renderSteps() {
    const container = document.getElementById("steps-container");
    if (!container) return;
    container.innerHTML = "";
    modalSteps.forEach((step, i) => {
        const stepGroup = document.createElement("div");
        stepGroup.className = "step-input-group";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "step-input";
        input.placeholder = `Passo ${i + 1}`;
        input.value = step;
        input.oninput = e => updateStep(i, e.target.value);

        const removeBtn = document.createElement("button");
        removeBtn.className = "step-remove";
        removeBtn.innerHTML = "&times;";
        removeBtn.onclick = () => removeStep(i);

        stepGroup.appendChild(input);
        stepGroup.appendChild(removeBtn);
        container.appendChild(stepGroup);
    });
}

// ----------------------------
// Progresso
// ----------------------------

function updateProgress(slider) {
    const value = slider.value;
    const taskContent = slider.closest(".task-content");
    const valueDisplay = taskContent.querySelector(".task-progress-value");
    valueDisplay.textContent = `${value}%`;
    saveTasks();
}

// ----------------------------
// Notificações
// ----------------------------

function showNotification(message) {
    const notification = document.getElementById("notification");
    const messageElement = document.getElementById("notification-message");

    messageElement.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// ----------------------------
// Inicialização
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("due-date").min = today;

    document.getElementById("new-task").addEventListener("keypress", (e) => { 
        if (e.key === "Enter") addTask(); 
    });

    // Inicializar tema
    const toggleThemeBtn = document.getElementById("toggle-theme-btn");
    const body = document.body;

    function applyTheme(theme) {
        const icon = toggleThemeBtn.querySelector("i");
        if (theme === "dark") {
            body.classList.add("dark-mode");
            icon.className = "bi bi-sun-fill";
            toggleThemeBtn.childNodes[1].textContent = " Modo Claro";
        } else {
            body.classList.remove("dark-mode");
            icon.className = "bi bi-moon-fill";
            toggleThemeBtn.childNodes[1].textContent = " Modo Escuro";
        }
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }

    toggleThemeBtn.addEventListener("click", () => {
        const isDark = body.classList.toggle("dark-mode");
        const newTheme = isDark ? "dark" : "light";
        localStorage.setItem("theme", newTheme);

        const icon = toggleThemeBtn.querySelector("i");
        if (isDark) {
            icon.className = "bi bi-sun-fill";
            toggleThemeBtn.childNodes[1].textContent = " Modo Claro";
        } else {
            icon.className = "bi bi-moon-fill";
            toggleThemeBtn.childNodes[1].textContent = " Modo Escuro";
        }
    });

    // Fechar modais ao clicar fora deles
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.style.display = "none";
        }
    });
});


const css = `
    /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
            font-size: 1.4rem;
            color: var(--text);
            font-weight: 600;
        }

        .modal-close {
            background: none;
            border: none;
            color: var(--text-light);
            font-size: 1.5rem;
            cursor: pointer;
            transition: var(--transition);
        }

        .modal-close:hover {
            color: var(--error);
        }

        .modal-body {
            margin-bottom: 1.5rem;
        }

        .modal-btn {
            padding: 0.7rem 1.5rem;
            border-radius: var(--radius-sm);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            border: none;
        }

        .modal-btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
        }

        .modal-btn-primary:hover {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            transform: translateY(-2px);
        }

        .modal-btn-secondary {
            background: var(--surface-light);
            color: var(--text);
        }

        .modal-btn-secondary:hover {
            background: var(--surface);
        }

        .modal-btn-danger {
            background: var(--error);
            color: white;
        }

        .modal-btn-danger:hover {
            background: #ff5e57;
        }

        /* Steps modal improvements */
        .step-input-group {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            align-items: center;
        }

        .step-input {
            flex: 1;
            padding: 0.75rem 1rem;
            background-color: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            transition: var(--transition);
        }

        .step-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.3);
        }

        .step-remove {
            background: var(--error);
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition);
        }

        .step-remove:hover {
            background: #ff5e57;
        }

        .step-add {
            background: var(--success);
            color: var(--surface-dark);
            border: none;
            border-radius: var(--radius-sm);
            padding: 0.5rem 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
            transition: var(--transition);
        }

        .step-add:hover {
            background: #00b894;
        }

        .task-btn.steps-btn {
            background-color: var(--accent);
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 0.3rem 0.6rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
        }

        .task-btn.steps-btn:hover {
            background-color: var(--accent-dark);
        }

        .task-steps {
            margin-top: 0.5rem;
            padding-left: 1.2rem;
        }
        .task-steps li {
            list-style: disc;
            margin-bottom: 0.2rem;
            font-size: 0.9rem;
            color: #ccc;
        }
        
        /* Estilos para o botão de passos no formulário */
        .steps-button {
            background: linear-gradient(135deg, var(--accent), var(--accent-dark));
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            padding: 0.85rem 1.25rem;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .steps-button:hover {
            background: linear-gradient(135deg, var(--accent-dark), var(--accent));
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .task-category {
            font-size: 0.9em;      
            color: #6c757c;        
            margin-left: 5px;       
            font-weight: normal;
        }

        /* Animações */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .task {
            animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Media Queries para Responsividade */
        @media (max-width: 1200px) {
            .app-container {
                margin: 1.5rem auto;
            }
            
            .main-content {
                gap: 1rem;
            }
            
            .form-panel, .tasks-panel {
                padding: 1.5rem;
            }
        }

        @media (max-width: 1024px) {
            .main-content {
                flex-direction: column;
            }
            
            .form-panel, .tasks-panel {
                max-width: 100%;
            }
            
            .task-fields {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 900px) {
            .app-container {
                margin: 1rem auto;
                padding: 0 0.5rem;
            }
            
            .header {
                padding: 1.5rem 1rem;
            }
            
            .header h1 {
                font-size: 1.8rem;
            }
            
            .main-content {
                padding: 0.75rem;
            }
            
            .form-panel, .tasks-panel {
                padding: 1.25rem;
            }
            
            .task-fields {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }
            
            .add-task {
                gap: 1.5rem;
            }
            
            .tasks-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }
            
            .tasks-count {
                align-self: flex-end;
            }
        }

        @media (max-width: 768px) {
            .app-container {
                margin: 0.75rem auto;
                padding: 0 0.5rem;
            }
            
            .header {
                padding: 1.25rem 0.75rem;
            }
            
            .header h1 {
                font-size: 1.6rem;
            }
            
            .main-content {
                padding: 0.5rem;
                gap: 0.75rem;
            }
            
            .form-panel, .tasks-panel {
                padding: 1rem;
                border-radius: var(--radius-md);
            }
            
            .add-task {
                gap: 1.25rem;
            }
            
            .input-group label {
                font-size: 0.85rem;
            }
            
            .add-task input,
            .add-task select {
                padding: 0.75rem 1rem;
                font-size: 0.95rem;
            }
            
            .add-task button {
                padding: 0.8rem 1.25rem;
                font-size: 0.95rem;
                min-width: auto;
                width: 100%;
            }
            
            .tasks-header h2 {
                font-size: 1.2rem;
            }
            
            .task {
                padding: 1.25rem;
            }
            
            .task-title {
                font-size: 1.05rem;
            }
            
            .task-description {
                font-size: 0.9rem;
            }
            
            .task-meta {
                gap: 1rem;
                font-size: 0.8rem;
            }
            
            .task-priority {
                position: absolute;
                margin-top: 0.5rem;
                align-self: flex-start;
            }
            
            .task-actions {
                margin-left: 0;
                margin-top: 0.75rem;
                align-self: flex-end;
            }
            
            input[type="date"] {
                padding: 0.85rem 1.25rem;
                position: relative;
            }
            
        }

        @media (max-width: 640px) {
            .app-container {
                margin: 0.5rem auto;
                padding: 0 0.25rem;
            }
            
            .header {
                padding: 1rem 0.5rem;
            }
            
            .header h1 {
                font-size: 1.4rem;
                gap: 0.75rem;
            }
            
            .main-content {
                padding: 0.25rem;
                gap: 0.5rem;
            }
            
            .form-panel, .tasks-panel {
                padding: 0.75rem;
            }
            
            .task-fields {
                gap: 0.5rem;
            }
            
            .add-task {
                gap: 1rem;
            }
            
            .input-group label {
                font-size: 0.8rem;
            }
            
            .add-task input,
            .add-task select {
                padding: 0.7rem 0.9rem;
                font-size: 0.9rem;
            }
            
            .tasks-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .tasks-count {
                font-size: 0.8rem;
                align-self: flex-end;
            }
            
            .task {
                padding: 1rem;
            }
            
            .task-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }
            
            .task-content {
                width: 100%;
            }
            
            .task-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .task-actions {
                margin-top: -0.2rem;
            }
            
            .empty-state {
                padding: 2rem 1rem;
            }
            
            .empty-state img {
                width: 100px;
                height: 100px;
            }
            
            .empty-state h3 {
                font-size: 1.3rem;
            }
            
            .empty-state p {
                font-size: 0.9rem;
            }
            
        }

        @media (max-width: 480px) {
            .app-container {
                margin: 0.25rem auto;
                padding: 0.70rem;
            }
            
            .header {
                padding: 0.75rem 0.25rem;
            }
            
            .header h1 {
                font-size: 1.6rem;
                margin-bottom: 1rem;
                text-align: center;
                gap: 0.7rem;
            }
            
            .main-content {
                padding: 0.15rem;
            }
            
            .form-panel, .tasks-panel {
                padding: 0.5rem;
                border-radius: var(--radius-sm);
            }
            
            .input-group label {
                font-size: 0.75rem;
            }
            
            .add-task input,
            .add-task select {
                padding: 0.6rem 0.8rem;
                font-size: 0.85rem;
            }
            
            .add-task button {
                padding: 0.7rem 1rem;
                font-size: 0.85rem;
            }
            
            .tasks-header h2 {
                font-size: 1.1rem;
            }
            
            .tasks-count {
                font-size: 0.75rem;
                padding: 0.25rem 0.75rem;
            }
            
            .task {
                padding: 0.75rem;
                margin-bottom: 0.75rem;
            }
            
            .task-title {
                font-size: 1rem;
            }
            
            .task-description {
                font-size: 0.85rem;
            }
            
            .task-meta {
                font-size: 0.75rem;
            }
            
            .task-priority {
                font-size: 0.7rem;
                padding: 0.2rem 0.6rem;
            }
            
            .task-btn {
                width: 28px;
                height: 28px;
            }
            
            .task-btn svg {
                width: 14px;
                height: 14px;
            }
            
            .modal-content {
                width: 95%;
                margin: 10% auto;
            }
            
            .modal-header {
                padding: 1rem;
            }
            
            .modal-header h3 {
                font-size: 1.1rem;
            }
            
            .modal-body {
                padding: 1rem;
            }
            
            .modal-footer {
                padding: 0.75rem 1rem;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .modal-btn {
                width: 100%;
                text-align: center;
            }
            
        }

        @media (max-width: 360px) {
            .header h1 {
                font-size: 1.1rem;
            }
            
            .input-group label {
                font-size: 0.7rem;
            }
            
            .add-task input,
            .add-task select {
                padding: 0.55rem 0.7rem;
            }
            
            .task-date {
                flex-wrap: wrap;
            }
            
            .task-actions {
                flex-wrap: wrap;
                justify-content: center;
            }
        }

        @media (max-height: 500px) and (orientation: landscape) {
            .app-container {
                margin: 0.5rem auto;
            }
            
            .task-manager {
                max-height: 95vh;
                overflow: auto;
            }
            
            .main-content {
                min-height: auto;
                flex-direction: row;
            }
            
            .form-panel, .tasks-panel {
                max-height: 85vh;
                overflow: auto;
            }
            
            .tasks-wrapper {
                max-height: 65vh;
            }
            
            .header {
                padding: 0.75rem 1rem;
            }
            
            .header h1 {
                font-size: 1.4rem;
            }
        }

        /* Ajustes para telas muito pequenas em modo retrato */
        @media (max-width: 320px) {
            .header h1 {
                font-size: 1rem;
            }
            
            .input-group label::before {
                width: 4px;
                height: 4px;
            }
            
            .add-task button {
                font-size: 0.8rem;
            }
            
            .tasks-header h2 {
                font-size: 1rem;
            }
        }

        /* Ajustes para tablets em modo paisagem */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
            .app-container {
                margin: 1rem auto;
            }
            
            .main-content {
                flex-direction: row;
            }
            
            .form-panel, .tasks-panel {
                max-width: 50%;
            }
            
            .task-fields {
                grid-template-columns: repeat(2, 1fr);
            }
        }



#toggle-theme-btn {
    background: linear-gradient(135deg, var(--primary));
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-md);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

#toggle-theme-btn:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

#toggle-theme-btn:active {
    transform: translateY(0);
}

#toggle-theme-btn::after {
    content: "";
    position: absolute;
    top: -75%;
    left: -100%;
    width: 200%;
    height: 150%;
    background: linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(255,255,255,0));
    transform: rotate(30deg);
    transition: all 0.7s;
}

#toggle-theme-btn:hover::after {
    left: 100%;
}

#toggle-theme-btn i {
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    #toggle-theme-btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        min-width: 120px;
        gap: 0.4rem;
    }

    #toggle-theme-btn i {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    #toggle-theme-btn {
        padding: 0.45rem 0.5rem;
        font-size: 0.85rem;
        min-width: 100px;
        gap: 0.35rem;
        margin: 1rem auto 0.5rem auto; 
        display: block; 
    }
    #toggle-theme-btn i {
        font-size: 0.8rem;
    }
}

@media (max-width: 360px) {
    #toggle-theme-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        min-width: 90px;
        gap: 0.3rem;
    }

    #toggle-theme-btn i {
        font-size: 0.8rem;
    }
}
`;

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
