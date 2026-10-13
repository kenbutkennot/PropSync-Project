-- Run this in the Supabase SQL editor (or psql against your own Postgres).
-- Enables PostGIS, creates the schema, and locks it down with Row Level
-- Security so an agent can only ever see/edit their own properties -
-- enforced by the database itself, not just the API layer.

create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- Mirrors auth.users (Supabase) 1:1. If you're not on Supabase, drop the
-- foreign key to auth.users and manage agent rows yourself.
create table if not exists agents (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    full_name text,
    created_at timestamptz not null default now()
);

create table if not exists properties (
    id uuid primary key default uuid_generate_v4(),
    agent_id uuid not null references agents (id) on delete cascade,
    address text not null,
    city text,
    state text,
    postal_code text,
    price double precision,
    bedrooms integer,
    bathrooms double precision,
    square_feet double precision,
    property_type text,
    status text not null default 'available',
    owner_name text,
    owner_contact text,
    notes text,
    location geometry(Point, 4326),
    source text not null default 'manual',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Spatial index: makes bounding-box map queries fast even at tens of
-- thousands of rows.
create index if not exists properties_location_idx on properties using gist (location);
create index if not exists properties_agent_idx on properties (agent_id);

-- Row Level Security
alter table agents enable row level security;
alter table properties enable row level security;

create policy "agents can read own row"
    on agents for select
    using (auth.uid() = id);

create policy "agents can read own properties"
    on properties for select
    using (auth.uid() = agent_id);

create policy "agents can insert own properties"
    on properties for insert
    with check (auth.uid() = agent_id);

create policy "agents can update own properties"
    on properties for update
    using (auth.uid() = agent_id);

create policy "agents can delete own properties"
    on properties for delete
    using (auth.uid() = agent_id);

-- Realtime: lets the frontend subscribe to INSERT/UPDATE/DELETE on
-- properties so a sheet edit updates every open map instantly.
alter publication supabase_realtime add table properties;
