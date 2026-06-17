---
name: API hook id types
description: Generated Orval hooks expect number not string for id parameters
---

## Rule

All generated hooks in `@workspace/api-client-react` expect `number` for id parameters, not `string`.

```ts
// WRONG — causes TS2345
useGetCourse(String(courseId), ...)

// CORRECT
useGetCourse(courseId, ...)           // if courseId is already number
useGetNote(Number(id), ...)           // if id comes from route params (string)
```

Also applies to `queryKey` helpers: `getGetCourseQueryKey(courseId)` expects number.

**Why:** Orval generates types directly from the OpenAPI spec which uses integer types. Route params from wouter are strings, so explicit conversion is needed.
