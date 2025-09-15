    let steps = [];
    let currentTaskSteps = [];
    let currentTaskElement = null;
    let taskToDelete = null;

    let clocks = [];
    let currentClockElement = null;

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

        // Criar HTML da tarefa incluindo o span de prioridade imediatamente
        taskElement.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-item" onchange="toggleTaskComplete(this)">
                <div class="task-content">
                    <span class="task-priority ${priorityClass}">${priorityText}</span>
                    <h3 class="task-title">${taskName}</h3>
                    ${taskDescription ? `<p class="task-description">${taskDescription}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-date">${formattedDate}</span>
                        ${taskResponsible ? `<span class="task-responsible">Responsável: ${taskResponsible}</span>` : ''}
                        ${taskTimeEstimated ? `<span class="task-time">Tempo: ${taskTimeEstimated}</span>` : ''}
                        ${taskRecurrence && taskRecurrence !== "none" ? `<span class="task-recurrence">Recorrência: ${taskRecurrence}</span>` : ''}
                        <div class="task-actions">
                            <button class="task-btn steps-btn" onclick="openTaskStepsModal(this)" title="Ver passos">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 6v6l4 2"></path>
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            </button>
                            <button class="task-btn delete-btn" onclick="requestDeleteTask(this)" title="Excluir tarefa">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            closeDeleteModal(); // <-- agora fecha o modal depois da exclusão
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
                                <h3 class="task-title">${taskData.title}</h3>
                                ${taskData.description?`<p class="task-description">${taskData.description}</p>`:''}
                                ${taskData.steps.length > 0 ? `<ul class="task-steps">${taskData.steps.map(s=>`<li>${s}</li>`).join('')}</ul>` : ''}
                                <div class="task-meta">
                                    <span class="task-date">${taskData.date}</span>
                                    <span class="task-priority ${priorityClass}">${taskData.priority}</span>
                                    ${taskData.responsible?`<span class="task-responsible">Responsável: ${taskData.responsible}</span>`:''}
                                    ${taskData.timeEstimated?`<span class="task-time">Tempo: ${taskData.timeEstimated}</span>`:''}
                                    ${taskData.recurrence && taskData.recurrence!=="none"?`<span class="task-recurrence">Recorrência: ${taskData.recurrence}</span>`:''}
                                    <div class="task-actions">
                                        <button class="task-btn steps-btn" onclick="openTaskStepsModal(this)" title="Ver passos">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 6v6l4 2"></path>
                                                <circle cx="12" cy="12" r="10"></circle>
                                            </svg>
                                        </button>
                                        <button class="task-btn delete-btn" onclick="requestDeleteTask(this)" title="Excluir tarefa">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
