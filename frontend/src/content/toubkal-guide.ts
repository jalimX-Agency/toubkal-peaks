import type { Locale } from "@/i18n/config";

export interface GuideSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface GuidePage {
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  facts: { label: string; value: string }[];
  sections: GuideSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  cta: { title: string; text: string; button: string };
}

/**
 * The Mount Toubkal climbing guide (/toubkal-guide): the company's signature climb, written as a
 * practical guide for people preparing the ascent. Altitudes and times are those of the classic route.
 */
export const toubkalGuide: Record<Locale, GuidePage> = {
  en: {
    title: "Mount Toubkal climbing guide: route, seasons and practical advice",
    description: "How to climb Mount Toubkal (4,167 m): the classic route from Imlil, two or three days, the best season, difficulty and altitude, guides and refuges, and what to pack.",
    eyebrow: "Guide",
    lead: "Everything you need to prepare the ascent of North Africa’s highest summit: the route from Imlil, how many days to plan, when to go, how hard it is and what to bring.",
    facts: [
      { label: "Summit", value: "4,167 m" },
      { label: "Start", value: "Imlil, 1,740 m" },
      { label: "Refuge", value: "3,207 m" },
      { label: "Classic climb", value: "2 days" },
      { label: "Best seasons", value: "Apr–Jun, Sep–Oct" },
      { label: "Guide", value: "Licensed guide required" },
    ],
    sections: [
      {
        heading: "Mount Toubkal at a glance",
        body: [
          "Jbel Toubkal rises to 4,167 m in the Toubkal National Park, about 65 km south of Marrakech. It is the highest summit of the Atlas and of North Africa, and one of the most rewarding high mountains to climb without technical skills.",
          "The ascent starts in Imlil, a Berber village at 1,740 m, about 1.5 hours by road from Marrakech. From there a mule path climbs the Mizane valley to the refuges below the summit, and a stony trail leads to the top.",
        ],
      },
      {
        heading: "The classic route, day by day",
        body: [
          "Day 1, Imlil to the refuge (about 12 km, +1,450 m, 5–6 hours of walking): the trail passes Aroumd, crosses the flood plain and climbs to the shrine of Sidi Chamharouch (2,350 m), a good place for a mint tea. It then rises steadily to the Toubkal refuge at 3,207 m, where you spend the night. Mules carry the luggage.",
          "Day 2, summit and descent (about 3–4 hours up, then 5–6 hours down to Imlil): the start is early, often around 4 or 5 am, to reach the summit around sunrise. The path climbs a scree slope to a col, then follows the ridge to the summit tripod. On a clear day the view stretches from the Sahara to the Atlantic plains. You then walk back down to Imlil.",
        ],
      },
      {
        heading: "Two days, three days or more?",
        body: [
          "Two days is the classic ascent and suits fit walkers. The second day is long: around 10 hours of walking with more than 900 m of ascent and over 2,400 m of descent.",
          "Three days gives your body more time to adapt to the altitude: you can sleep a first night lower down, in Imlil or Aroumd, or spend a second night at the refuge after the summit. It is the better choice for a first experience at altitude, for families and in winter.",
          "Longer treks combine Toubkal with the valleys around it, such as the Azzaden valley or the Ouanoukrim peaks, and make the climb part of a journey through Berber villages.",
        ],
      },
      {
        heading: "When to climb Toubkal",
        body: [
          "April to June and September to October are the best months: mild temperatures, little or no snow on the trail and long days.",
          "In July and August the valleys are hot, but the summit stays cool; afternoon storms are possible, so start early.",
          "From December to March the mountain is under snow. Toubkal then becomes a winter climb that needs crampons, an ice axe and some mountain experience, with nights below zero at the refuge. It is beautiful, but plan an extra day and follow your guide’s decisions on the weather.",
        ],
      },
      {
        heading: "How hard is it? Fitness and altitude",
        body: [
          "In summer the climb is not technical, but it is physically demanding: long days on stony paths and a steep scree slope near the summit. If you can walk 6 to 8 hours in the hills, you can climb Toubkal.",
          "Above 3,000 m many people feel the altitude: headache, shortness of breath, poor sleep or loss of appetite. Walk slowly, drink a lot and tell your guide how you feel. If the symptoms get worse, going down is the remedy; a three-day programme greatly reduces the risk.",
        ],
      },
      {
        heading: "Guides, mules and refuges",
        body: [
          "A licensed mountain guide is required to climb Toubkal. Your guide knows the route in every season, sets the pace, watches the weather and how the group feels, and shares the life of the mountain villages along the way.",
          "Muleteers and their mules carry the luggage, food and equipment from Imlil to the refuge, so you only walk with a day pack. At the refuge you sleep in dormitories, with dinner and breakfast prepared there.",
        ],
      },
      {
        heading: "What to pack",
        body: ["Even in summer, nights and early mornings are cold at the refuge and on the summit. Pack light, in layers:"],
        list: [
          "Broken-in walking boots with a good grip",
          "Warm layers: fleece, down jacket, hat and gloves",
          "Waterproof and windproof jacket",
          "Sunglasses, sun cream and a sun hat",
          "Head torch for the early summit start",
          "Water bottle (1.5–2 litres) and snacks",
          "Sleeping bag liner for the refuge; walking poles help on the descent",
          "In winter: crampons, ice axe and gaiters (your guide will advise you)",
        ],
      },
    ],
    faqTitle: "Questions about climbing Toubkal",
    faq: [
      { q: "Can a beginner climb Mount Toubkal?", a: "Yes, in summer, if you are in good shape and used to long walks. It is a trek, not a rock climb. A three-day programme is recommended for a first time at altitude." },
      { q: "Do I need a guide to climb Toubkal?", a: "Yes. A licensed mountain guide is required for the ascent, and the guide also organises the mules, the refuge and the meals." },
      { q: "How long does the Toubkal climb take?", a: "Two days for the classic ascent from Imlil: about 5–6 hours to the refuge on the first day, then the summit and the descent to Imlil on the second." },
      { q: "Can I climb Toubkal in winter?", a: "Yes, from December to March, as a winter mountaineering climb with crampons and an ice axe. Some experience is recommended, and the programme depends on the snow and the weather." },
      { q: "Where do you sleep on the Toubkal trek?", a: "At the Toubkal refuge (3,207 m), in dormitories with meals provided. Before or after the climb you can stay in Imlil, at Riad Berber Towers." },
    ],
    cta: { title: "Ready to climb Toubkal?", text: "Choose a two- or three-day ascent, or a longer trek around the massif. We organise the guide, the mules, the refuge and your transfer from Marrakech.", button: "See the Toubkal treks" },
  },
  fr: {
    title: "Guide de l'ascension du Toubkal : itinéraire, saisons et conseils pratiques",
    description: "Comment gravir le Toubkal (4 167 m) : l'itinéraire classique depuis Imlil, en deux ou trois jours, la meilleure saison, la difficulté et l'altitude, les guides et refuges, et que mettre dans son sac.",
    eyebrow: "Guide",
    lead: "Tout ce qu'il faut savoir pour préparer l'ascension du plus haut sommet d'Afrique du Nord : l'itinéraire depuis Imlil, le nombre de jours, la saison, la difficulté et l'équipement.",
    facts: [
      { label: "Sommet", value: "4 167 m" },
      { label: "Départ", value: "Imlil, 1 740 m" },
      { label: "Refuge", value: "3 207 m" },
      { label: "Ascension classique", value: "2 jours" },
      { label: "Meilleures saisons", value: "avr.–juin, sept.–oct." },
      { label: "Guide", value: "Guide agréé obligatoire" },
    ],
    sections: [
      {
        heading: "Le Toubkal en bref",
        body: [
          "Le jbel Toubkal culmine à 4 167 m dans le parc national du Toubkal, à environ 65 km au sud de Marrakech. C'est le plus haut sommet de l'Atlas et d'Afrique du Nord, et l'une des plus belles hautes montagnes accessibles sans technique d'escalade.",
          "L'ascension part d'Imlil, village berbère à 1 740 m, à environ 1 h 30 de route de Marrakech. Un sentier muletier remonte la vallée de l'Ait Mizane jusqu'aux refuges au pied du sommet, puis un chemin caillouteux mène au sommet.",
        ],
      },
      {
        heading: "L'itinéraire classique, jour par jour",
        body: [
          "Jour 1, d'Imlil au refuge (environ 12 km, +1 450 m, 5 à 6 heures de marche) : le sentier passe par Aroumd, traverse le lit de la rivière et monte jusqu'au sanctuaire de Sidi Chamharouch (2 350 m), une bonne halte pour un thé à la menthe. Il grimpe ensuite régulièrement jusqu'au refuge du Toubkal, à 3 207 m, où vous passez la nuit. Les mules portent les bagages.",
          "Jour 2, sommet et descente (environ 3 à 4 heures de montée, puis 5 à 6 heures de descente jusqu'à Imlil) : départ très matinal, souvent vers 4 ou 5 h, pour atteindre le sommet au lever du soleil. Le sentier gravit un pierrier jusqu'à un col, puis suit l'arête jusqu'au trépied du sommet. Par temps clair, la vue porte du Sahara aux plaines atlantiques. Vous redescendez ensuite à Imlil.",
        ],
      },
      {
        heading: "Deux jours, trois jours ou plus ?",
        body: [
          "Deux jours, c'est l'ascension classique, pour les marcheurs en forme. Le second jour est long : environ 10 heures de marche, avec plus de 900 m de montée et plus de 2 400 m de descente.",
          "Trois jours laissent au corps le temps de s'adapter à l'altitude : une première nuit plus bas, à Imlil ou Aroumd, ou une seconde nuit au refuge après le sommet. C'est le meilleur choix pour une première expérience en altitude, en famille et en hiver.",
          "Les treks plus longs associent le Toubkal aux vallées voisines, comme la vallée d'Azzaden ou les sommets de l'Ouanoukrim, et font de l'ascension une étape d'un voyage entre villages berbères.",
        ],
      },
      {
        heading: "Quand gravir le Toubkal",
        body: [
          "D'avril à juin et de septembre à octobre : températures douces, peu ou pas de neige sur le sentier et longues journées.",
          "En juillet et août, les vallées sont chaudes mais le sommet reste frais ; des orages sont possibles l'après-midi, d'où l'intérêt de partir tôt.",
          "De décembre à mars, la montagne est enneigée. Le Toubkal devient une ascension hivernale qui demande crampons, piolet et une première expérience de la montagne, avec des nuits sous zéro au refuge. C'est superbe, mais prévoyez un jour de plus et suivez les décisions de votre guide selon la météo.",
        ],
      },
      {
        heading: "Est-ce difficile ? Condition physique et altitude",
        body: [
          "En été, l'ascension n'est pas technique mais elle est exigeante : de longues journées sur des sentiers caillouteux et un pierrier raide près du sommet. Si vous pouvez marcher 6 à 8 heures en montagne, vous pouvez gravir le Toubkal.",
          "Au-dessus de 3 000 m, beaucoup ressentent l'altitude : maux de tête, essoufflement, sommeil agité ou perte d'appétit. Marchez lentement, buvez beaucoup et dites à votre guide comment vous vous sentez. Si les symptômes s'aggravent, le remède est de redescendre ; un programme de trois jours réduit fortement ce risque.",
        ],
      },
      {
        heading: "Guides, mules et refuges",
        body: [
          "Un guide de montagne agréé est obligatoire pour gravir le Toubkal. Votre guide connaît l'itinéraire en toute saison, donne le rythme, surveille la météo et l'état du groupe, et vous fait découvrir la vie des villages de montagne.",
          "Les muletiers et leurs mules portent bagages, nourriture et matériel d'Imlil au refuge : vous ne marchez qu'avec un petit sac. Au refuge, vous dormez en dortoir, avec le dîner et le petit-déjeuner préparés sur place.",
        ],
      },
      {
        heading: "Que mettre dans son sac",
        body: ["Même en été, les nuits et les petits matins sont froids au refuge et au sommet. Voyagez léger, en couches :"],
        list: [
          "Chaussures de randonnée déjà portées, avec une bonne accroche",
          "Couches chaudes : polaire, doudoune, bonnet et gants",
          "Veste imperméable et coupe-vent",
          "Lunettes de soleil, crème solaire et chapeau",
          "Lampe frontale pour le départ matinal",
          "Gourde (1,5 à 2 litres) et en-cas",
          "Drap de sac pour le refuge ; les bâtons aident à la descente",
          "En hiver : crampons, piolet et guêtres (votre guide vous conseillera)",
        ],
      },
    ],
    faqTitle: "Questions sur l'ascension du Toubkal",
    faq: [
      { q: "Un débutant peut-il gravir le Toubkal ?", a: "Oui, en été, si vous êtes en forme et habitué aux longues marches. C'est un trek, pas de l'escalade. Un programme de trois jours est conseillé pour une première fois en altitude." },
      { q: "Faut-il un guide pour gravir le Toubkal ?", a: "Oui. Un guide de montagne agréé est obligatoire pour l'ascension ; il organise aussi les mules, le refuge et les repas." },
      { q: "Combien de temps dure l'ascension du Toubkal ?", a: "Deux jours pour l'ascension classique depuis Imlil : environ 5 à 6 heures jusqu'au refuge le premier jour, puis le sommet et la descente à Imlil le second." },
      { q: "Peut-on gravir le Toubkal en hiver ?", a: "Oui, de décembre à mars, en ascension hivernale avec crampons et piolet. Une première expérience est conseillée et le programme dépend de la neige et de la météo." },
      { q: "Où dort-on pendant le trek du Toubkal ?", a: "Au refuge du Toubkal (3 207 m), en dortoir, repas compris. Avant ou après l'ascension, vous pouvez loger à Imlil, au Riad Berber Towers." },
    ],
    cta: { title: "Prêt à gravir le Toubkal ?", text: "Choisissez une ascension en deux ou trois jours, ou un trek plus long autour du massif. Nous organisons le guide, les mules, le refuge et votre transfert depuis Marrakech.", button: "Voir les treks du Toubkal" },
  },
  es: {
    title: "Guía para subir al Toubkal: ruta, temporadas y consejos prácticos",
    description: "Cómo subir al Toubkal (4.167 m): la ruta clásica desde Imlil, en dos o tres días, la mejor época, la dificultad y la altitud, guías y refugios, y qué llevar.",
    eyebrow: "Guía",
    lead: "Todo lo que necesitas para preparar la ascensión a la cumbre más alta del norte de África: la ruta desde Imlil, cuántos días prever, cuándo ir, su dificultad y qué llevar.",
    facts: [
      { label: "Cumbre", value: "4.167 m" },
      { label: "Salida", value: "Imlil, 1.740 m" },
      { label: "Refugio", value: "3.207 m" },
      { label: "Ascensión clásica", value: "2 días" },
      { label: "Mejores épocas", value: "abr.–jun., sep.–oct." },
      { label: "Guía", value: "Guía oficial obligatorio" },
    ],
    sections: [
      {
        heading: "El Toubkal en resumen",
        body: [
          "El yebel Toubkal alcanza 4.167 m en el Parque Nacional del Toubkal, a unos 65 km al sur de Marrakech. Es la cumbre más alta del Atlas y del norte de África, y una de las grandes montañas más gratificantes que se pueden subir sin técnica de escalada.",
          "La ascensión empieza en Imlil, un pueblo bereber a 1.740 m, a 1 h 30 por carretera de Marrakech. Desde allí, un camino de mulas remonta el valle de Mizane hasta los refugios al pie de la cumbre, y un sendero pedregoso lleva hasta la cima.",
        ],
      },
      {
        heading: "La ruta clásica, día a día",
        body: [
          "Día 1, de Imlil al refugio (unos 12 km, +1.450 m, 5–6 horas de marcha): el sendero pasa por Aroumd, cruza el lecho del río y sube al santuario de Sidi Chamharouch (2.350 m), buen sitio para un té a la menta. Después sube de forma constante hasta el refugio del Toubkal, a 3.207 m, donde pasas la noche. Las mulas llevan el equipaje.",
          "Día 2, cumbre y descenso (unas 3–4 horas de subida y 5–6 horas de bajada a Imlil): la salida es temprana, a menudo hacia las 4 o las 5, para llegar a la cumbre al amanecer. El camino sube por una pedrera hasta un collado y sigue la cresta hasta el trípode de la cima. Con buen tiempo, la vista va del Sahara a las llanuras atlánticas. Después bajas a Imlil.",
        ],
      },
      {
        heading: "¿Dos días, tres o más?",
        body: [
          "Dos días es la ascensión clásica, para caminantes en forma. El segundo día es largo: unas 10 horas de marcha, con más de 900 m de subida y más de 2.400 m de bajada.",
          "Tres días dan al cuerpo más tiempo para adaptarse a la altitud: una primera noche más abajo, en Imlil o Aroumd, o una segunda noche en el refugio después de la cumbre. Es la mejor opción para una primera experiencia en altura, en familia y en invierno.",
          "Los trekkings más largos combinan el Toubkal con los valles cercanos, como el valle de Azzaden o las cumbres del Ouanoukrim, y convierten la ascensión en parte de un viaje entre pueblos bereberes.",
        ],
      },
      {
        heading: "Cuándo subir al Toubkal",
        body: [
          "De abril a junio y de septiembre a octubre: temperaturas suaves, poca o ninguna nieve en el sendero y días largos.",
          "En julio y agosto los valles son calurosos, pero la cumbre sigue fresca; puede haber tormentas por la tarde, así que conviene salir temprano.",
          "De diciembre a marzo la montaña está nevada. El Toubkal se convierte en una ascensión invernal que requiere crampones, piolet y algo de experiencia, con noches bajo cero en el refugio. Es precioso, pero prevé un día más y sigue las decisiones de tu guía según el tiempo.",
        ],
      },
      {
        heading: "¿Es difícil? Forma física y altitud",
        body: [
          "En verano la ascensión no es técnica, pero sí exigente: jornadas largas por senderos pedregosos y una pedrera empinada cerca de la cumbre. Si puedes caminar 6 a 8 horas por la montaña, puedes subir al Toubkal.",
          "Por encima de 3.000 m mucha gente nota la altitud: dolor de cabeza, falta de aliento, mal sueño o pérdida de apetito. Camina despacio, bebe mucho y dile a tu guía cómo te sientes. Si los síntomas empeoran, el remedio es bajar; un programa de tres días reduce mucho el riesgo.",
        ],
      },
      {
        heading: "Guías, mulas y refugios",
        body: [
          "Para subir al Toubkal es obligatorio ir con un guía de montaña oficial. Tu guía conoce la ruta en cada estación, marca el ritmo, vigila el tiempo y el estado del grupo, y te acerca a la vida de los pueblos de montaña.",
          "Los muleros y sus mulas llevan el equipaje, la comida y el material de Imlil al refugio, así que solo caminas con una mochila pequeña. En el refugio se duerme en dormitorios, con la cena y el desayuno preparados allí.",
        ],
      },
      {
        heading: "Qué llevar",
        body: ["Incluso en verano, las noches y las primeras horas de la mañana son frías en el refugio y en la cumbre. Lleva poco peso y ropa por capas:"],
        list: [
          "Botas de montaña ya usadas, con buen agarre",
          "Capas de abrigo: forro polar, plumífero, gorro y guantes",
          "Chaqueta impermeable y cortavientos",
          "Gafas de sol, crema solar y sombrero",
          "Linterna frontal para la salida temprana",
          "Cantimplora (1,5–2 litros) y algo de comer",
          "Saco sábana para el refugio; los bastones ayudan en la bajada",
          "En invierno: crampones, piolet y polainas (tu guía te aconsejará)",
        ],
      },
    ],
    faqTitle: "Preguntas sobre la ascensión al Toubkal",
    faq: [
      { q: "¿Puede un principiante subir al Toubkal?", a: "Sí, en verano, si estás en buena forma y acostumbrado a caminatas largas. Es un trekking, no escalada. Se recomienda un programa de tres días para una primera vez en altura." },
      { q: "¿Hace falta un guía para subir al Toubkal?", a: "Sí. Es obligatorio ir con un guía de montaña oficial, que además organiza las mulas, el refugio y las comidas." },
      { q: "¿Cuánto dura la ascensión al Toubkal?", a: "Dos días para la ascensión clásica desde Imlil: unas 5–6 horas hasta el refugio el primer día, y la cumbre y la bajada a Imlil el segundo." },
      { q: "¿Se puede subir al Toubkal en invierno?", a: "Sí, de diciembre a marzo, como ascensión invernal con crampones y piolet. Se recomienda algo de experiencia y el programa depende de la nieve y del tiempo." },
      { q: "¿Dónde se duerme en el trekking del Toubkal?", a: "En el refugio del Toubkal (3.207 m), en dormitorios y con comidas. Antes o después de la ascensión puedes alojarte en Imlil, en el Riad Berber Towers." },
    ],
    cta: { title: "¿Listo para subir al Toubkal?", text: "Elige una ascensión de dos o tres días, o un trekking más largo alrededor del macizo. Organizamos el guía, las mulas, el refugio y tu traslado desde Marrakech.", button: "Ver los trekkings al Toubkal" },
  },
  de: {
    title: "Toubkal-Besteigung: Route, Reisezeit und praktische Tipps",
    description: "So besteigen Sie den Toubkal (4.167 m): die klassische Route ab Imlil in zwei oder drei Tagen, die beste Reisezeit, Schwierigkeit und Höhe, Guides und Hütten und die richtige Ausrüstung.",
    eyebrow: "Ratgeber",
    lead: "Alles, was Sie für die Besteigung des höchsten Gipfels Nordafrikas wissen müssen: die Route ab Imlil, wie viele Tage Sie einplanen sollten, die beste Zeit, die Schwierigkeit und die Ausrüstung.",
    facts: [
      { label: "Gipfel", value: "4.167 m" },
      { label: "Start", value: "Imlil, 1.740 m" },
      { label: "Hütte", value: "3.207 m" },
      { label: "Klassischer Aufstieg", value: "2 Tage" },
      { label: "Beste Reisezeit", value: "Apr.–Juni, Sept.–Okt." },
      { label: "Guide", value: "Lizenzierter Guide Pflicht" },
    ],
    sections: [
      {
        heading: "Der Toubkal auf einen Blick",
        body: [
          "Der Jbel Toubkal erhebt sich im Toubkal-Nationalpark, rund 65 km südlich von Marrakesch, auf 4.167 m. Er ist der höchste Gipfel des Atlas und Nordafrikas und einer der lohnendsten hohen Berge, die sich ohne Klettertechnik besteigen lassen.",
          "Der Aufstieg beginnt in Imlil, einem Berberdorf auf 1.740 m, etwa 1,5 Autostunden von Marrakesch. Ein Maultierpfad führt durch das Mizane-Tal hinauf zu den Hütten unter dem Gipfel, dann ein steiniger Weg bis ganz nach oben.",
        ],
      },
      {
        heading: "Die klassische Route, Tag für Tag",
        body: [
          "Tag 1, von Imlil zur Hütte (rund 12 km, +1.450 m, 5–6 Stunden Gehzeit): Der Weg führt über Aroumd, quert das Flussbett und steigt zum Heiligtum Sidi Chamharouch (2.350 m) auf, ideal für einen Minztee. Danach geht es stetig bergauf zur Toubkal-Hütte auf 3.207 m, wo Sie übernachten. Maultiere tragen das Gepäck.",
          "Tag 2, Gipfel und Abstieg (rund 3–4 Stunden Aufstieg, dann 5–6 Stunden Abstieg nach Imlil): Der Start ist früh, oft gegen 4 oder 5 Uhr, um den Gipfel bei Sonnenaufgang zu erreichen. Der Weg führt über ein Geröllfeld zu einem Sattel und dann über den Grat zum Gipfeldreibein. Bei klarer Sicht reicht der Blick von der Sahara bis zu den Ebenen am Atlantik. Anschließend steigen Sie nach Imlil ab.",
        ],
      },
      {
        heading: "Zwei Tage, drei Tage oder mehr?",
        body: [
          "Zwei Tage sind der klassische Aufstieg für trainierte Wanderer. Der zweite Tag ist lang: rund 10 Stunden Gehzeit mit über 900 m Aufstieg und mehr als 2.400 m Abstieg.",
          "Drei Tage geben dem Körper mehr Zeit, sich an die Höhe anzupassen: eine erste Nacht weiter unten in Imlil oder Aroumd oder eine zweite Nacht auf der Hütte nach dem Gipfel. Das ist die bessere Wahl für die erste Erfahrung in der Höhe, für Familien und im Winter.",
          "Längere Trekkingtouren verbinden den Toubkal mit den Tälern ringsum, etwa dem Azzaden-Tal oder den Gipfeln des Ouanoukrim, und machen den Aufstieg zum Teil einer Reise durch Berberdörfer.",
        ],
      },
      {
        heading: "Wann den Toubkal besteigen?",
        body: [
          "April bis Juni sowie September bis Oktober sind ideal: milde Temperaturen, wenig oder kein Schnee auf dem Weg und lange Tage.",
          "Im Juli und August ist es in den Tälern heiß, auf dem Gipfel bleibt es kühl; nachmittags sind Gewitter möglich, daher früh starten.",
          "Von Dezember bis März liegt Schnee. Der Toubkal wird dann zur Wintertour mit Steigeisen, Pickel und etwas Bergerfahrung, mit Nächten unter null auf der Hütte. Das ist wunderschön, aber planen Sie einen Tag mehr ein und folgen Sie den Entscheidungen Ihres Guides zum Wetter.",
        ],
      },
      {
        heading: "Wie schwierig ist es? Kondition und Höhe",
        body: [
          "Im Sommer ist der Aufstieg nicht technisch, aber anstrengend: lange Tage auf steinigen Wegen und ein steiles Geröllfeld unter dem Gipfel. Wer 6 bis 8 Stunden in den Bergen gehen kann, schafft den Toubkal.",
          "Über 3.000 m spüren viele die Höhe: Kopfschmerzen, Kurzatmigkeit, schlechter Schlaf oder Appetitlosigkeit. Gehen Sie langsam, trinken Sie viel und sagen Sie Ihrem Guide, wie es Ihnen geht. Werden die Beschwerden stärker, hilft nur der Abstieg; ein Dreitagesprogramm senkt das Risiko deutlich.",
        ],
      },
      {
        heading: "Guides, Maultiere und Hütten",
        body: [
          "Für die Besteigung des Toubkal ist ein lizenzierter Bergführer Pflicht. Ihr Guide kennt die Route zu jeder Jahreszeit, gibt das Tempo vor, behält Wetter und Gruppe im Blick und zeigt Ihnen das Leben in den Bergdörfern.",
          "Maultiertreiber und ihre Tiere bringen Gepäck, Verpflegung und Ausrüstung von Imlil zur Hütte, Sie gehen nur mit einem Tagesrucksack. Auf der Hütte schlafen Sie im Schlafsaal; Abendessen und Frühstück werden dort zubereitet.",
        ],
      },
      {
        heading: "Was gehört in den Rucksack?",
        body: ["Auch im Sommer sind Nächte und frühe Morgen auf der Hütte und am Gipfel kalt. Packen Sie leicht und im Zwiebelprinzip:"],
        list: [
          "Eingelaufene Wanderschuhe mit gutem Profil",
          "Warme Schichten: Fleece, Daunenjacke, Mütze und Handschuhe",
          "Wasser- und winddichte Jacke",
          "Sonnenbrille, Sonnencreme und Sonnenhut",
          "Stirnlampe für den frühen Gipfelstart",
          "Trinkflasche (1,5–2 Liter) und Snacks",
          "Hüttenschlafsack; Wanderstöcke helfen beim Abstieg",
          "Im Winter: Steigeisen, Pickel und Gamaschen (Ihr Guide berät Sie)",
        ],
      },
    ],
    faqTitle: "Fragen zur Toubkal-Besteigung",
    faq: [
      { q: "Können Anfänger den Toubkal besteigen?", a: "Ja, im Sommer, wenn Sie fit und lange Wanderungen gewohnt sind. Es ist eine Trekkingtour, keine Kletterei. Für die erste Erfahrung in der Höhe empfehlen wir drei Tage." },
      { q: "Braucht man einen Guide für den Toubkal?", a: "Ja. Ein lizenzierter Bergführer ist für den Aufstieg Pflicht; er organisiert auch Maultiere, Hütte und Verpflegung." },
      { q: "Wie lange dauert die Toubkal-Besteigung?", a: "Zwei Tage für den klassischen Aufstieg ab Imlil: rund 5–6 Stunden zur Hütte am ersten Tag, dann Gipfel und Abstieg nach Imlil am zweiten." },
      { q: "Kann man den Toubkal im Winter besteigen?", a: "Ja, von Dezember bis März als Wintertour mit Steigeisen und Pickel. Etwas Bergerfahrung wird empfohlen; das Programm hängt von Schnee und Wetter ab." },
      { q: "Wo übernachtet man beim Toubkal-Trekking?", a: "In der Toubkal-Hütte (3.207 m) im Schlafsaal, mit Verpflegung. Vor oder nach dem Aufstieg können Sie in Imlil im Riad Berber Towers übernachten." },
    ],
    cta: { title: "Bereit für den Toubkal?", text: "Wählen Sie einen Aufstieg in zwei oder drei Tagen oder ein längeres Trekking rund um das Massiv. Wir organisieren Guide, Maultiere, Hütte und Ihren Transfer ab Marrakesch.", button: "Toubkal-Trekkings ansehen" },
  },
};
