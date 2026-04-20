// ==========================================
// TICKET.JS — VERSION COMPLÈTE AVEC FRUITS
// ET TICKET DE SCORE DÉTAILLÉ
// ==========================================

let ticket = [];
let confettiStarted = false;

// ------------------------------------------
// UTILITAIRES
// ------------------------------------------

const applyStyles = (el, styles) => Object.assign(el.style, styles);

const create = (tag, styles = {}, html = "") => {
    const el = document.createElement(tag);
    applyStyles(el, styles);
    if (html) el.innerHTML = html;
    return el;
};

// Couleur selon combo
const getComboColor = combo =>
    combo >= 10 ? "#FF1493" :
    combo >= 7  ? "#FF4500" :
    combo >= 5  ? "#FF8C00" :
                  "#FFD700";

// ------------------------------------------
// FONCTIONS DE BASE
// ------------------------------------------

function addToTicket(symbol) { ticket.push(symbol); }
function resetTicket() { ticket = []; confettiStarted = false; }

function createOverlay(z = 1500) {
    return create("div", {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background .4s",
        zIndex: z
    });
}

function createPopup(z = 1550, borderColor = "#4caf50") {
    return create("div", {
        background: "linear-gradient(145deg,#2a2a2a,#1a1a1a)",
        border: `3px solid ${borderColor}`,
        borderRadius: "15px",
        padding: "35px",
        textAlign: "center",
        width: "550px",
        boxShadow: "0 10px 40px rgba(0,0,0,.5)",
        opacity: "0",
        transform: "scale(.8) translateY(15px)",
        transition: "all .5s cubic-bezier(.34,1.56,.64,1)",
        zIndex: z
    });
}

function createSubWindow(title, borderColor = "#4caf50") {
    const overlay = create("div", {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0)",
        opacity: "0",
        pointerEvents: "none",
        transition: ".3s",
        zIndex: 1699
    });

    const box = create("div", {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(.8)",
        background: "linear-gradient(145deg,#2a2a2a,#1a1a1a)",
        border: `3px solid ${borderColor}`,
        borderRadius: "15px",
        padding: "30px",
        width: "90%",
        maxWidth: "500px",
        maxHeight: "80vh",
        overflowY: "auto",
        opacity: "0",
        pointerEvents: "none",
        transition: ".4s cubic-bezier(.34,1.56,.64,1)",
        zIndex: 1700
    });

    const titleEl = create("div", {
        color: borderColor,
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginBottom: "20px",
        textAlign: "center"
    }, title);

    box.appendChild(titleEl);

    overlay.onclick = hide;
    document.body.appendChild(overlay);
    document.body.appendChild(box);

    function show() {
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "auto";
        box.style.opacity = "1";
        box.style.transform = "translate(-50%, -50%) scale(1)";
        box.style.pointerEvents = "auto";
    }

    function hide() {
        box.style.opacity = "0";
        box.style.transform = "translate(-50%, -50%) scale(.8)";
        box.style.pointerEvents = "none";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
    }

    return { box, show, hide, overlay };
}

// ------------------------------------------
// AFFICHAGE DU RESULTAT COMPLET
// ------------------------------------------

