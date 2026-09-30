// Maquette de site pour un commerce de proximité : le métier, le nom et la ville viennent du lien.
//   ?metier=coiffeur|barbier|institut|ongles|fleuriste&nom=…&ville=…&adresse=…&tel=…&rdv=https://…&style=1|2|3
//   #d=… : données réelles du commerce (prestations, avis, note), encodées en base64 dans l'ancre du lien.
// Rien n'est enregistré ni publié : les données d'un vrai commerce n'existent que dans le lien ouvert.
(() => {
  const p = new URLSearchParams(location.search)
  const lire = (k, d = "") => (p.get(k) || d).trim().slice(0, 80)

  // « à Les Clayes » → « aux Clayes », « de Le Chesnay » → « du Chesnay »
  const a = (v) => (/^les /i.test(v) ? "aux " + v.slice(4) : /^le /i.test(v) ? "au " + v.slice(3) : "à " + v)
  const de = (v) => (/^les /i.test(v) ? "des " + v.slice(4) : /^le /i.test(v) ? "du " + v.slice(3) : /^[aeiouyéèh]/i.test(v) ? "d'" + v : "de " + v)

  const METIERS = {
    coiffeur: {
      theme: "coiffeur",
      photos: ["coiffeur-cd1799af", "coiffeur-3af370f6", "coiffeur-09a8a4ef"],
      surtitre: "Salon de coiffure",
      accroche: (v) => `Coupe, couleur et soins pour femmes, hommes et enfants, au cœur ${de(v)}. Prenez rendez-vous en ligne en quelques secondes.`,
      rdv: "Prendre rendez-vous",
      titrePrestations: "Nos prestations",
      prestations: [["Coupe femme", "shampoing, coupe, brushing", "35 €"], ["Coupe homme", "shampoing, coupe, coiffage", "22 €"], ["Coupe enfant", "moins de 12 ans", "15 €"], ["Couleur", "racines ou complète", "dès 55 €"], ["Balayage", "effet naturel et lumineux", "dès 80 €"], ["Brushing", "cheveux courts à longs", "dès 25 €"]],
      avis: [["Camille", "Toujours ravie de ma coupe, et on prend le temps de m'écouter."], ["Julien", "Rapide, précis, prix corrects. Mon coiffeur depuis deux ans."], ["Sophie", "Balayage réussi, conseils au top. Je recommande."]],
    },
    institut: {
      theme: "institut",
      photos: ["institut-edff9d5d", "institut-8ae3b303", "institut-92f6db91"],
      surtitre: "Institut de beauté",
      accroche: (v) => `Soins du visage, épilations, ongles et massages ${a(v)}. Un moment pour vous, sur rendez-vous.`,
      rdv: "Prendre rendez-vous",
      titrePrestations: "Nos soins",
      prestations: [["Soin du visage", "60 min, adapté à votre peau", "65 €"], ["Semi-permanent mains", "tenue deux à trois semaines", "30 €"], ["Pose gel", "avec nail art simple", "dès 49 €"], ["Épilation sourcils", "restructuration comprise", "12 €"], ["Rehaussement de cils", "avec teinture", "55 €"], ["Massage relaxant", "60 min", "70 €"]],
      avis: [["Laura", "Accueil adorable et ongles impeccables trois semaines après."], ["Inès", "Mon soin du visage préféré, je ressors détendue à chaque fois."], ["Marie", "Propre, ponctuel, prix clairs. Je recommande sans hésiter."]],
    },
    fleuriste: {
      theme: "fleuriste",
      photos: ["fleuriste-0708311f", "fleuriste-e2fd590d", "fleuriste-94a46fb0"],
      surtitre: "Artisan fleuriste",
      accroche: (v) => `Bouquets du jour, compositions pour toutes les occasions et livraison ${a(v)} et alentours.`,
      rdv: "Commander un bouquet",
      titrePrestations: "Nos créations",
      prestations: [["Bouquet du jour", "fleurs de saison, composé devant vous", "dès 25 €"], ["Bouquet signature", "grand format, emballage soigné", "dès 45 €"], ["Deuil", "gerbes, couronnes, coussins", "sur devis"], ["Mariage", "bouquet, boutonnières, décor", "sur devis"], ["Plantes", "intérieur et extérieur", "dès 15 €"], ["Livraison", `${lire("ville", "votre ville")} et alentours`, "dès 8 €"]],
      avis: [["Nathalie", "Des bouquets magnifiques et toujours de bons conseils."], ["Thomas", "Commande passée la veille, livrée à l'heure pour l'anniversaire."], ["Claire", "Superbe travail pour notre mariage, merci encore."]],
    },
  }

  // Deux variantes : le barbier (coiffure homme) et l'onglerie (institut dédié aux ongles)
  METIERS.barbier = {
    ...METIERS.coiffeur,
    photos: ["coiffeur-f90d7866", "coiffeur-8967a841", "barbier-003bc20d"],
    surtitre: "Barbier",
    accroche: (v) => `Coupe homme, barbe et soins du visage, au cœur ${de(v)}. Réservez votre créneau en quelques secondes.`,
    prestations: [["Coupe homme", "shampoing, coupe, coiffage", "15 €"], ["Coupe + barbe", "avec traçage", "18 €"], ["Coupe enfant", "moins de 10 ans", "10 €"], ["Barbe", "taille et traçage", "10 €"], ["Soin du visage", "gommage et vapeur", "15 €"], ["Motif", "dessin rasé", "5 €"]],
    avis: [["Karim", "Coupe nette et barbe parfaite, comme à chaque fois."], ["Lucas", "Accueil top, rapide et soigné. Je recommande."], ["Mehdi", "Le meilleur barber du coin, prix corrects."]],
  }
  METIERS.ongles = {
    ...METIERS.institut,
    photos: ["institut-e1f6ae16", "institut-8ae3b303", "institut-30af8719"],
    surtitre: "Onglerie",
    accroche: (v) => `Pose gel, semi-permanent, nail art et beauté des pieds ${a(v)}. Des ongles impeccables, sur rendez-vous.`,
    titrePrestations: "Nos prestations",
  }

  // Données réelles du commerce, si le lien en porte (#d=base64 d'un JSON UTF-8)
  let reel = {}
  try {
    const m = location.hash.match(/d=([A-Za-z0-9_-]+)/)
    if (m) reel = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(m[1].replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))))
  } catch {}

  const metier = METIERS[lire("metier")] || METIERS.coiffeur
  if (Array.isArray(reel.prestations) && reel.prestations.length) metier.prestations = reel.prestations
  if (Array.isArray(reel.avis) && reel.avis.length) metier.avis = reel.avis
  const nom = lire("nom", { fleuriste: "Votre boutique", institut: "Votre institut", ongles: "Votre institut" }[lire("metier")] || "Votre salon")
  const ville = lire("ville", "votre ville")
  const adresse = lire("adresse", `Adresse du commerce, ${ville}`)
  const tel = lire("tel")
  const rdv = lire("rdv")
  const $ = (id) => document.getElementById(id)
  const texte = (el, t) => {
    el.textContent = t
    return el
  }

  document.body.classList.add("theme-" + metier.theme)
  document.title = `${nom} · ${metier.surtitre} ${a(ville)}`
  texte($("bandeau"), reel.source ? `Maquette proposée à ${nom}, non officielle. Prestations, prix et avis relevés sur ${reel.source}.` : `Maquette proposée à ${nom}, non officielle. Textes, prix et avis d'exemple.`)
  document.querySelectorAll('[data-champ="nom"]').forEach((e) => texte(e, nom))
  document.querySelectorAll('[data-champ="ville"]').forEach((e) => texte(e, ville))
  texte($("surtitre"), `${metier.surtitre} ${a(ville)}`)
  texte($("accroche"), metier.accroche(ville))
  texte($("note-avis"), reel.note ? `★ ${reel.note}` : "★ 4,9 sur 5 · avis Google d'exemple")
  if (reel.accroche) texte($("accroche"), reel.accroche)
  if (reel.source) {
    texte($("note-prix"), `Prestations et prix relevés sur ${reel.source}. Vous les modifiez vous-même, à tout moment.`)
    texte($("note-avis-bas"), `Avis de vos clients, relevés sur ${reel.source}.`)
  }
  // Photos d'ambiance du métier (domaine public) : sur le vrai site, ce sont vos photos
  document.querySelectorAll(".hero-visuel span").forEach((s, i) => (s.style.backgroundImage = `url("assets/photos/${metier.photos[i]}.jpg")`))
  texte($("titre-prestations"), metier.titrePrestations)
  texte($("adresse"), adresse)

  // Style : trois variantes par métier (couleurs et typographie), pour que deux commerces voisins n'aient pas la même page
  const style = ["1", "2", "3"].includes(lire("style")) ? lire("style") : "1"
  document.body.classList.add("style-" + style)

  // Boutons : réservation en ligne (Planity ou autre) si le lien est fourni, sinon le formulaire de demande
  for (const id of ["haut-rdv", "bouton-rdv", "bas-rdv"]) {
    const a = texte($(id), id === "haut-rdv" ? (metier.theme === "fleuriste" ? "Commander" : "Réserver") : metier.rdv)
    a.href = "#demande"
    if (rdv.startsWith("https://")) {
      a.href = rdv
      a.target = "_blank"
      a.rel = "noopener"
    }
  }

  // Formulaire de demande : le commerçant la reçoit par e-mail ou SMS et rappelle
  const fleuriste = metier === METIERS.fleuriste
  texte($("titre-demande"), fleuriste ? "Commander un bouquet" : "Demander un rendez-vous")
  texte($("aide-demande"), rdv.startsWith("https://") ? "Vous pouvez aussi réserver directement en ligne avec le bouton « Prendre rendez-vous »." : fleuriste ? "Dites-nous l'occasion et le jour : nous vous rappelons pour composer votre bouquet." : "Choisissez une prestation et un jour : nous vous rappelons pour fixer l'heure.")
  texte($("libelle-choix"), fleuriste ? "L'occasion" : "La prestation")
  texte($("libelle-jour"), fleuriste ? "Pour quel jour ?" : "Le jour souhaité")
  texte($("envoyer-demande"), fleuriste ? "Envoyer ma commande" : "Envoyer ma demande")
  const choix = $("choix-demande")
  for (const o of fleuriste ? ["Anniversaire", "Remerciement", "Naissance", "Mariage", "Deuil", "Autre"] : metier.prestations.map((x) => x[0])) choix.append(texte(document.createElement("option"), o))
  $("form-demande").addEventListener("submit", (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const manque = !String(f.get("nom")).trim() || !String(f.get("tel")).trim()
    $("erreur-demande").hidden = !manque
    if (manque) return
    e.target.hidden = true
    const m = texte($("merci-demande"), `Merci ${String(f.get("nom")).trim().split(" ")[0]}, votre demande est envoyée. ${nom} la reçoit aussitôt par e-mail ou par SMS et vous rappelle. (Démonstration : rien n'est envoyé.)`)
    m.hidden = false
  })
  for (const id of ["bouton-appel", "bas-appel"]) {
    const a = $(id)
    if (tel) {
      a.href = "tel:" + tel.replace(/[^\d+]/g, "")
      a.textContent = "Appeler le " + tel
    }
  }

  const liste = $("liste-prestations")
  for (const [t, d, prix] of metier.prestations) {
    const li = document.createElement("li")
    const g = document.createElement("div")
    g.append(texte(document.createElement("strong"), t), texte(document.createElement("span"), d))
    li.append(g, texte(document.createElement("b"), prix))
    liste.append(li)
  }
  const avis = $("avis")
  for (const [qui, dit] of metier.avis) {
    const li = document.createElement("li")
    li.append(texte(document.createElement("span"), "★★★★★"), texte(document.createElement("p"), dit), texte(document.createElement("small"), qui))
    avis.append(li)
  }
  const JOURS = Array.isArray(reel.horaires) && reel.horaires.length === 7 ? reel.horaires : [["Lundi", "Fermé"], ["Mardi", "9 h 30 – 19 h"], ["Mercredi", "9 h 30 – 19 h"], ["Jeudi", "9 h 30 – 19 h"], ["Vendredi", "9 h 30 – 19 h"], ["Samedi", "9 h – 18 h"], ["Dimanche", "Fermé"]]
  if (JOURS !== reel.horaires) texte($("note-horaires"), "Horaires d'exemple.")
  const h = $("horaires")
  for (const [j, v] of JOURS) {
    const d = document.createElement("div")
    d.append(texte(document.createElement("dt"), j), texte(document.createElement("dd"), v))
    h.append(d)
  }
})()
