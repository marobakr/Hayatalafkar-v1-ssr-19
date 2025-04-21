# Shared Module

This directory contains reusable components, directives, and pipes that are used across multiple features.

## Structure

```
shared/
├── components/   # Reusable components
├── directives/   # Custom directives
└── pipes/        # Custom pipes
```

## Guidelines

1. **Components/**
   - Buttons
   - Cards
   - Forms
   - Modals
   - Tooltips
   - Loading spinners
   - Error messages
   - Pagination
   - Search bars
   - Rating components
   - Image components with lazy loading
   - Social media sharing buttons

2. **Directives/**
   - Click outside
   - Lazy load images
   - Infinite scroll
   - Debounce click
   - Copy to clipboard
   - Form validators
   - Permissions
   - Skeleton loading
   - Intersection observer

3. **Pipes/**
   - Date formatting
   - Currency formatting
   - File size
   - Time ago
   - Safe HTML/URL
   - Number formatting
   - Text truncate
   - Filter
   - Sort

## Best Practices

1. Keep components small and focused
2. Use standalone components
3. Implement proper input validation
4. Write comprehensive unit tests
5. Document component APIs
6. Use TypeScript strict mode
7. Follow Angular style guide
8. Implement proper error handling
9. Use proper typing for inputs/outputs
10. Implement change detection strategies

## Missing Components

1. Rich text editor
2. File upload component
3. Date picker
4. Multi-select dropdown
5. Toast notifications
6. Breadcrumbs
7. Data table
8. Charts and graphs
9. Form builder
10. Image gallery

## Accessibility

1. Use proper ARIA labels
2. Implement keyboard navigation
3. Use semantic HTML
4. Provide proper color contrast
5. Support screen readers
6. Handle focus management 
