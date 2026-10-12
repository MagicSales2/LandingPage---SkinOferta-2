import { Review, FAQItem, OrderOffer } from './types';

export const COLOMBIAN_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Valeria Mendoza",
    text: "¡Las manchas del acné por fin están desapareciendo! Llevo un mes usando este sérum de niacinamida y la diferencia es brutal: mi piel se ve más pareja, los poros de la nariz se notan mucho menos y no me saca brotes. Lo uso mañana y noche. Pagué contra entrega y llegó en 2 días.",
    rating: 5,
    date: "Ayer",
    skinType: "Piel Grasa / Sensible",
    isVerified: true,
    likes: 84
  },
  {
    id: "rev-2",
    author: "Sebastián Castro",
    text: "Mi dermatóloga me recomendó niacinamida al 10% para las manchas oscuras que me dejó el acné. Probé otras marcas y esta es la única que no me irritó ni me dejó la cara pegajosa. El producto es de excelente procedencia, con calidad certificada y fecha de vencimiento muy lejana. Envío gratis a Medellín en 2 días.",
    rating: 5,
    date: "Hace 2 días",
    skinType: "Piel Mixta",
    isVerified: true,
    likes: 42
  },
  {
    id: "rev-3",
    author: "Camila Gómez",
    text: "Soy de piel grasa y muy sensible, y este sérum me cambió la cara. Se absorbe rapidísimo, no deja brillo y me ayudó muchísimo con las marcas rojas de los brotes. Pedí el combo de 2 unidades para no quedarme sin él. El pago contra entrega me dio mucha seguridad para comprar desde TikTok.",
    rating: 5,
    date: "Hace 4 días",
    skinType: "Piel Acnéica / Muy Sensible",
    isVerified: true,
    likes: 51
  },
  {
    id: "rev-4",
    author: "Dr. Mauricio Restrepo (Dermatólogo)",
    text: "Como especialista, recomiendo la niacinamida al 10% cuando busco unificar el tono, controlar la producción de sebo y atenuar manchas y marcas post-acné sin irritar la piel. Además refuerza la barrera cutánea, por lo que es una opción excelente incluso para pieles sensibles.",
    rating: 5,
    date: "Hace 1 semana",
    skinType: "Recomendación Médica",
    isVerified: true,
    likes: 119
  },
  {
    id: "rev-5",
    author: "Diana Patricia Ortiz",
    text: "Excelente atención y despacho súper rápido. Me llegó a Cali en menos de 48 horas. Lo uso por las noches y mi piel amanece muchísimo más pareja y luminosa. ¡Vale cada peso!",
    rating: 5,
    date: "Hace 1 semana",
    skinType: "Piel Mixta con tendencia a acné",
    isVerified: true,
    likes: 23
  }
];

export const GENERAL_FAQS: FAQItem[] = [
  {
    question: "¿Tienen envío gratis y pago contra entrega?",
    answer: "¡Sí! Ofrecemos envío gratis a nivel nacional en Colombia y pagas en efectivo en el momento en que se te entregue el producto en tu puerta. *Sujeto a cobertura de entrega nacional."
  },
  {
    question: "¿Cómo sé que el producto viene en buen estado?",
    answer: "Ofrecemos total respaldo y confianza. Todos nuestros productos se entregan en perfecto estado en sus empaques de fábrica, con códigos de barras verificables, asegurando fechas de vencimiento vigentes a largo plazo (2028+)."
  },
  {
    question: "¿Para qué tipo de piel está recomendado?",
    answer: "El Sérum Niacinamida Pura 10% está formulado para pieles mixtas, grasas, sensibles o con tendencia al acné. También es ideal para unificar el tono y atenuar manchas y marcas post-acné. No es comedogénico, así que no tapa los poros."
  },
  {
    question: "¿Cuánto demora en llegar mi pedido?",
    answer: "Los envíos tardan entre 1 y 2 días hábiles en ciudades principales (Bogotá, Medellín, Cali, Barranquilla) y de 3 a 5 días hábiles en el resto del país. El despacho se realiza en menos de 24 horas hábiles después de llenar el formulario."
  },
  {
    question: "¿Qué hace la Niacinamida al 10%?",
    answer: "La niacinamida (vitamina B3) al 10% es uno de los activos más estudiados en dermatología: ayuda a unificar el tono, difuminar manchas y marcas post-acné, minimizar la apariencia de los poros dilatados, controlar el brillo y reforzar la barrera natural de la piel."
  },
  {
    question: "¿Cómo se usa y con qué se puede combinar?",
    answer: "Aplica 3 o 4 gotas sobre el rostro limpio y seco, mañana y noche, antes de tu crema hidratante. Se puede combinar con protector solar, ácido hialurónico y otros tratamientos. Si es tu primera vez con niacinamida, empieza usándolo una vez al día. Textura ligera que se absorbe al instante y no deja residuo grasoso."
  }
];

export const PRODUCT_OFFERS: OrderOffer[] = [
  {
    id: "offer-1",
    name: "Sérum Niacinamida Pura 10% x1",
    subtitle: "Ideal para probarlo",
    price: 109900,
    isPopular: false,
    quantity: 1
  },
  {
    id: "offer-2",
    name: "Sérum Niacinamida Pura 10% x2 (Mejor Oferta)",
    subtitle: "¡Ahorras $59.900 (27% Descuento)!",
    price: 159900,
    savings: 59900,
    isPopular: true,
    quantity: 2,
  },
  {
    id: "offer-3",
    name: "Sérum Niacinamida Pura 10% x3",
    subtitle: "¡Ahorras $129.700 (39% Descuento)!",
    price: 200000,
    savings: 129700,
    isPopular: false,
    quantity: 3,
  }
];
