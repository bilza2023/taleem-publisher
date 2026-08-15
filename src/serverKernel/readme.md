I would make it even stricter. Authentication is **not one thing**. It is four different concerns that have been living together.

# Taleem Server Kernel Constitution

### Purpose

The **serverKernel** is the product. It contains all business logic and data access. HTTP is only an adapter.

## Owns

* Database (Prisma)
* Validation
* Business rules
* Authentication
* Authorization
* Domain errors

## Never owns

* Express
* Routes
* `req` / `res`
* HTML pages
* Cookies
* Headers
* Static files
* URL parsing

## Authentication Boundary

### HTTP Layer

Responsible for:

* Reading `Authorization` header
* Reading cookies
* Extracting bearer token
* Passing token to kernel

Never verifies anything.

### Kernel

Responsible for:

* Verifying JWT
* Loading user
* Checking permissions
* Checking subscriptions
* Returning authenticated identity

Never reads headers.

## Public API Rules

Every public method:

* validates input
* validates authentication (if required)
* enforces authorization
* throws explicit errors
* never silently fails
* never returns ambiguous `null`

## Error Rules

Errors are for developers.

Every error answers:

1. What failed?
2. Why?
3. Which method?
4. Which object/user/resource?
5. What should the caller check?

Example:

```text
AuthenticationError
Method : library.get()
Reason : JWT expired
User   : 31
Token  : valid format, expired at 2026-07-27T09:10Z
```

## Story Rule

Every feature must be explainable as a story.

```
HTTP
↓
Extract token
↓
Kernel
↓
Authenticate
↓
Authorize
↓
Business logic
↓
Return result
↓
HTTP formats response
```

No business logic is allowed before entering the kernel.

---

I would add one final principle because it will save you from years of debugging:

> **The kernel trusts nothing and explains everything.**

That one sentence should be visible at the top of the `serverKernel` folder. It captures the philosophy you've been moving toward: every input is validated, every decision is explicit, and every failure tells you exactly why it happened.
