import type { Locale } from "@/i18n/config";

export interface PlaceText {
  name: string;
  /** page title (h1) and the meta description */
  title: string;
  description: string;
  lead: string;
  body: string[];
  highlights: string[];
  bestTime: string;
}

export interface Place {
  slug: string;
  /** photo under site/trips/ on the CDN */
  image: string;
  /** which trips go there: matched on the English trip address and title, or the trip's category */
  match: { words?: RegExp; categories?: string[] };
  text: Record<Locale, PlaceText>;
}

/** The places our trips go to (/destinations/[slug]), each with the trips that pass through it. */
export const destinations: Place[] = [
  {
    slug: "marrakech",
    image: "mk3-jemaa-el-fna-and-the-koutoubia-minaret-at-dusk.jpg",
    match: { words: /marrakech-private|red-city/, categories: ["day-trips-from-marrakech"] },
    text: {
      en: {
        name: "Marrakech",
        title: "Marrakech, the red city and gateway to the Atlas",
        description: "Discover Marrakech: the medina, Jemaa el-Fna, the Koutoubia, souks and gardens, the best time to visit, and the day trips and tours that start from the red city.",
        lead: "Founded in the 11th century at the foot of the High Atlas, Marrakech is where most journeys in southern Morocco begin, and where every one of our trips picks you up.",
        body: [
          "Its medina, a UNESCO World Heritage site, is a maze of souks, riads and workshops gathered around Jemaa el-Fna, the square of storytellers, musicians and food stalls that comes alive at dusk. Above it rises the Koutoubia minaret, a landmark visible from far away.",
          "Gardens and palaces offer calm between two walks in the souks: the Majorelle garden, the Bahia palace, the Saadian tombs. And within an hour or two you reach the Atlas valleys, the Agafay desert or the road to the Sahara.",
        ],
        highlights: ["Jemaa el-Fna square at dusk", "The souks and craftsmen of the medina", "The Koutoubia minaret", "Day trips to the Atlas, Agafay and Essaouira"],
        bestTime: "March to May and October to November; summer is very hot, winter days are mild and sunny.",
      },
      fr: {
        name: "Marrakech",
        title: "Marrakech, la ville rouge, porte de l'Atlas",
        description: "Découvrez Marrakech : la médina, Jemaa el-Fna, la Koutoubia, les souks et les jardins, la meilleure saison, et les excursions et circuits au départ de la ville rouge.",
        lead: "Fondée au XIe siècle au pied du Haut Atlas, Marrakech est le point de départ de la plupart des voyages dans le sud du Maroc, et c'est là que nous venons vous chercher pour chacun de nos voyages.",
        body: [
          "Sa médina, inscrite au patrimoine mondial de l'UNESCO, est un dédale de souks, de riads et d'ateliers autour de Jemaa el-Fna, la place des conteurs, des musiciens et des stands de cuisine qui s'anime à la tombée du jour. Au-dessus se dresse le minaret de la Koutoubia, visible de loin.",
          "Jardins et palais offrent un peu de calme entre deux balades dans les souks : le jardin Majorelle, le palais de la Bahia, les tombeaux saadiens. Et en une ou deux heures, vous rejoignez les vallées de l'Atlas, le désert d'Agafay ou la route du Sahara.",
        ],
        highlights: ["La place Jemaa el-Fna au crépuscule", "Les souks et les artisans de la médina", "Le minaret de la Koutoubia", "Excursions vers l'Atlas, Agafay et Essaouira"],
        bestTime: "De mars à mai et d'octobre à novembre ; l'été est très chaud, l'hiver doux et ensoleillé.",
      },
      es: {
        name: "Marrakech",
        title: "Marrakech, la ciudad roja y puerta del Atlas",
        description: "Descubre Marrakech: la medina, Jemaa el-Fna, la Koutoubia, los zocos y jardines, la mejor época y las excursiones y circuitos que salen de la ciudad roja.",
        lead: "Fundada en el siglo XI al pie del Alto Atlas, Marrakech es el punto de partida de la mayoría de los viajes por el sur de Marruecos, y allí te recogemos en todos nuestros viajes.",
        body: [
          "Su medina, Patrimonio de la Humanidad de la UNESCO, es un laberinto de zocos, riads y talleres en torno a Jemaa el-Fna, la plaza de cuentacuentos, músicos y puestos de comida que cobra vida al atardecer. Encima se alza el minarete de la Koutoubia, visible desde lejos.",
          "Jardines y palacios ofrecen calma entre paseo y paseo por los zocos: el jardín Majorelle, el palacio de la Bahía, las tumbas saadíes. Y en una o dos horas llegas a los valles del Atlas, al desierto de Agafay o a la carretera del Sáhara.",
        ],
        highlights: ["La plaza Jemaa el-Fna al atardecer", "Los zocos y artesanos de la medina", "El minarete de la Koutoubia", "Excursiones al Atlas, Agafay y Essaouira"],
        bestTime: "De marzo a mayo y de octubre a noviembre; el verano es muy caluroso, el invierno suave y soleado.",
      },
      de: {
        name: "Marrakesch",
        title: "Marrakesch, die rote Stadt und das Tor zum Atlas",
        description: "Entdecken Sie Marrakesch: Medina, Jemaa el-Fna, Koutoubia, Souks und Gärten, die beste Reisezeit sowie Tagesausflüge und Rundreisen ab der roten Stadt.",
        lead: "Im 11. Jahrhundert am Fuß des Hohen Atlas gegründet, ist Marrakesch der Ausgangspunkt der meisten Reisen in den Süden Marokkos, und hier holen wir Sie für jede unserer Reisen ab.",
        body: [
          "Die Medina, UNESCO-Weltkulturerbe, ist ein Labyrinth aus Souks, Riads und Werkstätten rund um den Jemaa el-Fna, den Platz der Geschichtenerzähler, Musiker und Garküchen, der bei Einbruch der Dunkelheit erwacht. Darüber ragt das weithin sichtbare Minarett der Koutoubia auf.",
          "Gärten und Paläste bieten Ruhe zwischen zwei Streifzügen durch die Souks: der Jardin Majorelle, der Bahia-Palast, die Saadiergräber. Und in ein bis zwei Stunden erreichen Sie die Täler des Atlas, die Agafay-Wüste oder die Straße in die Sahara.",
        ],
        highlights: ["Der Jemaa el-Fna in der Abenddämmerung", "Souks und Handwerker der Medina", "Das Minarett der Koutoubia", "Ausflüge in den Atlas, nach Agafay und Essaouira"],
        bestTime: "März bis Mai und Oktober bis November; der Sommer ist sehr heiß, der Winter mild und sonnig.",
      },
    },
  },
  {
    slug: "imlil",
    image: "im1-imlil-valley-and-the-toubkal-massif-under-clouds-high-atlas.jpg",
    match: { words: /imlil|toubkal|aroumd|sidi-cham/, categories: ["treks.toubkal"] },
    text: {
      en: {
        name: "Imlil & Toubkal National Park",
        title: "Imlil, the village at the foot of Mount Toubkal",
        description: "Imlil (1,740 m), gateway to Toubkal National Park: Berber villages, walnut orchards, mule trails and the ascent of North Africa’s highest summit.",
        lead: "At 1,740 m, about 65 km south of Marrakech, Imlil is the starting point of the Toubkal ascent and of countless walks in the High Atlas. It is also our home valley.",
        body: [
          "The village sits in a green valley of walnut and apple trees, terraced fields and stone houses, surrounded by peaks that stay white until late spring. Mule paths lead to Aroumd, Tamatert and the Imnane valley, or up to the refuges below Toubkal.",
          "You can come for a day from Marrakech, walk for a few days from village to village, or climb Toubkal (4,167 m) in two or three days. Riad Berber Towers, our riad in Imlil, is the perfect base before and after the climb.",
        ],
        highlights: ["The ascent of Mount Toubkal (4,167 m)", "Aroumd and the villages of the Mizane valley", "The Tizi n’Tamatert pass and the Imnane valley", "Nights at Riad Berber Towers"],
        bestTime: "April to October for walking and the summit; December to March for snowy landscapes and winter climbs.",
      },
      fr: {
        name: "Imlil et parc national du Toubkal",
        title: "Imlil, le village au pied du Toubkal",
        description: "Imlil (1 740 m), porte du parc national du Toubkal : villages berbères, noyeraies, sentiers muletiers et ascension du plus haut sommet d'Afrique du Nord.",
        lead: "À 1 740 m, à environ 65 km au sud de Marrakech, Imlil est le point de départ de l'ascension du Toubkal et d'innombrables randonnées dans le Haut Atlas. C'est aussi notre vallée.",
        body: [
          "Le village s'étend dans une vallée verdoyante de noyers et de pommiers, de cultures en terrasses et de maisons de pierre, entourée de sommets qui restent blancs jusqu'à la fin du printemps. Des sentiers muletiers mènent à Aroumd, Tamatert et la vallée d'Imnane, ou vers les refuges au pied du Toubkal.",
          "On peut y venir pour la journée depuis Marrakech, marcher quelques jours de village en village ou gravir le Toubkal (4 167 m) en deux ou trois jours. Le Riad Berber Towers, notre riad à Imlil, est la base idéale avant et après l'ascension.",
        ],
        highlights: ["L'ascension du Toubkal (4 167 m)", "Aroumd et les villages de la vallée de l'Ait Mizane", "Le col du Tizi n'Tamatert et la vallée d'Imnane", "Des nuits au Riad Berber Towers"],
        bestTime: "D'avril à octobre pour la randonnée et le sommet ; de décembre à mars pour les paysages enneigés et les ascensions d'hiver.",
      },
      es: {
        name: "Imlil y Parque Nacional del Toubkal",
        title: "Imlil, el pueblo al pie del Toubkal",
        description: "Imlil (1.740 m), puerta del Parque Nacional del Toubkal: pueblos bereberes, nogales, caminos de mulas y la ascensión a la cumbre más alta del norte de África.",
        lead: "A 1.740 m y a unos 65 km al sur de Marrakech, Imlil es el punto de partida de la ascensión al Toubkal y de innumerables caminatas por el Alto Atlas. También es nuestro valle.",
        body: [
          "El pueblo está en un valle verde de nogales y manzanos, campos en terrazas y casas de piedra, rodeado de cumbres que siguen blancas hasta finales de la primavera. Los caminos de mulas llevan a Aroumd, Tamatert y el valle de Imnane, o suben a los refugios del Toubkal.",
          "Puedes venir a pasar el día desde Marrakech, caminar unos días de pueblo en pueblo o subir al Toubkal (4.167 m) en dos o tres días. El Riad Berber Towers, nuestro riad en Imlil, es la base perfecta antes y después de la ascensión.",
        ],
        highlights: ["La ascensión al Toubkal (4.167 m)", "Aroumd y los pueblos del valle de Mizane", "El puerto de Tizi n'Tamatert y el valle de Imnane", "Noches en el Riad Berber Towers"],
        bestTime: "De abril a octubre para caminar y subir a la cumbre; de diciembre a marzo para paisajes nevados y ascensiones invernales.",
      },
      de: {
        name: "Imlil & Toubkal-Nationalpark",
        title: "Imlil, das Dorf am Fuß des Toubkal",
        description: "Imlil (1.740 m), Tor zum Toubkal-Nationalpark: Berberdörfer, Walnusshaine, Maultierpfade und der Aufstieg zum höchsten Gipfel Nordafrikas.",
        lead: "Auf 1.740 m, rund 65 km südlich von Marrakesch, ist Imlil Ausgangspunkt für die Toubkal-Besteigung und unzählige Wanderungen im Hohen Atlas. Es ist auch unser Heimattal.",
        body: [
          "Das Dorf liegt in einem grünen Tal mit Walnuss- und Apfelbäumen, Terrassenfeldern und Steinhäusern, umgeben von Gipfeln, die bis in den späten Frühling weiß bleiben. Maultierpfade führen nach Aroumd, Tamatert und ins Imnane-Tal oder hinauf zu den Hütten unter dem Toubkal.",
          "Sie können für einen Tag ab Marrakesch kommen, ein paar Tage von Dorf zu Dorf wandern oder den Toubkal (4.167 m) in zwei oder drei Tagen besteigen. Das Riad Berber Towers, unser Riad in Imlil, ist der ideale Ausgangspunkt vor und nach dem Aufstieg.",
        ],
        highlights: ["Die Besteigung des Toubkal (4.167 m)", "Aroumd und die Dörfer des Mizane-Tals", "Der Pass Tizi n'Tamatert und das Imnane-Tal", "Nächte im Riad Berber Towers"],
        bestTime: "April bis Oktober zum Wandern und für den Gipfel; Dezember bis März für Schneelandschaften und Wintertouren.",
      },
    },
  },
  {
    slug: "ourika-valley",
    image: "o99-the-ourika-valley.jpg",
    match: { words: /ourika|3-valle/ },
    text: {
      en: {
        name: "Ourika Valley",
        title: "The Ourika Valley, waterfalls and Berber villages near Marrakech",
        description: "The Ourika Valley, an hour from Marrakech: Berber villages, the waterfalls of Setti Fatma, riverside lunches and easy walks in the High Atlas.",
        lead: "Less than an hour from Marrakech, the Ourika river cuts a green valley into the High Atlas: the easiest way to discover the mountains and Berber village life in a day.",
        body: [
          "The road follows the river past earthen villages, terraced gardens and small riverside restaurants. At the end of the valley, Setti Fatma is the starting point of a walk up to a series of waterfalls, with a little scrambling for the higher ones.",
          "Along the way you can stop in a Berber house for mint tea, visit cooperatives of argan oil and local crafts, and have lunch with your feet almost in the river.",
        ],
        highlights: ["The waterfalls above Setti Fatma", "Mint tea in a Berber home", "Lunch by the river", "Crafts and argan cooperatives"],
        bestTime: "All year; spring for the greenest landscapes and summer for a cool escape from Marrakech. Avoid stormy days, when the river can rise quickly.",
      },
      fr: {
        name: "Vallée de l'Ourika",
        title: "La vallée de l'Ourika, cascades et villages berbères près de Marrakech",
        description: "La vallée de l'Ourika, à une heure de Marrakech : villages berbères, cascades de Setti Fatma, déjeuners au bord de l'eau et balades faciles dans le Haut Atlas.",
        lead: "À moins d'une heure de Marrakech, l'oued Ourika creuse une vallée verdoyante dans le Haut Atlas : la façon la plus simple de découvrir la montagne et la vie des villages berbères en une journée.",
        body: [
          "La route longe la rivière, entre villages en terre, jardins en terrasses et petits restaurants au bord de l'eau. Au fond de la vallée, Setti Fatma est le point de départ d'une balade vers une série de cascades, avec un peu d'escalade facile pour les plus hautes.",
          "En chemin, vous pouvez prendre le thé à la menthe dans une maison berbère, visiter des coopératives d'huile d'argan et d'artisanat, et déjeuner presque les pieds dans l'eau.",
        ],
        highlights: ["Les cascades au-dessus de Setti Fatma", "Le thé à la menthe chez l'habitant", "Déjeuner au bord de la rivière", "Artisanat et coopératives d'argan"],
        bestTime: "Toute l'année ; le printemps pour la verdure, l'été pour la fraîcheur loin de Marrakech. Évitez les jours d'orage, quand la rivière peut monter vite.",
      },
      es: {
        name: "Valle de Ourika",
        title: "El valle de Ourika, cascadas y pueblos bereberes cerca de Marrakech",
        description: "El valle de Ourika, a una hora de Marrakech: pueblos bereberes, las cascadas de Setti Fatma, almuerzos junto al río y paseos fáciles por el Alto Atlas.",
        lead: "A menos de una hora de Marrakech, el río Ourika abre un valle verde en el Alto Atlas: la forma más sencilla de descubrir la montaña y la vida de los pueblos bereberes en un día.",
        body: [
          "La carretera sigue el río entre pueblos de tierra, huertos en terrazas y pequeños restaurantes junto al agua. Al final del valle, Setti Fatma es el punto de partida de un paseo hasta una serie de cascadas, con algo de trepada fácil para las más altas.",
          "Por el camino puedes tomar té a la menta en una casa bereber, visitar cooperativas de aceite de argán y artesanía, y almorzar casi con los pies en el río.",
        ],
        highlights: ["Las cascadas sobre Setti Fatma", "Té a la menta en una casa bereber", "Almuerzo junto al río", "Artesanía y cooperativas de argán"],
        bestTime: "Todo el año; la primavera para el verde y el verano para escapar del calor de Marrakech. Evita los días de tormenta, cuando el río puede crecer rápido.",
      },
      de: {
        name: "Ourika-Tal",
        title: "Das Ourika-Tal, Wasserfälle und Berberdörfer bei Marrakesch",
        description: "Das Ourika-Tal, eine Stunde von Marrakesch: Berberdörfer, die Wasserfälle von Setti Fatma, Mittagessen am Fluss und leichte Wanderungen im Hohen Atlas.",
        lead: "Keine Stunde von Marrakesch entfernt hat der Ourika-Fluss ein grünes Tal in den Hohen Atlas gegraben: der einfachste Weg, an einem Tag die Berge und das Leben in den Berberdörfern kennenzulernen.",
        body: [
          "Die Straße folgt dem Fluss vorbei an Lehmdörfern, Terrassengärten und kleinen Restaurants am Wasser. Am Ende des Tals ist Setti Fatma Ausgangspunkt einer Wanderung zu einer Reihe von Wasserfällen, zu den höheren mit etwas leichter Kraxelei.",
          "Unterwegs können Sie in einem Berberhaus Minztee trinken, Kooperativen für Arganöl und Kunsthandwerk besuchen und fast mit den Füßen im Fluss zu Mittag essen.",
        ],
        highlights: ["Die Wasserfälle oberhalb von Setti Fatma", "Minztee in einem Berberhaus", "Mittagessen am Fluss", "Kunsthandwerk und Argan-Kooperativen"],
        bestTime: "Ganzjährig; im Frühling am grünsten, im Sommer eine kühle Flucht aus Marrakesch. Meiden Sie Gewittertage, an denen der Fluss schnell steigen kann.",
      },
    },
  },
  {
    slug: "ait-benhaddou",
    image: "oa1-the-ksar-of-ait-ben-haddou-above-the-river.jpg",
    match: { words: /ait-ben|benhaddou|ouarzazate|kasbah|great-south/ },
    text: {
      en: {
        name: "Aït Benhaddou & Ouarzazate",
        title: "Aït Benhaddou, the earthen ksar on the caravan road",
        description: "Aït Benhaddou, UNESCO-listed ksar on the old caravan route between the Sahara and Marrakech, Ouarzazate and the Tizi n’Tichka pass: what to see and the trips that go there.",
        lead: "Beyond the Tizi n’Tichka pass, on the old caravan road between the Sahara and Marrakech, the ksar of Aït Benhaddou rises above the Ounila river: one of the most beautiful earthen villages in Morocco.",
        body: [
          "Its fortified houses of red earth, listed as a UNESCO World Heritage site, climb the hill to an old granary with a view over the valley. The ksar has been the setting of many films and series, and a few families still live there.",
          "Nearby, Ouarzazate is the gateway to the south, with the Taourirt kasbah and its film studios. Aït Benhaddou is a long day trip from Marrakech or the first stop on the road to the Dades valley and the Sahara.",
        ],
        highlights: ["The Tizi n’Tichka pass over the High Atlas", "The ksar of Aït Benhaddou", "The Taourirt kasbah in Ouarzazate", "The road of the kasbahs towards the Sahara"],
        bestTime: "October to May; summer days are very hot, and the Tichka pass can see snow in winter.",
      },
      fr: {
        name: "Aït Benhaddou et Ouarzazate",
        title: "Aït Benhaddou, le ksar de terre sur la route des caravanes",
        description: "Aït Benhaddou, ksar classé par l'UNESCO sur l'ancienne route des caravanes entre le Sahara et Marrakech, Ouarzazate et le col du Tizi n'Tichka : que voir, et les voyages qui y passent.",
        lead: "Au-delà du col du Tizi n'Tichka, sur l'ancienne route des caravanes entre le Sahara et Marrakech, le ksar d'Aït Benhaddou domine l'oued Ounila : l'un des plus beaux villages de terre du Maroc.",
        body: [
          "Ses maisons fortifiées en terre rouge, inscrites au patrimoine mondial de l'UNESCO, grimpent la colline jusqu'à un ancien grenier qui domine la vallée. Le ksar a servi de décor à de nombreux films et séries, et quelques familles y vivent encore.",
          "Tout près, Ouarzazate est la porte du Sud, avec la kasbah de Taourirt et ses studios de cinéma. Aït Benhaddou se visite en une longue journée depuis Marrakech, ou comme première étape sur la route de la vallée du Dadès et du Sahara.",
        ],
        highlights: ["Le col du Tizi n'Tichka dans le Haut Atlas", "Le ksar d'Aït Benhaddou", "La kasbah de Taourirt à Ouarzazate", "La route des kasbahs vers le Sahara"],
        bestTime: "D'octobre à mai ; l'été est très chaud et le col du Tichka peut être enneigé en hiver.",
      },
      es: {
        name: "Aït Benhaddou y Ouarzazate",
        title: "Aït Benhaddou, el ksar de tierra en la ruta de las caravanas",
        description: "Aït Benhaddou, ksar Patrimonio de la UNESCO en la antigua ruta de caravanas entre el Sáhara y Marrakech, Ouarzazate y el puerto de Tizi n'Tichka: qué ver y los viajes que pasan por allí.",
        lead: "Pasado el puerto de Tizi n'Tichka, en la antigua ruta de las caravanas entre el Sáhara y Marrakech, el ksar de Aït Benhaddou se alza sobre el río Ounila: uno de los pueblos de tierra más bellos de Marruecos.",
        body: [
          "Sus casas fortificadas de tierra roja, Patrimonio de la Humanidad de la UNESCO, suben por la colina hasta un antiguo granero con vistas al valle. El ksar ha sido escenario de muchas películas y series, y aún viven allí algunas familias.",
          "Muy cerca, Ouarzazate es la puerta del sur, con la kasba de Taourirt y sus estudios de cine. Aït Benhaddou se visita en una excursión larga desde Marrakech o como primera parada camino del valle del Dades y del Sáhara.",
        ],
        highlights: ["El puerto de Tizi n'Tichka en el Alto Atlas", "El ksar de Aït Benhaddou", "La kasba de Taourirt en Ouarzazate", "La ruta de las kasbas hacia el Sáhara"],
        bestTime: "De octubre a mayo; el verano es muy caluroso y el puerto del Tichka puede tener nieve en invierno.",
      },
      de: {
        name: "Aït Benhaddou & Ouarzazate",
        title: "Aït Benhaddou, das Lehmdorf an der Karawanenstraße",
        description: "Aït Benhaddou, UNESCO-geschützter Ksar an der alten Karawanenroute zwischen Sahara und Marrakesch, Ouarzazate und der Pass Tizi n'Tichka: Sehenswertes und die Reisen dorthin.",
        lead: "Jenseits des Passes Tizi n'Tichka, an der alten Karawanenstraße zwischen Sahara und Marrakesch, thront der Ksar Aït Benhaddou über dem Ounila-Fluss: eines der schönsten Lehmdörfer Marokkos.",
        body: [
          "Seine befestigten Häuser aus rotem Lehm, UNESCO-Weltkulturerbe, ziehen sich den Hügel hinauf bis zu einem alten Speicher mit Blick über das Tal. Der Ksar war Kulisse vieler Filme und Serien, und noch immer leben einige Familien dort.",
          "Ganz in der Nähe ist Ouarzazate das Tor zum Süden, mit der Kasbah Taourirt und seinen Filmstudios. Aït Benhaddou ist ein langer Tagesausflug ab Marrakesch oder die erste Etappe auf dem Weg ins Dades-Tal und in die Sahara.",
        ],
        highlights: ["Der Pass Tizi n'Tichka im Hohen Atlas", "Der Ksar Aït Benhaddou", "Die Kasbah Taourirt in Ouarzazate", "Die Straße der Kasbahs Richtung Sahara"],
        bestTime: "Oktober bis Mai; der Sommer ist sehr heiß, und am Tichka-Pass kann im Winter Schnee liegen.",
      },
    },
  },
  {
    slug: "merzouga",
    image: "sa1-the-erg-chebbi-dunes-at-merzouga.jpg",
    match: { words: /merzouga|erg-chebbi/ },
    text: {
      en: {
        name: "Merzouga & Erg Chebbi",
        title: "Merzouga and the dunes of Erg Chebbi",
        description: "Merzouga and Erg Chebbi, Morocco’s most famous Sahara dunes: camel treks, nights in desert camps, sunrise on the dunes and the best season to go.",
        lead: "At the edge of the Sahara, near the Algerian border, the golden dunes of Erg Chebbi rise above the village of Merzouga: the classic image of the Moroccan desert.",
        body: [
          "The sand sea stretches over more than 20 km, with dunes well over 100 m high that change colour from orange to pink through the day. You ride a camel into the dunes at the end of the afternoon, watch the sunset from a crest and sleep in a desert camp under the stars.",
          "Merzouga is far from Marrakech, so it is usually reached on a journey of three days or more through the Atlas, the kasbahs and the Dades and Todra gorges, or on the way between Marrakech and Fès.",
        ],
        highlights: ["Camel trek into the dunes", "Sunset and sunrise from the crests", "A night in a desert camp", "The road through the Dades and Todra gorges"],
        bestTime: "October to April; nights are cold in December and January, and the heat is extreme from June to August.",
      },
      fr: {
        name: "Merzouga et Erg Chebbi",
        title: "Merzouga et les dunes de l'Erg Chebbi",
        description: "Merzouga et l'Erg Chebbi, les dunes du Sahara les plus célèbres du Maroc : balade à dos de dromadaire, nuit en bivouac, lever du soleil sur les dunes et meilleure saison.",
        lead: "Aux portes du Sahara, près de la frontière algérienne, les dunes dorées de l'Erg Chebbi dominent le village de Merzouga : l'image même du désert marocain.",
        body: [
          "Cette mer de sable s'étend sur plus de 20 km, avec des dunes de bien plus de 100 m qui passent de l'orange au rose au fil de la journée. En fin d'après-midi, vous partez à dos de dromadaire dans les dunes, admirez le coucher du soleil depuis une crête et dormez dans un bivouac sous les étoiles.",
          "Merzouga est loin de Marrakech : on la rejoint en général lors d'un voyage de trois jours ou plus par l'Atlas, les kasbahs et les gorges du Dadès et du Todra, ou entre Marrakech et Fès.",
        ],
        highlights: ["Balade à dos de dromadaire dans les dunes", "Coucher et lever du soleil depuis les crêtes", "Une nuit en bivouac", "La route des gorges du Dadès et du Todra"],
        bestTime: "D'octobre à avril ; nuits froides en décembre et janvier, chaleur extrême de juin à août.",
      },
      es: {
        name: "Merzouga y Erg Chebbi",
        title: "Merzouga y las dunas del Erg Chebbi",
        description: "Merzouga y el Erg Chebbi, las dunas del Sáhara más famosas de Marruecos: paseos en camello, noches en campamentos, amaneceres sobre las dunas y la mejor época.",
        lead: "A las puertas del Sáhara, cerca de la frontera con Argelia, las dunas doradas del Erg Chebbi se alzan sobre el pueblo de Merzouga: la imagen clásica del desierto marroquí.",
        body: [
          "Este mar de arena se extiende más de 20 km, con dunas de bastante más de 100 m que pasan del naranja al rosa a lo largo del día. Al final de la tarde entras en las dunas en camello, ves la puesta de sol desde una cresta y duermes en un campamento bajo las estrellas.",
          "Merzouga está lejos de Marrakech, así que se suele llegar en un viaje de tres días o más por el Atlas, las kasbas y las gargantas del Dades y del Todra, o entre Marrakech y Fez.",
        ],
        highlights: ["Paseo en camello por las dunas", "Puesta de sol y amanecer desde las crestas", "Una noche en un campamento del desierto", "La ruta de las gargantas del Dades y del Todra"],
        bestTime: "De octubre a abril; noches frías en diciembre y enero, y calor extremo de junio a agosto.",
      },
      de: {
        name: "Merzouga & Erg Chebbi",
        title: "Merzouga und die Dünen des Erg Chebbi",
        description: "Merzouga und der Erg Chebbi, die berühmtesten Sahara-Dünen Marokkos: Kamelritte, Nächte im Wüstencamp, Sonnenaufgang über den Dünen und die beste Reisezeit.",
        lead: "Am Rand der Sahara, nahe der algerischen Grenze, erheben sich die goldenen Dünen des Erg Chebbi über dem Dorf Merzouga: das klassische Bild der marokkanischen Wüste.",
        body: [
          "Das Sandmeer erstreckt sich über mehr als 20 km, mit Dünen von weit über 100 m Höhe, die im Laufe des Tages von Orange zu Rosa wechseln. Am späten Nachmittag reiten Sie auf dem Kamel in die Dünen, sehen den Sonnenuntergang von einem Kamm und schlafen in einem Wüstencamp unter den Sternen.",
          "Merzouga liegt weit von Marrakesch entfernt und wird meist auf einer Reise von drei oder mehr Tagen über den Atlas, die Kasbahs und die Dades- und Todra-Schlucht erreicht, oder auf dem Weg zwischen Marrakesch und Fès.",
        ],
        highlights: ["Kamelritt in die Dünen", "Sonnenuntergang und -aufgang von den Dünenkämmen", "Eine Nacht im Wüstencamp", "Die Route durch die Dades- und Todra-Schlucht"],
        bestTime: "Oktober bis April; kalte Nächte im Dezember und Januar, extreme Hitze von Juni bis August.",
      },
    },
  },
  {
    slug: "erg-chegaga",
    image: "dr6-camel-caravan-crossing-the-dunes-near-zagora.jpg",
    match: { words: /chegaga|chigaga|zagora|mhamid|draa/ },
    text: {
      en: {
        name: "Erg Chegaga & Zagora",
        title: "Erg Chegaga, the wild dunes beyond Zagora",
        description: "Erg Chegaga and Zagora: the Draa valley and its palm groves, the wild dunes reached by 4×4 from M’Hamid, desert camps and the best season to go.",
        lead: "South of Zagora, at the end of the Draa valley, the dunes of Erg Chegaga are reached only by 4×4 tracks: a wilder, quieter Sahara than Merzouga.",
        body: [
          "The road from Marrakech crosses the Tichka pass and follows the Draa valley, a long ribbon of palm groves and kasbahs, to Zagora and M’Hamid. From there, a desert track leads to the dunes, where you spend the night in a camp far from everything.",
          "For a shorter escape, Zagora and its nearby dunes can be reached in two days from Marrakech; Erg Chegaga needs three days or more.",
        ],
        highlights: ["The palm groves and kasbahs of the Draa valley", "The 4×4 track from M’Hamid", "Wild, quiet dunes", "A night in a remote desert camp"],
        bestTime: "October to April; the summer heat is extreme and winter nights are cold.",
      },
      fr: {
        name: "Erg Chegaga et Zagora",
        title: "L'Erg Chegaga, les dunes sauvages au-delà de Zagora",
        description: "L'Erg Chegaga et Zagora : la vallée du Drâa et ses palmeraies, les dunes sauvages rejointes en 4x4 depuis M'Hamid, les bivouacs et la meilleure saison.",
        lead: "Au sud de Zagora, au bout de la vallée du Drâa, les dunes de l'Erg Chegaga ne se rejoignent que par des pistes en 4x4 : un Sahara plus sauvage et plus calme que Merzouga.",
        body: [
          "La route depuis Marrakech franchit le col du Tichka et suit la vallée du Drâa, long ruban de palmeraies et de kasbahs, jusqu'à Zagora et M'Hamid. De là, une piste mène aux dunes, où vous passez la nuit dans un bivouac loin de tout.",
          "Pour une escapade plus courte, Zagora et ses dunes proches se rejoignent en deux jours depuis Marrakech ; l'Erg Chegaga demande trois jours ou plus.",
        ],
        highlights: ["Les palmeraies et les kasbahs de la vallée du Drâa", "La piste en 4x4 depuis M'Hamid", "Des dunes sauvages et paisibles", "Une nuit dans un bivouac isolé"],
        bestTime: "D'octobre à avril ; chaleur extrême en été et nuits froides en hiver.",
      },
      es: {
        name: "Erg Chegaga y Zagora",
        title: "El Erg Chegaga, las dunas salvajes más allá de Zagora",
        description: "El Erg Chegaga y Zagora: el valle del Draa y sus palmerales, las dunas salvajes a las que se llega en 4x4 desde M'Hamid, los campamentos y la mejor época.",
        lead: "Al sur de Zagora, al final del valle del Draa, a las dunas del Erg Chegaga solo se llega por pistas en 4x4: un Sáhara más salvaje y tranquilo que Merzouga.",
        body: [
          "La carretera desde Marrakech cruza el puerto del Tichka y sigue el valle del Draa, una larga cinta de palmerales y kasbas, hasta Zagora y M'Hamid. Desde allí, una pista lleva a las dunas, donde pasas la noche en un campamento lejos de todo.",
          "Para una escapada más corta, Zagora y sus dunas cercanas se alcanzan en dos días desde Marrakech; el Erg Chegaga necesita tres días o más.",
        ],
        highlights: ["Los palmerales y kasbas del valle del Draa", "La pista en 4x4 desde M'Hamid", "Dunas salvajes y tranquilas", "Una noche en un campamento aislado"],
        bestTime: "De octubre a abril; el calor del verano es extremo y las noches de invierno, frías.",
      },
      de: {
        name: "Erg Chegaga & Zagora",
        title: "Erg Chegaga, die wilden Dünen hinter Zagora",
        description: "Erg Chegaga und Zagora: das Draa-Tal mit seinen Palmenhainen, die wilden Dünen, die man per 4x4 ab M'Hamid erreicht, Wüstencamps und die beste Reisezeit.",
        lead: "Südlich von Zagora, am Ende des Draa-Tals, sind die Dünen des Erg Chegaga nur über 4x4-Pisten zu erreichen: eine wildere, ruhigere Sahara als Merzouga.",
        body: [
          "Die Straße ab Marrakesch überquert den Tichka-Pass und folgt dem Draa-Tal, einem langen Band aus Palmenhainen und Kasbahs, bis Zagora und M'Hamid. Von dort führt eine Wüstenpiste zu den Dünen, wo Sie in einem Camp fernab von allem übernachten.",
          "Für einen kürzeren Ausflug erreichen Sie Zagora und die nahen Dünen in zwei Tagen ab Marrakesch; für den Erg Chegaga braucht es drei Tage oder mehr.",
        ],
        highlights: ["Palmenhaine und Kasbahs im Draa-Tal", "Die 4x4-Piste ab M'Hamid", "Wilde, stille Dünen", "Eine Nacht in einem abgelegenen Wüstencamp"],
        bestTime: "Oktober bis April; im Sommer extreme Hitze, im Winter kalte Nächte.",
      },
    },
  },
  {
    slug: "essaouira",
    image: "co4-essaouira-ramparts-and-blue-boats.jpg",
    match: { words: /essaouira|atlantic|coast|beach/ },
    text: {
      en: {
        name: "Essaouira",
        title: "Essaouira, the windy port on the Atlantic",
        description: "Essaouira, the former Mogador: UNESCO-listed medina, ramparts and blue fishing boats, seafood by the ocean, beaches and water sports, a day trip from Marrakech.",
        lead: "About three hours west of Marrakech, Essaouira, the former Mogador, is a fortified port on the Atlantic with a relaxed, artistic atmosphere.",
        body: [
          "Its 18th-century medina, a UNESCO World Heritage site, is a grid of whitewashed houses with blue shutters, souks, galleries and thuya wood workshops, closed by ramparts facing the ocean. In the harbour, blue fishing boats bring in the fish grilled a few steps away.",
          "The steady trade winds make Essaouira a favourite spot for surfing, windsurfing and kitesurfing, and the long beach is perfect for a camel or horse ride. On the way from Marrakech, argan tree forests and women’s cooperatives line the road.",
        ],
        highlights: ["The medina and the Skala ramparts", "Blue boats and grilled fish at the harbour", "Argan cooperatives on the way", "Beach rides and water sports"],
        bestTime: "All year; its ocean breeze keeps summer cooler than Marrakech.",
      },
      fr: {
        name: "Essaouira",
        title: "Essaouira, le port venté de l'Atlantique",
        description: "Essaouira, l'ancienne Mogador : médina classée par l'UNESCO, remparts et barques bleues, poisson grillé face à l'océan, plages et sports de glisse, en excursion depuis Marrakech.",
        lead: "À environ trois heures à l'ouest de Marrakech, Essaouira, l'ancienne Mogador, est un port fortifié sur l'Atlantique à l'atmosphère détendue et artistique.",
        body: [
          "Sa médina du XVIIIe siècle, inscrite au patrimoine mondial de l'UNESCO, aligne maisons blanchies aux volets bleus, souks, galeries et ateliers de bois de thuya, fermée par des remparts face à l'océan. Au port, les barques bleues ramènent le poisson grillé à quelques pas.",
          "Les alizés réguliers font d'Essaouira un spot apprécié pour le surf, la planche à voile et le kitesurf, et la longue plage se prête aux balades à dos de dromadaire ou à cheval. Sur la route depuis Marrakech, forêts d'arganiers et coopératives de femmes bordent le chemin.",
        ],
        highlights: ["La médina et les remparts de la Skala", "Barques bleues et poisson grillé au port", "Coopératives d'argan sur la route", "Balades sur la plage et sports de glisse"],
        bestTime: "Toute l'année ; la brise océane rend l'été plus frais qu'à Marrakech.",
      },
      es: {
        name: "Essaouira",
        title: "Essaouira, el puerto ventoso del Atlántico",
        description: "Essaouira, la antigua Mogador: medina Patrimonio de la UNESCO, murallas y barcas azules, pescado a la brasa frente al océano, playas y deportes de viento, en excursión desde Marrakech.",
        lead: "A unas tres horas al oeste de Marrakech, Essaouira, la antigua Mogador, es un puerto amurallado en el Atlántico con un ambiente relajado y artístico.",
        body: [
          "Su medina del siglo XVIII, Patrimonio de la Humanidad de la UNESCO, es una cuadrícula de casas encaladas con contraventanas azules, zocos, galerías y talleres de madera de tuya, cerrada por murallas frente al océano. En el puerto, las barcas azules traen el pescado que se asa a pocos pasos.",
          "Los vientos alisios constantes convierten Essaouira en un lugar muy apreciado para el surf, el windsurf y el kitesurf, y su larga playa es perfecta para pasear en camello o a caballo. En la carretera desde Marrakech hay bosques de arganes y cooperativas de mujeres.",
        ],
        highlights: ["La medina y las murallas de la Skala", "Barcas azules y pescado a la brasa en el puerto", "Cooperativas de argán por el camino", "Paseos por la playa y deportes de viento"],
        bestTime: "Todo el año; la brisa del océano hace el verano más fresco que en Marrakech.",
      },
      de: {
        name: "Essaouira",
        title: "Essaouira, der windige Hafen am Atlantik",
        description: "Essaouira, das frühere Mogador: UNESCO-geschützte Medina, Festungsmauern und blaue Fischerboote, gegrillter Fisch am Meer, Strände und Wassersport, als Tagesausflug ab Marrakesch.",
        lead: "Rund drei Stunden westlich von Marrakesch liegt Essaouira, das frühere Mogador: ein befestigter Hafen am Atlantik mit entspannter, künstlerischer Atmosphäre.",
        body: [
          "Die Medina aus dem 18. Jahrhundert, UNESCO-Weltkulturerbe, ist ein Raster aus weiß getünchten Häusern mit blauen Fensterläden, Souks, Galerien und Thujaholz-Werkstätten, umschlossen von Festungsmauern zum Meer hin. Im Hafen bringen blaue Boote den Fisch, der wenige Schritte weiter gegrillt wird.",
          "Die beständigen Passatwinde machen Essaouira zu einem beliebten Ort zum Surfen, Windsurfen und Kitesurfen, und der lange Strand eignet sich für einen Kamel- oder Pferderitt. Auf dem Weg von Marrakesch säumen Arganwälder und Frauenkooperativen die Straße.",
        ],
        highlights: ["Die Medina und die Mauern der Skala", "Blaue Boote und gegrillter Fisch im Hafen", "Argan-Kooperativen unterwegs", "Strandritte und Wassersport"],
        bestTime: "Ganzjährig; die Meeresbrise hält den Sommer kühler als in Marrakesch.",
      },
    },
  },
  {
    slug: "fes",
    image: "fs1-the-fes-medina-at-sunset.jpg",
    match: { words: /(^|-)fe[sz](-|$)|imperial|northern/ },
    text: {
      en: {
        name: "Fès",
        title: "Fès, the oldest of the imperial cities",
        description: "Fès el-Bali, the world’s largest car-free medina: the Chouara tannery, al-Qarawiyyin, the souks and medersas, and the tours that link Fès with the Sahara and Marrakech.",
        lead: "Founded in the 9th century, Fès is Morocco’s spiritual and cultural capital, and its medina, Fès el-Bali, is one of the largest car-free urban areas in the world.",
        body: [
          "Behind its walls, thousands of lanes lead to souks organised by trade, carved medersas, the al-Qarawiyyin mosque and university, and the Chouara tannery, where hides are dyed in stone vats as they have been for centuries. The whole medina is a UNESCO World Heritage site.",
          "Fès is often the start or the end of a journey through the imperial cities, Meknes and the Roman ruins of Volubilis, or of a crossing of the Middle Atlas to the dunes of Merzouga.",
        ],
        highlights: ["The lanes and souks of Fès el-Bali", "The Chouara tannery", "The medersas and al-Qarawiyyin", "Meknes, Volubilis and the road to the Sahara"],
        bestTime: "March to May and September to November; summer is hot and winter can be cool and rainy.",
      },
      fr: {
        name: "Fès",
        title: "Fès, la plus ancienne des villes impériales",
        description: "Fès el-Bali, la plus grande médina piétonne du monde : la tannerie Chouara, la Quaraouiyine, les souks et médersas, et les circuits qui relient Fès au Sahara et à Marrakech.",
        lead: "Fondée au IXe siècle, Fès est la capitale spirituelle et culturelle du Maroc, et sa médina, Fès el-Bali, est l'un des plus grands espaces urbains sans voitures au monde.",
        body: [
          "Derrière ses remparts, des milliers de ruelles mènent aux souks organisés par métiers, aux médersas sculptées, à la mosquée et université Quaraouiyine et à la tannerie Chouara, où les peaux sont teintes dans des cuves de pierre comme depuis des siècles. Toute la médina est inscrite au patrimoine mondial de l'UNESCO.",
          "Fès est souvent le début ou la fin d'un voyage par les villes impériales, Meknès et les ruines romaines de Volubilis, ou d'une traversée du Moyen Atlas jusqu'aux dunes de Merzouga.",
        ],
        highlights: ["Les ruelles et les souks de Fès el-Bali", "La tannerie Chouara", "Les médersas et la Quaraouiyine", "Meknès, Volubilis et la route du Sahara"],
        bestTime: "De mars à mai et de septembre à novembre ; l'été est chaud et l'hiver peut être frais et pluvieux.",
      },
      es: {
        name: "Fez",
        title: "Fez, la más antigua de las ciudades imperiales",
        description: "Fez el-Bali, la mayor medina peatonal del mundo: la curtiduría Chouara, al-Qarawiyyin, los zocos y medersas, y los circuitos que unen Fez con el Sáhara y Marrakech.",
        lead: "Fundada en el siglo IX, Fez es la capital espiritual y cultural de Marruecos, y su medina, Fez el-Bali, es una de las mayores zonas urbanas sin coches del mundo.",
        body: [
          "Tras sus murallas, miles de callejuelas llevan a zocos organizados por oficios, medersas talladas, la mezquita y universidad de al-Qarawiyyin y la curtiduría Chouara, donde las pieles se tiñen en cubas de piedra como desde hace siglos. Toda la medina es Patrimonio de la Humanidad de la UNESCO.",
          "Fez suele ser el inicio o el final de un viaje por las ciudades imperiales, Mequinez y las ruinas romanas de Volubilis, o de una travesía del Atlas Medio hasta las dunas de Merzouga.",
        ],
        highlights: ["Las callejuelas y zocos de Fez el-Bali", "La curtiduría Chouara", "Las medersas y al-Qarawiyyin", "Mequinez, Volubilis y la ruta del Sáhara"],
        bestTime: "De marzo a mayo y de septiembre a noviembre; el verano es caluroso y el invierno puede ser fresco y lluvioso.",
      },
      de: {
        name: "Fès",
        title: "Fès, die älteste der Königsstädte",
        description: "Fès el-Bali, die größte autofreie Medina der Welt: die Gerberei Chouara, al-Qarawiyyin, Souks und Medresen sowie Rundreisen, die Fès mit der Sahara und Marrakesch verbinden.",
        lead: "Im 9. Jahrhundert gegründet, ist Fès die spirituelle und kulturelle Hauptstadt Marokkos, und seine Medina Fès el-Bali ist eines der größten autofreien Stadtgebiete der Welt.",
        body: [
          "Hinter den Stadtmauern führen Tausende Gassen zu Souks, die nach Handwerken geordnet sind, zu kunstvoll verzierten Medresen, zur Moschee und Universität al-Qarawiyyin und zur Gerberei Chouara, wo Häute seit Jahrhunderten in Steinbottichen gefärbt werden. Die ganze Medina ist UNESCO-Weltkulturerbe.",
          "Fès ist oft Anfang oder Ende einer Reise durch die Königsstädte, Meknès und die römischen Ruinen von Volubilis, oder einer Fahrt durch den Mittleren Atlas zu den Dünen von Merzouga.",
        ],
        highlights: ["Gassen und Souks von Fès el-Bali", "Die Gerberei Chouara", "Die Medresen und al-Qarawiyyin", "Meknès, Volubilis und die Straße in die Sahara"],
        bestTime: "März bis Mai und September bis November; der Sommer ist heiß, der Winter kann kühl und regnerisch sein.",
      },
    },
  },
];

export const destinationBySlug = (slug: string) => destinations.find((d) => d.slug === slug);
