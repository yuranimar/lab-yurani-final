/**
 * LAB EFFECTS - YURANI MARTÍNEZ
 * Versión FINAL PRO — BUGS CORREGIDOS
 *
 * Correcciones aplicadas:
 * 1. closePremiumModal() movida a scope global (evita ReferenceError en handler ESC)
 * 2. wind() ya no usa transform+= (evita conflicto con 3D hover)
 * 3. wind() y setInterval de shooting stars se pausan con IntersectionObserver
 *    cuando la card sale del viewport (evita memory leak y loops infinitos)
 * 4. Segundo DOMContentLoaded duplicado eliminado (footer cards ya no se duplican)
 * 5. Scroll listener duplicado del back-to-top eliminado
 * 6. Variable CSS --accent definida en :root (styles.css)
 */

/* =========================================
   FUNCIONES GLOBALES
   Deben estar fuera del DOMContentLoaded
   porque se llaman desde atributos onclick.
========================================= */

function openModal(service) {
    const modal       = document.getElementById("contactModal");
    const serviceName = document.getElementById("serviceName");
    const whatsappBtn = document.getElementById("whatsappBtn");
    if (!modal || !serviceName || !whatsappBtn) return;

    serviceName.textContent = "Servicio seleccionado: " + service;
    const message = `Hola, estoy interesad@ en el servicio: ${service}`;
    /* Número ofuscado — no queda expuesto como string plano */
    const _p = ["57","314","747","0060"].join("");
    whatsappBtn.href = `https://wa.me/${_p}?text=${encodeURIComponent(message)}`;
    modal.style.display = "flex";

    if (typeof gsap !== "undefined") {
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
    showToast("Abriendo WhatsApp para: " + service);
}

/* Cerrar modal de contacto */
function closeModal() {
    const modal = document.getElementById("contactModal");
    if (!modal) return;
    if (typeof gsap !== "undefined") {
        gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => { modal.style.display = "none"; } });
    } else {
        modal.style.display = "none";
    }
}

/* Cerrar menú móvil — usado desde onclick y teclado */
function closeMobileMenu() {
    const hamburger  = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
}

/* Mostrar un toast simple (usado para feedback de acciones) */
function showToast(msg) {
    const toast    = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-msg");
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    if (typeof gsap !== "undefined") {
        gsap.fromTo(toast,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
        setTimeout(() => gsap.to(toast, { opacity: 0, y: 20, duration: 0.4 }), 3000);
    }
}

/* Aplicar tema claro u oscuro */
function applyTheme(isLight) {
    /* styles.css usa body.light-mode */
    document.body.classList.toggle("light-mode", isLight);
    /* Inline <style> del HTML usa [data-theme="light"] en <html> */
    if (isLight) {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    const themeIcon       = document.getElementById("themeIcon");
    const themeToggleDemo = document.getElementById("themeToggleDemo");
    if (themeIcon) themeIcon.className = isLight ? "bi bi-moon-fill" : "bi bi-sun-fill";
    if (themeToggleDemo) {
        themeToggleDemo.innerHTML = isLight
            ? '<i class="bi bi-moon-fill"></i> Modo oscuro activo'
            : '<i class="bi bi-sun-fill"></i> Probar el efecto aquí';
    }
    localStorage.setItem("theme", isLight ? "light" : "dark");
    if (typeof gsap !== "undefined") {
        gsap.from("body", { opacity: 0.7, duration: 0.4, ease: "power2.out" });
    }
}



/* ── Gestor unificado de tecla ESC ─────────────────────────────── */
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    /* Lightbox */
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('open')) {
        lightbox.classList.remove('open');
        return;
    }
    /* Modal premium */
    const premiumModal = document.getElementById('premiumModal');
    if (premiumModal && premiumModal.style.display !== 'none') {
        closePremiumModal();
        return;
    }
    /* Modal contacto */
    const contactModal = document.getElementById('contactModal');
    if (contactModal && contactModal.style.display === 'flex') {
        closeModal();
        return;
    }
    /* Menú móvil */
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
        const hamburger = document.getElementById('hamburger');
        if (hamburger) hamburger.focus();
        return;
    }
});

/* Cerrar modal al hacer clic fuera del panel */
window.addEventListener("click", (e) => {
    const modal = document.getElementById("contactModal");
    if (modal && e.target === modal) closeModal();
});

/* =========================================
   BARRA DE PROGRESO DE SCROLL (con rAF throttle)
========================================= */
let _scrollRafPending = false;
window.addEventListener("scroll", () => {
    if (_scrollRafPending) return;
    _scrollRafPending = true;
    requestAnimationFrame(() => {
        const bar = document.getElementById("scrollProgress");
        if (bar) {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
        }
        /* Back to top */
        const btn = document.getElementById("backToTop");
        if (btn) btn.classList.toggle("visible", window.scrollY > 400);
        _scrollRafPending = false;
    });
}, { passive: true });

/* =========================================
   TODO LO DEMÁS DENTRO DEL DOMContentLoaded
========================================= */
document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Catálogo de efectos activo");
    document.body.classList.add("js-loaded");

    /* — Registrar plugins GSAP — */
    if (typeof gsap !== "undefined") {
        if (typeof ScrollTrigger  !== "undefined") gsap.registerPlugin(ScrollTrigger);
        if (typeof ScrollToPlugin !== "undefined") gsap.registerPlugin(ScrollToPlugin);
    }

    /* =========================================
       00. LOADER
    ========================================= */
    const loader     = document.getElementById("loader");
    const loaderFill = document.querySelector(".loader-fill");

    /* Timeout de seguridad: si GSAP tarda o falla, el loader desaparece igual */
    const _hideLoader = () => {
        if (!loader) return;
        loader.style.transition = "opacity 0.4s";
        loader.style.opacity = "0";
        setTimeout(() => { loader.style.display = "none"; }, 450);
    };
    const _loaderTimer = setTimeout(_hideLoader, 2000);

    if (loader && loaderFill && typeof gsap !== "undefined") {
        gsap.to(loaderFill, {
            width: "100%", duration: 1.4, ease: "power2.inOut",
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0, duration: 0.5, delay: 0.2,
                    onComplete: () => { loader.style.display = "none"; clearTimeout(_loaderTimer); }
                });
            }
        });
    } else if (loader) {
        _hideLoader();
        clearTimeout(_loaderTimer);
    }

    /* =========================================
       TYPEWRITER
    ========================================= */
    const typeEl = document.getElementById("typewriter");
    const frases = ["Animaciones UI", "Efectos con GSAP", "Scroll interactivo", "Experiencias web"];

    if (typeEl) {
        let i = 0, j = 0, borrar = false;
        function type() {
            const frase = frases[i];
            if (!borrar) {
                typeEl.textContent = frase.slice(0, ++j);
                if (j === frase.length) { borrar = true; setTimeout(type, 1800); return; }
            } else {
                typeEl.textContent = frase.slice(0, --j);
                if (j === 0) { borrar = false; i = (i + 1) % frases.length; }
            }
            setTimeout(type, borrar ? 45 : 90);
        }
        setTimeout(type, 1800);
    }

/* =========================================
   TEMA (PRO FINAL)
========================================= */

const savedTheme = localStorage.getItem("theme");

let isLight;

if (savedTheme === "light") {
  isLight = true;
} else if (savedTheme === "dark") {
  isLight = false;
} else {
  isLight = window.matchMedia("(prefers-color-scheme: light)").matches;
}

applyTheme(isLight);

// Botones
const themeToggles = document.querySelectorAll("[data-theme-toggle]");

themeToggles.forEach(btn => {
  btn.addEventListener("click", () => {
    const currentlyLight = !document.body.classList.contains("light-mode");
    applyTheme(currentlyLight);
  });
});
/* =========================================
   MENÚ HAMBURGUESA (VERSIÓN PRO)
========================================= */

const hamburger  = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar    = document.querySelector(".sidebar");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenu.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";

    if (isOpen) {
      /* Animación de links */
      if (typeof gsap !== "undefined") {
        gsap.fromTo(".mobile-nav a",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: "power3.out" }
        );
      }
      /* Focus accesible */
      setTimeout(() => {
        const firstLink = mobileMenu.querySelector("a");
        if (firstLink) firstLink.focus();
      }, 150);
    }
  });

/* ESC mobileMenu — gestionado por el handler unificado */
}
 
/* Cerrar sidebar al hacer clic en un link en móvil */
document.querySelectorAll(".side-nav a").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  });
});

