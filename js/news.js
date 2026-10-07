/* =========================================================
   News & breaking news
   Edit this file to post announcements. Every text is given
   once per language (en / id / de); if a language is missing,
   the English text is shown.
   ========================================================= */

window.NEWS = {

  /* Breaking news: shown as a pop-up when the page opens, and pinned
     at the top of the News section. Use it for short-notice changes,
     e.g. a different service time this Sunday.
     - Set "active" to true to show it, false to hide it.
     - Give every new notice a new "id": visitors who closed the
       previous notice will then see the new one. */
  breaking: {
    active: false,
    id: "example-notice",
    title: {
      en: "Change of service time",
      id: "Perubahan jam ibadah",
      de: "Geänderte Gottesdienstzeit"
    },
    text: {
      en: "This Sunday the service starts at 11:00 instead of 10:30.",
      id: "Minggu ini ibadah dimulai pukul 11:00, bukan 10:30.",
      de: "An diesem Sonntag beginnt der Gottesdienst um 11:00 statt um 10:30 Uhr."
    }
  },

  /* Announcements, newest first. Date format: YYYY-MM-DD.
     Copy a block { ... }, to add a new one. */
  items: [
    {
      date: "2026-10-07",
      title: {
        en: "Welcome to our new website",
        id: "Selamat datang di situs web kami yang baru",
        de: "Willkommen auf unserer neuen Website"
      },
      text: {
        en: "Here you will find our service times, upcoming events and important announcements – for example about our Christmas service.",
        id: "Di sini Anda dapat menemukan jadwal ibadah, acara mendatang, dan pengumuman penting – misalnya tentang ibadah Natal kami.",
        de: "Hier finden Sie unsere Gottesdienstzeiten, kommende Veranstaltungen und wichtige Ankündigungen – zum Beispiel zu unserem Weihnachtsgottesdienst."
      }
    }
  ]
};
