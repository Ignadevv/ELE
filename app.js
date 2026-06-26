document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Hamburger icon animation
            const spans = menuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu on link click
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 2. Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // run once on start

    // 4. Accordion Logic (Rules & FAQ)
    const accordionHeaders = document.querySelectorAll('.rule-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.rule-content');
            const isActive = item.classList.contains('active');

            // Close all other items in the same container
            const container = item.parentElement;
            container.querySelectorAll('.rule-item').forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherContent = otherItem.querySelector('.rule-content');
                if (otherContent) otherContent.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                content.style.maxHeight = null;
            }
        });
    });

    // 5. Interactive Simulated Players Counter & Server Status
    const playersCountEl = document.getElementById('players-count');
    if (playersCountEl) {
        let count = 48; // Base starting count
        const maxPlayers = 128;
        
        // Simple counter animation on load
        let currentDisplay = 0;
        const duration = 1500; // ms
        const stepTime = Math.abs(Math.floor(duration / count));
        const timer = setInterval(() => {
            currentDisplay += 1;
            playersCountEl.textContent = `${currentDisplay}/${maxPlayers}`;
            if (currentDisplay >= count) {
                clearInterval(timer);
                
                // Start subtle periodic updates to simulate live changes
                setInterval(() => {
                    const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
                    count = Math.max(10, Math.min(maxPlayers - 5, count + fluctuation));
                    playersCountEl.textContent = `${count}/${maxPlayers}`;
                }, 6000);
            }
        }, stepTime);
    }

    // 6. Copy IP Address Button
    const copyBtn = document.getElementById('copy-ip-btn');
    const ipText = document.getElementById('server-ip-text');
    if (copyBtn && ipText) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = ipText.textContent.trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Temporary feedback
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg style="width: 18px; height: 18px; stroke: var(--accent-cyan);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            }).catch(err => {
                console.error('No se pudo copiar el texto: ', err);
            });
        });
    }

    // 7. Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // 8. Factions Application System
    const questions = {
        PNP: [
            "¿Cuál es tu nombre de personaje (IC) y tu edad?",
            "¿Por qué quieres unirte a la PNP y qué valores aportarías al cuerpo policial?",
            "Ante una situación de toma de rehenes en joyería, ¿cuál es el protocolo de negociación que seguirías?",
            "Define qué es Valorar la Vida (VDV) en tus propias palabras y da un ejemplo."
        ],
        EMS: [
            "¿Cuál es tu nombre de personaje (IC) y tu edad?",
            "¿Qué harías si encuentras a un paciente inconsciente en medio de una zona de tiroteo activo?",
            "¿Cuál es la diferencia entre un RCP básico y el uso de un desfibrilador en el rol de paramédico?",
            "¿Por qué deseas pertenecer al cuerpo médico de Peru Elegante RP y no a otra facción?"
        ]
    };

    let currentFaction = '';
    let currentQuestionIndex = 0;
    let answers = [];
    let questionStartTime = 0;

    // Configuración de Firebase (Reemplaza con tus credenciales)
    const firebaseConfig = {
        apiKey: "AIzaSyDOGUxzV5V3Fe1bNk5MU_qZb8TpyIUuh2U",
        authDomain: "bseperu.firebaseapp.com",
        projectId: "bseperu",
        storageBucket: "bseperu.firebasestorage.app",
        messagingSenderId: "803964042314",
        appId: "1:803964042314:web:316772a77591ab5c527ab3",
        measurementId: "G-RCJV3B4883"
    };

    // Configuración del Webhook de Discord (Reemplaza con tu URL de Webhook)
    const discordWebhookUrl = "https://discord.com/api/webhooks/1519847964309196923/hwltxpwVtWo7RA34DpeZ_IiVZgFQ7v1_OkcX6bUkXOkbFMckavG3SRz6tXAD30vBL2TR";

    // Configuración de Discord OAuth2 (Reemplaza con tu Client ID)
    const discordClientId = "1519852576726716526";
    const getDiscordRedirectUri = () => window.location.origin + window.location.pathname;

    // URL de tu servidor/función de aprobación en Vercel
    const approvalServerUrl = "https://eleganterp.vercel.app";

    let discordUser = null;

    // Inicializar Firebase
    let db = null;
    if (typeof firebase !== 'undefined' && firebaseConfig.projectId !== "TU_PROJECT_ID_AQUI") {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        } catch (e) {
            console.error("Error al inicializar Firebase:", e);
        }
    }

    // --- Discord OAuth2 Logic ---
    function checkDiscordCallback() {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("access_token");
            if (accessToken) {
                // Limpiar el hash de la URL
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
                
                // Obtener datos del usuario de Discord
                fetch("https://discord.com/api/users/@me", {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                })
                .then(res => res.json())
                .then(user => {
                    if (user && user.id) {
                        sessionStorage.setItem("discord_user", JSON.stringify(user));
                        discordUser = user;
                        updateDiscordUI();
                    }
                })
                .catch(err => console.error("Error al obtener perfil de Discord:", err));
            }
        } else {
            const saved = sessionStorage.getItem("discord_user");
            if (saved) {
                discordUser = JSON.parse(saved);
                updateDiscordUI();
            } else {
                updateDiscordUI();
            }
        }
    }

    function updateDiscordUI() {
        const lockOverlay = document.getElementById("faction-lock-overlay");
        const selectorGrid = document.getElementById("faction-selector-grid");
        
        if (discordUser) {
            document.getElementById("btn-discord-login").style.display = "none";
            document.getElementById("discord-profile-display").style.display = "flex";
            
            // Nombre de usuario
            document.getElementById("discord-username").textContent = `${discordUser.username}`;
            
            // Avatar
            const avatarUrl = discordUser.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.id) % 5}.png`;
            document.getElementById("discord-avatar").src = avatarUrl;
            
            // Ocultar overlay de bloqueo y habilitar selector
            if (lockOverlay) lockOverlay.classList.add("hidden");
            if (selectorGrid) {
                selectorGrid.classList.remove("disabled");
                selectorGrid.style.pointerEvents = "auto";
                selectorGrid.style.opacity = "1";
            }
        } else {
            document.getElementById("btn-discord-login").style.display = "inline-flex";
            document.getElementById("discord-profile-display").style.display = "none";
            
            // Mostrar overlay de bloqueo y deshabilitar selector
            if (lockOverlay) lockOverlay.classList.remove("hidden");
            if (selectorGrid) {
                selectorGrid.classList.add("disabled");
                selectorGrid.style.pointerEvents = "none";
                selectorGrid.style.opacity = "0.25";
            }
        }
    }

    window.loginWithDiscord = function() {
        if (discordClientId === "TU_CLIENT_ID_DE_DISCORD_AQUI") {
            alert("Por favor, configura tu CLIENT ID de Discord en app.js (línea 193).");
            return;
        }
        const redirectUri = encodeURIComponent(getDiscordRedirectUri());
        const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;
        window.location.href = oauthUrl;
    };

    window.logoutDiscord = function() {
        sessionStorage.removeItem("discord_user");
        discordUser = null;
        updateDiscordUI();
    };

    // Iniciar verificación
    checkDiscordCallback();

    // --- Factions System Functions ---
    window.selectFaction = function(faction) {
        currentFaction = faction;
        currentQuestionIndex = 0;
        answers = [];
        
        document.getElementById('faction-title').textContent = `Postulación ${faction}`;
        document.getElementById('step-selection').classList.remove('active');
        document.getElementById('step-form').classList.add('active');
        
        loadQuestion();
    };

    function loadQuestion() {
        const list = questions[currentFaction];
        const qText = list[currentQuestionIndex];
        
        document.getElementById('question-label').textContent = `Pregunta ${currentQuestionIndex + 1} de ${list.length}`;
        document.getElementById('question-text').textContent = qText;
        
        // Restore answer if previously answered
        const existing = answers[currentQuestionIndex];
        document.getElementById('answer-input').value = existing ? existing.answer : '';
        
        // Update progress bar
        const progress = (currentQuestionIndex / list.length) * 100;
        document.getElementById('form-progress').style.width = `${progress}%`;
        
        // Update back button visibility
        document.getElementById('btn-back').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';
        document.getElementById('btn-next').textContent = currentQuestionIndex === list.length - 1 ? 'Enviar' : 'Siguiente';
        
        // Start Timer
        questionStartTime = Date.now();
        
        // Focus input
        document.getElementById('answer-input').focus();
    }

    window.prevQuestion = function() {
        if (currentQuestionIndex > 0) {
            saveCurrentAnswerTime();
            currentQuestionIndex--;
            loadQuestion();
        }
    };

    function saveCurrentAnswerTime() {
        const answerText = document.getElementById('answer-input').value.trim();
        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000); // in seconds
        
        if (answers[currentQuestionIndex]) {
            answers[currentQuestionIndex].answer = answerText;
            answers[currentQuestionIndex].timeSpent += timeSpent;
        } else {
            answers[currentQuestionIndex] = {
                question: questions[currentFaction][currentQuestionIndex],
                answer: answerText,
                timeSpent: timeSpent
            };
        }
    }

    window.nextQuestion = function() {
        const answerText = document.getElementById('answer-input').value.trim();
        if (!answerText) {
            alert('Por favor, responde la pregunta antes de continuar.');
            return;
        }
        
        saveCurrentAnswerTime();
        
        const list = questions[currentFaction];
        if (currentQuestionIndex < list.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            submitApplication();
        }
    };

    function submitApplication() {
        document.getElementById('btn-next').textContent = 'Enviando...';
        document.getElementById('btn-next').disabled = true;
        
        const submissionData = {
            faction: currentFaction,
            submittedAt: new Date().toISOString(),
            answers: answers,
            discordId: discordUser ? discordUser.id : null,
            discordUsername: discordUser ? discordUser.username : null,
            status: "pending" // Estado inicial
        };
        
        // 1. Guardar en Firebase (si está configurado)
        let savePromise = Promise.resolve({ id: "offline-" + Date.now() });
        if (db) {
            savePromise = db.collection("postulaciones").add(submissionData);
        } else {
            console.log("Firebase no configurado o cargado. Omitiendo guardado en base de datos.");
        }
        
        // 2. Enviar a Discord pasándole el ID de la base de datos
        savePromise.then((docRef) => {
            submissionData.id = docRef.id; // Asignamos el ID generado por Firebase
            return sendToDiscord(submissionData);
        }).then(() => {
            document.getElementById('step-form').classList.remove('active');
            document.getElementById('step-success').classList.add('active');
        }).catch(err => {
            console.error("Error al enviar postulación:", err);
            document.getElementById('step-form').classList.remove('active');
            document.getElementById('step-success').classList.add('active');
        }).finally(() => {
            document.getElementById('btn-next').disabled = false;
        });
    }

    function sendToDiscord(data) {
        if (!discordWebhookUrl || discordWebhookUrl === 'TU_DISCORD_WEBHOOK_URL_AQUI') {
            console.log("Discord Webhook no configurado. Omitiendo envío a Discord.");
            return Promise.resolve();
        }
        
        const totalTime = data.answers.reduce((acc, curr) => acc + curr.timeSpent, 0);
        
        const questionFields = data.answers.map((ans, idx) => {
            return {
                name: `Pregunta ${idx + 1}: ${ans.question}`,
                value: `**Respuesta:** ${ans.answer}\n⏱️ *Tiempo de respuesta:* ${ans.timeSpent} segundos`,
                inline: false
            };
        });
        
        const payload = {
            embeds: [{
                title: `📋 Nueva Postulación para la facción: ${data.faction}`,
                description: `**Postulante:** <@${data.discordId || '0'}> (${data.discordUsername || 'No Vinculado'})\n**Discord ID:** \`${data.discordId || '0'}\``,
                color: data.faction === 'PNP' ? 2068736 : 14438467,
                fields: [
                    ...questionFields,
                    {
                        name: "⏱️ Tiempo Total de Demora",
                        value: `**${Math.floor(totalTime / 60)} minutos y ${totalTime % 60} segundos** (${totalTime} segundos en total)`,
                        inline: true
                    },
                    {
                        name: "📅 Fecha y Hora de Envío",
                        value: new Date().toLocaleString('es-PE'),
                        inline: true
                    }
                ],
                footer: {
                    text: "Peru Elegante RP - Sistema de Reclutamiento Autogestionado"
                }
            }]
        };
        
        // Agregar botones interactivos de Discord (Link Buttons) si la URL de aprobación está configurada
        if (approvalServerUrl && approvalServerUrl !== "TU_URL_DE_APROBACION_VERCEL_AQUI") {
            const approveLink = `${approvalServerUrl}/api/approve?id=${data.id}&action=approve`;
            const rejectLink = `${approvalServerUrl}/api/approve?id=${data.id}&action=reject`;
            
            payload.components = [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            style: 5, // Link (abre URL)
                            label: "Aceptar Postulación",
                            url: approveLink,
                            emoji: {
                                name: "🟢"
                            }
                        },
                        {
                            type: 2, // Button
                            style: 5, // Link (abre URL)
                            label: "Rechazar Postulación",
                            url: rejectLink,
                            emoji: {
                                name: "🔴"
                            }
                        }
                    ]
                }
            ];
        }
        
        return fetch(discordWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }

    window.resetForm = function() {
        document.getElementById('step-success').classList.remove('active');
        document.getElementById('step-selection').classList.add('active');
    };
});
