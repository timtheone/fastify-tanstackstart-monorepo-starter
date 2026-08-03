export type PostgresConnection = Readonly<{
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}>;

export function postgresConnectionString(connection: PostgresConnection) {
  const user = encodeURIComponent(connection.user);
  const password = encodeURIComponent(connection.password);
  const database = encodeURIComponent(connection.database);
  return `postgresql://${user}:${password}@${connection.host}:${connection.port}/${database}`;
}
