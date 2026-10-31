import type { Place } from "@/content/destinations";

/** Ways to travel (/activities/[slug]), each with the trips built around it. Same shape as a destination. */
export const activities: Place[] = [
  {
    slug: "trekking",
    image: "o83-trekkers-on-a-rocky-path-in-the-toubkal-massif.jpg",
    match: { categories: ["treks", "treks.toubkal", "treks.atlas-valleys-villages", "treks.regional-treks"] },
    text: {
      en: {
        name: "Trekking & hiking",
        title: "Trekking and hiking in the Atlas Mountains",
        description: "Trekking in Morocco with local guides: Mount Toubkal, the Atlas valleys and Berber villages, M’Goun, Saghro and Sirwa, from day hikes to week-long treks with mules.",
        lead: "From a day walk above Imlil to a week crossing the Atlas, walking is the best way to meet the mountains and the Berber villages that live in them.",
        body: [
          "Our treks go from the classic ascent of Mount Toubkal to quiet valleys such as Azzaden, Ait Bougmez or the Roses valley, and to the M’Goun, Saghro and Sirwa massifs. Days are shaped around your pace, with 4 to 7 hours of walking on mule paths.",
          "Mules carry the luggage, so you only walk with a day pack. Nights are spent in village guesthouses, mountain refuges or tents, with meals prepared by the team.",
        ],
        highlights: ["Mount Toubkal, the summit of North Africa", "Berber villages and valleys of the High Atlas", "Remote massifs: M’Goun, Saghro, Sirwa", "Mules carry the luggage"],
        bestTime: "April to June and September to October in the High Atlas; Saghro and the southern slopes are best in winter.",
      },
      fr: {
        name: "Trek et randonnée",
        title: "Trek et randonnée dans l'Atlas",
        description: "Trekking au Maroc avec des guides locaux : le Toubkal, les vallées de l'Atlas et les villages berbères, le M'Goun, le Saghro et le Siroua, de la randonnée d'une journée au trek d'une semaine avec mules.",
        lead: "De la balade d'une journée au-dessus d'Imlil à la traversée de l'Atlas en une semaine, la marche est la meilleure façon de découvrir la montagne et les villages berbères qui y vivent.",
        body: [
          "Nos treks vont de l'ascension classique du Toubkal aux vallées paisibles comme l'Azzaden, les Aït Bougmez ou la vallée des Roses, et jusqu'aux massifs du M'Goun, du Saghro et du Siroua. Les journées suivent votre rythme, avec 4 à 7 heures de marche sur des sentiers muletiers.",
          "Les mules portent les bagages : vous ne marchez qu'avec un petit sac. Les nuits se passent en gîte chez l'habitant, en refuge ou sous tente, avec des repas préparés par l'équipe.",
        ],
        highlights: ["Le Toubkal, sommet de l'Afrique du Nord", "Villages et vallées berbères du Haut Atlas", "Massifs isolés : M'Goun, Saghro, Siroua", "Les mules portent les bagages"],
        bestTime: "D'avril à juin et de septembre à octobre dans le Haut Atlas ; le Saghro et les versants sud se parcourent mieux en hiver.",
      },
      es: {
        name: "Trekking y senderismo",
        title: "Trekking y senderismo en el Atlas",
        description: "Trekking en Marruecos con guías locales: el Toubkal, los valles del Atlas y los pueblos bereberes, el M'Goun, el Saghro y el Sirwa, desde caminatas de un día hasta trekkings de una semana con mulas.",
        lead: "Desde un paseo de un día sobre Imlil hasta una semana cruzando el Atlas, caminar es la mejor forma de conocer la montaña y los pueblos bereberes que viven en ella.",
        body: [
          "Nuestros trekkings van de la ascensión clásica al Toubkal a valles tranquilos como el Azzaden, los Aït Bougmez o el valle de las Rosas, y a los macizos del M'Goun, el Saghro y el Sirwa. Las jornadas se adaptan a tu ritmo, con 4 a 7 horas de marcha por caminos de mulas.",
          "Las mulas llevan el equipaje, así que solo caminas con una mochila pequeña. Se duerme en casas rurales de los pueblos, refugios o tiendas, con comidas preparadas por el equipo.",
        ],
        highlights: ["El Toubkal, cumbre del norte de África", "Pueblos y valles bereberes del Alto Atlas", "Macizos remotos: M'Goun, Saghro, Sirwa", "Las mulas llevan el equipaje"],
        bestTime: "De abril a junio y de septiembre a octubre en el Alto Atlas; el Saghro y las vertientes sur, mejor en invierno.",
      },
      de: {
        name: "Trekking & Wandern",
        title: "Trekking und Wandern im Atlasgebirge",
        description: "Trekking in Marokko mit einheimischen Guides: Toubkal, die Täler und Berberdörfer des Atlas, M'Goun, Saghro und Sirwa, von Tageswanderungen bis zu einwöchigen Touren mit Maultieren.",
        lead: "Von der Tageswanderung oberhalb von Imlil bis zur einwöchigen Atlas-Durchquerung: Zu Fuß lernen Sie die Berge und die Berberdörfer am besten kennen.",
        body: [
          "Unsere Trekkings reichen vom klassischen Toubkal-Aufstieg über ruhige Täler wie Azzaden, Ait Bougmez oder das Rosental bis zu den Massiven M'Goun, Saghro und Sirwa. Die Etappen richten sich nach Ihrem Tempo, mit 4 bis 7 Stunden Gehzeit auf Maultierpfaden.",
          "Maultiere tragen das Gepäck, Sie gehen nur mit einem Tagesrucksack. Übernachtet wird in Gästehäusern in den Dörfern, auf Hütten oder im Zelt, mit Mahlzeiten vom Team.",
        ],
        highlights: ["Der Toubkal, Gipfel Nordafrikas", "Berberdörfer und Täler des Hohen Atlas", "Abgelegene Massive: M'Goun, Saghro, Sirwa", "Maultiere tragen das Gepäck"],
        bestTime: "April bis Juni und September bis Oktober im Hohen Atlas; Saghro und die Südhänge am besten im Winter.",
      },
    },
  },
  {
    slug: "mountain-biking",
    image: "o81-mountain-bikers-above-an-atlas-valley.jpg",
    match: { words: /bik/ },
    text: {
      en: {
        name: "Mountain biking",
        title: "Mountain biking in the High Atlas",
        description: "Mountain biking in Morocco from Marrakech: Atlas passes and valley tracks, Berber villages, quality bikes and helmets, and a local biking guide.",
        lead: "Mountain passes, valley tracks and Berber villages: the High Atlas around Imlil is a superb playground for mountain bikers.",
        body: [
          "Our day ride climbs from Imlil to the Tizi n’Tamatert pass (2,279 m) and descends the Imnane valley to Asni, with a picnic by the river on the way. The route suits fit riders used to long climbs and rough tracks.",
          "We provide good mountain bikes and helmets, a local biking guide and a private vehicle for the transfers, and we can design longer rides on request.",
        ],
        highlights: ["The Tizi n’Tamatert pass (2,279 m)", "Descent through the Imnane valley", "Quality bike and helmet provided", "Local mountain biking guide"],
        bestTime: "March to May and September to November; summer middays are hot, and snow can close the high tracks in winter.",
      },
      fr: {
        name: "VTT",
        title: "VTT dans le Haut Atlas",
        description: "VTT au Maroc depuis Marrakech : cols et pistes de vallée de l'Atlas, villages berbères, VTT et casques de qualité, et un guide VTT local.",
        lead: "Cols, pistes de vallée et villages berbères : le Haut Atlas autour d'Imlil est un superbe terrain de jeu pour le VTT.",
        body: [
          "Notre sortie d'une journée monte d'Imlil au col du Tizi n'Tamatert (2 279 m) et descend la vallée d'Imnane jusqu'à Asni, avec un pique-nique au bord de la rivière. L'itinéraire convient aux cyclistes en forme, habitués aux longues montées et aux pistes cassantes.",
          "Nous fournissons de bons VTT et des casques, un guide VTT local et un véhicule privé pour les transferts, et pouvons créer des sorties plus longues sur demande.",
        ],
        highlights: ["Le col du Tizi n'Tamatert (2 279 m)", "La descente de la vallée d'Imnane", "VTT et casque de qualité fournis", "Guide VTT local"],
        bestTime: "De mars à mai et de septembre à novembre ; les midis d'été sont chauds et la neige peut fermer les pistes hautes en hiver.",
      },
      es: {
        name: "Bicicleta de montaña",
        title: "Bicicleta de montaña en el Alto Atlas",
        description: "Bicicleta de montaña en Marruecos desde Marrakech: puertos del Atlas y pistas de valle, pueblos bereberes, bicis y cascos de calidad y un guía local.",
        lead: "Puertos de montaña, pistas de valle y pueblos bereberes: el Alto Atlas alrededor de Imlil es un terreno magnífico para la bicicleta de montaña.",
        body: [
          "Nuestra salida de un día sube de Imlil al puerto de Tizi n'Tamatert (2.279 m) y baja por el valle de Imnane hasta Asni, con un pícnic junto al río. La ruta es para ciclistas en forma, acostumbrados a subidas largas y pistas rotas.",
          "Ponemos buenas bicis de montaña y cascos, un guía local de bicicleta y un vehículo privado para los traslados, y podemos diseñar rutas más largas a medida.",
        ],
        highlights: ["El puerto de Tizi n'Tamatert (2.279 m)", "Bajada por el valle de Imnane", "Bici y casco de calidad incluidos", "Guía local de bicicleta de montaña"],
        bestTime: "De marzo a mayo y de septiembre a noviembre; los mediodías de verano son calurosos y la nieve puede cerrar las pistas altas en invierno.",
      },
      de: {
        name: "Mountainbiken",
        title: "Mountainbiken im Hohen Atlas",
        description: "Mountainbiken in Marokko ab Marrakesch: Atlaspässe und Talpisten, Berberdörfer, gute Bikes und Helme und ein einheimischer Bike-Guide.",
        lead: "Bergpässe, Talpisten und Berberdörfer: Der Hohe Atlas rund um Imlil ist ein großartiges Revier für Mountainbiker.",
        body: [
          "Unsere Tagestour führt von Imlil hinauf zum Pass Tizi n'Tamatert (2.279 m) und durch das Imnane-Tal hinab nach Asni, mit einem Picknick am Fluss. Die Route eignet sich für fitte Fahrer, die lange Anstiege und ruppige Pisten gewohnt sind.",
          "Wir stellen gute Mountainbikes und Helme, einen einheimischen Bike-Guide und ein Privatfahrzeug für die Transfers und planen auf Wunsch auch längere Touren.",
        ],
        highlights: ["Der Pass Tizi n'Tamatert (2.279 m)", "Abfahrt durch das Imnane-Tal", "Gutes Bike und Helm inklusive", "Einheimischer Mountainbike-Guide"],
        bestTime: "März bis Mai und September bis November; im Sommer ist es mittags heiß, im Winter kann Schnee die hohen Pisten sperren.",
      },
    },
  },
  {
    slug: "horse-riding",
    image: "o82-horse-riding-on-a-track-in-the-atlas-foothills.jpg",
    match: { words: /horse/ },
    text: {
      en: {
        name: "Horse riding",
        title: "Horse riding in the Atlas foothills",
        description: "Horse riding near Marrakech: rides on tracks through the Atlas foothills and Berber villages, with a local guide and horses adapted to your level.",
        lead: "Tracks through the foothills of the Atlas, villages and wide views of the mountains: a day on horseback is a different way to leave Marrakech behind.",
        body: [
          "The ride follows country tracks and paths between fields, olive groves and Berber villages, with the High Atlas on the horizon. Tell us your experience when you book: the horses and the route are chosen for your level.",
          "Riding can also be combined with a walk, a stay in the mountains or a beach ride in Essaouira.",
        ],
        highlights: ["Tracks through the Atlas foothills", "Berber villages and mountain views", "Horses chosen for your level", "Can be combined with other trips"],
        bestTime: "October to May; in summer, rides are best early in the day.",
      },
      fr: {
        name: "Équitation",
        title: "Randonnée à cheval dans les contreforts de l'Atlas",
        description: "Balade à cheval près de Marrakech : pistes dans les contreforts de l'Atlas et villages berbères, avec un guide local et des chevaux adaptés à votre niveau.",
        lead: "Des pistes dans les contreforts de l'Atlas, des villages et de grands panoramas sur la montagne : une journée à cheval est une autre façon de quitter Marrakech.",
        body: [
          "La balade suit des pistes et des chemins entre champs, oliveraies et villages berbères, avec le Haut Atlas à l'horizon. Indiquez votre expérience à la réservation : chevaux et itinéraire sont choisis selon votre niveau.",
          "Le cheval peut aussi se combiner avec une randonnée, un séjour en montagne ou une balade sur la plage d'Essaouira.",
        ],
        highlights: ["Pistes dans les contreforts de l'Atlas", "Villages berbères et vues sur la montagne", "Chevaux choisis selon votre niveau", "À combiner avec d'autres voyages"],
        bestTime: "D'octobre à mai ; en été, mieux vaut monter tôt le matin.",
      },
      es: {
        name: "Paseos a caballo",
        title: "Paseos a caballo en las estribaciones del Atlas",
        description: "Paseos a caballo cerca de Marrakech: pistas por las estribaciones del Atlas y pueblos bereberes, con un guía local y caballos adaptados a tu nivel.",
        lead: "Pistas por las estribaciones del Atlas, pueblos y amplias vistas de la montaña: un día a caballo es otra forma de dejar atrás Marrakech.",
        body: [
          "El paseo sigue pistas y caminos entre campos, olivares y pueblos bereberes, con el Alto Atlas en el horizonte. Indícanos tu experiencia al reservar: elegimos los caballos y la ruta según tu nivel.",
          "Montar a caballo también se puede combinar con una caminata, una estancia en la montaña o un paseo por la playa de Essaouira.",
        ],
        highlights: ["Pistas por las estribaciones del Atlas", "Pueblos bereberes y vistas de montaña", "Caballos elegidos según tu nivel", "Se combina con otros viajes"],
        bestTime: "De octubre a mayo; en verano, mejor a primera hora del día.",
      },
      de: {
        name: "Reiten",
        title: "Reiten in den Ausläufern des Atlas",
        description: "Reiten bei Marrakesch: Ausritte auf Pisten durch die Ausläufer des Atlas und Berberdörfer, mit einheimischem Guide und Pferden passend zu Ihrem Können.",
        lead: "Pisten durch die Ausläufer des Atlas, Dörfer und weite Blicke auf die Berge: Ein Tag zu Pferd ist eine andere Art, Marrakesch hinter sich zu lassen.",
        body: [
          "Der Ausritt folgt Feldwegen und Pfaden zwischen Äckern, Olivenhainen und Berberdörfern, mit dem Hohen Atlas am Horizont. Nennen Sie uns bei der Buchung Ihre Reiterfahrung: Pferde und Route werden danach ausgewählt.",
          "Reiten lässt sich auch mit einer Wanderung, einem Aufenthalt in den Bergen oder einem Strandritt in Essaouira verbinden.",
        ],
        highlights: ["Pisten durch die Ausläufer des Atlas", "Berberdörfer und Bergblicke", "Pferde passend zu Ihrem Können", "Mit anderen Reisen kombinierbar"],
        bestTime: "Oktober bis Mai; im Sommer am besten früh am Tag.",
      },
    },
  },
  {
    slug: "camel-trekking",
    image: "sa3-camel-trek-through-the-merzouga-dunes.jpg",
    match: { words: /camel/, categories: ["sahara-desert-tours"] },
    text: {
      en: {
        name: "Camel trekking",
        title: "Camel treks and nights in the desert",
        description: "Camel treks in Morocco: a sunset ride in the Agafay desert near Marrakech, or the Sahara dunes of Merzouga, Zagora and Erg Chegaga with a night in a desert camp.",
        lead: "Riding a camel into the dunes at the end of the afternoon, then sleeping in a camp under the stars: the desert experience everyone dreams of.",
        body: [
          "Close to Marrakech, the stony Agafay desert offers a camel ride and a dinner at sunset within an hour’s drive. For real Sahara dunes, plan two to four days to reach Zagora, Erg Chegaga or the golden dunes of Merzouga.",
          "Camels are led by Berber cameleers at a gentle pace, so no experience is needed. In the camps you sleep in tents with beds, with dinner around the fire.",
        ],
        highlights: ["Sunset ride in the Agafay desert", "The dunes of Merzouga and Erg Chegaga", "Berber cameleers at a gentle pace", "Nights in desert camps"],
        bestTime: "October to April; nights are cold in midwinter and the summer heat is extreme.",
      },
      fr: {
        name: "Balades à dos de dromadaire",
        title: "Balades à dos de dromadaire et nuits dans le désert",
        description: "Balades à dos de dromadaire au Maroc : coucher de soleil dans le désert d'Agafay près de Marrakech, ou dunes du Sahara à Merzouga, Zagora et l'Erg Chegaga avec une nuit en bivouac.",
        lead: "Partir à dos de dromadaire dans les dunes en fin d'après-midi, puis dormir dans un bivouac sous les étoiles : l'expérience du désert dont tout le monde rêve.",
        body: [
          "Près de Marrakech, le désert de pierre d'Agafay offre une balade à dos de dromadaire et un dîner au coucher du soleil à moins d'une heure de route. Pour les vraies dunes du Sahara, comptez deux à quatre jours pour rejoindre Zagora, l'Erg Chegaga ou les dunes dorées de Merzouga.",
          "Les dromadaires sont menés au pas par des chameliers berbères : aucune expérience n'est nécessaire. Dans les bivouacs, vous dormez sous tente avec de vrais lits, et dînez autour du feu.",
        ],
        highlights: ["Coucher de soleil dans le désert d'Agafay", "Les dunes de Merzouga et de l'Erg Chegaga", "Des chameliers berbères, au pas", "Nuits en bivouac"],
        bestTime: "D'octobre à avril ; nuits froides en plein hiver et chaleur extrême l'été.",
      },
      es: {
        name: "Paseos en camello",
        title: "Paseos en camello y noches en el desierto",
        description: "Paseos en camello en Marruecos: atardecer en el desierto de Agafay cerca de Marrakech, o las dunas del Sáhara en Merzouga, Zagora y el Erg Chegaga con noche en un campamento.",
        lead: "Entrar en las dunas en camello al final de la tarde y dormir en un campamento bajo las estrellas: la experiencia del desierto con la que todos sueñan.",
        body: [
          "Cerca de Marrakech, el desierto de piedra de Agafay ofrece un paseo en camello y una cena al atardecer a menos de una hora. Para las verdaderas dunas del Sáhara, cuenta de dos a cuatro días para llegar a Zagora, el Erg Chegaga o las dunas doradas de Merzouga.",
          "Los camellos van al paso, guiados por camelleros bereberes, así que no hace falta experiencia. En los campamentos se duerme en tiendas con camas, con cena junto al fuego.",
        ],
        highlights: ["Atardecer en el desierto de Agafay", "Las dunas de Merzouga y del Erg Chegaga", "Camelleros bereberes, al paso", "Noches en campamentos del desierto"],
        bestTime: "De octubre a abril; noches frías en pleno invierno y calor extremo en verano.",
      },
      de: {
        name: "Kamelritte",
        title: "Kamelritte und Nächte in der Wüste",
        description: "Kamelritte in Marokko: Sonnenuntergang in der Agafay-Wüste bei Marrakesch oder die Sahara-Dünen von Merzouga, Zagora und Erg Chegaga mit einer Nacht im Wüstencamp.",
        lead: "Am späten Nachmittag auf dem Kamel in die Dünen reiten und dann in einem Camp unter den Sternen schlafen: das Wüstenerlebnis, von dem alle träumen.",
        body: [
          "Nahe Marrakesch bietet die Steinwüste Agafay einen Kamelritt und ein Abendessen bei Sonnenuntergang, keine Stunde Fahrt entfernt. Für echte Sahara-Dünen planen Sie zwei bis vier Tage bis Zagora, Erg Chegaga oder zu den goldenen Dünen von Merzouga.",
          "Die Kamele werden von Berber-Kameltreibern im Schritt geführt, Erfahrung ist nicht nötig. In den Camps schlafen Sie in Zelten mit Betten, das Abendessen gibt es am Feuer.",
        ],
        highlights: ["Sonnenuntergang in der Agafay-Wüste", "Die Dünen von Merzouga und Erg Chegaga", "Berber-Kameltreiber, im Schritt", "Nächte in Wüstencamps"],
        bestTime: "Oktober bis April; kalte Nächte im Hochwinter und extreme Sommerhitze.",
      },
    },
  },
  {
    slug: "skiing",
    image: "sk2-snowy-peaks-above-the-oukaimeden-ski-area.jpg",
    match: { words: /ski/ },
    text: {
      en: {
        name: "Skiing & ski touring",
        title: "Skiing and ski touring in the High Atlas",
        description: "Skiing in Morocco: the slopes of Oukaïmeden near Marrakech and ski touring in the Toubkal massif, with local guides, from January to March depending on the snow.",
        lead: "Yes, you can ski in Morocco: in winter the High Atlas above Marrakech is covered in snow, from the slopes of Oukaïmeden to the high summits of the Toubkal massif.",
        body: [
          "Oukaïmeden, about 75 km from Marrakech, is Morocco’s main ski area, with slopes reaching above 3,000 m. For experienced skiers, ski touring in the Toubkal massif links refuges, cols and summits in a landscape few people see in winter.",
          "Snow conditions vary from year to year, so we confirm the programme with you shortly before departure and adapt it to the snow and the weather.",
        ],
        highlights: ["The slopes of Oukaïmeden", "Ski touring in the Toubkal massif", "Mountain refuges in winter", "Programme adapted to the snow"],
        bestTime: "January to March, depending on the snow.",
      },
      fr: {
        name: "Ski et ski de randonnée",
        title: "Ski et ski de randonnée dans le Haut Atlas",
        description: "Skier au Maroc : les pistes de l'Oukaïmeden près de Marrakech et le ski de randonnée dans le massif du Toubkal, avec des guides locaux, de janvier à mars selon l'enneigement.",
        lead: "Oui, on peut skier au Maroc : en hiver, le Haut Atlas au-dessus de Marrakech se couvre de neige, des pistes de l'Oukaïmeden aux hauts sommets du massif du Toubkal.",
        body: [
          "L'Oukaïmeden, à environ 75 km de Marrakech, est le principal domaine skiable du Maroc, avec des pistes qui dépassent 3 000 m. Pour les skieurs expérimentés, le ski de randonnée dans le massif du Toubkal relie refuges, cols et sommets dans des paysages que peu de gens voient en hiver.",
          "L'enneigement varie d'une année à l'autre : nous confirmons le programme avec vous peu avant le départ et l'adaptons à la neige et à la météo.",
        ],
        highlights: ["Les pistes de l'Oukaïmeden", "Le ski de randonnée dans le massif du Toubkal", "Les refuges de montagne en hiver", "Programme adapté à l'enneigement"],
        bestTime: "De janvier à mars, selon l'enneigement.",
      },
      es: {
        name: "Esquí y esquí de travesía",
        title: "Esquí y esquí de travesía en el Alto Atlas",
        description: "Esquiar en Marruecos: las pistas de Oukaïmeden cerca de Marrakech y el esquí de travesía en el macizo del Toubkal, con guías locales, de enero a marzo según la nieve.",
        lead: "Sí, se puede esquiar en Marruecos: en invierno, el Alto Atlas sobre Marrakech se cubre de nieve, desde las pistas de Oukaïmeden hasta las altas cumbres del macizo del Toubkal.",
        body: [
          "Oukaïmeden, a unos 75 km de Marrakech, es la principal estación de esquí de Marruecos, con pistas por encima de los 3.000 m. Para esquiadores con experiencia, el esquí de travesía en el macizo del Toubkal une refugios, collados y cumbres en paisajes que pocos ven en invierno.",
          "La nieve varía de un año a otro, así que confirmamos el programa contigo poco antes de la salida y lo adaptamos a la nieve y al tiempo.",
        ],
        highlights: ["Las pistas de Oukaïmeden", "Esquí de travesía en el macizo del Toubkal", "Refugios de montaña en invierno", "Programa adaptado a la nieve"],
        bestTime: "De enero a marzo, según la nieve.",
      },
      de: {
        name: "Skifahren & Skitouren",
        title: "Skifahren und Skitouren im Hohen Atlas",
        description: "Skifahren in Marokko: die Pisten von Oukaïmeden bei Marrakesch und Skitouren im Toubkal-Massiv, mit einheimischen Guides, je nach Schnee von Januar bis März.",
        lead: "Ja, in Marokko kann man Ski fahren: Im Winter liegt der Hohe Atlas über Marrakesch unter Schnee, von den Pisten in Oukaïmeden bis zu den hohen Gipfeln des Toubkal-Massivs.",
        body: [
          "Oukaïmeden, rund 75 km von Marrakesch, ist Marokkos wichtigstes Skigebiet, mit Pisten über 3.000 m. Für erfahrene Skifahrer verbinden Skitouren im Toubkal-Massiv Hütten, Sättel und Gipfel in einer Landschaft, die im Winter nur wenige sehen.",
          "Die Schneelage ändert sich von Jahr zu Jahr; wir bestätigen das Programm kurz vor der Abreise mit Ihnen und passen es an Schnee und Wetter an.",
        ],
        highlights: ["Die Pisten von Oukaïmeden", "Skitouren im Toubkal-Massiv", "Berghütten im Winter", "Programm passend zur Schneelage"],
        bestTime: "Januar bis März, je nach Schnee.",
      },
    },
  },
];

export const activityBySlug = (slug: string) => activities.find((a) => a.slug === slug);
