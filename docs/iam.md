# IAM: simulacion en Angular

El proyecto utiliza Angular, TypeScript, HTML, CSS y JSON, sin un backend propio.
Hay una pantalla inicial sencilla de login; su adaptacion al estandar visual queda pendiente.

## Datos y ejecucion

Ejecutar `npm start` y abrir `http://localhost:4200`.
La ruta inicial redirige a `/sign-in`. Tambien puede abrirse directamente
`http://localhost:4200/sign-in`. El formulario muestra errores de validacion,
el rol al iniciar sesion y permite cerrar sesion o ir a productos.
Angular publica `server/db.json` como recurso estatico en `/api/v1/db.json`
mediante la configuracion de assets en `angular.json`. Reiniciar Angular si
estaba iniciado antes de cambiar esa configuracion.

La URL del JSON se configura con `environment.mockDbUrl`.
La coleccion `users` contiene dos cuentas ficticias:

- Empleado: usuario `demo`, clave `demo123`, role `employee`.
- Administrador: usuario `admin`, clave `admin123`, role `administrator`.

Cada usuario requiere uno de esos dos valores de `role`; otros valores se rechazan.
Los registros nuevos reciben `employee`. Para crear administradores de prueba,
editar `users` en el JSON; el registro no acepta elegir el rol de administrador.
Usar solamente credenciales ficticias: el JSON es publico y esta simulacion
no proporciona autenticacion ni autorizacion real.

`IamMockApi` carga los usuarios del JSON una vez y simula registro e inicio de
sesion en Angular. Los endpoints de IAM delegan en este simulador: no envian POST
al puerto 3000 ni a `/api/v1/authentication`. Esas URLs no son necesarias para IAM.
`apiBaseUrl` define el prefijo `/api/v1`. El proxy queda vacio para que Angular
sirva el JSON directamente en el puerto 4200, sin reenviar al puerto 3000.
Abrir `http://localhost:4200/api/v1/db.json` permite verificar los datos.
`server/routes.json` no interviene: esta simulacion no ejecuta JSON Server.

Los registros nuevos viven solo en memoria. Recargar la pagina los elimina y
vuelve a cargar los usuarios originales de `db.json`. Angular no escribe en el
archivo: para agregar cuentas permanentes de prueba, editar `users` manualmente.
La comparacion de usuarios ignora mayusculas; la de contrasenas es exacta.
El token generado tiene prefijo `mock-session-` y solo representa una sesion simulada.

## Uso desde las futuras vistas

Inyectar `IamStore` y llamar `signIn(command)`, `signUp(command)` y `signOut()`.
`signIn` devuelve `Promise<boolean>` y `signUp`, `Promise<User | null>`.
Los signals `user`, `isAuthenticated`, `loading` y `error` son de solo lectura.
Tambien se exponen `role`, `isAdministrator` e `isEmployee` como signals derivados.
Sin sesion, `role` devuelve `null` y ambos indicadores devuelven `false`.
El registro no inicia sesion automaticamente. Las contrasenas no se incluyen
en el usuario publico del store ni se guardan en almacenamiento del navegador.

El guard esta disponible; las rutas de inventario siguen sin proteccion hasta
definir las reglas de acceso. Los permisos concretos
de cada rol quedan pendientes de definir sus reglas.
