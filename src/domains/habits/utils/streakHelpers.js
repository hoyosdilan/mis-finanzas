// dateStr format: 'YYYY-MM-DD'
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const offsetDateStr = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const completedToday = (doneDates) => doneDates.has(todayStr());

export const currentStreak = (doneDates) => {
    let count = 0;
    // Start from today; if today not done, start from yesterday
    let offset = 0;
    if (!doneDates.has(todayStr())) offset = -1;
    while (doneDates.has(offsetDateStr(offset - count))) {
        count++;
    }
    return count;
};
