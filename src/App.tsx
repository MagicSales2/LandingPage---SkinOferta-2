/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  ShieldCheck,
  Star,
  CheckCircle2,
  Droplets,
  Sparkles,
  Sun,
  Shield,
  ChevronDown,
  Clock,
  ArrowRight,
  Package,
  X,
  MessageCircle,
  Award,
  Zap,
  CreditCard,
  AlertCircle,
  Bot,
  Send,
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN TÉCNICA E INTEGRACIONES
// ==========================================
export const CONFIG = {
  // -------------------------------------------------------------
  // WOMPI COLOMBIA (Bancolombia, PSE, Nequi, Tarjetas)
  // Reemplaza con tu llave pública de Wompi:
  // - Modo Pruebas: "pub_test_XXXXXXXXXXXX"
  // - Modo Producción: "pub_prod_XXXXXXXXXXXX"
  // -------------------------------------------------------------
  WOMPI_PUBLIC_KEY: 'pub_prod_TU_LLAVE_PUBLICA_WOMPI',

  // TRACKING & WEBHOOKS
  TIKTOK_PIXEL_ID: 'TU_TIKTOK_PIXEL_ID',
  SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',
  TELEGRAM_BOT_TOKEN: 'TU_BOT_TOKEN_TELEGRAM',
  TELEGRAM_CHAT_ID: 'TU_CHAT_ID',
  WHATSAPP_PHONE: '573000000000',

  PRICES: {
    offer1: {
      id: '1 UNIDAD',
      name: '1x Serum Pure Niacinamide 10 (Tratamiento Inicial 30ml)',
      regularPrice: 145000,
      price: 109900,
      qty: 1,
      savings: 35100,
      tag: 'Tratamiento 30 Días',
    },
    offer2: {
      id: '2 UNIDADES',
      name: '2x Serums Pure Niacinamide 10 (Dúo Rutina - Recomendado)',
      regularPrice: 240000,
      price: 159900,
      qty: 2,
      savings: 80100,
      tag: '⭐ MÁS VENDIDO',
    },
    offer3: {
      id: '3 UNIDADES',
      name: '3x Serums Pure Niacinamide 10 (Tratamiento Completo 90ml)',
      regularPrice: 320000,
      price: 200000,
      qty: 3,
      savings: 120000,
      tag: 'MÁXIMO AHORRO',
    },
  },
};

type OfferKey = 'offer1' | 'offer2' | 'offer3';
type PaymentMethod = 'cod' | 'wompi';

const DEPARTMENTS = [
  'Antioquia',
  'Bogotá D.C.',
  'Valle del Cauca',
  'Cundinamarca',
  'Santander',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Risaralda',
  'Tolima',
  'Meta',
  'Huila',
  'Nariño',
  'Córdoba',
  'Cesar',
  'Magdalena',
  'Norte de Santander',
  'Quindío',
  'Cauca',
  'Sucre',
  'Otro Departamento',
];

const SUGGESTED_QUESTIONS = [
  '🧴 Modo de uso (¿Cómo aplicar?)',
  '💰 Precios y promociones',
  '🚚 Pago Contraentrega en efectivo',
  '💳 Pagar online con Wompi (Nequi/PSE)',
  '⏱️ ¿Cuánto tarda en llegar el envío?',
  '✨ ¿Sirve para acné, grasa y manchas?',
  '🛡️ ¿El producto es 100% original sellado?',
  '📦 Quiero hacer mi pedido ya',
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  action?: {
    label: string;
    actionType: 'form' | 'offer1' | 'offer2' | 'offer3' | 'modo-uso';
  };
}