/* Cerrar al hacer clic en un link */
/* closeMobileMenu — ver definición global arriba */
    /* =========================================
       PARTÍCULAS
    ========================================= */
    if (typeof particlesJS !== "undefined" && document.getElementById("particles-js")) {
        particlesJS("particles-js", {
            particles: {
                number: { value: 60 },
                size: { value: 3 },
                move: { speed: 1 },
                line_linked: { enable: true },
                color: { value: "#10b981" }
            }
        });
    }

    /* =========================================
       VANTA — solo si existe el elemento y la lib
    ========================================= */
    if (typeof VANTA !== "undefined" && document.getElementById("vanta-canvas")) {
        VANTA.CLOUDS({
            el: "#vanta-canvas",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            backgroundColor: 0x050505,
            skyColor: 0x1a1a2e,
            cloudColor: 0x3b3b58,
            cloudShadowColor: 0x0,
            sunColor: 0xff3f81,
            sunGlareColor: 0xff3f81,
            sunlightColor: 0xff9a9e,
            speed: 1.0
        });
        /* Vanta cargó OK — ocultar el fallback CSS */
        const fallback = document.getElementById("sobre-mi-fallback");
        if (fallback) fallback.style.display = "none";
    }

    /* — A partir de aquí todo requiere GSAP — */
    if (typeof gsap === "undefined") {
        console.warn("⚠️ GSAP no cargado — mostrando contenido sin animaciones");
        document.querySelectorAll(".reveal-stagger, .reveal-text, .lab-article, .card-demo").forEach(el => {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    /* =========================================
       01. HERO REVEAL
       gsap.set primero = siempre visible aunque
       la animación from tarde o falle
    ========================================= */
    if (document.querySelector(".reveal-stagger")) {
        gsap.set(".reveal-stagger", { opacity: 1, y: 0 });
        gsap.from(".reveal-stagger", {
            opacity: 0, y: 60, duration: 1.0,
            ease: "power3.out", stagger: 0.2,
            clearProps: "all"
        });
    }

    /* =========================================
       02. SECCIONES
    ========================================= */
    if (typeof ScrollTrigger !== "undefined") {
        gsap.utils.toArray(".lab-article").forEach(section => {
            gsap.from(section, {
                scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
                opacity: 0, y: 80, duration: 1, ease: "power2.out"
            });
        });
    }

    /* =========================================
       03. CARDS SCROLL
    ========================================= */
    if (typeof ScrollTrigger !== "undefined") {
        gsap.fromTo(".card-demo",
            { opacity: 0, y: 80, scale: 0.95 },
            { scrollTrigger: { trigger: ".scroll-container", start: "top 80%" }, opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
        );
    }

    document.querySelectorAll(".card-demo").forEach(card => {
        let _rafCard = false;
        card.addEventListener("mousemove", (e) => {
            if (_rafCard) return;
            _rafCard = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--x", (e.clientX - rect.left) + "px");
                card.style.setProperty("--y", (e.clientY - rect.top)  + "px");
                _rafCard = false;
            });
        }, { passive: true });
    });

    /* =========================================
       04. GEOMETRÍA
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".geometry-icon")) {
        gsap.to(".geometry-icon", {
            scrollTrigger: { trigger: "#sesion-1", start: "top center", end: "bottom center", scrub: 1.5 },
            rotate: 360, scale: 1.2, opacity: 0.7, ease: "none"
        });
    }

    /* =========================================
       05. TEXTO REVEAL
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector("#sesion-1 .reveal-text")) {
        gsap.from("#sesion-1 .reveal-text", {
            scrollTrigger: { trigger: "#sesion-1", start: "top 80%", toggleActions: "play none none none" },
            opacity: 0, y: 60, scale: 0.95, duration: 1.2, stagger: 0.25, ease: "power4.out"
        });
    }

    /* =========================================
       06. ICONO
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector("#sesion-1 .geometry-icon")) {
        gsap.from("#sesion-1 .geometry-icon", {
            scrollTrigger: { trigger: "#sesion-1", start: "top 75%" },
            opacity: 0, scale: 0, rotate: -180, duration: 1.2, ease: "back.out(1.7)"
        });
    }

    /* =========================================
       07. GLOW
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".bg-element")) {
        gsap.to(".bg-element", {
            scrollTrigger: { trigger: ".scroll-container", start: "top top", end: "bottom bottom", scrub: 2 },
            scale: 2.5, opacity: 0.7, x: "20%", y: "-10%", filter: "blur(80px)"
        });
    }

    /* =========================================
       08. HOVER CARDS
    ========================================= */
    document.querySelectorAll(".card-hover").forEach(card => {
        card.addEventListener("mouseenter", () => gsap.to(card, { scale: 1.05, duration: 0.3, ease: "power2.out", overwrite: "auto" }));
        card.addEventListener("mouseleave", () => gsap.to(card, { scale: 1,    duration: 0.3, ease: "power2.out", overwrite: "auto" }));
    });

    /* =========================================
       09. BOTÓN SCROLL
    ========================================= */
    const heroBtn = document.querySelector(".btn-main");
    if (heroBtn && typeof ScrollToPlugin !== "undefined") {
        heroBtn.addEventListener("click", () => {
            gsap.to(window, { scrollTo: "#sesion-1", duration: 1.2, ease: "power2.inOut" });
        });
    }

  /* =========================================
   NAV ACTIVO (SCROLL)
========================================= */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".side-nav a");

function updateActiveNav() {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (
      window.scrollY >= sectionTop - 120 &&
      window.scrollY < sectionTop + sectionHeight - 120
    ) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`
    );
  });
}

/* Scroll optimizado */
let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateActiveNav();
      ticking = false;
    });
    ticking = true;
  }
});

/* Ejecutar al cargar */
window.addEventListener("load", updateActiveNav);



/* =========================================
   CLICK NAV (UX + MOBILE)
========================================= */

navLinks.forEach(link => {
  link.addEventListener("click", function () {

    // Activar inmediatamente
    navLinks.forEach(l => l.classList.remove("active"));
    this.classList.add("active");

    // Cerrar menú en móvil
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  });
});



/* =========================================
   NAV GROUP (ACORDEÓN FINAL)
========================================= */

const navTitles = document.querySelectorAll(".nav-title");

navTitles.forEach(btn => {
  btn.addEventListener("click", function () {

    const group = this.parentElement;

    // Si está abierto → cerrar
    if (group.classList.contains("open")) {
      group.classList.remove("open");
      this.setAttribute("aria-expanded", "false");
      return;
    }

    // Cerrar todos
    document.querySelectorAll(".nav-group").forEach(g => {
      g.classList.remove("open");
      const b = g.querySelector(".nav-title");
      if (b) b.setAttribute("aria-expanded", "false");
    });

    // Abrir actual
    group.classList.add("open");
    this.setAttribute("aria-expanded", "true");

  });
});



/* =========================================
   MAGNETIC BUTTONS (SUAVE)
   Solo aplica a botones de demo/acción,
   NO a botones dentro de formularios reales
   (#formDemo, .form-card, #sesion-form)
========================================= */
if (typeof gsap !== "undefined") {

  /* Selecciona btn-main y btn-demo pero excluye
     los que están dentro de formularios funcionales */
  const magnetBtns = [...document.querySelectorAll(".btn-main, .btn-demo")].filter(btn =>
    !btn.closest("#formDemo") &&
    !btn.closest(".form-card") &&
    !btn.closest(".mini-subscribe")
  );

  magnetBtns.forEach(btn => {

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - rect.left - rect.width / 2) * 0.25,
        y: (e.clientY - rect.top - rect.height / 2) * 0.25,
        duration: 0.25,
        ease: "power2.out"
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)"
      });
    });

  });

}



/* =========================================
   STACK ANIMATION (SAFE)
========================================= */

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

  if (document.querySelector(".stack-grid")) {

    gsap.fromTo(".stack-item",
      { opacity: 0, y: 40, scale: 0.85 },
      {
        scrollTrigger: {
          trigger: ".stack-grid",
          start: "top 85%"
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.4)"
      }
    );

  }

}
    /* =========================================
       SCROLLYTELLING
    ========================================= */
    const storySteps   = document.querySelectorAll(".story-step");
    const storyCaption = document.getElementById("story-caption");

    if (storySteps.length && storyCaption && typeof ScrollTrigger !== "undefined") {
        function updateStory(step, dir) {
            storySteps.forEach(s => s.classList.remove("active"));
            step.classList.add("active");
            gsap.to(storyCaption, {
                opacity: 0, y: dir, duration: 0.2,
                onComplete: () => {
                    storyCaption.textContent = step.dataset.caption;
                    gsap.to(storyCaption, { opacity: 1, y: 0, duration: 0.3 });
                }
            });
        }
        storySteps.forEach(step => {
            ScrollTrigger.create({
                trigger: step, start: "top center", end: "bottom center",
                onEnter: () => updateStory(step, -10),
                onEnterBack: () => updateStory(step, 10)
            });
        });
    }

    /* =========================================
       PARALLAX
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".parallax-scene")) {
        [{ sel: ".layer-back", y: -80, scrub: 1 }, { sel: ".layer-mid", y: -40, scrub: 1.5 }, { sel: ".layer-front", y: -15, scrub: 2 }]
            .forEach(({ sel, y, scrub }) => {
                gsap.to(sel, { scrollTrigger: { trigger: ".parallax-scene", start: "top bottom", end: "bottom top", scrub }, y, ease: "none" });
            });
    }

    /* =========================================
       3D TILT
    ========================================= */
    document.querySelectorAll(".tilt-card").forEach(card => {
        const inner = card.querySelector(".tilt-inner");
        let _rafTilt = false;
        card.addEventListener("mousemove", (e) => {
            if (_rafTilt) return;
            _rafTilt = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                gsap.to(inner, {
                    rotateY:  ((e.clientX - rect.left) / rect.width  - 0.5) * 20,
                    rotateX: -((e.clientY - rect.top)  / rect.height - 0.5) * 20,
                    duration: 0.4, ease: "power2.out", transformPerspective: 800
                });
                _rafTilt = false;
            });
        }, { passive: true });
        card.addEventListener("mouseleave", () => {
            gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        });
    });

    /* =========================================
       CONTADORES
    ========================================= */
    if (typeof ScrollTrigger !== "undefined") {
        document.querySelectorAll(".counter-number").forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const card   = counter.closest(".counter-card");
            ScrollTrigger.create({
                trigger: counter, start: "top 85%", once: true,
                onEnter: () => {
                    card.classList.add("counted");
                    gsap.to({ val: 0 }, {
                        val: target, duration: 2, ease: "power2.out",
                        onUpdate: function () { counter.textContent = Math.round(this.targets()[0].val); }
                    });
                }
            });
        });
    }

    /* =========================================
       TIMELINE — animación unificada (sin duplicado)
    ========================================= */
    if (typeof ScrollTrigger !== "undefined") {
        document.querySelectorAll(".timeline-item").forEach((item, i) => {
            ScrollTrigger.create({
                trigger: item, start: "top 85%", once: true,
                onEnter: () => {
                    gsap.to(item, {
                        opacity: 1, x: 0, duration: 0.7, delay: i * 0.1, ease: "power3.out",
                        onStart: () => item.classList.add("visible")
                    });
                }
            });
        });
    }

    /* =========================================
       FORMULARIO
    ========================================= */
    const formDemo    = document.getElementById("formDemo");
    const formSuccess = document.getElementById("formSuccess");

    if (formDemo) {
        formDemo.querySelectorAll(".form-input").forEach(input => {
            const line = input.parentElement.querySelector(".form-line");
            input.addEventListener("focus", () => { if (line) gsap.to(line, { width: "100%", duration: 0.35, ease: "power2.out" }); });
            input.addEventListener("blur",  () => {
                const group = input.closest(".form-group");
                if (line && !input.value) gsap.to(line, { width: "0%", duration: 0.35 });
                if (input.hasAttribute("required") && !input.value.trim()) {
                    group.classList.add("invalid"); group.classList.remove("valid");
                } else if (input.type === "email" && input.value && !input.value.includes("@")) {
                    group.classList.add("invalid"); group.classList.remove("valid");
                } else if (input.value.trim()) {
                    group.classList.remove("invalid"); group.classList.add("valid");
                }
            });
        });

        formDemo.addEventListener("submit", (e) => {
            e.preventDefault();
            let valid = true;
            formDemo.querySelectorAll("[required]").forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.closest(".form-group").classList.add("invalid");
                    gsap.to(input, { x: [-6, 6, -4, 4, 0], duration: 0.4, ease: "none" });
                }
            });
            if (!valid) return;
            gsap.to(formDemo, {
                opacity: 0, y: -20, duration: 0.4,
                onComplete: () => {
                    formDemo.style.display = "none";
                    formSuccess.style.display = "flex";
                    gsap.from(formSuccess, { opacity: 0, y: 30, duration: 0.5, ease: "power3.out" });
                }
            });
        });
    }

    /* =========================================
   GALERÍA + LIGHTBOX (VERSIÓN PRO)
========================================= */

const lightbox = document.getElementById("lightbox");

if (lightbox) {
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDesc  = document.getElementById("lightboxDesc");
  const lightboxTech  = document.getElementById("lightboxTech");
  const lightboxIcon  = document.getElementById("lightboxIcon");

  const overlay = lightbox.querySelector(".lightbox-overlay");
  const panel   = lightbox.querySelector(".lightbox-panel");

  const iconMap = {
    "Partículas": "bi bi-circle-fill",
    "Scroll Reveal": "bi bi-eye-fill",
    "3D Tilt": "bi bi-box-fill",
    "Cursor": "bi bi-cursor-fill",
    "Parallax": "bi bi-layers-fill",
    "Magnetic": "bi bi-magnet-fill"
  };

  /* =========================================
     ABRIR LIGHTBOX
  ========================================= */
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {

      const caption = item.querySelector(".gallery-caption span")?.textContent;

      lightboxTitle.textContent = item.dataset.title || "";
      lightboxDesc.textContent  = item.dataset.desc  || "";
      lightboxTech.textContent  = item.dataset.tech  || "";

      lightboxIcon.className = iconMap[caption] || "bi bi-image";

      lightbox.classList.add("open");

      if (typeof gsap !== "undefined") {
        gsap.fromTo(panel,
          { opacity: 0, scale: 0.85, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
        );
      }
    });
  });

  /* =========================================
     CERRAR LIGHTBOX
  ========================================= */
  function closeLightbox() {

    if (typeof gsap !== "undefined") {
      gsap.to(panel, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.3,
        onComplete: () => lightbox.classList.remove("open")
      });
    } else {
      lightbox.classList.remove("open");
    }
  }

  /* =========================================
     EVENTOS DE CIERRE
  ========================================= */

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (overlay) {
    overlay.addEventListener("click", closeLightbox);
  }

/* ESC lightbox — gestionado por el handler unificado */

  /* =========================================
     ANIMACIÓN SCROLL
  ========================================= */

  if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
    gsap.fromTo(".gallery-item",
      { opacity: 0, scale: 0.85, y: 30 },
      {
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 85%"
        },
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(1.2)"
      }
    );
  }
}

    /* =========================================
       PORTAFOLIO
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".portfolio-track")) {
        gsap.fromTo(".portfolio-card",
            { opacity: 0, x: 60 },
            { scrollTrigger: { trigger: ".portfolio-track-wrapper", start: "top 85%" }, opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }
        );
    }

    /* Portfolio expand buttons — abrir modal con detalles del proyecto */
    const portfolioData = [
        { title: "Catálogo de Efectos UI", tag: "HTML · CSS · GSAP", desc: "Laboratorio interactivo con más de 25 efectos UI implementados en tiempo real. Demuestra animaciones complejas, transiciones y microinteracciones.", result: "Portfolio técnico completo que convence a clientes sobre capacidades avanzadas de frontend." },
        { title: "Landing E-commerce", tag: "JavaScript · ScrollTrigger", desc: "Landing page de producto diseñada para guiar al usuario desde el descubrimiento hasta la conversión. Con storytelling visual y CTA optimizados.", result: "Aumento del 40% en tasa de clics al CTA versus un diseño estándar." },
        { title: "Dashboard de Métricas", tag: "GSAP · Canvas · Chart.js", desc: "Panel de análisis con gráficas animadas, indicadores en tiempo real y filtros interactivos. Optimizado para lectura rápida de KPIs.", result: "Reducción del 60% en tiempo de interpretación de datos para el equipo." },
        { title: "App Móvil Fitness", tag: "CSS · Microinteracciones", desc: "Interfaz de entrenamiento con feedback visual háptico, timers animados y sistema de progreso gamificado para mantener la motivación.", result: "Retención de usuarios aumentó un 55% gracias al sistema de feedback visual." },
        { title: "Portal Corporativo", tag: "GSAP · ScrollTrigger · A11y", desc: "Sitio institucional con animaciones de scroll, secciones parallax accesibles y formulario de contacto con validación en tiempo real.", result: "Tiempo en página aumentó de 1:20 a 3:45 minutos tras rediseño animado." }
    ];

    document.querySelectorAll(".portfolio-btn-expand").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index) || 0;
            const data = portfolioData[idx] || portfolioData[0];
            openPremiumModal('default');
            setTimeout(() => {
                const content = document.getElementById('premiumModalContent');
                if (content) content.innerHTML = `
                  <div class="pmodal-default">
                    <span class="cprev-badge" style="margin-bottom:12px;display:inline-block;">${data.tag}</span>
                    <h3 style="margin:0 0 12px;">${data.title}</h3>
                    <p style="color:var(--texto-secundario);font-size:14px;line-height:1.6;margin:0 0 16px;">${data.desc}</p>
                    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
                      <p style="margin:0;font-size:13px;color:var(--verde-400);">✅ <strong>Resultado:</strong> ${data.result}</p>
                    </div>
                    <div style="display:flex;gap:10px;">
                      <button class="btn-main" onclick="closePremiumModal()" style="flex:1">Ver proyecto →</button>
                      <button class="btn-demo" onclick="closePremiumModal()" style="flex:1">Cerrar</button>
                    </div>
                  </div>`;
            }, 50);
        });
    });

    document.querySelectorAll(".estudio-header").forEach(header => {
        header.addEventListener("click", () => {
            const card   = header.closest(".estudio-card");
            const isOpen = card.classList.contains("open");
            document.querySelectorAll(".estudio-card").forEach(c => c.classList.remove("open"));
            if (!isOpen) {
                card.classList.add("open");
                gsap.from(card.querySelector(".estudio-content"), { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" });
            }
        });
    });

    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".estudios-grid")) {
        gsap.fromTo(".estudio-card",
            { opacity: 0, y: 40 },
            { scrollTrigger: { trigger: ".estudios-grid", start: "top 85%" }, opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }
        );
    }

    /* =========================================
       FLIP 3D
    ========================================= */
    if (typeof ScrollTrigger !== "undefined" && document.querySelector(".flip-grid")) {
        gsap.fromTo(".flip-card",
            { opacity: 0, y: 50, rotateY: -15 },
            { scrollTrigger: { trigger: ".flip-grid", start: "top 85%" }, opacity: 1, y: 0, rotateY: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }
        );
    }

    /* =========================================
       EDITOR DE CÓDIGO EN VIVO
    ========================================= */
    const codeOutput = document.getElementById("codeOutput");

    const codeLines = [
  { text: "// Animación que guía la atención del usuario\n\n", cls: "cm" },

  { text: "gsap", cls: "obj" },
  { text: ".", cls: "" },
  { text: "fromTo", cls: "fn" },
  { text: "(\".card\",\n", cls: "" },

  { text: "  { opacity: ", cls: "" },
  { text: "0", cls: "num" },
  { text: ", y: ", cls: "" },
  { text: "80", cls: "num" },
  { text: " },\n\n", cls: "" },

  { text: "  {\n", cls: "" },
  { text: "    scrollTrigger", cls: "kw" },
  { text: ": {\n", cls: "" },

  { text: "      trigger", cls: "kw" },
  { text: ": ", cls: "" },
  { text: '".container"', cls: "str" },
  { text: ",\n", cls: "" },

  { text: "      start", cls: "kw" },
  { text: ": ", cls: "" },
  { text: '"top 80%"', cls: "str" },
  { text: "\n    },\n\n", cls: "" },

  { text: "    opacity", cls: "kw" },
  { text: ": ", cls: "" },
  { text: "1", cls: "num" },
  { text: ",\n", cls: "" },

  { text: "    y", cls: "kw" },
  { text: ": ", cls: "" },
  { text: "0", cls: "num" },
  { text: ",\n", cls: "" },

  { text: "    duration", cls: "kw" },
  { text: ": ", cls: "" },
  { text: "1", cls: "num" },
  { text: ",\n", cls: "" },

  { text: "    stagger", cls: "kw" },
  { text: ": ", cls: "" },
  { text: "0.2\n", cls: "num" },

  { text: "  }\n);\n", cls: "" }
];

let started = false;

    ScrollTrigger.create({
      trigger: ".code-editor",
      start: "top 80%",
      once: true,

      onEnter: () => {
        if (started) return;
        started = true;

        let i = 0;

        function type() {
          if (i >= codeLines.length) return;

          const token = codeLines[i];
          const span = document.createElement("span");

          if (token.cls) span.className = token.cls;
          span.textContent = token.text;

          codeOutput.appendChild(span);

          i++;
          setTimeout(type, token.text.length * 20);
        }

        type();
      }
    });

    /* =========================================
       BOTÓN DEMO SCROLL
    ========================================= */
    const demoBtn = document.querySelector(".btn-demo");

    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        window.scrollBy({
          top: 300,
          behavior: "smooth"
        });
      });
    }

    /* =========================================
       TIMELINE ANIMATION — eliminado (unificado arriba)
    ========================================= */

    /* =========================================
       BOTÓN VOLVER ARRIBA
    ========================================= */
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            if (typeof gsap !== "undefined" && typeof ScrollToPlugin !== "undefined") {
                gsap.to(window, { scrollTo: 0, duration: 1, ease: "power2.inOut" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    /* =========================================
       FLIP CARDS — accesibilidad teclado
    ========================================= */
    document.querySelectorAll(".flip-card").forEach(card => {
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.querySelector(".flip-inner").style.transform =
                    card.querySelector(".flip-inner").style.transform === "rotateY(180deg)"
                        ? "" : "rotateY(180deg)";
            }
        });
    });

    /* =========================================
       PREFERS-REDUCED-MOTION — deshabilitar GSAP
    ========================================= */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof gsap !== "undefined") {
        gsap.globalTimeline.timeScale(0);
        console.info("♿ prefers-reduced-motion activo — animaciones deshabilitadas");
    }

    /* =========================================
       GSAP SCROLL REVEAL — nuevas secciones
    ========================================= */
    if (typeof ScrollTrigger !== 'undefined') {
        const newSections = [
            '#sesion-hscroll', '#sesion-svgpath', '#sesion-pin',
            '#sesion-scramble', '#sesion-marquee', '#sesion-drag',
            '#sesion-varfont', '#sesion-neon', '#sesion-trail',
            '#sesion-skeleton', '#sesion-liquid', '#sesion-modal'
        ];

        newSections.forEach(sel => {
            const el = document.querySelector(sel + ' .lab-article');
            if (!el) return;
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                  scrollTrigger: { trigger: sel, start: 'top 82%', once: true }
                }
            );
        });
    }

}); // fin DOMContentLoaded
/* ================================================================
   NUEVAS SECCIONES — YURANI MARTÍNEZ LAB
================================================================ */

/* ---------------------------------------------------------------
   ⑰ HORIZONTAL SCROLL — arrastrable + scroll nativo
--------------------------------------------------------------- */
(function initHScroll() {
    const wrapper = document.querySelector('.hscroll-wrapper');
    if (!wrapper) return;

    /* Drag to scroll en desktop */
    let isDown = false, startX, scrollLeft;
    wrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        wrapper.style.cursor = 'grabbing';
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeft = wrapper.scrollLeft;
    });
    wrapper.addEventListener('mouseleave', () => { isDown = false; wrapper.style.cursor = ''; });
    wrapper.addEventListener('mouseup',    () => { isDown = false; wrapper.style.cursor = ''; });
    wrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x    = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.5;
        wrapper.scrollLeft = scrollLeft - walk;
    });

    /* GSAP — animar scroll horizontal al entrar en viewport (sin pin, sin spacer) */
    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        const track = document.getElementById('hscrollTrack');
        if (!track) return;
        gsap.fromTo(track.querySelectorAll('.hscroll-card'),
            { opacity: 0, x: 60 },
            {
                opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#sesion-hscroll',
                    start: 'top 85%',
                    once: true
                }
            }
        );
    }
})();

/* ---------------------------------------------------------------
   ⑱ SVG PATH DRAWING — se dibuja al scroll
--------------------------------------------------------------- */
(function initSvgPath() {
    const path = document.getElementById('mainPath');
    if (!path || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const length = path.getTotalLength ? path.getTotalLength() : 800;
    path.style.strokeDasharray  = length;
    path.style.strokeDashoffset = length;

    gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '#sesion-svgpath',
            start: 'top 75%',
            end: 'bottom 50%',
            scrub: 0.8,
            onUpdate: (self) => {
                /* Aparición progresiva de puntos y labels */
                const p = self.progress;
                const dot2 = document.querySelectorAll('.path-dot')[1];
                const dot3 = document.querySelectorAll('.path-dot')[2];
                const sub2 = document.getElementById('subPath2');
                const sub3 = document.getElementById('subPath3');
                const pl2  = document.getElementById('pl2');
                const pl3  = document.getElementById('pl3');
                if (dot2) dot2.style.opacity = p > 0.4 ? Math.min(1, (p - 0.4) * 5) : 0;
                if (dot3) dot3.style.opacity = p > 0.8 ? Math.min(1, (p - 0.8) * 5) : 0;
                if (sub2) sub2.style.opacity = p > 0.4 ? Math.min(1, (p - 0.4) * 5) : 0;
                if (sub3) sub3.style.opacity = p > 0.8 ? Math.min(1, (p - 0.8) * 5) : 0;
                if (pl2)  pl2.style.opacity  = p > 0.4 ? Math.min(1, (p - 0.4) * 5) : 0;
                if (pl3)  pl3.style.opacity  = p > 0.8 ? Math.min(1, (p - 0.8) * 5) : 0;
            }
        }
    });
})();

/* ---------------------------------------------------------------
   ⑲ PIN & REVEAL — actualizar pantalla al activar cada paso
--------------------------------------------------------------- */
(function initPinReveal() {
    const steps = document.querySelectorAll('.pin-step');
    if (!steps.length) return;

    const icons  = ['bi-palette-fill','bi-code-slash','bi-lightning-charge-fill','bi-rocket-takeoff-fill'];
    const labels = ['Diseñando...', 'Codificando...', 'Animando...', '¡En vivo!'];

    function activateStep(idx) {
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        const screenIcon  = document.querySelector('.pin-icon');
        const screenLabel = document.querySelector('.pin-screen-label');
        if (screenIcon)  screenIcon.className = 'bi ' + icons[idx] + ' pin-icon';
        if (screenLabel) screenLabel.textContent = labels[idx];
    }

    /* Activación por hover en desktop */
    steps.forEach((step, i) => {
        step.addEventListener('mouseenter', () => activateStep(i));
    });
    activateStep(0);

    /* ScrollTrigger: activar paso según posición */
    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        steps.forEach((step, i) => {
            ScrollTrigger.create({
                trigger: step,
                start: 'top 60%',
                onEnter: () => activateStep(i),
                onEnterBack: () => activateStep(i)
            });
        });
    }
})();

/* ---------------------------------------------------------------
   ⑳ SCRAMBLE TEXT
--------------------------------------------------------------- */
(function initScramble() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    const btn     = document.getElementById('scrambleBtn');
    const els     = document.querySelectorAll('.scramble-text');
    if (!els.length) return;

    function scrambleEl(el) {
        const target = el.dataset.text || el.textContent;
        let iters = 0;
        el.classList.add('resolving');
        const iv = setInterval(() => {
            el.textContent = target.split('').map((ch, idx) => {
                if (ch === ' ') return ' ';
                if (idx < iters) return ch;
                return charset[Math.floor(Math.random() * charset.length)];
            }).join('');
            iters += 0.4;
            if (iters >= target.length) {
                el.textContent = target;
                el.classList.remove('resolving');
                clearInterval(iv);
            }
        }, 35);
    }

    function scrambleAll() {
        els.forEach((el, i) => setTimeout(() => scrambleEl(el), i * 180));
    }

    if (btn) btn.addEventListener('click', scrambleAll);

    /* Auto-trigger al scroll */
    if (typeof ScrollTrigger !== 'undefined') {
        let triggered = false;
        ScrollTrigger.create({
            trigger: '#sesion-scramble',
            start: 'top 70%',
            once: true,
            onEnter: () => { if (!triggered) { triggered = true; scrambleAll(); } }
        });
    }
})();

/* ---------------------------------------------------------------
   ㉑ MARQUEE — ya es CSS puro, no necesita JS adicional
   (pausa al hover manejada en CSS)
--------------------------------------------------------------- */

/* ---------------------------------------------------------------
   ㉒ DRAG & DROP
--------------------------------------------------------------- */
(function initDragDrop() {
    const list  = document.getElementById('dragList');
    if (!list) return;

    let dragged = null;

    list.addEventListener('dragstart', (e) => {
        dragged = e.target.closest('.drag-item');
        if (!dragged) return;
        dragged.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragend', (e) => {
        const item = e.target.closest('.drag-item');
        if (item) item.classList.remove('dragging');
        document.querySelectorAll('.drag-item').forEach(i => i.classList.remove('drag-over'));
    });

    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target.closest('.drag-item');
        if (!target || target === dragged) return;
        document.querySelectorAll('.drag-item').forEach(i => i.classList.remove('drag-over'));
        target.classList.add('drag-over');
    });

    list.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.target.closest('.drag-item');
        if (!target || !dragged || target === dragged) return;

        const items   = [...list.querySelectorAll('.drag-item')];
        const fromIdx = items.indexOf(dragged);
        const toIdx   = items.indexOf(target);

        if (fromIdx < toIdx) list.insertBefore(dragged, target.nextSibling);
        else                 list.insertBefore(dragged, target);

        document.querySelectorAll('.drag-item').forEach(i => i.classList.remove('drag-over'));
        if (typeof gsap !== 'undefined') {
            gsap.from(dragged, { scale: 1.03, duration: 0.3, ease: 'back.out(1.5)' });
        }
    });
})();

/* ---------------------------------------------------------------
   ㉓ VARIABLE FONTS
--------------------------------------------------------------- */
(function initVarFonts() {
    const textEl    = document.getElementById('varfontText');
    const wInput    = document.getElementById('fontWeight');
    const wdInput   = document.getElementById('fontWidth');
    const slInput   = document.getElementById('fontSlant');
    const wVal      = document.getElementById('weightVal');
    const wdVal     = document.getElementById('widthVal');
    const slVal     = document.getElementById('slantVal');
    const presets   = document.querySelectorAll('.varfont-preset');
    if (!textEl || !wInput) return;

    /* Usa Barlow Condensed o Inter variable si está disponible */
    textEl.style.fontFamily = "'Inter', sans-serif";

    function update() {
        const w  = wInput.value;
        const wd = wdInput ? wdInput.value : 100;
        const sl = slInput ? slInput.value : 0;
        textEl.style.fontWeight = w;
        textEl.style.fontStretch = wd + '%';
        textEl.style.fontStyle = sl < 0 ? 'oblique ' + Math.abs(sl) + 'deg' : 'normal';
        if (wVal)  wVal.textContent  = w;
        if (wdVal) wdVal.textContent = wd;
        if (slVal) slVal.textContent = sl;
    }

    [wInput, wdInput, slInput].forEach(inp => {
        if (inp) inp.addEventListener('input', update);
    });

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            if (wInput)  { wInput.value  = btn.dataset.weight; }
            if (wdInput) { wdInput.value = btn.dataset.width; }
            if (slInput) { slInput.value = btn.dataset.slant; }
            update();
        });
    });

    update();
})();

/* ---------------------------------------------------------------
   ㉔ NEON GLOW — cambio de color con botones
--------------------------------------------------------------- */
(function initNeon() {
    const btns  = document.querySelectorAll('.neon-btn');
    const texts = document.querySelectorAll('.neon-text');
    if (!btns.length || !texts.length) return;

    const colorMap = {
        green:  { color:'#39ff14', shadow:'#39ff14', anim:'neon-pulse-green' },
        cyan:   { color:'#00f5ff', shadow:'#00f5ff', anim:'neon-pulse-cyan'  },
        pink:   { color:'#ff2d78', shadow:'#ff2d78', anim:'neon-pulse-pink'  },
        orange: { color:'#ff8c00', shadow:'#ff8c00', anim:'none'             }
    };

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cfg = colorMap[btn.dataset.color];
            if (!cfg) return;
            texts.forEach(t => {
                t.style.color = cfg.color;
                t.style.textShadow = `0 0 7px ${cfg.shadow}, 0 0 20px ${cfg.shadow}, 0 0 60px ${cfg.shadow}`;
                t.style.animationName = cfg.anim;
            });
        });
    });
})();

/* ---------------------------------------------------------------
   ㉕ CURSOR TRAIL — Canvas con partículas
--------------------------------------------------------------- */
(function initCursorTrail() {
    const area   = document.getElementById('trailArea');
    const canvas = document.getElementById('trailCanvas');
    if (!area || !canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mode = 'spark';
    let raf;

    function resize() {
        canvas.width  = area.offsetWidth;
        canvas.height = area.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* Cambio de modo */
    document.querySelectorAll('.trail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.trail-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            particles = [];
        });
    });

    /* Colores según modo */
    function getColor() {
        const colors = ['#34d399','#6ee7b7','#a7f3d0','#10b981','#00f5ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    area.addEventListener('mousemove', (e) => {
        area.classList.add('active');
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseX = x; mouseY = y;

        if (mode === 'spark') {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4 - 1,
                    size: Math.random() * 5 + 2,
                    alpha: 1,
                    color: getColor()
                });
            }
        } else if (mode === 'dots') {
            particles.push({ x, y, size: Math.random() * 8 + 3, alpha: 1, vx: 0, vy: 0, color: getColor() });
        } else if (mode === 'line') {
            particles.push({ x, y, size: 3, alpha: 1, vx: 0, vy: 0, color: '#34d399' });
            if (particles.length > 40) particles.shift();
        } else if (mode === 'lusion') {
            for (let i = 0; i < 2; i++) particles.push(new TrailParticle(x, y, 'lusion'));
        }
    });

    /* Click explosion for lusion */
    area.addEventListener('click', (e) => {
        if (mode !== 'lusion') return;
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < 30; i++) particles.push(new TrailParticle(x, y, 'lusion'));
    });

    area.addEventListener('mouseleave', () => {
        setTimeout(() => area.classList.remove('active'), 2000);
    });

    /* Mesh grid points */
    let gridPoints = [];
    function buildGrid() {
        gridPoints = [];
        const sp = 28, w = canvas.width, h = canvas.height;
        for (let gx = sp; gx < w - sp/2; gx += sp) {
            for (let gy = sp; gy < h - sp/2; gy += sp) {
                gridPoints.push({ x: gx, y: gy, ox: gx, oy: gy, vx: 0, vy: 0 });
            }
        }
    }
    buildGrid();
    let mouseX = -999, mouseY = -999;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (mode === 'mesh') {
            /* Update and draw elastic mesh */
            gridPoints.forEach(p => {
                const dx = mouseX - p.x, dy = mouseY - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 80) {
                    const force = (80 - dist) / 80;
                    p.vx -= dx * force * 0.15;
                    p.vy -= dy * force * 0.15;
                }
                p.vx += (p.ox - p.x) * 0.08;
                p.vy += (p.oy - p.y) * 0.08;
                p.vx *= 0.82; p.vy *= 0.82;
                p.x += p.vx;  p.y += p.vy;
            });
            /* Draw connections */
            const sp = 28;
            gridPoints.forEach((p, i) => {
                const neighbors = gridPoints.filter(q => {
                    const dx = Math.abs(q.x - p.ox), dy = Math.abs(q.y - p.oy);
                    return (dx <= sp + 2 && dy === 0) || (dy <= sp + 2 && dx === 0);
                });
                neighbors.forEach(q => {
                    const dist = Math.sqrt((p.x-q.x)**2 + (p.y-q.y)**2);
                    const alpha = Math.max(0, 1 - dist / (sp * 2.5));
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = `rgba(52,211,153,${alpha * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#34d399';
                ctx.globalAlpha = 0.7;
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        } else if (mode === 'lusion') {
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => { p.update(); p.draw(ctx); });
        } else if (mode === 'line' && particles.length > 1) {
            ctx.beginPath();
            ctx.moveTo(particles[0].x, particles[0].y);
            particles.forEach((p, i) => {
                if (i > 0) ctx.lineTo(p.x, p.y);
                p.alpha -= 0.02;
            });
            ctx.strokeStyle = 'rgba(52,211,153,0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
            particles = particles.filter(p => p.alpha > 0);
        } else {
            particles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle   = p.color;
                ctx.beginPath();
                if (mode === 'spark') {
                    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    p.vx *= 0.96;
                    p.vy *= 0.96;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.size *= 0.94;
                    p.alpha -= 0.025;
                } else {
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    p.alpha -= 0.015;
                    p.size  *= 0.98;
                }
            });
            ctx.globalAlpha = 1;
            particles = particles.filter(p => p.alpha > 0.01 && p.size > 0.5);
        }

        raf = requestAnimationFrame(animate);
    }
    animate();
})();


