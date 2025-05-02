# 3D Jewelry Customizer

A web-based 3D jewelry customization application built with Three.js and React. This application allows users to view, customize, and interact with 3D jewelry models in real-time.

![Jewelry Customizer Preview](./preview.jpg)

## Features

- Interactive 3D jewelry visualization
- Multiple jewelry model types (rings, necklaces, earrings, etc.)
- Material customization (gold, silver, platinum, etc.)
- Gemstone customization (diamond, ruby, sapphire, etc.)
- Surface finish options (polished, brushed, matte, etc.)
- Environment lighting presets with HDRI maps
- Individual part selection and editing
- Real-time color customization
- Advanced rendering with post-processing for realistic results
- Camera controls for viewing from any angle

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jewelry-customizer.git
cd jewelry-customizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create the assets directory structure:
```bash
mkdir -p public/assets/models
mkdir -p public/assets/textures
mkdir -p public/assets/hdri
```

4. Add your 3D model files to the `public/assets/models` directory

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
jewelry-customizer/
├── public/
│   └── assets/
│       ├── models/        # 3D model files (.glb, .gltf)
│       ├── textures/      # Texture files
│       └── hdri/          # HDRI environment maps
├── src/
│   ├── components/        # React UI components
│   ├── core/              # Core Three.js functionality
│   │   ├── Animation.jsx  # Animation loop
│   │   ├── lighting.js    # Lighting system
│   │   ├── materialManager.js # Material management
│   │   ├── modelLoader.js # Model loading
│   │   ├── postProcessing.js # Post-processing effects
│   │   ├── sceneSetup.js  # Scene initialization
│   │   └── ThreeApplication.js # Main application class
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main React component
│   └── main.jsx           # Entry point
└── index.html             # HTML template
```

## Adding Custom Models

To add your own jewelry models to the application:

1. Prepare your 3D model in glTF/GLB format using Blender or another 3D software
2. Ensure proper materials and part naming for the model
3. Place the model file in `public/assets/models/`
4. Add the model configuration to `src/core/modelLoader.js` in the `JEWELRY_MODELS` object
5. Define part names and material assignments in the model configuration

Example model configuration:
```javascript
'custom_ring': {
    name: "Custom Ring",
    path: './assets/models/custom_ring.glb',
    scale: 1.0,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    parts: ['band', 'setting', 'gem'],
    type: 'ring',
    materials: {
        'band': 'metal',
        'setting': 'metal',
        'gem': 'gem'
    },
    defaultMaterials: {
        'band': 'gold',
        'setting': 'gold',
        'gem': 'diamond'
    }
}
```

## Customizing Materials

You can add new material presets by modifying:
- `METAL_PRESETS` in `src/core/materialManager.js` for metal materials
- `GEM_PRESETS` in `src/core/materialManager.js` for gemstone materials
- `FINISH_PRESETS` in `src/core/materialManager.js` for surface finishes

## Deployment

To build for production:

```bash
npm run build
# or
yarn build
```

The build files will be located in the `dist/` directory and can be deployed to any static site hosting service.

## Technologies Used

- [Three.js](https://threejs.org/) - 3D graphics library
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TailwindCSS](https://tailwindcss.com/) - CSS framework


## Acknowledgments

- Three.js community for examples and inspiration
- [hdri-haven.com](https://hdri-haven.com/) for HDRI environment maps
- [Sketchfab](https://sketchfab.com/) for reference jewelry models
- [Blender] 
- [Claude]