const getAutomatedProductAnswer = (
  query: string
): {
  text: string;
  action?: { label: string; actionType: 'form' | 'offer1' | 'offer2' | 'offer3' | 'modo-uso' };
} => {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. MODO DE USO / APLICACIÓN / RUTINA
  if (
    q.includes('modo') ||
    q.includes('uso') ||
    q.includes('usa') ||
    q.includes('usar') ||
    q.includes('aplica') ||
    q.includes('poner') ||
    q.includes('rutina') ||
    q.includes('gota') ||
    q.includes('paso') ||
    q.includes('noche') ||
    q.includes('manana') ||
    q.includes('dia') ||
    q.includes('enjuag') ||
    q.includes('lavar') ||
    q.includes('solar') ||
    q.includes('bloqueador') ||
    q.includes('orden') ||
    q.includes('instrucc') ||
    q.includes('empleo')
  ) {
    return {
      text: "🧴 **Modo de Uso Diario (Fácil en 3 Pasos):**\n\n1. **Limpieza:** Lava tu rostro con tu gel o limpiador habitual y seca suavemente a toques.\n2. **Aplicación:** Aplica **3 a 4 gotas** de Pure Niacinamide 10 con el gotero en frente, mejillas y cuello. Distribuye con suaves masajes circulares (se absorbe en 15 segundos sin sensación grasosa ni pegajosa).\n3. **Sellar y Proteger:** Aplica tu crema hidratante. En el día, sella siempre con tu protector solar para potenciar el efecto antimanchas.\n\n💡 **Frecuencia:** Apto para usar de **día y de noche**. No requiere enjuague.",
      action: { label: '🛍️ Pedir Mi Serum Ahora', actionType: 'form' },
    };
  }

  // 2. ENVÍOS Y TIEMPOS DE ENTREGA
  if (
    q.includes('tiempo') ||
    q.includes('demora') ||
    q.includes('tarda') ||
    q.includes('lleg') ||
    q.includes('despacho') ||
    q.includes('transportadora') ||
    q.includes('cuanto demora') ||
    q.includes('cuanto tarda') ||
    q.includes('bogota') ||
    q.includes('medellin') ||
    q.includes('cali') ||
    q.includes('barranquilla') ||
    q.includes('ciudad')
  ) {
    return {
      text: "📦 **Tiempos de Despacho y Entrega en Colombia:**\n\n• Despachamos en **24 a 48 horas hábiles** desde bodega nacional.\n• **Ciudades principales** (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Pereira, Manizales): Entrega en 24 a 48 horas.\n• **Resto del país / municipios:** 2 a 4 días hábiles.\n• ¡El envío es **TOTALMENTE GRATIS** a toda Colombia con transportadoras aliadas (Coordinadora, Servientrega, Envía)!",
      action: { label: '🚚 Pedir con Envío Gratis', actionType: 'form' },
    };
  }

  // 3. PRECIOS Y OFERTAS
  if (
    q.includes('precio') ||
    q.includes('vale') ||
    q.includes('cuesta') ||
    q.includes('costo') ||
    q.includes('promo') ||
    q.includes('oferta') ||
    q.includes('descuento') ||
    q.includes('combo') ||
    q.includes('cuanto') ||
    q.includes('valor')
  ) {
    return {
      text: "💰 **Precios y Ofertas Especiales para Colombia:**\n\n• **1 Unidad (30ml):** $109.900 COP *(Antes $145.000)*\n• **2 Unidades (Dúo Rutina - Más Vendido):** $159.900 COP *(Ahorras $80.100)*\n• **3 Unidades (Familiar 90ml):** $200.000 COP *(Ahorras $120.000)*\n\n🚚 **Todos los paquetes incluyen ENVÍO GRATIS a toda Colombia** y puedes pagar en efectivo al recibir (Contraentrega) o en línea con Wompi.",
      action: { label: '📦 Elegir Dúo Más Vendido ($159.900)', actionType: 'offer2' },
    };
  }

  // 4. CONTRAENTREGA
  if (
    q.includes('contraentrega') ||
    q.includes('efectivo') ||
    q.includes('recibir') ||
    q.includes('en casa') ||
    q.includes('repartidor') ||
    q.includes('mensajer') ||
    q.includes('pago en casa') ||
    q.includes('al recibir')
  ) {
    return {
      text: "🚚 **Pago Contraentrega (Pagas al Recibir):**\n\n¡Cero riesgo para ti! Completa el formulario de envío en esta página. Te despachamos por Coordinadora, Servientrega o Envía, y le pagas en **efectivo al repartidor** únicamente cuando tengas tu paquete sellado en la puerta de tu casa.",
      action: { label: '🚚 Ir a Pedir Contraentrega', actionType: 'form' },
    };
  }

  // 5. WOMPI
  if (
    q.includes('wompi') ||
    q.includes('nequi') ||
    q.includes('pse') ||
    q.includes('bancolombia') ||
    q.includes('tarjeta') ||
    q.includes('online') ||
    q.includes('en linea') ||
    q.includes('banco') ||
    q.includes('transferencia')
  ) {
    return {
      text: "💳 **Pago en Línea Seguro con Wompi:**\n\nSi deseas dejarlo pagado de inmediato, puedes seleccionar la opción de Wompi (Grupo Bancolombia) en el formulario:\n• Cuentas de Ahorros Bancolombia\n• Transferencias Nequi directas\n• PSE (todos los bancos colombianos)\n• Tarjetas de Crédito y Débito (Visa, Mastercard, Amex)\n\nTu transacción está 100% encriptada y protegida.",
      action: { label: '💳 Pagar Online con Wompi', actionType: 'form' },
    };
  }

  // 6. BENEFICIOS / ACNÉ / MANCHAS / TIPO DE PIEL
  if (
    q.includes('acne') ||
    q.includes('grasa') ||
    q.includes('grano') ||
    q.includes('barro') ||
    q.includes('poro') ||
    q.includes('brillo') ||
    q.includes('sebo') ||
    q.includes('marca') ||
    q.includes('mancha') ||
    q.includes('sol') ||
    q.includes('pano') ||
    q.includes('sensible') ||
    q.includes('comedogen') ||
    q.includes('rebot')
  ) {
    return {
      text: "✨ **Eficacia Antimanchas y Control de Sebo:**\n\n• **10% Niacinamida Pura:** Bloquea la transferencia de melanina, aclarando manchas oscuras de sol y marcas rebeldes de acné.\n• **Control de brillo:** Seborregula la zona T y reduce visiblemente el tamaño de los poros dilatados.\n• **Fórmula ligera:** No comedogénica (no tapa poros) y libre de sensación grasosa.\n• **Cero irritación:** No quema ni descama la piel, apto para el sol de Colombia sin efecto rebote.",
      action: { label: '✨ Eliminar Mis Manchas', actionType: 'form' },
    };
  }

  // 7. ORIGINALIDAD
  if (
    q.includes('original') ||
    q.includes('sellad') ||
    q.includes('garanti') ||
    q.includes('frasco') ||
    q.includes('ml') ||
    q.includes('tamano') ||
    q.includes('autentic')
  ) {
    return {
      text: "🛡️ **100% Original Sellado de Fábrica:**\n\nRecibes el producto oficial **Pure Niacinamide 10 (30ml)** con gotero dosificador estéril, caja sellada y número de lote verificado. Respaldado por Skin Ofertas.",
      action: { label: '🛡️ Ordenar Producto Sellado', actionType: 'form' },
    };
  }

  // 8. COMPRAR
  if (
    q.includes('comprar') ||
    q.includes('pedir') ||
    q.includes('orden') ||
    q.includes('hacer pedido') ||
    q.includes('quiero') ||
    q.includes('adquirir') ||
    q.includes('solicitar')
  ) {
    return {
      text: "🎉 ¡Genial! Solo debes completar el formulario de despacho abajo en la página. Te recomendamos la oferta de **2 Unidades (Dúo Rutina) por $159.900 COP**, ya que ahorras $80.100 y cubres el ciclo de renovación celular de 60 días.",
      action: { label: '📦 Ir al Formulario de Despacho', actionType: 'offer2' },
    };
  }

  // 9. SALUDOS
  if (
    q.includes('hola') ||
    q.includes('buenas') ||
    q.includes('buen dia') ||
    q.includes('buenos dias') ||
    q.includes('buenas tardes') ||
    q.includes('buenas noches') ||
    q.includes('hey') ||
    q.includes('saludos')
  ) {
    return {
      text: "¡Hola! 👋 Soy tu asesor inteligente para Skin Ofertas.\n\n¿En qué te puedo ayudar?",
      action: { label: '🧴 Ver Modo de Uso', actionType: 'modo-uso' },
    };
  }

  return {
    text: "🤖 Hola, soy el asesor virtual de **Skin Ofertas** para el serum **Pure Niacinamide 10**.\n\nPuedo responderte con exactitud sobre:\n• 🧴 **Modo de uso** y cómo aplicarlo día y noche\n• 💰 **Precios y ofertas** con Envío Gratis\n• 🚚 **Pago Contraentrega** (en efectivo al repartidor)\n• 💳 **Pago seguro con Wompi** (PSE/Nequi/Tarjetas)\n• ⏱️ **Tiempos de entrega** en Colombia\n• ✨ Beneficios para manchas y control de acné\n\nToca el botón para ver cómo aplicarlo o hazme tu pregunta.",
    action: { label: '🧴 Ver Modo de Uso', actionType: 'modo-uso' },
  };
};