/* ---------------------------------------------------------------
   Particle class — usada por initCursorTrail para modos lusion/mesh
--------------------------------------------------------------- */
class TrailParticle {
    constructor(x, y, mode) {
        this.x = x;
        this.y = y;
        this.mode = mode;
        this.life = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = mode === 'lusion' ? (Math.random() * 5 + 2) : (Math.random() * 2 + 0.5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - (mode === 'lusion' ? 2 : 0);
        this.size = mode === 'lusion' ? (Math.random() * 6 + 3) : (Math.random() * 3 + 1);
        const colors = ['#10b981','#34d399','#6ee7b7','#00f5ff','#6366f1'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.12;
        this.vx *= 0.97;
        this.life -= this.mode === 'lusion' ? 0.018 : 0.025;
        this.size *= 0.97;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.life, 0);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.mode === 'lusion' ? 8 : 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(this.size, 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/* ---------------------------------------------------------------
   ㉖ SKELETON LOADING — simular carga
--------------------------------------------------------------- */
(function initSkeleton() {
    const btn        = document.getElementById('skeletonReload');
    const skCard     = document.getElementById('skCard');
    const loadedCard = document.getElementById('loadedCard');
    if (!btn || !skCard || !loadedCard) return;

    function simulate() {
        /* Reset: mostrar skeleton, ocultar contenido */
        skCard.style.display     = 'grid';
        skCard.style.opacity     = '1';
        loadedCard.style.display = 'none';
        loadedCard.style.opacity = '0';
        btn.disabled = true;
        btn.textContent = '⏳ Cargando...';

        /* Forzar reflow para que el shimmer reinicie */
        skCard.querySelectorAll('[class*="sk-"]').forEach(el => {
            el.style.animation = 'none';
            el.getBoundingClientRect();
            el.style.animation = '';
        });

        setTimeout(() => {
            /* Transición suave al contenido real */
            skCard.style.opacity = '0';
            setTimeout(() => {
                skCard.style.display     = 'none';
                loadedCard.style.display = 'grid';
                loadedCard.style.opacity = '0';
                requestAnimationFrame(() => {
                    loadedCard.style.transition = 'opacity 0.4s ease';
                    loadedCard.style.opacity    = '1';
                });
                btn.disabled    = false;
                btn.textContent = '🔄 Recargar';
            }, 300);
        }, 2400);
    }

    btn.addEventListener('click', simulate);

    /* Auto al entrar en viewport */
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#sesion-skeleton',
            start: 'top 70%',
            once: true,
            onEnter: simulate
        });
    }
})();

/* ---------------------------------------------------------------
   ㉗ LIQUID BLOB — ya funciona con CSS, aquí solo GSAP polish
--------------------------------------------------------------- */
(function initLiquid() {
    document.querySelectorAll('.liquid-btn').forEach(btn => {
        const fill = btn.querySelector('.liquid-fill');

        btn.addEventListener('mouseenter', (e) => {
            /* Posicionar el fill en el punto de entrada del cursor */
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top  - rect.height / 2;

            if (fill) {
                fill.style.left = (e.clientX - rect.left) + 'px';
                fill.style.top  = (e.clientY - rect.top)  + 'px';
                fill.style.transform = 'translate(-50%,-50%) scale(0)';
                fill.style.transition = 'none';
                /* Forzar reflow */
                fill.getBoundingClientRect();
                fill.style.transition = 'transform 0.55s cubic-bezier(.25,.46,.45,.94), border-radius 0.5s';
                fill.style.transform = 'translate(-50%,-50%) scale(4)';
                fill.style.borderRadius = '30%';
                fill.style.position = 'absolute';
                fill.style.width = Math.max(rect.width, rect.height) * 1.2 + 'px';
                fill.style.height = fill.style.width;
            }

            if (typeof gsap !== 'undefined') {
                gsap.to(btn, { scale: 1.05, duration: 0.25, ease: 'power2.out' });
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (fill) {
                fill.style.transition = 'transform 0.4s ease, border-radius 0.4s';
                fill.style.transform = 'translate(-50%,-50%) scale(0)';
                fill.style.borderRadius = '50%';
            }
            if (typeof gsap !== 'undefined') {
                gsap.to(btn, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
            }
        });
    });
})();

/* ============================================================
   MODAL PREMIUM — funciones globales (deben estar fuera del
   DOMContentLoaded para ser accesibles desde el handler ESC
   y desde atributos onclick en el HTML)
============================================================ */
function openPremiumModal(type = "default") {
  const overlay = document.getElementById("premiumModal");
  const box     = document.getElementById("premiumModalBox");
  const content = document.getElementById("premiumModalContent");
  if (!overlay || !box || !content) return;

  const tpls = {
    default: '<div class="pmodal-default"><div style="font-size:2.5rem;margin-bottom:1rem">💬</div><h3>Hablemos de tu proyecto</h3><p>Cuéntame qué necesitas y te ayudo a hacerlo realidad.</p><button class="btn-main" onclick="closePremiumModal()" style="margin-top:1.5rem">Cerrar</button></div>',
    success: '<div class="pmodal-default"><div style="font-size:3rem;margin-bottom:1rem">🎉</div><h3 style="color:#22c55e">¡Éxito!</h3><p>Tu solicitud fue enviada correctamente. Te contactaré pronto.</p><button class="btn-main" onclick="closePremiumModal()" style="margin-top:1.5rem">Perfecto</button></div>',
    form: '<div class="pmodal-default"><div style="font-size:2rem;margin-bottom:0.5rem">📋</div><h3>Cuéntame más</h3><input type="text" placeholder="Tu nombre" style="width:100%;padding:.7rem 1rem;margin:.5rem 0;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:inherit;font-size:1rem;"><textarea placeholder="¿Qué necesitas?" rows="3" style="width:100%;padding:.7rem 1rem;margin:.5rem 0;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:inherit;font-size:1rem;resize:vertical;"></textarea><div style="display:flex;gap:.75rem;margin-top:1rem"><button class="btn-main" onclick="showToast(\'✅ Formulario enviado\');closePremiumModal();" style="flex:1">Enviar</button><button class="btn-demo" onclick="closePremiumModal()" style="flex:1">Cancelar</button></div></div>'
  };

  content.innerHTML = tpls[type] || tpls.default;

  overlay.style.display = "flex";

  if (typeof gsap !== "undefined") {
    gsap.fromTo(box,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, duration: 0.4 }
    );
  }
}

function closePremiumModal() {
  const overlay = document.getElementById("premiumModal");
  const box     = document.getElementById("premiumModalBox");
  if (!overlay) return;

  if (typeof gsap !== "undefined") {
    gsap.to(box, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      onComplete: () => { overlay.style.display = "none"; }
    });
  } else {
    overlay.style.display = "none";
  }
}

/* ============================================================
   GSAP SAFE
============================================================ */
const hasGSAP = typeof gsap !== "undefined";
if (hasGSAP && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
document.addEventListener("DOMContentLoaded", () => {

  const hasGSAP = typeof gsap !== "undefined";

  /* ============================================================
     MODAL PREMIUM — eventos (los listeners sí van aquí)
  ============================================================ */
  document.getElementById("premiumModalClose")
    ?.addEventListener("click", closePremiumModal);

  document.getElementById("premiumModal")
    ?.addEventListener("click", e => {
      if (e.target.id === "premiumModal") closePremiumModal();
    });
/* ============================================================
    FORM CARDS — animación de entrada + interacción 3D + stagger
   ============================================================ */
/**
 * PRIMEX MARKETING - FORM LAB CORE JS
 * Manejo de interacciones, validaciones y efectos UX.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiquidGlow();
    initInputEffects();
});

/**
 * 1. EFECTO LIQUID GLOW (Resplandor adaptativo)
 * Sigue el movimiento del mouse para crear profundidad.
 */
function initLiquidGlow() {
    const cards = document.querySelectorAll('.form-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}

/**
 * 2. EFECTOS DE INPUTS Y LIMPIEZA DE ERRORES
 * Remueve los estilos de error automáticamente cuando el usuario corrige.
 */
function initInputEffects() {
    const allInputs = document.querySelectorAll('.form-card input, .form-card textarea, .form-card select');
    
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(239, 68, 68)') { // Si es rojo (#ef4444)
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
}

/**
 * 3. SISTEMA DE NOTIFICACIONES (TOAST)
 * Notificaciones elegantes con soporte para éxito y error.
 */
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    // Aplicamos los estilos directamente para asegurar el diseño
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: type === 'success' ? '#0f172a' : '#ef4444',
        color: '#fff',
        padding: '16px 28px',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        zIndex: '10000',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: 'translateY(100px)',
        opacity: '0'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

/**
 * 4. DISPARADOR DE ERRORES (Shake Effect)
 * Hace vibrar la tarjeta cuando falta información.
 */
function triggerValidationError(inputElement) {
    const card = inputElement.closest('.form-card');
    inputElement.style.borderColor = '#ef4444';
    inputElement.focus();
    
    // Añadimos clase de animación definida en CSS
    card.classList.add('shake-error');
    showToast('Por favor, completa los campos obligatorios', 'error');
    
    setTimeout(() => {
        card.classList.remove('shake-error');
    }, 500);
}

/**
 * 5. LÓGICA ESPECIAL PARA MULTISTEP (PROCESO)
 * Maneja el flujo de pasos dentro del formulario de registro.
 */
function handleMultiStep(btnId) {
    const steps = ['ms-step-1', 'ms-step-2', 'ms-step-3'];
    const dots = ['ms-dot-1', 'ms-dot-2', 'ms-dot-3'];
    const btn = document.getElementById(btnId);
    
    const currentStepIdx = steps.findIndex(s => document.getElementById(s).style.display !== 'none');
    const currentInput = document.getElementById(steps[currentStepIdx]).querySelector('input');

    // Validación antes de avanzar
    if (!currentInput.value.trim()) {
        triggerValidationError(currentInput);
        return;
    }

    if (currentStepIdx < 2) {
        // Avanzar al siguiente paso
        document.getElementById(steps[currentStepIdx]).style.display = 'none';
        document.getElementById(steps[currentStepIdx + 1]).style.display = '';
        document.getElementById(dots[currentStepIdx + 1]).classList.add('active');
        
        btn.textContent = currentStepIdx === 1 ? 'Finalizar' : 'Continuar';
    } else {
        // Finalizar proceso
        showToast('🎉 Registro completado — Bienvenido/a');
        resetMultiStep(steps, dots, btn);
    }
}

function resetMultiStep(steps, dots, btn) {
    steps.forEach((s, i) => {
        document.getElementById(s).style.display = i === 0 ? '' : 'none';
        document.getElementById(s).querySelector('input').value = '';
    });
    dots.forEach((d, i) => {
        if(i > 0) document.getElementById(d).classList.remove('active');
    });
    btn.textContent = 'Continuar';
}
  /* ============================================================
     FOOTER ULTRA EFFECTS
  ============================================================ */
  const footerCards = document.querySelectorAll(".footer-card");

  if (hasGSAP) {
    gsap.from(".footer-card", {
      opacity: 0,
      y: 50,
      duration: 0.9,
      stagger: 0.12
    });
  }

  footerCards.forEach(card => {

    /* ================= 3D HOVER ================= */
    /* Se usa una variable CSS para el tilt y wind()
       usa otra propiedad separada — así no se pisan */
    let isHovered = false;

    card.addEventListener("mousemove", (e) => {
      isHovered = true;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(1000px)
         rotateX(${y * -10}deg)
         rotateY(${x * 10}deg)
         translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      isHovered = false;
      card.style.transform = "none";
    });

    /* ================= WIND FLOAT ================= */

    let float = 0;
    let dir = 1;
    let windRaf = null;
    let cardVisible = false;

    function wind() {
      if (!cardVisible || isHovered) {
        windRaf = requestAnimationFrame(wind);
        return;
      }
      float += 0.02 * dir;
      if (float > 1 || float < -1) dir *= -1;
      card.style.transform = `translateY(${float}px)`;
      windRaf = requestAnimationFrame(wind);
    }

    /* ================= FX LAYER ================= */
    const fx = document.createElement("div");
    fx.className = "footer-fx-layer";
    card.appendChild(fx);

    /* partículas */
    for (let i = 0; i < 12; i++) {
      const dot = document.createElement("span");
      dot.className = "footer-particle";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top  = Math.random() * 100 + "%";
      dot.style.animationDelay = Math.random() * 6 + "s";
      fx.appendChild(dot);
    }

    /* ⭐ estrellas fugaces — FIX: el interval se pausa
       cuando la card sale del viewport */
    let starInterval = null;

    function startStars() {
      if (starInterval) return;
      starInterval = setInterval(() => {
        const star = document.createElement("span");
        star.className = "shooting-star";
        star.style.left = Math.random() * 80 + "%";
        star.style.top  = Math.random() * 40 + "%";
        fx.appendChild(star);
        setTimeout(() => star.remove(), 1500);
      }, 2500);
    }

    function stopStars() {
      clearInterval(starInterval);
      starInterval = null;
    }

    /* IntersectionObserver — arranca/para wind y estrellas
       solo cuando la card está realmente visible */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        cardVisible = entry.isIntersecting;
        if (entry.isIntersecting) {
          startStars();
          if (!windRaf) windRaf = requestAnimationFrame(wind);
        } else {
          stopStars();
          if (windRaf) { cancelAnimationFrame(windRaf); windRaf = null; }
          card.style.transform = "none";
        }
      });
    }, { threshold: 0.1 });

    io.observe(card);

  });

  /* ============================================================
     BACK TO TOP
     El toggle de visibilidad ya se maneja en el scroll
     listener con rAF de la línea 128 (backToTop / #backToTop).
     Aquí solo registramos el click.
  ============================================================ */
  const backToTop = document.querySelector(".back-to-top");

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

});


