# Homework mini-nest 🐣

## 📌 A **200-line** toy re-implementation of the core ideas behind NestJS (decorators, IoC container, module system, Express adapter).


## ▶️ Запуск проєкту
```bash
npm install
```

```bash
npm run dev # start dev server on http://localhost:8081/api/books
```


## 📂 Mini-Nest Request Lifecycle
Client Request
      │
      ▼
  Express Middleware (JSON parser, logging)
      │
      ▼
  GuardsMiddleware (global → class → method)
      │
      ▼
  HandlerMiddleware
      │
      ▼
  getHandlerArgs (@Param, @Query, @Body)
      │
      ▼
  runPipes (global → class → method)
      │
      ▼
  Controller Method (handler.apply)
      │
      ▼
  FiltersMiddleware (Exception handling)
      │
      ▼
  Express Response → Client