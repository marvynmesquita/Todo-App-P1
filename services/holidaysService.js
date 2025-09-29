const axios = require('axios');

class HolidaysService {
    constructor() {
        this.apiUrl = 'https://api.invertexto.com/v1/holidays';
        this.token = process.env.INVERT || 'SEUTOKEN';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
    }

    /**
     * Busca feriados para um ano específico
     * @param {number} year - Ano para buscar feriados
     * @returns {Promise<Array>} Array de feriados
     */
    async getHolidays(year = new Date().getFullYear()) {
        try {
            // Verificar cache primeiro
            const cacheKey = `holidays_${year}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
                console.log(`Feriados do ano ${year} carregados do cache`);
                return cached.data;
            }

            // Buscar da API
            const response = await axios.get(`${this.apiUrl}/${year}/?token=${this.token}`,
                {
                    timeout: 10000 // 10 segundos de timeout
                }
            );

            if (response.data && Array.isArray(response.data)) {
                const holidays = this.formatHolidays(response.data, year);
                
                // Salvar no cache
                this.cache.set(cacheKey, {
                    data: holidays,
                    timestamp: Date.now()
                });

                console.log(`Feriados do ano ${year} carregados da API: ${holidays.length} feriados`);
                return holidays;
            } else {
                throw new Error('Resposta da API inválida');
            }

        } catch (error) {
            console.error('Erro ao buscar feriados:', error.message);
            
            // Em caso de erro, retornar feriados fixos do Brasil
            return this.getDefaultHolidays(year);
        }
    }

    /**
     * Formata os dados dos feriados da API
     * @param {Array} apiData - Dados brutos da API
     * @param {number} year - Ano
     * @returns {Array} Feriados formatados
     */
    formatHolidays(apiData, year) {
        return apiData.map(holiday => ({
            date: holiday.date || holiday.data,
            name: holiday.name || holiday.nome,
            type: holiday.type || holiday.tipo || 'nacional',
            description: holiday.description || holiday.descricao || '',
            year: year,
            isNational: (holiday.type || holiday.tipo) === 'nacional',
            isState: (holiday.type || holiday.tipo) === 'estadual',
            isMunicipal: (holiday.type || holiday.tipo) === 'municipal'
        }));
    }

    /**
     * Retorna feriados padrão do Brasil em caso de erro na API
     * @param {number} year - Ano
     * @returns {Array} Feriados padrão
     */
    getDefaultHolidays(year) {
        const defaultHolidays = [
            { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'nacional' },
            { date: `${year}-04-21`, name: 'Tiradentes', type: 'nacional' },
            { date: `${year}-05-01`, name: 'Dia do Trabalhador', type: 'nacional' },
            { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'nacional' },
            { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'nacional' },
            { date: `${year}-11-02`, name: 'Finados', type: 'nacional' },
            { date: `${year}-11-15`, name: 'Proclamação da República', type: 'nacional' },
            { date: `${year}-12-25`, name: 'Natal', type: 'nacional' }
        ];

        // Adicionar Páscoa (calculada dinamicamente)
        const easterDate = this.calculateEaster(year);
        defaultHolidays.push({
            date: easterDate,
            name: 'Páscoa',
            type: 'nacional'
        });

        // Adicionar Carnaval (47 dias antes da Páscoa)
        const carnivalDate = this.addDays(easterDate, -47);
        defaultHolidays.push({
            date: carnivalDate,
            name: 'Carnaval',
            type: 'nacional'
        });

        // Adicionar Sexta-feira Santa (2 dias antes da Páscoa)
        const goodFridayDate = this.addDays(easterDate, -2);
        defaultHolidays.push({
            date: goodFridayDate,
            name: 'Sexta-feira Santa',
            type: 'nacional'
        });

        return defaultHolidays.map(holiday => ({
            ...holiday,
            year: year,
            isNational: holiday.type === 'nacional',
            isState: holiday.type === 'estadual',
            isMunicipal: holiday.type === 'municipal',
            description: ''
        }));
    }

    /**
     * Calcula a data da Páscoa para um ano específico
     * @param {number} year - Ano
     * @returns {string} Data da Páscoa no formato YYYY-MM-DD
     */
    calculateEaster(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const n = Math.floor((h + l - 7 * m + 114) / 31);
        const p = (h + l - 7 * m + 114) % 31;
        
        const month = n;
        const day = p + 1;
        
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    /**
     * Adiciona dias a uma data
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @param {number} days - Número de dias para adicionar
     * @returns {string} Nova data no formato YYYY-MM-DD
     */
    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Verifica se uma data é feriado
     * @param {string} date - Data no formato YYYY-MM-DD
     * @param {number} year - Ano
     * @returns {Promise<Object|null>} Feriado ou null
     */
    async isHoliday(date, year = new Date().getFullYear()) {
        const holidays = await this.getHolidays(year);
        return holidays.find(holiday => holiday.date === date) || null;
    }

    /**
     * Limpa o cache de feriados
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache de feriados limpo');
    }

    /**
     * Obtém estatísticas do cache
     * @returns {Object} Estatísticas do cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            entries: Array.from(this.cache.entries()).map(([key, value]) => ({
                key,
                timestamp: value.timestamp,
                age: Date.now() - value.timestamp,
                dataLength: value.data.length
            }))
        };
    }
}

module.exports = new HolidaysService();
