let habits = JSON.parse(localStorage.getItem('habits') || '[]');

function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';

    habits.forEach(habit => {
        const item = document.createElement('div');
        item.classList.add('habit');
        item.textContent = habit.name;
        list.appendChild(item)
    })
}

document.getElementById('addBtn').addEventListener('click', () => {
    const name = document.getElementById('habitInput').value.trim();
    if (!name) return;
    habits.push({
        id: Date.now(), name, 
        completions: []
    });

    localStorage.setItem('habits', JSON.stringify(habits));
    document.getElementById('habitInput').value = '';

    renderHabits();
});