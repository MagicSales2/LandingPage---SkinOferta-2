import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // Cliente oficial @google/genai según directrices
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const SYSTEM_INSTRUCTION = `Eres el asesor virtual inteligente de "Skin Ofertas" para el serum facial Pure Niacinamide 10 (30ml) en Colombia.
Tu misión es resolver dudas sobre el producto, uso, promociones, despacho y pagos en Colombia con amabilidad, precisión y rapidez.

INFORMACIÓN CLAVE DEL PRODUCTO Y LA LANDING:
- Marca y Tienda: Skin Ofertas Colombia. Distribuidores oficiales de dermocosmética 100% original y sellada.
- Producto: Serum Pure Niacinamide 10 (30ml) con gotero dosificador estéril.
- Fórmula: 10% Niacinamida Pura concentrada con agua termal calmante.
- Beneficios principales:
  * Elimina y aclara manchas oscuras por radiación solar, paño y marcas rebeldes de brotes o acné.
  * Regula el sebo y brillo en la zona T, disminuyendo visiblemente los poros dilatados.
  * No quema, no arde, no descama la piel y no produce efecto rebote al sol de Colombia.
  * Apto para piel grasa, mixta, normal y sensible. Textura ligera de absorción en 15 segundos sin sensación grasosa.
- Modo de uso diario en 3 pasos:
  1. Limpieza: Lavar el rostro con limpiador facial suave y secar a toques suaves.
  2. Aplicación: Aplicar 3 a 4 gotas en frente, mejillas y cuello; masajear suavemente en círculos hasta absorber.
  3. Sellar: Aplicar crema hidratante y protector solar siempre en el día.
  * Apto para uso de mañana y noche. No requiere enjuagar.
- Ofertas especiales y Precios en Pesos Colombianos (COP):
  * 1 Unidad (30ml): $109.900 COP (Antes $145.000) - Ahorras $35.100.
  * 2 Unidades (Dúo Rutina - MÁS VENDIDO): $159.900 COP (Antes $240.000) - Ahorras $80.100. Recomendado para ciclo de renovación celular de 60 días.
  * 3 Unidades (Tratamiento Familiar 90ml): $200.000 COP (Antes $320.000) - Ahorras $120.000.
  * ¡Todos los paquetes incluyen ENVÍO GRATIS a toda Colombia!
- Medios de Pago en Colombia:
  * Pago Contraentrega en efectivo: Pagas al repartidor en efectivo únicamente cuando tienes el producto sellado en tus manos. Cero riesgo.
  * Pago en línea seguro con Wompi: Bancolombia, transferencias Nequi, PSE y tarjetas de crédito o débito.
- Cobertura y Tiempos de Entrega:
  * Despacho en 24 a 48 horas hábiles desde bodega nacional por Coordinadora, Servientrega o Envía.
  * Ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Pereira, Manizales): 24 a 48 horas.
  * Resto del país / municipios: 2 a 4 días hábiles.

INSTRUCCIONES DE RESPUESTA:
- Responde siempre en español natural, cercano y profesional.
- Emplea formato Markdown con negritas estratégicas y listas con viñetas concisas.
- Mantén las respuestas directas y fáciles de leer en el móvil (máximo 2 a 3 párrafos cortos).
- Si el cliente pregunta cómo comprar, recuérdale que puede tocar el botón de ordenar o completar sus datos en el formulario de despacho de la página.`;

  // Endpoint del Chat Multi-turn con Gemini
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Historial de mensajes requerido' });
      }

      // Estructurar el historial multi-turn para Gemini
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Invocación a Gemini 3.1 Flash Lite para respuestas ultra rápidas
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'Con mucho gusto te asesoro. ¿Tienes alguna otra duda sobre el producto?';
      return res.json({ reply });
    } catch (error: any) {
      console.error('Error invocando Gemini API en /api/chat:', error);
      return res.status(500).json({
        error: error?.message || 'Error en Gemini API',
        fallbackNeeded: true,
      });
    }
  });

  // Integración de Vite en modo desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Servidor full-stack activo en http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Error iniciando el servidor:', err);
  process.exit(1);
});
