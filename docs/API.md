# Technical Event Ticketing & Reservation Platform API

## Base URL

```text
http://localhost:5000/api
```

The API uses JSON request/response bodies. Authentication is cookie-based: the backend sets `access_token` and `refresh_token` as HTTP-only cookies during login.

## Authentication

### Authentication model

- Access token: HTTP-only cookie named `access_token`, 15-minute lifetime.
- Refresh token: HTTP-only cookie named `refresh_token`, 7-day lifetime.
- Refresh tokens are rotated on refresh and stored hashed in the database.
- Protected routes require a valid `access_token` cookie.
- Admin-only routes require an authenticated user whose role is `admin`.

### `POST /auth/login`

Authenticate a user and set access/refresh cookies.

**Authentication:** Public

**Request body**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Validation**

- Email and password are required.
- Email must have a valid email format.

**Success — `200`**

```json
{
  "message": "User logged in successfully",
  "data": {
    "id": 1,
    "name": "Yasmine Ahmed",
    "email": "yasmine.ahmed@example.com",
    "role": "customer"
  }
}
```

`password_hash` is removed from the response.

**Common errors**

- `400` — `Email and password are required`
- `400` — `Invalid email format`
- `401` — `Invalid email or password`

### `POST /auth/refresh`

Rotate the current refresh token and issue a new access token and refresh token.

**Authentication:** Requires `refresh_token` cookie.

**Success — `200`**

```json
{
  "message": "Access and refresh tokens refreshed successfully"
}
```

**Common errors**

- `401` — `Refresh token required`
- `401` — `Invalid or revoked refresh token`
- `401` — `Invalid or expired refresh token`

### `POST /auth/logout`

Revoke the current refresh token and clear both authentication cookies.

**Authentication:** Public endpoint, but revocation occurs when a refresh-token cookie is present.

**Success — `200`**

```json
{
  "message": "Logged out successfully"
}
```

---

## Users

### `POST /users/register`

Register a new customer account.

**Authentication:** Public

**Request body**

```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed.hassan@example.com",
  "password": "your-password"
}
```

**Success — `201`**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "name": "Ahmed Hassan",
    "email": "ahmed.hassan@example.com",
    "role": "customer"
  }
}
```

**Common errors**

- `400` — `Name, email, and password are required`
- `400` — `Invalid email format`
- `409` — `Email is already registered`

### `GET /users/me`

Return the authenticated user's profile.

**Authentication:** Required

**Success — `200`**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Yasmine Ahmed",
    "email": "yasmine.ahmed@example.com",
    "role": "customer"
  }
}
```

### `GET /users`

Return a filtered, sortable, paginated list of users.

**Authentication:** Admin only

**Query parameters**

- `role`: `customer` or `admin`
- `name`: non-empty name filter
- `email`: non-empty email filter
- `sort`: `id`, `name`, `email`
- `order`: `asc` or `desc`
- `page`: positive integer, default `1`
- `limit`: integer `1..100`, default `10`
- `fields`: comma-separated subset of `id,name,email,role`

