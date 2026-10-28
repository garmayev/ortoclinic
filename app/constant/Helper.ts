export const Helper = {
    sizes: {
        mobile: '425px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '2560px'
    },
    url: 'https://medix.amgs.online',
    imageUrl: 'https://medix.amgs.online/images',
    apiUrl: import.meta.env.MODE === 'stand' ? '/api' : 'https://medix.amgs.online/api',
    findById: (array: Array<any>, id:number) => {
        return array.find(item => {return item.id === id})
    },
    findBy:  (array: Array<any>, key: string, id:number) => {
        return array.filter(item => {return item[key] === id})
    },
    getWeekDay: (date) => {
        // Массив, где ПН - индекс 0, ВС - индекс 6
        let days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
        
        // Корректируем: getDay() дает Вс=0, Пн=1...
        let day = date.getDay();
        
        // Если getDay() возвращает 0 (ВС), ставим его в конец (индекс 6)
        if (day === 0) day = 7; 
        
        return days[day - 1]; // -1 так как массив с 0
    },
    dateFormat: (date: Date, format: string) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Время
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();

        const tokens = {
            // Дни
            'DD': String(day).padStart(2, '0'),
            'D': String(day),

            // Месяцы (цифры)
            'MM': String(month).padStart(2, '0'),
            'M': String(month),

            // Годы
            'YYYY': String(year),
            'YY': String(year).slice(-2),

            // Часы (24-часовой формат)
            'HH': String(hours).padStart(2, '0'),
            'H': String(hours),

            // Часы (12-часовой формат)
            'hh': String(hours % 12 || 12).padStart(2, '0'),
            'h': String(hours % 12 || 12),

            // Минуты
            'mm': String(minutes).padStart(2, '0'),
            'm': String(minutes),

            // Секунды
            'ss': String(seconds).padStart(2, '0'),
            's': String(seconds),

            // Миллисекунды
            'SSS': String(milliseconds).padStart(3, '0'),

            // AM/PM
            'A': hours >= 12 ? 'PM' : 'AM',
            'a': hours >= 12 ? 'pm' : 'am'
        };

        // Заменяем токены в формате
        let result = format;
        for (const [token, value] of Object.entries(tokens)) {
            result = result.replace(new RegExp(token, 'g'), value);
        }

        return result;
    },
    toHoursMinutes: (time: string) => {
        const parts = time.split(":");
        return `${parts[0]}:${parts[1]}`
    }
}
