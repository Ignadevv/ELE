const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Reemplazar saltos de línea escapados en la clave privada
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            })
        });
    } catch (e) {
        console.error("Error al inicializar Firebase Admin:", e);
    }
}

const db = admin.apps.length ? admin.firestore() : null;

// Enlaces de Discord de cada facción (Reemplaza con tus links reales)
const FactionLinks = {
    PNP: "https://discord.gg/tu-servidor-pnp", 
    EMS: "https://discord.gg/tu-servidor-ems"  
};

module.exports = async (req, res) => {
    // Configurar cabeceras CORS básicas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id, action } = req.query;

    if (!id || !action) {
        return res.status(400).send("Faltan parámetros obligatorios (id y action).");
    }

    if (!db) {
        return res.status(500).send("Firebase Admin no pudo inicializarse. Asegúrate de configurar las variables de entorno.");
    }

    try {
        const docRef = db.collection('postulaciones').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send("La postulación no fue encontrada en la base de datos.");
        }

        const data = doc.data();
        const discordId = data.discordId;
        const faction = data.faction;

        if (!discordId) {
            return res.status(400).send("El postulante no tiene una ID de Discord vinculada.");
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await docRef.update({ status: newStatus });

        // Enviar Mensaje Directo (DM) usando el Token del Bot de Discord
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
            return res.status(500).send("Falta configurar la variable de entorno DISCORD_BOT_TOKEN en el servidor.");
        }

        // 1. Crear canal de DM con el postulante
        const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient_id: discordId })
        });

        const dmChannel = await dmChannelRes.json();
        if (!dmChannel.id) {
            console.error("Error al crear canal de DM:", dmChannel);
            return res.status(500).send("No se pudo enviar el mensaje privado al usuario. Asegúrate de que el bot comparta un servidor de Discord con el postulante y tenga permisos.");
        }

        // 2. Definir el texto del DM
        let messageText = "";
        if (newStatus === 'approved') {
            const factionLink = FactionLinks[faction] || "https://discord.gg/perueleganterp";
            messageText = `🎉 **¡Buenas noticias!** Tu postulación para ingresar a la facción **${faction}** en **Peru Elegante RP** ha sido **APROBADA**.\n\nPor favor, únete al servidor de Discord oficial de la facción mediante el siguiente enlace para coordinar tu ingreso: ${factionLink}\n\n¡Felicidades y buena suerte!`;
        } else {
            messageText = `🔴 **Postulación de Facción:** Hola, lamentamos informarte que tu postulación para unirte a la facción **${faction}** en **Peru Elegante RP** ha sido **RECHAZADA** en esta oportunidad.\n\nAgradecemos enormemente tu tiempo e interés, y te animamos a volver a postular en futuras convocatorias.`;
        }

        // 3. Enviar el DM
        const sendMsgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: messageText })
        });

        const sendMsgResult = await sendMsgRes.json();
        if (!sendMsgResult.id) {
            console.error("Error al enviar mensaje de DM:", sendMsgResult);
            return res.status(500).send("El canal de DM se creó, pero no se pudo enviar el mensaje.");
        }

        // Responder con HTML elegante de confirmación
        res.status(200).send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Acción Procesada | Peru Elegante RP</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: #0a0a0c;
                        color: #f8f9fa;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .card {
                        background: #121216;
                        border: 1px solid rgba(255,255,255,0.05);
                        padding: 40px;
                        border-radius: 16px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                        max-width: 400px;
                    }
                    h2 {
                        color: ${action === 'approve' ? '#3ba55d' : '#e62e43'};
                        margin-bottom: 10px;
                    }
                    p {
                        color: #adb5bd;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }
                    .badge {
                        display: inline-block;
                        padding: 6px 16px;
                        border-radius: 50px;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 0.8rem;
                        margin-top: 15px;
                        background: ${action === 'approve' ? 'rgba(59, 165, 93, 0.1)' : 'rgba(230, 46, 67, 0.1)'};
                        color: ${action === 'approve' ? '#3ba55d' : '#e62e43'};
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Postulación Procesada</h2>
                    <p>La postulación de la facción <b>${faction}</b> ha sido configurada como:</p>
                    <span class="badge">${action === 'approve' ? 'Aprobado' : 'Rechazado'}</span>
                    <p style="margin-top: 20px;">Se ha notificado al postulante vía Mensaje Privado (DM) en Discord.</p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Error en endpoint de aprobación:", error);
        res.status(500).send("Error interno: " + error.message);
    }
};
