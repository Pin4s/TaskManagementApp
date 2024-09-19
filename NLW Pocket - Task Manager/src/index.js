const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises;

// Variáveis
let feedbackMessage = "Bem-vindo ao App de Gerenciamento de Metas!";
let tasks = [];

// Funções

const loadTasks = async () => {
    try {
        const data = await fs.readFile("./src/tasks.json", "utf8");
        tasks = JSON.parse(data);
    } 
    catch (error) {
        tasks = [];
    }
};

const saveTasks = async () => {
    await fs.writeFile("./src/tasks.json", JSON.stringify(tasks, null, 2));
};

const createTask = async () => {
    const taskDescription = await input({ message: "Digite a meta:" });

    if (taskDescription.length === 0) {
        feedbackMessage = 'A meta não pode ser vazia';
        return;
    }

    tasks.push({ value: taskDescription, checked: false });
    feedbackMessage = "Meta adicionada com sucesso";
};

const listTasks = async () => {
    if (tasks.length === 0) {
        feedbackMessage = "Não existem metas";
        return;
    }

    const selectedTasks = await checkbox({
        message: "Use as setas para navegar, espaço para selecionar/desmarcar e enter para prosseguir",
        choices: tasks,
        instructions: false,
    });

    tasks.forEach(task => task.checked = false);

    if (selectedTasks.length === 0) {
        feedbackMessage = 'Nenhuma meta foi selecionada';
        return;
    }

    selectedTasks.forEach(selectedTask => {
        const task = tasks.find(t => t.value === selectedTask);
        if (task) task.checked = true;
    });

    feedbackMessage = "Meta(s) marcada(s) como concluída(s)";
};

const showCompletedTasks = async () => {
    if (tasks.length === 0) {
        feedbackMessage = "Não existem metas";
        return;
    }

    const completedTasks = tasks.filter(task => task.checked);

    if (completedTasks.length === 0) {
        feedbackMessage = "Não existem metas concluídas";
        return;
    }

    await select({
        message: `Metas concluídas: ${completedTasks.length}`,
        choices: completedTasks,
    });
};

const showPendingTasks = async () => {
    if (tasks.length === 0) {
        feedbackMessage = "Não existem metas";
        return;
    }

    const pendingTasks = tasks.filter(task => !task.checked);

    if (pendingTasks.length === 0) {
        feedbackMessage = "Não existem metas pendentes";
        return;
    }

    await select({
        message: `Metas pendentes: ${pendingTasks.length}`,
        choices: pendingTasks,
    });
};

const deleteTasks = async () => {
    if (tasks.length === 0) {
        feedbackMessage = "Não existem metas";
        return;
    }

    const tasksForDeletion = tasks.map(task => ({ value: task.value, checked: false }));

    const tasksToDelete = await checkbox({
        message: "Selecione as metas para excluir",
        choices: tasksForDeletion,
        instructions: false,
    });

    if (tasksToDelete.length === 0) {
        feedbackMessage = "Nenhuma meta selecionada para exclusão";
        return;
    }

    tasks = tasks.filter(task => !tasksToDelete.includes(task.value));
    await saveTasks();
    feedbackMessage = "Meta(s) excluída(s) com sucesso!";
};

const showMessage = () => {
    console.clear();
    if (feedbackMessage) {
        console.log(feedbackMessage);
        console.log("");
        feedbackMessage = '';
    }
};

// Início da aplicação
const startApp = async () => {
    await loadTasks();

    while (true) { 
        showMessage();

        const option = await select({
            message: "Menu >",
            choices: [
                { name: "Cadastrar Meta", value: "add" },
                { name: "Listar Metas", value: "list" },
                { name: "Metas Concluídas", value: "completed" },
                { name: "Metas Pendentes", value: "pending" },
                { name: "Deletar Metas", value: "delete" },
                { name: "Sair", value: "exit" },
            ],
        });

        switch (option) {
            case 'add':
                await createTask();
                await saveTasks();
                break;
            case 'list':
                await listTasks();
                break;
            case "completed":
                await showCompletedTasks();
                break;
            case "pending":
                await showPendingTasks();
                break;
            case "delete":
                await deleteTasks();
                break;
            case 'exit':
                console.log('Até a próxima!');
                return;
        }
    }
};

startApp();