**Success — `200`**

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Ahmed Hassan",
      "email": "ahmed.hassan@example.com",
      "role": "customer"
    }
  ]
}
```

### `GET /users/:id`

Return one user.

**Authentication:** Admin only

**Success:** `200`

### `PUT /users/:id`

Update a user's name and email.

**Authentication:** Admin only

**Request body**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Common errors**

- `400` — `Invalid user id`
- `400` — `Name and email are required`
- `400` — `Invalid email format`
- `404` — `User not found`
- `409` — `Email is already registered`

### `DELETE /users/:id`

Delete a user.

**Authentication:** Admin only

**Success:** `200`

---

## Venues

### `GET /venues`

List venues with filtering, sorting, pagination, and field selection.

**Authentication:** Public

**Query parameters**

- `status`: `active` or `inactive`
- `location`: text filter
- `min_capacity`: non-negative integer
- `max_capacity`: non-negative integer
- `sort`: `id`, `name`, `capacity`
- `order`: `asc` or `desc`
- `page`: positive integer, default `1`
- `limit`: integer `1..100`, default `10`
- `fields`: comma-separated subset of `id,name,location,capacity,description,status`

**Success:** `200`

### `GET /venues/:id`

Return one venue.

**Authentication:** Public

**Success:** `200`

### `POST /venues`

Create a venue.

**Authentication:** Admin only

**Request body**

```json
{
  "name": "Hana Innovation Centre",
  "location": "Mansoura",
  "capacity": 300,
  "description": "Technical event venue",
  "status": "active"
}
```

**Success — `201`**

```json
{
  "message": "Venue Created successfully",
  "data": {
    "id": 1,
    "name": "Hana Innovation Centre",
    "location": "Mansoura",
    "capacity": 300,
    "description": "Technical event venue",
    "status": "active"
  }
}
```

### `PUT /venues/:id`

Update venue information.

**Authentication:** Admin only

**Request body:** Same fields as `POST /venues`.

**Common errors**

- `400` — invalid venue id / status / incomplete information
- `404` — `Venue not found`

### `PATCH /venues/:id/status`

Change venue status.

**Authentication:** Admin only

**Request body**

```json
{
  "status": "inactive"
}
```

---

## Events

### `GET /events`

List events with filtering, sorting, pagination, and field selection.

**Authentication:** Public

**Query parameters**

- `status`: `draft`, `published`, `cancelled`, `completed`
- `category`: `conference`, `workshop`, `technical_meetup`, `seminar`, `training_session`
- `venue_id`: positive integer
- `sort`: `id`, `title`, `date`
- `order`: `asc`, `desc`
- `page`: positive integer, default `1`
- `limit`: integer `1..100`, default `10`
- `fields`: comma-separated subset of event fields

Allowed event fields:

```text
id,title,description,category,status,date,venue_id,start_time,end_time,image
```

### `GET /events/:id`

Return one event.

**Authentication:** Public

### `POST /events`

Create an event.

**Authentication:** Admin only

**Request body**

```json
{
  "title": "Ticket Story Event",
  "description": "Technical meetup",
  "category": "technical_meetup",
  "status": "published",
  "date": "2026-11-30",
  "venue_id": 1,
  "start_time": "10:00",
  "end_time": "12:00",
  "image": "https://example.com/image.jpg"
}
```

**Rules**

- `date` must be `YYYY-MM-DD`.
- `start_time` and `end_time` must be `HH:mm`.
- `start_time` must be before `end_time`.
- Venue must exist.
- A venue cannot have overlapping `draft` or `published` events on the same date.
- An event ending exactly when another event starts does not overlap.

**Success — `201`**

```json
{
  "message": "Event created successfully",
  "data": {
    "id": 6,
    "title": "Ticket Story Event",
    "description": "Technical meetup",
    "category": "technical_meetup",
    "status": "published",
    "date": "2026-11-30",
    "venue_id": 1,
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "image": null
  }
}
```

**Common errors**

- `400` — invalid status/category/date/time/venue id
- `404` — `Venue not found`
- `409` — `Venue is already booked during this time`

### `PUT /events/:id`

Modify an event.

**Authentication:** Admin only

**Request body:** Same fields as event creation.

The overlap check excludes the event being updated from its own conflict search.

### `PATCH /events/:id`

Change only the event status.

**Authentication:** Admin only

**Request body**

```json
{
  "status": "cancelled"
}
```

---

## Event Ticket Prices

### `GET /events/:eventId/ticket-prices`

Return all configured ticket prices for an event.

**Authentication:** Public

**Ticket types**

```text
regular
vip
student
early_bird
```

### `POST /events/:eventId/ticket-prices`

Create an event-specific ticket price.

**Authentication:** Admin only

**Request body**

```json
{
  "type": "vip",
  "price": 250
}
```

**Rules**

- Event must exist.
- Ticket type must be valid.
- Price must be a finite number `>= 0`.
- The same ticket type can only have one price per event.

**Common errors**

- `404` — `Event not found`
- `400` — `Invalid ticket type` / `Invalid price`
- `409` — `Price for this ticket type already exists for this event`

### `PUT /events/:eventId/ticket-prices/:type`

Update the price for a ticket type.

**Authentication:** Admin only

**Request body**

```json
{
  "price": 275
}
```

### `DELETE /events/:eventId/ticket-prices/:type`

Delete an event ticket price.

**Authentication:** Admin only

---

## Seats

A seat is a physical seat belonging to a venue. Its `type` determines which ticket category can be used for that seat.

### Seat types

```text
regular
vip
student
early_bird
```

### `POST /seats`

Create a seat.

**Authentication:** Admin only

**Request body**

```json
{
  "row": "A",
  "section": "VIP",
  "seat_number": 7,
  "venue_id": 1,
  "type": "vip"
}
```

**Rules**

- `row`: non-empty, maximum 10 characters.
- `section`: non-empty, maximum 50 characters.
- `seat_number`: positive integer.
- `venue_id`: positive integer and must reference an existing venue.
- `type`: valid ticket type.
- Physical seat uniqueness is enforced by `(venue_id, section, row, seat_number)`.

### `GET /seats/venue/:venueId`

Return all seats for a venue.

**Authentication:** Public

### `GET /seats/:id`

Return one seat.

**Authentication:** Public

### `PUT /seats/:id`

Update row, section, seat number, and type.

**Authentication:** Admin only

**Request body**

```json
{
  "row": "A",
  "section": "VIP",
  "seat_number": 7,
  "type": "vip"
}
```

### `DELETE /seats/:id`

Delete a seat.

**Authentication:** Admin only

---

## Reservations

### `POST /reservations`

Create a pending reservation for an event.

**Authentication:** Required

**Request body**

```json
{
  "event_id": 6
}
```

**Rules**

- Event must exist.
- Event must be `published`.
- Reservation initially has status `pending`.

**Success — `201`**

```json
{
  "message": "Reservation created successfully",
  "data": {
    "id": 7,
    "user_id": 2,
    "event_id": 6,
    "created_at": "2026-09-14T12:31:52.250Z",
    "status": "pending"
  }
}
```

### `GET /reservations`

List reservations.

**Authentication:** Required

- Customers receive reservations belonging to themselves.
- Admins receive all reservations.

**Query parameters**

- `status`: `pending`, `confirmed`, `cancelled`
- `event_id`: positive integer
- `sort`: `id`, `created_at`, `status`
- `order`: `asc`, `desc`
- `page`: positive integer, default `1`
- `limit`: integer `1..100`, default `10`
- `fields`: comma-separated subset of `id,user_id,event_id,created_at,status`

### `GET /reservations/:id`

Return one reservation.

**Authentication:** Required

Customers can only access their own reservations; admins can access any reservation.

### `PATCH /reservations/:id/status`

Change reservation status.

**Authentication:** Required

**Request body**

```json
{
  "status": "cancelled"
}
```

**Business rules**

- Customers may only change their own reservation.
- Customers may only set status to `cancelled`.
- A cancelled reservation cannot be changed back.
- A confirmed reservation cannot return to `pending`.

---

## Seat Holds

A seat hold is a temporary claim on a physical seat for a specific event and reservation.

### `POST /seat-holds`

Create a 10-minute seat hold.

**Authentication:** Required

**Request body**

```json
{
  "seat_id": 7,
  "event_id": 6,
  "reservation_id": 7,
  "type": "vip"
}
```

**Rules**

- Reservation must exist, belong to the authenticated user, and be `pending`.
- Reservation must belong to the requested event.
- Event must exist and be `published`.
- Seat must exist and belong to the event's venue.
- Seat type must match requested ticket type.
- Hold expires 10 minutes after creation.
- Only one active hold can exist for the same `(event_id, seat_id)`.
- Database conflict handling allows replacement of an expired hold.

**Success — `201`**

```json
{
  "message": "Seat held successfully",
  "data": {
    "id": 4,
    "seat_id": 7,
    "event_id": 6,
    "reservation_id": 7,
    "type": "vip",
    "expires_at": "2026-09-14T15:27:45.944Z"
  }
}
```

**Common errors**

- `400` — reservation/event/seat validation failure
- `403` — reservation belongs to another user
- `409` — `Seat is currently held`

### `GET /seat-holds/reservation/:reservationId`

Return the authenticated user's seat holds for a reservation.

**Authentication:** Required

### `GET /seat-holds/event/:eventId/available-seats`

Return seats that are currently available for an event.

**Authentication:** Public

A seat is excluded when:

- a ticket already exists for that event and seat, or
- an active hold exists for that event and seat (`expires_at > CURRENT_TIMESTAMP`).

Expired holds therefore stop blocking the seat without requiring a background cleanup process.

### `GET /seat-holds/:id`

Return one seat hold.

**Authentication:** Required

The authenticated user must own the associated reservation.

### `DELETE /seat-holds/:id`

Delete a seat hold.

**Authentication:** Required

The authenticated user must own the associated reservation.

---

## Payments

Payment processing is transactional. Accepted payments create tickets, remove holds, and confirm the reservation in one database transaction.

### `POST /payments/reservations/:reservationId`

Process payment for a pending reservation.

**Authentication:** Required

**Request body**

```json
{
  "transaction_id": "TXN-12345",
  "status": "accepted"
}
```

`status` must be `accepted` or `rejected`.

**Processing rules**

1. Reservation must exist and belong to the authenticated user.
2. Reservation must be `pending`.
3. Only one payment is allowed per reservation.
4. The reservation must have seat holds.
5. Every hold must still be unexpired.
6. Each hold's event and type determine the authoritative event ticket price.
7. Client-supplied amount is not accepted; the server calculates the amount.
8. `rejected` creates a rejected payment but leaves the reservation pending and keeps the holds.
9. `accepted` creates tickets, deletes holds, and changes reservation status to `confirmed`.
10. Any failure during the transaction rolls back the transaction.

**Success — `201`**

```json
{
  "message": "Payment processed successfully",
  "data": {
    "id": 1,
    "reservation_id": 7,
    "transaction_id": "TXN-12345",
    "amount": "250.00",
    "created_at": "2026-09-14T15:30:00.000Z",
    "status": "accepted"
  }
}
```

**Important failure cases**

- `400` — reservation not pending
- `400` — no seat holds
- `400` — one or more holds expired
- `404` — ticket price not found
- `403` — reservation ownership violation
- `409` — payment already exists

### `GET /payments/reservations/:reservationId`

Return the payment belonging to a reservation.

**Authentication:** Required

Customers can only access their own reservation's payment; admins can access any reservation's payment.

### `GET /payments/:id`

Return one payment.

**Authentication:** Required

Customers can only access payments associated with their own reservations; admins can access any payment.

---

## Tickets

A ticket is the final sold seat for a specific event.

### `POST /tickets`

Create a ticket directly.

**Authentication:** Required

**Request body**

```json
{
  "reservation_id": 7,
  "event_id": 6,
  "seat_id": 7,
  "type": "vip"
}
```

**Rules**

- Reservation must exist and be `confirmed`.
- Customer users may only use their own reservation; admins may operate across users.
- Reservation must belong to the requested event.
- Event and seat must exist.
- Seat must belong to the event's venue.
- The event must have a configured price for the requested ticket type.
- The seat must currently have a hold.
- The hold must be unexpired.
- The hold must belong to the same reservation.
- The database unique constraint prevents duplicate `(event_id, seat_id)` tickets.

### `GET /tickets/my`

Return tickets belonging to the authenticated user.

**Authentication:** Required

### `GET /tickets/reservation/:reservationId`

Return tickets for a reservation.

**Authentication:** Required

Customers can only access their own reservation's tickets; admins can access any reservation's tickets.

### `GET /tickets/:id`

Return one ticket.

**Authentication:** Required

### `DELETE /tickets/:id`

Delete a ticket.

**Authentication:** Required

Customers may delete their own ticket only when its reservation is `cancelled`. Admins can delete tickets under the same reservation-status rule.

---

## Standard Authorization Model

### Public endpoints

These can be called without an access token:

```text
POST   /auth/login
POST   /auth/refresh      (requires refresh cookie)
POST   /auth/logout
POST   /users/register
GET    /venues
GET    /venues/:id
GET    /events
GET    /events/:id
GET    /events/:eventId/ticket-prices
GET    /seats/venue/:venueId
GET    /seats/:id
GET    /seat-holds/event/:eventId/available-seats
```

### Authenticated endpoints

All endpoints not marked public require a valid `access_token` cookie.

### Admin-only endpoints

```text
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id

