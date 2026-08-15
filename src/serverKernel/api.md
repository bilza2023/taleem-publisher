# Taleem Server Kernel API

## Purpose

`taleem-server` encapsulates the database, Prisma, authentication, authorization and all business logic behind a single **Server Kernel API**.

HTTP routes **must never** access Prisma or the database directly.

Instead, every route communicates exclusively with the Server Kernel.

This document defines the **public Kernel API** for route authors, tests and future AI agents.

---

## Public Kernel Components

The public kernel consists of only three categories:

### Resources

Business modules that expose the application data.

- User
- Admin
- Course
- Library
- Communication
- Subscription

---

### Auth

Responsible for authentication.

Responsibilities:

- create JWT tokens
- authenticate JWT tokens
- return the authenticated User/Admin

Routes never manipulate JWTs directly.

---

### Policy

Responsible for authorization.

Responsibilities:

- verify that an authenticated admin has permission to perform an operation on a course resource.

Authentication and authorization are intentionally separated.

---


# Route Utilities

Every authenticated route begins by extracting the Bearer token.

```js
import { getToken } from "../utils/getToken.js";

const token = getToken(req);

const identity = await kernel.auth.authenticate(token);
```

Implementation:

```js
export function getToken(req) {

    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        throw new Error("Missing Bearer token.");
    }

    return header.substring(7);

}
```

---

# Route Design Rules

A route should only perform orchestration.

Typical flow:

1. Extract token.
2. Authenticate identity.
3. Load required resources.
4. Perform authorization (admin routes only).
5. Execute business operation.
6. Return HTTP response.

Business rules belong inside the Server Kernel, not inside the route.

---

# Example

## User Route

```js
const token = getToken(req);

const user = await kernel.auth.authenticate(token);

const communication =
    await kernel.communication.create({

        userId: user.id,
        ...req.body

    });

res.status(201).json(communication);
```

---

## Admin Route

```js
const token = getToken(req);

const admin = await kernel.auth.authenticate(token);

const id = await kernel.library.slugToId(req.params.slug);

const library = await kernel.library.get(id);

await kernel.policy.require(
    admin,
    library.course.id,
    "library"
);

res.json(library);
```

---

## Philosophy

The Server Kernel is the only API between the HTTP layer and the application.

```
HTTP Route
      │
      ▼
Server Kernel API
      │
      ▼
Business Logic
      │
      ▼
Prisma / Database
```

Routes should remain thin, predictable orchestration layers with no business logic and no direct database access.
---

# Authentication

Authentication is a two-step process.

## Login

Authenticate credentials.

Returns a JWT.

```js
const token = await kernel.user.login(
    email,
    password
);

const token = await kernel.admin.login(
    email,
    password
);
```

Returns

```ts
Promise<string>
```

---

## Authenticate

Authenticate a JWT.

Returns the authenticated identity.

```js
const user = await kernel.auth.authenticate(token);
```

Returns

```ts
Promise<User | Admin>
```

Example

```js
const token = req.headers.authorization.replace(
    "Bearer ",
    ""
);

const user = await kernel.auth.authenticate(token);
```

---

# Authorization

Authorization is performed only after authentication.

```js
await kernel.policy.require(
    admin,
    courseId,
    "library"
);
```

Returns

```ts
Promise<AdminCoursePolicy>
```

Throws if access is denied.

Typical admin route

```js
const token = req.headers.authorization.replace(
    "Bearer ",
    ""
);

const admin = await kernel.auth.authenticate(token);

await kernel.policy.require(
    admin,
    library.course.id,
    "library"
);
```

---

# Resources

Every resource follows the same pattern.

```
list()
get()

create()
update()
delete()

slugToId()
idToSlug()
```

Resources may expose additional business methods.

---

# User

## Queries

```js
await kernel.user.list();

await kernel.user.get(id);

await kernel.user.getByEmail(email);
```

## Authentication

```js
await kernel.user.register(data);

await kernel.user.login(email, password);
```

Returns

```ts
Promise<string> // JWT
```

## CRUD

```js
await kernel.user.update(id, data);

await kernel.user.delete(id);
```

---

# Admin

## Queries

```js
await kernel.admin.list(filters);

await kernel.admin.get(id);
```

## Authentication

```js
await kernel.admin.login(email, password);
```

Returns

```ts
Promise<string> // JWT
```

## CRUD

```js
await kernel.admin.create(data);

await kernel.admin.update(id, data);

await kernel.admin.delete(id);
```

---

# Course

## Queries

```js
await kernel.course.list(filters);

await kernel.course.get(id);
```

Supported filters

```js
{
    access
}
```

## CRUD

```js
await kernel.course.create(data);

await kernel.course.update(id, data);

await kernel.course.delete(id);
```

## Utilities

```js
await kernel.course.slugToId(slug);

await kernel.course.idToSlug(id);
```

---

# Library

## Queries

```js
await kernel.library.list(filters);

await kernel.library.get(id);
```

Supported filters

```js
{
    course,
    access,
    type
}
```

## CRUD

```js
await kernel.library.create(data);

await kernel.library.update(id, data);

await kernel.library.delete(id);
```

## Utilities

```js
await kernel.library.slugToId(slug);

await kernel.library.idToSlug(id);
```

---

# Communication

## Queries

```js
await kernel.communication.list(filters);

await kernel.communication.get(id);
```

Supported filters

```js
{
    userId,
    libraryId
}
```

## CRUD

```js
await kernel.communication.create(data);

await kernel.communication.update(id, data);

await kernel.communication.delete(id);
```

## Special

```js
await kernel.communication.listUnanswered(admin);
```

Returns all unanswered communications for courses the admin is authorized to manage.

---

# Subscription

## Queries

```js
await kernel.subscription.list(filters);

await kernel.subscription.get(id);
```

Supported filters

```js
{
    userId,
    courseId
}
```

## CRUD

```js
await kernel.subscription.create(data);

await kernel.subscription.update(id, data);

await kernel.subscription.delete(id);
```

## Authorization

```js
await kernel.subscription.authorize(
    userId,
    courseId
);
```

Returns the active subscription.

Throws if no active subscription exists.

---

# Design Rules

1. Routes only communicate with the Server Kernel.

2. Routes never use Prisma.

3. Routes never create JWTs.

4. Login returns JWT tokens.

5. `auth.authenticate()` converts JWT → User/Admin.

6. `policy.require()` authorizes an authenticated admin.

7. Business rules belong inside resources.

8. Routes should remain thin orchestration layers.

---

# Example

## Public user route

```js
const token = req.headers.authorization.replace(
    "Bearer ",
    ""
);

const user = await kernel.auth.authenticate(token);

const item = await kernel.communication.create({
    ...req.body,
    userId: user.id
});
```

---

## Admin route

```js
const token = req.headers.authorization.replace(
    "Bearer ",
    ""
);

const admin = await kernel.auth.authenticate(token);

const id = await kernel.library.slugToId(req.params.slug);

const library = await kernel.library.get(id);

await kernel.policy.require(
    admin,
    library.course.id,
    "library"
);

res.json(library);
```

---

This document is the canonical contract between the HTTP routes, tests, and the Taleem Server Kernel.