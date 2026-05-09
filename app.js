let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let viewDays = 30;

if ('Notification' in window) {
    Notification.requestPermission();
}

function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';

    habits.forEach(habit => {
        const item = document.createElement('div')
        item.classList.add('habit');

        item.draggable = true;
        item.addEventListener('dragstart', () => {
            window.draggedHabitId = habit.id;
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        })

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        item.addEventListener('drop', () => {
            const draggedId = window.draggedHabitId;
            const draggedIndex = habits.findIndex(h => h.id === draggedId);
            const targetIndex = habits.findIndex(h => h.id === habit.id);

            const [dragged] = habits.splice(draggedIndex, 1);
            habits.splice(targetIndex, 0, dragged);

            localStorage.setItem('habits', JSON.stringify(habits));
            renderHabits();
        });

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
                <button class="reminderBtn">Remind Me!</button>
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

        item.querySelector('.reminderBtn').addEventListener('click', () => {
            if (Notification.permission !== 'granted') {
                alert('Please allow Notifications first');
                return;
            }
            const time = prompt('Remind me a (HH:MM):', '09:00');
            if (!time) return;
            habit.reminder = time
            localStorage.setItem('habits', JSON.stringify(habits));
            alert(`Reminder set for ${time} daily`);
        });

        const heatmap = item.querySelector('.heatmap');

        for (let i = viewDays - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString();
            const completed = habit.completions.includes(dateString);

            const box = document.createElement('div');
            box.classList.add('heatmap-box');
            box.style.background = completed ? '#4ecb71' : '#2a2a32';
            box.title = dateString;
            heatmap.appendChild(box);

            heatmap.style.gridTemplateColumns = `repeat(${viewDays === 7 ? 7 : 15}, 14px)`;
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
            <span class="stat-value">${totalHabits}</span>
            <span class="stat-label">Total Habits</span>
        </div>
        <div class="stat">
            <span class="stat-value">${completedToday}/${totalHabits}</span>
            <span class="stat-label">Done Today</span>
        </div>
        <div class="stat">
            <span class="stat-value">${longestStreak}</span>
            <span class="stat-label">Longest Streak</span>
        </div>
    `;

    const progress = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
    document.getElementById('progressBar').style.width = `${progress}%` 
    document.getElementById('progresslabel').textContent = `Today's Progress - ${progress}%`
}

function checkReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    habits.forEach(habit => {
        if (habit.reminder === currentTime) {
            console.log('firing reminder for:', habit.time);
            new Notification('Habit Reminder', {
                body: `Don't forget to complete: ${habit.time}`
            });
        }
    });
}

setInterval(checkReminders, 60000);

document.getElementById('addBtn').addEventListener('click', () => {
    const name = document.getElementById('habitInput').value.trim();
    const color = document.getElementById('habitColor').value
    if (!name) return;
    habits.push({
        id: Date.now(), name, 
        completions: [],
        color: color
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

document.getElementById('viewToggle').addEventListener('click', () => {
    viewDays = viewDays === 30 ? 7 : 30;
    document.getElementById('viewToggle').textContent = viewDays === 30 ? '7 Day View' : '30 Day View';
    renderHabits()
})

renderHabits();