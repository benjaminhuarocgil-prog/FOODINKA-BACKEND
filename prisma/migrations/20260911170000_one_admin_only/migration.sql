-- La plataforma tiene un único administrador principal.
-- El índice parcial también protege contra cambios de rol desde otros endpoints.
CREATE UNIQUE INDEX "users_single_admin_key" ON "users" ("role") WHERE "role" = 'ADMIN';