export default function App() {
  const [selectedOffer, setSelectedOffer] = useState<OfferKey>('offer2');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Cronómetro de Cuenta Regresiva de Urgencia en Hero
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 14,
    seconds: 38,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 29, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formulario
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  // Modal de éxito
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wompiNotice, setWompiNotice] = useState<string | null>(null);
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    orderId: string;
    customerName: string;
    productName: string;
    total: number;
    city: string;
    department: string;
    paymentMethodName: string;
    whatsappUrl: string;
  } | null>(null);

  // Chat Inteligente Multi-turn Gemini
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! 👋 Soy tu asesor inteligente para Skin Ofertas.\n\n¿En qué te puedo ayudar?',
      time: 'Ahora',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(true);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      setHasUnreadChat(false);
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatOpen, chatMessages, isBotTyping]);

  const handleSendChatMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const userMsgId = `u-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    if (!textToSend) setChatInput('');
    setIsBotTyping(true);

    try {
      // Estructuramos el historial multi-turn para enviar a Gemini
      const messagesPayload = newHistory.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          // Detectar sugerencia contextual de acción interactiva
          let detectedAction: ChatMessage['action'] = undefined;
          const combined = (data.reply + ' ' + query).toLowerCase();
          if (combined.includes('modo de uso') || combined.includes('como usar') || combined.includes('aplicar')) {
            detectedAction = { label: '🧴 Ver Sección Modo de Uso', actionType: 'modo-uso' };
          } else if (
            combined.includes('pedir') ||
            combined.includes('comprar') ||
            combined.includes('ordenar') ||
            combined.includes('precio') ||
            combined.includes('promocion')
          ) {
            detectedAction = { label: '🛍️ Pedir con Envío Gratis', actionType: 'form' };
          }

          setChatMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: data.reply,
              action: detectedAction,
              time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setIsBotTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback local para garantizar disponibilidad:', err);
    }

    // Fallback inteligente para garantizar disponibilidad 100% continua
    const botAnswer = getAutomatedProductAnswer(query);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botAnswer.text,
        action: botAnswer.action,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsBotTyping(false);
  };

  const handleChatAction = (actionType: 'form' | 'offer1' | 'offer2' | 'offer3' | 'modo-uso') => {
    if (actionType === 'modo-uso') {
      const botAnswer = getAutomatedProductAnswer('modo de uso');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botAnswer.text,
          action: botAnswer.action,
          time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      const el = document.getElementById('modo-uso');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (actionType === 'offer1') {
      setSelectedOffer('offer1');
      setActiveGalleryIndex(0);
    } else if (actionType === 'offer2') {
      setSelectedOffer('offer2');
      setActiveGalleryIndex(3);
    } else if (actionType === 'offer3') {
      setSelectedOffer('offer3');
      setActiveGalleryIndex(0);
    }
    scrollToForm();
  };

  const renderFormattedChatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (!line) return <span key={idx} className="block h-1.5" />;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className={idx > 0 ? 'block mt-1' : 'block'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </span>
      );
    });
  };

  // Carga del Widget de Wompi
  useEffect(() => {
    if (!document.getElementById('wompi-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'wompi-checkout-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const formatCOP = (num: number) => {
    return '$' + num.toLocaleString('es-CO');
  };

  const currentOfferData = CONFIG.PRICES[selectedOffer];

  // Scroll suave al formulario de pedido
  const scrollToForm = () => {
    const el = document.getElementById('seccion-pedido');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manejador del envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);

    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `LRP-COL-${randomOrderNum}`;

    const paymentMethodName =
      paymentMethod === 'cod' ? 'Pago Contraentrega en Efectivo' : 'Pago Online Wompi (PSE/Nequi/Tarjetas)';

    const orderPayload = {
      orderId,
      date: new Date().toISOString(),
      product: currentOfferData.name,
      total: currentOfferData.price,
      customer: {
        name: fullName,
        phone: cleanPhone,
        idNumber,
        email: email || 'cliente@colombia.com',
        department,
        city,
        address,
        neighborhood,
      },
      paymentMethod: paymentMethodName,
      shipping: 'Gratis ($0 COP)',
    };

    // Disparo TikTok Pixel si existe
    if (typeof window !== 'undefined' && (window as any).ttq?.track) {
      (window as any).ttq.track('CompletePayment', {
        content_type: 'product',
        content_name: currentOfferData.name,
        quantity: currentOfferData.qty,
        value: currentOfferData.price,
        currency: 'COP',
      });
    }

    // Webhook en segundo plano si configurado
    if (CONFIG.SHEETS_WEBHOOK_URL && !CONFIG.SHEETS_WEBHOOK_URL.includes('TU_SCRIPT_ID')) {
      try {
        fetch(CONFIG.SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        }).catch(() => {});
      } catch (err) {}
    }

    // Link directo WhatsApp con mensaje estructurado
    const message = encodeURIComponent(
      `👋 ¡Hola! Acabo de registrar mi pedido en la tienda oficial.\n\n` +
      `📦 *Orden:* ${orderId}\n` +
      `🧴 *Producto:* ${currentOfferData.name}\n` +
      `💳 *Método de Pago:* ${paymentMethodName}\n` +
      `💰 *Total:* ${formatCOP(currentOfferData.price)} COP (Envío Gratis)\n\n` +
      `👤 *Cliente:* ${fullName}\n` +
      `📱 *Celular:* ${cleanPhone}\n` +
      `🆔 *Cédula:* ${idNumber}\n` +
      `📍 *Dirección:* ${address}, ${neighborhood}\n` +
      `🏙️ *Ciudad:* ${city}, ${department}\n\n` +
      `Quedo pendiente de la confirmación y guía de transporte. ¡Muchas gracias!`
    );

    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${message}`;

    setLastOrderDetails({
      orderId,
      customerName: fullName,
      productName: currentOfferData.name,
      total: currentOfferData.price,
      city,
      department,
      paymentMethodName,
      whatsappUrl,
    });

    // FLUJO WOMPI SI SELECCIONÓ PAGO EN LÍNEA
    if (paymentMethod === 'wompi') {
      const isPlaceholderKey =
        !CONFIG.WOMPI_PUBLIC_KEY || CONFIG.WOMPI_PUBLIC_KEY.includes('TU_LLAVE_PUBLICA_WOMPI');

      if (isPlaceholderKey) {
        setWompiNotice(
          '¡Integración de Wompi lista! Para procesar cobros en vivo, solo agrega tu llave pública (pub_prod_... o pub_test_...) en CONFIG.WOMPI_PUBLIC_KEY. Tu pedido ha sido guardado exitosamente.'
        );
        setIsModalOpen(true);
      } else {
        if (typeof (window as any).WidgetCheckout !== 'undefined') {
          try {
            const checkout = new (window as any).WidgetCheckout({
              currency: 'COP',
              amountInCents: currentOfferData.price * 100,
              reference: orderId,
              publicKey: CONFIG.WOMPI_PUBLIC_KEY,
              redirectUrl: window.location.href,
              customerData: {
                email: email || `${cleanPhone}@cliente.com`,
                fullName: fullName,
                phoneNumber: cleanPhone,
                phoneNumberPrefix: '+57',
                legalId: idNumber,
                legalIdType: 'CC',
              },
              shippingAddress: {
                addressLine1: `${address} - ${neighborhood}`,
                city: city,
                phoneNumber: cleanPhone,
                region: department,
                country: 'CO',
              },
            });

            checkout.open((result: any) => {
              const transaction = result?.transaction;
              console.log('Transacción Wompi:', transaction);
              setIsModalOpen(true);
            });
          } catch (err) {
            console.error('Error abriendo Wompi Checkout:', err);
            setIsModalOpen(true);
          }
        } else {
          setIsModalOpen(true);
        }
      }
    } else {
      setWompiNotice(null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased">
      {/* 1. BARRA SUPERIOR FIJA DE URGENCIA */}
      <aside className="sticky top-0 z-50 bg-[#0A1D37] text-white py-2 px-3 border-b border-slate-700/60 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold">
          <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
          <span className="truncate">
            🚚 <strong className="text-emerald-300 font-bold">PAGO CONTRAENTREGA</strong> + ENVÍO GRATIS A TODA COLOMBIA{' '}
            <span className="hidden sm:inline">| 📦 DESPACHO EN 24-48 HORAS</span>
          </span>
        </div>
      </aside>

      {/* 2. CABECERA & TRUST BADGE */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col cursor-pointer"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0A1D37] uppercase leading-none">
              Skin Ofertas
            </span>
            <span className="text-[10px] tracking-wider text-[#0284C7] font-semibold uppercase mt-0.5">
              Dermocosmética Colombia
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a
              href="#beneficios"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#0A1D37] transition-colors cursor-pointer"
            >
              Beneficios
            </a>
            <a
              href="#modo-uso"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('modo-uso')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#0A1D37] transition-colors cursor-pointer"
            >
              Modo de Uso
            </a>
            <a
              href="#testimonios"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#0A1D37] transition-colors cursor-pointer"
            >
              Opiniones Reales
            </a>
            <a
              href="#preguntas"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('preguntas')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#0A1D37] transition-colors cursor-pointer"
            >
              Preguntas
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
              <span>100% Original Sellado</span>
            </div>
            <button
              onClick={scrollToForm}
              className="px-4 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Pedir Ahora
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (CON LA FOTO REAL DEL PRODUCTO SUBIDA) */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-white pt-6 pb-12 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-[#0284C7] text-xs font-bold tracking-tight">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>#1 Marca Más Recomendada por Dermatólogos</span>
            </div>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-xs text-slate-600 font-medium">Tratamiento Antimanchas 10% Niacinamida Pura</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Visual Gallery + EL BLOQUE DE LA FOTO DE REFERENCIA */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xl relative">
                <div className="absolute top-4 left-4 z-10 bg-[#E11D48] text-white text-[10px] font-extrabold px-2.5 py-1 rounded shadow-sm uppercase tracking-wide">
                  10% Niacinamida Pura
                </div>

                <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur border border-slate-200 text-[#0A1D37] text-xs font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <span>4.9 / 5.0</span>
                </div>

                {/* Display Visual Interactivo (FOTO REAL SUBIDA POR EL USUARIO) */}
                <div className="aspect-square w-full flex items-center justify-center relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-indigo-50/20 p-3">
                  {activeGalleryIndex === 0 && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative group">
                      <img
                        src="/product-niacinamide.jpg"
                        alt="Serum Skin Ofertas Pure Niacinamide 10 Original"
                        className="w-full h-full max-h-80 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-1 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Foto Real del Producto Sellado</span>
                      </div>
                    </div>
                  )}

                  {activeGalleryIndex === 1 && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-100/80 flex items-center justify-center text-[#0284C7] mb-3 shadow-inner">
                        <Droplets className="w-10 h-10 text-[#0284C7]" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#0A1D37] mb-1">Textura Ligera de Niacinamida</h4>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Fórmula sedosa y purificante. Se absorbe en menos de 15 segundos sin tapar los poros.
                      </p>
                      <span className="mt-3 px-3 py-1 rounded-full bg-emerald-100 text-[#059669] text-xs font-bold">
                        Cero Sensación Grasosa · 100% Fluida
                      </span>
                    </div>
                  )}

                  {activeGalleryIndex === 2 && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-20 h-20 rounded-full bg-purple-100/80 flex items-center justify-center text-purple-700 mb-3 shadow-inner">
                        <Sparkles className="w-10 h-10 text-purple-600" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#0A1D37] mb-1">Aplicación en Rostro y Cuello</h4>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Aplica 3 a 4 gotas directamente. Apto para piel con brotes, manchas de sol o textura irregular.
                      </p>
                      <span className="mt-3 px-3 py-1 rounded-full bg-blue-100 text-[#0284C7] text-xs font-bold">
                        Alta Tolerancia · Día y Noche
                      </span>
                    </div>
                  )}

                  {activeGalleryIndex === 3 && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-20 h-20 rounded-full bg-emerald-100/80 flex items-center justify-center text-[#059669] mb-3 shadow-inner">
                        <Package className="w-10 h-10 text-[#059669]" />
                      </div>
                      <h4 className="text-base font-extrabold text-[#0A1D37] mb-1">Dúo Rutina Completa (60ml)</h4>
                      <p className="text-xs text-slate-600 max-w-xs">
                        2 frascos sellados de Pure Niacinamide 10. Garantiza los 60 a 90 días para renovación celular.
                      </p>
                      <span className="mt-3 px-3 py-1 rounded-full bg-[#059669] text-white text-xs font-extrabold shadow-sm">
                        Ahorras $80.100 COP + Envío Gratis
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs font-semibold text-slate-500 mt-3">
                  {activeGalleryIndex === 0 && 'Frasco Original 30ml con Gotero Dosificador'}
                  {activeGalleryIndex === 1 && 'Textura fluida en gotas sin sensación pegajosa'}
                  {activeGalleryIndex === 2 && 'Fórmula de alta tolerancia en piel colombiana'}
                  {activeGalleryIndex === 3 && 'Dúo Rutina: Tratamiento completo recomendado'}
                </p>
              </div>

              {/* Selector de Miniaturas */}
              <div className="grid grid-cols-4 gap-2.5 mt-3 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setActiveGalleryIndex(0)}
                  className={`p-1.5 rounded-xl text-center transition-all border cursor-pointer flex flex-col items-center justify-center ${
                    activeGalleryIndex === 0
                      ? 'border-[#0284C7] bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img src="/product-niacinamide.jpg" alt="Miniatura real" className="w-6 h-6 object-contain mb-0.5" />
                  <span className="text-[10px] font-bold text-[#0A1D37] block">Foto Real</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGalleryIndex(1)}
                  className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${
                    activeGalleryIndex === 1
                      ? 'border-[#0284C7] bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#0A1D37] block">Gotas</span>
                  <span className="text-[9px] text-slate-500">Textura</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGalleryIndex(2)}
                  className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${
                    activeGalleryIndex === 2
                      ? 'border-[#0284C7] bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#0A1D37] block">Rostro</span>
                  <span className="text-[9px] text-slate-500">Aplicación</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGalleryIndex(3)}
                  className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${
                    activeGalleryIndex === 3
                      ? 'border-[#0284C7] bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#0A1D37] block">Dúo Pack</span>
                  <span className="text-[9px] text-[#059669] font-bold">Ahorro</span>
                </button>
              </div>

              {/* BLOQUE DE LA FOTO DE REFERENCIA ENVIADA POR EL USUARIO */}
              <div className="w-full max-w-md mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-3 flex items-center gap-2 shadow-sm hover:border-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800 leading-snug">Cero sensación grasosa</span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-3 flex items-center gap-2 shadow-sm hover:border-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800 leading-snug">Apto piel sensible o con acné</span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-3 flex items-center gap-2 shadow-sm hover:border-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800 leading-snug">Reduce poros dilatados</span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-3 flex items-center gap-2 shadow-sm hover:border-slate-300 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800 leading-snug">No descama ni arde la piel</span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="w-full py-4 px-5 bg-[#059669] hover:bg-[#047857] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer animate-cta-glow"
                  >
                    <span className="text-lg">📦</span>
                    <span className="tracking-wide">PEDIR CONTRAENTREGA (PAGAS AL RECIBIR)</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-2.5 text-xs text-slate-600 font-medium">
                    <span>🚚 Envío Gratis a Colombia</span>
                    <span className="text-slate-400">·</span>
                    <span>🔒 Cero Riesgo: Pagas en Casa</span>
                  </div>
                </div>

                <div className="bg-[#0A1D37] text-white rounded-2xl p-5 shadow-xl border border-slate-700/60">
                  <h3 className="text-center text-sm sm:text-base font-extrabold tracking-tight mb-3.5 text-white">
                    Resultados Clínicos Comprobados
                  </h3>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-[#122847] border border-blue-400/15 rounded-xl p-3 text-center flex flex-col justify-center">
                      <span className="text-2xl sm:text-3xl font-black text-[#38BDF8] tabular-nums block">
                        84%
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-200 font-medium leading-tight mt-1">
                        Menos manchas en 2 semanas
                      </span>
                    </div>

                    <div className="bg-[#122847] border border-blue-400/15 rounded-xl p-3 text-center flex flex-col justify-center">
                      <span className="text-2xl sm:text-3xl font-black text-[#38BDF8] tabular-nums block">
                        92%
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-200 font-medium leading-tight mt-1">
                        Piel uniforme y sin brillo graso
                      </span>
                    </div>

                    <div className="bg-[#122847] border border-blue-400/15 rounded-xl p-3 text-center flex flex-col justify-center">
                      <span className="text-2xl sm:text-3xl font-black text-[#38BDF8] tabular-nums block">
                        0%
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-200 font-medium leading-tight mt-1">
                        Efecto rebote o irritación
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Copy Principal, Beneficios y Selección de Oferta */}
            <div className="lg:col-span-6 flex flex-col pt-2 lg:pt-0">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">4.9 / 5.0</span>
                <span className="text-xs text-slate-500">· (+2.400 compradoras verificadas en Colombia)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A1D37] leading-tight tracking-tight mb-3">
                Elimina manchas oscuras y marcas rebeldes de acné{' '}
                <span className="text-[#0284C7]">sin quemar ni irritar tu piel</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                Fórmula dermocosmética concentrada con <strong>10% Niacinamida Pura</strong> y agua termal calmante.
                Bloquea la hiperpigmentación desde el origen, reduce poros dilatados y empareja el tono de la piel
                con resultados visibles desde la 2da semana.
              </p>

              <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Poder seborregulador:</strong> Controla el brillo en la zona T y previene la obstrucción de poros.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Cero efecto rebote:</strong> Desvanece manchas de sol y marcas de brotes pasados sin descamar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Opciones de Pago Flexibles:</strong> Paga en efectivo al recibir (Contraentrega) o en línea con Wompi (Bancolombia, Nequi, PSE, Tarjetas).
                  </span>
                </div>
              </div>

              {/* Banner de Oferta Rápida Hero con Cronómetro de Urgencia */}
              <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-indigo-50/60 rounded-2xl p-4 sm:p-5 border border-blue-200/90 mb-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-blue-200/70">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#0284C7] tracking-wider block">
                      {currentOfferData.tag} · PRECIO ESPECIAL HOY
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm text-slate-400 line-through tabular-nums">
                        {formatCOP(currentOfferData.regularPrice)}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-[#0A1D37] tabular-nums">
                        {formatCOP(currentOfferData.price)}{' '}
                        <span className="text-xs sm:text-sm font-bold text-slate-500">COP</span>
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#059669] text-white text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-tight shadow-xs flex items-center gap-1">
                    <span>Ahorras {formatCOP(currentOfferData.savings)}</span>
                  </span>
                </div>

                {/* Cronómetro de Cuenta Regresiva Estilizado */}
                <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-700 tracking-tight">
                      <Clock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>La oferta finaliza pronto</span>
                    </div>
                  </div>

                  {/* Cajas de dígitos del cronómetro con micro-etiquetas */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <div className="flex flex-col items-center">
                      <div className="bg-[#0A1D37] text-white font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center border border-slate-700/60">
                        {String(countdown.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Horas</span>
                    </div>
                    <span className="text-slate-600 font-black text-sm -mt-3.5">:</span>

                    <div className="flex flex-col items-center">
                      <div className="bg-[#0A1D37] text-white font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center border border-slate-700/60">
                        {String(countdown.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Min</span>
                    </div>
                    <span className="text-slate-600 font-black text-sm -mt-3.5">:</span>

                    <div className="flex flex-col items-center">
                      <div className="bg-[#E11D48] text-white font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg shadow-xs min-w-[34px] text-center border border-rose-500/80 animate-pulse">
                        {String(countdown.seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[8px] font-bold text-rose-600 uppercase mt-0.5">Seg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selector Rápido de Ofertas en Hero */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-extrabold uppercase text-[#0A1D37] tracking-wide block">
                  Elige tu paquete y completa tus datos abajo:
                </span>

                <div
                  onClick={() => {
                    setSelectedOffer('offer2');
                    setActiveGalleryIndex(3);
                  }}
                  className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedOffer === 'offer2'
                      ? 'border-[#0284C7] bg-blue-50/60 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="heroOffer"
                      checked={selectedOffer === 'offer2'}
                      onChange={() => setSelectedOffer('offer2')}
                      className="w-4 h-4 text-[#0284C7]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#0A1D37]">2 Unidades (Dúo Rutina)</span>
                        <span className="bg-[#0284C7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MÁS VENDIDO</span>
                      </div>
                      <span className="text-[11px] text-slate-500">60ml · Tratamiento clínico continuo</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#0A1D37] tabular-nums block">$159.900</span>
                    <span className="text-[10px] text-[#059669] font-bold">Envío Gratis</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setSelectedOffer('offer1');
                    setActiveGalleryIndex(0);
                  }}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedOffer === 'offer1'
                      ? 'border-[#0284C7] bg-blue-50/60 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="heroOffer"
                      checked={selectedOffer === 'offer1'}
                      onChange={() => setSelectedOffer('offer1')}
                      className="w-4 h-4 text-[#0284C7]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#0A1D37]">1 Unidad (Tratamiento Inicial 30ml)</span>
                      <span className="text-[11px] text-slate-500 block">30 días de uso</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#0A1D37] tabular-nums block">$109.900</span>
                    <span className="text-[10px] text-[#059669] font-bold">Envío Gratis</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setSelectedOffer('offer3');
                    setActiveGalleryIndex(0);
                  }}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedOffer === 'offer3'
                      ? 'border-[#0284C7] bg-blue-50/60 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="heroOffer"
                      checked={selectedOffer === 'offer3'}
                      onChange={() => setSelectedOffer('offer3')}
                      className="w-4 h-4 text-[#0284C7]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#0A1D37]">3 Unidades (Tratamiento Familiar 90ml)</span>
                      <span className="text-[11px] text-amber-600 font-semibold block">Ahorras $120.000 COP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#0A1D37] tabular-nums block">$200.000</span>
                    <span className="text-[10px] text-[#059669] font-bold">Envío Gratis</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="w-full py-4 px-6 bg-[#059669] hover:bg-[#047857] text-white font-black text-base rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>IR AL FORMULARIO DE DESPACHO</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFICIOS CLÍNICOS CLAVE */}
      <section id="beneficios" className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] block mb-1">
              EFICACIA DERMATOLÓGICA PROBADA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1D37] tracking-tight">
              ¿Por qué la Niacinamida al 10% es el{' '}
              <span className="text-[#0284C7] underline decoration-sky-300 decoration-2 underline-offset-4">
                mejor antimanchas
              </span>
              ?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Trata la pigmentación profunda y mejora la textura cutánea sin dañar la barrera protectora de la piel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0284C7] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 flex-shrink-0" />
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">10% Niacinamida Pura</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bloquea la transferencia de melanina desde la célula hacia la superficie, aclarando manchas oscuras y marcas rebeldes.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center mb-4">
                <Droplets className="w-5 h-5 flex-shrink-0" />
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">Control de Sebo y Poros</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Regula la producción de grasa facial y reduce visiblemente el diámetro de los poros dilatados sin provocar resequedad.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 flex-shrink-0" />
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">No Comedogénico</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Textura ultraligera acuosa que respeta los folículos. Diseñado para piel grasa, mixta o propensa a imperfecciones y puntos negros.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Sun className="w-5 h-5 flex-shrink-0" />
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">Cero Efecto Rebote</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apto para el clima de Colombia. No descama ni quema la piel bajo el sol como los ácidos exfoliantes agresivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODO DE USO EN 3 PASOS */}
      <section id="modo-uso" className="py-14 bg-[#F8FAFC] border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] block mb-1">
              RUTINA SIMPLE DE 60 SEGUNDOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1D37]">
              Cómo aplicarlo para resultados acelerados
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Integración fácil en tu rutina de día y noche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="w-8 h-8 rounded-full bg-[#0A1D37] text-white text-xs font-bold flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">Limpieza Suave</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Lava tu rostro con agua templada y tu gel limpiador favorito para retirar exceso de sebo y suciedad.
              </p>
              <div className="mt-auto text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
                💡 <em>Seca suavemente a toques dejando la piel ligeramente fresca.</em>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-[#0284C7] shadow-sm flex flex-col">
              <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white text-xs font-bold flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">3 a 4 Gotas de Serum</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Aplica con el gotero en frente, mejillas y cuello. Distribuye con suaves masajes circulares.
              </p>
              <div className="mt-auto text-[11px] text-[#0284C7] bg-blue-50 p-2.5 rounded border border-blue-100 font-medium">
                ⏱️ <em>Absorción inmediata en 15 segundos con cero sensación pegajosa.</em>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="w-8 h-8 rounded-full bg-[#059669] text-white text-xs font-bold flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-[#0A1D37] mb-2">Sellar & Proteger</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Aplica tu hidratante de preferencia. En el día, sella siempre con tu protector solar para potenciar el efecto antimanchas.
              </p>
              <div className="mt-auto text-[11px] text-[#059669] bg-emerald-50 p-2.5 rounded border border-emerald-100 font-medium">
                ☀️ <em>El bloqueador solar previene que la radiación reactive los melanocitos.</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SELECTOR DE OFERTAS & FORMULARIO DE CHECKOUT */}
      <section id="seccion-pedido" className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#059669] text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              DESPACHO INMEDIATO A TODA COLOMBIA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1D37]">
              Selecciona tu Oferta y Método de Pago
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Paga en efectivo al recibir en casa o paga en línea de forma segura con Wompi (Bancolombia, Nequi, PSE, Tarjetas).
            </p>
          </div>

          {/* SELECTOR DE OFERTAS: 3 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Oferta 1 */}
            <div
              onClick={() => {
                setSelectedOffer('offer1');
                setActiveGalleryIndex(0);
              }}
              className={`cursor-pointer border-2 rounded-2xl p-5 bg-white transition-all relative flex flex-col justify-between ${
                selectedOffer === 'offer1'
                  ? 'border-[#0284C7] bg-blue-50/40 shadow-md ring-2 ring-[#0284C7]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tratamiento Inicial</span>
                  <input
                    type="radio"
                    name="mainOffer"
                    checked={selectedOffer === 'offer1'}
                    onChange={() => setSelectedOffer('offer1')}
                    className="w-4 h-4 text-[#0284C7]"
                  />
                </div>
                <h4 className="text-base font-extrabold text-[#0A1D37]">1 Unidad (30ml)</h4>
                <p className="text-xs text-slate-500 mb-4">Tratamiento para 1 mes de uso continuo.</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer1.regularPrice)}
                  </span>
                  <span className="text-2xl font-black text-[#0A1D37] tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer1.price)}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#059669] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Envío Gratis Incluido</span>
                </div>
              </div>
            </div>

            {/* Oferta 2: Más Vendido */}
            <div
              onClick={() => {
                setSelectedOffer('offer2');
                setActiveGalleryIndex(3);
              }}
              className={`cursor-pointer border-2 rounded-2xl p-5 transition-all relative flex flex-col justify-between ${
                selectedOffer === 'offer2'
                  ? 'border-[#0284C7] bg-blue-50/50 shadow-lg ring-2 ring-[#0284C7]/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0284C7] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-tight shadow-sm whitespace-nowrap">
                ⭐ RECOMENDADO - MÁS VENDIDO
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wide">Dúo Rutina Completa</span>
                  <input
                    type="radio"
                    name="mainOffer"
                    checked={selectedOffer === 'offer2'}
                    onChange={() => setSelectedOffer('offer2')}
                    className="w-4 h-4 text-[#0284C7]"
                  />
                </div>
                <h4 className="text-base font-extrabold text-[#0A1D37]">2 Unidades (60ml)</h4>
                <p className="text-xs text-slate-600 mb-4">Garantiza los 60 a 90 días para renovación celular completa.</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer2.regularPrice)}
                  </span>
                  <span className="text-2xl font-black text-[#0A1D37] tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer2.price)}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-[#059669] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                    Envío Gratis
                  </span>
                  <span className="bg-emerald-100 text-[#059669] px-2 py-0.5 rounded text-[11px]">
                    Ahorras $80.100
                  </span>
                </div>
              </div>
            </div>

            {/* Oferta 3 */}
            <div
              onClick={() => {
                setSelectedOffer('offer3');
                setActiveGalleryIndex(0);
              }}
              className={`cursor-pointer border-2 rounded-2xl p-5 bg-white transition-all relative flex flex-col justify-between ${
                selectedOffer === 'offer3'
                  ? 'border-[#0284C7] bg-blue-50/40 shadow-md ring-2 ring-[#0284C7]/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-tight shadow-sm">
                MÁXIMO AHORRO
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tratamiento Familiar</span>
                  <input
                    type="radio"
                    name="mainOffer"
                    checked={selectedOffer === 'offer3'}
                    onChange={() => setSelectedOffer('offer3')}
                    className="w-4 h-4 text-[#0284C7]"
                  />
                </div>
                <h4 className="text-base font-extrabold text-[#0A1D37]">3 Unidades (90ml)</h4>
                <p className="text-xs text-slate-500 mb-4">Para compartir o prevención anual prolongada.</p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer3.regularPrice)}
                  </span>
                  <span className="text-2xl font-black text-[#0A1D37] tabular-nums">
                    {formatCOP(CONFIG.PRICES.offer3.price)}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-[#059669] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                    Envío Gratis
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[11px]">
                    Ahorras $120.000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE DESPACHO & PAGO */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-lg font-extrabold text-[#0A1D37]">
                  Datos para la Guía y Entrega
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-9">
                Tu paquete viajará asegurado con guía activa vía Coordinadora, Servientrega o Envía.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nombre y Apellidos completos <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Camila Morales Restrepo"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Número de Celular / WhatsApp <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setPhone(val);
                      if (val.length === 10) setPhoneError(false);
                    }}
                    placeholder="Ej. 3124567890 (10 dígitos)"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                  {phoneError && (
                    <span className="text-[11px] text-[#E11D48] mt-1 block font-medium">
                      Ingresa los 10 dígitos de tu número de celular en Colombia.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cédula de Ciudadanía (C.C.) <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Requerido por la transportadora y pasarela"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo Electrónico <span className={paymentMethod === 'wompi' ? 'text-[#E11D48]' : 'text-slate-400 font-normal'}>
                      {paymentMethod === 'wompi' ? '*' : '(Opcional)'}
                    </span>
                  </label>
                  <input
                    type="email"
                    required={paymentMethod === 'wompi'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={paymentMethod === 'wompi' ? 'Para comprobante de Wompi' : 'Para recibir tu guía de rastreo'}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Departamento <span className="text-[#E11D48]">*</span>
                  </label>
                  <select
                    required
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (e.target.value === 'Bogotá D.C.' && !city) {
                        setCity('Bogotá D.C.');
                      }
                    }}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  >
                    <option value="">Selecciona tu departamento...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ciudad o Municipio <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Medellín, Cali, Barranquilla, Envigado..."
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Dirección exacta de entrega <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Carrera, Transversal # y Número"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Barrio, Apto, Torre o Indicaciones <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ej. Apto 402, Barrio Laureles, Dejar en portería"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                  />
                </div>
              </div>

              {/* SELECTOR DE MÉTODO DE PAGO */}
              <div className="pt-2">
                <label className="block text-xs font-extrabold text-[#0A1D37] uppercase tracking-wide mb-2.5">
                  Selecciona cómo deseas pagar: <span className="text-[#E11D48]">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-[#059669] bg-emerald-50/50 shadow-md ring-2 ring-[#059669]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 text-[#059669] focus:ring-[#059669]"
                        />
                        <span className="text-xs font-extrabold text-[#0A1D37]">
                          💵 Pago Contraentrega
                        </span>
                      </div>
                      <span className="bg-[#059669] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight">
                        MÁS ELEGIDO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug pl-6">
                      Pagas en <strong>efectivo al recibir</strong> tu paquete sellado en la puerta de tu casa. Cero riesgo.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('wompi')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                      paymentMethod === 'wompi'
                        ? 'border-[#0284C7] bg-blue-50/50 shadow-md ring-2 ring-[#0284C7]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'wompi'}
                          onChange={() => setPaymentMethod('wompi')}
                          className="w-4 h-4 text-[#0284C7]"
                        />
                        <span className="text-xs font-extrabold text-[#0A1D37]">
                          💳 Pagar Online con Wompi
                        </span>
                      </div>
                      <span className="bg-[#0284C7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
                        PASARELA SEGURA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug pl-6">
                      Bancolombia, Nequi, PSE y Tarjetas de Crédito / Débito con respaldo 100% bancario.
                    </p>
                  </div>
                </div>
              </div>

              {/* RESUMEN DEL PEDIDO */}
              <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-extrabold uppercase text-[#0A1D37] block mb-3">
                  Resumen de tu Pedido:
                </span>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">{currentOfferData.name}</span>
                  <span className="font-bold text-[#0A1D37] tabular-nums">
                    {formatCOP(currentOfferData.price)} COP
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Envío prioritario nacional</span>
                  <span className="font-bold text-[#059669]">GRATIS ($0 COP)</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Forma de pago seleccionada</span>
                  <span className="font-bold text-slate-800">
                    {paymentMethod === 'cod' ? 'Efectivo contraentrega al mensajero' : 'Pago en línea Wompi (PSE/Nequi/Tarjetas)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base pt-3 font-black text-[#0A1D37]">
                  <span>Total a pagar:</span>
                  <span className="text-xl sm:text-2xl text-[#059669] tabular-nums">
                    {formatCOP(currentOfferData.price)} COP
                  </span>
                </div>
              </div>

              {/* Botón Dinámico de Confirmación */}
              <div className="pt-2">
                {paymentMethod === 'cod' ? (
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-base sm:text-lg font-black tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Package className="w-6 h-6 flex-shrink-0" />
                    <span>CONFIRMAR PEDIDO CONTRAENTREGA 🚚</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-base sm:text-lg font-black tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <CreditCard className="w-6 h-6 flex-shrink-0" />
                    <span>PAGAR CON WOMPI ({formatCOP(currentOfferData.price)}) 💳</span>
                  </button>
                )}

                <p className="text-center text-[11px] text-slate-500 mt-2.5">
                  🔒 Despachamos hoy mismo desde bodega nacional. Transacciones 100% protegidas.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 8. PRUEBA SOCIAL / RESEÑAS REALES */}
      <section id="testimonios" className="py-14 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] block mb-1">
              CLIENTAS REALES EN COLOMBIA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1D37]">
              Resultados comprobados en nuestro país
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Opiniones verificadas de clientas en Colombia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Compra Verificada
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  "Tenía marcas marrones en los pómulos de un brote de acné severo. En 3 semanas de uso diario se me
                  aclararon un 80%. Llegó por Coordinadora a Medellín en solo 2 días y pagué al muchacho en efectivo."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#0A1D37] font-bold text-xs flex items-center justify-center">
                  VR
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0A1D37] block">Valentina Ramírez</span>
                  <span className="text-[10px] text-slate-500">Medellín, Antioquia (Recibió en 2 días)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Compra Verificada
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  "Mi piel es reactiva y casi todo me genera ardor o rojez. Este serum es súper noble, la Niacinamida Pura al 10%
                  me mantiene la piel calmada, con textura lisa y sin rojeces todo el día. Pagué online con Wompi por Nequi y fue rapidísimo."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0284C7] font-bold text-xs flex items-center justify-center">
                  CS
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0A1D37] block">Carolina Suárez</span>
                  <span className="text-[10px] text-slate-500">Bogotá D.C. (Recibió al día siguiente)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Compra Verificada
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  "Vivo en Cali y con el calor me daba miedo usar ácidos que me mancharan más. La Niacinamida al 10% no
                  mancha con el sol, me controló los brillos en la frente y las marcas del sol desaparecieron."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] font-bold text-xs flex items-center justify-center">
                  DM
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0A1D37] block">Daniela Mendoza</span>
                  <span className="text-[10px] text-slate-500">Cali, Valle del Cauca (Recibió en 3 días)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PREGUNTAS FRECUENTES (FAQ) */}
      <section id="preguntas" className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] block mb-1">
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1D37]">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Todo lo que necesitas saber antes de recibir tu pedido en casa.
            </p>
          </div>

          <div className="space-y-3">
            <details className="group bg-[#F8FAFC] rounded-xl border border-slate-200 p-4 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#0A1D37]">
                <span>¿Cuáles son los métodos de pago disponibles?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                Ofrecemos dos modalidades: <strong>1) Pago Contraentrega en Efectivo</strong>, donde le pagas al mensajero de Coordinadora o Servientrega cuando recibas el producto en tu puerta. <strong>2) Pago Online con Wompi</strong> (Bancolombia, Nequi, PSE, Tarjeta de Crédito o Débito) para quienes prefieren dejar su orden liquidada en línea de inmediato.
              </div>
            </details>

            <details className="group bg-[#F8FAFC] rounded-xl border border-slate-200 p-4 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#0A1D37]">
                <span>¿El producto es 100% original y viene sellado?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                Totalmente original. Cada frasco viene en su empaque oficial con precinto termo-sellado, código de barras, lote de fabricación legible y fecha de vencimiento vigente (mínimo 2 años de vida útil). Cumple con los más altos estándares dermocosméticos.
              </div>
            </details>

            <details className="group bg-[#F8FAFC] rounded-xl border border-slate-200 p-4 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#0A1D37]">
                <span>¿En cuántos días llega a mi ciudad o municipio?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                Los despachos salen en 24 a 48 horas hábiles. En ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga) tarda de 1 a 2 días hábiles. En municipios intermedios suele tardar de 2 a 4 días hábiles. Te enviamos la guía a tu WhatsApp para seguimiento continuo.
              </div>
            </details>

            <details className="group bg-[#F8FAFC] rounded-xl border border-slate-200 p-4 transition-all">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#0A1D37]">
                <span>¿Sirve para piel grasa, con acné o piel muy sensible?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                Sí, es precisamente su formulación estrella. A diferencia de despigmentantes agresivos que pelan o manchan con el sol, la Niacinamida Pura al 10% calma la irritación, regula el exceso de sebo, disminuye poros y reduce la rojez sin tapar poros.
              </div>
            </details>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#0A1D37] transition-colors underline cursor-pointer"
            >
              <span>Ir arriba al selector de ofertas y pedir ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#0A1D37] text-white py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-xs">
            <div>
              <span className="text-base font-extrabold uppercase tracking-tight block text-white mb-1">
                Skin Ofertas
              </span>
              <span className="text-[10px] text-[#0284C7] font-semibold tracking-wider block mb-3">
                DERMOCOSMÉTICA & SKINCARE COLOMBIA
              </span>
              <p className="text-slate-400 leading-relaxed">
                Tienda multimarca autorizada en Colombia. Distribuimos productos 100% originales con respaldo dermatológico mundial para el
                cuidado de la piel.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                Garantías y Medios de Pago
              </span>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Pago contraentrega en efectivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Pagos online seguros vía Wompi Bancolombia</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Envío Gratis a nivel nacional (Coordinadora / Servientrega)</span>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                Atención al Cliente
              </span>
              <p className="text-slate-400 leading-relaxed mb-2">
                Horario de despachos: Lunes a Sábado 8:00 AM - 6:00 PM.
              </p>
              <div className="text-[11px] text-slate-500">
                Bogotá D.C., Colombia · Cobertura a todos los departamentos del país.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>© 2026 Skin Ofertas - Pure Niacinamide 10 Colombia. Todos los derechos reservados.</div>
            <div className="flex items-center gap-4">
              <span>Términos de Compra</span>
              <span>·</span>
              <span>Política de Privacidad</span>
              <span>·</span>
              <span>Garantía de Satisfacción</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 11. BARRA FLOTANTE FIJA INFERIOR (MÓVIL) */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl md:hidden">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#0284C7] uppercase leading-tight truncate">
              {currentOfferData.id} - {currentOfferData.tag}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#0A1D37] tabular-nums">
                {formatCOP(currentOfferData.price)}
              </span>
              <span className="text-[9px] text-[#059669] font-bold">ENVÍO GRATIS</span>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="flex-1 py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-xs font-black rounded-lg text-center shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>PEDIR AHORA</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* 12. CHAT AUTOMATIZADO DE PREGUNTAS DEL PRODUCTO */}
      {/* Botón Flotante del Chat */}
      {!isChatOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2">
          {hasUnreadChat && (
            <div
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white text-[#0A1D37] text-xs font-bold py-2 px-3.5 rounded-full shadow-xl border border-slate-200 cursor-pointer animate-bounce"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>¿Dudas del serum? Chatea con tu asesor</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label="Abrir chat asesor Skin Ofertas"
            className="relative flex items-center gap-2.5 bg-[#0A1D37] hover:bg-[#122B4F] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border-2 border-white/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A1D37]"></span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-none">Asesor Inteligente</span>
              <span className="text-[10px] text-emerald-300 font-semibold leading-tight mt-0.5">Skin Ofertas · En línea</span>
            </div>
          </button>
        </div>
      )}

      {/* Ventana Desplegable del Chat */}
      {isChatOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 w-[92vw] sm:w-[390px] h-[540px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header del Chat */}
          <div className="bg-[#0A1D37] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A1D37]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    Asesor Inteligente · Skin Ofertas
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                    <span>En línea</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">
                  Dermocosmética & asesoría 24/7 en Colombia
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0284C7] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <div className="leading-relaxed">
                    {renderFormattedChatText(msg.text)}
                  </div>

                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => handleChatAction(msg.action!.actionType)}
                      className="mt-2.5 w-full py-2 px-3 bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-2xl border border-slate-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={chatMessagesEndRef} />
          </div>

          {/* Sugerencias de Preguntas (Chips Clickeables) */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block mb-1.5">
              Preguntas sugeridas en un toque:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChatMessage(q)}
                  className="whitespace-nowrap bg-slate-100 hover:bg-blue-50 hover:text-[#0284C7] hover:border-blue-200 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de Envío de Mensaje */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe tu duda sobre el producto..."
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0284C7] focus:outline-none focus:bg-white text-slate-800"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar pregunta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 13. MODAL DE CONFIRMACIÓN DE ÉXITO */}
      {isModalOpen && lastOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            </div>

            <h3 className="text-xl font-black text-center text-[#0A1D37] mb-1">
              ¡Pedido Registrado con Éxito!
            </h3>
            <p className="text-xs text-center text-slate-600 mb-4">
              {paymentMethod === 'cod'
                ? 'Tu despacho contraentrega ya está siendo alistado en bodega.'
                : 'Tu solicitud de pago ha sido procesada con éxito.'}
            </p>

            {wompiNotice && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-[#0284C7]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{wompiNotice}</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Número de Pedido:</span>
                <span className="font-extrabold text-[#0284C7] font-mono">{lastOrderDetails.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destinatario:</span>
                <span className="font-bold text-[#0A1D37]">{lastOrderDetails.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destino:</span>
                <span className="font-medium text-slate-700">
                  {lastOrderDetails.city}, {lastOrderDetails.department}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Paquete:</span>
                <span className="font-bold text-[#0A1D37]">{lastOrderDetails.productName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-bold text-slate-800">{lastOrderDetails.paymentMethodName}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-extrabold text-[#0A1D37]">Total:</span>
                <span className="font-black text-[#059669] tabular-nums">
                  {formatCOP(lastOrderDetails.total)} COP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mb-4">
              Para coordinar el despacho inmediato y enviarte el número de guía, confirma tu orden en un toque por WhatsApp:
            </p>

            <a
              href={lastOrderDetails.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span>Confirmar mi pedido por WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cerrar esta ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