POST   /venues
PUT    /venues/:id
PATCH  /venues/:id/status

POST   /events
PUT    /events/:id
PATCH  /events/:id

POST   /events/:eventId/ticket-prices
PUT    /events/:eventId/ticket-prices/:type
DELETE /events/:eventId/ticket-prices/:type

POST   /seats
PUT    /seats/:id
DELETE /seats/:id
```

## Core Booking Workflow

```text
1. Customer logs in
2. Customer selects a published event
3. Customer creates a reservation
4. Customer selects a seat and ticket type
5. API validates seat type and creates a 10-minute seat hold
6. Customer processes payment
7. API recalculates the authoritative ticket price
8. Accepted payment transactionally:
   - creates payment
   - creates tickets
   - deletes seat holds
   - confirms reservation
9. Customer receives confirmed reservation/ticket
```

## Important Business Rules

### Event/venue scheduling

A venue cannot host overlapping draft or published events on the same date.

Overlap is detected when:

```text
existing.start_time < new.end_time
AND
existing.end_time > new.start_time
```

An event from `10:00` to `12:00` and another from `12:00` to `14:00` do not overlap.

### Seat availability

A physical seat belongs to a venue, but availability is event-specific.

A seat is unavailable for an event if it has either:

- an existing ticket for that event, or
- an unexpired seat hold for that event.

The same physical seat can therefore be sold for a different event at the same venue.

### Seat/ticket type matching

```text
seat.type === requested ticket type
```

Examples:

```text
VIP seat + VIP ticket          -> allowed
Regular seat + Regular ticket  -> allowed
VIP seat + Regular ticket      -> rejected
Regular seat + VIP ticket      -> rejected
```

### Ticket pricing

Ticket prices are event-specific. The server calculates payment amounts from `event_ticket_price`; clients do not submit the final amount.

## Database integrity relevant to the API

The schema enforces important relationships and uniqueness rules, including:

- unique user email
- unique physical seat `(venue_id, section, row, seat_number)`
- unique event ticket `(event_id, seat_id)`
- unique active hold key `(event_id, seat_id)`
- unique ticket price per event/type `(event_id, type)`
- unique payment per reservation

## Error format

The controllers throw `AppError` instances and pass failures to the global error middleware. Exact response envelope for errors is centralized in that middleware; endpoint-specific error messages are documented above where known from the controllers/services.

## Notes for frontend clients

When using `fetch`, include credentials so authentication cookies are sent:

```ts
fetch(url, {
  credentials: "include",
  ...options,
});
```

The current frontend API helper uses `credentials: "include"` for every request.
