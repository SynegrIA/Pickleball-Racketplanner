create table public."Pagos" (
  "ID Pago" serial not null,
  "Fecha ISO" date null,
  "Pista" text null,
  "Nivel" public.nivel_enum null,
  "Nº Actuales" integer null,
  "Nº Faltantes" integer null,
  "Estado" text null,
  "ID Event" text null,
  "Payment_Intent 1" text null,
  "Payment Intent 2" text null,
  "Payment Intent 3" text null,
  "Payment Intent 4" text null,
  "Cobrado" boolean null,
  "ID Partida" integer null,
  "Monto" real null default '0'::real,
  jugador_id integer null,
  constraint Pagos_pkey primary key ("ID Pago"),
  constraint Pagos_ID Partida_fkey foreign KEY ("ID Partida") references "Reservas" ("ID Partida") on update CASCADE on delete CASCADE,
  constraint Pagos_club_id_fkey foreign KEY (club_id) references clubs (id),
  constraint Pagos_jugador_id_fkey foreign KEY (jugador_id) references "Jugadores" ("ID") on update CASCADE on delete CASCADE
) TABLESPACE pg_default;