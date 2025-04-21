# Core Module

This directory contains singleton services and application-wide features that should be imported only in the root AppModule.

## Structure

```
core/
├── components/     # Single-use components (header, footer, etc.)
├── guards/         # Route guards
├── layouts/        # Application layouts
├── services/       # Singleton services
├── interceptors/   # HTTP interceptors
├── interfaces/     # Core interfaces and types
└── resolvers/      # Route resolvers
```

## Guidelines

1. **Components/**
   - Header component
   - Footer component
   - Navigation components
   - Layout components
   - Error boundaries

2. **Guards/**
   - Authentication guard
   - Role-based guards
   - Feature flags guards
   - Maintenance mode guard

3. **Layouts/**
   - Main layout
   - Auth layout
   - Admin layout
   - Error layout

4. **Services/**
   - Authentication service
   - User service
   - Error handling service
   - Loading service
   - SEO service
   - Analytics service

5. **Interceptors/**
   - Auth interceptor
   - Error handling interceptor
   - Loading interceptor
   - Caching interceptor
   - Analytics interceptor

6. **Interfaces/**
   - User interface
   - API responses interfaces
   - Common types
   - Environment interfaces

7. **Resolvers/**
   - User resolver
   - Data prefetching resolvers
   - Configuration resolvers

## Best Practices

1. Services should be provided in 'root'
2. Use Angular's dependency injection
3. Implement proper error handling
4. Use TypeScript strict mode
5. Write comprehensive unit tests
6. Document public APIs
7. Use signals for state management

## Missing Components

1. Error handling service
2. Loading service
3. Analytics service
4. Maintenance mode guard
5. Error boundaries
6. Performance monitoring service
7. Feature flags service 
