import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#E6EBF5',
            100: '#B3C1E0',
            200: '#8097CC',
            300: '#4D6DB8',
            400: '#1A43A3',
            500: '#003591',
            600: '#0f204b', 
            700: '#0C1A3D',
            800: '#091430',
            900: '#060D22'
        }
    },
});

export default MyPreset;