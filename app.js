let habits = JSON.parse(localStorage.getItem('habits') || '[]');

function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';

    habits.forEach(habit => {
        const item = document.createElement('div');
        item.classList.add('habit');

        const today = new Date().toLocaleDateString();
        const completedToday = habit.completions.includes(today);

        item.innerHTML = `
            <div class="habit-header">
                <span>${habit.name}</span>
                <span class="streak">streak: ${getStreak(habit)}</span>
                <button class="checkBtn">${completedToday ? '✅' : '⬜'}</button>
                <button class="deleteBtn">x</button>
            </div>
            <div class="heatmap" id="heatmap-${habit.id}"></div>
        `;

        item.querySelector('.checkBtn').addEventListener('click', () => {
            if (completedToday) {
                habit.completions = habit.completions.filter(d => d !== today);
            } else {
                habit.completions.push(today);
            }
            localStorage.setItem('habits', JSON.stringify(habits));
            renderHabits();
        })

        item.querySelector('.deleteBtn').addEventListener('click', () => {
            habits = habits.filter(h => h.id !== habit.id);
            localStorage.setItem('habits', JSON.stringify(habits));
            renderHabits();
        })
        list.appendChild(item)

        const heatmap = item.querySelector('.heatmap');

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString();
            const completed = habit.completions.includes(dateString);

            const box = document.createElement('div');
            box.classList.add('heatmap-box');
            box.style.background = completed ? '#4ecb71' : '#2a2a32';
            box.title = dateString;
            heatmap.appendChild(box);
        }
    })
}

function getStreak(habit) {
    let streak = 0
    const today = new Date();

    while (true) {
        const date = new Date(today);
        date.setDate(today.getDate() - streak);
        const dateString = date.toLocaleDateString();

        if (habit.completions.includes(dateString)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
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

renderHabits()