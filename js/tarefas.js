    let steps = [];
    let currentTaskSteps = [];
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
        const tasksWrapper = document.getElementById("tasks-wrapper");
        const emptyState = document.getElementById("empty-state");

        const taskName = input.value.trim();
        const taskDescription = description.value.trim();
        const taskDueDate = dueDate.value;
        const taskPriority = priority.value;
        const taskResponsible = responsible.value.trim();
        const taskTimeEstimated = timeEstimated.value.trim();
        const taskRecurrence = recurrence.value;

        if (taskName !== "") {
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

            let stepsListHTML = "";
            if (steps.length > 0) {
                stepsListHTML = `<ul class="task-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ul>`;
            }

            taskElement.innerHTML = `
                <div class="task-header">
                    <input type="checkbox" class="task-item" onchange="toggleTaskComplete(this)">
                    <div class="task-content">
                        <span class="task-priority ${priorityClass}">${priorityText}</span>
                        <h3 class="task-title">${taskName}</h3>
                        ${taskDescription ? `<p class="task-description">${taskDescription}</p>` : ''}
                        ${stepsListHTML}
                        <div class="task-meta">
                            <span class="task-date">${formattedDate}</span>
                            ${taskResponsible ? `<span class="task-responsible">Responsável: ${taskResponsible}</span>` : ''}
                            ${taskTimeEstimated ? `<span class="task-time">Tempo: ${taskTimeEstimated}</span>` : ''}
                            ${taskRecurrence && taskRecurrence !== "none" ? `<span class="task-recurrence">Recorrência: ${taskRecurrence}</span>` : ''}
                            <div class="task-actions">
                                <button class="task-btn steps-btn" onclick="openTaskStepsModal(this)" title="Ver passos">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                                         stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 6v6l4 2"></path>
                                        <circle cx="12" cy="12" r="10"></circle>
                                    </svg>
                                </button>
                                <button class="task-btn delete-btn" onclick="requestDeleteTask(this)" title="Excluir tarefa">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                                         stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4
                                                 a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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

            // Mostrar notificação
            showNotification("Tarefa criada com sucesso!");

            steps = [];
            renderSteps();
            input.focus();

            updateTasksCount();
            saveTasks();
        } else {
            input.style.borderColor = "var(--error)";
            input.focus();
            setTimeout(() => { input.style.borderColor = "var(--border)"; }, 1000);
        }
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
            const stepsList = task.querySelectorAll(".task-steps li");
            const progressSlider = task.querySelector(".task-progress");
            tasksData.push({
                title: task.querySelector(".task-title").textContent,
                description: task.querySelector(".task-description")?.textContent || "",
                date: task.querySelector(".task-date").textContent,
                priority: task.querySelector(".task-priority")?.textContent || "Média Prioridade",
                responsible: task.querySelector(".task-responsible")?.textContent.replace("Responsável: ","") || "",
                timeEstimated: task.querySelector(".task-time")?.textContent.replace("Tempo: ","") || "",
                recurrence: task.querySelector(".task-recurrence")?.textContent.replace("Recorrência: ","") || "",
                steps: Array.from(stepsList).map(li=>li.textContent),
                completed: task.classList.contains("completed"),
                progress: progressSlider ? progressSlider.value : 0
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
        <h3 class="task-title">${taskData.title}</h3>
        ${taskData.description?`<p class="task-description">${taskData.description}</p>`:''}
        ${taskData.steps.length > 0 ? `<ul class="task-steps">${taskData.steps.map(s=>`<li>${s}</li>`).join('')}</ul>` : ''}

        <div class="task-meta">
            <span class="task-date">${taskData.date}</span>

            ${taskData.responsible?`
                <span class="task-responsible">
                    <!-- Opção 1: Usuário minimalista -->
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

        currentTaskElement = task;
        const taskStepsList = task.querySelectorAll(".task-steps li");
        currentTaskSteps = Array.from(taskStepsList).map(li => li.textContent);

        steps = [...currentTaskSteps];
        renderSteps();
        document.getElementById("steps-modal").style.display = "flex";
    }

    function openNewTaskStepsModal() {
        currentTaskElement = null;
        steps = [];
        renderSteps();
        document.getElementById("steps-modal").style.display = "flex";
    }

    function closeStepsModal() {
        if (currentTaskElement) {
            let stepsListHTML = '';
            if (steps.length > 0){
                stepsListHTML = `<ul class="task-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ul>`;
            }
            const existingList = currentTaskElement.querySelector(".task-steps");
            if(existingList){
                existingList.outerHTML = stepsListHTML;
            } else {
                const taskContent = currentTaskElement.querySelector(".task-content");
                taskContent.insertAdjacentHTML('beforeend', stepsListHTML);
            }
            saveTasks();
        }
        document.getElementById("steps-modal").style.display = "none";
        currentTaskSteps = [];
        currentTaskElement = null;
    }

    function addStep() {
        steps.push("");
        renderSteps();
    }

    function removeStep(index) {
        steps.splice(index, 1);
        renderSteps();
    }

    function updateStep(index,value){
        steps[index]=value;
    }

    function renderSteps(){
        const container=document.getElementById("steps-container");
        container.innerHTML="";
        steps.forEach((step,i)=>{
            const stepGroup = document.createElement("div");
            stepGroup.className = "step-input-group";
            
            const input=document.createElement("input");
            input.type="text";
            input.className = "step-input";
            input.placeholder=`Passo ${i+1}`;
            input.value=step;
            input.oninput=e=>updateStep(i,e.target.value);
            
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

    document.addEventListener("DOMContentLoaded",()=>{
        loadTasks();
        const today=new Date().toISOString().split('T')[0];
        document.getElementById("due-date").min=today;
        document.getElementById("new-task").addEventListener("keypress",(e)=>{if(e.key==="Enter") addTask();});
        document.getElementById("fab-button").addEventListener("click",()=>{document.getElementById("new-task").focus(); window.scrollTo({top:0,behavior:"smooth"});});
        
        // Fechar modais ao clicar fora deles
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("modal")) {
                e.target.style.display = "none";
            }
        });
    });

    // Criar elemento style
