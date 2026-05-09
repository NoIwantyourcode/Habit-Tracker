let habits = JSON.parse(localStorage.getItem('habits') || '[]');

function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';

    habits.forEach(habit => {
        const item = document.createElement('div');
        item.classList.add('habit');

        const today = new Date().toLocaleDateString();
        const completedToday = habit.completions.includes(today);

        const totalDays = 30;
        const completedDays = habit.completions.filter(d => {
            const date = new Date(d);
            const thirtydaysAgo = new Date()
            thirtydaysAgo.setDate(thirtydaysAgo.getDate() - 30);
            return date >= thirtydaysAgo;
        }).length;
        const completionRate = Math.round((completedDays/totalDays) * 100);

        item.innerHTML = `
            <div class="habit-header">
                <span>${habit.name}</span>
                <button class="editBtn">Edit</button>
                <span class="streak">streak: ${getStreak(habit)}</span>
                <span class="rate">Completion rate: ${completionRate}%</span>
                <button class="checkBtn">${completedToday ? '✅' : '⬜'}</button>
                <span class="best-streak">Best: ${getBestStreak(habit)}</span>
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

        item.querySelector('.editBtn').addEventListener('click',() => {
            const newName = prompt('New habit name: ')
            if (!newName) return;
            habit.name = newName.trim();
            localStorage.setItem('habits', JSON.stringify(habits));
            renderHabits();
        });

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

    renderStats();
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

function getBestStreak(habit) {
    let best = 0;
    let current = 0;

    const sorted = [...habit.completions].sort((a, b) => new Date(a) - new Date(b));

    sorted.forEach((date, i) => {
        if (i === 0) {
            current = 1;
        } else {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(date);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
                current++
            } else {
                current = 1
            }
        }
        best = Math.max(best, current);
    });

    return best;
}

function renderStats() {
    const today = new Date().toLocaleDateString();
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    const longestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h)), 0);

    document.getElementById('stats').innerHTML = `
        <div class="stat">
            <span class="start-value">${totalHabits}</span>
            <span class="stat-label">Total Habits</span>
        </div>
        <div class="stat">
            <span class="stat-value">${completedToday}/${totalHabits}</span>
            <span class="stat-label">Done Today</span>
        <div class="stat">
            <span class="stat-value">${longestStreak}</span>
            <span class="stat-label">Longest Streak</span>
        </div>
    `;
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

document.getElementById('theme').addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
    document.getElementById('theme').textContent = isLight ? 'Light' : "Dark";
});

renderHabits();
renderHabits();