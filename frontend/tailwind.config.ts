import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Blanco clínico: reemplaza el blanco puro de Tailwind en toda la app
        // (tarjetas, diálogos, superficies) — se propaga vía bg-white/text-white existentes.
        white: '#FAFAF8',
        // Navy de marca iProcess — headers, sidebar, cualquier superficie oscura de navegación.
        navy: {
          DEFAULT: '#101820',
          dark: '#101820',
        },
        // Acento de marca (antes "cold"/teal): CTAs, interactivo, focus ring, sello.
        // Se conserva el nombre de clase "cold" para que el cambio se propague sin
        // tocar componente por componente; solo cambió el valor.
        cold: '#FF5C39',
        // "En tránsito" / "en curso": el naranja quedó reservado para el acento de marca,
        // así que este estado pasa a un ámbar cálido que no compite con los CTA.
        thermal: '#B8863A',
        // Verde salvia: éxito / "entregado" / habilitado para facturación.
        dispensed: '#2F6F5E',
        // Terracota: error / "no entregado". Se mantiene — ya era una variante oscura y
        // desaturada (no vívida), suficientemente distinta del naranja de marca.
        controlled: '#B23A2E',
        // Arena: superficies secundarias (fondo de página/paneles) contra el blanco clínico.
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