const style = document.createElement('style');
style.textContent = `
:root {
    --primary: #6c5ce7;
    --primary-light: rgba(108, 92, 231, 0.2);
    --primary-dark: #5649c0;
    --secondary: #00cec9;
    --accent: #fd79a8;
    --accent-dark: #e6679b;
    --text: #f5f6fa;
    --text-light: #d1d8e0;
    --text-lighter: #a4b0be;
    --background: #1e272e;
    --surface: #2f3640;
    --surface-light: #353b48;
    --surface-dark: #222f3e;
    --error: #ff7675;
    --success: #55efc4;
    --warning: #fdcb6e;
    --border: #3d3d3d;
    --border-light: #4b4b4b;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}



.app-container {
    max-width: 1400px;
    margin: 2rem auto;
    width: 100%;
    flex: 1;
}

.task-manager {
    margin-top: 4%;
    background-color: #2f3640cb;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-light);
    transition: var(--transition);
    backdrop-filter: blur(5px);
}

.task-manager:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.6);
    transform: translateY(-2px);
}

.header {
    padding: 1.7rem 1rem;
    background-color: var(--surface-dark);
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
}

.header::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
}

.header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 1rem;
    letter-spacing: 0.5px;
}

.header h1::before {
    content: "";
    display: block;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat center;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask-size: contain;
}

.main-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 1.5rem;
}

/* Painel esquerdo - formulário */
.form-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--surface-dark);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    padding: 1.75rem;
    transition: var(--transition);
    max-width: 50%;
}

.form-panel:hover {
    border-color: var(--border-light);
    box-shadow: var(--shadow-md);
}

/* Painel direito - lista de tarefas */
.tasks-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--surface-dark);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    padding: 1.5rem;
    transition: var(--transition);
    max-width: 50%;
}

.tasks-panel:hover {
    border-color: var(--border-light);
}

.add-task {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
}

.task-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.input-group.full-width {
    grid-column: 1 / -1;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-light);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input-group label::before {
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    background-color: var(--primary);
    border-radius: 50%;
}

.add-task input,
.add-task select {
    padding: 0.85rem 1.25rem;
    background-color: var(--background);
    border: 1px solid #4d4d4d;
    border-radius: var(--radius-sm);
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: var(--text);
    transition: var(--transition);
}

.add-task input:focus,
.add-task select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.3);
}

.add-task input::placeholder {
    color: var(--text-lighter);
    opacity: 0.7;
}

.add-task-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
}

.add-task button {
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.85rem 1.5rem;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
    min-width: 180px;
}

.add-task #passos {
    margin-top: 32px;
    padding: 0.85rem 1.25rem;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.add-task #passos:hover {
    background: linear-gradient(135deg, var(--accent-dark), var(--accent));
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.add-task button:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.add-task button:active {
    transform: translateY(0);
}

.add-task button::after {
    content: "";
    position: absolute;
    top: -75%;
    width: 200%;
    height: 150%;
    background: linear-gradient(
        to bottom right, 
        rgba(255, 255, 255, 0.3), 
        rgba(255, 255, 255, 0)
    );
    transform: rotate(30deg);
    transition: all 0.7s;
}

.add-task button:hover::after {
    left: 100%;
}

.input-group.half-width {
    grid-column: span 1;
}

.tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.tasks-header h2 {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-light);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.tasks-header h2::before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    background-color: var(--secondary);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
}

.tasks-count {
    background-color: var(--primary-light);
    color: var(--primary);
    padding: 0.35rem 1rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tasks-count::before {
    content: "•";
    color: var(--primary);
    font-size: 1.5rem;
    line-height: 0;
}

.tasks-wrapper {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
    max-height: calc(2 * (var(--task-height, 130px) + 10.25rem));
}

.tasks-wrapper::-webkit-scrollbar {
    width: 8px;
}

.tasks-wrapper::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm);
}

.tasks-wrapper::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: var(--radius-sm);
}

.tasks-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
}

.task {
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin-bottom: 1.25rem;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
}

.task:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-light);
}

.task::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, var(--primary), var(--secondary));
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
}

.task-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
}

.task-item {
    appearance: none;
    min-width: 22px;
    min-height: 22px;
    border: 2px solid var(--border-light);
    border-radius: var(--radius-sm);
    background: var(--surface-light);
    cursor: pointer;
    position: relative;
    transition: var(--transition);
    margin-top: 3px;
    flex-shrink: 0;
}

.task-item:hover {
    border-color: var(--primary);
}

.task-item:checked {
    background-color: var(--primary);
    border-color: var(--primary);
}

.task-item:checked::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.task-content {
    flex: 1;
    position: relative;
}

.task-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    word-break: break-word;
    color: var(--text);
    font-size: 1.1rem;
}

.task-description {
    color: var(--text-light);
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    word-break: break-word;
    line-height: 1.5;
}

.task-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.25rem;
    font-size: 0.85rem;
    position: relative;
}

.task-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-light);
}

input[type="date"] {
    padding-right: 1rem;
    background-color: var(--background);
    border: 1px solid #4d4d4d;
    border-radius: var(--radius-sm);
    color: var(--text);
    min-height: 3rem;
    -webkit-appearance: none;
    appearance: none;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    filter: brightness(0) saturate(100%) invert(75%) sepia(5%) saturate(500%) hue-rotate(185deg);
    opacity: 0.8;
    padding: 0.25rem;
    cursor: pointer;
    transition: var(--transition);
}

@-moz-document url-prefix() {
    input[type="date"] {
        padding-right: 1.8rem;
    }
}

.input-group.date-field {
    position: relative;
}

input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-clear-button {
    display: none;
    -webkit-appearance: none;
}

input[type="date"]:not(:valid):before {
    content: attr(placeholder);
    color: var(--text-lighter);
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}

input[type="date"]:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.3);
    outline: none;
}

.task-date::before {
    content: "";
    display: block;
    width: 16px;
    height: 16px;
    background-color: var(--text-light);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
}

.task-priority {
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
}

.priority-high {
    background-color: rgba(239, 35, 60, 0.15);
    color: var(--error);
    border: 1px solid rgba(239, 35, 60, 0.3);
}

.priority-medium {
    background-color: rgba(253, 203, 110, 0.15);
    color: var(--warning);
    border: 1px solid rgba(253, 203, 110, 0.3);
}

.priority-low {
    background-color: rgba(85, 239, 196, 0.15);
    color: var(--success);
    border: 1px solid rgba(85, 239, 196, 0.3);
}

.task-actions {
    margin-left: auto;
    display: flex;
    gap: 0.75rem;
}

.task-btn {
    background: none;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: var(--transition);
    background-color: var(--surface-light);
}

.task-btn:hover {
    transform: scale(1.1);
    background-color: var(--primary-light);
}

.task-btn svg {
    width: 16px;
    height: 16px;
}

.delete-btn {
    color: var(--error);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-light);
}

.empty-state img {
    width: 140px;
    height: 140px;
    margin-bottom: 1.5rem;
    opacity: 0.5;
    filter: invert(1);
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
    color: var(--text-light);
}

.empty-state p {
    max-width: 400px;
    margin-bottom: 1.5rem;
    color: var(--text-lighter);
    line-height: 1.6;
}

.task.completed {
    opacity: 0.8;
    background-color: var(--surface-dark);
}

.task.completed .task-title {
    text-decoration: line-through;
    color: var(--text-lighter);
}

.task.completed .task-item:checked {
    background-color: var(--success);
    border-color: var(--success);
}

/* Estilos para os modais e notificações que estão no HTML */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
}

.modal-content {
    background-color: var(--surface);
    margin: 5% auto;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
    width: 90%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
}

.modal-header {
    padding: 1.5rem;
    background-color: var(--surface-dark);
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 1.3rem;
    color: var(--text);
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-light);
    cursor: pointer;
    transition: var(--transition);
}

.modal-close:hover {
    color: var(--error);
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    background-color: var(--surface-dark);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}


.modal-btn-primary {
    background-color: var(--primary);
    color: white;
}

.modal-btn-secondary {
    background-color: var(--surface-light);
    color: var(--text);
}

.modal-btn-danger {
    background-color: var(--error);
    color: white;
}

.modal-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--success);
    color: var(--text);
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: var(--shadow-md);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1001;
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}

.fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    transition: var(--transition);
    z-index: 900;
}

.fab:hover {
    transform: scale(1.1) rotate(90deg);
    background: var(--primary-dark);
}
`;

// Adicionar o estilo ao documento
document.head.appendChild(style);
