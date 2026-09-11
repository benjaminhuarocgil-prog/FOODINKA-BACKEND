-- La plataforma tiene un único administrador principal.
-- El índice parcial también protege contra cambios de rol desde otros endpoints.
CREATE UNIQUE INDEX "User_single_admin_key" ON "User" ("role") WHERE "role" = 'ADMIN';
