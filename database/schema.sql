-- =========================================================
-- ENUM TYPES
-- =========================================================

CREATE TYPE role_type AS ENUM (
    'customer',
    'admin'
);

CREATE TYPE vstatus_type AS ENUM (
    'active',
    'inactive'
);

CREATE TYPE category_type AS ENUM (
    'conference',
    'workshop',
    'technical_meetup',
    'seminar',
    'training_session'
);

CREATE TYPE estatus_type AS ENUM (
    'draft',
    'published',
    'cancelled',
    'completed'
);

CREATE TYPE reservation_status_type AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);

CREATE TYPE payment_status_type AS ENUM (
    'accepted',
    'rejected'
);

CREATE TYPE ticket_type AS ENUM (
    'regular',
    'vip',
    'student',
    'early_bird'
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role role_type NOT NULL DEFAULT 'customer'
);


-- =========================================================
-- VENUE
-- =========================================================

CREATE TABLE venue (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    description TEXT,
    status vstatus_type NOT NULL
);


-- =========================================================
-- EVENT
-- =========================================================

CREATE TABLE event (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category category_type NOT NULL,
    status estatus_type NOT NULL,
    date DATE NOT NULL,
    venue_id INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    image TEXT,

    CONSTRAINT fk_event_venue
        FOREIGN KEY (venue_id)
        REFERENCES venue(id),

    CONSTRAINT check_event_time
        CHECK (end_time > start_time)
);


-- =========================================================
-- SEAT
-- =========================================================

CREATE TABLE seat (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    row VARCHAR(10) NOT NULL,
    section VARCHAR(50) NOT NULL,
    seat_number INTEGER NOT NULL,
    venue_id INTEGER NOT NULL,

    CONSTRAINT fk_seat_venue
        FOREIGN KEY (venue_id)
        REFERENCES venue(id),

    CONSTRAINT check_seat_number
        CHECK (seat_number > 0),

    CONSTRAINT unique_venue_seat
        UNIQUE (venue_id, section, row, seat_number)
);


-- =========================================================
-- RESERVATION
-- =========================================================

CREATE TABLE reservation (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status reservation_status_type NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_reservation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_reservation_event
        FOREIGN KEY (event_id)
        REFERENCES event(id)
);


-- =========================================================
-- PAYMENT
-- =========================================================

CREATE TABLE payment (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id INTEGER NOT NULL UNIQUE,
    transaction_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status payment_status_type NOT NULL,

    CONSTRAINT fk_payment_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservation(id)
);


-- =========================================================
-- TICKET
-- =========================================================

CREATE TABLE ticket (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type ticket_type NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    seat_id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,

    CONSTRAINT fk_ticket_seat
        FOREIGN KEY (seat_id)
        REFERENCES seat(id),

    CONSTRAINT fk_ticket_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservation(id),

    CONSTRAINT fk_ticket_event
        FOREIGN KEY (event_id)
        REFERENCES event(id),

    CONSTRAINT unique_event_seat
        UNIQUE (event_id, seat_id)
);


-- =========================================================
-- SEAT HOLD
-- =========================================================

CREATE TABLE seat_hold (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    seat_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_seat_hold_seat
        FOREIGN KEY (seat_id)
        REFERENCES seat(id),

    CONSTRAINT fk_seat_hold_event
        FOREIGN KEY (event_id)
        REFERENCES event(id),

    CONSTRAINT fk_seat_hold_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservation(id),

    CONSTRAINT unique_event_seat_hold
        UNIQUE (event_id, seat_id)
);