/* ============================================================
   TYPEWRITER CON CURSOR
============================================================ */
(function initTypewriter() {
    const textEl = document.getElementById('tw-text');
    const chipsEl = document.getElementById('tw-chips');
    if (!textEl) return;

    const phrases = [
        'interfaces que enamoran ✨',
        'animaciones de alto impacto 🚀',
        'experiencias memorables 🎯',
        'código limpio y escalable 💎',
        'conversiones que crecen 📈',
        'diseño funcional y bello 🎨'
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let paused = false;

    /* Render chips */
    phrases.forEach((p, i) => {
        const chip = document.createElement('span');
        chip.className = 'tw-phrase-chip' + (i === 0 ? ' active' : '');
        chip.textContent = p;
        chip.addEventListener('click', () => {
            phraseIdx = i;
            charIdx = 0;
            deleting = false;
            paused = false;
            textEl.textContent = '';
        });
        chipsEl.appendChild(chip);
    });

    function updateChips() {
        document.querySelectorAll('.tw-phrase-chip').forEach((c, i) => {
            c.classList.toggle('active', i === phraseIdx);
        });
    }

    function tick() {
        const current = phrases[phraseIdx];

        if (!deleting) {
            charIdx++;
            textEl.textContent = current.slice(0, charIdx);
            if (charIdx === current.length) {
                paused = true;
                setTimeout(() => { paused = false; deleting = true; }, 2200);
            }
        } else {
            charIdx--;
            textEl.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                updateChips();
            }
        }
    }

    function loop() {
        if (!paused) tick();
        const speed = deleting ? 45 : (charIdx === 0 ? 400 : 75);
        setTimeout(loop, speed);
    }

    loop();
})();

