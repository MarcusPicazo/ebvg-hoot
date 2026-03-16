import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ThreeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, particles, shapes = [];
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    let animationFrameId;

    const initThreeJS = () => {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0f0c29, 0.002);

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 30; // La cámara base

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);
      }

      // 1. LUCES DIRECCIONALES (Más fuertes y con tonos vibrantes)
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); 
      scene.add(ambientLight);

      const light1 = new THREE.DirectionalLight(0xff00aa, 5); // Rosa más encendido
      light1.position.set(10, 10, 10);
      scene.add(light1);

      const light2 = new THREE.DirectionalLight(0x00f2fe, 5); // Cyan brillante
      light2.position.set(-10, -10, 10);
      scene.add(light2);

      // 2. PARTICULAS CON PROFUNDIDAD (Estrellas cerca de la cámara)
      const particleGeo = new THREE.BufferGeometry();
      const particleCount = 850; // Aumentamos la cantidad total
      const posArray = new Float32Array(particleCount * 3);
      for(let i = 0; i < particleCount; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 150;     // X
        posArray[i * 3 + 1] = (Math.random() - 0.5) * 150; // Y
        
        // TRUCO: Forzamos a 200 estrellas a estar muy cerca de la cámara (z=30)
        if (i < 200) {
          posArray[i * 3 + 2] = 15 + Math.random() * 14; // Z entre 15 y 29 (Cercanas)
        } else {
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 150; // Z normal (Lejanas)
        }
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.18, // Ligeramente más grandes para resaltar las cercanas
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      const geometries = [
        new THREE.IcosahedronGeometry(2, 0),
        new THREE.TorusGeometry(3, 0.8, 16, 100),
        new THREE.OctahedronGeometry(2, 0),
        new THREE.SphereGeometry(1.5, 32, 32)
      ];

      // 3. MATERIAL MILIMÉTRICO (Color vibrante y reflejo esparcido)
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x5a00ff,         // Morado un toque más claro y encendido
        emissive: 0x2a0066,      // Brillo magenta para matar sombras oscuras
        metalness: 0.1,
        roughness: 0.25,         // CLAVE: Suaviza la superficie para que la luz neón haga un degradado
        clearcoat: 1.0,          
        clearcoatRoughness: 0.1
      });

      // 4. DISTRIBUCIÓN INTACTA (Como la aprobaste)
      for(let i = 0; i < 12; i++) {
        const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], material);
        
        mesh.position.set(
          (Math.random() - 0.5) * 110, // X: A lo ancho
          (Math.random() - 0.5) * 80,  // Y: A lo alto
          (Math.random() - 0.5) * 50   // Z: Profundidad
        );

        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        mesh.userData = {
          rx: (Math.random() - 0.5) * 0.01,
          ry: (Math.random() - 0.5) * 0.01,
          dy: (Math.random() - 0.5) * 0.02
        };
        shapes.push(mesh);
        scene.add(mesh);
      }

      const handleMouseMove = (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
      };

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      document.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);

      const animate = () => {
        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;

        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;

        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        shapes.forEach(shape => {
          shape.rotation.x += shape.userData.rx;
          shape.rotation.y += shape.userData.ry;
          shape.position.y += Math.sin(Date.now() * 0.001) * shape.userData.dy;
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      scene.userData.cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (renderer && containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    };

    initThreeJS();

    return () => {
      if (scene && scene.userData.cleanup) {
        scene.userData.cleanup();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#0f0c29] via-[#302663] to-[#24243e]" 
    />
  );
};