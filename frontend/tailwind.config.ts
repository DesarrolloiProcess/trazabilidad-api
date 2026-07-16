import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Rebrand Drogas La Rebaja: blanco puro (antes "blanco clínico" FAFAF8) —
        // se propaga vía bg-white/text-white existentes.
        white: '#FFFFFF',
        // Carbón cálido de marca (antes navy #101820) — headers, sidebar, cualquier
        // superficie oscura de navegación. Neutro oscuro con tinte cálido, no frío,
        // para no competir con el rojo/dorado extraídos del logo del cliente.
        navy: {
          DEFAULT: '#241417',
          dark: '#241417',
        },
        // Acento de marca (antes "cold"/naranja FF5C39): CTAs, interactivo, focus ring,
        // sello. Extraído del logo de La Rebaja. Se conserva el nombre de clase "cold"
        // para que el cambio se propague sin tocar componente por componente.
        cold: '#D62839',
        // "En tránsito" / "en curso": dorado extraído del logo (antes ámbar B8863A).
        // Ligeramente más oscuro que el dorado "puro" del logo (E8A33D) para mantener
        // el mismo piso de contraste (~3:1) que ya tenía el ámbar anterior.
        thermal: '#BC7A0E',
        // Verde salvia: éxito / "entregado" / habilitado para facturación. Sin cambios —
        // ya era distinto del rojo/dorado de marca, no hacía falta tocarlo.
        dispensed: '#2F6F5E',
        // Vino/ciruela: error / "no entregado" (antes terracota B23A2E). Cambia de hue
        // por completo — el rojo ahora ES la marca, así que el error necesitaba un color
        // que no se leyera como una acción de marca.
        controlled: '#7A2E52',
        // Arena: superficies secundarias (fondo de página/paneles) contra el blanco.
        // Sin cambios — ya era neutra respecto al rojo/dorado nuevos.
        paper: '#F0EBE3',
        slate: {
          ...colors.slate,
          50: '#F0EBE3', // arena, para franjas de encabezado de tabla/tarjeta
          100: '#F0EBE3', // arena, para fondos de página secundarios (layout móvil)
          500: '#5C6470', // gris pizarra ajustado (oscurecido) para cumplir WCAG AA sobre arena
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Public Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