/* ============================================================
   RIPPLE / CLICK EFFECT
============================================================ */
(function initRipple() {
    const area   = document.getElementById('ripple-canvas-area');
    const canvas = document.getElementById('ripple-canvas');
    const hint   = document.getElementById('ripple-hint');
    if (!area || !canvas) return;

    const ctx = canvas.getContext('2d');
    let ripples = [];
    let mode = 'wave';
    let animFrame;

    function resize() {
        canvas.width  = area.offsetWidth;
        canvas.height = area.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(area);

    const COLORS = ['#10b981','#6366f1','#f59e0b','#ec4899','#3b82f6','#8b5cf6'];

    function spawn(x, y) {
        if (hint) hint.style.opacity = '0';
        const color = mode === 'multi'
            ? COLORS[Math.floor(Math.random() * COLORS.length)]
            : (mode === 'neon' ? '#00fff7' : '#10b981');

        if (mode === 'burst') {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                ripples.push({ x, y, r: 0, maxR: 60 + Math.random() * 40,
                    alpha: 1, color, vx: Math.cos(angle) * (2 + Math.random() * 3),
                    vy: Math.sin(angle) * (2 + Math.random() * 3), type: 'particle' });
            }
        } else {
            for (let i = 0; i < (mode === 'neon' ? 3 : 2); i++) {
                ripples.push({ x, y, r: 0, maxR: 120 + i * 50, alpha: 1, color,
                    delay: i * 80, born: Date.now(), type: 'wave' });
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = Date.now();

        ripples = ripples.filter(r => r.alpha > 0.01);

        ripples.forEach(r => {
            if (r.type === 'particle') {
                r.x += r.vx;
                r.y += r.vy;
                r.vy += 0.15;
                r.r  += 0.5;
                r.alpha -= 0.025;
                ctx.beginPath();
                ctx.arc(r.x, r.y, Math.max(r.r, 2), 0, Math.PI * 2);
                ctx.fillStyle = r.color + Math.floor(r.alpha * 255).toString(16).padStart(2,'0');
                ctx.fill();
            } else {
                const elapsed = now - r.born - (r.delay || 0);
                if (elapsed < 0) return;
                r.r = Math.min(r.r + (r.maxR / 40), r.maxR);
                r.alpha = 1 - (r.r / r.maxR);
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                if (mode === 'neon') {
                    ctx.strokeStyle = r.color + Math.floor(r.alpha * 220).toString(16).padStart(2,'0');
                    ctx.lineWidth = 3;
                    ctx.shadowColor = r.color;
                    ctx.shadowBlur = 15;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.strokeStyle = r.color + Math.floor(r.alpha * 200).toString(16).padStart(2,'0');
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        });

        animFrame = requestAnimationFrame(draw);
    }
    draw();

    area.addEventListener('click', e => {
        const rect = area.getBoundingClientRect();
        spawn(e.clientX - rect.left, e.clientY - rect.top);
    });
    area.addEventListener('touchstart', e => {
        e.preventDefault();
        const rect = area.getBoundingClientRect();
        spawn(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }, { passive: false });

    document.querySelectorAll('.ripple-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ripple-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            ripples = [];
        });
    });
})();

/* ============================================================
   PALETA DE COLORES EN VIVO
============================================================ */
(function initColorPicker() {
    const input   = document.getElementById('cp-custom');
    const hexDisp = document.getElementById('cp-hex');
    const swatchesEl = document.getElementById('cp-swatches');
    if (!input) return;

    const presets = [
        '#10b981','#6366f1','#f59e0b','#ec4899',
        '#3b82f6','#8b5cf6','#ef4444','#14b8a6',
        '#f97316','#06b6d4'
    ];

    function applyAccent(hex) {
        document.documentElement.style.setProperty('--accent', hex);
        if (hexDisp) hexDisp.textContent = hex;
        if (input) input.value = hex;

        /* Update preview elements */
        const btn  = document.getElementById('cprev-btn');
        const badge = document.getElementById('cprev-badge');
        const link = document.getElementById('cprev-link');
        const bar  = document.getElementById('cprev-bar');

        if (btn)   btn.style.background = hex;
        if (btn)   btn.style.boxShadow  = `0 4px 20px ${hex}55`;
        if (badge) { badge.style.background = hex + '30'; badge.style.color = hex; badge.style.borderColor = hex + '66'; }
        if (link)  link.style.color = hex;
        if (bar)   { bar.style.background = hex; bar.style.boxShadow = `0 0 10px ${hex}80`; }

        /* Mark active swatch */
        document.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.toggle('selected', s.dataset.color === hex);
        });
    }

    /* Build swatches */
    presets.forEach(hex => {
        const sw = document.createElement('button');
        sw.className = 'color-swatch' + (hex === '#10b981' ? ' selected' : '');
        sw.style.background = hex;
        sw.dataset.color = hex;
        sw.title = hex;
        sw.addEventListener('click', () => applyAccent(hex));
        swatchesEl.appendChild(sw);
    });

    input.addEventListener('input', () => applyAccent(input.value));
    applyAccent('#10b981');
})();

