# Mensajes de WhatsApp para Kommo

Textos listos para pegar en las automatizaciones de Kommo. Cada mensaje va con la
etapa del pipeline a la que hay que pegarlo.

## Cómo usar las variables

No escribas las variables a mano. En el editor de Kommo hay un botón para
insertarlas, y es la única forma de garantizar que la sintaxis quede bien. Esta
tabla dice qué campo elegir en cada caso:

| En el mensaje va | Campo de Kommo | ID |
|---|---|---|
| Nombre del cliente | Nombre | — |
| Producto | Producto | `1430743` |
| Cantidad | Cantidad | `1430737` |
| Total | Total | `1430739` |
| Método de pago | Método de pago | `1406032` |
| Dirección | Dirección | `543658` |
| Ciudad | Ciudad / Municipio | `1430725` |
| Indicaciones de entrega | Indicaciones de entrega | `1430733` |
| Link de pago (Wompi) | Link de pago | `543662` |
| Link de la guía | Link guía | `1432777` |

---

## D1, D2 y D3 — Confirmación del pedido (Contra Entrega)

Estas tres etapas se eligen solas según la cantidad comprada, así que el mensaje
se ve distinto en cada una según el plan que eligió el cliente.

**Opción A (recomendada): un solo mensaje para las tres etapas**

Como el producto, la cantidad y el total llegan en variables, no hace falta
tres textos distintos. Pegá este en las tres etapas y el cliente lee siempre su
pedido correcto:

```
¡Hola {{nombre}}! 👋

Recibimos tu pedido de Sérum Niacinamida Pura 10%. Te contamos los detalles:

📦 Producto: {{producto}}
🔢 Cantidad: {{cantidad}}
💰 Total: {{total}}
💳 Pago: Contra Entrega

🚚 Envío gratis a toda Colombia. Lo despachamos en menos de 24 horas hábiles y
recibes en 2 a 4 días hábiles.

Cuando el courier te llame para confirmar la entrega, le dices que paga al
recibir. Si necesitás cambiar la dirección o la fecha, respondé este mensaje y
lo ajustamos.

¡Gracias por confiar en nosotros! ☀️
```

**Opción B: un texto por etapa**, si preferís que cada plan se comunique con su
propio tono.

**D1 — etapa "Contra Entrega 1 unidad" (`107313256`)**

```
¡Hola {{nombre}}! 👋

¡Listo! Recibimos tu pedido de 1 unidad de Sérum Niacinamida Pura 10%.

💰 Total: $84.900
💳 Pago contra entrega: le pagás al courier cuando recibas el paquete.
🚚 Envío gratis a todo Colombia, lo despachamos en menos de 24 horas hábiles.

Recibís en 2 a 4 días hábiles. Te escribimos cuando salga el paquete.

¡Gracias por tu compra! ☀️
```

**D2 — etapa "Contra Entrega 2 unidades" (`107313320`)**

```
¡Hola {{nombre}}! 👋

¡Listo! Recibimos tu pedido de 2 unidades de Sérum Niacinamida Pura 10%.

💰 Total: $149.900
💳 Pago contra entrega: le pagás al courier cuando recibas el paquete.
🚚 Envío gratis a todo Colombia, lo despachamos en menos de 24 horas hábiles.

Es el plan que más recomienda la gente: te alcanza para el cuidado diario y te
sale más barato que comprar de a uno.

Recibís en 2 a 4 días hábiles. Te escribimos cuando salga el paquete.

¡Gracias por tu compra! ☀️
```

**D3 — etapa "Contra Entrega 3 unidades" (`112274524`)**

```
¡Hola {{nombre}}! 👋

¡Listo! Recibimos tu pedido de 3 unidades de Sérum Niacinamida Pura 10%.

💰 Total: $209.900
💳 Pago contra entrega: le pagás al courier cuando recibas el paquete.
🚚 Envío gratis a todo Colombia, lo despachamos en menos de 24 horas hábiles.

Es el plan familiar: alcanza para toda la casa y es el que mejor precio tiene
por unidad.

Recibís en 2 a 4 días hábiles. Te escribimos cuando salga el paquete.

¡Gracias por tu compra! ☀️
```