function showResultOverlay(attempts, elapsedTime) {

    const overlay = createOverlay();
    const content = createPopup();

    // --- Titre ---
    content.appendChild(create("h2", {
        color: "#4caf50",
        fontSize: "2.4rem",
        textShadow: "0 0 10px rgba(76,175,80,.5)",
        marginBottom: "25px"
    }, "🎉 RÉSULTAT 🎉"));

    // --- Score principal ---
    const finalScore = scoreManager.getScore();
    const scoreBox = create("div", {
        background: "#333",
        padding: "20px",
        borderRadius: "10px",
        border: "2px solid #444",
        marginBottom: "25px"
    });

    scoreBox.innerHTML = `
        <div style="display:flex;justify-content:space-around;color:white;font-size:1.3rem;margin-bottom:10px;">
            <div>⏱️ <b>Temps :</b> ${elapsedTime}</div>
            <div>🎯 <b>Tentatives :</b> ${attempts}</div>
        </div>
        <div style="color:#4caf50;font-size:1.3rem;margin-top:15px;padding-top:15px;border-top:1px solid #555;display:flex;justify-content:space-between;align-items:center;">
            <span>💰 <b>Score Total :</b></span>
            <span style="font-weight:bold;font-size:1.4rem;">${finalScore} pts</span>
            <button id="scoreDetailsBtn"
                style="padding:8px 16px;background:#4caf50;color:white;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">
                Détails
            </button>
        </div>
    `;
    content.appendChild(scoreBox);

    // --- Détails du score (ticket détaillé par paire) ---
    const scoreHistoryData = scoreManager.getHistory();
    const scoreDetails = createSubWindow("🧾 DÉTAILS DU SCORE", "#4caf50");

    const receipt = create("div", {
        background: "white",
        color: "black",
        padding: "20px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "0.95rem",
        marginBottom: "20px"
    });

    let receiptHTML = `<div style="border-bottom:2px dashed #888;padding-bottom:10px;margin-bottom:15px;text-align:center;font-weight:bold;">
        TICKET DE SCORE
    </div>`;

    // Affichage détaillé de chaque paire
    scoreHistoryData.forEach((entry, i) => {
        if (entry.combo && entry.speed && entry.points) {
            receiptHTML += `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span>Paire ${i+1} (${entry.combo}-HIT, vitesse x${entry.speed})</span>
                <span style="font-weight:bold;">+${entry.points} pts</span>
            </div>
            <div style="color:#666;font-size:0.85rem;margin-bottom:12px;padding-left:10px;">
                ${basePoints} pts × ${entry.combo} combo × vitesse ${entry.speed}
            </div>
            `;
        }
    });

    // Total final
    receiptHTML += `
        <div style="border-top:2px solid #888;margin-top:15px;padding-top:15px;display:flex;justify-content:space-between;font-weight:bold;font-size:1.1rem;">
            <span>TOTAL</span>
            <span style="color:#4caf50;">${finalScore} PTS</span>
        </div>
    `;

    receipt.innerHTML = receiptHTML;
    scoreDetails.box.appendChild(receipt);

    // --- Bouton fermeture ---
    const closeScoreBtn = create("button", {
        width: "100%",
        padding: "12px",
        marginTop: "20px",
        background: "#4caf50",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer"
    }, "🎫 Revenir sur le ticket");

    closeScoreBtn.onclick = () => scoreDetails.hide();
    scoreDetails.box.appendChild(closeScoreBtn);

    // --- Statistiques combo ---
    const maxCombo = comboManager.getMaxCombo();
    const comboStats = createSubWindow("📊 STATISTIQUES DE COMBO", "#FF9800");

    const finalComboPeaks = {};
    let currentCombo = 0;

    scoreHistoryData.forEach(e => {
        const c = e.combo || 0;

        if (c > currentCombo) {
            currentCombo = c;
        } else if (c < currentCombo) {
            if (currentCombo >= 2) {
                finalComboPeaks[currentCombo] = (finalComboPeaks[currentCombo] || 0) + 1;
            }
            currentCombo = c;
        }
    });

    if (currentCombo >= 2) finalComboPeaks[currentCombo] = (finalComboPeaks[currentCombo] || 0) + 1;

    if (Object.keys(finalComboPeaks).length) {
        const btn = create("button", {
            padding: "8px 16px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
        }, "Détails");

        const line = create("div", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "15px",
            marginTop: "15px",
            borderTop: "1px solid #555",
            color: "#FFD700",
            fontSize: "1.3rem"
        }, `
            <span>🔥 <b>Meilleur Combo :</b></span>
            <span style="font-size:1.4rem;font-weight:bold;">${maxCombo} HIT</span>
        `);

        line.appendChild(btn);
        scoreBox.appendChild(line);

        btn.onclick = () => comboStats.show();

        const grid = create("div", {
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "12px",
            marginBottom: "20px"
        });

        Object.keys(finalComboPeaks).map(Number).sort((a, b) => a - b).forEach(combo => {
            const color = getComboColor(combo);
            const box = create("div", {
                background: "#1a1a1a",
                borderRadius: "8px",
                border: "2px solid #555",
                padding: "12px",
                display: "flex",
                justifyContent: "space-between"
            }, `
                <span style="color:${color};font-weight:bold;">${combo}-HIT</span>
                <span style="color:white;">×${finalComboPeaks[combo]}</span>
            `);
            grid.appendChild(box);
        });

        comboStats.box.appendChild(grid);

        const closeComboBtn = create("button", {
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer"
        }, "🎫 Revenir sur le ticket");

        closeComboBtn.onclick = () => comboStats.hide();
        comboStats.box.appendChild(closeComboBtn);
    }

    // --- Bouton détails ---
    content.addEventListener("click", e => {
        if (e.target.id === "scoreDetailsBtn") scoreDetails.show();
    });

    // --- Ticket visuel fruits ---
    const ticketBox = create("div", {
        background: "white",
        padding: "25px",
        borderRadius: "10px",
        border: "3px dashed #888",
        margin: "25px 0"
    });

    ticketBox.append(
        create("div", {
            textAlign: "center",
            fontWeight: "bold",
            borderBottom: "2px dashed #888",
            paddingBottom: "10px",
            marginBottom: "15px",
            color: "#000000"
        }, "🎫 TICKET DE RÉUSSITE")
    );

    const gridTicket = create("div", {
        display: "grid",
        gridTemplateColumns: "repeat(8,1fr)",
        gap: "8px"
    });

    ticket.forEach((sym, i) => {
        gridTicket.appendChild(create("div", {
            fontSize: "1.8rem",
            background: i % 2 ? "#e8e8e8" : "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "5px",
            textAlign: "center"
        }, sym));
    });

    ticketBox.appendChild(gridTicket);

    ticketBox.append(
        create("div", {
            textAlign: "center",
            marginTop: "15px",
            paddingTop: "10px",
            borderTop: "2px dashed #888",
            fontFamily: "monospace",
            color: "#666"
        }, "N° " + Math.random().toString(36).substring(2, 9).toUpperCase())
    );

    content.appendChild(ticketBox);

    // --- Boutons bas ---
    const zone = create("div", {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginTop: "25px"
    });

    const btnGrid = create("button", {
        background: "#2196F3",
        color: "white",
        padding: "15px 40px",
        fontSize: "1.2rem",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
    }, "🎯 Voir la grille");

    const btnReplay = create("button", {
        background: "#4caf50",
        color: "white",
        padding: "15px 40px",
        fontSize: "1.2rem",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
    }, "🔄 Rejouer");

    btnReplay.onclick = () => location.reload();
    zone.append(btnGrid, btnReplay);
    content.appendChild(zone);

    btnGrid.onclick = () => {
        content.style.opacity = "0";
        content.style.transform = "scale(0.9) translateY(-20px)";

        setTimeout(() => {
            content.style.display = "none";
            overlay.style.background = "rgba(0,0,0,0.10)";

            const back = document.createElement("button");
            back.textContent = "🎫 Voir le ticket";
            applyStyles(back, {
                position: "fixed",
                bottom: "25px",
                left: "50%",
                transform: "translateX(-50%) translateY(100px)",
                padding: "15px 40px",
                background: "#FF9800",
                color: "white",
                fontSize: "1.2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                opacity: "0",
                transition: ".4s cubic-bezier(.34,1.56,.64,1)",
                zIndex: "1600"
            });

            back.onclick = () => {
                overlay.style.background = "rgba(0,0,0,0.85)";
                content.style.display = "block";
                requestAnimationFrame(() => {
                    content.style.opacity = "1";
                    content.style.transform = "scale(1) translateY(0)";
                });
                back.remove();
            };

            document.body.appendChild(back);
            requestAnimationFrame(() => {
                back.style.opacity = "1";
                back.style.transform = "translateX(-50%) translateY(0)";
            });

        }, 400);
    };

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // --- Animation + confetti ---
    requestAnimationFrame(() => {
        overlay.style.background = "rgba(0,0,0,.85)";
        content.style.opacity = "1";
        content.style.transform = "scale(1) translateY(0)";
        if (!confettiStarted && typeof launchConfetti === "function") {
            launchConfetti();
            confettiStarted = true;
        }
    });
}
