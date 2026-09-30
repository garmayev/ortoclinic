export const Helper = {
    sizes: {
        mobile: '425px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '2560px'
    },
    url: 'https://medix.local',
    imageUrl: 'https://medix.local/images',
    apiUrl: 'https://medix.local/api',
    findById: (array: Array<any>, id:number) => {
        return array.find(item => {return item.id === id})
    },
    findBy:  (array: Array<any>, key: string, id:number) => {
        return array.filter(item => {return item[key] === id})
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