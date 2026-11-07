import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Scroll keyframes: [camX,camY,camZ, lookX,lookY,lookZ, phoneRotY, pcRotY, relay, flow, pair, spread]
const K = [
  [0, 0.6, 11.5, 0, 1.5, 0, 0.35, -0.3, 0, 1, 0, 1],
  [-3.9, 0.1, 5, -3.5, -0.1, 0, 0, -0.4, 0, 0, 1, 1],
  [0, 1.1, 9.5, 0, 0, 0, 0.25, -0.25, 0, 1, 0, 1],
  [0, 2.6, 10.5, 0, 1.1, -0.4, 0.3, -0.3, 1, 1, 0, 1],
  [3.4, 0.5, 5.4, 3.4, 0.3, 0, 0.7, 0, 0, 1, 0, 1],
  [0, 0.5, 7.5, 0, 0, 0, 0.15, -0.15, 0, 1, 0, 0.8],
  [-1.4, 0.4, 8.5, -1.4, 0, 0, 0.5, -0.15, 0, 1, 0, 1],
  [0, 3.2, 12.5, 0, 0, 0, 1.1, -1.1, 0, 0, 0, 1.15],
  [0, 0.3, 9, 0, 0, 0, 0.2, -0.2, 0, 1, 0, 0.6],
];

const rr = (x, a, b, w, h, r) => {
  x.beginPath();
  if (typeof x.roundRect === 'function') {
    x.roundRect(a, b, w, h, r);
  } else {
    x.rect(a, b, w, h);
  }
};

const rrShape = (w, h, r) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const slab = (w, h, r, d, bv, mat) => {
  const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bv,
    bevelSize: bv,
    bevelSegments: 4,
    curveSegments: 14,
  });
  g.translate(0, 0, -d / 2);
  return new THREE.Mesh(g, mat);
};

const face = (w, h, r, mat, z) => {
  const g = new THREE.ShapeGeometry(rrShape(w, h, r), 14);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  const m = new THREE.Mesh(g, mat);
  m.position.z = z;
  return m;
};

const mkTex = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { x: c.getContext('2d'), t: new THREE.CanvasTexture(c), canvas: c };
};

const fu = (t) => 0.5 + 0.42 * Math.sin(t * 1.3);
const fv = (t) => 0.5 + 0.4 * Math.sin(t * 1.9 + 1);

