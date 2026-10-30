import { useState, useEffect, useRef, Suspense } from "react";
import * as THREE from "three";

// ─── 3D Shoe Model Component ────────────────────────────────────────────────
function ShoeModel3D({ color = "#FF3A3A", rotating = true, size = 1 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 3.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(color, 0.8, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // ── Build Procedural Shoe ─────────────────────────────────────────────
    const shoeGroup = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.3 });

    // === SOLE (bottom) ===
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-1.1, -0.3);
    soleShape.quadraticCurveTo(-1.3, 0, -1.1, 0.3);
    soleShape.lineTo(0.9, 0.35);
    soleShape.quadraticCurveTo(1.3, 0.3, 1.25, -0.1);
    soleShape.quadraticCurveTo(1.2, -0.4, 0.9, -0.38);
    soleShape.lineTo(-1.1, -0.3);

    const soleExtSettings = { depth: 0.15, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4 };
    const soleGeo = new THREE.ExtrudeGeometry(soleShape, soleExtSettings);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.rotation.x = -Math.PI / 2;
    sole.position.y = -0.55;
    sole.castShadow = true;
    shoeGroup.add(sole);

    // === MIDSOLE ===
    const midShape = new THREE.Shape();
    midShape.moveTo(-1.05, -0.28);
    midShape.quadraticCurveTo(-1.2, 0, -1.05, 0.28);
    midShape.lineTo(0.85, 0.32);
    midShape.quadraticCurveTo(1.2, 0.28, 1.15, 0);
    midShape.quadraticCurveTo(1.15, -0.32, 0.85, -0.35);
    midShape.lineTo(-1.05, -0.28);

    const midExtSettings = { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 };
    const midGeo = new THREE.ExtrudeGeometry(midShape, midExtSettings);
    const midsole = new THREE.Mesh(midGeo, mat);
    midsole.rotation.x = -Math.PI / 2;
    midsole.position.y = -0.37;
    midsole.castShadow = true;
    shoeGroup.add(midsole);

    // === UPPER BODY ===
    const upperPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.35, 0),
      new THREE.Vector2(0.7, 0.1),
      new THREE.Vector2(0.9, 0.35),
      new THREE.Vector2(0.85, 0.6),
      new THREE.Vector2(0.6, 0.75),
      new THREE.Vector2(0, 0.8),
    ];

    // Toe box
    const toebox = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
      mat
    );
    toebox.scale.set(1.3, 0.7, 1.0);
    toebox.position.set(0.82, -0.12, 0);
    toebox.castShadow = true;
    shoeGroup.add(toebox);

    // Main upper body
    const upperBodyGeo = new THREE.CylinderGeometry(0.42, 0.5, 0.85, 24, 1, true, 0, Math.PI);
    const upperBody = new THREE.Mesh(upperBodyGeo, mat);
    upperBody.position.set(-0.1, -0.06, 0);
    upperBody.rotation.z = -0.15;
    upperBody.castShadow = true;
    shoeGroup.add(upperBody);

    // Cap the upper
    const upperCapGeo = new THREE.SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const upperCap = new THREE.Mesh(upperCapGeo, mat);
    upperCap.position.set(-0.1, 0.36, 0);
    upperCap.scale.set(1, 0.5, 1);
    shoeGroup.add(upperCap);

    // Heel counter
    const heelGeo = new THREE.SphereGeometry(0.44, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const heel = new THREE.Mesh(heelGeo, darkMat);
    heel.scale.set(0.9, 0.9, 0.95);
    heel.position.set(-0.78, -0.08, 0);
    heel.castShadow = true;
    shoeGroup.add(heel);

    // Ankle collar
    const collarGeo = new THREE.TorusGeometry(0.3, 0.07, 12, 32, Math.PI * 1.5);
    const collar = new THREE.Mesh(collarGeo, darkMat);
    collar.position.set(-0.5, 0.28, 0);
    collar.rotation.z = 0.2;
    collar.castShadow = true;
    shoeGroup.add(collar);

    // Tongue
    const tongueGeo = new THREE.BoxGeometry(0.55, 0.6, 0.05);
    const tongue = new THREE.Mesh(tongueGeo, mat);
    tongue.position.set(0.25, 0.15, 0.38);
    tongue.rotation.x = 0.3;
    shoeGroup.add(tongue);

    // Laces
    for (let i = 0; i < 5; i++) {
      const laceGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.7, 8);
      const lace = new THREE.Mesh(laceGeo, accentMat);
      lace.rotation.z = Math.PI / 2;
      lace.position.set(0.3, 0.0 + i * 0.1, 0.4);
      shoeGroup.add(lace);
    }

    // Swoosh-like accent stripe
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.4, -0.05, 0.42),
      new THREE.Vector3(0.2, 0.25, 0.43),
      new THREE.Vector3(0.7, 0.0, 0.42)
    );
    const points = curve.getPoints(30);
    const swooshGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      20, 0.025, 8, false
    );
    const swoosh = new THREE.Mesh(swooshGeo, accentMat);
    shoeGroup.add(swoosh);

    // Ventilation holes
    for (let i = 0; i < 6; i++) {
      const holeGeo = new THREE.CircleGeometry(0.03, 8);
      const hole = new THREE.Mesh(holeGeo, darkMat);
      hole.position.set(0.1 + i * 0.12, 0.05, 0.45);
      shoeGroup.add(hole);
    }

    // Scale
    shoeGroup.scale.setScalar(size);
    shoeGroup.rotation.y = 0.3;
    scene.add(shoeGroup);

    // Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.75;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    let angle = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (rotating) {
        angle += 0.008;
        shoeGroup.rotation.y = 0.3 + angle;
      }
      pointLight.color.set(color);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [color, rotating, size]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#FFD700" : "#333", fontSize: "14px" }}>★</span>
      ))}
      <span style={{ color: "#888", fontSize: "12px", marginLeft: "4px" }}>{rating}</span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onClick, onAddToCart }) {
  const [hoveredColor, setHoveredColor] = useState(product.colors[0]);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(145deg, #111118, #0d0d14)",
        border: `1px solid ${hovered ? hoveredColor + "44" : "#1e1e2e"}`,
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: hovered ? `0 20px 60px ${hoveredColor}22, 0 0 0 1px ${hoveredColor}33` : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* 3D Preview */}
      <div style={{ position: "relative", height: "220px", background: "radial-gradient(ellipse at center, #1a1a2e 0%, #080810 100%)" }}>
        <ShoeModel3D color={hoveredColor} rotating={hovered} size={0.72} />
        {/* Tags */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {product.tags.map(tag => (
            <span key={tag} style={{
              background: tag === "sale" ? "#ff3a5c" : tag === "new" ? "#00d4ff" : tag === "bestseller" ? "#FFD700" : tag === "trending" ? "#a855f7" : "#374151",
              color: tag === "bestseller" ? "#000" : "#fff",
              fontSize: "10px",
              fontWeight: "800",
              padding: "3px 8px",
              borderRadius: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>{tag}</span>
          ))}
        </div>
        {product.original_price && (
          <div style={{
            position: "absolute", top: "12px", right: "12px",
            background: "#ff3a5c", color: "#fff",
            fontSize: "11px", fontWeight: "800",
            padding: "4px 8px", borderRadius: "12px"
          }}>
            -{Math.round((1 - product.price / product.original_price) * 100)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <div style={{ color: "#666", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px", fontFamily: "'Courier New', monospace" }}>{product.brand}</div>
            <div style={{ color: "#fff", fontSize: "17px", fontWeight: "700", fontFamily: "'Georgia', serif", lineHeight: 1.2 }}>{product.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: hoveredColor, fontSize: "20px", fontWeight: "800", fontFamily: "'Courier New', monospace" }}>${product.price}</div>
            {product.original_price && <div style={{ color: "#555", fontSize: "13px", textDecoration: "line-through" }}>${product.original_price}</div>}
          </div>
        </div>

        <Stars rating={product.rating} />
        <div style={{ color: "#555", fontSize: "11px", marginTop: "2px" }}>{product.reviews.toLocaleString()} reviews</div>

        {/* Color Selector */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px", alignItems: "center" }}>
          {product.colors.map(c => (
            <div
              key={c}
              onClick={e => { e.stopPropagation(); setHoveredColor(c); }}
              style={{
                width: hoveredColor === c ? "20px" : "16px",
                height: hoveredColor === c ? "20px" : "16px",
                borderRadius: "50%",
                background: c,
                border: hoveredColor === c ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: hoveredColor === c ? `0 0 10px ${c}` : "none"
              }}
            />
          ))}
          <div style={{ marginLeft: "auto", color: "#555", fontSize: "11px" }}>{product.category}</div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={e => { e.stopPropagation(); onAddToCart(product, product.sizes[4] || product.sizes[0], hoveredColor); }}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "12px",
            background: `linear-gradient(135deg, ${hoveredColor}, ${hoveredColor}99)`,
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontWeight: "800",
            fontSize: "13px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.3s",
            fontFamily: "'Courier New', monospace",
          }}
          onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(145deg, #0f0f1a, #13131f)",
        border: "1px solid #1e1e2e",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "860px",
        maxHeight: "90vh",
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
      }}>
        {/* Left: 3D View */}
        <div style={{ height: "480px", background: "radial-gradient(ellipse at center, #1a1a30 0%, #08080f 100%)", borderRadius: "28px 0 0 28px", position: "relative" }}>
          <ShoeModel3D color={selectedColor} rotating={true} size={0.85} />
          <button onClick={onClose} style={{
            position: "absolute", top: "16px", right: "16px",
            background: "#1e1e2e", border: "none", color: "#fff",
            width: "36px", height: "36px", borderRadius: "50%",
            cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Right: Details */}
        <div style={{ padding: "40px" }}>
          <div style={{ color: "#666", fontSize: "11px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "monospace" }}>{product.brand} · {product.category}</div>
          <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", fontSize: "28px", margin: "8px 0 4px", lineHeight: 1.2 }}>{product.name}</h2>
          <Stars rating={product.rating} />
          <div style={{ color: "#555", fontSize: "12px", marginBottom: "20px" }}>{product.reviews.toLocaleString()} verified reviews</div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <span style={{ color: selectedColor, fontSize: "32px", fontWeight: "800", fontFamily: "monospace" }}>${product.price}</span>
            {product.original_price && <span style={{ color: "#555", fontSize: "18px", textDecoration: "line-through" }}>${product.original_price}</span>}
            {product.original_price && <span style={{ background: "#ff3a5c", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
              -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
            </span>}
          </div>

          <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>{product.description}</p>

          {/* Colors */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ color: "#aaa", fontSize: "12px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Color</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {product.colors.map(c => (
                <div key={c} onClick={() => setSelectedColor(c)} style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: c, cursor: "pointer",
                  border: selectedColor === c ? "3px solid #fff" : "3px solid transparent",
                  boxShadow: selectedColor === c ? `0 0 16px ${c}` : "none",
                  transition: "all 0.2s"
                }} />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ color: "#aaa", fontSize: "12px", fontWeight: "600", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Size</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)} style={{
                  padding: "8px 14px",
                  border: `1px solid ${selectedSize === s ? selectedColor : "#2a2a3e"}`,
                  borderRadius: "10px",
                  background: selectedSize === s ? selectedColor + "22" : "transparent",
                  color: selectedSize === s ? selectedColor : "#666",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  fontFamily: "monospace"
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#1a1a2e", borderRadius: "12px", padding: "8px 16px" }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>−</button>
              <span style={{ color: "#fff", fontSize: "16px", fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>+</button>
            </div>
          </div>

          <button
            onClick={() => { onAddToCart(product, selectedSize || product.sizes[4] || product.sizes[0], selectedColor, qty); onClose(); }}
            style={{
              width: "100%",
              padding: "16px",
              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}bb)`,
              border: "none",
              borderRadius: "14px",
              color: "#fff",
              fontWeight: "800",
              fontSize: "15px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: `0 8px 32px ${selectedColor}44`,
              transition: "transform 0.2s",
              fontFamily: "monospace",
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Add {qty > 1 ? `${qty}x ` : ""}to Cart — ${(product.price * qty).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, onClose, onRemove, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "400px", maxWidth: "100vw",
        background: "linear-gradient(180deg, #0f0f1a, #0a0a12)",
        borderLeft: "1px solid #1e1e2e",
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.3s ease-out",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", margin: 0, fontSize: "22px" }}>Your Cart</h2>
            <div style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose} style={{ background: "#1e1e2e", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", color: "#444", paddingTop: "60px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👟</div>
              <div style={{ fontSize: "16px" }}>Your cart is empty</div>
            </div>
          ) : (
            cart.map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "16px", padding: "16px 0",
                borderBottom: "1px solid #1a1a28"
              }}>
                <div style={{ width: "80px", height: "70px", background: "radial-gradient(ellipse, #1a1a2e, #0a0a12)", borderRadius: "12px", flexShrink: 0, overflow: "hidden" }}>
                  <ShoeModel3D color={item.color} rotating={false} size={0.55} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#888", fontSize: "10px", fontFamily: "monospace", letterSpacing: "1px" }}>{item.brand}</div>
                  <div style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>{item.name}</div>
                  <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>Size {item.size} · <span style={{ background: item.color, borderRadius: "50%", display: "inline-block", width: "10px", height: "10px", verticalAlign: "middle" }}></span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                    <span style={{ color: item.color, fontWeight: "700", fontFamily: "monospace" }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#ff3a5c", cursor: "pointer", fontSize: "12px" }}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px 28px", borderTop: "1px solid #1e1e2e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "14px", marginBottom: "8px" }}>
              <span>Subtotal</span><span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "14px", marginBottom: "16px" }}>
              <span>Shipping</span><span style={{ color: "#00d4ff" }}>Free</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: "18px", fontWeight: "800", marginBottom: "20px", fontFamily: "monospace" }}>
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              border: "none", borderRadius: "14px",
              color: "#fff", fontWeight: "800", fontSize: "15px",
              letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "monospace",
              boxShadow: "0 8px 32px rgba(0, 212, 255, 0.3)"
            }}>
              Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onShopNow }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 80% 60% at 50% 50%, #0d0d2b 0%, #050508 70%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "80px 20px",
    }}>
      {/* Animated grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        animation: "gridMove 20s linear infinite",
      }} />
      <style>{`
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 60px 60px; } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      {/* Glow orbs */}
      <div style={{ position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, #00d4ff08 0%, transparent 70%)", borderRadius: "50%", top: "-100px", left: "-100px", animation: "pulse 4s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, #7c3aed08 0%, transparent 70%)", borderRadius: "50%", bottom: "-50px", right: "-50px", animation: "pulse 4s ease-in-out infinite 2s" }} />

      {/* Hero 3D shoe */}
      <div style={{ width: "420px", height: "320px", animation: "float 6s ease-in-out infinite", marginBottom: "20px" }}>
        <ShoeModel3D color="#00d4ff" rotating={true} size={1.1} />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ color: "#00d4ff", fontSize: "11px", fontFamily: "monospace", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "16px", fontWeight: "700" }}>
          Next-Gen Footwear · 3D Experience
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontSize: "clamp(52px, 8vw, 90px)",
          color: "#fff",
          margin: "0 0 8px",
          lineHeight: 1,
          fontWeight: "900",
        }}>
          SOLE<span style={{ color: "#00d4ff" }}>VERSE</span>
        </h1>
        <p style={{ color: "#666", fontSize: "clamp(14px, 2vw, 18px)", maxWidth: "520px", lineHeight: 1.7, fontFamily: "monospace", margin: "16px auto 40px" }}>
          Explore the future of footwear in immersive 3D. Rotate, customize, and step into a new dimension.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onShopNow} style={{
            padding: "16px 40px",
            background: "linear-gradient(135deg, #00d4ff, #0099cc)",
            border: "none", borderRadius: "50px",
            color: "#000", fontWeight: "800", fontSize: "15px",
            letterSpacing: "1px", cursor: "pointer",
            boxShadow: "0 0 40px rgba(0, 212, 255, 0.4)",
            transition: "all 0.3s", fontFamily: "monospace",
          }}
            onMouseEnter={e => e.target.style.transform = "translateY(-3px) scale(1.02)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0) scale(1)"}
          >
            Shop Now →
          </button>
          <button style={{
            padding: "16px 40px",
            background: "transparent",
            border: "1px solid #333", borderRadius: "50px",
            color: "#aaa", fontWeight: "600", fontSize: "15px",
            cursor: "pointer", transition: "all 0.3s", fontFamily: "monospace",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#00d4ff"; e.target.style.color = "#00d4ff"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#aaa"; }}
          >
            View Lookbook
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "48px", justifyContent: "center", marginTop: "60px", flexWrap: "wrap" }}>
          {[["12K+", "Happy Customers"], ["6", "Exclusive Brands"], ["100%", "3D Rendered"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: "24px", fontWeight: "700" }}>{num}</div>
              <div style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ cart, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = async () => {
    if (!form.name || !form.email) { alert("Please fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ product_id: i.id, size: i.size, color: i.color, quantity: i.quantity })),
          total,
          ...form
        })
      });
      const data = await res.json();
      onSuccess(data.order_id);
    } catch (e) {
      // Demo mode
      onSuccess("DEMO-" + Math.random().toString(36).substr(2, 6).toUpperCase());
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(145deg, #0f0f1a, #13131f)",
        border: "1px solid #1e1e2e", borderRadius: "24px",
        padding: "40px", width: "100%", maxWidth: "480px"
      }}>
        <h2 style={{ color: "#fff", fontFamily: "'Georgia', serif", marginTop: 0, fontSize: "24px" }}>Complete Order</h2>
        <p style={{ color: "#666", fontSize: "13px" }}>Order total: <span style={{ color: "#00d4ff", fontWeight: "700" }}>${total.toFixed(2)}</span></p>
        
        {["name", "email"].map(field => (
          <div key={field} style={{ marginBottom: "16px" }}>
            <label style={{ color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px", fontFamily: "monospace" }}>{field}</label>
            <input
              type={field === "email" ? "email" : "text"}
              placeholder={field === "name" ? "Your full name" : "your@email.com"}
              value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              style={{
                width: "100%", padding: "12px 16px",
                background: "#1a1a2e", border: "1px solid #2a2a3e",
                borderRadius: "12px", color: "#fff", fontSize: "14px",
                outline: "none", boxSizing: "border-box", fontFamily: "monospace"
              }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid #333", borderRadius: "12px", color: "#888", cursor: "pointer", fontFamily: "monospace" }}>Cancel</button>
          <button onClick={handleOrder} disabled={loading} style={{
            flex: 2, padding: "14px",
            background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
            border: "none", borderRadius: "12px",
            color: "#fff", fontWeight: "800", cursor: "pointer",
            fontSize: "14px", letterSpacing: "1px", fontFamily: "monospace",
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("hero"); // hero | shop
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (cat, q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "All") params.set("category", cat);
      if (q) params.set("search", q);
      const res = await fetch(`http://localhost:8000/products?${params}`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      // Static fallback products for demo
      setProducts([
        { id:"1", name:"AirEdge Pro X", brand:"NIKE", price:189.99, original_price:240.00, category:"Running", colors:["#FF3A3A","#1A1A2E","#F5F5F5"], sizes:[7,8,9,10,11], description:"Revolutionary cushioning technology meets aerodynamic design.", rating:4.9, reviews:2847, in_stock:true, tags:["bestseller","new"] },
        { id:"2", name:"Velocity Storm", brand:"ADIDAS", price:159.99, original_price:null, category:"Training", colors:["#00D4FF","#FF8C00","#2D2D2D"], sizes:[7,8,9,10,11], description:"Built for athletes who refuse limits.", rating:4.7, reviews:1523, in_stock:true, tags:["trending"] },
        { id:"3", name:"CloudWalk Elite", brand:"ON", price:219.99, original_price:260.00, category:"Lifestyle", colors:["#E8D5B7","#4A4E69","#C9B99A"], sizes:[6,7,8,9,10], description:"Swiss engineering meets street style.", rating:4.8, reviews:983, in_stock:true, tags:["premium","sale"] },
        { id:"4", name:"NightRacer Neon", brand:"PUMA", price:129.99, original_price:null, category:"Running", colors:["#39FF14","#FF006E","#0D0D0D"], sizes:[7,8,9,10,11,12], description:"Own the night with maximum visibility.", rating:4.6, reviews:754, in_stock:true, tags:["new","trending"] },
        { id:"5", name:"UrbanGrip Low", brand:"VANS", price:89.99, original_price:110.00, category:"Skateboarding", colors:["#F5F5F5","#1C1C1C","#D62828"], sizes:[6,7,8,9,10], description:"Legendary grip. Iconic style.", rating:4.5, reviews:3241, in_stock:true, tags:["classic","sale"] },
        { id:"6", name:"TerraForce GTX", brand:"SALOMON", price:249.99, original_price:null, category:"Trail", colors:["#2D6A4F","#F4A261","#264653"], sizes:[7,8,9,10,11,12], description:"Conquer any terrain.", rating:4.9, reviews:621, in_stock:true, tags:["premium","bestseller"] },
      ]);
      setCategories(["All","Running","Training","Lifestyle","Skateboarding","Trail"]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (page === "shop") fetchProducts(activeCategory, search);
  }, [page, activeCategory, search]);

  useEffect(() => {
    fetch("http://localhost:8000/categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories(["All","Running","Training","Lifestyle","Skateboarding","Trail"]));
  }, []);

  const addToCart = (product, size, color, qty = 1) => {
    setCart(c => [...c, { ...product, size, color, quantity: qty }]);
  };

  const filtered = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "#060609", minHeight: "100vh", fontFamily: "'Space Mono', monospace, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a10; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: "rgba(6,6,9,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1e1e2e",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        <div onClick={() => setPage("hero")} style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" }}>
          SOLE<span style={{ color: "#00d4ff" }}>VERSE</span>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {["hero", "shop"].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: "none", border: "none",
              color: page === p ? "#00d4ff" : "#666",
              fontSize: "12px", cursor: "pointer", textTransform: "uppercase",
              letterSpacing: "2px", fontWeight: "700", fontFamily: "monospace",
              transition: "color 0.2s",
            }}>
              {p === "hero" ? "Home" : "Shop"}
            </button>
          ))}
        </div>

        <button onClick={() => setCartOpen(true)} style={{
          background: cart.length > 0 ? "rgba(0, 212, 255, 0.1)" : "transparent",
          border: `1px solid ${cart.length > 0 ? "#00d4ff44" : "#2a2a3e"}`,
          borderRadius: "12px",
          padding: "8px 16px",
          color: cart.length > 0 ? "#00d4ff" : "#666",
          cursor: "pointer", fontSize: "13px", fontFamily: "monospace",
          display: "flex", alignItems: "center", gap: "8px",
          transition: "all 0.2s"
        }}>
          🛒 {cart.length > 0 ? <span style={{ background: "#00d4ff", color: "#000", borderRadius: "50%", width: "18px", height: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>{cart.length}</span> : "Cart"}
        </button>
      </nav>

      {/* Pages */}
      {page === "hero" && (
        <div style={{ paddingTop: "64px" }}>
          <HeroSection onShopNow={() => setPage("shop")} />
        </div>
      )}

      {page === "shop" && (
        <div style={{ paddingTop: "64px", minHeight: "100vh" }}>
          {/* Shop Header */}
          <div style={{ background: "linear-gradient(180deg, #0a0a14 0%, #060609 100%)", borderBottom: "1px solid #1e1e2e", padding: "40px 40px 30px" }}>
            <h1 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: "900", margin: "0 0 8px" }}>
              All Shoes
            </h1>
            <p style={{ color: "#555", fontFamily: "monospace", fontSize: "12px", margin: "0 0 24px", letterSpacing: "1px" }}>
              {filtered.length} PRODUCTS · 3D INTERACTIVE
            </p>

            {/* Search */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "240px", maxWidth: "400px" }}>
                <input
                  placeholder="Search shoes, brands..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px 12px 40px",
                    background: "#111120", border: "1px solid #2a2a3e",
                    borderRadius: "12px", color: "#fff", fontSize: "13px",
                    outline: "none", fontFamily: "monospace"
                  }}
                />
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#555" }}>🔍</span>
              </div>

              {/* Category filters */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: "10px 18px",
                    background: activeCategory === cat ? "rgba(0, 212, 255, 0.15)" : "transparent",
                    border: `1px solid ${activeCategory === cat ? "#00d4ff" : "#2a2a3e"}`,
                    borderRadius: "25px",
                    color: activeCategory === cat ? "#00d4ff" : "#666",
                    fontSize: "12px", cursor: "pointer", fontFamily: "monospace",
                    letterSpacing: "0.5px", fontWeight: activeCategory === cat ? "700" : "400",
                    transition: "all 0.2s"
                  }}>{cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#555", padding: "80px", fontFamily: "monospace" }}>Loading 3D models...</div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px"
              }}>
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onClick={setSelectedProduct} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {cartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={i => setCart(c => c.filter((_, idx) => idx !== i))}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={orderId => {
            setCheckoutOpen(false);
            setCart([]);
            setSuccessOrder(orderId);
          }}
        />
      )}

      {successOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", background: "linear-gradient(145deg, #0f0f1a, #13131f)", border: "1px solid #00d4ff22", borderRadius: "28px", padding: "60px 40px", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: "28px", margin: "0 0 8px" }}>Order Confirmed!</h2>
            <p style={{ color: "#666", fontFamily: "monospace" }}>Order ID: <span style={{ color: "#00d4ff", fontWeight: "700" }}>{successOrder}</span></p>
            <p style={{ color: "#555", fontSize: "13px", fontFamily: "monospace" }}>Your kicks are on the way 🚀</p>
            <button onClick={() => { setSuccessOrder(null); setPage("shop"); }} style={{
              marginTop: "24px", padding: "14px 36px",
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              border: "none", borderRadius: "12px",
              color: "#fff", fontWeight: "700", cursor: "pointer",
              fontSize: "14px", fontFamily: "monospace"
            }}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