/* ============================================================
   GRÁFICAS ANIMADAS
============================================================ */
(function initCharts() {
    if (typeof Chart === 'undefined') return;

    const gridEl = document.getElementById('charts-grid');
    if (!gridEl) return;

    const verde = '#10b981';
    const indigo = '#6366f1';
    const amber  = '#f59e0b';
    const pink   = '#ec4899';
    const blue   = '#3b82f6';

    const defaults = {
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } }
    };

    Chart.defaults.color = '#94a3b8';

    let charts = [];

    function buildCharts() {
        charts.forEach(c => c.destroy());
        charts = [];

        /* Bar */
        charts.push(new Chart(document.getElementById('chart-bar'), {
            type: 'bar',
            data: {
                labels: ['Ene','Feb','Mar','Abr','May','Jun'],
                datasets: [{ label: 'Proyectos', data: [3,5,4,7,6,9],
                    backgroundColor: verde + '99', borderColor: verde,
                    borderWidth: 2, borderRadius: 8 }]
            },
            options: { ...defaults, scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }}
        }));

        /* Line */
        charts.push(new Chart(document.getElementById('chart-line'), {
            type: 'line',
            data: {
                labels: ['Ene','Feb','Mar','Abr','May','Jun'],
                datasets: [{ label: 'Clientes', data: [12,19,15,27,24,35],
                    borderColor: indigo, backgroundColor: indigo + '22',
                    borderWidth: 3, fill: true, tension: 0.4,
                    pointBackgroundColor: indigo, pointRadius: 5 }]
            },
            options: { ...defaults, scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }}
        }));

        /* Doughnut */
        charts.push(new Chart(document.getElementById('chart-doughnut'), {
            type: 'doughnut',
            data: {
                labels: ['Web', 'Diseño UI', 'Animaciones', 'Consultoría'],
                datasets: [{ data: [40,25,20,15],
                    backgroundColor: [verde+'cc', indigo+'cc', amber+'cc', pink+'cc'],
                    borderColor: ['#0f172a'], borderWidth: 3 }]
            },
            options: { ...defaults, cutout: '65%' }
        }));

        /* Radar */
        charts.push(new Chart(document.getElementById('chart-radar'), {
            type: 'radar',
            data: {
                labels: ['Diseño','Velocidad','Soporte','Precio','Innovación'],
                datasets: [{ label: 'Promedio', data: [70,65,80,75,60],
                    borderColor: amber, backgroundColor: amber + '22', pointBackgroundColor: amber },
                { label: 'Yurani Lab', data: [95,90,98,85,97],
                    borderColor: verde, backgroundColor: verde + '22', pointBackgroundColor: verde }]
            },
            options: { ...defaults, scales: { r: { grid: { color: 'rgba(255,255,255,0.08)' },
                pointLabels: { color: '#94a3b8', font: { size: 11 } }, ticks: { display: false } } } }
        }));
    }

    /* Build on scroll */
    let built = false;
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#sesion-charts',
            start: 'top 75%',
            once: true,
            onEnter: () => { built = true; buildCharts(); }
        });
    } else {
        buildCharts();
        built = true;
    }

    document.getElementById('charts-reload')?.addEventListener('click', () => {
        if (!built) buildCharts();
        else { charts.forEach(c => c.destroy()); charts = []; buildCharts(); }
    });
})();

