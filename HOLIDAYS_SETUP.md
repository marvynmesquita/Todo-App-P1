# 🎉 Configuração de Feriados - Todo App

## 📋 Pré-requisitos

Para usar a funcionalidade de feriados, você precisa:

1. **Token da API Invertexto**
2. **Arquivo .env configurado**

## 🔧 Configuração

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações da aplicação
PORT=3000
NODE_ENV=development
SESSION_SECRET=todo-app-secret-key-2024

# API de Feriados - Substitua SEUTOKEN pelo seu token real
INVERT=SEUTOKEN
```

### 2. Obter Token da API

1. Acesse: https://api.invertexto.com/
2. Faça seu cadastro
3. Obtenha seu token de acesso
4. Substitua `SEUTOKEN` no arquivo `.env` pelo seu token real

### 3. Exemplo de configuração

```env
INVERT=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## ✨ Funcionalidades Implementadas

### 🗓️ **Calendário com Feriados**
- **Dias destacados** em vermelho para feriados
- **Indicador visual** com estrela dourada
- **Tooltip** mostrando o nome do feriado
- **Hover effects** elegantes

### 📅 **Lista de Feriados do Mês**
- **Seção dedicada** no painel direito
- **Categorização** por tipo (Nacional, Estadual, Municipal)
- **Design responsivo** e moderno
- **Scroll** para listas longas

### 🚀 **Performance Otimizada**
- **Cache inteligente** (24 horas)
- **Fallback** para feriados fixos do Brasil
- **Carregamento assíncrono**
- **Tratamento de erros** robusto

### 🎨 **Design Moderno**
- **Cores diferenciadas** por tipo de feriado
- **Animações suaves**
- **Ícones intuitivos**
- **Layout responsivo**

## 🔄 Tipos de Feriados Suportados

### 🇧🇷 **Nacionais**
- Confraternização Universal
- Tiradentes
- Dia do Trabalhador
- Independência do Brasil
- Nossa Senhora Aparecida
- Finados
- Proclamação da República
- Natal
- Páscoa (calculada dinamicamente)
- Carnaval (calculada dinamicamente)
- Sexta-feira Santa (calculada dinamicamente)

### 🏛️ **Estaduais e Municipais**
- Carregados dinamicamente da API
- Categorizados por tipo
- Ícones diferenciados

## 🛠️ **API Endpoints**

### Feriados por Ano
```
GET https://api.invertexto.com/v1/holidays/2024?token=SEUTOKEN
```

### Resposta da API
```json
[
  {
    "date": "2024-01-01",
    "name": "Confraternização Universal",
    "type": "nacional"
  },
  {
    "date": "2024-04-21",
    "name": "Tiradentes",
    "type": "nacional"
  }
]
```

## 🔧 **Configurações Avançadas**

### Cache
- **Duração:** 24 horas
- **Limpeza:** Automática
- **Estatísticas:** Disponíveis via `holidaysService.getCacheStats()`

### Fallback
- **Ativação:** Em caso de erro na API
- **Dados:** Feriados nacionais fixos do Brasil
- **Cálculos:** Páscoa, Carnaval e Sexta-feira Santa

### Timeout
- **API:** 10 segundos
- **Retry:** Não implementado (pode ser adicionado)

## 🚨 **Solução de Problemas**

### Erro: "Token inválido"
- Verifique se o token está correto no arquivo `.env`
- Confirme se o token está ativo na API Invertexto

### Erro: "Timeout da API"
- Verifique sua conexão com a internet
- A API pode estar temporariamente indisponível
- O sistema usará feriados padrão automaticamente

### Feriados não aparecem
- Verifique se o arquivo `.env` existe
- Confirme se a variável `INVERT` está definida
- Verifique os logs do servidor para erros

## 📱 **Responsividade**

O sistema de feriados funciona perfeitamente em:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Telas grandes** (1400px+)

## 🔮 **Próximas Melhorias**

- [ ] **Feriados por estado** específico
- [ ] **Feriados municipais** por cidade
- [ ] **Notificações** de feriados próximos
- [ ] **Exportação** de calendário
- [ ] **Sincronização** com Google Calendar
- [ ] **Feriados internacionais**

---

**🎉 Pronto! Seu calendário agora mostra todos os feriados brasileiros!**