---

## Pago pendiente (Wompi)

Etapa "Pago Online Pendiente" (`107313264`). Va acá el link de Wompi que se
genera solo en cada pedido.

```
¡Hola {{nombre}}! 👋

Gracias por tu pedido de {{cantidad}} × Sérum Niacinamida Pura 10%.
Total: {{total}}.

Podés pagar online con este link y te ahorrás el paso de pagarle al courier:

🔗 {{link de pago}}

El link es personal, no lo compartas. Si el pago se confirma, despachamos de
inmediato. Tenés 24 horas para completarlo, después el link se vence y nos
escribís para generarte uno nuevo.

Cualquier duda, respondé este mensaje. ☀️
```

---

## Pago confirmado (Wompi)

Etapa "Pago Online" (`107313776`).

```
¡Hola {{nombre}}! 👋

¡Recibimos tu pago! Tu pedido de {{cantidad}} × Sérum Niacinamida Pura 10% ya
está confirmado por {{total}}.

🚚 Lo despachamos en menos de 24 horas hábiles a la dirección que registraste.
Recibís en 2 a 4 días hábiles y te escribimos con el link de la guía para que
puedas seguir el paquete.

¡Gracias por tu compra! ☀️
```

---

## Pedido despachado

Etapa "Enviado/Despachado" (`107313780`). Acá ya existe el link de la guía.

```
¡Hola {{nombre}}! 👋

¡Tu pedido salió! 🚚

📦 Transportadora: te llega el nombre y el número de guía por separado.
🔗 Podés seguirlo acá: {{link de guía}}

El pago es contra entrega, así que le pagás al courier al recibirlo.

Si necesitás cambiar la dirección o la fecha de entrega, respondé este mensaje
lo antes posible.

¡Gracias por tu compra! ☀️
```

---

## Pedido entregado

Etapa "Entregado" (`142`).

```
¡Hola {{nombre}}! 👋

¡Tu pedido fue entregado! 🎉

Esperamos que el Sérum Niacinamida Pura 10% te guste. Recordá que conviene
aplicarlo antes de salir para que te proteja todo el día.

Si te sirvió, contale a alguien que también lo necesite. Y si quedó algún
inconveniente con la entrega, escribinos y lo revisamos.

¡Gracias por confiar en nosotros! ☀️
```

---

## Pedido cancelado

Etapa "Cancelado" (`143`). Ojo: este texto conviene mandarlo a mano, no por
automatización, porque nunca se cancela solo.

```
¡Hola {{nombre}}!

Tu pedido {{producto}} quedó cancelado y no se realizó ningún cobro.

Si fue por algún cambio de planes o querés reprogramarlo, escribinos y lo
volvemos a activar sin problema.

Gracias por la preferencia. ☀️
```

---

## Antes de activar: tres cosas que importan

**WhatsApp pide plantillas aprobadas.** Kommo manda estos mensajes a través de
WhatsApp Business, y Meta exige que los textos fuera de la ventana de 24 horas
estén aprobados como plantilla. Si pegás el texto libre, la primera vez puede
funcionar, pero a las 24 horas la cuenta queda expuesta a bloqueo. En Kommo, la
pestaña de cada automatización tiene un apartado de plantillas: creá una por
cada mensaje con este mismo texto y pedí la aprobación antes de encender los
disparadores.

**El link de la guía llega vacío hasta que cargues saldo en Envia.** Este es un
bloqueo real ahora: las cuatro últimas ventas fallaron con "Saldo insuficiente",
así que esas guías no existen. Si encendés el disparador de "despachado" antes
de recargar, el cliente recibe el mensaje sin link. Recargá y corré
`reintentar-sync` primero.

**El sitio promete dos tiempos de entrega distintos.** La sección del formulario
dice "2 a 4 días hábiles", y el chatbot del sitio dice "1 a 2 días en ciudades
principales y 3 a 5 en el resto". Usé 2 a 4 en todos los mensajes para que no
haya contradicción con lo que el cliente ve en la landing, pero conviene que
decidas cuál es el real y lo dejes parejo en los dos lados.