/* ============================================================
   COOKIE BANNER
============================================================ */
(function initCookieBanner() {
    const banner      = document.getElementById('cookie-demo-banner');
    const acceptBtn   = document.getElementById('cookie-accept-btn');
    const declineBtn  = document.getElementById('cookie-decline-btn');
    const resetBtn    = document.getElementById('cookie-reset-btn');
    const customBtn   = document.getElementById('cookie-custom-variant-btn');
    const customizeBtn = document.getElementById('cookie-customize-btn');
    if (!banner) return;

    let compactMode = false;

    function showBanner() {
        banner.classList.remove('dismissed');
        setTimeout(() => banner.classList.add('visible'), 50);
    }

    function dismissBanner(msg) {
        banner.classList.remove('visible');
        banner.classList.add('dismissed');
        if (msg) showToast(msg);
    }

    /* Auto-show when entering viewport */
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#sesion-cookie',
            start: 'top 70%',
            once: true,
            onEnter: () => setTimeout(showBanner, 400)
        });
    }

    acceptBtn?.addEventListener('click', () => dismissBanner('🍪 Cookies aceptadas — ¡Gracias!'));
    declineBtn?.addEventListener('click', () => dismissBanner('🔒 Solo cookies esenciales activadas'));
    resetBtn?.addEventListener('click', () => { compactMode = false; renderNormal(); showBanner(); });
    customizeBtn?.addEventListener('click', () => showToast('⚙️ Abriendo preferencias…'));

    customBtn?.addEventListener('click', () => {
        compactMode = !compactMode;
        if (compactMode) {
            banner.innerHTML = `
              <span class="cookie-icon">🍪</span>
              <div class="cookie-text" style="flex:1"><p><strong>¿Aceptas cookies?</strong> Mejoran tu experiencia.</p></div>
              <div class="cookie-actions">
                <button class="cookie-accept" id="cookie-accept-btn2">Sí</button>
                <button class="cookie-decline" id="cookie-decline-btn2">No</button>
              </div>`;
            banner.querySelector('#cookie-accept-btn2')?.addEventListener('click', () => dismissBanner('🍪 ¡Aceptado!'));
            banner.querySelector('#cookie-decline-btn2')?.addEventListener('click', () => dismissBanner('❌ Rechazado'));
            banner.classList.remove('dismissed');
            setTimeout(() => banner.classList.add('visible'), 50);
        }
    });

    function renderNormal() {
        banner.innerHTML = `
          <span class="cookie-icon">🍪</span>
          <div class="cookie-text">
            <p><strong>Usamos cookies</strong> para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.</p>
            <button class="cookie-customize" id="cookie-customize-btn">⚙️ Personalizar preferencias</button>
          </div>
          <div class="cookie-actions">
            <button class="cookie-accept" id="cookie-accept-btn">✅ Aceptar todo</button>
            <button class="cookie-decline" id="cookie-decline-btn">❌ Solo esenciales</button>
          </div>`;
        banner.querySelector('#cookie-accept-btn')?.addEventListener('click', () => dismissBanner('🍪 Cookies aceptadas — ¡Gracias!'));
        banner.querySelector('#cookie-decline-btn')?.addEventListener('click', () => dismissBanner('🔒 Solo cookies esenciales activadas'));
        banner.querySelector('#cookie-customize-btn')?.addEventListener('click', () => showToast('⚙️ Abriendo preferencias…'));
    }
})();

