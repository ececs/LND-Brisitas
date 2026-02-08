# Arquitectura

## Front-end
- HTML estatico por pagina.
- CSS global en `styles.css`.
- JS central en `script.js`.

## Modulos principales
- Carrito: agrega, elimina y persiste productos en `localStorage`.
- Checkout: resumen y guardado de pedidos locales.
- Admin: alta y listado de productos locales.
- Catalogo: renderizado base + productos agregados desde admin.

## Flujo basico
1. El usuario agrega productos al carrito.
2. El checkout genera un pedido y lo guarda en `localStorage`.
3. El panel admin lee los pedidos y permite alta de productos.

## Persistencia
- `brisitasCart`: carrito actual.
- `brisitasOrders`: pedidos generados.
- `brisitasProducts`: productos creados en admin.

## Limitaciones
- No hay backend real ni autenticacion.
- No se valida stock en el servidor.
