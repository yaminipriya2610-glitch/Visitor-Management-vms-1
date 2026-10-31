# Postman API Testing Guide

## Recommended test order
1. `GET /api/health`
2. `POST /api/dev/seed-demo`
3. `POST /api/auth/login` as Employee
4. `GET /api/auth/me`
5. `POST /api/bookings`
6. `GET /api/bookings/my`
7. `POST /api/auth/login` as Security Head
8. `GET /api/security/bookings?status_filter=PENDING`
9. `POST /api/security/bookings/{bookingId}/approve`
10. `GET /api/bookings/{bookingId}`
11. `POST /api/security/verify`
12. `GET /api/bookings/{bookingId}/qr`
13. For rejection testing, create a second booking and use `POST /api/security/bookings/{bookingId}/reject` with a reason.

The collection automatically stores `employeeToken`, `securityToken`, `bookingId`, and `qrToken` as collection variables.

## Endpoint list

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/dev/seed-demo` | Development only |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |
| POST | `/api/bookings` | Employee |
| GET | `/api/bookings/my` | Employee |
| GET | `/api/bookings/{id}` | Owner or Security Head |
| GET | `/api/security/bookings` | Security Head |
| POST | `/api/security/bookings/{id}/approve` | Security Head |
| POST | `/api/security/bookings/{id}/reject` | Security Head |
| GET | `/api/bookings/{id}/qr` | Owner or Security Head |
| POST | `/api/security/verify` | Security Head |

## Authentication
For protected endpoints send:
`Authorization: Bearer <JWT token>`

## Important negative tests
- Employee cannot access Security endpoints: `403`.
- Security Head cannot create employee bookings: `403`.
- Rejection without a reason: `400`.
- Approving/rejecting an already decided booking: `409`.
- QR download before approval: `409`.
- Invalid QR: `valid: false`.
- Employee cannot view/download another employee's booking: `403`.