/* ============================================================
   SISTEMA DE NOTIFICACIONES
============================================================ */
(function initNotifications() {
    const stack    = document.getElementById('notif-stack');
    const clearBtn = document.getElementById('notif-clear-btn');
    if (!stack) return;

    const configs = {
        success: { icon: '✅', title: 'Guardado correctamente', msg: 'Los cambios se guardaron en la nube.', color: '#10b981', dur: 4000 },
        error:   { icon: '❌', title: 'Error de conexión', msg: 'No se pudo conectar al servidor. Reintentando…', color: '#ef4444', dur: 5000 },
        warning: { icon: '⚠️', title: 'Sesión por expirar', msg: 'Tu sesión expira en 5 minutos.', color: '#f59e0b', dur: 4500 },
        info:    { icon: 'ℹ️', title: 'Actualización disponible', msg: 'v2.4.0 está lista para instalar.', color: '#6366f1', dur: 4000 },
        message: { icon: '💬', title: 'Nuevo mensaje de Ana', msg: '«¿Cuándo tienes disponibilidad?»', color: '#ec4899', dur: 5000 }
    };

    function addNotif(type) {
        const cfg = configs[type];
        if (!cfg) return;

        const el = document.createElement('div');
        el.className = 'notif-item';
        el.style.setProperty('--notif-color', cfg.color);
        el.style.setProperty('--notif-dur', cfg.dur + 'ms');
        el.innerHTML = `
          <span class="notif-icon">${cfg.icon}</span>
          <div class="notif-body">
            <p class="notif-title">${cfg.title}</p>
            <p class="notif-msg">${cfg.msg}</p>
          </div>
          <button class="notif-close" title="Cerrar">×</button>
          <div class="notif-progress"></div>`;

        el.querySelector('.notif-close').addEventListener('click', () => removeNotif(el));
        stack.prepend(el);

        /* Limit to 5 stacked */
        while (stack.children.length > 5) {
            removeNotif(stack.lastChild);
        }

        /* Auto-dismiss */
        setTimeout(() => removeNotif(el), cfg.dur);
    }

    function removeNotif(el) {
        if (!el || !el.parentNode) return;
        el.classList.add('removing');
        setTimeout(() => el.remove(), 380);
    }

    document.querySelectorAll('[data-notif]').forEach(btn => {
        btn.addEventListener('click', () => addNotif(btn.dataset.notif));
    });

    clearBtn?.addEventListener('click', () => {
        [...stack.children].forEach(el => removeNotif(el));
    });
})();