export default function Scene3D({ isVisible, onScrollUpdate }) {
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(isVisible);
  const onScrollUpdateRef = useRef(onScrollUpdate);
  const renderPausedRef = useRef(!isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
    if (isVisible) {
      renderPausedRef.current = false;
    } else {
      const timer = setTimeout(() => {
        renderPausedRef.current = true;
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    onScrollUpdateRef.current = onScrollUpdate;
  }, [onScrollUpdate]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    let animId = null;
    const cur = K[0].slice();
    const tgt = K[0].slice();
    let mx = 0;
    let my = 0;
    let mode = 'lan';

    const renderer = new THREE.WebGLRenderer({
      canvas: cv,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);

    const hemiLight = new THREE.HemisphereLight(0xdfe8ff, 0x111722, 1.15);
    scene.add(hemiLight);

    const dl = new THREE.DirectionalLight(0xffffff, 1.35);
    dl.position.set(3, 5, 6);
    scene.add(dl);

    const rim = new THREE.DirectionalLight(0x8fb8ff, 1.15);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const PT = mkTex(256, 512);
    const MT = mkTex(640, 400);

    const alu = new THREE.MeshStandardMaterial({
      color: 0xc2c9d3,
      metalness: 0.92,
      roughness: 0.2,
    });
    const frameM = new THREE.MeshStandardMaterial({
      color: 0x707987,
      metalness: 0.94,
      roughness: 0.19,
    });
    const dark = new THREE.MeshPhysicalMaterial({
      color: 0x10151d,
      roughness: 0.24,
      metalness: 0.48,
      clearcoat: 0.85,
      clearcoatRoughness: 0.16,
    });
    const black = new THREE.MeshBasicMaterial({ color: 0x040405 });

    // Phone
    const phone = new THREE.Group();
    phone.add(slab(1.1, 2.28, 0.24, 0.1, 0.035, frameM));
    phone.add(face(1.12, 2.3, 0.2, black, 0.088));
    phone.add(face(1.04, 2.2, 0.16, new THREE.MeshBasicMaterial({ map: PT.t }), 0.09));
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.032, 20), black);
    hole.position.set(0, 1.0, 0.092);
    phone.add(hole);

    [[0.61, 0.45, 0.3], [-0.61, 0.62, 0.2], [-0.61, 0.3, 0.2]].forEach(([x, y, h]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, h, 0.05), frameM);
      b.position.set(x, y, 0);
      phone.add(b);
    });

    // PC
    const pc = new THREE.Group();
    pc.add(slab(3.36, 2.06, 0.1, 0.06, 0.02, dark));
    pc.add(face(3.4, 2.1, 0.08, black, 0.052));
    pc.add(face(3.24, 1.96, 0.04, new THREE.MeshBasicMaterial({ map: MT.t }), 0.054));
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.07), alu);
    neck.position.set(0, -1.5, -0.06);
    pc.add(neck);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.05, 48), alu);
    base.scale.z = 0.6;
    base.position.set(0, -1.93, 0.02);
    pc.add(base);

    // Keyboard
    const kbC = document.createElement('canvas');
    kbC.width = 512;
    kbC.height = 170;
    const kCtx = kbC.getContext('2d');
    kCtx.fillStyle = '#26272b';
    kCtx.fillRect(0, 0, 512, 170);
    kCtx.fillStyle = '#3a3c42';
    for (let r = 0; r < 5; r++) {
      const n = r === 4 ? 1 : 13 - (r % 2);
      for (let c = 0; c < n; c++) {
        const w = r === 4 ? 330 : 34;
        const x0 = r === 4 ? 90 : 14 + c * 37 + (r % 2) * 10;
        kCtx.fillRect(x0, 12 + r * 31, w, 25);
      }
    }
    const kb = new THREE.Group();
    const kbBody = slab(2.1, 0.7, 0.05, 0.04, 0.012, dark);
    kbBody.rotation.x = -Math.PI / 2;
    kb.add(kbBody);
    const kbTop = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 0.62),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(kbC) })
    );
    kbTop.rotation.x = -Math.PI / 2;
    kbTop.position.y = 0.04;
    kb.add(kbTop);
    kb.position.set(-0.1, -1.93, 1.3);
    pc.add(kb);

    const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), dark);
    mouse.scale.set(0.15, 0.08, 0.25);
    pc.add(mouse);

    const relay = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.6, 1),
      new THREE.MeshBasicMaterial({ color: 0xffb547, wireframe: true })
    );
    relay.position.set(0, 2.4, -1);
    scene.add(phone, pc, relay);

    // PREMIUM PRODUCT-STAGE ENVIRONMENT
    const stage = new THREE.Group();
    scene.add(stage);

    // Floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a1019,
      metalness: 0.72,
      roughness: 0.28,
      transparent: true,
      opacity: 0.92,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(13, 96), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.35;
    stage.add(floor);

    // Stage rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.22 });
    const ringMatCool = new THREE.MeshBasicMaterial({ color: 0x6da9e8, transparent: true, opacity: 0.16 });
    [3.2, 4.4, 5.8].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 128), i === 1 ? ringMatCool : ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -2.31 + i * 0.008;
      stage.add(ring);
    });

    // Studio point lights
    const amberPoint = new THREE.PointLight(0xffb45c, 1.7, 18, 2);
    amberPoint.position.set(-4, 3, 4);
    scene.add(amberPoint);

    const bluePoint = new THREE.PointLight(0x548ed0, 1.5, 20, 2);
    bluePoint.position.set(4, 1, -4);
    scene.add(bluePoint);

    const frontPoint = new THREE.PointLight(0xffffff, 0.65, 16, 2);
    frontPoint.position.set(0, 4, 7);
    scene.add(frontPoint);

    // Micro-particles
    const particleCount = window.innerWidth < 700 ? 90 : 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = 4 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.2) * 8;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius - 2;
      particleSeeds.push({ phase: Math.random() * Math.PI * 2, speed: 0.25 + Math.random() * 0.55 });
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd69a,
      size: 0.025,
      transparent: true,
      opacity: 0.52,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Halo
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({ color: 0x8bbcff, transparent: true, opacity: 0.18 })
    );
    halo.position.set(0, 1.0, -2.1);
    scene.add(halo);

    // Glow disc
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const gx = glowCanvas.getContext('2d');
    const grad = gx.createRadialGradient(128, 128, 5, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,181,71,.22)');
    grad.addColorStop(0.42, 'rgba(65,113,174,.09)');
    grad.addColorStop(1, 'rgba(5,8,14,0)');
    gx.fillStyle = grad;
    gx.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false })
    );
    glow.position.set(0, 1, -4.5);
    scene.add(glow);

    // Floating glass nodes
    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0x182333,
      metalness: 0.48,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.92,
    });
    const nodes = [];
    [[-2.8, 1.4, 0.2], [2.9, 1.9, -0.5], [0, 3.0, -1.5]].forEach((p, i) => {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), nodeMat.clone());
      node.position.set(p[0], p[1], p[2]);
      node.material.emissive = new THREE.Color(i === 1 ? 0x102a4b : 0x3a2108);
      node.material.emissiveIntensity = 0.45;
      scene.add(node);
      nodes.push(node);
    });

    const A = new THREE.Vector3();
    const B = new THREE.Vector3();
    const Rl = relay.position;
    let path = [A, B];
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffb547,
      transparent: true,
      opacity: 0.5,
    });
    let line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path), lineMat);
    scene.add(line);

    function setPath(m) {
      mode = m;
      path = m === 'lan' ? [A, B] : [A, Rl, B];
      if (line) {
        scene.remove(line);
        line.geometry.dispose();
      }
      line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path), lineMat);
      scene.add(line);
    }
    setPath('lan');

    const dots = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfff1d0, transparent: true })
      );
      scene.add(m);
      dots.push(m);
    }

    const along = (t, o) => {
      const n = path.length - 1;
      const f = t * n;
      const i = Math.min(Math.floor(f), n - 1);
      return o.lerpVectors(path[i], path[i + 1], f - i);
    };

    function drawPhoneCanvas(u, v, pair) {
      const x = PT.x;
      x.globalAlpha = 1;
      x.fillStyle = '#1F1F1F';
      x.fillRect(0, 0, 256, 512);

      x.fillStyle = '#f3f3f3';
      x.font = '600 20px sans-serif';
      x.fillText('Beatz Connect', 20, 40);

      x.globalAlpha = 1 - pair;
      x.fillStyle = '#2B2B2B';
      rr(x, 16, 70, 224, 300, 18);
      x.fill();

      const fx = 36 + 184 * u;
      const fy = 90 + 260 * v;
      x.fillStyle = 'rgba(255,181,71,.25)';
      x.beginPath();
      x.arc(fx, fy, 34, 0, Math.PI * 2);
      x.fill();

      x.fillStyle = '#ffb547';
      x.beginPath();
      x.arc(fx, fy, 14, 0, Math.PI * 2);
      x.fill();

      x.fillStyle = '#2B2B2B';
      for (let i = 0; i < 3; i++) {
        rr(x, 16 + i * 76, 392, 70, 64, 14);
        x.fill();
      }
      x.fillStyle = '#a9a9a9';
      x.font = '16px sans-serif';
      ['Prev', 'Play', 'Next'].forEach((s, i) => x.fillText(s, 34 + i * 76, 432));

      x.globalAlpha = pair;
      x.fillStyle = '#a9a9a9';
      x.font = '18px sans-serif';
      x.fillText('Pairing code', 20, 130);
      x.fillStyle = '#ffb547';
      x.font = '800 44px sans-serif';
      x.fillText('482 913', 20, 200);
      x.fillStyle = '#2B2B2B';
      rr(x, 20, 240, 216, 56, 14);
      x.fill();
      x.fillStyle = '#f3f3f3';
      x.font = '600 20px sans-serif';
      x.fillText('Connect', 84, 276);

      x.globalAlpha = 1;
      PT.t.needsUpdate = true;
    }

    function drawPCCanvas(u, v) {
      const x = MT.x;
      const g = x.createLinearGradient(0, 0, 640, 400);
      g.addColorStop(0, '#26305a');
      g.addColorStop(1, '#143a4a');
      x.fillStyle = g;
      x.fillRect(0, 0, 640, 400);

      x.fillStyle = '#1F1F1F';
      rr(x, 60, 40, 520, 270, 14);
      x.fill();

      x.fillStyle = '#2B2B2B';
      x.fillRect(60, 40, 170, 270);

      x.fillStyle = '#f3f3f3';
      x.font = '600 20px sans-serif';
      x.fillText('Phone', 76, 76);

      x.fillStyle = '#7fe0a0';
      x.font = '16px sans-serif';
      x.fillText('● Connected', 76, 106);

      x.fillStyle = '#a9a9a9';
      x.fillText(mode === 'lan' ? 'Local Wi‑Fi' : 'Cloud relay', 76, 132);

      x.fillText('Pointer speed', 250, 90);
      x.fillStyle = '#3b3b3b';
      rr(x, 250, 104, 280, 8, 4);
      x.fill();

      x.fillStyle = '#ffb547';
      rr(x, 250, 104, 130, 8, 4);
      x.fill();

      x.fillStyle = 'rgba(255,255,255,.12)';
      x.fillRect(0, 360, 640, 40);

      const cx = 60 + 520 * u;
      const cy = 40 + 320 * v;
      x.fillStyle = '#fff';
      x.strokeStyle = '#000';
      x.lineWidth = 1.5;
      x.beginPath();
      x.moveTo(cx, cy);
      x.lineTo(cx, cy + 22);
      x.lineTo(cx + 6, cy + 17);
      x.lineTo(cx + 11, cy + 28);
      x.lineTo(cx + 15, cy + 26);
      x.lineTo(cx + 10, cy + 16);
      x.lineTo(cx + 18, cy + 16);
      x.closePath();
      x.fill();
      x.stroke();

      MT.t.needsUpdate = true;
    }

    function readScroll() {
      if (!isVisibleRef.current) return;
      const panes = Array.from(document.querySelectorAll('.pane'));
      const N = panes.length;
      if (N === 0) return;

      const vh = window.innerHeight;
      let s = 0;
      panes.forEach((p) => {
        const r = p.getBoundingClientRect();
        s += Math.max(0, Math.min(1, (vh * 0.5 - r.top) / r.height));
      });
      s = Math.max(0, Math.min(N - 1, s - 0.5));
      const i = Math.min(Math.floor(s), N - 2);
      const f = s - i;
      const e = f * f * (3 - 2 * f);
      for (let k = 0; k < 12; k++) {
        tgt[k] = K[i][k] + (K[i + 1][k] - K[i][k]) * e;
      }

      const max = document.documentElement.scrollHeight - vh;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const prog = max > 0 ? scrollY / max : 0;
      const scrolled = scrollY > 40;

      if (onScrollUpdateRef.current) {
        onScrollUpdateRef.current({ progress: prog, scrolledPast: scrolled });
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      readScroll();
    }

    const onPointerMove = (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    resize();

    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tmp = new THREE.Vector3();
    const look = new THREE.Vector3();
    const clock = new THREE.Clock();

    function frame() {
      if (!isVisibleRef.current && renderPausedRef.current) {
        animId = requestAnimationFrame(frame);
        return;
      }

      const t = clock.getElapsedTime();
      const d = still ? 1 : 0.09;

      // Atmospheric movement
      stage.rotation.y = still ? 0 : Math.sin(t * 0.08) * 0.025;
      halo.rotation.z = still ? 0 : t * 0.035;
      halo.material.opacity = 0.12 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.7));
      amberPoint.intensity = 1.45 + 0.25 * Math.sin(t * 0.8);
      bluePoint.intensity = 1.25 + 0.22 * Math.sin(t * 0.65 + 1.2);
      nodes.forEach((node, i) => {
        node.position.y = [1.4, 1.9, 3.0][i] + (still ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.12);
        node.rotation.y = t * 0.25 + i;
      });

      const pp = particleGeo.attributes.position;
      if (!still) {
        for (let i = 0; i < particleCount; i++) {
          const seed = particleSeeds[i];
          const base = particlePositions[i * 3 + 1];
          pp.array[i * 3 + 1] = base + Math.sin(t * seed.speed + seed.phase) * 0.11;
        }
        pp.needsUpdate = true;
      }

      for (let k = 0; k < 12; k++) {
        cur[k] += (tgt[k] - cur[k]) * d;
      }

      camera.position.set(
        cur[0] + (still ? 0 : mx * 0.6),
        cur[1] + (still ? 0 : -my * 0.4),
        cur[2]
      );
      look.set(cur[3], cur[4], cur[5]);
      camera.lookAt(look);

      const sp = cur[11];
      phone.position.set(-3.5 * sp, -0.1 + (still ? 0 : Math.sin(t * 0.8) * 0.06), 0);
      phone.rotation.y = cur[6];

      pc.position.set(3.4 * sp, 0.3, 0);
      pc.rotation.y = cur[7];
      mouse.position.set(
        1.55 + (fu(t - 0.2) - 0.5) * 0.35,
        -1.87,
        1.3 + (fv(t - 0.2) - 0.5) * 0.25
      );

      A.set(phone.position.x, -0.1, 0.3);
      B.set(pc.position.x, 0.3, 0.3);

      const wanWant = cur[8] > 0.5 ? 'wan' : 'lan';
      if (wanWant !== mode) {
        setPath(wanWant);
      }

      relay.scale.setScalar(Math.max(0.001, cur[8]));
      relay.rotation.y = t * 0.6;
      relay.rotation.x = t * 0.3;

      if (line && line.geometry) {
        line.geometry.setFromPoints(path);
      }
      lineMat.opacity = 0.5 * Math.max(0.15, cur[9]);

      dots.forEach((m, i) => {
        along((t * 0.45 + i / dots.length) % 1, tmp);
        m.position.copy(tmp);
        m.material.opacity = cur[9];
      });

      drawPhoneCanvas(fu(t), fv(t), cur[10]);
      drawPCCanvas(fu(t - 0.2), fv(t - 0.2));

      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    readScroll();
    animId = requestAnimationFrame(frame);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);

      renderer.dispose();
      PT.t.dispose();
      MT.t.dispose();
      glowTex.dispose();
      lineMat.dispose();
      if (line && line.geometry) line.geometry.dispose();
      floorMat.dispose();
      ringMat.dispose();
      ringMatCool.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="c"
      className={isVisible ? 'canvas-visible' : 'canvas-hidden'}
      aria-label="3D model of a phone controlling a Windows PC that moves as you scroll"
    />
  );
}
